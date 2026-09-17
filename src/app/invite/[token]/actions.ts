"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { hashPassword } from "@/lib/auth/password";
import { createSession } from "@/lib/auth/session";
import { dashboardPathForRole } from "@/lib/auth/paths";
import { writeAudit } from "@/lib/audit";

const schema = z
  .object({
    token: z.string().min(1),
    fullName: z.string().trim().min(2),
    email: z.string().trim().toLowerCase().email(),
    password: z.string().min(8),
    password2: z.string().min(8),
  })
  .refine((d) => d.password === d.password2, {
    message: "Şifreler eşleşmiyor",
    path: ["password2"],
  });

export async function acceptInvite(formData: FormData) {
  const parsed = schema.safeParse({
    token: formData.get("token"),
    fullName: formData.get("fullName"),
    email: formData.get("email"),
    password: formData.get("password"),
    password2: formData.get("password2"),
  });
  if (!parsed.success) {
    const token = String(formData.get("token") ?? "");
    redirect(`/invite/${token}?error=password`);
  }

  const invite = await prisma.invite.findUnique({ where: { token: parsed.data.token } });
  if (!invite || invite.usedAt || invite.expiresAt < new Date()) {
    redirect(`/invite/${parsed.data.token}?error=invalid`);
  }

  const passwordHash = await hashPassword(parsed.data.password);

  // Run in a transaction to keep consistency
  const user = await prisma.$transaction(async (tx) => {
    // For TUTOR invites: create user + organization
    if (invite.kind === "TUTOR") {
      const existing = await tx.user.findUnique({ where: { email: parsed.data.email } });
      if (existing) throw new Error("E-posta zaten kullanımda");

      const newUser = await tx.user.create({
        data: {
          email: parsed.data.email,
          fullName: parsed.data.fullName,
          passwordHash,
          role: "TUTOR",
          status: "ACTIVE",
        },
      });
      const org = await tx.organization.create({
        data: {
          name: `${parsed.data.fullName} Koçluk`,
          ownerUserId: newUser.id,
        },
      });
      await tx.user.update({
        where: { id: newUser.id },
        data: { orgId: org.id },
      });
      await tx.invite.update({
        where: { id: invite.id },
        data: { usedAt: new Date() },
      });
      return { ...newUser, orgId: org.id };
    }

    // STUDENT invite: link existing Student row to a new user
    if (invite.kind === "STUDENT") {
      const existing = await tx.user.findUnique({ where: { email: parsed.data.email } });
      if (existing) throw new Error("E-posta zaten kullanımda");

      const newUser = await tx.user.create({
        data: {
          email: parsed.data.email,
          fullName: parsed.data.fullName,
          passwordHash,
          role: "STUDENT",
          status: "ACTIVE",
          orgId: invite.orgId,
        },
      });
      if (invite.studentId) {
        await tx.student.update({
          where: { id: invite.studentId },
          data: { userId: newUser.id },
        });
      }
      await tx.invite.update({
        where: { id: invite.id },
        data: { usedAt: new Date() },
      });
      return newUser;
    }

    // PARENT invite
    if (invite.kind === "PARENT") {
      let newUser = await tx.user.findUnique({ where: { email: parsed.data.email } });
      if (!newUser) {
        newUser = await tx.user.create({
          data: {
            email: parsed.data.email,
            fullName: parsed.data.fullName,
            passwordHash,
            role: "PARENT",
            status: "ACTIVE",
          },
        });
      } else if (!newUser.passwordHash) {
        newUser = await tx.user.update({
          where: { id: newUser.id },
          data: { passwordHash, fullName: parsed.data.fullName, role: "PARENT" },
        });
      }
      if (invite.linkStudentId) {
        await tx.parentLink.upsert({
          where: {
            parentUserId_studentId: {
              parentUserId: newUser.id,
              studentId: invite.linkStudentId,
            },
          },
          create: {
            parentUserId: newUser.id,
            studentId: invite.linkStudentId,
          },
          update: {},
        });
      }
      await tx.invite.update({
        where: { id: invite.id },
        data: { usedAt: new Date() },
      });
      return newUser;
    }

    throw new Error("Unknown invite kind");
  });

  await createSession({
    userId: user.id,
    email: user.email,
    fullName: user.fullName,
    role: user.role,
    orgId: user.orgId ?? null,
  });

  await writeAudit(
    {
      userId: user.id,
      email: user.email,
      fullName: user.fullName,
      role: user.role,
      orgId: user.orgId ?? null,
    },
    { action: "invite.accept", entity: "Invite", entityId: invite.id }
  );

  redirect(dashboardPathForRole(user.role));
}
