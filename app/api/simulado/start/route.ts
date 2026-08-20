import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { hasAccess, type Subscription } from "@/lib/dal";
import { CERTIFICATIONS, isValidCert } from "@/lib/content";
import { hasVerifiedEmail } from "@/lib/auth-security";

// POST { certId, mode: "full" | "domain", domain? }
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
    (mode !== "full" && mode !== "domain") ||
    (mode === "domain" &&
      (typeof domain !== "string" ||
        !(CERTIFICATIONS[certId].domains as readonly string[]).includes(domain)))
  ) {
    return NextResponse.json({ error: "Parâmetros inválidos" }, { status: 400 });
  }

  const { data: subscription } = await supabase
    .from("subscriptions")
    .select("status, plan, cert_access, current_period_end")
    .eq("user_id", user.id)
    .maybeSingle();

  if (!hasAccess(subscription as Subscription | null, certId)) {
    return NextResponse.json({ error: "Assinatura necessária" }, { status: 403 });
  }

  // Admin client: questions table has no client-facing RLS policy on purpose.
  const admin = createAdminClient();

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

  const shuffled = [...questions].sort(() => Math.random() - 0.5);
  const cap = mode === "full" ? CERTIFICATIONS[certId].examQuestionCount : 20;
  const selected = shuffled.slice(0, cap).map((q) => ({
    id: q.id,
    domain: q.domain,
    prompt: q.prompt,
    choices: q.choices,
    difficulty: q.difficulty,
    hasHint: Boolean(q.hint), // só o flag — o texto da dica fica no servidor
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

  if (attemptError || !attempt) {
    return NextResponse.json({ error: "Falha ao criar tentativa" }, { status: 500 });
  }

  return NextResponse.json({
    attemptId: attempt.id,
    durationMinutes:
      mode === "full" ? CERTIFICATIONS[certId].examDurationMinutes : 30,
    questions: selected,
  });
}
