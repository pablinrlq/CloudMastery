import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { hasAccess, type Subscription } from "@/lib/dal";
import { CERTIFICATIONS, isValidCert } from "@/lib/content";

// POST { certId, mode: "full" | "domain", domain? }
// Creates an attempt and returns questions WITHOUT correct answers.
export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
  }

  const { certId, mode, domain } = await request.json();

  if (!isValidCert(certId) || !["full", "domain"].includes(mode)) {
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
    .select("id, domain, prompt, choices, difficulty")
    .eq("cert_id", certId);

  if (mode === "domain" && domain) {
    query = query.eq("domain", domain);
  }

  const { data: questions, error } = await query;

  if (error || !questions?.length) {
    return NextResponse.json(
      { error: "Nenhuma questão disponível" },
      { status: 404 }
    );
  }

  // Shuffle and cap at the official exam size for full mode.
  const shuffled = [...questions].sort(() => Math.random() - 0.5);
  const cap = mode === "full" ? CERTIFICATIONS[certId].examQuestionCount : 20;
  const selected = shuffled.slice(0, cap);

  const { data: attempt, error: attemptError } = await admin
    .from("simulado_attempts")
    .insert({
      user_id: user.id,
      cert_id: certId,
      mode,
      domain: mode === "domain" ? domain : null,
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
    questions: selected, // sem correct_choice_ids nem explanation
  });
}
