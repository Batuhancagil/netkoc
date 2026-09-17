"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { requireTutorOrg } from "@/lib/tenant";
import { writeAudit } from "@/lib/audit";
import { daysOfWeek, findRoadmapWeek } from "@/lib/date";
import { getOrCreateWeeklyFromRoadmapWeek } from "@/lib/weekly-from-roadmap";

const createSchema = z.object({
  studentId: z.string().min(1),
  weekStart: z.string(),
  weekEnd: z.string(),
  weekNumber: z.coerce.number().int().min(1).max(52),
});

export async function createWeeklyPlan(formData: FormData) {
  const { session, org } = await requireTutorOrg();
  const parsed = createSchema.safeParse({
    studentId: formData.get("studentId"),
    weekStart: formData.get("weekStart"),
    weekEnd: formData.get("weekEnd"),
    weekNumber: formData.get("weekNumber"),
  });
  if (!parsed.success) redirect("/dashboard/weekly");

  const student = await prisma.student.findFirst({
    where: { id: parsed.data.studentId, orgId: org.id },
    include: { roadmap: true },
  });
  if (!student) redirect("/dashboard/weekly");

  const weekStart = new Date(parsed.data.weekStart);
  weekStart.setHours(0, 0, 0, 0);
  const weekEnd = new Date(parsed.data.weekEnd);
  weekEnd.setHours(23, 59, 59, 999);

  const existing = await prisma.weeklyPlan.findUnique({
    where: { studentId_weekStart: { studentId: student.id, weekStart } },
  });
  if (existing) redirect(`/dashboard/weekly/${existing.id}`);

  const plan = await prisma.weeklyPlan.create({
    data: {
      studentId: student.id,
      weekStart,
      weekEnd,
      weekNumber: parsed.data.weekNumber,
    },
  });

  // Pre-fill from roadmap
  if (student.roadmap) {
    const tpl = await prisma.roadmapTemplate.findUnique({
      where: { id: student.roadmap.templateId },
      include: {
        weeks: { include: { cells: { include: { subject: true } } } },
      },
    });
    if (tpl) {
      const anchorDate = weekStart;
      const rWeek = findRoadmapWeek(tpl.weeks, anchorDate);
      if (rWeek) {
        const days = daysOfWeek(weekStart);
        // Distribute subjects across weekdays (Mon-Sat = 6 days)
        // Simple round robin: each cell gets assigned to the first 6 days
        const cells = rWeek.cells;
        for (let i = 0; i < cells.length; i++) {
          const day = days[i % 6];
          const cell = cells[i];
          await prisma.dailyPlan.create({
            data: {
              weeklyPlanId: plan.id,
              dayDate: day,
              subjectId: cell.subjectId,
              topicText: cell.topicText,
              plannedQuestions: 0,
              plannedMinutes: 0,
              order: i,
            },
          });
        }
      }
    }
  }

  await writeAudit(session, {
    action: "weeklyPlan.create",
    entity: "WeeklyPlan",
    entityId: plan.id,
  });

  redirect(`/dashboard/weekly/${plan.id}`);
}

export async function openWeeklyFromRoadmap(formData: FormData) {
  const { session, org } = await requireTutorOrg();
  const studentId = String(formData.get("studentId") || "");
  const roadmapWeekId = String(formData.get("roadmapWeekId") || "");
  const student = await prisma.student.findFirst({
    where: { id: studentId, orgId: org.id },
  });
  if (!student || !roadmapWeekId) redirect("/dashboard/weekly");

  const plan = await getOrCreateWeeklyFromRoadmapWeek(student.id, roadmapWeekId);
  if (!plan) redirect(`/dashboard/weekly?studentId=${student.id}`);

  await writeAudit(session, {
    action: "weeklyPlan.openFromRoadmap",
    entity: "WeeklyPlan",
    entityId: plan.id,
    metadata: { roadmapWeekId },
  });

  redirect(`/dashboard/weekly/${plan.id}`);
}

