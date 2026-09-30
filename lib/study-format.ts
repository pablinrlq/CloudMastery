// Pure helpers shared by the study workspace (no server-only imports, so they
// stay unit-testable with node --test).

const DAY_MS = 86_400_000;

function dayKey(time: number) {
  return new Date(time).toISOString().slice(0, 10);
}

/** "ana.silva@x.com" → "Ana". Returns null when the local part doesn't look like a name. */
export function displayNameFromEmail(email: string): string | null {
  const local = email.split("@")[0] ?? "";
  const first = (local.split(/[._\-+]/)[0] ?? "").replace(/\d+/g, "");
  if (first.length < 2 || first.length > 12 || !/^[a-zà-ÿ]+$/i.test(first)) return null;
  return first.charAt(0).toUpperCase() + first.slice(1).toLowerCase();
}

/** "ana.silva@x.com" → "AS"; "joao@x.com" → "JO". */
export function initialsFromEmail(email: string): string {
  const local = email.split("@")[0] ?? "";
  const parts = local
    .split(/[._\-+]/)
    .map((part) => part.replace(/[^a-zà-ÿ]/gi, ""))
    .filter(Boolean);
  const letters = parts.length >= 2 ? `${parts[0][0]}${parts[1][0]}` : (parts[0] ?? "").slice(0, 2);
  return letters.toUpperCase() || "CM";
}

/** Stable anchor id for a heading: lowercase, no accents, dash separated. */
export function slugifyHeading(text: string): string {
  return text
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[*_`~]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/** Level-2 markdown headings (outside fenced code) for the module table of contents. */
export function extractHeadings(markdown: string): Array<{ id: string; text: string }> {
  const headings: Array<{ id: string; text: string }> = [];
  let inFence = false;
  for (const line of markdown.split("\n")) {
    if (/^\s*(```|~~~)/.test(line)) inFence = !inFence;
    if (inFence) continue;
    const match = /^##\s+(.+?)\s*#*\s*$/.exec(line);
    if (!match) continue;
    const text = match[1].replace(/[*_`]/g, "").trim();
    const id = slugifyHeading(text);
    if (id && !headings.some((heading) => heading.id === id)) headings.push({ id, text });
  }
  return headings;
}

/** Longest run of consecutive UTC days with at least one activity. */
export function longestStreak(dates: string[]): number {
  const days = [...new Set(dates.map((date) => date.slice(0, 10)))].sort();
  let best = 0;
  let run = 0;
  let previous: number | null = null;
  for (const day of days) {
    const time = Date.parse(`${day}T00:00:00Z`);
    run = previous !== null && time - previous === DAY_MS ? run + 1 : 1;
    best = Math.max(best, run);
    previous = time;
  }
  return best;
}

/** Daily activity counts for the last `days` UTC days, oldest first. */
export function activityCalendar(
  dates: string[],
  days: number,
  now = Date.now()
): Array<{ date: string; count: number }> {
  const counts = new Map<string, number>();
  for (const date of dates) {
    const key = date.slice(0, 10);
    counts.set(key, (counts.get(key) ?? 0) + 1);
  }
  const calendar: Array<{ date: string; count: number }> = [];
  for (let offset = days - 1; offset >= 0; offset--) {
    const key = dayKey(now - offset * DAY_MS);
    calendar.push({ date: key, count: counts.get(key) ?? 0 });
  }
  return calendar;
}

export function formatMinutes(minutes: number): string {
  if (minutes < 60) return `${minutes} min`;
  const hours = Math.floor(minutes / 60);
  const rest = minutes % 60;
  return rest ? `${hours}h ${rest}min` : `${hours}h`;
}
