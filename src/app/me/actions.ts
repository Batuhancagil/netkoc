"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { requireStudent } from "@/lib/auth/guards";
import { writeAudit } from "@/lib/audit";
import { ensureWeeklyForDate } from "@/lib/weekly-from-roadmap";

const evalSchema = z.object({
  weeklyPlanId: z.string().min(1),
  dayDate: z.string().min(1),
  subjectId: z.string().min(1),
  correct: z.coerce.number().int().min(0),
  wrong: z.coerce.number().int().min(0),
  blank: z.coerce.number().int().min(0).default(0),
  minutes: z.coerce.number().int().min(0).default(0),
});

async function writeStudentEval(args: {
  session: Awaited<ReturnType<typeof requireStudent>>;
  studentId: string;
  weeklyPlanId: string;
  dayDate: Date;
  subjectId: string;
  correct: number;
  wrong: number;
  blank: number;
  minutes: number;
}) {
  const plan = await prisma.weeklyPlan.findFirst({
    where: { id: args.weeklyPlanId, studentId: args.studentId },
  });
  if (!plan) return;

  const hasRow = await prisma.dailyPlan.findFirst({
    where: {
      weeklyPlanId: plan.id,
      subjectId: args.subjectId,
      dayDate: args.dayDate,
    },
  });
  if (!hasRow) {
    await prisma.dailyPlan.create({
      data: {
        weeklyPlanId: plan.id,
        dayDate: args.dayDate,
        subjectId: args.subjectId,
        topicText: null,
        plannedQuestions: 0,
        plannedMinutes: 0,
      },
    });
  }

  let evalRow = await prisma.weeklyEval.findUnique({ where: { weeklyPlanId: plan.id } });
  if (!evalRow) {
    evalRow = await prisma.weeklyEval.create({ data: { weeklyPlanId: plan.id } });
  }

  await prisma.dailyEval.upsert({
    where: {
      weeklyEvalId_dayDate_subjectId: {
        weeklyEvalId: evalRow.id,
        dayDate: args.dayDate,
        subjectId: args.subjectId,
      },
    },
    create: {
      weeklyEvalId: evalRow.id,
      dayDate: args.dayDate,
      subjectId: args.subjectId,
      correct: args.correct,
      wrong: args.wrong,
      blank: args.blank,
      minutes: args.minutes,
      enteredBy: "STUDENT",
    },
    update: {
      correct: args.correct,
      wrong: args.wrong,
      blank: args.blank,
      minutes: args.minutes,
      enteredBy: "STUDENT",
    },
  });

  await writeAudit(args.session, {
    action: "dailyEval.studentUpsert",
    entity: "DailyEval",
    metadata: {
      weeklyPlanId: plan.id,
      subjectId: args.subjectId,
      dayDate: args.dayDate.toISOString(),
    },
  });
}

export async function studentUpsertEval(formData: FormData) {
  const session = await requireStudent();
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

  const student = await prisma.student.findFirst({ where: { userId: session.userId } });
  if (!student) return;

  const dayDate = new Date(parsed.data.dayDate);
  dayDate.setHours(0, 0, 0, 0);

  await writeStudentEval({
    session,
    studentId: student.id,
    weeklyPlanId: parsed.data.weeklyPlanId,
    dayDate,
    subjectId: parsed.data.subjectId,
    correct: parsed.data.correct,
    wrong: parsed.data.wrong,
    blank: parsed.data.blank,
    minutes: parsed.data.minutes,
  });

  revalidatePath("/me");
}

export async function studentLogSolved(formData: FormData) {
  const session = await requireStudent();
  const student = await prisma.student.findFirst({
    where: { userId: session.userId },
    include: { org: true },
  });
  if (!student) return;

  const subjectId = String(formData.get("subjectId") || "");
  const parsed = z
    .object({
      correct: z.coerce.number().int().min(0),
      wrong: z.coerce.number().int().min(0),
      blank: z.coerce.number().int().min(0).default(0),
      minutes: z.coerce.number().int().min(0).default(0),
    })
    .safeParse({
      correct: formData.get("correct") ?? 0,
      wrong: formData.get("wrong") ?? 0,
      blank: formData.get("blank") ?? 0,
      minutes: formData.get("minutes") ?? 0,
    });
  if (!subjectId || !parsed.success) return;

  const plan = await ensureWeeklyForDate(student.id, new Date(), student.org.weekStartsOn);
  const dayDate = new Date();
  dayDate.setHours(0, 0, 0, 0);

  await writeStudentEval({
    session,
    studentId: student.id,
    weeklyPlanId: plan.id,
    dayDate,
    subjectId,
    correct: parsed.data.correct,
    wrong: parsed.data.wrong,
    blank: parsed.data.blank,
    minutes: parsed.data.minutes,
  });

  revalidatePath("/me");
}
