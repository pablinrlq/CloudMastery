import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { hasAccess, type Subscription } from "@/lib/dal";
import { CERTIFICATIONS, isValidCert } from "@/lib/content";
import { hasVerifiedEmail } from "@/lib/auth-security";
import {
  DIAGNOSTIC_DURATION_MINUTES,
  DIAGNOSTIC_QUESTION_COUNT,
  isSimuladoMode,
  shuffledCopy,
} from "@/lib/simulado";

// POST { certId, mode: "diagnostic" | "full" | "domain", domain? }
// Creates an attempt and returns questions WITHOUT correct answers.
// "full" usa o número oficial de questões do exame; "domain" usa até 20.
export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
  }
  if (!hasVerifiedEmail(user)) {
    return NextResponse.json(
      { error: "Confirme seu email para acessar o simulado." },
      { status: 403 }
    );
  }

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

  const { data: subscription, error: subscriptionError } = await supabase
    .from("subscriptions")
    .select("status, plan, cert_access, current_period_end")
    .eq("user_id", user.id)
    .maybeSingle();

  if (subscriptionError) {
    return NextResponse.json({ error: "Falha ao verificar acesso" }, { status: 503 });
  }

  const premium = hasAccess(subscription as Subscription | null, certId);
  if (mode !== "diagnostic" && !premium) {
    return NextResponse.json({ error: "Assinatura necessária" }, { status: 403 });
  }

  // Admin client: questions table has no client-facing RLS policy on purpose.
  const admin = createAdminClient();

  if (mode === "diagnostic") {
    const { data: previous, error: previousError } = await admin
      .from("simulado_attempts")
      .select("id, completed_at, selected_question_ids")
      .eq("user_id", user.id)
      .eq("cert_id", certId)
      .eq("mode", "diagnostic")
      .maybeSingle();

    if (previousError) {
      return NextResponse.json({ error: "Falha ao consultar diagnóstico" }, { status: 503 });
    }
    if (previous?.completed_at) {
      return NextResponse.json(
        { error: "Seu diagnóstico gratuito já foi concluído.", upgradeUrl: "/pricing" },
        { status: 409 }
      );
    }
    if (previous) {
      const ids = Array.isArray(previous.selected_question_ids)
        ? previous.selected_question_ids
        : [];
      if (!ids.length) {
        return NextResponse.json({ error: "Diagnóstico inválido; contate o suporte." }, { status: 409 });
      }
      const { data: resumed, error: resumedError } = await admin
        .from("questions")
        .select("id, domain, prompt, choices, difficulty, hint")
        .in("id", ids)
        .eq("cert_id", certId);
      if (resumedError || !resumed?.length) {
        return NextResponse.json({ error: "Falha ao retomar diagnóstico" }, { status: 503 });
      }
      const order = new Map(ids.map((id, index) => [id, index]));
      resumed.sort((a, b) => (order.get(a.id) ?? 0) - (order.get(b.id) ?? 0));
      const resumedQuestions = resumed.map((question) => ({
        id: question.id,
        domain: question.domain,
        prompt: question.prompt,
        choices: question.choices,
        difficulty: question.difficulty,
        hasHint: false,
      }));
      return NextResponse.json({
        attemptId: previous.id,
        durationMinutes: DIAGNOSTIC_DURATION_MINUTES,
        questions: resumedQuestions,
      });
    }
  }

  let query = admin
    .from("questions")
    .select("id, domain, prompt, choices, difficulty, hint")
    .eq("cert_id", certId);

  if (mode === "domain") {
    query = query.eq("domain", domain);
  }

  const { data: questions, error } = await query;

  if (error || !questions?.length) {
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

  const { data: attempt, error: attemptError } = await admin
    .from("simulado_attempts")
    .insert({
      user_id: user.id,
      cert_id: certId,
      mode,
      domain: mode === "domain" ? domain : null,
      selected_question_ids: selected.map((question) => question.id),
      answers: {},
    })
    .select("id")
    .single();

  if (attemptError?.code === "23505" && mode === "diagnostic") {
    return NextResponse.json({ error: "Seu diagnóstico gratuito já foi iniciado." }, { status: 409 });
  }
  if (attemptError || !attempt) {
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
