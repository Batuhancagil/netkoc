import Link from "next/link";
import { redirect } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { requireTutor } from "@/lib/auth/guards";
import { prisma } from "@/lib/db";

export default async function DashboardOverview() {
  const session = await requireTutor();
  if (!session.orgId) redirect("/dashboard/onboarding");

  const [students, upcomingWeeklyPlans, pendingPayments] = await Promise.all([
    prisma.student.count({ where: { orgId: session.orgId } }),
    prisma.weeklyPlan.count({
      where: {
        student: { orgId: session.orgId },
        weekStart: { gte: new Date() },
      },
    }),
    prisma.payment.count({
      where: {
        student: { orgId: session.orgId },
        paidAt: null,
        dueDate: { lte: new Date() },
      },
    }),
  ]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Hoca Paneli</h1>
        <Button asChild>
          <Link href="/dashboard/students/new">Yeni Öğrenci</Link>
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Metric label="Öğrenci Sayısı" value={students} href="/dashboard/students" />
        <Metric
          label="Planlanmış Haftalık Program"
          value={upcomingWeeklyPlans}
          href="/dashboard/weekly"
        />
        <Metric
          label="Bekleyen Ödeme"
          value={pendingPayments}
          href="/dashboard/payments"
        />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Başlarken</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <p>1. <Link className="text-primary underline" href="/dashboard/students">Öğrenci ekle</Link> ve alan (Sayısal/EA/Sözel/Dil) seç.</p>
          <p>2. <Link className="text-primary underline" href="/dashboard/roadmap">Yol haritası</Link> — sistem şablonundan başla, öğrenciye özel düzenle.</p>
          <p>3. <Link className="text-primary underline" href="/dashboard/weekly">Haftalık program</Link> — yol haritasından ön-doldur, öğrenciyle beraber güncelle.</p>
          <p>4. <Link className="text-primary underline" href="/dashboard/trials">Deneme analizi</Link> — TYT/AYT netleri ve branş denemeleri.</p>
        </CardContent>
      </Card>
    </div>
  );
}

function Metric({ label, value, href }: { label: string; value: number; href: string }) {
  return (
    <Link href={href}>
      <Card className="transition hover:shadow-md">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">{label}</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-3xl font-bold">{value}</p>
        </CardContent>
      </Card>
    </Link>
  );
}
