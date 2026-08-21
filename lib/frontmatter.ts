import { load } from "js-yaml";

const FRONTMATTER_PATTERN = /^---[\t ]*\r?\n([\s\S]*?)\r?\n---[\t ]*(?:\r?\n|$)/;

export function parseFrontmatter<T extends object = Record<string, unknown>>(source: string): {
  data: T;
  content: string;
} {
  const match = FRONTMATTER_PATTERN.exec(source);
  if (!match) return { data: {} as T, content: source };

  const parsed = load(match[1], { json: true });
  if (parsed !== undefined && (typeof parsed !== "object" || Array.isArray(parsed))) {
    throw new Error("Frontmatter precisa ser um objeto YAML.");
  }

  return {
    data: (parsed ?? {}) as T,
    content: source.slice(match[0].length),
  };
}
