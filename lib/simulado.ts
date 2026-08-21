export const DIAGNOSTIC_QUESTION_COUNT = 10;
export const DIAGNOSTIC_DURATION_MINUTES = 15;

export type SimuladoMode = "diagnostic" | "full" | "domain";

export function isSimuladoMode(value: unknown): value is SimuladoMode {
  return value === "diagnostic" || value === "full" || value === "domain";
}

export function shuffledCopy<T>(items: readonly T[], random = Math.random): T[] {
  const copy = [...items];
  for (let index = copy.length - 1; index > 0; index--) {
    const swapIndex = Math.floor(random() * (index + 1));
    [copy[index], copy[swapIndex]] = [copy[swapIndex], copy[index]];
  }
  return copy;
}
