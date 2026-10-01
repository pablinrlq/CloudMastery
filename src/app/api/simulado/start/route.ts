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

  const attempt = await db.insertInto("simulado_attempts").values({
      user_id: user.id,
      cert_id: certId,
      mode,
      domain: mode === "domain" ? (domain as string) : null,
      selected_question_ids: selected.map((question) => question.id),
      hints_used: [],
      question_timings: {},
      overtime_seconds: 0,
      answers: {},
    }).returning("id").executeTakeFirst();

  if (!attempt) {
    return NextResponse.json({ error: "Falha ao criar tentativa" }, { status: 500 });
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
