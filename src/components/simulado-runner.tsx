"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState, type CSSProperties } from "react";
import { CertEmblem } from "@/components/cert-emblem";
import { LogoIcon } from "@/components/logo";
import { ProgressRing } from "@/components/progress-ring";
import {
  AlertIcon,
  ArrowLeftIcon,
  ArrowRightIcon,
  BoltIcon,
  CheckCircleIcon,
  CheckIcon,
  ChevronDownIcon,
  ClockIcon,
  FlagIcon,
  GridIcon,
  KeyboardIcon,
  LightbulbIcon,
  LockIcon,
  PlayIcon,
  PracticeIcon,
  RotateIcon,
  SparkIcon,
  TargetIcon,
  TimerIcon,
  XCircleIcon,
  XIcon,
} from "@/components/ui-icons";
import { PASS_SCORE } from "@/lib/learning/thresholds";

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
  premiumInsights: boolean;
  score: number;
  scoreNoPenalty: number;
  hintsUsedCount: number;
  overtimeSeconds: number;
  correctCount: number;
  total: number;
  domainBreakdown?: Record<string, { correct: number; total: number }>;
  slowest?: Array<{
    prompt: string;
    domain: string;
    timeSeconds: number;
    correct: boolean;
    hintUsed: boolean;
  }>;
  recommendations?: Array<{
    domain: string;
    pct: number;
    modules: Array<{ slug: string; title: string }>;
  }>;
  review?: ReviewItem[];
  upgradeUrl?: string;
};

type Mode = "diagnostic" | "full" | "domain";
type Phase = "idle" | "loading" | "running" | "submitting" | "results";

const MODE_LABEL: Record<Mode, string> = {
  diagnostic: "Diagnóstico",
  full: "Simulado completo",
  domain: "Treino por domínio",
};

function formatClock(totalSeconds: number): string {
  const negative = totalSeconds < 0;
  const abs = Math.abs(totalSeconds);
  const h = Math.floor(abs / 3600);
  const m = Math.floor((abs % 3600) / 60);
  const s = abs % 60;
  const body = h > 0 ? `${h}:${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}` : `${m}:${s.toString().padStart(2, "0")}`;
  return `${negative ? "-" : ""}${body}`;
}

function formatDuration(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = Math.round(seconds % 60);
  return m > 0 ? `${m}min ${s}s` : `${s}s`;
}

