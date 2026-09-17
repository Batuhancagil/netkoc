import type { ExamTrack, RoadmapScope } from "@prisma/client";
import { prisma } from "@/lib/db";
import { SEED_GRADE_ROADMAPS } from "../../prisma/seed-data/grade-roadmaps";

/** 9–12 sınıf sistem şablonlarını eksikse ekler. YKS şablonlarına dokunmaz. */
export async function ensureGradeSystemTemplates() {
  const existing = await prisma.roadmapTemplate.findMany({
    where: { orgId: null, isSystem: true, scope: { not: "YKS" } },
    select: { year: true, track: true, scope: true },
  });
  const have = new Set(existing.map((t) => `${t.year}:${t.track}:${t.scope}`));
  const missing = SEED_GRADE_ROADMAPS.filter(
    (r) => !have.has(`${r.year}:${r.track}:${r.scope ?? ""}`)
  );
  if (missing.length === 0) return;

  const subjects = await prisma.subject.findMany({ where: { orgId: null } });
  const subjectMap = new Map(subjects.map((s) => [s.code, s.id]));

  for (const roadmap of missing) {
    await prisma.roadmapTemplate.create({
      data: {
        orgId: null,
        name: roadmap.name,
        year: roadmap.year,
        track: roadmap.track as ExamTrack,
        scope: (roadmap.scope ?? "GRADE_9") as RoadmapScope,
        isSystem: true,
        weeks: {
          create: roadmap.weeks.map((w) => ({
            monthIndex: w.monthIndex,
            weekIndex: w.weekIndex,
            label: w.label,
            startDate: new Date(w.startDate),
            endDate: new Date(w.endDate),
            cells: {
              create: Object.entries(w.cells)
                .map(([subjectCode, topicText]) => {
                  const subjectId = subjectMap.get(subjectCode);
                  if (!subjectId) return null;
                  return { subjectId, topicText };
                })
                .filter((c): c is { subjectId: string; topicText: string } => Boolean(c)),
            },
          })),
        },
      },
    });
  }
}
