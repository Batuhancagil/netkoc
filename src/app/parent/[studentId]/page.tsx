import { notFound } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { requireParent } from "@/lib/auth/guards";
import { prisma } from "@/lib/db";
import { TRACK_LABELS } from "@/lib/constants";
import { calcNet, formatDate, formatTL } from "@/lib/utils";
import { TrialTrendChart } from "@/components/trial-trend-chart";
import { aytTotal, tytTotal } from "@/lib/trial";
import { MonthlyBarChart } from "@/components/monthly-chart";

export default async function ParentStudentPage({
  params,
}: {
  params: Promise<{ studentId: string }>;
}) {
  const session = await requireParent();
  const { studentId } = await params;

  const link = await prisma.parentLink.findFirst({
    where: { parentUserId: session.userId, studentId },
    include: {
      student: { include: { org: true } },
    },
  });
  if (!link) notFound();

  const student = link.student;

  // Last 12 weeks of evaluations
  const since = new Date();
  since.setDate(since.getDate() - 90);

  const evals = await prisma.dailyEval.findMany({
    where: {
      weeklyEval: { weeklyPlan: { studentId: student.id } },
      dayDate: { gte: since },
    },
    include: { subject: true },
    orderBy: { dayDate: "asc" },
  });

  const totalsBySubject = new Map<
    string,
    { code: string; name: string; d: number; y: number; b: number; min: number }
  >();
  for (const e of evals) {
    const key = e.subjectId;
    const row = totalsBySubject.get(key) ?? {
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
    totalsBySubject.set(key, row);
  }

  const weekMap = new Map<string, Record<string, number>>();
  for (const e of evals) {
    const d = new Date(e.dayDate);
    d.setHours(0, 0, 0, 0);
    const ws = new Date(d);
    ws.setDate(d.getDate() - ((d.getDay() + 6) % 7));
    const key = ws.toISOString().slice(0, 10);
    const row = weekMap.get(key) ?? {};
    row[e.subject.code] = (row[e.subject.code] ?? 0) + e.correct + e.wrong + e.blank;
    weekMap.set(key, row);
  }
  const chartData = Array.from(weekMap.entries())
    .sort()
    .map(([k, v]) => ({ label: k.slice(5), ...v }));
  const subjectCodes = Array.from(new Set(evals.map((e) => e.subject.code)));

  const trials = await prisma.trialExam.findMany({
    where: { studentId: student.id },
    orderBy: { date: "asc" },
  });
  const trialChart = trials.map((t) => ({
    date: new Date(t.date).toLocaleDateString("tr-TR"),
    "TYT Toplam": Number(tytTotal(t).toFixed(2)),
    "AYT Toplam": Number(aytTotal(t).toFixed(2)),
  }));

  const payments = await prisma.payment.findMany({
    where: { studentId: student.id },
    orderBy: { weekIndex: "asc" },
  });
  const totalPlanned = payments.reduce((s, p) => s + (p.amount ? Number(p.amount) : 0), 0);
  const totalPaid = payments.reduce(
    (s, p) => s + (p.paidAt && p.amount ? Number(p.amount) : 0),
    0
  );
  const paidCount = payments.filter((p) => p.paidAt).length;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">{student.fullName}</h1>
        <p className="text-sm text-muted-foreground">
          {TRACK_LABELS[student.track]} · {student.org.name}
        </p>
      </div>

      <div className="grid gap-3 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Ödenen Hafta</CardDescription>
            <CardTitle className="text-2xl">
              {paidCount}/{payments.length}
            </CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Toplam Ödenen</CardDescription>
            <CardTitle className="text-2xl">{formatTL(totalPaid)}</CardTitle>
          </CardHeader>
          <CardContent className="text-xs text-muted-foreground">
            Planlanan: {formatTL(totalPlanned)}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Son 90 gün Soru</CardDescription>
            <CardTitle className="text-2xl">
              {evals.reduce((s, e) => s + e.correct + e.wrong + e.blank, 0)}
            </CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Deneme Sayısı</CardDescription>
            <CardTitle className="text-2xl">{trials.length}</CardTitle>
          </CardHeader>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Haftalık Soru Dağılımı (son 90 gün)</CardTitle>
        </CardHeader>
        <CardContent>
          {chartData.length === 0 ? (
            <p className="text-sm text-muted-foreground">Henüz veri yok.</p>
          ) : (
            <MonthlyBarChart data={chartData} subjectCodes={subjectCodes} />
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Ders Özetleri</CardTitle>
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
              {Array.from(totalsBySubject.values()).length === 0 ? (
                <tr>
                  <td colSpan={6} className="border p-3 text-center text-muted-foreground">
                    Kayıt yok.
                  </td>
                </tr>
              ) : (
                Array.from(totalsBySubject.values()).map((r) => (
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
            <CardTitle>Deneme Trendi</CardTitle>
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

      <Card>
        <CardHeader>
          <CardTitle>Ödeme Durumu</CardTitle>
        </CardHeader>
        <CardContent>
          {payments.length === 0 ? (
            <p className="text-sm text-muted-foreground">Henüz ödeme tanımlı değil.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-sm">
                <thead>
                  <tr className="bg-muted">
                    <th className="border p-2 text-left">Hafta</th>
                    <th className="border p-2 text-left">Vade</th>
                    <th className="border p-2 text-left">Tutar</th>
                    <th className="border p-2 text-center">Durum</th>
                  </tr>
                </thead>
                <tbody>
                  {payments.map((p) => (
                    <tr key={p.id}>
                      <td className="border p-2">{p.weekIndex}</td>
                      <td className="border p-2">{formatDate(p.dueDate)}</td>
                      <td className="border p-2">
                        {p.amount ? formatTL(Number(p.amount)) : "—"}
                      </td>
                      <td className="border p-2 text-center">
                        {p.paidAt ? (
                          <Badge className="bg-emerald-600 text-white">
                            Ödendi ({formatDate(p.paidAt)})
                          </Badge>
                        ) : (
                          <Badge variant="outline">Bekliyor</Badge>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
