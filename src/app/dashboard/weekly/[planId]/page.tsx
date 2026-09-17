import Link from "next/link";
import { notFound } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { requireTutorOrg } from "@/lib/tenant";
import { prisma } from "@/lib/db";
import { daysOfWeek, weekDayLabel, formatWeekLabel } from "@/lib/date";
import { calcNet } from "@/lib/utils";
import {
  applyQuestionTargets,
  deleteDailyPlan,
  updatePlanNotes,
  upsertDailyEval,
  upsertDailyPlan,
} from "../actions";

export default async function WeeklyPlanEditor({
  params,
}: {
  params: Promise<{ planId: string }>;
}) {
  const { planId } = await params;
  const { org } = await requireTutorOrg();
  const plan = await prisma.weeklyPlan.findFirst({
    where: { id: planId, student: { orgId: org.id } },
    include: {
      student: true,
      dailyPlans: {
        include: { subject: true },
        orderBy: [{ dayDate: "asc" }, { order: "asc" }],
      },
      evaluation: {
        include: { dailyEvals: { include: { subject: true } } },
      },
    },
  });
  if (!plan) notFound();

  const subjects = await prisma.subject.findMany({
    where: {
      OR: [{ orgId: null }, { orgId: org.id }],
      tracks: { has: plan.student.track },
    },
    include: { topics: { orderBy: { order: "asc" } } },
    orderBy: [{ level: "asc" }, { order: "asc" }],
  });
  const planSubjects = Array.from(
    new Map(plan.dailyPlans.map((d) => [d.subjectId, d.subject])).values()
  );

  const days = daysOfWeek(plan.weekStart);
  const evalMap = new Map<string, any>();
  for (const de of plan.evaluation?.dailyEvals ?? []) {
    const key = `${de.dayDate.toISOString().slice(0, 10)}_${de.subjectId}`;
    evalMap.set(key, de);
  }

  const weeklyTotals = { correct: 0, wrong: 0, blank: 0, minutes: 0 };
  for (const e of plan.evaluation?.dailyEvals ?? []) {
    weeklyTotals.correct += e.correct;
    weeklyTotals.wrong += e.wrong;
    weeklyTotals.blank += e.blank;
    weeklyTotals.minutes += e.minutes;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">
            {plan.student.fullName} — Hafta {plan.weekNumber}
          </h1>
          <p className="text-sm text-muted-foreground">
            {formatWeekLabel(plan.weekStart, plan.weekEnd)}
          </p>
        </div>
        <div className="flex gap-2">
          <Button asChild variant="outline">
            <Link href={`/api/pdf/weekly/${plan.id}`} target="_blank">
              PDF İndir
            </Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/dashboard/weekly">Geri</Link>
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Toplu soru hedefi</CardTitle>
          <CardDescription>
            Bir derse veya haftadaki tüm konulara aynı çözülecek soru sayısını yaz. Tek tek
            satırda da değiştirebilirsin. Boş bırakılan hedef 0 olabilir; öğrenci yine de
            çözdüğünü girer.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form action={applyQuestionTargets} className="grid gap-3 md:grid-cols-4">
            <input type="hidden" name="weeklyPlanId" value={plan.id} />
            <div className="space-y-1">
              <Label>Kapsam</Label>
              <Select name="subjectId" defaultValue="">
                <option value="">Tüm hafta / tüm konular</option>
                {planSubjects.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.code} — {s.name}
                  </option>
                ))}
              </Select>
            </div>
            <div className="space-y-1">
              <Label>Çözülecek soru</Label>
              <Input name="plannedQuestions" type="number" min={0} defaultValue={40} required />
            </div>
            <div className="space-y-1">
              <Label>Süre (dk, opsiyonel)</Label>
              <Input name="plannedMinutes" type="number" min={0} placeholder="Boş = dokunma" />
            </div>
            <div className="flex items-end">
              <Button type="submit">Toplu uygula</Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Yol haritasından dersler</CardTitle>
          <CardDescription>
            Hazır gelen ders ve konuları değiştir, sil veya güne başka ders ekle.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 lg:grid-cols-2">
            {days.map((day) => {
              const items = plan.dailyPlans.filter(
                (d) => d.dayDate.toDateString() === day.toDateString()
              );
              return (
                <div key={day.toISOString()} className="rounded-lg border p-3">
                  <div className="mb-2 flex items-center justify-between">
                    <strong>
                      {weekDayLabel(day)}{" "}
                      <span className="text-xs text-muted-foreground">
                        {day.toLocaleDateString("tr-TR")}
                      </span>
                    </strong>
                  </div>
                  <ul className="mb-3 space-y-2">
                    {items.length === 0 ? (
                      <li className="text-xs text-muted-foreground">Plan yok.</li>
                    ) : (
                      items.map((dp) => (
                        <li key={dp.id} className="rounded border p-2 text-xs">
                          <div className="flex items-center justify-between gap-2">
                            <span className="font-medium">{dp.subject.code}</span>
                            <form action={deleteDailyPlan}>
                              <input type="hidden" name="id" value={dp.id} />
                              <button
                                type="submit"
                                className="text-[10px] text-destructive hover:underline"
                              >
                                sil
                              </button>
                            </form>
                          </div>
                          <form action={upsertDailyPlan} className="mt-1 space-y-1">
                            <input type="hidden" name="weeklyPlanId" value={plan.id} />
                            <input type="hidden" name="id" value={dp.id} />
                            <input
                              type="hidden"
                              name="dayDate"
                              value={day.toISOString()}
                            />
                            <select
                              name="subjectId"
                              defaultValue={dp.subjectId}
                              className="w-full rounded border bg-background p-1 text-xs"
                            >
                              {subjects.map((s) => (
                                <option key={s.id} value={s.id}>
                                  {s.code} — {s.name}
                                </option>
                              ))}
                            </select>
                            <input
                              name="topicText"
                              defaultValue={dp.topicText ?? ""}
                              list={`topics-${dp.subjectId}`}
                              placeholder="Konu — listeden seç veya yaz"
                              className="w-full rounded border bg-background p-1 text-xs"
                            />
                            <datalist id={`topics-${dp.subjectId}`}>
                              {(subjects.find((s) => s.id === dp.subjectId)?.topics ?? []).map((t) => (
                                <option key={t.id} value={t.name} />
                              ))}
                            </datalist>
                            <div className="flex gap-1">
                              <input
                                name="plannedQuestions"
                                type="number"
                                min="0"
                                defaultValue={dp.plannedQuestions}
                                className="w-16 rounded border bg-background p-1 text-xs"
                                placeholder="Soru"
                              />
                              <input
                                name="plannedMinutes"
                                type="number"
                                min="0"
                                defaultValue={dp.plannedMinutes}
                                className="w-16 rounded border bg-background p-1 text-xs"
                                placeholder="Dk"
                              />
                              <button
                                type="submit"
                                className="rounded bg-primary/10 px-2 text-[10px] text-primary hover:bg-primary/20"
                              >
                                Kaydet
                              </button>
                            </div>
                          </form>
                        </li>
                      ))
                    )}
                  </ul>
                  <details>
                    <summary className="cursor-pointer text-xs text-primary">
                      + Yeni plan
                    </summary>
                    <form
                      action={upsertDailyPlan}
                      className="mt-2 flex flex-wrap gap-1 text-xs"
                    >
                      <input type="hidden" name="weeklyPlanId" value={plan.id} />
                      <input type="hidden" name="dayDate" value={day.toISOString()} />
                      <select
                        name="subjectId"
                        required
                        className="rounded border bg-background p-1 text-xs"
                      >
                        {subjects.map((s) => (
                          <option key={s.id} value={s.id}>
                            {s.code} — {s.name}
                          </option>
                        ))}
                      </select>
                      <input
                        name="topicText"
                        placeholder="Konu"
                        className="min-w-[100px] flex-1 rounded border bg-background p-1 text-xs"
                      />
                      <input
                        name="plannedQuestions"
                        type="number"
                        min="0"
                        placeholder="Soru"
                        defaultValue={0}
                        className="w-16 rounded border bg-background p-1 text-xs"
                      />
                      <input
                        name="plannedMinutes"
                        type="number"
                        min="0"
                        placeholder="Dk"
                        defaultValue={0}
                        className="w-16 rounded border bg-background p-1 text-xs"
                      />
                      <button
                        type="submit"
                        className="rounded bg-primary px-2 py-1 text-[10px] font-medium text-primary-foreground hover:bg-primary/90"
                      >
                        Ekle
                      </button>
                    </form>
                  </details>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Haftalık Değerlendirme</CardTitle>
          <CardDescription>
            Çözülen soru (D/Y/B). Hedef 0 olsa da, hoca girmese de öğrenci kendi
            panelinden aynı satırlara yazabilir.
          </CardDescription>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          <table className="w-full border-collapse text-xs">
            <thead>
              <tr className="bg-muted">
                <th className="border p-2 text-left">Gün</th>
                <th className="border p-2 text-left">Ders</th>
                <th className="border p-2 text-left">Konu</th>
                <th className="border p-2">Plan</th>
                <th className="border p-2">D</th>
                <th className="border p-2">Y</th>
                <th className="border p-2">B</th>
                <th className="border p-2">Dk</th>
                <th className="border p-2">Net</th>
                <th className="border p-2">Giren</th>
                <th className="border p-2" />
              </tr>
            </thead>
            <tbody>
              {plan.dailyPlans.length === 0 ? (
                <tr>
                  <td colSpan={11} className="border p-3 text-center text-muted-foreground">
                    Önce günlük plan ekleyin.
                  </td>
                </tr>
              ) : (
                plan.dailyPlans.map((dp) => {
                  const key = `${dp.dayDate.toISOString().slice(0, 10)}_${dp.subjectId}`;
                  const ev = evalMap.get(key);
                  return (
                    <tr key={dp.id}>
                      <td className="border p-2">{weekDayLabel(dp.dayDate)}</td>
                      <td className="border p-2 font-medium">{dp.subject.code}</td>
                      <td className="border p-2">{dp.topicText ?? "—"}</td>
                      <td className="border p-2 text-center">
                        {dp.plannedQuestions} / {dp.plannedMinutes}dk
                      </td>
                      <td className="border p-1">
                        <form
                          action={upsertDailyEval}
                          id={`eval-${dp.id}`}
                          className="contents"
                        >
                          <input type="hidden" name="weeklyPlanId" value={plan.id} />
                          <input type="hidden" name="dayDate" value={dp.dayDate.toISOString()} />
                          <input type="hidden" name="subjectId" value={dp.subjectId} />
                          <input
                            form={`eval-${dp.id}`}
                            name="correct"
                            type="number"
                            min="0"
                            defaultValue={ev?.correct ?? 0}
                            className="w-14 rounded border bg-background p-1 text-center text-xs"
                          />
                        </form>
                      </td>
                      <td className="border p-1">
                        <input
                          form={`eval-${dp.id}`}
                          name="wrong"
                          type="number"
                          min="0"
                          defaultValue={ev?.wrong ?? 0}
                          className="w-14 rounded border bg-background p-1 text-center text-xs"
                        />
                      </td>
                      <td className="border p-1">
                        <input
                          form={`eval-${dp.id}`}
                          name="blank"
                          type="number"
                          min="0"
                          defaultValue={ev?.blank ?? 0}
                          className="w-14 rounded border bg-background p-1 text-center text-xs"
                        />
                      </td>
                      <td className="border p-1">
                        <input
                          form={`eval-${dp.id}`}
                          name="minutes"
                          type="number"
                          min="0"
                          defaultValue={ev?.minutes ?? 0}
                          className="w-14 rounded border bg-background p-1 text-center text-xs"
                        />
                      </td>
                      <td className="border p-2 text-center font-medium">
                        {ev ? calcNet(ev.correct, ev.wrong) : "—"}
                      </td>
                      <td className="border p-2 text-center text-xs">
                        {ev?.enteredBy === "STUDENT" ? "Ö" : ev?.enteredBy === "TEACHER" ? "H" : "—"}
                      </td>
                      <td className="border p-1 text-center">
                        <button
                          form={`eval-${dp.id}`}
                          type="submit"
                          className="rounded bg-primary px-2 py-1 text-[10px] text-primary-foreground hover:bg-primary/90"
                        >
                          Kaydet
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
            <tfoot>
              <tr className="bg-muted font-medium">
                <td colSpan={4} className="border p-2 text-right">
                  Haftalık Toplam
                </td>
                <td className="border p-2 text-center">{weeklyTotals.correct}</td>
                <td className="border p-2 text-center">{weeklyTotals.wrong}</td>
                <td className="border p-2 text-center">{weeklyTotals.blank}</td>
                <td className="border p-2 text-center">{weeklyTotals.minutes}</td>
                <td className="border p-2 text-center">
                  {calcNet(weeklyTotals.correct, weeklyTotals.wrong)}
                </td>
                <td colSpan={2} />
              </tr>
            </tfoot>
          </table>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Notlar</CardTitle>
        </CardHeader>
        <CardContent>
          <form action={updatePlanNotes} className="grid gap-3 md:grid-cols-2">
            <input type="hidden" name="weeklyPlanId" value={plan.id} />
            <div className="space-y-2">
              <Label htmlFor="priorities">Öncelikli çalışılması gerekenler</Label>
              <Textarea
                id="priorities"
                name="priorities"
                defaultValue={plan.priorities ?? ""}
                rows={4}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="notes">Haftanın notları</Label>
              <Textarea id="notes" name="notes" defaultValue={plan.notes ?? ""} rows={4} />
            </div>
            <div className="md:col-span-2">
              <Button type="submit">Notları Kaydet</Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
