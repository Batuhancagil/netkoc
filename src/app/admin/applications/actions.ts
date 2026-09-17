"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/auth/guards";
import { createInvite } from "@/lib/invite";
import { writeAudit } from "@/lib/audit";

export async function approveApplication(formData: FormData) {
  const session = await requireAdmin();
  const id = String(formData.get("id") ?? "");
  if (!id) redirect("/admin/applications");

  const app = await prisma.tutorApplication.findUnique({ where: { id } });
  if (!app || app.status !== "PENDING") redirect("/admin/applications");

  await prisma.tutorApplication.update({
    where: { id },
    data: {
      status: "APPROVED",
      reviewedAt: new Date(),
      reviewedBy: session.userId,
    },
  });

  const { url } = await createInvite({
    kind: "TUTOR",
    role: "TUTOR",
    createdById: session.userId,
    email: app.email,
    fullName: app.fullName,
  });

  await writeAudit(session, {
    action: "application.approve",
    entity: "TutorApplication",
    entityId: id,
  });

  redirect(`/admin/applications?invite=${encodeURIComponent(url)}`);
}

export async function rejectApplication(formData: FormData) {
  const session = await requireAdmin();
  const id = String(formData.get("id") ?? "");
  if (!id) redirect("/admin/applications");

  await prisma.tutorApplication.update({
    where: { id },
    data: {
      status: "REJECTED",
      reviewedAt: new Date(),
      reviewedBy: session.userId,
    },
  });

  await writeAudit(session, {
    action: "application.reject",
    entity: "TutorApplication",
    entityId: id,
  });

  revalidatePath("/admin/applications");
}
