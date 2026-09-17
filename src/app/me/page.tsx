import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { requireStudent } from "@/lib/auth/guards";
import { prisma } from "@/lib/db";
import {
  daysOfWeek,
  endOfWeek,
  formatWeekLabel,
  startOfWeek,
  weekDayLabel,
} from "@/lib/date";
import { formatDateISO } from "@/lib/date";
import { calcNet, formatDate } from "@/lib/utils";
import { studentUpsertEval } from "./actions";

export default async function MyWeekPage() {
  const session = await requireStudent();
  const student = await prisma.student.findFirst({
    where: { userId: session.userId },
    include: { org: true },
  });
  if (!student) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Hesap Bağlı Değil</CardTitle>
          <CardDescription>
            Öğrenci kaydınız hocanız tarafından bağlanmamış görünüyor.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  const org = student.org;
  const today = new Date();
  const weekStart = startOfWeek(today, org.weekStartsOn);
  const weekEnd = endOfWeek(today, org.weekStartsOn);

  const plan = await prisma.weeklyPlan.findUnique({
    where: { studentId_weekStart: { studentId: student.id, weekStart } },
    include: {
      dailyPlans: { include: { subject: true }, orderBy: { order: "asc" } },
      evaluation: {
        include: { dailyEvals: true },
      },
    },
  });

  const days = daysOfWeek(weekStart);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Bu Haftaki Programım</h1>
        <p className="text-sm text-muted-foreground">
          {formatWeekLabel(weekStart, weekEnd)}
        </p>
      </div>

      {!plan ? (
        <Card>
          <CardHeader>
            <CardTitle>Bu Hafta Program Yok</CardTitle>
            <CardDescription>
              Hocanız henüz bu hafta için bir program oluşturmadı.
            </CardDescription>
          </CardHeader>
        </Card>
      ) : (
        <>
          <Card>
            <CardHeader>
              <CardTitle>Planlanan</CardTitle>
              <CardDescription>
                Hocanızın sizin için planladığı çalışmalar. Değerlendirmeyi
                günlük olarak aşağıdan girin.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {days.map((day) => {
                const plansForDay = plan.dailyPlans.filter(
                  (d) => d.dayDate.toDateString() === day.toDateString()
                );
                if (plansForDay.length === 0) return null;
                return (
                  <div key={day.toISOString()} className="rounded-md border p-3">
                    <div className="mb-2 flex items-center justify-between text-sm font-semibold">
                      <span>{weekDayLabel(day)}</span>
                      <span className="text-xs text-muted-foreground">
                        {formatDate(day)}
                      </span>
                    </div>
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="text-left text-xs text-muted-foreground">
                          <th className="py-1">Ders</th>
                          <th>Konu</th>
                          <th>Soru</th>
                          <th>Süre</th>
                        </tr>
                      </thead>
                      <tbody>
                        {plansForDay.map((dp) => (
                          <tr key={dp.id} className="border-t">
                            <td className="py-1">
                              <strong>{dp.subject.code}</strong>{" "}
                              <span className="text-xs text-muted-foreground">
                                {dp.subject.name}
                              </span>
                            </td>
                            <td className="text-xs">{dp.topicText ?? "—"}</td>
                            <td>{dp.plannedQuestions}</td>
                            <td>{dp.plannedMinutes} dk</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                );
              })}

              {plan.notes ? (
                <div className="rounded-md border p-3">
                  <div className="text-sm font-semibold">Hoca Notları</div>
                  <p className="whitespace-pre-wrap text-sm">{plan.notes}</p>
                </div>
              ) : null}
              {plan.priorities ? (
                <div className="rounded-md border p-3">
                  <div className="text-sm font-semibold">Öncelikler</div>
                  <p className="whitespace-pre-wrap text-sm">{plan.priorities}</p>
                </div>
              ) : null}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Değerlendirme Girişi</CardTitle>
              <CardDescription>
                Her plan satırı için D/Y/Boş ve süre gir. Kaydettiğinde
                hocanıza anlık yansır.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {days.map((day) => {
                const plansForDay = plan.dailyPlans.filter(
                  (d) => d.dayDate.toDateString() === day.toDateString()
                );
                if (plansForDay.length === 0) return null;
                return (
                  <div key={day.toISOString()} className="rounded-md border p-3">
                    <div className="mb-2 text-sm font-semibold">
                      {weekDayLabel(day)} · {formatDate(day)}
                    </div>
                    <div className="space-y-2">
                      {plansForDay.map((dp) => {
                        const ev = plan.evaluation?.dailyEvals.find(
                          (e) =>
                            e.subjectId === dp.subjectId &&
                            e.dayDate.toDateString() === day.toDateString()
                        );
                        return (
                          <form
                            key={dp.id}
                            action={studentUpsertEval}
                            className="grid grid-cols-6 items-center gap-2 text-sm"
                          >
                            <input type="hidden" name="weeklyPlanId" value={plan.id} />
                            <input type="hidden" name="dayDate" value={formatDateISO(day)} />
                            <input type="hidden" name="subjectId" value={dp.subjectId} />
                            <div>
                              <strong>{dp.subject.code}</strong>
                            </div>
                            <Input
                              name="correct"
                              type="number"
                              min="0"
                              defaultValue={ev?.correct ?? 0}
                              placeholder="D"
                            />
                            <Input
                              name="wrong"
                              type="number"
                              min="0"
                              defaultValue={ev?.wrong ?? 0}
                              placeholder="Y"
                            />
                            <Input
                              name="blank"
                              type="number"
                              min="0"
                              defaultValue={ev?.blank ?? 0}
                              placeholder="B"
                            />
                            <Input
                              name="minutes"
                              type="number"
                              min="0"
                              defaultValue={ev?.minutes ?? 0}
                              placeholder="dk"
                            />
                            <div className="flex items-center gap-2">
                              {ev ? (
                                <Badge
                                  variant={ev.enteredBy === "STUDENT" ? "default" : "outline"}
                                  className="text-[10px]"
                                >
                                  Net {calcNet(ev.correct, ev.wrong).toFixed(2)}
                                </Badge>
                              ) : null}
                              <Button type="submit" size="sm">
                                Kaydet
                              </Button>
                            </div>
                          </form>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </CardContent>
          </Card>
        </>
      )}

      <div className="flex gap-2">
        <Button asChild variant="outline">
          <Link href="/me/roadmap">Yol Haritam →</Link>
        </Button>
        <Button asChild variant="outline">
          <Link href="/me/progress">İlerleme Grafiklerim →</Link>
        </Button>
      </div>
    </div>
  );
}
