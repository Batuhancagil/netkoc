import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { requireTutorOrg } from "@/lib/tenant";
import { prisma } from "@/lib/db";
import { TRACK_LABELS } from "@/lib/constants";
import { formatDate } from "@/lib/utils";
import { startOfWeek, endOfWeek, formatDateISO } from "@/lib/date";
import { createWeeklyPlan } from "./actions";

export default async function WeeklyPlanOverview({
  searchParams,
}: {
  searchParams: Promise<{ studentId?: string }>;
}) {
  const { org } = await requireTutorOrg();
  const { studentId } = await searchParams;

  const students = await prisma.student.findMany({
    where: { orgId: org.id },
    orderBy: { fullName: "asc" },
  });
  const active = studentId
    ? students.find((s) => s.id === studentId)
    : students[0];

  const plans = active
    ? await prisma.weeklyPlan.findMany({
        where: { studentId: active.id },
        orderBy: { weekStart: "desc" },
        include: { _count: { select: { dailyPlans: true } } },
        take: 30,
      })
    : [];

  const today = new Date();
  const suggestedStart = formatDateISO(startOfWeek(today, org.weekStartsOn));
  const suggestedEnd = formatDateISO(endOfWeek(today, org.weekStartsOn));

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Haftalık Program</h1>

      <form method="get" className="flex flex-wrap items-end gap-3">
        <div className="min-w-[240px] space-y-1">
          <Label>Öğrenci</Label>
          <Select name="studentId" defaultValue={active?.id ?? ""}>
            {students.map((s) => (
              <option key={s.id} value={s.id}>
                {s.fullName} ({TRACK_LABELS[s.track]})
              </option>
            ))}
          </Select>
        </div>
        <Button type="submit" variant="outline">
          Seç
        </Button>
      </form>

      {!active ? (
        <Card>
          <CardContent className="pt-6 text-sm text-muted-foreground">
            Önce öğrenci ekle.
          </CardContent>
        </Card>
      ) : (
        <>
          <Card>
            <CardHeader>
              <CardTitle>Yeni Hafta Oluştur</CardTitle>
              <CardDescription>
                Haftanın başlangıç ve bitiş tarihini gir. Yol haritası atanmışsa
                hücreler otomatik ön-doldurulur.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form action={createWeeklyPlan} className="grid gap-3 md:grid-cols-4">
                <input type="hidden" name="studentId" value={active.id} />
                <div className="space-y-1">
                  <Label htmlFor="weekStart">Başlangıç</Label>
                  <Input
                    id="weekStart"
                    type="date"
                    name="weekStart"
                    defaultValue={suggestedStart}
                    required
                  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="weekEnd">Bitiş</Label>
                  <Input
                    id="weekEnd"
                    type="date"
                    name="weekEnd"
                    defaultValue={suggestedEnd}
                    required
                  />
                </div>
                <div className="space-y-1 md:col-span-2">
                  <Label htmlFor="weekNumber">Hafta No</Label>
                  <Input
                    id="weekNumber"
                    type="number"
                    name="weekNumber"
                    min="1"
                    max="52"
                    defaultValue={plans.length > 0 ? plans[0].weekNumber + 1 : 1}
                  />
                </div>
                <div className="md:col-span-4">
                  <Button type="submit">Oluştur ve Ön-doldur</Button>
                </div>
              </form>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Kayıtlı Haftalar</CardTitle>
            </CardHeader>
            <CardContent>
              {plans.length === 0 ? (
                <p className="text-sm text-muted-foreground">Henüz kayıt yok.</p>
              ) : (
                <ul className="divide-y">
                  {plans.map((p) => (
                    <li key={p.id} className="flex items-center justify-between py-2 text-sm">
                      <div>
                        <div className="font-medium">Hafta {p.weekNumber}</div>
                        <div className="text-xs text-muted-foreground">
                          {formatDate(p.weekStart)} - {formatDate(p.weekEnd)} ·{" "}
                          {p._count.dailyPlans} satır
                        </div>
                      </div>
                      <Button asChild size="sm" variant="outline">
                        <Link href={`/dashboard/weekly/${p.id}`}>Aç</Link>
                      </Button>
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
