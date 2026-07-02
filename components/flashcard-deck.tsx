"use client";

import { useMemo, useState, useTransition } from "react";
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
    return <p className="text-gray-600">Nenhum flashcard disponível ainda.</p>;
  }

  if (index >= ordered.length) {
    const known = Object.values(done).filter((s) => s === "known").length;
    return (
      <div className="rounded-xl bg-gray-50 p-8 text-center">
        <p className="text-2xl font-semibold">Sessão concluída!</p>
        <p className="mt-2 text-gray-600">
          {known} de {ordered.length} marcados como &quot;sei&quot;.
        </p>
        <button
          onClick={() => {
            setIndex(0);
            setFlipped(false);
            setDone({});
          }}
          className="mt-4 rounded-md bg-orange-500 px-4 py-2 text-sm font-medium text-white hover:bg-orange-600"
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
      <p className="mb-3 text-sm text-gray-500">
        Cartão {index + 1} de {ordered.length}
        {card.status === "review_later" && " · marcado para revisar"}
      </p>

      <button
        onClick={() => setFlipped((f) => !f)}
        className="flex min-h-56 w-full flex-col items-center justify-center rounded-2xl border-2 border-gray-200 p-8 text-center transition hover:border-orange-300"
      >
        {card.domain && (
          <span className="mb-3 text-xs font-medium uppercase tracking-wide text-orange-600">
            {card.domain}
          </span>
        )}
        <span className={flipped ? "text-base text-gray-800" : "text-xl font-semibold"}>
          {flipped ? card.back : card.front}
        </span>
        <span className="mt-4 text-xs text-gray-400">
          {flipped ? "clique para ver a frente" : "clique para revelar"}
        </span>
      </button>

      <div className="mt-5 grid grid-cols-2 gap-3">
        <button
          onClick={() => mark("review_later")}
          className="rounded-md border border-amber-300 bg-amber-50 px-4 py-2.5 text-sm font-medium text-amber-800 hover:bg-amber-100"
        >
          Revisar depois
        </button>
        <button
          onClick={() => mark("known")}
          className="rounded-md border border-green-300 bg-green-50 px-4 py-2.5 text-sm font-medium text-green-800 hover:bg-green-100"
        >
          Sei essa!
        </button>
      </div>
    </div>
  );
}