export async function applyQuestionTargets(formData: FormData) {
  const { session, org } = await requireTutorOrg();
  const weeklyPlanId = String(formData.get("weeklyPlanId") || "");
  const subjectId = String(formData.get("subjectId") || "").trim();
  const plannedQuestions = Number(formData.get("plannedQuestions") ?? 0);
  const minutesRaw = formData.get("plannedMinutes");
  const plannedMinutes =
    minutesRaw === null || String(minutesRaw).trim() === ""
      ? undefined
      : Number(minutesRaw);

  if (!weeklyPlanId || Number.isNaN(plannedQuestions) || plannedQuestions < 0) return;

  const plan = await prisma.weeklyPlan.findFirst({
    where: { id: weeklyPlanId, student: { orgId: org.id } },
    include: { dailyPlans: true },
  });
  if (!plan) return;

  const rows = subjectId
    ? plan.dailyPlans.filter((d) => d.subjectId === subjectId)
    : plan.dailyPlans;
  if (rows.length === 0) return;

  await prisma.$transaction(
    rows.map((row) =>
      prisma.dailyPlan.update({
        where: { id: row.id },
        data: {
          plannedQuestions,
          ...(plannedMinutes !== undefined && !Number.isNaN(plannedMinutes)
            ? { plannedMinutes }
            : {}),
        },
      })
    )
  );

  await writeAudit(session, {
    action: "weeklyPlan.bulkTargets",
    entity: "WeeklyPlan",
    entityId: plan.id,
    metadata: { subjectId: subjectId || null, plannedQuestions, count: rows.length },
  });

  revalidatePath(`/dashboard/weekly/${plan.id}`);
}

const dailyUpsertSchema = z.object({
  weeklyPlanId: z.string().min(1),
  id: z.string().optional(),
  dayDate: z.string().min(1),
  subjectId: z.string().min(1),
  topicText: z.string().max(500).optional().or(z.literal("")),
  plannedQuestions: z.coerce.number().int().min(0).default(0),
  plannedMinutes: z.coerce.number().int().min(0).default(0),
});

export async function upsertDailyPlan(formData: FormData) {
  const { session, org } = await requireTutorOrg();
  const parsed = dailyUpsertSchema.safeParse({
    weeklyPlanId: formData.get("weeklyPlanId"),
    id: formData.get("id") ?? undefined,
    dayDate: formData.get("dayDate"),
    subjectId: formData.get("subjectId"),
    topicText: formData.get("topicText") ?? "",
    plannedQuestions: formData.get("plannedQuestions") ?? 0,
    plannedMinutes: formData.get("plannedMinutes") ?? 0,
  });
  if (!parsed.success) return;

  const plan = await prisma.weeklyPlan.findFirst({
    where: { id: parsed.data.weeklyPlanId, student: { orgId: org.id } },
  });
  if (!plan) return;

  if (parsed.data.id) {
    await prisma.dailyPlan.update({
      where: { id: parsed.data.id },
      data: {
        subjectId: parsed.data.subjectId,
        topicText: parsed.data.topicText || null,
        plannedQuestions: parsed.data.plannedQuestions,
        plannedMinutes: parsed.data.plannedMinutes,
      },
    });
  } else {
    await prisma.dailyPlan.create({
      data: {
        weeklyPlanId: plan.id,
        dayDate: new Date(parsed.data.dayDate),
        subjectId: parsed.data.subjectId,
        topicText: parsed.data.topicText || null,
        plannedQuestions: parsed.data.plannedQuestions,
        plannedMinutes: parsed.data.plannedMinutes,
      },
    });
  }

  await writeAudit(session, {
    action: "dailyPlan.upsert",
    entity: "DailyPlan",
    entityId: parsed.data.id,
  });

  revalidatePath(`/dashboard/weekly/${plan.id}`);
}

export async function deleteDailyPlan(formData: FormData) {
  const { session, org } = await requireTutorOrg();
  const id = String(formData.get("id") ?? "");
  if (!id) return;

  const dp = await prisma.dailyPlan.findUnique({
    where: { id },
    include: { weeklyPlan: { include: { student: true } } },
  });
  if (!dp || dp.weeklyPlan.student.orgId !== org.id) return;

  await prisma.dailyPlan.delete({ where: { id } });
  await writeAudit(session, { action: "dailyPlan.delete", entity: "DailyPlan", entityId: id });

  revalidatePath(`/dashboard/weekly/${dp.weeklyPlanId}`);
}

