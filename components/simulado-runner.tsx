"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";

type Choice = { id: string; text: string };
type Question = {
  id: string;
  domain: string;
  prompt: string;
  choices: Choice[];
  difficulty: string;
  hasHint: boolean;
};

type ReviewItem = {
  questionId: string;
  prompt: string;
  domain: string;
  choices: Choice[];
  yourChoiceIds: string[];
  correctChoiceIds: string[];
  explanation: string | null;
  correct: boolean;
  hintUsed: boolean;
  timeSeconds: number | null;
};

type Results = {
  score: number;
  scoreNoPenalty: number;
  hintsUsedCount: number;
  overtimeSeconds: number;
  correctCount: number;
  total: number;
  domainBreakdown: Record<string, { correct: number; total: number }>;
  slowest: Array<{
    prompt: string;
    domain: string;
    timeSeconds: number;
    correct: boolean;
    hintUsed: boolean;
  }>;
  recommendations: Array<{
    domain: string;
    pct: number;
    modules: Array<{ slug: string; title: string }>;
  }>;
  review: ReviewItem[];
};

type Phase = "idle" | "loading" | "running" | "submitting" | "results";

function formatClock(totalSeconds: number): string {
  const negative = totalSeconds < 0;
  const abs = Math.abs(totalSeconds);
  const m = Math.floor(abs / 60);
  const s = abs % 60;
  return `${negative ? "-" : ""}${m}:${s.toString().padStart(2, "0")}`;
}

function formatDuration(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = Math.round(seconds % 60);
  return m > 0 ? `${m}min ${s}s` : `${s}s`;
}

