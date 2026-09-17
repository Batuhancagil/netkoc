"use client";

import { useMemo, useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { isOfficialTopic, joinTopics, matchOfficialTopics } from "@/lib/topic-text";
import { MONTH_NAMES_TR } from "@/lib/constants";
import { saveRoadmapGrid, addWeekLesson, addSubjectColumn, createSubjectTopic, createOrgSubject } from "@/app/dashboard/roadmap/actions";

export type EditorSubject = {
  id: string;
  code: string;
  name: string;
  topics: { id: string; name: string }[];
};

export type EditorWeek = {
  id: string;
  monthIndex: number;
  weekIndex: number;
  label: string | null;
  cells: { id: string; subjectId: string; topicText: string }[];
};

export function RoadmapGridEditor({
  templateId,
  studentId,
  weeks,
  subjects,
}: {
  templateId: string;
  studentId?: string;
  weeks: EditorWeek[];
  subjects: EditorSubject[];
}) {
  const subjectMap = useMemo(() => new Map(subjects.map((s) => [s.id, s])), [subjects]);
  const columnIds = useMemo(() => {
    const seen: string[] = [];
    for (const w of weeks) {
      for (const c of w.cells) {
        if (!seen.includes(c.subjectId)) seen.push(c.subjectId);
      }
    }
    return seen.sort((a, b) => {
      const ao = subjects.findIndex((s) => s.id === a);
      const bo = subjects.findIndex((s) => s.id === b);
      return (ao === -1 ? 999 : ao) - (bo === -1 ? 999 : bo);
    });
  }, [weeks, subjects]);

  const [draft, setDraft] = useState<Record<string, string[]>>(() => {
    const next: Record<string, string[]> = {};
    for (const w of weeks) {
      for (const c of w.cells) {
        const official = subjects.find((s) => s.id === c.subjectId)?.topics.map((t) => t.name) ?? [];
        next[c.id] = matchOfficialTopics(c.topicText, official);
      }
    }
    return next;
  });
  const [message, setMessage] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function setCell(cellId: string, topics: string[]) {
    setDraft((prev) => ({ ...prev, [cellId]: topics }));
    setMessage(null);
  }

  function addTopic(cellId: string, name: string) {
    const n = name.trim();
    if (!n) return;
    const current = draft[cellId] ?? [];
    if (current.some((t) => t.toLocaleLowerCase("tr-TR") === n.toLocaleLowerCase("tr-TR"))) return;
    setCell(cellId, [...current, n]);
  }

  function removeTopic(cellId: string, name: string) {
    setCell(
      cellId,
      (draft[cellId] ?? []).filter((t) => t !== name)
    );
  }

  function saveAll() {
    const payload = Object.entries(draft).map(([id, topics]) => ({
      id,
      topicText: joinTopics(topics),
    }));
    const fd = new FormData();
    fd.set("templateId", templateId);
    if (studentId) fd.set("studentId", studentId);
    fd.set("payload", JSON.stringify(payload));
    startTransition(async () => {
      await saveRoadmapGrid(fd);
      setMessage("Tüm hücreler kaydedildi.");
    });
  }

  return (
    <div className="space-y-4">
      <div className="sticky top-0 z-20 flex flex-wrap items-center justify-between gap-3 rounded-md border bg-card/95 p-3 backdrop-blur">
        <p className="text-sm text-muted-foreground">
          Hücrede Kaydet yok. Konuyu o dersin listesinden seç; bir hücrede birden fazla konu, sağda
          haftaya başka ders. Bitince Tümünü kaydet.
        </p>
        <Button type="button" onClick={saveAll} disabled={pending}>
          {pending ? "Kaydediliyor…" : "Tümünü kaydet"}
        </Button>
      </div>
      {message ? <p className="text-sm text-emerald-700">{message}</p> : null}

      <div className="overflow-x-auto">
        <table className="w-full min-w-[720px] border-collapse text-xs">
          <thead>
            <tr className="bg-muted">
              <th className="sticky left-0 z-10 border bg-muted p-2 text-left">Hafta</th>
              {columnIds.map((id) => {
                const s = subjectMap.get(id);
                return (
                  <th key={id} className="border p-2 text-left">
                    <div>{s?.code ?? "Ders"}</div>
                    <div className="font-normal text-muted-foreground">{s?.name}</div>
                  </th>
                );
              })}
              <th className="border p-2 text-left">Bu haftaya ders</th>
            </tr>
          </thead>
          <tbody>
            {weeks.map((w) => (
              <tr key={w.id}>
                <td className="sticky left-0 z-10 border bg-card p-2 align-top font-medium">
                  <div>{MONTH_NAMES_TR[w.monthIndex]}</div>
                  <div className="text-muted-foreground">{w.label ?? `Hafta ${w.weekIndex + 1}`}</div>
                </td>
                {columnIds.map((subjectId) => {
                  const cell = w.cells.find((c) => c.subjectId === subjectId);
                  const subject = subjectMap.get(subjectId);
                  if (!cell || !subject) {
                    return (
                      <td key={subjectId} className="border p-2 align-top text-muted-foreground">
                        <AddLessonInline
                          templateId={templateId}
                          studentId={studentId}
                          weekId={w.id}
                          subjectId={subjectId}
                          topics={subject?.topics ?? []}
                        />
                      </td>
                    );
                  }
                  const selected = draft[cell.id] ?? [];
                  const unused = subject.topics.filter(
                    (t) => !selected.some((s) => s.toLocaleLowerCase("tr-TR") === t.name.toLocaleLowerCase("tr-TR"))
                  );
                  return (
                    <td key={subjectId} className="border p-1 align-top">
                      <div className="flex flex-col gap-1">
                        <div className="flex flex-wrap gap-1">
                          {selected.length === 0 ? (
                            <span className="text-muted-foreground">Konu yok</span>
                          ) : (
                            selected.map((t) => {
                              const official = isOfficialTopic(
                                t,
                                subject.topics.map((x) => x.name)
                              );
                              return (
                                <button
                                  key={t}
                                  type="button"
                                  onClick={() => removeTopic(cell.id, t)}
                                  className={
                                    official
                                      ? "rounded bg-primary/10 px-1.5 py-0.5 text-[10px] text-primary hover:bg-primary/20"
                                      : "rounded bg-amber-100 px-1.5 py-0.5 text-[10px] text-amber-900 hover:bg-amber-200"
                                  }
                                  title={official ? "Kaldır" : "Liste dışı metin — kaldırıp listeden seç"}
                                >
                                  {t} ×
                                </button>
                              );
                            })
                          )}
                        </div>
                        <select
                          className="h-8 rounded border bg-background px-1 text-[11px]"
                          defaultValue=""
                          onChange={(e) => {
                            addTopic(cell.id, e.target.value);
                            e.target.value = "";
                          }}
                        >
                          <option value="">Konu seç…</option>
                          {unused.map((t) => (
                            <option key={t.id} value={t.name}>
                              {t.name}
                            </option>
                          ))}
                        </select>
                      </div>
                    </td>
                  );
                })}
                <td className="border p-1 align-top">
                  <WeekAddLesson
                    templateId={templateId}
                    studentId={studentId}
                    weekId={w.id}
                    subjects={subjects}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function WeekAddLesson({
  templateId,
  studentId,
  weekId,
  subjects,
}: {
  templateId: string;
  studentId?: string;
  weekId: string;
  subjects: EditorSubject[];
}) {
  const [subjectId, setSubjectId] = useState(subjects[0]?.id ?? "");
  const topics = subjects.find((s) => s.id === subjectId)?.topics ?? [];

  return (
    <form action={addWeekLesson} className="flex min-w-[140px] flex-col gap-1">
      <input type="hidden" name="templateId" value={templateId} />
      <input type="hidden" name="weekId" value={weekId} />
      {studentId ? <input type="hidden" name="studentId" value={studentId} /> : null}
      <select
        name="subjectId"
        required
        value={subjectId}
        onChange={(e) => setSubjectId(e.target.value)}
        className="h-8 rounded border bg-background px-1 text-[11px]"
      >
        {subjects.map((s) => (
          <option key={s.id} value={s.id}>
            {s.code}
          </option>
        ))}
      </select>
      <select name="topicText" className="h-8 rounded border bg-background px-1 text-[11px]">
        <option value="">Konu (opsiyonel)</option>
        {topics.map((t) => (
          <option key={t.id} value={t.name}>
            {t.name}
          </option>
        ))}
      </select>
      <Button type="submit" size="sm" variant="outline" className="h-7 px-2 text-[11px]">
        Ders ekle
      </Button>
    </form>
  );
}

function AddLessonInline({
  templateId,
  studentId,
  weekId,
  subjectId,
  topics,
}: {
  templateId: string;
  studentId?: string;
  weekId: string;
  subjectId: string;
  topics: { id: string; name: string }[];
}) {
  return (
    <form action={addWeekLesson} className="space-y-1">
      <input type="hidden" name="templateId" value={templateId} />
      <input type="hidden" name="weekId" value={weekId} />
      <input type="hidden" name="subjectId" value={subjectId} />
      {studentId ? <input type="hidden" name="studentId" value={studentId} /> : null}
      <select name="topicText" className="h-8 w-full rounded border bg-background px-1 text-[11px]">
        <option value="">Konu seç ve ekle</option>
        {topics.map((t) => (
          <option key={t.id} value={t.name}>
            {t.name}
          </option>
        ))}
      </select>
      <Button type="submit" size="sm" variant="outline" className="h-7 px-2 text-[11px]">
        Bu haftaya ekle
      </Button>
    </form>
  );
}

export function RoadmapExtras({
  templateId,
  studentId,
  subjects,
  weeks,
}: {
  templateId: string;
  studentId?: string;
  subjects: EditorSubject[];
  weeks: EditorWeek[];
}) {
  const [lessonSubjectId, setLessonSubjectId] = useState(subjects[0]?.id ?? "");
  const lessonTopics = subjects.find((s) => s.id === lessonSubjectId)?.topics ?? [];

  return (
    <div className="grid gap-4 md:grid-cols-2">
      <form action={addWeekLesson} className="space-y-3 rounded-md border p-3">
        <p className="text-sm font-medium">Haftaya ders ekle</p>
        <p className="text-xs text-muted-foreground">
          Aynı haftaya ikinci, üçüncü ders eklenebilir. Konu listedekilerden seçilir.
        </p>
        <input type="hidden" name="templateId" value={templateId} />
        {studentId ? <input type="hidden" name="studentId" value={studentId} /> : null}
        <div className="space-y-1">
          <Label>Hafta</Label>
          <Select name="weekId" required>
            {weeks.map((w) => (
              <option key={w.id} value={w.id}>
                {MONTH_NAMES_TR[w.monthIndex]} · {w.label ?? `hafta ${w.weekIndex + 1}`}
              </option>
            ))}
          </Select>
        </div>
        <div className="space-y-1">
          <Label>Ders</Label>
          <Select
            name="subjectId"
            required
            value={lessonSubjectId}
            onChange={(e) => setLessonSubjectId(e.target.value)}
          >
            {subjects.map((s) => (
              <option key={s.id} value={s.id}>
                {s.code} — {s.name}
              </option>
            ))}
          </Select>
        </div>
        <div className="space-y-1">
          <Label>Konu</Label>
          <Select name="topicText">
            <option value="">(boş bırakılabilir)</option>
            {lessonTopics.map((t) => (
              <option key={t.id} value={t.name}>
                {t.name}
              </option>
            ))}
          </Select>
        </div>
        <Button type="submit">Haftaya ders ekle</Button>
      </form>

      <form action={addSubjectColumn} className="space-y-3 rounded-md border p-3">
        <p className="text-sm font-medium">Tüm haftalara ders sütunu</p>
        <p className="text-xs text-muted-foreground">Seçilen ders her haftaya eklenir; konu sonra seçilir.</p>
        <input type="hidden" name="templateId" value={templateId} />
        {studentId ? <input type="hidden" name="studentId" value={studentId} /> : null}
        <div className="space-y-1">
          <Label>Ders</Label>
          <Select name="subjectId" required>
            {subjects.map((s) => (
              <option key={s.id} value={s.id}>
                {s.code} — {s.name}
              </option>
            ))}
          </Select>
        </div>
        <Button type="submit" variant="outline">
          Sütun ekle
        </Button>
      </form>

      <form action={createSubjectTopic} className="space-y-3 rounded-md border p-3 md:col-span-2">
        <p className="text-sm font-medium">Yeni konu ekle</p>
        <p className="text-xs text-muted-foreground">
          Listede yoksa buradan dersin konu bankasına yazılır; sonra hücreden seçilir.
        </p>
        <input type="hidden" name="templateId" value={templateId} />
        {studentId ? <input type="hidden" name="studentId" value={studentId} /> : null}
        <div className="grid gap-3 md:grid-cols-3">
          <div className="space-y-1">
            <Label>Ders</Label>
            <Select name="subjectId" required>
              {subjects.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.code} — {s.name}
                </option>
              ))}
            </Select>
          </div>
          <div className="space-y-1 md:col-span-2">
            <Label>Konu adı</Label>
            <Input name="name" required maxLength={200} placeholder="Örn. Polinomlarda işlemler" />
          </div>
        </div>
        <Button type="submit" variant="outline">
          Konuyu kaydet
        </Button>
      </form>

      <form action={createOrgSubject} className="space-y-3 rounded-md border p-3 md:col-span-2">
        <p className="text-sm font-medium">Yeni ders (branş)</p>
        <p className="text-xs text-muted-foreground">
          Sistem listesinde yoksa kendi dersini ekle. Tüm haftalara sütun olarak gelir; konuları ayrıca yazarsın.
        </p>
        <input type="hidden" name="templateId" value={templateId} />
        {studentId ? <input type="hidden" name="studentId" value={studentId} /> : null}
        <div className="grid gap-3 md:grid-cols-4">
          <div className="space-y-1">
            <Label>Kod</Label>
            <Input name="code" required maxLength={20} placeholder="ORN. DENEME" />
          </div>
          <div className="space-y-1 md:col-span-2">
            <Label>Ad</Label>
            <Input name="name" required maxLength={80} placeholder="Branş deneme" />
          </div>
          <div className="space-y-1">
            <Label>Düzey</Label>
            <Select name="level" defaultValue="TYT">
              <option value="TYT">TYT</option>
              <option value="AYT">AYT</option>
            </Select>
          </div>
        </div>
        <Button type="submit" variant="outline">
          Dersi ekle
        </Button>
      </form>
    </div>
  );
}