const notesSchema = z.object({
  weeklyPlanId: z.string().min(1),
  notes: z.string().max(2000).optional().or(z.literal("")),
  priorities: z.string().max(2000).optional().or(z.literal("")),
});

export async function updatePlanNotes(formData: FormData) {
  const { session, org } = await requireTutorOrg();
  const parsed = notesSchema.safeParse({
    weeklyPlanId: formData.get("weeklyPlanId"),
    notes: formData.get("notes") ?? "",
    priorities: formData.get("priorities") ?? "",
  });
  if (!parsed.success) return;

  const plan = await prisma.weeklyPlan.findFirst({
    where: { id: parsed.data.weeklyPlanId, student: { orgId: org.id } },
  });
  if (!plan) return;

  await prisma.weeklyPlan.update({
    where: { id: plan.id },
    data: {
      notes: parsed.data.notes || null,
      priorities: parsed.data.priorities || null,
    },
  });

  await writeAudit(session, {
    action: "weeklyPlan.updateNotes",
    entity: "WeeklyPlan",
    entityId: plan.id,
  });

  revalidatePath(`/dashboard/weekly/${plan.id}`);
}

const evalSchema = z.object({
  weeklyPlanId: z.string().min(1),
  dayDate: z.string().min(1),
  subjectId: z.string().min(1),
  correct: z.coerce.number().int().min(0),
  wrong: z.coerce.number().int().min(0),
  blank: z.coerce.number().int().min(0).default(0),
  minutes: z.coerce.number().int().min(0).default(0),
});

export async function upsertDailyEval(formData: FormData) {
  const { session, org } = await requireTutorOrg();
  const parsed = evalSchema.safeParse({
    weeklyPlanId: formData.get("weeklyPlanId"),
    dayDate: formData.get("dayDate"),
    subjectId: formData.get("subjectId"),
    correct: formData.get("correct") ?? 0,
    wrong: formData.get("wrong") ?? 0,
    blank: formData.get("blank") ?? 0,
    minutes: formData.get("minutes") ?? 0,
  });
  if (!parsed.success) return;

  const plan = await prisma.weeklyPlan.findFirst({
    where: { id: parsed.data.weeklyPlanId, student: { orgId: org.id } },
  });
  if (!plan) return;

  let evalRow = await prisma.weeklyEval.findUnique({ where: { weeklyPlanId: plan.id } });
  if (!evalRow) {
    evalRow = await prisma.weeklyEval.create({ data: { weeklyPlanId: plan.id } });
  }

  const dayDate = new Date(parsed.data.dayDate);
  dayDate.setHours(0, 0, 0, 0);

  const source = session.role === "STUDENT" ? "STUDENT" : "TEACHER";

  await prisma.dailyEval.upsert({
    where: {
      weeklyEvalId_dayDate_subjectId: {
        weeklyEvalId: evalRow.id,
        dayDate,
        subjectId: parsed.data.subjectId,
      },
    },
    create: {
      weeklyEvalId: evalRow.id,
      dayDate,
      subjectId: parsed.data.subjectId,
      correct: parsed.data.correct,
      wrong: parsed.data.wrong,
      blank: parsed.data.blank,
      minutes: parsed.data.minutes,
      enteredBy: source,
    },
    update: {
      correct: parsed.data.correct,
      wrong: parsed.data.wrong,
      blank: parsed.data.blank,
      minutes: parsed.data.minutes,
      enteredBy: source,
    },
  });

  await writeAudit(session, {
    action: "dailyEval.upsert",
    entity: "DailyEval",
    metadata: {
      weeklyPlanId: plan.id,
      subjectId: parsed.data.subjectId,
      dayDate: parsed.data.dayDate,
    },
  });

  revalidatePath(`/dashboard/weekly/${plan.id}`);
}
