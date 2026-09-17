"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { requireTutor } from "@/lib/auth/guards";
import { createSession } from "@/lib/auth/session";
import { writeAudit } from "@/lib/audit";

const schema = z.object({
  name: z.string().trim().min(2),
  weekStartsOn: z.coerce.number().int().min(0).max(6),
});

export async function setupOrg(formData: FormData) {
  const session = await requireTutor();
  if (session.orgId) redirect("/dashboard");

  const parsed = schema.safeParse({
    name: formData.get("name"),
    weekStartsOn: formData.get("weekStartsOn"),
  });
  if (!parsed.success) redirect("/dashboard/onboarding?error=invalid");

  const org = await prisma.organization.create({
    data: {
      name: parsed.data.name,
      ownerUserId: session.userId,
      weekStartsOn: parsed.data.weekStartsOn,
    },
  });
  await prisma.user.update({
    where: { id: session.userId },
    data: { orgId: org.id },
  });

  await createSession({
    userId: session.userId,
    email: session.email,
    fullName: session.fullName,
    role: session.role,
    orgId: org.id,
    impersonatingUserId: session.impersonatingUserId,
    adminName: session.adminName,
  });

  await writeAudit(session, { action: "org.create", entity: "Organization", entityId: org.id });

  redirect("/dashboard");
}
