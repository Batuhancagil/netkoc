"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/auth/guards";
import { createInvite } from "@/lib/invite";
import { writeAudit } from "@/lib/audit";
import { createSession, getSession } from "@/lib/auth/session";

const inviteSchema = z.object({
  fullName: z.string().trim().min(2),
  email: z.string().trim().toLowerCase().email(),
  orgName: z.string().trim().optional().or(z.literal("")),
});

export async function createTutorInvite(formData: FormData) {
  const session = await requireAdmin();
  const parsed = inviteSchema.safeParse({
    fullName: formData.get("fullName"),
    email: formData.get("email"),
    orgName: formData.get("orgName"),
  });
  if (!parsed.success) redirect("/admin/tutors?error=invalid");

  const orgName =
    parsed.data.orgName && parsed.data.orgName.length > 0
      ? parsed.data.orgName
      : `${parsed.data.fullName} Koçluk`;

  const { url } = await createInvite({
    kind: "TUTOR",
    role: "TUTOR",
    createdById: session.userId,
    email: parsed.data.email,
    fullName: parsed.data.fullName,
  });

  await writeAudit(session, {
    action: "invite.create",
    entity: "Invite",
    metadata: { kind: "TUTOR", email: parsed.data.email, orgName },
  });

  redirect(`/admin/tutors?invite=${encodeURIComponent(url)}`);
}

export async function toggleTutorStatus(formData: FormData) {
  const session = await requireAdmin();
  const userId = String(formData.get("userId") ?? "");
  if (!userId) redirect("/admin/tutors");

  const tutor = await prisma.user.findUnique({ where: { id: userId } });
  if (!tutor || tutor.role !== "TUTOR") redirect("/admin/tutors");

  const nextStatus = tutor.status === "DISABLED" ? "ACTIVE" : "DISABLED";
  await prisma.user.update({
    where: { id: userId },
    data: { status: nextStatus },
  });

  if (tutor.orgId) {
    await prisma.organization.update({
      where: { id: tutor.orgId },
      data: { disabledAt: nextStatus === "DISABLED" ? new Date() : null },
    });
  }

  await writeAudit(session, {
    action: "tutor.toggleStatus",
    entity: "User",
    entityId: userId,
    metadata: { to: nextStatus },
  });
  revalidatePath("/admin/tutors");
}

export async function startImpersonation(formData: FormData) {
  const session = await requireAdmin();
  const targetId = String(formData.get("userId") ?? "");
  if (!targetId) redirect("/admin/tutors");

  const target = await prisma.user.findUnique({ where: { id: targetId } });
  if (!target) redirect("/admin/tutors");

  await createSession(
    {
      userId: target.id,
      email: target.email,
      fullName: target.fullName,
      role: target.role,
      orgId: target.orgId,
      impersonatingUserId: session.userId,
      adminName: session.fullName,
    },
    60 * 60
  );

  await writeAudit(session, {
    action: "impersonate.start",
    entity: "User",
    entityId: target.id,
  });

  redirect("/dashboard");
}

export async function stopImpersonation() {
  const session = await getSession();
  if (!session?.impersonatingUserId) redirect("/admin");
  const adminId = session.impersonatingUserId;
  const admin = await prisma.user.findUnique({ where: { id: adminId } });
  if (!admin) redirect("/login");
  await createSession({
    userId: admin.id,
    email: admin.email,
    fullName: admin.fullName,
    role: admin.role,
    orgId: admin.orgId,
  });
  await writeAudit(
    {
      userId: admin.id,
      email: admin.email,
      fullName: admin.fullName,
      role: admin.role,
      orgId: admin.orgId,
    },
    { action: "impersonate.stop", entity: "User", entityId: session.userId }
  );
  redirect("/admin/tutors");
}
