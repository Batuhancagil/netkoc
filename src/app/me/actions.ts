"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { requireStudent } from "@/lib/auth/guards";
import { writeAudit } from "@/lib/audit";

const evalSchema = z.object({
  weeklyPlanId: z.string().min(1),
  dayDate: z.string().min(1),
  subjectId: z.string().min(1),
  correct: z.coerce.number().int().min(0),
  wrong: z.coerce.number().int().min(0),
  blank: z.coerce.number().int().min(0).default(0),
  minutes: z.coerce.number().int().min(0).default(0),
});

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

  const plan = await prisma.weeklyPlan.findFirst({
    where: { id: parsed.data.weeklyPlanId, studentId: student.id },
  });
  if (!plan) return;

  let evalRow = await prisma.weeklyEval.findUnique({ where: { weeklyPlanId: plan.id } });
  if (!evalRow) {
    evalRow = await prisma.weeklyEval.create({ data: { weeklyPlanId: plan.id } });
  }

  const dayDate = new Date(parsed.data.dayDate);
  dayDate.setHours(0, 0, 0, 0);

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
      enteredBy: "STUDENT",
    },
    update: {
      correct: parsed.data.correct,
      wrong: parsed.data.wrong,
      blank: parsed.data.blank,
      minutes: parsed.data.minutes,
      enteredBy: "STUDENT",
    },
  });

  await writeAudit(session, {
    action: "dailyEval.studentUpsert",
    entity: "DailyEval",
    metadata: {
      weeklyPlanId: plan.id,
      subjectId: parsed.data.subjectId,
      dayDate: parsed.data.dayDate,
    },
  });

  revalidatePath("/me");
}
