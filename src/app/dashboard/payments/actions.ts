"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { requireTutorOrg } from "@/lib/tenant";
import { writeAudit } from "@/lib/audit";

const schema = z.object({
  studentId: z.string().min(1),
  weekIndex: z.coerce.number().int().min(1).max(52),
  dueDate: z.string().min(1),
  paid: z.string().optional(),
  amount: z.string().optional(),
  note: z.string().max(200).optional(),
});

export async function upsertPayment(formData: FormData) {
  const { session, org } = await requireTutorOrg();
  const parsed = schema.safeParse({
    studentId: formData.get("studentId"),
    weekIndex: formData.get("weekIndex"),
    dueDate: formData.get("dueDate"),
    paid: formData.get("paid") ?? undefined,
    amount: formData.get("amount") ?? undefined,
    note: formData.get("note") ?? undefined,
  });
  if (!parsed.success) return;

  const student = await prisma.student.findFirst({
    where: { id: parsed.data.studentId, orgId: org.id },
  });
  if (!student) return;

  const paid = parsed.data.paid === "on" || parsed.data.paid === "true";
  const amount = parsed.data.amount && parsed.data.amount.trim() !== ""
    ? Number(parsed.data.amount.replace(",", "."))
    : null;

  const existing = await prisma.payment.findUnique({
    where: {
      studentId_weekIndex: {
        studentId: student.id,
        weekIndex: parsed.data.weekIndex,
      },
    },
  });

  if (existing) {
    await prisma.payment.update({
      where: { id: existing.id },
      data: {
        dueDate: new Date(parsed.data.dueDate),
        paidAt: paid ? existing.paidAt ?? new Date() : null,
        amount: amount !== null && !isNaN(amount) ? amount : null,
        note: parsed.data.note || null,
      },
    });
  } else {
    await prisma.payment.create({
      data: {
        studentId: student.id,
        weekIndex: parsed.data.weekIndex,
        dueDate: new Date(parsed.data.dueDate),
        paidAt: paid ? new Date() : null,
        amount: amount !== null && !isNaN(amount) ? amount : null,
        note: parsed.data.note || null,
      },
    });
  }

  await writeAudit(session, {
    action: "payment.upsert",
    entity: "Payment",
    metadata: { studentId: student.id, weekIndex: parsed.data.weekIndex, paid },
  });

  revalidatePath("/dashboard/payments");
}

export async function togglePaymentPaid(formData: FormData) {
  const { session, org } = await requireTutorOrg();
  const id = String(formData.get("id") ?? "");
  if (!id) return;
  const p = await prisma.payment.findUnique({
    where: { id },
    include: { student: true },
  });
  if (!p || p.student.orgId !== org.id) return;
  await prisma.payment.update({
    where: { id },
    data: { paidAt: p.paidAt ? null : new Date() },
  });
  await writeAudit(session, {
    action: "payment.toggle",
    entity: "Payment",
    entityId: id,
    metadata: { now: p.paidAt ? "unpaid" : "paid" },
  });
  revalidatePath("/dashboard/payments");
}

const initSchema = z.object({
  studentId: z.string().min(1),
  startDate: z.string().min(1),
  weeks: z.coerce.number().int().min(1).max(52).default(42),
  weeklyAmount: z.string().optional(),
});

export async function initializeWeeklyPayments(formData: FormData) {
  const { session, org } = await requireTutorOrg();
  const parsed = initSchema.safeParse({
    studentId: formData.get("studentId"),
    startDate: formData.get("startDate"),
    weeks: formData.get("weeks") ?? 42,
    weeklyAmount: formData.get("weeklyAmount") ?? undefined,
  });
  if (!parsed.success) return;

  const student = await prisma.student.findFirst({
    where: { id: parsed.data.studentId, orgId: org.id },
  });
  if (!student) return;

  const amount = parsed.data.weeklyAmount && parsed.data.weeklyAmount.trim() !== ""
    ? Number(parsed.data.weeklyAmount.replace(",", "."))
    : null;

  const start = new Date(parsed.data.startDate);
  for (let i = 0; i < parsed.data.weeks; i++) {
    const due = new Date(start);
    due.setDate(start.getDate() + i * 7);
    const weekIndex = i + 1;
    const existing = await prisma.payment.findUnique({
      where: {
        studentId_weekIndex: { studentId: student.id, weekIndex },
      },
    });
    if (existing) continue;
    await prisma.payment.create({
      data: {
        studentId: student.id,
        weekIndex,
        dueDate: due,
        amount: amount !== null && !isNaN(amount) ? amount : null,
      },
    });
  }

  await writeAudit(session, {
    action: "payment.initialize",
    entity: "Payment",
    metadata: { studentId: student.id, weeks: parsed.data.weeks },
  });

  revalidatePath("/dashboard/payments");
}
