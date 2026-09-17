import { prisma } from "@/lib/db";
import { daysOfWeek, findRoadmapWeek, planDatesForRoadmapWeek, startOfWeek, endOfWeek } from "@/lib/date";

export async function loadStudentRoadmap(studentId: string) {
  return prisma.studentRoadmap.findUnique({
    where: { studentId },
    include: {
      template: {
        include: {
          weeks: {
            orderBy: [{ monthIndex: "asc" }, { weekIndex: "asc" }],
            include: { cells: { include: { subject: true } } },
          },
        },
      },
    },
  });
}

async function fillDailyFromRoadmapWeek(
  planId: string,
  week: { cells: { subjectId: string; topicText: string }[] },
  weekStart: Date
) {
  const existing = await prisma.dailyPlan.count({ where: { weeklyPlanId: planId } });
  if (existing > 0) return;

  const days = daysOfWeek(weekStart);
  const cells = week.cells;
  for (let i = 0; i < cells.length; i++) {
    const day = days[i % 6];
    const cell = cells[i];
    await prisma.dailyPlan.create({
      data: {
        weeklyPlanId: planId,
        dayDate: day,
        subjectId: cell.subjectId,
        topicText: cell.topicText || null,
        plannedQuestions: 0,
        plannedMinutes: 0,
        order: i,
      },
    });
  }
}

export async function getOrCreateWeeklyFromRoadmapWeek(studentId: string, roadmapWeekId: string) {
  const student = await prisma.student.findUnique({
    where: { id: studentId },
    include: { roadmap: true },
  });
  if (!student?.roadmap) return null;

  const week = await prisma.roadmapWeek.findUnique({
    where: { id: roadmapWeekId },
    include: { cells: true },
  });
  if (!week || week.templateId !== student.roadmap.templateId) return null;

  const { weekStart, weekEnd } = planDatesForRoadmapWeek(week);
  const existing = await prisma.weeklyPlan.findFirst({
    where: {
      studentId,
      OR: [
        { weekStart },
        { AND: [{ weekStart: { lte: weekEnd } }, { weekEnd: { gte: weekStart } }] },
      ],
    },
    orderBy: { weekStart: "asc" },
  });
  if (existing) {
    await fillDailyFromRoadmapWeek(existing.id, week, existing.weekStart);
    return existing;
  }

  const plan = await prisma.weeklyPlan.create({
    data: {
      studentId,
      weekStart,
      weekEnd,
      weekNumber: week.monthIndex * 5 + week.weekIndex + 1,
    },
  });
  await fillDailyFromRoadmapWeek(plan.id, week, weekStart);
  return plan;
}

export async function ensureWeeklyForDate(studentId: string, date = new Date(), weekStartsOn = 1) {
  const roadmap = await loadStudentRoadmap(studentId);
  if (roadmap?.template.weeks.length) {
    const rWeek = findRoadmapWeek(roadmap.template.weeks, date);
    if (rWeek) {
      const plan = await getOrCreateWeeklyFromRoadmapWeek(studentId, rWeek.id);
      if (plan) return plan;
    }
  }

  const weekStart = startOfWeek(date, weekStartsOn);
  weekStart.setHours(0, 0, 0, 0);
  const existing = await prisma.weeklyPlan.findUnique({
    where: { studentId_weekStart: { studentId, weekStart } },
  });
  if (existing) return existing;

  return prisma.weeklyPlan.create({
    data: {
      studentId,
      weekStart,
      weekEnd: endOfWeek(date, weekStartsOn),
      weekNumber: academicFallbackWeekNumber(date),
    },
  });
}

function academicFallbackWeekNumber(date: Date) {
  const start = new Date(Date.UTC(date.getUTCMonth() >= 8 ? date.getUTCFullYear() : date.getUTCFullYear() - 1, 8, 1));
  const diff = Math.floor((date.getTime() - start.getTime()) / (7 * 86400000));
  return Math.min(52, Math.max(1, diff + 1));
}
