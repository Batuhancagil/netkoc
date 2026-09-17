import { prisma } from "@/lib/db";
import { SEED_SUBJECTS } from "../../prisma/seed-data/subjects";

/** Sistem derslerine eksik resmi konuları ekler. Var olanı silmez / rename etmez. */
export async function ensureSystemTopics() {
  const subjects = await prisma.subject.findMany({
    where: { orgId: null },
    include: { topics: { select: { name: true } } },
  });
  const byCode = new Map(subjects.map((s) => [s.code, s]));

  const creates: { subjectId: string; name: string; level: "TYT" | "AYT"; order: number }[] = [];
  for (const seed of SEED_SUBJECTS) {
    const row = byCode.get(seed.code);
    if (!row) continue;
    const have = new Set(row.topics.map((t) => t.name.toLocaleLowerCase("tr-TR")));
    for (const t of seed.topics) {
      if (have.has(t.name.toLocaleLowerCase("tr-TR"))) continue;
      creates.push({ subjectId: row.id, name: t.name, level: t.level, order: t.order });
    }
  }
  if (creates.length === 0) return;
  await prisma.topic.createMany({ data: creates });
}
