import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { requireTutorOrg } from "@/lib/tenant";
import { prisma } from "@/lib/db";
import { TRACK_LABELS } from "@/lib/constants";
import { calcNet, formatDate } from "@/lib/utils";
import { createBranchTrial, deleteBranchTrial } from "../actions";

export default async function BranchTrialsPage({
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

  const subjects = await prisma.subject.findMany({
    where: {
      OR: [{ orgId: null }, { orgId: org.id }],
      tracks: { has: active.track },
    },
    orderBy: [{ level: "asc" }, { order: "asc" }],
  });

  const branchTrials = await prisma.branchTrial.findMany({
    where: { studentId: active.id },
    orderBy: { date: "desc" },
    include: { subject: true },
  });

  // Aggregate averages per subject
  const agg = new Map<string, { code: string; name: string; total: number; correct: number; wrong: number; count: number }>();
  for (const b of branchTrials) {
    const current = agg.get(b.subjectId) ?? {
      code: b.subject.code,
      name: b.subject.name,
      total: 0,
      correct: 0,
      wrong: 0,
      count: 0,
    };
    current.total += b.correct + b.wrong + b.blank;
    current.correct += b.correct;
    current.wrong += b.wrong;
    current.count += 1;
    agg.set(b.subjectId, current);
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Branş Denemeleri</h1>
        <Button asChild variant="outline">
          <Link href={`/dashboard/trials?studentId=${active.id}`}>← Genel Deneme</Link>
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
        <Button type="submit" variant="outline">Seç</Button>
      </form>

      <Card>
        <CardHeader>
          <CardTitle>Yeni Branş Denemesi</CardTitle>
          <CardDescription>
            Tek branşa özel deneme (ör. TYT Matematik branş, AYT Fen branş).
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form action={createBranchTrial} className="grid gap-3 md:grid-cols-6">
            <input type="hidden" name="studentId" value={active.id} />
            <div className="space-y-1 md:col-span-2">
              <Label>Ders</Label>
              <Select name="subjectId" required>
                {subjects.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.code} — {s.name}
                  </option>
                ))}
              </Select>
            </div>
            <div className="space-y-1">
              <Label>Tarih</Label>
              <Input
                type="date"
                name="date"
                required
                defaultValue={new Date().toISOString().slice(0, 10)}
              />
            </div>
            <div className="space-y-1">
              <Label>Yayın</Label>
              <Input name="publication" placeholder="ör. 3D, Karekök" />
            </div>
            <div className="space-y-1">
              <Label>D</Label>
              <Input type="number" name="correct" min="0" defaultValue="0" />
            </div>
            <div className="space-y-1">
              <Label>Y</Label>
              <Input type="number" name="wrong" min="0" defaultValue="0" />
            </div>
            <div className="space-y-1">
              <Label>Boş</Label>
              <Input type="number" name="blank" min="0" defaultValue="0" />
            </div>
            <div className="md:col-span-6">
              <Button type="submit">Kaydet</Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Derslere Göre Özet</CardTitle>
        </CardHeader>
        <CardContent>
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr className="bg-muted">
                <th className="border p-2 text-left">Ders</th>
                <th className="border p-2 text-center">Deneme Sayısı</th>
                <th className="border p-2 text-center">Ort. D</th>
                <th className="border p-2 text-center">Ort. Y</th>
                <th className="border p-2 text-center">Ort. Net</th>
              </tr>
            </thead>
            <tbody>
              {Array.from(agg.values()).length === 0 ? (
                <tr>
                  <td colSpan={5} className="border p-3 text-center text-muted-foreground">
                    Kayıt yok.
                  </td>
                </tr>
              ) : (
                Array.from(agg.values()).map((a) => (
                  <tr key={a.code}>
                    <td className="border p-2">
                      <strong>{a.code}</strong>{" "}
                      <span className="text-muted-foreground">{a.name}</span>
                    </td>
                    <td className="border p-2 text-center">{a.count}</td>
                    <td className="border p-2 text-center">{(a.correct / a.count).toFixed(1)}</td>
                    <td className="border p-2 text-center">{(a.wrong / a.count).toFixed(1)}</td>
                    <td className="border p-2 text-center font-medium">
                      {(calcNet(a.correct, a.wrong) / a.count).toFixed(2)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Tüm Kayıtlar</CardTitle>
        </CardHeader>
        <CardContent>
          <table className="w-full border-collapse text-xs">
            <thead>
              <tr className="bg-muted">
                <th className="border p-2 text-left">Tarih</th>
                <th className="border p-2 text-left">Ders</th>
                <th className="border p-2 text-left">Yayın</th>
                <th className="border p-2 text-center">D</th>
                <th className="border p-2 text-center">Y</th>
                <th className="border p-2 text-center">B</th>
                <th className="border p-2 text-center">Net</th>
                <th className="border p-2" />
              </tr>
            </thead>
            <tbody>
              {branchTrials.length === 0 ? (
                <tr>
                  <td colSpan={8} className="border p-3 text-center text-muted-foreground">
                    Kayıt yok.
                  </td>
                </tr>
              ) : (
                branchTrials.map((b) => (
                  <tr key={b.id}>
                    <td className="border p-2">{formatDate(b.date)}</td>
                    <td className="border p-2">
                      <strong>{b.subject.code}</strong>
                    </td>
                    <td className="border p-2">{b.publication ?? "—"}</td>
                    <td className="border p-2 text-center">{b.correct}</td>
                    <td className="border p-2 text-center">{b.wrong}</td>
                    <td className="border p-2 text-center">{b.blank}</td>
                    <td className="border p-2 text-center font-medium">
                      {calcNet(b.correct, b.wrong)}
                    </td>
                    <td className="border p-1 text-center">
                      <form action={deleteBranchTrial}>
                        <input type="hidden" name="id" value={b.id} />
                        <button className="text-destructive hover:underline">sil</button>
                      </form>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  );
}
