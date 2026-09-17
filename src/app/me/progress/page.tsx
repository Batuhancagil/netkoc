import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { requireStudent } from "@/lib/auth/guards";
import { prisma } from "@/lib/db";
import { calcNet, formatDate } from "@/lib/utils";
import { MonthlyBarChart } from "@/components/monthly-chart";
import { TrialTrendChart } from "@/components/trial-trend-chart";
import { aytTotal, tytTotal, tytNets } from "@/lib/trial";

export default async function StudentProgressPage() {
  const session = await requireStudent();
  const student = await prisma.student.findFirst({ where: { userId: session.userId } });
  if (!student) return null;

  const now = new Date();
  const thirty = new Date(now);
  thirty.setDate(now.getDate() - 90);

  const evals = await prisma.dailyEval.findMany({
    where: {
      weeklyEval: { weeklyPlan: { studentId: student.id } },
      dayDate: { gte: thirty, lte: now },
    },
    include: { subject: true },
    orderBy: { dayDate: "asc" },
  });

  const totals = new Map<string, { code: string; name: string; d: number; y: number; b: number; min: number }>();
  for (const e of evals) {
    const key = e.subjectId;
    const row = totals.get(key) ?? {
      code: e.subject.code,
      name: e.subject.name,
      d: 0,
      y: 0,
      b: 0,
      min: 0,
    };
    row.d += e.correct;
    row.y += e.wrong;
    row.b += e.blank;
    row.min += e.minutes;
    totals.set(key, row);
  }

  // Weekly aggregation for chart (last 12 weeks)
  const weekMap = new Map<string, Record<string, number>>();
  for (const e of evals) {
    const d = new Date(e.dayDate);
    d.setHours(0, 0, 0, 0);
    const weekStart = new Date(d);
    weekStart.setDate(d.getDate() - ((d.getDay() + 6) % 7));
    const key = weekStart.toISOString().slice(0, 10);
    const row = weekMap.get(key) ?? {};
    row[e.subject.code] = (row[e.subject.code] ?? 0) + e.correct + e.wrong + e.blank;
    weekMap.set(key, row);
  }
  const chartData = Array.from(weekMap.entries())
    .sort()
    .map(([k, v]) => ({ label: k.slice(5), ...v }));
  const allCodes = Array.from(new Set(evals.map((e) => e.subject.code)));

  const trials = await prisma.trialExam.findMany({
    where: { studentId: student.id },
    orderBy: { date: "asc" },
  });
  const trialChart = trials.map((t) => ({
    date: new Date(t.date).toLocaleDateString("tr-TR"),
    "TYT Toplam": Number(tytTotal(t).toFixed(2)),
    "AYT Toplam": Number(aytTotal(t).toFixed(2)),
    "TYT Türkçe": Number(tytNets(t).turkce.toFixed(2)),
    "TYT Mat": Number(tytNets(t).mat.toFixed(2)),
  }));

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">İlerlemem</h1>

      <Card>
        <CardHeader>
          <CardTitle>Haftalık Soru Dağılımı (son 90 gün)</CardTitle>
        </CardHeader>
        <CardContent>
          {chartData.length === 0 ? (
            <p className="text-sm text-muted-foreground">Henüz veri yok.</p>
          ) : (
            <MonthlyBarChart data={chartData} subjectCodes={allCodes} />
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Derslere Göre Toplam</CardTitle>
          <CardDescription>Son 90 günde çözülen soru toplamları.</CardDescription>
        </CardHeader>
        <CardContent>
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr className="bg-muted">
                <th className="border p-2 text-left">Ders</th>
                <th className="border p-2 text-center">D</th>
                <th className="border p-2 text-center">Y</th>
                <th className="border p-2 text-center">B</th>
                <th className="border p-2 text-center">Net</th>
                <th className="border p-2 text-center">Süre</th>
              </tr>
            </thead>
            <tbody>
              {Array.from(totals.values()).length === 0 ? (
                <tr>
                  <td colSpan={6} className="border p-3 text-center text-muted-foreground">
                    Kayıt yok.
                  </td>
                </tr>
              ) : (
                Array.from(totals.values()).map((r) => (
                  <tr key={r.code}>
                    <td className="border p-2">
                      <strong>{r.code}</strong>{" "}
                      <span className="text-muted-foreground">{r.name}</span>
                    </td>
                    <td className="border p-2 text-center">{r.d}</td>
                    <td className="border p-2 text-center">{r.y}</td>
                    <td className="border p-2 text-center">{r.b}</td>
                    <td className="border p-2 text-center font-medium">
                      {calcNet(r.d, r.y).toFixed(2)}
                    </td>
                    <td className="border p-2 text-center">{r.min} dk</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </CardContent>
      </Card>

      {trialChart.length > 0 ? (
        <Card>
          <CardHeader>
            <CardTitle>Deneme Trendim</CardTitle>
          </CardHeader>
          <CardContent>
            <TrialTrendChart
              data={trialChart}
              series={[
                { key: "TYT Toplam", label: "TYT Toplam Net", color: "#2563eb" },
                { key: "AYT Toplam", label: "AYT Toplam Net", color: "#dc2626" },
              ]}
            />
          </CardContent>
        </Card>
      ) : null}

      {trials.length > 0 ? (
        <Card>
          <CardHeader>
            <CardTitle>Denemelerim</CardTitle>
          </CardHeader>
          <CardContent>
            <table className="w-full border-collapse text-xs">
              <thead>
                <tr className="bg-muted">
                  <th className="border p-2 text-left">Tarih</th>
                  <th className="border p-2 text-left">Yayın</th>
                  <th className="border p-2 text-center">TYT Net</th>
                  <th className="border p-2 text-center">AYT Net</th>
                </tr>
              </thead>
              <tbody>
                {trials
                  .slice()
                  .reverse()
                  .map((t) => (
                    <tr key={t.id}>
                      <td className="border p-2">{formatDate(t.date)}</td>
                      <td className="border p-2">{t.publication ?? "—"}</td>
                      <td className="border p-2 text-center">{tytTotal(t).toFixed(1)}</td>
                      <td className="border p-2 text-center">{aytTotal(t).toFixed(1)}</td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </CardContent>
        </Card>
      ) : null}
    </div>
  );
}
