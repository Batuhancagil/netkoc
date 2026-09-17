import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/select";
import { requireTutorOrg } from "@/lib/tenant";
import { prisma } from "@/lib/db";
import { TRACK_LABELS, MONTH_NAMES_TR } from "@/lib/constants";
import { assignRoadmapFromTemplate, createBlankRoadmap } from "./actions";
import { ensureCurrentYearSystemTemplates } from "@/lib/ensure-year-templates";

export default async function RoadmapOverviewPage({
  searchParams,
}: {
  searchParams: Promise<{ studentId?: string }>;
}) {
  const { org } = await requireTutorOrg();
  const { studentId } = await searchParams;
  await ensureCurrentYearSystemTemplates(2026);

  const students = await prisma.student.findMany({
    where: { orgId: org.id },
    include: { roadmap: { include: { template: true } } },
    orderBy: { fullName: "asc" },
  });

  const active = studentId
    ? students.find((s) => s.id === studentId)
    : students[0];

  const templates = active
    ? await prisma.roadmapTemplate.findMany({
        where: {
          OR: [{ orgId: null, isSystem: true }, { orgId: org.id }],
          track: active.track,
        },
        include: { _count: { select: { weeks: true } } },
        orderBy: [{ isSystem: "desc" }, { year: "desc" }],
      })
    : [];

  const roadmapWithWeeks = active?.roadmap
    ? await prisma.roadmapTemplate.findUnique({
        where: { id: active.roadmap.templateId },
        include: {
          weeks: {
            orderBy: [{ monthIndex: "asc" }, { weekIndex: "asc" }],
            include: {
              cells: { include: { subject: true } },
            },
          },
        },
      })
    : null;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Yol Haritası</h1>
      </div>

      <form method="get" className="flex flex-wrap items-end gap-3">
        <div className="min-w-[240px] space-y-1">
          <label className="text-sm font-medium">Öğrenci</label>
          <Select name="studentId" defaultValue={active?.id ?? ""} onChange={undefined}>
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

      {!active ? (
        <Card>
          <CardContent className="pt-6 text-sm text-muted-foreground">
            Önce öğrenci ekle:{" "}
            <Link className="underline" href="/dashboard/students/new">
              Yeni öğrenci
            </Link>
          </CardContent>
        </Card>
      ) : (
        <>
          <Card>
            <CardHeader>
              <CardTitle>
                {roadmapWithWeeks ? "Yol haritasını değiştir / ekle" : "Yol haritası ata"}
              </CardTitle>
              <CardDescription>
                Hazır şablonu klonlayabilir veya boş bir ızgara açıp konuları listeden seçebilirsin.
                Konu bankası 2018 lise / MEB 2026 YKS kazanım çerçevesi (2027 YKS aynı format).
                Sistem şablonları Excel 2025-26 planından; 2026-27 kopyası tarihler bir yıl kaymış halde durur.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <form action={assignRoadmapFromTemplate} className="flex flex-wrap items-end gap-3">
                <input type="hidden" name="studentId" value={active.id} />
                <div className="min-w-[280px] space-y-1">
                  <label className="text-sm font-medium">Hazır şablon</label>
                  <Select name="templateId" required={templates.length > 0} disabled={templates.length === 0}>
                    {templates.length === 0 ? (
                      <option value="">Bu alan için şablon yok</option>
                    ) : (
                      templates.map((t) => (
                        <option key={t.id} value={t.id}>
                          {t.name} {t.isSystem ? "(Sistem)" : "(Kendi)"} — {t._count.weeks} hafta
                        </option>
                      ))
                    )}
                  </Select>
                </div>
                <Button type="submit" disabled={templates.length === 0}>
                  Şablonu Klonla ve Ata
                </Button>
              </form>

              <form action={createBlankRoadmap} className="flex flex-wrap items-end gap-3 border-t pt-4">
                <input type="hidden" name="studentId" value={active.id} />
                <div className="min-w-[280px] space-y-1">
                  <label className="text-sm font-medium">Boş harita adı</label>
                  <input
                    name="name"
                    defaultValue={`${active.fullName} yol haritası`}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  />
                </div>
                <Button type="submit">Boş harita oluştur ve düzenle</Button>
              </form>
            </CardContent>
          </Card>

          {roadmapWithWeeks ? <RoadmapGrid template={roadmapWithWeeks} studentId={active.id} /> : null}
        </>
      )}
    </div>
  );
}

type TemplateWithWeeks = NonNullable<Awaited<ReturnType<typeof loadTemplate>>>;
async function loadTemplate(id: string) {
  return prisma.roadmapTemplate.findUnique({
    where: { id },
    include: {
      weeks: {
        orderBy: [{ monthIndex: "asc" }, { weekIndex: "asc" }],
        include: { cells: { include: { subject: true } } },
      },
    },
  });
}

function RoadmapGrid({
  template,
  studentId,
}: {
  template: TemplateWithWeeks;
  studentId: string;
}) {
  const subjectCodes = Array.from(
    new Set(template.weeks.flatMap((w) => w.cells.map((c) => c.subject.code)))
  );

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>{template.name}</CardTitle>
          <CardDescription>
            {template.weeks.length} hafta · Dersler: {subjectCodes.join(", ")}
          </CardDescription>
        </div>
        <Button asChild variant="outline">
          <Link href={`/dashboard/roadmap/${template.id}/edit?studentId=${studentId}`}>
            Düzenle
          </Link>
        </Button>
      </CardHeader>
      <CardContent className="overflow-x-auto">
        <table className="w-full border-collapse text-xs">
          <thead>
            <tr className="bg-muted">
              <th className="sticky left-0 z-10 border bg-muted p-2 text-left">Hafta</th>
              {subjectCodes.map((code) => (
                <th key={code} className="border p-2 text-left">
                  {code}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {template.weeks.map((w) => (
              <tr key={w.id}>
                <td className="sticky left-0 z-10 border bg-card p-2 font-medium">
                  <div>{MONTH_NAMES_TR[w.monthIndex]}</div>
                  <div className="text-muted-foreground">{w.label}</div>
                </td>
                {subjectCodes.map((code) => {
                  const cell = w.cells.find((c) => c.subject.code === code);
                  return (
                    <td key={code} className="border p-2 align-top">
                      {cell?.topicText ?? "—"}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </CardContent>
    </Card>
  );
}
