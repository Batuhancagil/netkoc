import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { createSession, getSession } from "@/lib/auth/session";
import { writeAudit } from "@/lib/audit";
import { publicUrl } from "@/lib/public-url";

export async function POST(req: Request) {
  const session = await getSession();
  if (!session?.impersonatingUserId) {
    return NextResponse.redirect(publicUrl("/admin", req), { status: 303 });
  }
  const admin = await prisma.user.findUnique({
    where: { id: session.impersonatingUserId },
  });
  if (!admin) {
    return NextResponse.redirect(publicUrl("/login", req), { status: 303 });
  }
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
  return NextResponse.redirect(publicUrl("/admin/tutors", req), { status: 303 });
}
