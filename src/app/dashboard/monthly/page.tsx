import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { requireTutorOrg } from "@/lib/tenant";
import { prisma } from "@/lib/db";
import { TRACK_LABELS } from "@/lib/constants";
import { MonthlyBarChart } from "@/components/monthly-chart";

export default async function MonthlyReportPage({
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
  const active = studentId ? students.find((s) => s.id === studentId) : students[0];
  if (!active) {
    return <p className="text-sm text-muted-foreground">Önce öğrenci ekle.</p>;
  }

  const plans = await prisma.weeklyPlan.findMany({
    where: { studentId: active.id },
    orderBy: { weekStart: "asc" },
    include: {
      evaluation: { include: { dailyEvals: { include: { subject: true } } } },
    },
  });

  const rowMap = new Map<
    string,
    { label: string; counts: Record<string, number> }
  >();
  const subjectCodes = new Set<string>();

  for (const p of plans) {
    const key = `W${p.weekNumber}`;
    const row = rowMap.get(key) ?? {
      label: `Hafta ${p.weekNumber}`,
      counts: {},
    };
    for (const e of p.evaluation?.dailyEvals ?? []) {
      const attempted = e.correct + e.wrong + e.blank;
      row.counts[e.subject.code] = (row.counts[e.subject.code] ?? 0) + attempted;
      subjectCodes.add(e.subject.code);
    }
    rowMap.set(key, row);
  }

  const data = Array.from(rowMap.values()).map((r) => ({
    label: r.label,
    ...r.counts,
  }));

  const totalByCode: Record<string, number> = {};
  for (const row of rowMap.values()) {
    for (const [code, n] of Object.entries(row.counts)) {
      totalByCode[code] = (totalByCode[code] ?? 0) + (n as number);
    }
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Aylık / Haftalık Soru Raporu</h1>

      <form method="get" className="flex flex-wrap items-end gap-3">
        <div className="min-w-[240px] space-y-1">
          <Label>Öğrenci</Label>
          <Select name="studentId" defaultValue={active.id}>
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

      <Card>
        <CardHeader>
          <CardTitle>Haftalara göre çözülen soru sayısı</CardTitle>
        </CardHeader>
        <CardContent>
          {data.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              Henüz değerlendirme girişi yok.
            </p>
          ) : (
            <MonthlyBarChart data={data} subjectCodes={Array.from(subjectCodes)} />
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Toplam Soru Özeti</CardTitle>
        </CardHeader>
        <CardContent>
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr className="bg-muted">
                <th className="border p-2 text-left">Ders</th>
                <th className="border p-2 text-right">Toplam Çözülen</th>
              </tr>
            </thead>
            <tbody>
              {Object.entries(totalByCode)
                .sort((a, b) => b[1] - a[1])
                .map(([code, total]) => (
                  <tr key={code}>
                    <td className="border p-2">{code}</td>
                    <td className="border p-2 text-right">{total}</td>
                  </tr>
                ))}
              {Object.keys(totalByCode).length === 0 ? (
                <tr>
                  <td colSpan={2} className="border p-3 text-center text-muted-foreground">
                    Veri yok.
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  );
}
