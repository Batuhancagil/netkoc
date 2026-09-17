import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
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
import { ensureWeeklyForDate } from "@/lib/weekly-from-roadmap";
import { studentLogSolved, studentUpsertEval } from "./actions";

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
  const ensured = await ensureWeeklyForDate(student.id, today, org.weekStartsOn);

  const plan = await prisma.weeklyPlan.findUnique({
    where: { id: ensured.id },
    include: {
      dailyPlans: { include: { subject: true }, orderBy: { order: "asc" } },
      evaluation: { include: { dailyEvals: true } },
    },
  });

  const weekStart = plan?.weekStart ?? startOfWeek(today, org.weekStartsOn);
  const weekEnd = plan?.weekEnd ?? endOfWeek(today, org.weekStartsOn);

  const subjects = await prisma.subject.findMany({
    where: {
      OR: [{ orgId: null }, { orgId: org.id }],
      tracks: { has: student.track },
    },
    orderBy: [{ level: "asc" }, { order: "asc" }],
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
            <CardTitle>Bu hafta için satır yok</CardTitle>
            <CardDescription>
              Yine de aşağıdan çözdüğün soruları girebilirsin.
            </CardDescription>
          </CardHeader>
        </Card>
      ) : (
        <>
          <Card>
            <CardHeader>
              <CardTitle>Bu haftanın dersleri</CardTitle>
              <CardDescription>
                Yol haritasından gelen konular. Hoca hedef yazmasa da çözdüğünü kaydedebilirsin.
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
                      <span className="text-xs text-muted-foreground">{formatDate(day)}</span>
                    </div>
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="text-left text-xs text-muted-foreground">
                          <th className="py-1">Ders</th>
                          <th>Konu</th>
                          <th>Hedef</th>
                        </tr>
                      </thead>
                      <tbody>
                        {plansForDay.map((dp) => (
                          <tr key={dp.id} className="border-t">
                            <td className="py-1">
                              <strong>{dp.subject.code}</strong>{" "}
                              <span className="text-xs text-muted-foreground">{dp.subject.name}</span>
                            </td>
                            <td className="text-xs">{dp.topicText ?? "—"}</td>
                            <td className="text-xs">
                              {dp.plannedQuestions > 0
                                ? `${dp.plannedQuestions} soru`
                                : "hedef yok"}
                              {dp.plannedMinutes > 0 ? ` · ${dp.plannedMinutes} dk` : ""}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                );
              })}
              {plan.dailyPlans.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  Bu hafta henüz ders satırı yok. Aşağıdan çözdüğün soruyu ekle.
                </p>
              ) : null}

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
              <CardTitle>Çözdüğüm sorular</CardTitle>
              <CardDescription>
                Hoca hedef girmese de D/Y/Boş yaz. Hocanın paneline düşer.
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

      <Card>
        <CardHeader>
          <CardTitle>Listede yoksa da çözdüğümü ekle</CardTitle>
          <CardDescription>
            Hocanın planına bakmadan bugün çözdüğün dersi kaydet.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form action={studentLogSolved} className="grid gap-3 md:grid-cols-6">
            <Select name="subjectId" required>
              {subjects.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.code} — {s.name}
                </option>
              ))}
            </Select>
            <Input name="correct" type="number" min={0} placeholder="Doğru" required />
            <Input name="wrong" type="number" min={0} placeholder="Yanlış" required />
            <Input name="blank" type="number" min={0} placeholder="Boş" defaultValue={0} />
            <Input name="minutes" type="number" min={0} placeholder="dk" defaultValue={0} />
            <Button type="submit">Ekle</Button>
          </form>
        </CardContent>
      </Card>

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
