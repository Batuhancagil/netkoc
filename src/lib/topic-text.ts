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
  return uniqueNames(
    topics
      .map((t) => t.trim())
      .filter(Boolean)
  ).join(" · ");
}

export function uniqueNames(names: string[]): string[] {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const n of names) {
    const key = n.toLocaleLowerCase("tr-TR");
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(n);
  }
  return out;
}

export function normalizeTopic(s: string) {
  return s
    .toLocaleLowerCase("tr-TR")
    .replace(/[^a-z0-9çğıöşüâîû]+/gi, " ")
    .replace(/\s+/g, " ")
    .trim();
}

/** Excel kısaltmalarını resmi konu adına yaklaştırır. */
export function matchOfficialTopics(text: string, official: string[]): string[] {
  const raw = (text ?? "").trim();
  if (!raw) return [];
  const n = normalizeTopic(raw);
  const hits: string[] = [];
  for (const t of official) {
    const tn = normalizeTopic(t);
    if (!tn) continue;
    if (n.includes(tn) || tn.includes(n)) {
      hits.push(t);
      continue;
    }
    const words = tn.split(" ").filter((w) => w.length >= 3);
    if (words.length > 0 && words.every((w) => n.includes(w.slice(0, Math.min(4, w.length))))) {
      hits.push(t);
    }
  }
  if (hits.length > 0) return uniqueNames(hits);
  return splitTopics(raw);
}

export function isOfficialTopic(name: string, official: string[]) {
  const n = normalizeTopic(name);
  return official.some((t) => normalizeTopic(t) === n);
}
