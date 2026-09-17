import { prisma } from "@/lib/db";

function shiftDate(d: Date, years: number) {
  const next = new Date(d);
  next.setUTCFullYear(next.getUTCFullYear() + years);
  return next;
}

/** 2025-26 sistem şablonunu bir yıl kaydırarak 2026-27 kopyası üretir. Silmez. */
export async function ensureCurrentYearSystemTemplates(targetYear = 2026) {
  const sourceYear = targetYear - 1;
  const sources = await prisma.roadmapTemplate.findMany({
    where: { orgId: null, isSystem: true, year: sourceYear },
    include: {
      weeks: {
        orderBy: [{ monthIndex: "asc" }, { weekIndex: "asc" }],
        include: { cells: true },
      },
    },
  });
  if (sources.length === 0) return;

  for (const source of sources) {
    const exists = await prisma.roadmapTemplate.findFirst({
      where: {
        orgId: null,
        isSystem: true,
        year: targetYear,
        track: source.track,
        scope: source.scope,
      },
      select: { id: true },
    });
    if (exists) continue;

    await prisma.$transaction(async (tx) => {
      const tpl = await tx.roadmapTemplate.create({
        data: {
          orgId: null,
          name: source.name.replace("2025-2026", "2026-2027"),
          year: targetYear,
          track: source.track,
          scope: source.scope,
          isSystem: true,
        },
      });
      for (const w of source.weeks) {
        const week = await tx.roadmapWeek.create({
          data: {
            templateId: tpl.id,
            monthIndex: w.monthIndex,
            weekIndex: w.weekIndex,
            label: w.label,
            startDate: shiftDate(w.startDate, 1),
            endDate: shiftDate(w.endDate, 1),
          },
        });
        for (const c of w.cells) {
          await tx.roadmapCell.create({
            data: {
              weekId: week.id,
              subjectId: c.subjectId,
              topicText: c.topicText,
            },
          });
        }
      }
    });
  }
}
