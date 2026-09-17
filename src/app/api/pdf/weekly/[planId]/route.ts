import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireSession } from "@/lib/auth/guards";
import { buildWeeklyPlanPdf } from "@/features/pdf/weekly-plan";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ planId: string }> }
) {
  const { planId } = await params;
  const session = await requireSession();

  const plan = await prisma.weeklyPlan.findUnique({
    where: { id: planId },
    include: {
      student: { include: { org: true } },
      dailyPlans: {
        include: { subject: true },
        orderBy: [{ dayDate: "asc" }, { order: "asc" }],
      },
      evaluation: { include: { dailyEvals: { include: { subject: true } } } },
    },
  });
  if (!plan) return new NextResponse("Bulunamadı", { status: 404 });

  // Multi-tenant guard
  if (
    session.role !== "PLATFORM_ADMIN" &&
    session.orgId &&
    plan.student.orgId !== session.orgId
  ) {
    return new NextResponse("Yetkisiz", { status: 403 });
  }

  const buffer = await buildWeeklyPlanPdf(plan);

  return new NextResponse(buffer as unknown as BodyInit, {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `inline; filename=haftalik-program-${plan.weekNumber}.pdf`,
    },
  });
}