export function SimuladoRunner({
  certId,
  certCode,
  certShort,
  domains,
  fullDurationMinutes,
  fullQuestionCount,
  premium,
  history,
  average,
  readyScore,
  domainStats,
}: {
  certId: string;
  certCode: string;
  certShort: string;
  domains: readonly string[];
  fullDurationMinutes: number;
  fullQuestionCount: number;
  premium: boolean;
  history: Array<{ score: number; completedAt: string }>;
  average: number | null;
  readyScore: number;
  domainStats: Array<{ domain: string; pct: number }>;
}) {
  const router = useRouter();
  const [phase, setPhase] = useState<Phase>("idle");
  const [mode, setMode] = useState<Mode>("full");
  const [domainLabel, setDomainLabel] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [attemptId, setAttemptId] = useState<string | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [current, setCurrent] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string[]>>({});
  const [flagged, setFlagged] = useState<Record<string, boolean>>({});
  const [secondsLeft, setSecondsLeft] = useState(0);
  const [results, setResults] = useState<Results | null>(null);
  const [elapsed, setElapsed] = useState<number | null>(null);
  const [hints, setHints] = useState<Record<string, string>>({});
  const [hintLoading, setHintLoading] = useState(false);
  const [dialog, setDialog] = useState<"submit" | "exit" | null>(null);
  const [navigatorOpen, setNavigatorOpen] = useState(false);

  const startedAtRef = useRef<number>(0);
  // Tempo por questão: acumula ao sair da questão (navegação ou envio).
  const timingsRef = useRef<Record<string, number>>({});
  const enteredAtRef = useRef<number>(0);
  const currentIdRef = useRef<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  const flushTiming = useCallback(() => {
    const id = currentIdRef.current;
    if (!id || !enteredAtRef.current) return;
    const spent = (Date.now() - enteredAtRef.current) / 1000;
    timingsRef.current[id] = (timingsRef.current[id] ?? 0) + spent;
    enteredAtRef.current = Date.now();
  }, []);

  const goTo = useCallback(
    (index: number) => {
      flushTiming();
      setCurrent(index);
      setNavigatorOpen(false);
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
    scrollRef.current?.scrollTo({ top: 0 });
  }, [phase, current, questions]);

  const inExam = phase === "running" || phase === "submitting";

  // Modo prova: trava o scroll da página e avisa antes de sair sem entregar.
  useEffect(() => {
    if (!inExam) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    function onBeforeUnload(event: BeforeUnloadEvent) {
      event.preventDefault();
      event.returnValue = "";
    }
    window.addEventListener("beforeunload", onBeforeUnload);
    return () => {
      document.body.style.overflow = previous;
      window.removeEventListener("beforeunload", onBeforeUnload);
    };
  }, [inExam]);

  async function start(nextMode: Mode, domain?: string) {
    setPhase("loading");
    setMode(nextMode);
    setDomainLabel(domain ?? null);
    setError(null);
    try {
      const res = await fetch("/api/simulado/start", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ certId, mode: nextMode, domain }),
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
      setFlagged({});
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
    setDialog(null);
    setPhase("submitting");
    try {
      const timings: Record<string, number> = {};
      for (const [k, v] of Object.entries(timingsRef.current)) {
        timings[k] = Math.round(v);
      }
      const timeSpentSeconds = Math.round((Date.now() - startedAtRef.current) / 1000);
      const res = await fetch("/api/simulado/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          attemptId,
          answers,
          timeSpentSeconds,
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
      setElapsed(timeSpentSeconds);
      setPhase("results");
      window.scrollTo({ top: 0 });
      // Atualiza XP, sequência e progresso exibidos no shell.
      router.refresh();
    } catch {
      setError("Erro de rede ao enviar respostas.");
      setPhase("running");
    }
  }, [attemptId, answers, secondsLeft, flushTiming, router]);

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
      } else {
        setError(data.error ?? "Não foi possível carregar a dica.");
      }
    } catch {
      setError("Erro de conexão ao carregar a dica.");
    } finally {
      setHintLoading(false);
    }
  }

  const toggleChoice = useCallback((questionId: string, choiceId: string, multi: boolean) => {
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
  }, []);

  const toggleFlag = useCallback((questionId: string) => {
    setFlagged((prev) => ({ ...prev, [questionId]: !prev[questionId] }));
  }, []);

  // Atalhos: A–E ou 1–5 respondem, ←/→ navegam, F marca para revisão.
  useEffect(() => {
    if (phase !== "running" || dialog) return;
    function onKey(event: KeyboardEvent) {
      const target = event.target as HTMLElement | null;
      if (event.metaKey || event.ctrlKey || event.altKey) return;
      if (target && /^(INPUT|TEXTAREA|SELECT)$/.test(target.tagName)) return;
      const q = questions[current];
      if (!q) return;
      const key = event.key.toLowerCase();
      if (key === "arrowright" && current < questions.length - 1) {
        event.preventDefault();
        goTo(current + 1);
      } else if (key === "arrowleft" && current > 0) {
        event.preventDefault();
        goTo(current - 1);
      } else if (key === "f") {
        toggleFlag(q.id);
      } else {
        const index = "abcde".indexOf(key) >= 0 ? "abcde".indexOf(key) : "12345".indexOf(key);
        const choice = index >= 0 ? q.choices[index] : undefined;
        if (choice) toggleChoice(q.id, choice.id, isMulti(q));
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [phase, dialog, questions, current, goTo, toggleChoice, toggleFlag]);

  function resetToIdle() {
    setPhase("idle");
    setResults(null);
    setError(null);
    setDialog(null);
    window.scrollTo({ top: 0 });
  }

  // ---------- idle ----------
  if (phase === "idle" || phase === "loading") {
    return (
      <IdleView
        certId={certId}
        certCode={certCode}
        certShort={certShort}
        domains={domains}
        fullDurationMinutes={fullDurationMinutes}
        fullQuestionCount={fullQuestionCount}
        premium={premium}
        history={history}
        average={average}
        readyScore={readyScore}
        domainStats={domainStats}
        loading={phase === "loading"}
        loadingTarget={phase === "loading" ? (domainLabel ?? mode) : null}
        error={error}
        onStart={start}
      />
    );
  }

  // ---------- results ----------
  if (phase === "results" && results) {
    return (
      <ResultsView
        results={results}
        certId={certId}
        certCode={certCode}
        mode={mode}
        domainLabel={domainLabel}
        elapsed={elapsed}
        onRestart={resetToIdle}
      />
    );
  }

  // ---------- running ----------
  const q = questions[current];
  if (!q) return null;
  const multi = isMulti(q);
  const answeredCount = questions.filter((question) => (answers[question.id] ?? []).length > 0).length;
  const flaggedCount = questions.filter((question) => flagged[question.id]).length;
  const unanswered = questions.length - answeredCount;
  const overtime = secondsLeft < 0;
  const lowTime = !overtime && secondsLeft < 300;
  const hintShown = hints[q.id];
  const selectedIds = answers[q.id] ?? [];
  const isLast = current === questions.length - 1;

  const navigator = (
    <QuestionNavigator
      questions={questions}
      current={current}
      answers={answers}
      flagged={flagged}
      answeredCount={answeredCount}
      flaggedCount={flaggedCount}
      onGo={goTo}
    />
  );

  return (
    <div className="fixed inset-0 z-[60] flex flex-col bg-ws-canvas" role="region" aria-label={`${MODE_LABEL[mode]} em andamento`}>
      <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 top-0 h-72 bg-[radial-gradient(50rem_18rem_at_80%_-40%,rgb(249_115_22/0.12),transparent)]" />

      <header className="relative z-10 border-b border-ws-line/[0.08] bg-ws-surface/80 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-[1280px] items-center gap-3 px-4 sm:px-6">
          <div className="flex min-w-0 items-center gap-3">
            <span className="hidden sm:inline-flex"><LogoIcon size={30} /></span>
            <div className="min-w-0 leading-tight">
              <p className="truncate text-sm font-semibold text-ws-ink">{MODE_LABEL[mode]}</p>
              <p className="truncate font-mono text-[11px] text-ws-subtle">{certCode}{domainLabel ? ` · ${domainLabel}` : ""}</p>
            </div>
          </div>

          <div className="mx-auto hidden w-full max-w-xs flex-col gap-1.5 md:flex">
            <div className="flex justify-between font-mono text-[11px] text-ws-subtle">
              <span>{answeredCount}/{questions.length} respondidas</span>
              {flaggedCount ? <span className="text-ws-warn-ink">{flaggedCount} marcadas</span> : null}
            </div>
            <div className="ws-bar">
              <span style={{ width: `${(answeredCount / questions.length) * 100}%`, animation: "none" }} />
            </div>
          </div>

          <div className="ml-auto flex items-center gap-2">
            <span
              role="timer"
              aria-live="off"
              title={overtime ? "Tempo oficial excedido" : "Tempo restante"}
              className={`flex h-10 items-center gap-2 rounded-xl px-3 font-mono text-sm font-semibold tabular-nums transition-colors ${
                overtime
                  ? "bg-ws-danger text-white shadow-[0_8px_24px_-10px_rgb(var(--ws-danger))]"
                  : lowTime
                    ? "border border-ws-danger/40 bg-ws-danger/10 text-ws-danger-ink"
                    : "border border-ws-line/10 bg-ws-surface text-ws-ink"
              }`}
            >
              {lowTime || overtime ? <span className="ws-dot ws-dot-live" /> : <TimerIcon className="h-4 w-4 text-ws-subtle" />}
              {formatClock(secondsLeft)}
            </span>
            <button type="button" onClick={() => setDialog("submit")} disabled={phase === "submitting"} aria-label="Entregar simulado" className="ws-btn ws-btn-primary ws-btn-sm h-10">
              <CheckIcon className="h-4 w-4" strokeWidth={2.4} />
              <span className="hidden sm:inline">Entregar</span>
            </button>
            <button type="button" onClick={() => setDialog("exit")} aria-label="Sair do simulado" className="ws-btn ws-btn-ghost ws-btn-sm h-10 w-10 !px-0">
              <XIcon className="h-4 w-4" />
            </button>
          </div>
        </div>
        <div className="ws-bar !h-[3px] !rounded-none md:hidden">
          <span style={{ width: `${(answeredCount / questions.length) * 100}%`, animation: "none" }} />
        </div>
      </header>

      <div ref={scrollRef} className="relative flex-1 overflow-y-auto">
        <div className="mx-auto grid grid-cols-1 max-w-[1280px] gap-6 px-4 pb-32 pt-6 sm:px-6 sm:pt-8 lg:grid-cols-[minmax(0,1fr)_19rem] lg:pb-12">
          <div className="min-w-0">
            {overtime ? (
              <p className="ws-pop mb-4 flex items-center gap-3 rounded-2xl border border-ws-danger/30 bg-ws-danger/10 p-3.5 text-sm font-medium text-ws-danger-ink">
                <AlertIcon className="h-5 w-5 shrink-0" />
                Tempo oficial esgotado. Você pode continuar, mas o excedente será registrado.
              </p>
            ) : null}
            {error ? (
              <p role="alert" className="ws-pop mb-4 flex items-center gap-3 rounded-2xl border border-ws-danger/30 bg-ws-danger/10 p-3.5 text-sm font-medium text-ws-danger-ink">
                <AlertIcon className="h-5 w-5 shrink-0" />
                {error}
              </p>
            ) : null}

            <article key={q.id} className="ws-card ws-pop p-5 sm:p-8">
              <div className="flex flex-wrap items-center gap-2.5">
                <span className="font-mono text-sm font-semibold text-ws-ink">
                  {String(current + 1).padStart(2, "0")}
                  <span className="text-ws-subtle"> / {questions.length}</span>
                </span>
                <span className="ws-chip max-w-full"><span className="truncate">{q.domain}</span></span>
                <button
                  type="button"
                  onClick={() => toggleFlag(q.id)}
                  aria-pressed={Boolean(flagged[q.id])}
                  className={`ml-auto inline-flex h-8 items-center gap-1.5 rounded-lg px-2.5 text-xs font-semibold transition-colors ${
                    flagged[q.id]
                      ? "bg-ws-warn/15 text-ws-warn-ink ring-1 ring-inset ring-ws-warn/40"
                      : "text-ws-muted hover:bg-ws-line/5 hover:text-ws-ink"
                  }`}
                >
                  <FlagIcon className="h-3.5 w-3.5" />
                  {flagged[q.id] ? "Marcada" : "Marcar para revisão"}
                </button>
              </div>

              <h2 className="mt-5 text-pretty text-[1.1875rem] font-medium leading-[1.65] tracking-[-0.01em] text-ws-ink sm:text-[1.3125rem]">
                {q.prompt}
              </h2>
              {multi ? (
                <p className="mt-3 inline-flex items-center gap-1.5 rounded-lg bg-ws-indigo/10 px-2.5 py-1 text-xs font-semibold text-ws-indigo-ink">
                  <CheckCircleIcon className="h-3.5 w-3.5" />
                  Selecione todas as corretas
                </p>
              ) : null}

              <div className="mt-6 space-y-2.5" role={multi ? "group" : "radiogroup"} aria-label="Alternativas">
                {q.choices.map((c, index) => {
                  const selected = selectedIds.includes(c.id);
                  const letter = String.fromCharCode(65 + index);
                  return (
                    <button
                      key={c.id}
                      type="button"
                      data-choice
                      role={multi ? "checkbox" : "radio"}
                      aria-checked={selected}
                      onClick={() => toggleChoice(q.id, c.id, multi)}
                      className={`group flex w-full items-start gap-3.5 rounded-2xl border p-4 text-left text-[15px] leading-6 transition-all duration-200 sm:p-[1.125rem] ${
                        selected
                          ? "border-ws-accent bg-ws-accent/[0.08] text-ws-ink shadow-[0_0_0_3px_rgb(var(--ws-accent)/0.14)]"
                          : "border-ws-line/10 bg-ws-surface text-ws-text hover:-translate-y-px hover:border-ws-line/25 hover:shadow-sm"
                      }`}
                    >
                      <span
                        className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg font-mono text-xs font-semibold transition-colors ${
                          selected
                            ? "bg-gradient-to-br from-orange-400 to-orange-500 text-[#1a0d03]"
                            : "border border-ws-line/15 text-ws-muted group-hover:border-ws-line/30 group-hover:text-ws-ink"
                        }`}
                      >
                        {selected ? <CheckIcon className="h-3.5 w-3.5" strokeWidth={2.6} /> : letter}
                      </span>
                      <span className="pt-0.5">{c.text}</span>
                    </button>
                  );
                })}
              </div>

              {premium && q.hasHint ? (
                <div className="mt-5">
                  {hintShown ? (
                    <div className="ws-pop rounded-2xl border border-ws-warn/30 bg-ws-warn/10 p-4">
                      <p className="flex items-center gap-2 font-mono text-[11px] font-semibold uppercase tracking-wider text-ws-warn-ink">
                        <LightbulbIcon className="h-4 w-4" />
                        Dica de raciocínio · vale meio ponto
                      </p>
                      <p className="mt-2 text-sm leading-6 text-ws-text">{hintShown}</p>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => fetchHint(q.id)}
                      disabled={hintLoading}
                      className="inline-flex items-start gap-2 rounded-lg px-1 text-left text-sm font-medium text-ws-warn-ink underline decoration-dotted underline-offset-4 transition-opacity hover:opacity-80 disabled:opacity-50"
                    >
                      <LightbulbIcon className="mt-0.5 h-4 w-4 shrink-0" />
                      {hintLoading ? "Carregando dica…" : "Usar dica (a questão passa a valer meio ponto)"}
                    </button>
                  )}
                </div>
              ) : null}

              <div className="mt-8 flex items-center justify-between gap-3 border-t border-ws-line/[0.07] pt-5">
                <button type="button" onClick={() => goTo(Math.max(0, current - 1))} disabled={current === 0} aria-label="Questão anterior" className="ws-btn ws-btn-secondary">
                  <ArrowLeftIcon className="h-4 w-4" />
                  <span className="hidden sm:inline">Anterior</span>
                </button>
                <p className="hidden items-center gap-1.5 text-xs text-ws-subtle xl:flex">
                  <KeyboardIcon className="h-4 w-4" />
                  <span className="ws-kbd">A</span>–<span className="ws-kbd">D</span> responder
                  <span className="ws-kbd ml-2">←</span><span className="ws-kbd">→</span> navegar
                  <span className="ws-kbd ml-2">F</span> marcar
                </p>
                <button type="button" onClick={() => setNavigatorOpen(true)} aria-label={`Mapa de questões: ${answeredCount} de ${questions.length} respondidas`} className="ws-btn ws-btn-secondary lg:hidden">
                  <GridIcon className="h-4 w-4" />
                  <span className="font-mono text-xs">{answeredCount}/{questions.length}</span>
                </button>
                {isLast ? (
                  <button type="button" onClick={() => setDialog("submit")} className="ws-btn ws-btn-primary">
                    Revisar e entregar
                    <CheckIcon className="h-4 w-4" strokeWidth={2.4} />
                  </button>
                ) : (
                  <button type="button" onClick={() => goTo(current + 1)} className="ws-btn ws-btn-primary">
                    Próxima
                    <ArrowRightIcon className="h-4 w-4" />
                  </button>
                )}
              </div>
            </article>
          </div>

          <aside className="hidden lg:block">
            <div className="sticky top-8">{navigator}</div>
          </aside>
        </div>
      </div>

      {navigatorOpen ? (
        <div className="fixed inset-0 z-[70] flex items-end bg-black/50 backdrop-blur-sm lg:hidden" onClick={() => setNavigatorOpen(false)}>
          <div className="ws-pop max-h-[80vh] w-full overflow-y-auto rounded-t-[1.75rem] bg-ws-canvas p-4 pb-[max(1rem,env(safe-area-inset-bottom))]" onClick={(event) => event.stopPropagation()}>
            <div className="mx-auto mb-3 h-1 w-10 rounded-full bg-ws-line/20" />
            {navigator}
          </div>
        </div>
      ) : null}

      {dialog || phase === "submitting" ? (
        <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/55 p-4 backdrop-blur-sm" onClick={() => phase !== "submitting" && setDialog(null)}>
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="exam-dialog-title"
            className="ws-card ws-pop w-full max-w-md p-6 sm:p-7"
            onClick={(event) => event.stopPropagation()}
            onKeyDown={(event) => {
              if (event.key === "Escape" && phase !== "submitting") setDialog(null);
            }}
          >
            {phase === "submitting" ? (
              <div className="flex flex-col items-center py-4 text-center">
                <span className="relative flex h-14 w-14 items-center justify-center">
                  <span className="absolute inset-0 animate-spin rounded-full border-2 border-ws-line/10 border-t-ws-accent" />
                  <TargetIcon className="h-6 w-6 text-ws-accent-ink" />
                </span>
                <p id="exam-dialog-title" className="mt-5 text-lg font-semibold text-ws-ink">Corrigindo suas respostas…</p>
                <p className="mt-1 text-sm text-ws-muted">A correção é feita no servidor, como na prova real.</p>
              </div>
            ) : dialog === "submit" ? (
              <>
                <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-ws-accent/10 text-ws-accent-ink">
                  <CheckCircleIcon className="h-6 w-6" />
                </span>
                <h2 id="exam-dialog-title" className="mt-5 text-xl font-semibold tracking-[-0.02em] text-ws-ink">Entregar o simulado?</h2>
                <p className="mt-1.5 text-sm leading-6 text-ws-muted">
                  {unanswered > 0
                    ? `Você deixou ${unanswered} ${unanswered === 1 ? "questão" : "questões"} em branco. Questões em branco contam como erro.`
                    : "Todas as questões foram respondidas. Depois de entregar, não dá para alterar."}
                </p>
                <dl className="mt-5 grid grid-cols-3 gap-2">
                  <DialogStat label="Respondidas" value={answeredCount} tone="accent" />
                  <DialogStat label="Em branco" value={unanswered} tone={unanswered ? "danger" : "neutral"} />
                  <DialogStat label="Marcadas" value={flaggedCount} tone={flaggedCount ? "warn" : "neutral"} />
                </dl>
                <div className="mt-6 grid grid-cols-1 gap-2 sm:grid-cols-2">
                  <button type="button" onClick={() => setDialog(null)} className="ws-btn ws-btn-secondary">Continuar revisando</button>
                  <button type="button" onClick={submit} autoFocus className="ws-btn ws-btn-primary">Entregar agora</button>
                </div>
              </>
            ) : (
              <>
                <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-ws-danger/10 text-ws-danger-ink">
                  <AlertIcon className="h-6 w-6" />
                </span>
                <h2 id="exam-dialog-title" className="mt-5 text-xl font-semibold tracking-[-0.02em] text-ws-ink">Sair sem entregar?</h2>
                <p className="mt-1.5 text-sm leading-6 text-ws-muted">
                  {mode === "diagnostic"
                    ? "Você pode retomar o diagnóstico depois, com as mesmas questões, mas as respostas marcadas agora não são salvas."
                    : "Esta tentativa não será corrigida e suas respostas serão descartadas."}
                </p>
                <div className="mt-6 grid grid-cols-1 gap-2 sm:grid-cols-2">
                  <button type="button" onClick={() => setDialog(null)} autoFocus className="ws-btn ws-btn-secondary">Voltar à prova</button>
                  <button type="button" onClick={resetToIdle} className="ws-btn ws-btn-secondary !text-ws-danger-ink">Sair do simulado</button>
                </div>
              </>
            )}
          </div>
        </div>
      ) : null}
    </div>
  );
}

function isMulti(question: Question) {
  return question.prompt.includes("DUAS") || question.prompt.includes("Choose TWO");
}

function DialogStat({ label, value, tone }: { label: string; value: number; tone: "accent" | "danger" | "warn" | "neutral" }) {
  const color = {
    accent: "text-ws-accent-ink",
    danger: "text-ws-danger-ink",
    warn: "text-ws-warn-ink",
    neutral: "text-ws-ink",
  }[tone];
  return (
    <div className="ws-inset px-3 py-2.5 text-center">
      <dd className={`ws-num text-2xl ${color}`}>{value}</dd>
      <dt className="mt-1 text-[11px] text-ws-muted">{label}</dt>
    </div>
  );
}

function QuestionNavigator({
  questions,
  current,
  answers,
  flagged,
  answeredCount,
  flaggedCount,
  onGo,
}: {
  questions: Question[];
  current: number;
  answers: Record<string, string[]>;
  flagged: Record<string, boolean>;
  answeredCount: number;
  flaggedCount: number;
  onGo: (index: number) => void;
}) {
  return (
    <div className="ws-card p-4 sm:p-5">
      <div className="flex items-center justify-between">
        <p className="ws-eyebrow">Questões</p>
        <p className="font-mono text-xs text-ws-subtle">{answeredCount}/{questions.length}</p>
      </div>
      <div className="mt-4 grid grid-cols-8 gap-1.5 sm:grid-cols-10 lg:grid-cols-7">
        {questions.map((question, index) => {
          const answered = (answers[question.id] ?? []).length > 0;
          const isFlagged = Boolean(flagged[question.id]);
          const isCurrent = index === current;
          return (
            <button
              key={question.id}
              type="button"
              onClick={() => onGo(index)}
              aria-label={`Ir para questão ${index + 1}${answered ? ", respondida" : ""}${isFlagged ? ", marcada" : ""}`}
              aria-current={isCurrent ? "step" : undefined}
              className={`relative flex aspect-square items-center justify-center rounded-lg font-mono text-[11px] font-semibold transition-all ${
                isCurrent
                  ? "bg-ws-ink text-ws-canvas shadow-[0_0_0_3px_rgb(var(--ws-accent)/0.35)]"
                  : answered
                    ? "bg-ws-accent/15 text-ws-accent-ink hover:bg-ws-accent/25"
                    : "bg-ws-line/[0.05] text-ws-subtle hover:bg-ws-line/10 hover:text-ws-ink"
              }`}
            >
              {index + 1}
              {isFlagged ? <span className="absolute -right-0.5 -top-0.5 h-2.5 w-2.5 rounded-full border-2 border-ws-surface bg-ws-warn" /> : null}
            </button>
          );
        })}
      </div>
      <div className="mt-4 flex flex-wrap gap-x-4 gap-y-1.5 border-t border-ws-line/[0.07] pt-4 text-[11px] text-ws-muted">
        <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-[4px] bg-ws-accent/40" />Respondida</span>
        <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-full bg-ws-warn" />Marcada ({flaggedCount})</span>
        <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-[4px] bg-ws-line/15" />Em branco</span>
      </div>
    </div>
  );
}

/* ================================================================ idle */

function IdleView({
  certId,
  certCode,
  certShort,
  domains,
  fullDurationMinutes,
  fullQuestionCount,
  premium,
  history,
  average,
  readyScore,
  domainStats,
  loading,
  loadingTarget,
  error,
  onStart,
}: {
  certId: string;
  certCode: string;
  certShort: string;
  domains: readonly string[];
  fullDurationMinutes: number;
  fullQuestionCount: number;
  premium: boolean;
  history: Array<{ score: number; completedAt: string }>;
  average: number | null;
  readyScore: number;
  domainStats: Array<{ domain: string; pct: number }>;
  loading: boolean;
  loadingTarget: string | null;
  error: string | null;
  onStart: (mode: Mode, domain?: string) => void;
}) {
  const statByDomain = new Map(domainStats.map((stat) => [stat.domain, stat.pct]));
  const weakest = domainStats[0]?.domain ?? null;
  const recent = history.slice(-8);

  return (
    <div className="space-y-5">
      <section className="ws-ink ws-rise p-6 sm:p-8 xl:p-10" aria-labelledby="simulado-title">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-[minmax(0,1fr)_18rem] lg:items-end">
          <div>
            <div className="flex items-center gap-3">
              <CertEmblem certId={certId} size="md" />
              <p className="ws-eyebrow !text-orange-200/80">{certCode} · Centro de simulados</p>
            </div>
            <h1 id="simulado-title" className="mt-5 text-balance text-[1.9rem] font-semibold leading-[1.08] tracking-[-0.04em] text-white sm:text-[2.5rem]">
              Treine como no dia da prova.
              <span className="block text-slate-400">{certShort}, no formato oficial.</span>
            </h1>
            <p className="mt-4 max-w-xl text-[15px] leading-7 text-slate-400">
              As respostas só aparecem depois da correção, como na prova real. O cronômetro continua em negativo se o tempo acabar: você decide quando entregar.
            </p>
            <div className="mt-6 flex flex-wrap gap-2">
              <span className="ws-chip-glass"><TargetIcon className="h-3.5 w-3.5 text-orange-300" />{fullQuestionCount} questões</span>
              <span className="ws-chip-glass"><ClockIcon className="h-3.5 w-3.5 text-orange-300" />{fullDurationMinutes} min</span>
              <span className="ws-chip-glass"><CheckCircleIcon className="h-3.5 w-3.5 text-emerald-300" />Aprovação ~{PASS_SCORE}%</span>
            </div>
          </div>

          {premium ? (
            <div className="ws-glass p-4">
              <div className="flex items-baseline justify-between">
                <p className="ws-eyebrow !text-slate-400">Seu histórico</p>
                <p className="font-mono text-[11px] text-slate-500">meta {readyScore}%</p>
              </div>
              <p className="mt-2 flex items-baseline gap-2">
                <span className="ws-num text-4xl text-white">{average === null ? "—" : `${average}%`}</span>
                <span className="text-xs text-slate-400">média recente</span>
              </p>
              {recent.length ? (
                <div className="relative mt-4 flex h-16 items-end gap-1.5">
                  <span className="absolute inset-x-0 border-t border-dashed border-emerald-400/50" style={{ bottom: `${PASS_SCORE}%` }} />
                  {recent.map((point, index) => (
                    <span
                      key={`${point.completedAt}-${index}`}
                      title={`${point.score}%`}
                      className={`relative flex-1 rounded-t-md ${point.score >= PASS_SCORE ? "bg-gradient-to-t from-emerald-500/60 to-emerald-300" : "bg-gradient-to-t from-orange-500/60 to-orange-300"}`}
                      style={{ height: `${Math.max(6, point.score)}%` }}
                    />
                  ))}
                </div>
              ) : (
                <p className="mt-3 text-xs leading-5 text-slate-400">Faça seu primeiro simulado completo para começar a medir sua prontidão.</p>
              )}
            </div>
          ) : (
            <div className="ws-glass p-4">
              <p className="flex items-center gap-2 text-sm font-semibold text-white">
                <SparkIcon className="h-4 w-4 text-orange-300" />
                1 diagnóstico gratuito
              </p>
              <p className="mt-1.5 text-xs leading-5 text-slate-400">30 questões em 45 minutos, na certificação que você escolher. A pontuação sai na hora.</p>
            </div>
          )}
        </div>
      </section>

      {error ? (
        <p role="alert" className="ws-card ws-pop flex items-center gap-3 border-ws-danger/30 p-4 text-sm font-medium text-ws-danger-ink">
          <AlertIcon className="h-5 w-5 shrink-0" />
          {error}
        </p>
      ) : null}

      {!premium ? (
        <ModeCard
          featured
          icon={<SparkIcon className="h-5 w-5" />}
          eyebrow="Comece sem compromisso"
          title="Diagnóstico gratuito"
          text="Sua tentativa gratuita: 30 questões em 45 minutos. A análise por domínio, a revisão das respostas e o plano de estudos ficam no Premium."
          specs={["30 questões", "45 min", "Pontuação imediata"]}
          action={
            <button type="button" onClick={() => onStart("diagnostic")} disabled={loading} className="ws-btn ws-btn-primary ws-btn-lg">
              <PlayIcon className="h-4 w-4" />
              {loading ? "Preparando…" : "Fazer diagnóstico gratuito"}
            </button>
          }
        />
      ) : null}

      <div className={`grid grid-cols-1 gap-5 ${premium ? "xl:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)]" : "lg:grid-cols-2"}`}>
        <ModeCard
          featured={premium}
          locked={!premium}
          icon={<PracticeIcon className="h-5 w-5" />}
          eyebrow="Modo prova"
          title="Simulado completo"
          text={`Formato oficial: ${fullQuestionCount} questões em ${fullDurationMinutes} minutos, com análise de tempo por questão e plano de recuperação.`}
          specs={[`${fullQuestionCount} questões`, `${fullDurationMinutes} min`, "+100 XP", `+50 XP se ≥ ${PASS_SCORE}%`]}
          note="Dicas disponíveis, mas a questão passa a valer meio ponto."
          perks={["Explicação de cada alternativa", "Tempo gasto por questão", "Desempenho por domínio", "Plano de recuperação na trilha"]}
          action={
            premium ? (
              <button type="button" onClick={() => onStart("full")} disabled={loading} className="ws-btn ws-btn-primary ws-btn-lg">
                <PlayIcon className="h-4 w-4" />
                {loading && loadingTarget === "full" ? "Preparando…" : "Iniciar simulado completo"}
              </button>
            ) : (
              <Link href="/pricing" className="ws-btn ws-btn-secondary">
                <LockIcon className="h-4 w-4" />
                Desbloquear no Premium
              </Link>
            )
          }
        />

        <div className={`ws-card ws-rise p-6 sm:p-7 ${premium ? "" : "opacity-95"}`} style={{ "--d": 2 } as CSSProperties}>
          <div className="flex items-start justify-between gap-4">
            <span className={`flex h-11 w-11 items-center justify-center rounded-2xl ${premium ? "bg-ws-accent/10 text-ws-accent-ink" : "bg-ws-line/[0.06] text-ws-subtle"}`}>
              {premium ? <TargetIcon className="h-5 w-5" /> : <LockIcon className="h-5 w-5" />}
            </span>
            <span className="ws-chip font-mono">até 20 questões · 30 min</span>
          </div>
          <p className="ws-eyebrow mt-5">Treino direcionado</p>
          <h2 className="ws-h2 mt-1.5">Prática por domínio</h2>
          <p className="mt-2 text-sm leading-6 text-ws-muted">Ataque o domínio em que você está mais fraco, sem a pressão da prova inteira.</p>
          {premium ? (
            <ul className="mt-5 space-y-2">
              {domains.map((domain) => {
                const pct = statByDomain.get(domain);
                const busy = loading && loadingTarget === domain;
                return (
                  <li key={domain}>
                    <button
                      type="button"
                      onClick={() => onStart("domain", domain)}
                      disabled={loading}
                      className="group flex min-h-12 w-full items-center gap-3 rounded-xl border border-ws-line/10 bg-ws-raised px-3.5 py-2.5 text-left transition-all hover:-translate-y-px hover:border-ws-accent/40 disabled:opacity-60"
                    >
                      <span className="min-w-0 flex-1">
                        <span className="flex items-center gap-2">
                          <span className="truncate text-sm font-medium text-ws-ink">{domain}</span>
                          {domain === weakest ? <span className="ws-chip ws-chip-danger !h-5 !px-1.5 !text-[10px]">mais fraco</span> : null}
                        </span>
                        {pct !== undefined ? (
                          <span className="mt-1.5 flex items-center gap-2">
                            <span className="ws-bar flex-1 !h-1">
                              <span className={pct < PASS_SCORE ? "!bg-gradient-to-r !from-rose-500 !to-orange-400" : "!bg-gradient-to-r !from-emerald-500 !to-emerald-300"} style={{ width: `${pct}%` }} />
                            </span>
                            <span className="font-mono text-[11px] text-ws-subtle">{pct}%</span>
                          </span>
                        ) : null}
                      </span>
                      <span className="text-ws-subtle transition-transform group-hover:translate-x-0.5 group-hover:text-ws-accent-ink">
                        {busy ? <RotateIcon className="h-4 w-4 animate-spin" /> : <ArrowRightIcon className="h-4 w-4" />}
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>
          ) : (
            <Link href="/pricing" className="ws-btn ws-btn-secondary mt-6">
              <LockIcon className="h-4 w-4" />
              Ver acesso Premium
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}

function ModeCard({
  featured = false,
  locked = false,
  icon,
  eyebrow,
  title,
  text,
  specs,
  note,
  perks,
  action,
}: {
  featured?: boolean;
  locked?: boolean;
  icon: React.ReactNode;
  eyebrow: string;
  title: string;
  text: string;
  specs: string[];
  note?: string;
  perks?: string[];
  action: React.ReactNode;
}) {
  return (
    <div
      className={`ws-card ws-rise relative overflow-hidden p-6 sm:p-7 ${featured ? "!border-ws-accent/40" : ""}`}
      style={{ "--d": 1 } as CSSProperties}
    >
      {featured ? (
        <div aria-hidden="true" className="pointer-events-none absolute -right-24 -top-24 h-64 w-64 rounded-full bg-ws-accent/15 blur-3xl" />
      ) : null}
      <div className="relative flex h-full flex-col">
        <span
          className={`flex h-11 w-11 items-center justify-center rounded-2xl ${
            locked
              ? "bg-ws-line/[0.06] text-ws-subtle"
              : featured
                ? "bg-gradient-to-br from-orange-300 to-orange-500 text-[#1a0d03] shadow-[0_10px_22px_-10px_rgba(249,115,22,.9)]"
                : "bg-ws-accent/10 text-ws-accent-ink"
          }`}
        >
          {locked ? <LockIcon className="h-5 w-5" /> : icon}
        </span>
        <p className="ws-eyebrow mt-5">{eyebrow}</p>
        <h2 className="ws-h2 mt-1.5 !text-[1.375rem]">{title}</h2>
        <p className="mt-2 max-w-xl text-sm leading-6 text-ws-muted">{text}</p>
        <div className="mt-5 flex flex-wrap gap-1.5">
          {specs.map((spec) => (
            <span key={spec} className={`ws-chip ${spec.includes("XP") ? "ws-chip-accent" : ""}`}>
              {spec.includes("XP") ? <BoltIcon className="h-3 w-3" /> : null}
              {spec}
            </span>
          ))}
        </div>
        {perks?.length ? (
          <ul className="mt-6 grid grid-cols-1 gap-2.5 border-t border-ws-line/[0.07] pt-5 sm:grid-cols-2">
            {perks.map((perk) => (
              <li key={perk} className="flex items-start gap-2.5 text-sm text-ws-text">
                <span className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full ${locked ? "bg-ws-line/[0.06] text-ws-subtle" : "bg-ws-success/15 text-ws-success-ink"}`}>
                  <CheckIcon className="h-3 w-3" strokeWidth={2.8} />
                </span>
                {perk}
              </li>
            ))}
          </ul>
        ) : null}
        {note ? (
          <p className="mt-5 flex items-center gap-2 text-xs text-ws-warn-ink">
            <LightbulbIcon className="h-3.5 w-3.5" />
            {note}
          </p>
        ) : null}
        <div className="mt-auto pt-7">{action}</div>
      </div>
    </div>
  );
}

