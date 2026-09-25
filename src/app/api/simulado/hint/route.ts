import { NextResponse, type NextRequest } from "next/server";
import { getApiUser } from "@/lib/auth/api";
import { db } from "@/lib/db";
import { hasAccess, type Subscription } from "@/lib/dal";
import { hasVerifiedEmail } from "@/lib/auth/security";
import { enforceRateLimit } from "@/lib/learning/rate-limit";

// POST { attemptId, questionId } -> { hint }
// Registra o uso da dica no servidor ANTES de devolver o texto: a penalidade
// é aplicada na correção a partir do registro do banco, não do client.
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

  const rateLimited = await enforceRateLimit("simulado-hint", user.id, 120, 600);
  if (rateLimited) return rateLimited;

  const payload: unknown = await request.json().catch(() => null);
  const { attemptId, questionId } =
    payload && typeof payload === "object"
      ? (payload as { attemptId?: unknown; questionId?: unknown })
      : {};
  if (typeof attemptId !== "string" || typeof questionId !== "string") {
    return NextResponse.json({ error: "Parâmetros inválidos" }, { status: 400 });
  }

  const attempt = await db.selectFrom("simulado_attempts").select(["id", "user_id", "cert_id", "mode", "completed_at", "hints_used", "selected_question_ids"]).where("id", "=", attemptId).executeTakeFirst();


  if (!attempt || attempt.user_id !== user.id) {
    return NextResponse.json({ error: "Tentativa não encontrada" }, { status: 404 });
  }
  if (attempt.completed_at) {
    return NextResponse.json({ error: "Tentativa já finalizada" }, { status: 409 });
  }

  const subscription = await db.selectFrom("subscriptions")
    .select(["status", "plan", "cert_access", "current_period_end"])
    .where("user_id", "=", user.id)
    .executeTakeFirst();
  if (!hasAccess(subscription as Subscription | null, attempt.cert_id)) {
    return NextResponse.json({ error: "Dicas são um recurso Premium." }, { status: 403 });
  }
  const selectedQuestionIds: string[] = Array.isArray(attempt.selected_question_ids)
    ? attempt.selected_question_ids
    : [];
  if (!selectedQuestionIds.includes(questionId)) {
    return NextResponse.json({ error: "Questão não pertence à tentativa" }, { status: 400 });
  }

  const question = await db.selectFrom("questions").select(["id", "hint"]).where("id", "=", questionId).executeTakeFirst();

  if (!question?.hint) {
    return NextResponse.json({ error: "Esta questão não tem dica" }, { status: 404 });
  }

  const used: string[] = Array.isArray(attempt.hints_used) ? attempt.hints_used : [];
  if (!used.includes(questionId)) {
    const result = await db.updateTable("simulado_attempts").set({ hints_used: [...used, questionId] }).where("id", "=", attemptId).where("completed_at", "is", null).executeTakeFirst();
    if (Number(result.numUpdatedRows) === 0) {
      return NextResponse.json({ error: "Falha ao registrar dica" }, { status: 500 });
    }
  }

  return NextResponse.json({ hint: question.hint });
}
