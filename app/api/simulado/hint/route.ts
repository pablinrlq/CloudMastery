import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

// POST { attemptId, questionId } -> { hint }
// Registra o uso da dica no servidor ANTES de devolver o texto: a penalidade
// é aplicada na correção a partir do registro do banco, não do client.
export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
  }

  const { attemptId, questionId } = await request.json();
  if (!attemptId || !questionId) {
    return NextResponse.json({ error: "Parâmetros inválidos" }, { status: 400 });
  }

  const admin = createAdminClient();

  const { data: attempt } = await admin
    .from("simulado_attempts")
    .select("id, user_id, completed_at, hints_used")
    .eq("id", attemptId)
    .maybeSingle();

  if (!attempt || attempt.user_id !== user.id) {
    return NextResponse.json({ error: "Tentativa não encontrada" }, { status: 404 });
  }
  if (attempt.completed_at) {
    return NextResponse.json({ error: "Tentativa já finalizada" }, { status: 409 });
  }

  const { data: question } = await admin
    .from("questions")
    .select("id, hint")
    .eq("id", questionId)
    .maybeSingle();

  if (!question?.hint) {
    return NextResponse.json({ error: "Esta questão não tem dica" }, { status: 404 });
  }

  const used: string[] = Array.isArray(attempt.hints_used) ? attempt.hints_used : [];
  if (!used.includes(questionId)) {
    await admin
      .from("simulado_attempts")
      .update({ hints_used: [...used, questionId] })
      .eq("id", attemptId);
  }

  return NextResponse.json({ hint: question.hint });
}
