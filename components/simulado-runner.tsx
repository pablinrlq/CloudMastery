"use client";

import { useCallback, useEffect, useRef, useState } from "react";

type Choice = { id: string; text: string };
type Question = {
  id: string;
  domain: string;
  prompt: string;
  choices: Choice[];
  difficulty: string;
};

type ReviewItem = {
  questionId: string;
  prompt: string;
  choices: Choice[];
  yourChoiceIds: string[];
  correctChoiceIds: string[];
  explanation: string | null;
  correct: boolean;
};

type Results = {
  score: number;
  correctCount: number;
  total: number;
  domainBreakdown: Record<string, { correct: number; total: number }>;
  review: ReviewItem[];
};

type Phase = "idle" | "loading" | "running" | "submitting" | "results";

export function SimuladoRunner({
  certId,
  certName,
  domains,
  fullDurationMinutes,
  fullQuestionCount,
}: {
  certId: string;
  certName: string;
  domains: readonly string[];
  fullDurationMinutes: number;
  fullQuestionCount: number;
}) {
  const [phase, setPhase] = useState<Phase>("idle");
  const [error, setError] = useState<string | null>(null);
  const [attemptId, setAttemptId] = useState<string | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [current, setCurrent] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string[]>>({});
  const [secondsLeft, setSecondsLeft] = useState(0);
  const [results, setResults] = useState<Results | null>(null);
  const startedAtRef = useRef<number>(0);

  async function start(mode: "full" | "domain", domain?: string) {
    setPhase("loading");
    setError(null);
    try {
      const res = await fetch("/api/simulado/start", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ certId, mode, domain }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Erro ao iniciar o simulado.");
        setPhase("idle");
        return;
      }
      setAttemptId(data.attemptId);
      setQuestions(data.questions);
      setAnswers({});
      setCurrent(0);
      setSecondsLeft(data.durationMinutes * 60);
      startedAtRef.current = Date.now();
      setPhase("running");
    } catch {
      setError("Erro de rede ao iniciar o simulado.");
      setPhase("idle");
    }
  }

  const submit = useCallback(async () => {
    if (!attemptId) return;
    setPhase("submitting");
    try {
      const res = await fetch("/api/simulado/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          attemptId,
          answers,
          timeSpentSeconds: Math.round((Date.now() - startedAtRef.current) / 1000),
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Erro ao enviar respostas.");
        setPhase("running");
        return;
      }
      setResults(data);
      setPhase("results");
    } catch {
      setError("Erro de rede ao enviar respostas.");
      setPhase("running");
    }
  }, [attemptId, answers]);

  // Countdown: auto-submit when time runs out.
  useEffect(() => {
    if (phase !== "running") return;
    if (secondsLeft <= 0) {
      submit();
      return;
    }
    const t = setTimeout(() => setSecondsLeft((s) => s - 1), 1000);
    return () => clearTimeout(t);
  }, [phase, secondsLeft, submit]);

  function toggleChoice(questionId: string, choiceId: string, multi: boolean) {
    setAnswers((prev) => {
      const chosen = prev[questionId] ?? [];
      if (multi) {
        return {
          ...prev,
          [questionId]: chosen.includes(choiceId)
            ? chosen.filter((c) => c !== choiceId)
            : [...chosen, choiceId],
        };
      }
      return { ...prev, [questionId]: [choiceId] };
    });
  }

  // ---------- idle ----------
  if (phase === "idle" || phase === "loading") {
    return (
      <div className="space-y-6">
        {error && <p className="rounded-md bg-red-50 p-3 text-sm text-red-700">{error}</p>}

        <div className="rounded-xl border border-gray-200 p-6">
          <h2 className="font-semibold">Simulado completo</h2>
          <p className="mt-1 text-sm text-gray-600">
            Formato oficial: {fullQuestionCount} questões em {fullDurationMinutes}{" "}
            minutos. O cronômetro envia automaticamente ao zerar.
          </p>
          <button
            onClick={() => start("full")}
            disabled={phase === "loading"}
            className="mt-4 rounded-md bg-orange-500 px-4 py-2 text-sm font-medium text-white hover:bg-orange-600 disabled:opacity-50"
          >
            {phase === "loading" ? "Preparando..." : "Iniciar simulado completo"}
          </button>
        </div>

        <div className="rounded-xl border border-gray-200 p-6">
          <h2 className="font-semibold">Prática por domínio</h2>
          <p className="mt-1 text-sm text-gray-600">
            Foque no domínio em que você está mais fraco (até 20 questões, 30 min).
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            {domains.map((d) => (
              <button
                key={d}
                onClick={() => start("domain", d)}
                disabled={phase === "loading"}
                className="rounded-md border border-gray-300 px-3 py-1.5 text-sm hover:border-orange-400 hover:text-orange-600 disabled:opacity-50"
              >
                {d}
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // ---------- results ----------
  if (phase === "results" && results) {
    const passed = results.score >= 72; // aproximação da nota de corte oficial
    return (
      <div className="space-y-8">
        <div
          className={`rounded-xl p-6 text-center ${
            passed ? "bg-green-50" : "bg-red-50"
          }`}
        >
          <p className="text-5xl font-bold">{results.score}%</p>
          <p className="mt-2 text-gray-700">
            {results.correctCount} de {results.total} questões corretas
          </p>
          <p className={`mt-1 font-medium ${passed ? "text-green-700" : "text-red-700"}`}>
            {passed
              ? "Acima da faixa de aprovação — continue assim!"
              : "Abaixo da faixa de aprovação — veja onde melhorar abaixo."}
          </p>
        </div>

        <div>
          <h2 className="font-semibold">Desempenho por domínio</h2>
          <div className="mt-3 space-y-3">
            {Object.entries(results.domainBreakdown).map(([domain, { correct, total }]) => {
              const pct = Math.round((correct / total) * 100);
              return (
                <div key={domain}>
                  <div className="flex justify-between text-sm">
                    <span>{domain}</span>
                    <span className={pct < 72 ? "font-medium text-red-600" : "text-gray-600"}>
                      {correct}/{total} ({pct}%)
                    </span>
                  </div>
                  <div className="mt-1 h-2 rounded-full bg-gray-100">
                    <div
                      className={`h-2 rounded-full ${pct < 72 ? "bg-red-400" : "bg-green-500"}`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div>
          <h2 className="font-semibold">Revisão das questões</h2>
          <div className="mt-3 space-y-4">
            {results.review
              .filter((r) => !r.correct)
              .concat(results.review.filter((r) => r.correct))
              .map((item, i) => (
                <details
                  key={item.questionId}
                  className={`rounded-xl border p-4 ${
                    item.correct ? "border-gray-200" : "border-red-200 bg-red-50/40"
                  }`}
                  open={!item.correct && i < 3}
                >
                  <summary className="cursor-pointer text-sm font-medium">
                    {item.correct ? "✓" : "✗"} {item.prompt}
                  </summary>
                  <ul className="mt-3 space-y-1 text-sm">
                    {item.choices.map((c) => {
                      const isCorrect = item.correctChoiceIds.includes(c.id);
                      const wasChosen = item.yourChoiceIds.includes(c.id);
                      return (
                        <li
                          key={c.id}
                          className={
                            isCorrect
                              ? "font-medium text-green-700"
                              : wasChosen
                                ? "text-red-600 line-through"
                                : "text-gray-600"
                          }
                        >
                          {isCorrect ? "✓ " : wasChosen ? "✗ " : "· "}
                          {c.text}
                        </li>
                      );
                    })}
                  </ul>
                  {item.explanation && (
                    <p className="mt-3 rounded-md bg-gray-50 p-3 text-sm text-gray-700">
                      {item.explanation}
                    </p>
                  )}
                </details>
              ))}
          </div>
        </div>

        <button
          onClick={() => {
            setPhase("idle");
            setResults(null);
            setError(null);
          }}
          className="rounded-md border border-gray-300 px-4 py-2 text-sm font-medium hover:border-orange-400"
        >
          Fazer outro simulado
        </button>
      </div>
    );
  }

  // ---------- running ----------
  const q = questions[current];
  if (!q) return null;
  const multi = q.prompt.includes("DUAS") || q.prompt.includes("Choose TWO");
  const answeredCount = Object.keys(answers).filter((k) => answers[k]?.length).length;
  const minutes = Math.floor(secondsLeft / 60);
  const seconds = secondsLeft % 60;

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <span className="text-sm text-gray-600">
          Questão {current + 1} de {questions.length} · {answeredCount} respondidas
        </span>
        <span
          className={`rounded-md px-3 py-1 font-mono text-sm font-medium ${
            secondsLeft < 300 ? "bg-red-100 text-red-700" : "bg-gray-100 text-gray-700"
          }`}
        >
          {minutes}:{seconds.toString().padStart(2, "0")}
        </span>
      </div>

      <p className="text-xs font-medium uppercase tracking-wide text-orange-600">
        {q.domain}
      </p>
      <h2 className="mt-2 text-lg font-medium leading-relaxed">{q.prompt}</h2>
      {multi && (
        <p className="mt-1 text-sm text-gray-500">Selecione todas as corretas.</p>
      )}

      <div className="mt-5 space-y-2">
        {q.choices.map((c) => {
          const selected = (answers[q.id] ?? []).includes(c.id);
          return (
            <button
              key={c.id}
              onClick={() => toggleChoice(q.id, c.id, multi)}
              className={`block w-full rounded-lg border p-3 text-left text-sm transition ${
                selected
                  ? "border-orange-500 bg-orange-50"
                  : "border-gray-200 hover:border-gray-300"
              }`}
            >
              {c.text}
            </button>
          );
        })}
      </div>

      <div className="mt-8 flex items-center justify-between">
        <button
          onClick={() => setCurrent((c) => Math.max(0, c - 1))}
          disabled={current === 0}
          className="rounded-md border border-gray-300 px-4 py-2 text-sm disabled:opacity-40"
        >
          ← Anterior
        </button>

        {current < questions.length - 1 ? (
          <button
            onClick={() => setCurrent((c) => c + 1)}
            className="rounded-md bg-gray-900 px-4 py-2 text-sm font-medium text-white"
          >
            Próxima →
          </button>
        ) : (
          <button
            onClick={submit}
            disabled={phase === "submitting"}
            className="rounded-md bg-orange-500 px-4 py-2 text-sm font-medium text-white hover:bg-orange-600 disabled:opacity-50"
          >
            {phase === "submitting" ? "Corrigindo..." : "Finalizar e corrigir"}
          </button>
        )}
      </div>

      <div className="mt-6 flex flex-wrap gap-1.5">
        {questions.map((question, i) => (
          <button
            key={question.id}
            onClick={() => setCurrent(i)}
            className={`h-7 w-7 rounded text-xs font-medium ${
              i === current
                ? "bg-gray-900 text-white"
                : (answers[question.id] ?? []).length
                  ? "bg-orange-100 text-orange-700"
                  : "bg-gray-100 text-gray-500"
            }`}
          >
            {i + 1}
          </button>
        ))}
      </div>
    </div>
  );
}
