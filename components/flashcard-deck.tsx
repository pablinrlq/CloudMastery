"use client";

import { useMemo, useState, useTransition } from "react";
import { LogoIcon } from "@/components/logo";
import { markFlashcard } from "@/app/(app)/flashcards/actions";

export type Flashcard = {
  id: string;
  domain: string | null;
  front: string;
  back: string;
  status: "new" | "review_later" | "known";
};

export function FlashcardDeck({ cards }: { cards: Flashcard[] }) {
  // review_later and new cards first; known ones at the end
  const ordered = useMemo(() => {
    const weight = { review_later: 0, new: 1, known: 2 } as const;
    return [...cards].sort((a, b) => weight[a.status] - weight[b.status]);
  }, [cards]);

  const [index, setIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [done, setDone] = useState<Record<string, "known" | "review_later">>({});
  const [, startTransition] = useTransition();

  if (!ordered.length) {
    return (
      <p className="text-gray-600 dark:text-gray-400">
        Nenhum flashcard disponível ainda.
      </p>
    );
  }

  if (index >= ordered.length) {
    const known = Object.values(done).filter((s) => s === "known").length;
    return (
      <div className="cm-panel p-8 text-center sm:p-12">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-50 dark:bg-emerald-500/10"><LogoIcon size={38} /></div>
        <p className="mt-5 text-2xl font-bold tracking-tight text-slate-950 dark:text-white">
          Sessão concluída!
        </p>
        <p className="mt-2 text-slate-500 dark:text-slate-400">
          {known} de {ordered.length} marcados como &quot;sei&quot;.
        </p>
        <button
          onClick={() => {
            setIndex(0);
            setFlipped(false);
            setDone({});
          }}
          className="cm-button-primary mt-6"
        >
          Revisar novamente
        </button>
      </div>
    );
  }

  const card = ordered[index];

  function mark(status: "known" | "review_later") {
    setDone((d) => ({ ...d, [card.id]: status }));
    startTransition(() => {
      markFlashcard(card.id, status);
    });
    setFlipped(false);
    setIndex((i) => i + 1);
  }

  return (
    <div>
      <div className="mb-4 flex items-center justify-between text-xs font-semibold text-slate-400 dark:text-slate-500">
        <p>Cartão {index + 1} de {ordered.length}
        {card.status === "review_later" && " · marcado para revisar"}
        </p><p>{Math.round(((index + 1) / ordered.length) * 100)}%</p>
      </div>
      <div className="mb-6 h-1.5 overflow-hidden rounded-full bg-slate-200/70 dark:bg-white/10"><div className="h-full rounded-full bg-orange-500 transition-all duration-500" style={{ width: `${((index + 1) / ordered.length) * 100}%` }} /></div>

      <button
        onClick={() => setFlipped((f) => !f)}
        className="group flex min-h-[320px] w-full flex-col items-center justify-center rounded-[1.75rem] border border-slate-200 bg-white p-8 text-center shadow-[0_22px_60px_-38px_rgba(15,23,42,0.35)] transition-all duration-300 hover:-translate-y-1 hover:border-orange-200 hover:shadow-[0_30px_70px_-38px_rgba(15,23,42,0.45)] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-orange-500/15 dark:border-white/10 dark:bg-slate-900 dark:hover:border-orange-500/30 sm:p-12"
      >
        {card.domain && (
          <span className="mb-5 rounded-full bg-orange-50 px-3 py-1.5 text-xs font-bold uppercase tracking-[0.14em] text-orange-600 dark:bg-orange-500/10 dark:text-orange-400">
            {card.domain}
          </span>
        )}
        <span
          className={
            flipped
              ? "max-w-xl text-lg leading-8 text-slate-700 dark:text-slate-200"
              : "max-w-xl text-2xl font-bold leading-9 tracking-[-0.025em] text-slate-950 dark:text-white"
          }
        >
          {flipped ? card.back : card.front}
        </span>
        <span className="mt-7 text-xs font-semibold text-slate-400 transition group-hover:text-orange-500 dark:text-slate-500">
          {flipped ? "clique para ver a frente" : "clique para revelar"}
        </span>
      </button>

      <div className="mt-5 grid grid-cols-2 gap-3">
        <button
          onClick={() => mark("review_later")}
          className="inline-flex min-h-12 items-center justify-center rounded-xl border border-amber-200 bg-amber-50 px-4 text-sm font-bold text-amber-800 transition-all duration-200 hover:-translate-y-0.5 hover:border-amber-300 hover:bg-amber-100 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-amber-500/15 dark:border-amber-500/20 dark:bg-amber-500/10 dark:text-amber-300"
        >
          Revisar depois
        </button>
        <button
          onClick={() => mark("known")}
          className="inline-flex min-h-12 items-center justify-center rounded-xl border border-emerald-200 bg-emerald-50 px-4 text-sm font-bold text-emerald-800 transition-all duration-200 hover:-translate-y-0.5 hover:border-emerald-300 hover:bg-emerald-100 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-emerald-500/15 dark:border-emerald-500/20 dark:bg-emerald-500/10 dark:text-emerald-300"
        >
          Sei essa!
        </button>
      </div>
    </div>
  );
}
