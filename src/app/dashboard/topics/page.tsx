import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { requireTutorOrg } from "@/lib/tenant";
import { prisma } from "@/lib/db";
import { TRACK_LABELS } from "@/lib/constants";
import { calcNet } from "@/lib/utils";
import { addTopicSession } from "./actions";

export default async function TopicsPage({
  searchParams,
}: {
  searchParams: Promise<{ studentId?: string; subjectId?: string }>;
}) {
  const { org } = await requireTutorOrg();
  const { studentId, subjectId } = await searchParams;

  const students = await prisma.student.findMany({
    where: { orgId: org.id },
    orderBy: { fullName: "asc" },
  });
  const active = studentId ? students.find((s) => s.id === studentId) : students[0];
  if (!active) {
    return (
      <Card>
        <CardContent className="pt-6 text-sm text-muted-foreground">Önce öğrenci ekle.</CardContent>
      </Card>
    );
  }

  const subjects = await prisma.subject.findMany({
    where: {
      OR: [{ orgId: null }, { orgId: org.id }],
      tracks: { has: active.track },
    },
    include: { topics: { orderBy: { order: "asc" } } },
    orderBy: [{ level: "asc" }, { order: "asc" }],
  });

  const activeSubject = subjectId
    ? subjects.find((s) => s.id === subjectId)
    : subjects[0];

  const sessions = activeSubject
    ? await prisma.topicSession.findMany({
        where: { studentId: active.id, topic: { subjectId: activeSubject.id } },
        orderBy: { date: "desc" },
        include: { topic: true },
      })
    : [];

  // Aggregate by topic
  const agg = new Map<
    string,
    { topicName: string; total: number; correct: number; wrong: number; sessions: number }
  >();
  for (const s of sessions) {
    const current = agg.get(s.topicId) ?? {
      topicName: s.topic.name,
      total: 0,
      correct: 0,
      wrong: 0,
      sessions: 0,
    };
    current.total += s.testCount;
    current.correct += s.correct;
    current.wrong += s.wrong;
    current.sessions += 1;
    agg.set(s.topicId, current);
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Konu Takibi</h1>

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
        <div className="min-w-[240px] space-y-1">
          <Label>Ders</Label>
          <Select name="subjectId" defaultValue={activeSubject?.id ?? ""}>
            {subjects.map((s) => (
              <option key={s.id} value={s.id}>
                {s.code} — {s.name}
              </option>
            ))}
          </Select>
        </div>
        <Button type="submit" variant="outline">
          Seç
        </Button>
      </form>

      {activeSubject ? (
        <>
          <Card>
            <CardHeader>
              <CardTitle>Yeni Oturum Ekle</CardTitle>
            </CardHeader>
            <CardContent>
              <form
                action={addTopicSession}
                className="grid gap-3 md:grid-cols-6"
              >
                <input type="hidden" name="studentId" value={active.id} />
                <div className="space-y-1 md:col-span-2">
                  <Label>Konu</Label>
                  <Select name="topicId" required>
                    {activeSubject.topics.map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.name}
                      </option>
                    ))}
                  </Select>
                </div>
                <div className="space-y-1">
                  <Label>Tarih</Label>
                  <input
                    type="date"
                    name="date"
                    defaultValue={new Date().toISOString().slice(0, 10)}
                    required
                    className="h-10 w-full rounded-md border border-input bg-background px-2 text-sm"
                  />
                </div>
                <div className="space-y-1">
                  <Label>Test</Label>
                  <input
                    type="number"
                    name="testCount"
                    min="0"
                    defaultValue="40"
                    className="h-10 w-full rounded-md border border-input bg-background px-2 text-sm"
                  />
                </div>
                <div className="space-y-1">
                  <Label>D</Label>
                  <input
                    type="number"
                    name="correct"
                    min="0"
                    defaultValue="0"
                    className="h-10 w-full rounded-md border border-input bg-background px-2 text-sm"
                  />
                </div>
                <div className="space-y-1">
                  <Label>Y</Label>
                  <input
                    type="number"
                    name="wrong"
                    min="0"
                    defaultValue="0"
                    className="h-10 w-full rounded-md border border-input bg-background px-2 text-sm"
                  />
                </div>
                <div className="md:col-span-6">
                  <Button type="submit">Oturum Ekle</Button>
                </div>
              </form>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>
                {activeSubject.code} — {activeSubject.name}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <table className="w-full border-collapse text-xs">
                <thead>
                  <tr className="bg-muted">
                    <th className="border p-2 text-left">Konu</th>
                    <th className="border p-2 text-center">Oturum</th>
                    <th className="border p-2 text-center">Test</th>
                    <th className="border p-2 text-center">D</th>
                    <th className="border p-2 text-center">Y</th>
                    <th className="border p-2 text-center">Net</th>
                    <th className="border p-2 text-center">Başarı %</th>
                  </tr>
                </thead>
                <tbody>
                  {activeSubject.topics.map((t) => {
                    const a = agg.get(t.id);
                    const attempted = a ? a.correct + a.wrong : 0;
                    const success = a && attempted > 0 ? (a.correct / attempted) * 100 : 0;
                    return (
                      <tr key={t.id}>
                        <td className="border p-2">
                          {t.name} <Badge variant="outline" className="ml-2">{t.level}</Badge>
                        </td>
                        <td className="border p-2 text-center">{a?.sessions ?? 0}</td>
                        <td className="border p-2 text-center">{a?.total ?? 0}</td>
                        <td className="border p-2 text-center">{a?.correct ?? 0}</td>
                        <td className="border p-2 text-center">{a?.wrong ?? 0}</td>
                        <td className="border p-2 text-center font-medium">
                          {a ? calcNet(a.correct, a.wrong) : "—"}
                        </td>
                        <td className="border p-2 text-center">
                          {a && attempted > 0 ? `${success.toFixed(0)}%` : "—"}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Son Oturumlar</CardTitle>
            </CardHeader>
            <CardContent>
              {sessions.length === 0 ? (
                <p className="text-sm text-muted-foreground">Kayıt yok.</p>
              ) : (
                <ul className="divide-y text-sm">
                  {sessions.slice(0, 20).map((s) => (
                    <li key={s.id} className="flex items-center justify-between py-2">
                      <span>
                        <strong>{s.topic.name}</strong>{" "}
                        <span className="text-muted-foreground">
                          · {new Date(s.date).toLocaleDateString("tr-TR")}
                        </span>
                      </span>
                      <span className="text-xs">
                        {s.testCount} test · {s.correct}D / {s.wrong}Y · net{" "}
                        {calcNet(s.correct, s.wrong)}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>
        </>
      ) : null}
    </div>
  );
}
