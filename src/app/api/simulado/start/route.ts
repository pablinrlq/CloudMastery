import { NextResponse, type NextRequest } from "next/server";
import { getApiUser } from "@/lib/auth/api";
import { db } from "@/lib/db";
import { hasAccess, type Subscription } from "@/lib/dal";
import { CERTIFICATIONS, isValidCert } from "@/lib/learning/content";
import { hasVerifiedEmail } from "@/lib/auth/security";
import {
  DIAGNOSTIC_DURATION_MINUTES,
  DIAGNOSTIC_QUESTION_COUNT,
  isSimuladoMode,
  shuffledCopy,
} from "@/lib/learning/simulado";
import { enforceRateLimit } from "@/lib/learning/rate-limit";

function errorCode(error: unknown): string | undefined {
  return typeof error === "object" && error !== null && "code" in error
    ? String((error as { code?: unknown }).code)
    : undefined;
}

// PostgreSQL unique_violation
function isUniqueViolation(error: unknown) {
  return errorCode(error) === "23505";
}

// POST { certId, mode: "diagnostic" | "full" | "domain", domain? }
// Creates an attempt and returns questions WITHOUT correct answers.
// "full" usa o número oficial de questões do exame; "domain" usa até 20.
export async function POST(request: NextRequest) {
  const user = await getApiUser();

  if (!user) {
    return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
  }
  if (!hasVerifiedEmail(user)) {
    return NextResponse.json(
      { error: "Confirme seu email para acessar o simulado." },
      { status: 403 }
    );
  }

  const rateLimited = await enforceRateLimit("simulado-start", user.id, 30, 600);
  if (rateLimited) return rateLimited;

  const payload: unknown = await request.json().catch(() => null);
  if (!payload || typeof payload !== "object") {
    return NextResponse.json({ error: "JSON inválido" }, { status: 400 });
  }
  const { certId, mode, domain } = payload as Record<string, unknown>;

  if (
    typeof certId !== "string" ||
    !isValidCert(certId) ||
    !isSimuladoMode(mode) ||
    (mode === "domain" &&
      (typeof domain !== "string" ||
        !(CERTIFICATIONS[certId].domains as readonly string[]).includes(domain)))
  ) {
    return NextResponse.json({ error: "Parâmetros inválidos" }, { status: 400 });
  }

  const subscription = await db.selectFrom("subscriptions").select(["status", "plan", "cert_access", "current_period_end"]).where("user_id", "=", user.id).executeTakeFirst();

  const premium = hasAccess(subscription as Subscription | null, certId);
  if (mode !== "diagnostic" && !premium) {
    return NextResponse.json({ error: "Assinatura necessária" }, { status: 403 });
  }

  if (mode === "diagnostic") {
    // Cada conta escolhe UMA certificação para o diagnóstico gratuito; a tabela
    // de claims é a autoridade final (db/migrations/0023_*.sql).
    const claim = await db
      .selectFrom("free_diagnostic_claims")
      .select(["cert_id", "attempt_id"])
      .where("user_id", "=", user.id)
      .executeTakeFirst();

    if (claim && claim.cert_id !== certId) {
      return NextResponse.json(
        { error: "Você já escolheu uma certificação para o seu diagnóstico gratuito.", upgradeUrl: "/pricing" },
        { status: 409 }
      );
    }

    if (claim) {
      const previous = await db
        .selectFrom("simulado_attempts")
        .select(["id", "completed_at", "selected_question_ids"])
        .where("id", "=", claim.attempt_id)
        .where("user_id", "=", user.id)
        .executeTakeFirst();
      if (!previous) {
        return NextResponse.json({ error: "Falha ao retomar diagnóstico" }, { status: 503 });
      }
      if (previous.completed_at) {
        return NextResponse.json(
          { error: "Seu simulado diagnóstico gratuito já foi concluído.", upgradeUrl: "/pricing" },
          { status: 409 }
        );
      }
      const ids = Array.isArray(previous.selected_question_ids) ? previous.selected_question_ids : [];
      if (!ids.length) {
        return NextResponse.json({ error: "Diagnóstico inválido; contate o suporte." }, { status: 409 });
      }
      const resumed = await db
        .selectFrom("questions")
        .select(["id", "domain", "prompt", "choices", "difficulty"])
        .where("id", "in", ids)
        .where("cert_id", "=", certId)
        .execute();
      if (!resumed.length) {
        return NextResponse.json({ error: "Falha ao retomar diagnóstico" }, { status: 503 });
      }
      const order = new Map(ids.map((id, index) => [id, index]));
      resumed.sort((a, b) => (order.get(a.id) ?? 0) - (order.get(b.id) ?? 0));
      return NextResponse.json({
        attemptId: previous.id,
        durationMinutes: DIAGNOSTIC_DURATION_MINUTES,
        questions: resumed.map((question) => ({ ...question, hasHint: false })),
      });
    }
  }

  // Admin client: questions table has no client-facing RLS policy on purpose.
  let query = db.selectFrom("questions").select(["id", "domain", "prompt", "choices", "difficulty", "hint"]).where("cert_id", "=", certId);

  if (mode === "domain") {
    query = query.where("domain", "=", domain as string);
  }

  const questions = await query.execute();

  if (!questions.length) {
    return NextResponse.json(
      { error: "Nenhuma questão disponível" },
      { status: 404 }
    );
  }

  const cap =
    mode === "diagnostic"
      ? DIAGNOSTIC_QUESTION_COUNT
      : mode === "full"
        ? CERTIFICATIONS[certId].examQuestionCount
        : 20;
  const selected = shuffledCopy(questions).slice(0, cap).map((q) => ({
    id: q.id,
    domain: q.domain,
    prompt: q.prompt,
    choices: q.choices,
    difficulty: q.difficulty,
    hasHint: mode !== "diagnostic" && Boolean(q.hint),
  }));

  // A tentativa e (no diagnóstico) o claim da conta nascem na mesma transação:
  // se uma requisição concorrente já reservou o diagnóstico, nada fica órfão.
  let stage = "attempt" as "attempt" | "claim"; // atribuído dentro do callback da transação
  let attempt: { id: string };
  try {
    attempt = await db.transaction().execute(async (trx) => {
      const created = await trx
        .insertInto("simulado_attempts")
        .values({
          user_id: user.id,
          cert_id: certId,
          mode,
          domain: mode === "domain" ? (domain as string) : null,
          selected_question_ids: selected.map((question) => question.id),
          // node-pg serializa array JS como array do Postgres ("{}"), o que viraria um
          // OBJETO json; a coluna é jsonb, então enviamos o JSON já serializado.
          hints_used: JSON.stringify([]),
          question_timings: {},
          overtime_seconds: 0,
          answers: {},
        })
        .returning("id")
        .executeTakeFirstOrThrow();

      if (mode === "diagnostic") {
        stage = "claim";
        await trx
          .insertInto("free_diagnostic_claims")
          .values({ user_id: user.id, cert_id: certId, attempt_id: created.id })
          .execute();
      }
      return created;
    });
  } catch (error) {
    if (mode === "diagnostic" && isUniqueViolation(error)) {
      return NextResponse.json(
        { error: "Você já iniciou seu simulado diagnóstico gratuito.", upgradeUrl: "/pricing" },
        { status: 409 }
      );
    }
    console.error("simulado_start_failed", { stage, code: errorCode(error) });
    return stage === "claim"
      ? NextResponse.json({ error: "Falha ao reservar seu diagnóstico" }, { status: 503 })
      : NextResponse.json({ error: "Falha ao criar tentativa" }, { status: 500 });
  }

  return NextResponse.json({
    attemptId: attempt.id,
    durationMinutes:
      mode === "diagnostic"
        ? DIAGNOSTIC_DURATION_MINUTES
        : mode === "full"
          ? CERTIFICATIONS[certId].examDurationMinutes
          : 30,
    questions: selected,
  });
}
