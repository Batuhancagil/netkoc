import Link from "next/link";
import { notFound } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { requireTutorOrg } from "@/lib/tenant";
import { prisma } from "@/lib/db";
import { MONTH_NAMES_TR } from "@/lib/constants";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { addRoadmapWeek } from "../../actions";
import { RoadmapExtras, RoadmapGridEditor } from "@/components/roadmap-grid-editor";

export default async function EditRoadmapPage({
  params,
  searchParams,
}: {
  params: Promise<{ templateId: string }>;
  searchParams: Promise<{ studentId?: string }>;
}) {
  const { templateId } = await params;
  const { studentId } = await searchParams;
  const { org } = await requireTutorOrg();

  const template = await prisma.roadmapTemplate.findFirst({
    where: { id: templateId, orgId: org.id },
    include: {
      weeks: {
        orderBy: [{ monthIndex: "asc" }, { weekIndex: "asc" }],
        include: { cells: { include: { subject: true } } },
      },
    },
  });
  if (!template) notFound();

  const subjects = await prisma.subject.findMany({
    where: {
      OR: [{ orgId: null }, { orgId: org.id }],
      tracks: { has: template.track },
    },
    include: { topics: { orderBy: { order: "asc" } } },
    orderBy: { order: "asc" },
  });

  const editorWeeks = template.weeks.map((w) => ({
    id: w.id,
    monthIndex: w.monthIndex,
    weekIndex: w.weekIndex,
    label: w.label,
    cells: w.cells.map((c) => ({
      id: c.id,
      subjectId: c.subjectId,
      topicText: c.topicText,
    })),
  }));

  const editorSubjects = subjects.map((s) => ({
    id: s.id,
    code: s.code,
    name: s.name,
    topics: s.topics.map((t) => ({ id: t.id, name: t.name })),
  }));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Yol Haritası Düzenle</h1>
          <p className="text-sm text-muted-foreground">{template.name}</p>
        </div>
        <Button asChild variant="outline">
          <Link href={studentId ? `/dashboard/roadmap?studentId=${studentId}` : "/dashboard/roadmap"}>
            Geri
          </Link>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Aylık grid</CardTitle>
          <CardDescription>
            Hücredeki metin serbest ders adı değil; o sütunun dersindeki konulardır. Listeden seç,
            bir haftaya birden fazla ders ve bir hücreye birden fazla konu koy. Tek tek kaydetme.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {template.weeks.length === 0 ? (
            <p className="text-sm text-muted-foreground">Önce aşağıdan bir hafta ekle.</p>
          ) : (
            <RoadmapGridEditor
              templateId={template.id}
              studentId={studentId}
              weeks={editorWeeks}
              subjects={editorSubjects}
            />
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Ders ve konu ekle</CardTitle>
        </CardHeader>
        <CardContent>
          <RoadmapExtras
            templateId={template.id}
            studentId={studentId}
            subjects={editorSubjects}
            weeks={editorWeeks}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Hafta ekle</CardTitle>
        </CardHeader>
        <CardContent>
          <form action={addRoadmapWeek} className="grid gap-3 md:grid-cols-6">
            <input type="hidden" name="templateId" value={template.id} />
            {studentId ? <input type="hidden" name="studentId" value={studentId} /> : null}
            <div className="space-y-1">
              <Label>Ay</Label>
              <Select name="monthIndex" defaultValue="0">
                {MONTH_NAMES_TR.map((m, i) => (
                  <option key={m} value={i}>
                    {m}
                  </option>
                ))}
              </Select>
            </div>
            <div className="space-y-1">
              <Label>Ay içi hafta (0–4)</Label>
              <Input name="weekIndex" type="number" min={0} max={4} defaultValue={0} required />
            </div>
            <div className="space-y-1">
              <Label>Etiket</Label>
              <Input name="label" placeholder="1-7 Eylül" />
            </div>
            <div className="space-y-1">
              <Label>Başlangıç</Label>
              <Input name="startDate" type="date" required />
            </div>
            <div className="space-y-1">
              <Label>Bitiş</Label>
              <Input name="endDate" type="date" required />
            </div>
            <div className="flex items-end">
              <Button type="submit">Hafta ekle</Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
