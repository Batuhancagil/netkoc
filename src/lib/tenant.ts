import { redirect } from "next/navigation";
import { requireTutor } from "./auth/guards";
import { prisma } from "./db";

export async function requireTutorOrg() {
  const session = await requireTutor();
  if (!session.orgId) {
    redirect("/dashboard/onboarding");
  }
  const org = await prisma.organization.findUnique({
    where: { id: session.orgId! },
  });
  if (!org) redirect("/dashboard/onboarding");
  return { session, org };
}
