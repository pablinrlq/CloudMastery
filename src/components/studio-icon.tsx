export type StudioIconName = "home" | "book" | "exam" | "cards" | "clock" | "arrow" | "check" | "flag" | "shield" | "insights";

const paths: Record<StudioIconName, string> = {
  home: "m3 10 9-7 9 7v10H15v-6H9v6H3Z",
  book: "M12 5v16M3 3l9 2 9-2v16l-9 2-9-2Z",
  exam: "M9 4H5v17h14V4h-4M9 2h6v5H9ZM8 12l2 2 5-4M8 18h8",
  cards: "M7 3h13v16M3 7h13v15H3ZM6 12h7M6 16h5",
  clock: "M12 8v5l3 2M9 2h6M12 2v3M20 13a8 8 0 1 1-16 0 8 8 0 0 1 16 0",
  arrow: "M4 12h16m-6-6 6 6-6 6",
  check: "m5 12 4 4L19 6",
  flag: "M5 22V3h14l-3 5 3 5H5",
  shield: "m12 2 8 3v6c0 5-8 11-8 11S4 16 4 11V5ZM8 11l3 3 5-6",
  insights: "M4 19V9M10 19V5M16 19v-7M22 19V3m-1 2-6 5-6-1-6 5",
};

export function StudioIcon({ name }: { name: StudioIconName }) {
  return <svg width="21" height="21" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d={paths[name]} /></svg>;
}
