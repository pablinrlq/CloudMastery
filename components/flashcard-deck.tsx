"use client";

import { useCallback, useEffect, useMemo, useState, useTransition } from "react";
import { markFlashcard } from "@/app/(app)/flashcards/actions";
import { ProgressRing } from "@/components/progress-ring";
import { CardsIcon, CheckIcon, KeyboardIcon, RotateIcon, SparkIcon } from "@/components/ui-icons";

export type Flashcard = {
  id: string;
  domain: string | null;
  front: string;
  back: string;
  status: "new" | "review_later" | "known";
};

type Verdict = "known" | "review_later";

export function FlashcardDeck({ cards }: { cards: Flashcard[] }) {
  // review_later and new cards first; known ones at the end
  const ordered = useMemo(() => {
    const weight = { review_later: 0, new: 1, known: 2 } as const;
    return [...cards].sort((a, b) => weight[a.status] - weight[b.status]);
  }, [cards]);

  const [session, setSession] = useState<Flashcard[]>(ordered);
  const [index, setIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [done, setDone] = useState<Record<string, Verdict>>({});
  const [, startTransition] = useTransition();

  const card = session[index];
  const finished = index >= session.length;

  const mark = useCallback(
    (status: Verdict) => {
      if (!card) return;
      setDone((d) => ({ ...d, [card.id]: status }));
      startTransition(() => {
        markFlashcard(card.id, status);
      });
      setFlipped(false);
      setIndex((i) => i + 1);
    },
    [card]
  );

  // Espaço/Enter viram; 1 ou ← = revisar depois; 2 ou → = sei essa.
  useEffect(() => {
    if (finished || !card) return;
    function onKey(event: KeyboardEvent) {
      const target = event.target as HTMLElement | null;
      if (event.metaKey || event.ctrlKey || event.altKey) return;
      if (target && /^(INPUT|TEXTAREA|SELECT)$/.test(target.tagName)) return;
      if (event.key === " " || event.key === "Enter") {
        // Deixa botões e links reagirem normalmente ao Enter/Espaço.
        if (target && /^(BUTTON|A)$/.test(target.tagName)) return;
        event.preventDefault();
        setFlipped((value) => !value);
      } else if (flipped && (event.key === "1" || event.key === "ArrowLeft")) {
        mark("review_later");
      } else if (flipped && (event.key === "2" || event.key === "ArrowRight")) {
        mark("known");
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [finished, card, flipped, mark]);

  if (!ordered.length) {
    return (
      <div className="ws-card flex flex-col items-center p-10 text-center">
        <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-ws-accent/10 text-ws-accent-ink">
          <CardsIcon className="h-5 w-5" />
        </span>
        <p className="mt-4 font-semibold text-ws-ink">Nenhum flashcard disponível ainda.</p>
      </div>
    );
  }

  const knownCount = Object.values(done).filter((s) => s === "known").length;
  const reviewCount = Object.values(done).filter((s) => s === "review_later").length;

  function restart(subset: Flashcard[]) {
    setSession(subset);
    setIndex(0);
    setFlipped(false);
    setDone({});
  }

  if (finished) {
    const reviewCards = session.filter((item) => done[item.id] === "review_later");
    const pct = session.length ? Math.round((knownCount / session.length) * 100) : 0;
    return (
      <div className="ws-card ws-pop relative overflow-hidden p-8 text-center sm:p-12">
        <div aria-hidden="true" className="pointer-events-none absolute left-1/2 top-0 h-48 w-[30rem] -translate-x-1/2 rounded-full bg-ws-success/15 blur-3xl" />
        <div className="relative flex flex-col items-center">
          <ProgressRing
            id="deck-result"
            size={148}
            rings={[{ value: pct, tone: pct >= 70 ? "success" : "accent", width: 11 }]}
            label={`${pct}% dos cartões dominados`}
          >
            <span className="ws-num text-4xl text-ws-ink">{pct}<span className="text-xl text-ws-subtle">%</span></span>
            <span className="font-mono text-[10px] uppercase tracking-wider text-ws-subtle">dominados</span>
          </ProgressRing>
          <h2 className="mt-6 text-2xl font-semibold tracking-[-0.03em] text-ws-ink">Sessão concluída!</h2>
          <p className="mt-2 text-sm text-ws-muted">
            {knownCount} de {session.length} marcados como “sei”
            {reviewCount ? ` · ${reviewCount} para revisar` : ""}.
          </p>
          <div className="mt-7 flex flex-wrap justify-center gap-3">
            {reviewCards.length ? (
              <button type="button" onClick={() => restart(reviewCards)} className="ws-btn ws-btn-primary">
                <RotateIcon className="h-4 w-4" />
                Revisar os {reviewCards.length} difíceis
              </button>
            ) : null}
            <button type="button" onClick={() => restart(ordered)} className={`ws-btn ${reviewCards.length ? "ws-btn-secondary" : "ws-btn-primary"}`}>
              <CardsIcon className="h-4 w-4" />
              Revisar o baralho todo
            </button>
          </div>
        </div>
      </div>
    );
  }

  const progress = ((index + 1) / session.length) * 100;

  return (
    <div className="mx-auto max-w-3xl">
      <div className="flex items-center justify-between gap-4">
        <p className="font-mono text-sm text-ws-ink">
          {String(index + 1).padStart(2, "0")}
          <span className="text-ws-subtle"> / {session.length}</span>
        </p>
        <div className="flex items-center gap-2">
          <span className="ws-chip ws-chip-success font-mono"><CheckIcon className="h-3.5 w-3.5" strokeWidth={2.4} />{knownCount}</span>
          <span className="ws-chip ws-chip-warn font-mono"><RotateIcon className="h-3.5 w-3.5" />{reviewCount}</span>
        </div>
      </div>
      <div className="ws-bar mt-3">
        <span style={{ width: `${progress}%`, animation: "none", transition: "width 400ms var(--ws-ease)" }} />
      </div>

      <div className="relative mt-8">
        <div aria-hidden="true" className="absolute inset-x-8 -bottom-3 top-3 rounded-[1.75rem] border border-ws-line/[0.06] bg-ws-surface/70 shadow-sm" />
        <div aria-hidden="true" className="absolute inset-x-4 -bottom-1.5 top-1.5 rounded-[1.75rem] border border-ws-line/[0.07] bg-ws-surface/90 shadow-sm" />

        <div
          key={card.id}
          role="button"
          tabIndex={0}
          data-flashcard
          onClick={() => setFlipped((value) => !value)}
          aria-pressed={flipped}
          aria-label={flipped ? `Resposta: ${card.back}. Clique para ver a pergunta.` : `Pergunta: ${card.front}. Clique para revelar a resposta.`}
          className="ws-flip-scene ws-pop relative block w-full cursor-pointer rounded-[1.75rem] text-left"
        >
          <div className="ws-flip-card min-h-[24rem] sm:min-h-[25rem]" data-flipped={flipped}>
            <CardFace
              label="Pergunta"
              domain={card.domain}
              status={card.status}
              text={card.front}
              hint="Toque para revelar a resposta"
              front
            />
            <CardFace label="Resposta" domain={card.domain} status={card.status} text={card.back} hint="Toque para ver a pergunta" />
          </div>
        </div>
      </div>

      <div className="mt-8 grid grid-cols-2 gap-3">
        <button
          type="button"
          onClick={() => mark("review_later")}
          disabled={!flipped}
          className="ws-btn ws-btn-lg border border-ws-warn/30 bg-ws-warn/10 text-ws-warn-ink hover:-translate-y-px hover:bg-ws-warn/15"
        >
          <RotateIcon className="h-4 w-4" />
          Revisar depois
          <span className="ws-kbd ml-1 hidden sm:inline-flex">1</span>
        </button>
        <button
          type="button"
          onClick={() => mark("known")}
          disabled={!flipped}
          className="ws-btn ws-btn-lg border border-ws-success/30 bg-ws-success/10 text-ws-success-ink hover:-translate-y-px hover:bg-ws-success/15"
        >
          <CheckIcon className="h-4 w-4" strokeWidth={2.4} />
          Sei essa!
          <span className="ws-kbd ml-1 hidden sm:inline-flex">2</span>
        </button>
      </div>
      <p className="mt-4 hidden items-center justify-center gap-1.5 text-xs text-ws-subtle sm:flex">
        <KeyboardIcon className="h-4 w-4" />
        <span className="ws-kbd">Espaço</span> vira o cartão · classifique depois de revelar
      </p>
    </div>
  );
}

function CardFace({
  label,
  domain,
  status,
  text,
  hint,
  front = false,
}: {
  label: string;
  domain: string | null;
  status: Flashcard["status"];
  text: string;
  hint: string;
  front?: boolean;
}) {
  return (
    <div
      className={`ws-flip-face flex flex-col overflow-hidden rounded-[1.75rem] border p-7 shadow-[0_30px_70px_-40px_rgba(15,23,42,.55)] sm:p-10 ${
        front ? "border-ws-line/10 bg-ws-surface" : "ws-flip-back border-white/10 bg-[#0c111b] text-white"
      }`}
    >
      {front ? (
        <span aria-hidden="true" className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-orange-500 via-amber-300 to-orange-500" />
      ) : (
        <span aria-hidden="true" className="pointer-events-none absolute -right-20 -top-24 h-64 w-64 rounded-full bg-orange-500/20 blur-3xl" />
      )}
      <div className="relative flex items-center justify-between gap-3">
        <span className={`ws-eyebrow ${front ? "" : "!text-orange-200/80"}`}>{label}</span>
        <span className="flex items-center gap-2">
          {status === "review_later" && front ? <span className="ws-chip ws-chip-warn !h-6 !text-[11px]">revisar</span> : null}
          {domain ? (
            <span className={front ? "ws-chip !h-6 max-w-[14rem] !text-[11px]" : "ws-chip-glass !h-6 max-w-[14rem] !text-[11px]"}>
              <span className="truncate">{domain}</span>
            </span>
          ) : null}
        </span>
      </div>
      <div className="relative flex min-h-0 flex-1 items-center justify-center overflow-y-auto py-6 text-center">
        <p
          className={
            front
              ? "max-w-xl text-balance text-[1.6rem] font-semibold leading-[1.25] tracking-[-0.03em] text-ws-ink sm:text-[2rem]"
              : "max-w-xl text-pretty text-lg leading-8 text-slate-200"
          }
        >
          {text}
        </p>
      </div>
      <p className={`relative flex items-center justify-center gap-2 text-xs ${front ? "text-ws-subtle" : "text-slate-500"}`}>
        <SparkIcon className="h-3.5 w-3.5" />
        {hint}
      </p>
    </div>
  );
}
