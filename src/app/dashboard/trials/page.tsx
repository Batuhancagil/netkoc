import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { requireTutorOrg } from "@/lib/tenant";
import { prisma } from "@/lib/db";
import { TRACK_LABELS } from "@/lib/constants";
import { aytNets, aytTotal, tytNets, tytTotal } from "@/lib/trial";
import { formatDate } from "@/lib/utils";
import { TrialTrendChart } from "@/components/trial-trend-chart";
import { createTrialExam, deleteTrialExam } from "./actions";

export default async function TrialsPage({
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

  const trials = await prisma.trialExam.findMany({
    where: { studentId: active.id },
    orderBy: { date: "asc" },
  });

  const trendData = trials.map((t) => ({
    date: new Date(t.date).toLocaleDateString("tr-TR"),
    "TYT Toplam": Number(tytTotal(t).toFixed(2)),
    "AYT Toplam": Number(aytTotal(t).toFixed(2)),
    "TYT Türkçe": Number(tytNets(t).turkce.toFixed(2)),
    "TYT Mat": Number(tytNets(t).mat.toFixed(2)),
  }));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Deneme Analizi</h1>
        <Button asChild variant="outline">
          <Link href={`/dashboard/trials/branch?studentId=${active.id}`}>
            Branş Denemeleri →
          </Link>
        </Button>
      </div>

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
          <CardTitle>Yeni Deneme Ekle</CardTitle>
          <CardDescription>
            TYT, AYT veya birleşik (TYTAYT) deneme sonuçlarını gir. Netler
            otomatik hesaplanır.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form action={createTrialExam} className="space-y-4">
            <input type="hidden" name="studentId" value={active.id} />
            <div className="grid gap-3 md:grid-cols-4">
              <div className="space-y-1">
                <Label>Tarih</Label>
                <Input type="date" name="date" required defaultValue={new Date().toISOString().slice(0, 10)} />
              </div>
              <div className="space-y-1">
                <Label>Tür</Label>
                <Select name="type" defaultValue="TYTAYT">
                  <option value="TYT">TYT</option>
                  <option value="AYT">AYT</option>
                  <option value="TYTAYT">TYT + AYT</option>
                </Select>
              </div>
              <div className="space-y-1 md:col-span-2">
                <Label>Yayın</Label>
                <Input name="publication" placeholder="ör. 3D, Limit, Simetri" />
              </div>
            </div>

            <div className="rounded-md border p-3">
              <div className="mb-2 text-sm font-semibold">TYT</div>
              <div className="grid grid-cols-4 gap-2 text-xs">
                {[
                  ["Türkçe", "turkce"],
                  ["Sosyal", "sosyal"],
                  ["Matematik", "mat"],
                  ["Fen", "fen"],
                ].map(([label, key]) => (
                  <div key={key} className="space-y-1 rounded border p-2">
                    <div className="font-medium">{label}</div>
                    <label className="flex items-center gap-1">D <input name={`${key}D`} type="number" defaultValue="0" min="0" className="w-14 rounded border bg-background p-1" /></label>
                    <label className="flex items-center gap-1">Y <input name={`${key}Y`} type="number" defaultValue="0" min="0" className="w-14 rounded border bg-background p-1" /></label>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-md border p-3">
              <div className="mb-2 text-sm font-semibold">AYT</div>
              <div className="grid grid-cols-4 gap-2 text-xs">
                {[
                  ["Mat", "aytMat"],
                  ["Fizik", "aytFiz"],
                  ["Kimya", "aytKim"],
                  ["Biyoloji", "aytBiy"],
                  ["Edebiyat", "aytEdb"],
                  ["Tarih", "aytTar"],
                  ["Coğrafya", "aytCog"],
                  ["Felsefe", "aytFel"],
                ].map(([label, key]) => (
                  <div key={key} className="space-y-1 rounded border p-2">
                    <div className="font-medium">{label}</div>
                    <label className="flex items-center gap-1">D <input name={`${key}D`} type="number" defaultValue="0" min="0" className="w-14 rounded border bg-background p-1" /></label>
                    <label className="flex items-center gap-1">Y <input name={`${key}Y`} type="number" defaultValue="0" min="0" className="w-14 rounded border bg-background p-1" /></label>
                  </div>
                ))}
              </div>
            </div>

            <Button type="submit">Denemeyi Kaydet</Button>
          </form>
        </CardContent>
      </Card>

      {trendData.length > 0 ? (
        <Card>
          <CardHeader>
            <CardTitle>Trend</CardTitle>
          </CardHeader>
          <CardContent>
            <TrialTrendChart
              data={trendData}
              series={[
                { key: "TYT Toplam", label: "TYT Toplam Net", color: "#2563eb" },
                { key: "AYT Toplam", label: "AYT Toplam Net", color: "#dc2626" },
                { key: "TYT Türkçe", label: "TYT Türkçe", color: "#16a34a" },
                { key: "TYT Mat", label: "TYT Mat", color: "#eab308" },
              ]}
            />
          </CardContent>
        </Card>
      ) : null}

      <Card>
        <CardHeader>
          <CardTitle>Kayıtlı Denemeler</CardTitle>
        </CardHeader>
        <CardContent>
          {trials.length === 0 ? (
            <p className="text-sm text-muted-foreground">Henüz deneme yok.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-xs">
                <thead>
                  <tr className="bg-muted">
                    <th className="border p-2 text-left">Tarih</th>
                    <th className="border p-2 text-left">Yayın</th>
                    <th className="border p-2 text-left">Tür</th>
                    <th className="border p-2">TYT Tür</th>
                    <th className="border p-2">TYT Sos</th>
                    <th className="border p-2">TYT Mat</th>
                    <th className="border p-2">TYT Fen</th>
                    <th className="border p-2">TYT Top</th>
                    <th className="border p-2">AYT Mat</th>
                    <th className="border p-2">AYT Fen</th>
                    <th className="border p-2">AYT Söz</th>
                    <th className="border p-2">AYT Top</th>
                    <th className="border p-2" />
                  </tr>
                </thead>
                <tbody>
                  {trials.slice().reverse().map((t) => {
                    const tn = tytNets(t);
                    const an = aytNets(t);
                    return (
                      <tr key={t.id}>
                        <td className="border p-2">{formatDate(t.date)}</td>
                        <td className="border p-2">{t.publication ?? "—"}</td>
                        <td className="border p-2">{t.type}</td>
                        <td className="border p-2 text-center">{tn.turkce.toFixed(1)}</td>
                        <td className="border p-2 text-center">{tn.sosyal.toFixed(1)}</td>
                        <td className="border p-2 text-center">{tn.mat.toFixed(1)}</td>
                        <td className="border p-2 text-center">{tn.fen.toFixed(1)}</td>
                        <td className="border p-2 text-center font-medium">{tytTotal(t).toFixed(1)}</td>
                        <td className="border p-2 text-center">{an.mat.toFixed(1)}</td>
                        <td className="border p-2 text-center">
                          {(an.fiz + an.kim + an.biy).toFixed(1)}
                        </td>
                        <td className="border p-2 text-center">
                          {(an.edb + an.tar + an.cog + an.fel).toFixed(1)}
                        </td>
                        <td className="border p-2 text-center font-medium">{aytTotal(t).toFixed(1)}</td>
                        <td className="border p-1 text-center">
                          <form action={deleteTrialExam}>
                            <input type="hidden" name="id" value={t.id} />
                            <button className="text-destructive hover:underline">sil</button>
                          </form>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