/* ================================================================ results */

function ResultsView({
  results,
  certId,
  certCode,
  mode,
  domainLabel,
  elapsed,
  onRestart,
}: {
  results: Results;
  certId: string;
  certCode: string;
  mode: Mode;
  domainLabel: string | null;
  elapsed: number | null;
  onRestart: () => void;
}) {
  const passed = results.score >= PASS_SCORE;
  const wrong = results.total - results.correctCount;
  const [filter, setFilter] = useState<"wrong" | "right" | "all">(wrong > 0 ? "wrong" : "all");
  const review = results.review ?? [];
  const filtered = review.filter((item) => (filter === "all" ? true : filter === "wrong" ? !item.correct : item.correct));
  const domainEntries = Object.entries(results.domainBreakdown ?? {})
    .map(([domain, { correct, total }]) => ({ domain, correct, total, pct: Math.round((correct / total) * 100) }))
    .sort((a, b) => a.pct - b.pct);
  const maxSlow = Math.max(1, ...(results.slowest ?? []).map((item) => item.timeSeconds));

  return (
    <div className="space-y-5">
      <section className={`ws-ink ws-rise p-6 sm:p-8 xl:p-10 ${passed ? "ws-ink-success" : ""}`} aria-labelledby="results-title">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-center">
          <div>
            <p className={`ws-eyebrow ${passed ? "!text-emerald-200/80" : "!text-orange-200/80"}`}>
              Resultado · {MODE_LABEL[mode]} · {certCode}{domainLabel ? ` · ${domainLabel}` : ""}
            </p>
            <h1 id="results-title" className="mt-4 text-balance text-[1.9rem] font-semibold leading-[1.08] tracking-[-0.04em] text-white sm:text-[2.5rem]">
              {passed ? "Acima da linha de aprovação." : "Ainda abaixo da linha de aprovação."}
              <span className="block text-slate-400">
                {passed ? "Mantenha o ritmo até a prova." : "O plano de recuperação está logo abaixo."}
              </span>
            </h1>
            <div className="mt-6 flex flex-wrap gap-2">
              <span className="ws-chip-glass"><CheckCircleIcon className="h-3.5 w-3.5 text-emerald-300" />{results.correctCount} de {results.total} corretas</span>
              {elapsed !== null ? <span className="ws-chip-glass"><ClockIcon className="h-3.5 w-3.5 text-orange-300" />{formatDuration(elapsed)}</span> : null}
              {results.hintsUsedCount > 0 ? (
                <span className="ws-chip-glass"><LightbulbIcon className="h-3.5 w-3.5 text-amber-300" />{results.hintsUsedCount} dica(s) · sem penalidade: {results.scoreNoPenalty}%</span>
              ) : null}
              {results.overtimeSeconds > 0 ? (
                <span className="ws-chip-glass !border-rose-400/30 !text-rose-200"><AlertIcon className="h-3.5 w-3.5" />+{formatDuration(results.overtimeSeconds)} além do tempo</span>
              ) : null}
            </div>
            <div className="mt-7 flex flex-wrap gap-3">
              <button type="button" onClick={onRestart} className="ws-btn ws-btn-primary">
                <RotateIcon className="h-4 w-4" />
                Fazer outro simulado
              </button>
              {review.length ? (
                <a href="#revisao" className="ws-btn ws-btn-glass">Revisar questões</a>
              ) : null}
            </div>
          </div>

          <div className="mx-auto flex flex-col items-center">
            <ProgressRing
              id="result-score"
              size={196}
              rings={[{ value: results.score, tone: passed ? "success" : "accent", width: 14, marker: PASS_SCORE }]}
              glass
              label={`Nota final ${results.score}%`}
            >
              <span className="ws-num text-[3.5rem] text-white">{results.score}<span className="text-2xl text-slate-400">%</span></span>
              <span className="mt-1 font-mono text-[11px] uppercase tracking-wider text-slate-400">nota final</span>
            </ProgressRing>
            <p className="mt-3 flex items-center gap-2 font-mono text-[11px] text-slate-400">
              <span className="h-3 w-0.5 rounded-full bg-white/70" />
              linha de aprovação · {PASS_SCORE}%
            </p>
          </div>
        </div>
      </section>

      {!results.premiumInsights ? (
        <div className="ws-card ws-rise relative overflow-hidden p-6 text-center sm:p-10" style={{ "--d": 1 } as CSSProperties}>
          <div aria-hidden="true" className="pointer-events-none absolute left-1/2 top-0 h-40 w-[28rem] -translate-x-1/2 rounded-full bg-ws-accent/15 blur-3xl" />
          <div className="relative">
            <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-ws-ink text-ws-canvas shadow-lg">
              <LockIcon className="h-5 w-5" />
            </span>
            <p className="ws-eyebrow ws-eyebrow-accent mt-5">Seu próximo passo</p>
            <h2 className="mt-2 text-balance text-2xl font-semibold tracking-[-0.03em] text-ws-ink">Veja onde você errou e o que estudar</h2>
            <p className="mx-auto mt-2 max-w-xl text-sm leading-6 text-ws-muted">
              O Premium libera desempenho por domínio, explicação de cada resposta, recomendações de módulos, dicas e simulados ilimitados.
            </p>
            <Link href={results.upgradeUrl ?? "/pricing"} className="ws-btn ws-btn-primary ws-btn-lg mt-6">
              Desbloquear análise completa
              <ArrowRightIcon className="h-4 w-4" />
            </Link>
          </div>
        </div>
      ) : null}

      {domainEntries.length || (results.recommendations?.length ?? 0) > 0 ? (
        <div className="grid grid-cols-1 gap-5 xl:grid-cols-2 xl:items-start">
          {domainEntries.length ? (
            <div className="ws-card ws-rise p-5 sm:p-6" style={{ "--d": 1 } as CSSProperties}>
              <p className="ws-eyebrow">Diagnóstico</p>
              <h2 className="ws-h2 mt-1.5">Desempenho por domínio</h2>
              <ul className="mt-6 space-y-5">
                {domainEntries.map(({ domain, correct, total, pct }, index) => (
                  <li key={domain}>
                    <div className="mb-2 flex items-baseline justify-between gap-3">
                      <span className="min-w-0 truncate text-sm font-medium text-ws-ink">{domain}</span>
                      <span className="shrink-0 font-mono text-xs text-ws-subtle">
                        {correct}/{total} · <span className={`font-semibold ${pct < PASS_SCORE ? "text-ws-danger-ink" : "text-ws-success-ink"}`}>{pct}%</span>
                      </span>
                    </div>
                    <div className="relative">
                      <div className={`ws-bar ws-bar-lg ${pct < PASS_SCORE ? "ws-bar-danger" : "ws-bar-success"}`}>
                        {pct > 0 ? <span style={{ width: `${pct}%`, "--d": index } as CSSProperties} /> : null}
                      </div>
                      <span className="absolute -bottom-1 -top-1 w-px bg-ws-ink/40" style={{ left: `${PASS_SCORE}%` }} />
                    </div>
                  </li>
                ))}
              </ul>
              <p className="mt-5 flex items-center gap-2 font-mono text-[11px] text-ws-subtle">
                <span className="h-3 w-px bg-ws-ink/40" /> linha de aprovação ({PASS_SCORE}%)
              </p>
            </div>
          ) : null}

          {(results.recommendations?.length ?? 0) > 0 ? (
            <div className="ws-card ws-rise relative overflow-hidden p-5 sm:p-6" style={{ "--d": 2 } as CSSProperties}>
              <div aria-hidden="true" className="pointer-events-none absolute -right-20 -top-20 h-56 w-56 rounded-full bg-ws-accent/10 blur-3xl" />
              <div className="relative">
                <p className="ws-eyebrow ws-eyebrow-accent">Plano de recuperação</p>
                <h2 className="ws-h2 mt-1.5">O que estudar antes do próximo simulado</h2>
                <ol className="mt-5 space-y-4">
                  {results.recommendations!.map((rec, index) => (
                    <li key={rec.domain} className="ws-inset p-4">
                      <div className="flex items-center gap-3">
                        <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-ws-ink font-mono text-xs font-semibold text-ws-canvas">{index + 1}</span>
                        <span className="min-w-0 flex-1 truncate text-sm font-semibold text-ws-ink">{rec.domain}</span>
                        <span className="ws-chip ws-chip-danger font-mono !h-6">{rec.pct}%</span>
                      </div>
                      <ul className="mt-3 space-y-1">
                        {rec.modules.map((m) => (
                          <li key={m.slug}>
                            <Link href={`/course/${certId}/${m.slug}`} className="group flex items-center gap-2 rounded-lg px-2 py-1.5 text-sm text-ws-text transition-colors hover:bg-ws-surface hover:text-ws-ink">
                              <ArrowRightIcon className="h-3.5 w-3.5 text-ws-accent-ink transition-transform group-hover:translate-x-0.5" />
                              <span className="truncate">{m.title}</span>
                            </Link>
                          </li>
                        ))}
                      </ul>
                    </li>
                  ))}
                </ol>
              </div>
            </div>
          ) : null}
        </div>
      ) : null}

      {(results.slowest?.length ?? 0) > 0 ? (
        <div className="ws-card ws-rise p-5 sm:p-6" style={{ "--d": 3 } as CSSProperties}>
          <p className="ws-eyebrow">Gestão de tempo</p>
          <h2 className="ws-h2 mt-1.5">Onde você levou mais tempo</h2>
          <ul className="mt-5 space-y-3">
            {results.slowest!.map((s, i) => (
              <li key={i} className="flex items-center gap-4">
                <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${s.correct ? "bg-ws-success/15 text-ws-success-ink" : "bg-ws-danger/15 text-ws-danger-ink"}`}>
                  {s.correct ? <CheckIcon className="h-4 w-4" strokeWidth={2.4} /> : <XIcon className="h-4 w-4" strokeWidth={2.4} />}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm text-ws-ink">{s.prompt}</span>
                  <span className="mt-1.5 flex items-center gap-3">
                    <span className="ws-bar flex-1">
                      <span className="!bg-gradient-to-r !from-slate-400 !to-slate-300 dark:!from-slate-500 dark:!to-slate-400" style={{ width: `${(s.timeSeconds / maxSlow) * 100}%` }} />
                    </span>
                    <span className="w-16 shrink-0 text-right font-mono text-xs font-semibold text-ws-ink">{formatDuration(s.timeSeconds)}</span>
                  </span>
                  <span className="mt-1 block truncate text-[11px] text-ws-subtle">{s.domain}{s.hintUsed ? " · usou dica" : ""}</span>
                </span>
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      {review.length ? (
        <section id="revisao" className="ws-card scroll-mt-6 p-5 sm:p-6" aria-labelledby="review-title">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="ws-eyebrow">Revisão</p>
              <h2 id="review-title" className="ws-h2 mt-1.5">Questão por questão</h2>
            </div>
            <div role="tablist" aria-label="Filtrar questões" className="flex gap-1 rounded-xl bg-ws-line/[0.05] p-1">
              {([
                ["wrong", `Erradas (${wrong})`],
                ["right", `Certas (${results.correctCount})`],
                ["all", `Todas (${results.total})`],
              ] as const).map(([value, label]) => (
                <button
                  key={value}
                  type="button"
                  role="tab"
                  aria-selected={filter === value}
                  onClick={() => setFilter(value)}
                  className={`h-8 rounded-lg px-3 text-xs font-semibold transition-colors ${filter === value ? "bg-ws-surface text-ws-ink shadow-sm" : "text-ws-muted hover:text-ws-ink"}`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          <div className="mt-5 space-y-3">
            {filtered.map((item, index) => (
              <details key={item.questionId} className="group rounded-2xl border border-ws-line/[0.08] bg-ws-raised/60 open:bg-ws-surface" open={!item.correct && index < 2}>
                <summary className="flex cursor-pointer list-none items-start gap-3 p-4 [&::-webkit-details-marker]:hidden">
                  <span className={`mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg ${item.correct ? "bg-ws-success/15 text-ws-success-ink" : "bg-ws-danger/15 text-ws-danger-ink"}`}>
                    {item.correct ? <CheckIcon className="h-3.5 w-3.5" strokeWidth={2.6} /> : <XIcon className="h-3.5 w-3.5" strokeWidth={2.6} />}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-sm font-medium leading-6 text-ws-ink">{item.prompt}</span>
                    <span className="mt-1 block font-mono text-[11px] text-ws-subtle">
                      {item.domain}
                      {item.timeSeconds !== null ? ` · ${formatDuration(item.timeSeconds)}` : ""}
                      {item.hintUsed ? " · dica usada (meio ponto)" : ""}
                      {item.yourChoiceIds.length === 0 ? <span className="ml-2 rounded bg-ws-line/10 px-1.5 py-0.5 uppercase tracking-wider text-ws-muted">em branco</span> : null}
                    </span>
                  </span>
                  <ChevronDownIcon className="mt-1 h-4 w-4 shrink-0 text-ws-subtle transition-transform group-open:rotate-180" />
                </summary>
                <div className="px-4 pb-4 sm:pl-14">
                  <ul className="space-y-2">
                    {item.choices.map((c) => {
                      const isCorrect = item.correctChoiceIds.includes(c.id);
                      const wasChosen = item.yourChoiceIds.includes(c.id);
                      return (
                        <li
                          key={c.id}
                          className={`flex items-start gap-3 rounded-xl border px-3.5 py-2.5 text-sm leading-6 ${
                            isCorrect
                              ? "border-ws-success/40 bg-ws-success/10 text-ws-ink"
                              : wasChosen
                                ? "border-ws-danger/35 bg-ws-danger/[0.08] text-ws-ink"
                                : "border-ws-line/[0.08] text-ws-muted"
                          }`}
                        >
                          <span className="mt-1 shrink-0">
                            {isCorrect ? (
                              <CheckCircleIcon className="h-4 w-4 text-ws-success-ink" />
                            ) : wasChosen ? (
                              <XCircleIcon className="h-4 w-4 text-ws-danger-ink" />
                            ) : (
                              <span className="block h-4 w-4 rounded-full border border-ws-line/20" />
                            )}
                          </span>
                          <span className="min-w-0 flex-1">
                            {c.text}
                            {isCorrect || wasChosen ? (
                              <span className={`ml-2 whitespace-nowrap font-mono text-[10px] uppercase tracking-wider ${isCorrect ? "text-ws-success-ink" : "text-ws-danger-ink"}`}>
                                {isCorrect && wasChosen ? "sua resposta · correta" : isCorrect ? "correta" : "sua resposta"}
                              </span>
                            ) : null}
                          </span>
                        </li>
                      );
                    })}
                  </ul>
                  {item.explanation ? (
                    <div className="mt-3 rounded-xl border border-ws-indigo/20 bg-ws-indigo/[0.07] p-4">
                      <p className="flex items-center gap-2 font-mono text-[10px] font-semibold uppercase tracking-wider text-ws-indigo-ink">
                        <LightbulbIcon className="h-3.5 w-3.5" />
                        Explicação
                      </p>
                      <p className="mt-1.5 text-sm leading-6 text-ws-text">{item.explanation}</p>
                    </div>
                  ) : null}
                </div>
              </details>
            ))}
            {filtered.length === 0 ? (
              <p className="rounded-2xl border border-dashed border-ws-line/15 p-6 text-center text-sm text-ws-muted">Nenhuma questão neste filtro.</p>
            ) : null}
          </div>
        </section>
      ) : null}
    </div>
  );
}
