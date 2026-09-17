"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { verifyPassword } from "@/lib/auth/password";
import { createSession } from "@/lib/auth/session";
import { dashboardPathForRole } from "@/lib/auth/paths";
import { writeAudit } from "@/lib/audit";

const schema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export async function loginAction(formData: FormData) {
  const parsed = schema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });
  if (!parsed.success) redirect("/login?error=invalid");

  const user = await prisma.user.findUnique({ where: { email: parsed.data.email } });
  if (!user || !user.passwordHash) redirect("/login?error=invalid");
  if (user.status === "DISABLED") redirect("/login?error=disabled");
  const ok = await verifyPassword(parsed.data.password, user.passwordHash);
  if (!ok) redirect("/login?error=invalid");

  await createSession({
    userId: user.id,
    email: user.email,
    fullName: user.fullName,
    role: user.role,
    orgId: user.orgId,
  });

  await writeAudit(
    {
      userId: user.id,
      email: user.email,
      fullName: user.fullName,
      role: user.role,
      orgId: user.orgId,
    },
    { action: "auth.login" }
  );

  redirect(dashboardPathForRole(user.role));
}
