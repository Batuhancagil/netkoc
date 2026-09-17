"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { requireTutorOrg } from "@/lib/tenant";
import { writeAudit } from "@/lib/audit";

const intFields = [
  "turkceD",
  "turkceY",
  "sosyalD",
  "sosyalY",
  "matD",
  "matY",
  "fenD",
  "fenY",
  "aytMatD",
  "aytMatY",
  "aytFizD",
  "aytFizY",
  "aytKimD",
  "aytKimY",
  "aytBiyD",
  "aytBiyY",
  "aytEdbD",
  "aytEdbY",
  "aytTarD",
  "aytTarY",
  "aytCogD",
  "aytCogY",
  "aytFelD",
  "aytFelY",
] as const;

const schema = z.object({
  studentId: z.string().min(1),
  date: z.string().min(1),
  type: z.enum(["TYT", "AYT", "TYTAYT"]),
  publication: z.string().max(200).optional().or(z.literal("")),
});

export async function createTrialExam(formData: FormData) {
  const { session, org } = await requireTutorOrg();
  const parsed = schema.safeParse({
    studentId: formData.get("studentId"),
    date: formData.get("date"),
    type: formData.get("type"),
    publication: formData.get("publication") ?? "",
  });
  if (!parsed.success) redirect("/dashboard/trials");

  const student = await prisma.student.findFirst({
    where: { id: parsed.data.studentId, orgId: org.id },
  });
  if (!student) redirect("/dashboard/trials");

  const numeric: Record<string, number> = {};
  for (const k of intFields) {
    const v = formData.get(k);
    numeric[k] = Math.max(0, Math.floor(Number(v ?? 0)) || 0);
  }

  const trial = await prisma.trialExam.create({
    data: {
      studentId: student.id,
      date: new Date(parsed.data.date),
      type: parsed.data.type,
      publication: parsed.data.publication || null,
      ...(numeric as any),
    },
  });

  await writeAudit(session, {
    action: "trialExam.create",
    entity: "TrialExam",
    entityId: trial.id,
  });

  redirect(`/dashboard/trials?studentId=${student.id}`);
}

export async function deleteTrialExam(formData: FormData) {
  const { session, org } = await requireTutorOrg();
  const id = String(formData.get("id") ?? "");
  if (!id) return;
  const t = await prisma.trialExam.findUnique({
    where: { id },
    include: { student: true },
  });
  if (!t || t.student.orgId !== org.id) return;
  await prisma.trialExam.delete({ where: { id } });
  await writeAudit(session, { action: "trialExam.delete", entity: "TrialExam", entityId: id });
  revalidatePath("/dashboard/trials");
}

const branchSchema = z.object({
  studentId: z.string().min(1),
  subjectId: z.string().min(1),
  date: z.string().min(1),
  publication: z.string().optional().or(z.literal("")),
  correct: z.coerce.number().int().min(0).default(0),
  wrong: z.coerce.number().int().min(0).default(0),
  blank: z.coerce.number().int().min(0).default(0),
});

export async function createBranchTrial(formData: FormData) {
  const { session, org } = await requireTutorOrg();
  const parsed = branchSchema.safeParse({
    studentId: formData.get("studentId"),
    subjectId: formData.get("subjectId"),
    date: formData.get("date"),
    publication: formData.get("publication") ?? "",
    correct: formData.get("correct") ?? 0,
    wrong: formData.get("wrong") ?? 0,
    blank: formData.get("blank") ?? 0,
  });
  if (!parsed.success) redirect("/dashboard/trials/branch");

  const student = await prisma.student.findFirst({
    where: { id: parsed.data.studentId, orgId: org.id },
  });
  if (!student) redirect("/dashboard/trials/branch");

  const b = await prisma.branchTrial.create({
    data: {
      studentId: student.id,
      subjectId: parsed.data.subjectId,
      date: new Date(parsed.data.date),
      publication: parsed.data.publication || null,
      correct: parsed.data.correct,
      wrong: parsed.data.wrong,
      blank: parsed.data.blank,
    },
  });

  await writeAudit(session, {
    action: "branchTrial.create",
    entity: "BranchTrial",
    entityId: b.id,
  });

  redirect(`/dashboard/trials/branch?studentId=${student.id}`);
}

export async function deleteBranchTrial(formData: FormData) {
  const { session, org } = await requireTutorOrg();
  const id = String(formData.get("id") ?? "");
  if (!id) return;
  const b = await prisma.branchTrial.findUnique({
    where: { id },
    include: { student: true },
  });
  if (!b || b.student.orgId !== org.id) return;
  await prisma.branchTrial.delete({ where: { id } });
  await writeAudit(session, {
    action: "branchTrial.delete",
    entity: "BranchTrial",
    entityId: id,
  });
  revalidatePath("/dashboard/trials/branch");
}
