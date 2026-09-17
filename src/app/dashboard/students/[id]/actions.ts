"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { requireTutorOrg } from "@/lib/tenant";
import { createInvite } from "@/lib/invite";
import { writeAudit } from "@/lib/audit";

const studentInviteSchema = z.object({
  studentId: z.string().min(1),
  email: z.string().trim().toLowerCase().email(),
});

const parentInviteSchema = z.object({
  studentId: z.string().min(1),
  fullName: z.string().trim().min(2),
  email: z.string().trim().toLowerCase().email(),
});

export async function inviteStudent(formData: FormData) {
  const { session, org } = await requireTutorOrg();
  const parsed = studentInviteSchema.safeParse({
    studentId: formData.get("studentId"),
    email: formData.get("email"),
  });
  if (!parsed.success) redirect("/dashboard/students");

  const student = await prisma.student.findFirst({
    where: { id: parsed.data.studentId, orgId: org.id },
  });
  if (!student) redirect("/dashboard/students");

  const { url } = await createInvite({
    kind: "STUDENT",
    role: "STUDENT",
    createdById: session.userId,
    email: parsed.data.email,
    fullName: student.fullName,
    orgId: org.id,
    studentId: student.id,
  });

  await writeAudit(session, {
    action: "invite.create",
    entity: "Invite",
    metadata: { kind: "STUDENT", studentId: student.id, email: parsed.data.email },
  });

  redirect(`/dashboard/students/${student.id}?invite=${encodeURIComponent(url)}`);
}

export async function inviteParent(formData: FormData) {
  const { session, org } = await requireTutorOrg();
  const parsed = parentInviteSchema.safeParse({
    studentId: formData.get("studentId"),
    fullName: formData.get("fullName"),
    email: formData.get("email"),
  });
  if (!parsed.success) redirect("/dashboard/students");

  const student = await prisma.student.findFirst({
    where: { id: parsed.data.studentId, orgId: org.id },
  });
  if (!student) redirect("/dashboard/students");

  const { url } = await createInvite({
    kind: "PARENT",
    role: "PARENT",
    createdById: session.userId,
    email: parsed.data.email,
    fullName: parsed.data.fullName,
    orgId: org.id,
    linkStudentId: student.id,
  });

  await writeAudit(session, {
    action: "invite.create",
    entity: "Invite",
    metadata: { kind: "PARENT", studentId: student.id, email: parsed.data.email },
  });

  redirect(`/dashboard/students/${student.id}?invite=${encodeURIComponent(url)}`);
}