export function SimuladoRunner({
  certId,
  domains,
  fullDurationMinutes,
  fullQuestionCount,
}: {
  certId: string;
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
  const [hints, setHints] = useState<Record<string, string>>({});
  const [hintLoading, setHintLoading] = useState(false);

  const startedAtRef = useRef<number>(0);
  // Tempo por questão: acumula ao sair da questão (navegação ou envio).
  const timingsRef = useRef<Record<string, number>>({});
  const enteredAtRef = useRef<number>(0);
  const currentIdRef = useRef<string | null>(null);

  const flushTiming = useCallback(() => {
    const id = currentIdRef.current;
    if (!id || !enteredAtRef.current) return;
    const elapsed = (Date.now() - enteredAtRef.current) / 1000;
    timingsRef.current[id] = (timingsRef.current[id] ?? 0) + elapsed;
    enteredAtRef.current = Date.now();
  }, []);

  const goTo = useCallback(
    (index: number) => {
      flushTiming();
      setCurrent(index);
    },
    [flushTiming]
  );

  // Ao trocar de questão, reinicia o relógio daquela questão.
  useEffect(() => {
    if (phase !== "running") return;
    const q = questions[current];
    if (!q) return;
    currentIdRef.current = q.id;
    enteredAtRef.current = Date.now();
  }, [phase, current, questions]);

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
      setHints({});
      setCurrent(0);
      setSecondsLeft(data.durationMinutes * 60);
      startedAtRef.current = Date.now();
      timingsRef.current = {};
      enteredAtRef.current = Date.now();
      currentIdRef.current = data.questions[0]?.id ?? null;
      setPhase("running");
    } catch {
      setError("Erro de rede ao iniciar o simulado.");
      setPhase("idle");
    }
  }

  const submit = useCallback(async () => {
    if (!attemptId) return;
    flushTiming();
    setPhase("submitting");
    try {
      const timings: Record<string, number> = {};
      for (const [k, v] of Object.entries(timingsRef.current)) {
        timings[k] = Math.round(v);
      }
      const res = await fetch("/api/simulado/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          attemptId,
          answers,
          timeSpentSeconds: Math.round((Date.now() - startedAtRef.current) / 1000),
          questionTimings: timings,
          overtimeSeconds: secondsLeft < 0 ? -secondsLeft : 0,
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
  }, [attemptId, answers, secondsLeft, flushTiming]);

  // Cronômetro: NÃO envia sozinho ao zerar — passa a contar negativo
  // (tempo excedido), como o usuário veria na prova de verdade o estouro.
  useEffect(() => {
    if (phase !== "running") return;
    const t = setTimeout(() => setSecondsLeft((s) => s - 1), 1000);
    return () => clearTimeout(t);
  }, [phase, secondsLeft]);

  async function fetchHint(questionId: string) {
    if (hints[questionId] || hintLoading) return;
    setHintLoading(true);
    try {
      const res = await fetch("/api/simulado/hint", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ attemptId, questionId }),
      });
      const data = await res.json();
      if (res.ok) {
        setHints((prev) => ({ ...prev, [questionId]: data.hint }));
      }
    } finally {
      setHintLoading(false);
    }
  }

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

        <div className="rounded-xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-900">
          <h2 className="font-semibold text-gray-900 dark:text-white">Simulado completo</h2>
          <p className="mt-1 text-sm text-gray-600">
            Formato oficial: {fullQuestionCount} questões em {fullDurationMinutes}{" "}
            minutos. Se o tempo acabar, o cronômetro continua em negativo — você
            decide quando entregar.
          </p>
          <p className="mt-2 text-xs text-gray-500">
            💡 Cada questão tem uma dica, mas usá-la faz a questão valer meio ponto.
          </p>
          <button
            onClick={() => start("full")}
            disabled={phase === "loading"}
            className="mt-4 rounded-md bg-orange-500 px-4 py-2 text-sm font-medium text-white hover:bg-orange-600 disabled:opacity-50"
          >
            {phase === "loading" ? "Preparando..." : "Iniciar simulado completo"}
          </button>
        </div>

        <div className="rounded-xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-900">
          <h2 className="font-semibold text-gray-900 dark:text-white">Prática por domínio</h2>
          <p className="mt-1 text-sm text-gray-600">
            Foque no domínio em que você está mais fraco (até 20 questões, 30 min).
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            {domains.map((d) => (
              <button
                key={d}
                onClick={() => start("domain", d)}
                disabled={phase === "loading"}
                className="rounded-md border border-gray-300 px-3 py-1.5 text-sm text-gray-700 hover:border-orange-400 hover:text-orange-600 disabled:opacity-50 dark:border-gray-700 dark:text-gray-300 dark:hover:border-orange-500 dark:hover:text-orange-400"
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
    const passed = results.score >= 72;
    return (
      <div className="space-y-8">
        <div className={`rounded-xl p-6 text-center ${passed ? "bg-green-50" : "bg-red-50"}`}>
          <p className="text-5xl font-bold">{results.score}%</p>
          <p className="mt-2 text-gray-700">
            {results.correctCount} de {results.total} corretas
            {results.hintsUsedCount > 0 && (
              <span className="block text-sm text-gray-500">
                {results.hintsUsedCount} dica(s) usada(s) — sem a penalidade seria{" "}
                {results.scoreNoPenalty}%
              </span>
            )}
          </p>
          {results.overtimeSeconds > 0 && (
            <p className="mt-1 text-sm font-medium text-amber-700">
              ⏱ Você excedeu o tempo oficial em {formatDuration(results.overtimeSeconds)} —
              na prova real, a entrega seria automática.
            </p>
          )}
          <p className={`mt-1 font-medium ${passed ? "text-green-700" : "text-red-700"}`}>
            {passed
              ? "Acima da faixa de aprovação — continue assim!"
              : "Abaixo da faixa de aprovação — plano de recuperação logo abaixo."}
          </p>
        </div>

        <div>
          <h2 className="font-semibold text-gray-900 dark:text-white">Desempenho por domínio</h2>
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

        {results.recommendations.length > 0 && (
          <div className="rounded-xl border border-orange-200 bg-orange-50/50 p-5">
            <h2 className="font-semibold text-gray-900 dark:text-white">📚 O que estudar antes do próximo simulado</h2>
            <p className="mt-1 text-sm text-gray-600">
              Com base nos seus erros, revise estes módulos (do domínio mais fraco para o menos):
            </p>
            <div className="mt-3 space-y-3">
              {results.recommendations.map((rec) => (
                <div key={rec.domain}>
                  <p className="text-sm font-medium">
                    {rec.domain} <span className="text-red-600">({rec.pct}%)</span>
                  </p>
                  <ul className="mt-1 space-y-1">
                    {rec.modules.map((m) => (
                      <li key={m.slug}>
                        <Link
                          href={`/course/${certId}/${m.slug}`}
                          className="text-sm text-orange-700 underline hover:text-orange-900"
                        >
                          → {m.title}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        )}

        {results.slowest.length > 0 && (
          <div>
            <h2 className="font-semibold text-gray-900 dark:text-white">⏱ Onde você levou mais tempo</h2>
            <ul className="mt-3 space-y-2">
              {results.slowest.map((s, i) => (
                <li
                  key={i}
                  className="flex items-start justify-between gap-3 rounded-lg border border-gray-200 p-3 text-sm"
                >
                  <span className="text-gray-700">
                    {s.correct ? "✓" : "✗"} {s.prompt.slice(0, 110)}
                    {s.prompt.length > 110 ? "…" : ""}
                    <span className="block text-xs text-gray-400">
                      {s.domain}
                      {s.hintUsed ? " · usou dica" : ""}
                    </span>
                  </span>
                  <span
                    className={`shrink-0 font-mono text-xs font-medium ${
                      s.correct ? "text-gray-600" : "text-red-600"
                    }`}
                  >
                    {formatDuration(s.timeSeconds)}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        )}

        <div>
          <h2 className="font-semibold text-gray-900 dark:text-white">Revisão das questões</h2>
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
                    <span className="ml-1 text-xs font-normal text-gray-400">
                      {item.timeSeconds !== null ? ` · ${formatDuration(item.timeSeconds)}` : ""}
                      {item.hintUsed ? " · 💡 dica usada (meio ponto)" : ""}
                    </span>
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
                    <p className="mt-3 rounded-md bg-gray-50 p-3 text-sm text-gray-700 dark:bg-gray-800 dark:text-gray-300">
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
  const overtime = secondsLeft < 0;
  const hintShown = hints[q.id];

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <span className="text-sm text-gray-600">
          Questão {current + 1} de {questions.length} · {answeredCount} respondidas
        </span>
        <span
          className={`rounded-md px-3 py-1 font-mono text-sm font-medium ${
            overtime
              ? "bg-red-600 text-white"
              : secondsLeft < 300
                ? "bg-red-100 text-red-700"
                : "bg-gray-100 text-gray-700"
          }`}
          title={overtime ? "Tempo oficial excedido" : "Tempo restante"}
        >
          {formatClock(secondsLeft)}
          {overtime ? " ⚠" : ""}
        </span>
      </div>

      {overtime && (
        <p className="mb-4 rounded-md bg-red-50 p-2 text-center text-xs font-medium text-red-700">
          Tempo oficial esgotado — você pode continuar, mas o excedente será registrado.
        </p>
      )}

      <p className="text-xs font-medium uppercase tracking-wide text-orange-600">{q.domain}</p>
      <h2 className="mt-2 text-lg font-medium leading-relaxed text-gray-900 dark:text-white">{q.prompt}</h2>
      {multi && <p className="mt-1 text-sm text-gray-500">Selecione todas as corretas.</p>}

      <div className="mt-5 space-y-2">
        {q.choices.map((c) => {
          const selected = (answers[q.id] ?? []).includes(c.id);
          return (
            <button
              key={c.id}
              onClick={() => toggleChoice(q.id, c.id, multi)}
              className={`block w-full rounded-lg border p-3 text-left text-sm text-gray-900 transition dark:text-gray-100 ${
                selected
                  ? "border-orange-500 bg-orange-50 dark:bg-orange-500/15"
                  : "border-gray-200 hover:border-gray-300 dark:border-gray-700 dark:hover:border-gray-600"
              }`}
            >
              {c.text}
            </button>
          );
        })}
      </div>

      {q.hasHint && (
        <div className="mt-4">
          {hintShown ? (
            <p className="rounded-md border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900">
              💡 {hintShown}
              <span className="mt-1 block text-xs text-amber-700">
                Dica usada — esta questão agora vale meio ponto.
              </span>
            </p>
          ) : (
            <button
              onClick={() => fetchHint(q.id)}
              disabled={hintLoading}
              className="text-sm text-amber-700 underline decoration-dotted hover:text-amber-900 disabled:opacity-50"
            >
              💡 Usar dica (a questão passa a valer meio ponto)
            </button>
          )}
        </div>
      )}

      <div className="mt-8 flex items-center justify-between">
        <button
          onClick={() => goTo(Math.max(0, current - 1))}
          disabled={current === 0}
          className="rounded-md border border-gray-300 px-4 py-2 text-sm disabled:opacity-40"
        >
          ← Anterior
        </button>

        {current < questions.length - 1 ? (
          <button
            onClick={() => goTo(current + 1)}
            className="rounded-md bg-gray-900 px-4 py-2 text-sm font-medium text-white dark:bg-white dark:text-gray-900"
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
            onClick={() => goTo(i)}
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
