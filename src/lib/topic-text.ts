export function splitTopics(text: string): string[] {
  const raw = (text ?? "").trim();
  if (!raw) return [];
  const parts = raw
    .split(/\s*(?:·|\||\n|;)\s*/)
    .map((s) => s.trim())
    .filter(Boolean);
  return parts.length > 0 ? parts : [raw];
}

export function joinTopics(topics: string[]): string {
  return topics
    .map((t) => t.trim())
    .filter(Boolean)
    .filter((t, i, arr) => arr.findIndex((x) => x.toLocaleLowerCase("tr-TR") === t.toLocaleLowerCase("tr-TR")) === i)
    .join(" · ");
}
