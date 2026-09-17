import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { requireStudent } from "@/lib/auth/guards";
import { prisma } from "@/lib/db";
import { MONTH_NAMES_TR, TRACK_LABELS } from "@/lib/constants";

export default async function StudentRoadmapPage() {
  const session = await requireStudent();
  const student = await prisma.student.findFirst({
    where: { userId: session.userId },
    include: {
      roadmap: {
        include: {
          template: {
            include: {
              weeks: {
                include: { cells: { include: { subject: true } } },
                orderBy: [{ monthIndex: "asc" }, { weekIndex: "asc" }],
              },
            },
          },
        },
      },
    },
  });

  if (!student) return null;

  if (!student.roadmap) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Yol Haritam</CardTitle>
          <CardDescription>
            Hocanız size henüz bir yol haritası atamadı.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  const tpl = student.roadmap.template;
  const byMonth = new Map<number, typeof tpl.weeks>();
  for (const w of tpl.weeks) {
    if (!byMonth.has(w.monthIndex)) byMonth.set(w.monthIndex, [] as typeof tpl.weeks);
    byMonth.get(w.monthIndex)!.push(w);
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Yol Haritam</h1>
        <p className="text-sm text-muted-foreground">
          {tpl.name} · {TRACK_LABELS[tpl.track]} · {tpl.year}
        </p>
      </div>

      {Array.from(byMonth.entries()).map(([mi, weeks]) => (
        <Card key={mi}>
          <CardHeader>
            <CardTitle>{MONTH_NAMES_TR[mi]}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-xs">
                <thead>
                  <tr className="bg-muted">
                    <th className="border p-2 text-left">Hafta</th>
                    {weeks[0]?.cells.map((c) => (
                      <th key={c.subjectId} className="border p-2 text-left">
                        {c.subject.code}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {weeks.map((w) => (
                    <tr key={w.id}>
                      <td className="border p-2 text-xs font-medium">
                        {w.label ?? `Hafta ${w.weekIndex + 1}`}
                      </td>
                      {w.cells.map((c) => (
                        <td key={c.id} className="border p-2 align-top">
                          {c.topicText || "—"}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
