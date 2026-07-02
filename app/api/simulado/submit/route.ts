import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

type SubmittedAnswers = Record<string, string[]>; // questionId -> chosen choice ids

// POST { attemptId, answers, timeSpentSeconds }
// Grades entirely server-side; only after grading do explanations and
// correct answers get returned.
export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
  }

  const { attemptId, answers, timeSpentSeconds } = (await request.json()) as {
    attemptId: string;
    answers: SubmittedAnswers;
    timeSpentSeconds: number;
  };

  const admin = createAdminClient();

  const { data: attempt } = await admin
    .from("simulado_attempts")
    .select("id, user_id, cert_id, mode, domain, completed_at")
    .eq("id", attemptId)
    .maybeSingle();

  if (!attempt || attempt.user_id !== user.id) {
    return NextResponse.json({ error: "Tentativa não encontrada" }, { status: 404 });
  }
  if (attempt.completed_at) {
    return NextResponse.json({ error: "Tentativa já finalizada" }, { status: 409 });
  }

  const questionIds = Object.keys(answers ?? {});
  if (!questionIds.length) {
    return NextResponse.json({ error: "Nenhuma resposta enviada" }, { status: 400 });
  }

  const { data: questions } = await admin
    .from("questions")
    .select("id, domain, prompt, choices, correct_choice_ids, explanation")
    .in("id", questionIds)
    .eq("cert_id", attempt.cert_id);

  if (!questions?.length) {
    return NextResponse.json({ error: "Questões não encontradas" }, { status: 400 });
  }

  const domainBreakdown: Record<string, { correct: number; total: number }> = {};
  const review: Array<{
    questionId: string;
    prompt: string;
    choices: unknown;
    yourChoiceIds: string[];
    correctChoiceIds: string[];
    explanation: string | null;
    correct: boolean;
  }> = [];

  let correctCount = 0;

  for (const q of questions) {
    const chosen = [...(answers[q.id] ?? [])].sort();
    const correct = [...q.correct_choice_ids].sort();
    const isCorrect =
      chosen.length === correct.length &&
      chosen.every((c, i) => c === correct[i]);

    if (isCorrect) correctCount++;

    const bucket = (domainBreakdown[q.domain] ??= { correct: 0, total: 0 });
    bucket.total++;
    if (isCorrect) bucket.correct++;

    review.push({
      questionId: q.id,
      prompt: q.prompt,
      choices: q.choices,
      yourChoiceIds: answers[q.id] ?? [],
      correctChoiceIds: q.correct_choice_ids,
      explanation: q.explanation,
      correct: isCorrect,
    });
  }

  const score = Math.round((correctCount / questions.length) * 100);

  await admin
    .from("simulado_attempts")
    .update({
      score,
      time_spent_seconds: timeSpentSeconds ?? null,
      answers,
      domain_breakdown: domainBreakdown,
      completed_at: new Date().toISOString(),
    })
    .eq("id", attemptId);

  return NextResponse.json({
    score,
    correctCount,
    total: questions.length,
    domainBreakdown,
    review,
  });
}
