"use client";

import { useEffect, useState } from "react";

// Índice do módulo com destaque da seção visível (scrollspy).
export function ModuleToc({ headings }: { headings: Array<{ id: string; text: string }> }) {
  const [active, setActive] = useState<string | null>(headings[0]?.id ?? null);

  useEffect(() => {
    const elements = headings
      .map((heading) => document.getElementById(heading.id))
      .filter((element): element is HTMLElement => Boolean(element));
    if (!elements.length) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (visible[0]) setActive(visible[0].target.id);
      },
      { rootMargin: "0px 0px -70% 0px", threshold: 0 }
    );
    elements.forEach((element) => observer.observe(element));
    return () => observer.disconnect();
  }, [headings]);

  return (
    <ol className="relative space-y-0.5 border-l border-ws-line/10">
      {headings.map((heading) => {
        const current = heading.id === active;
        return (
          <li key={heading.id}>
            <a
              href={`#${heading.id}`}
              aria-current={current ? "location" : undefined}
              className={`-ml-px block border-l-2 py-1.5 pl-3.5 text-[13px] leading-5 transition-colors ${
                current
                  ? "border-ws-accent font-medium text-ws-ink"
                  : "border-transparent text-ws-subtle hover:border-ws-line/30 hover:text-ws-ink"
              }`}
            >
              {heading.text}
            </a>
          </li>
        );
      })}
    </ol>
  );
}
