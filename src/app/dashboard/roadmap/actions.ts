"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { requireTutorOrg } from "@/lib/tenant";
import { writeAudit } from "@/lib/audit";
import { joinTopics, splitTopics } from "@/lib/topic-text";

const assignSchema = z.object({
  studentId: z.string().min(1),
  templateId: z.string().min(1),
});

export async function assignRoadmapFromTemplate(formData: FormData) {
  const { session, org } = await requireTutorOrg();
  const parsed = assignSchema.safeParse({
    studentId: formData.get("studentId"),
    templateId: formData.get("templateId"),
  });
  if (!parsed.success) redirect("/dashboard/roadmap");

  const student = await prisma.student.findFirst({
    where: { id: parsed.data.studentId, orgId: org.id },
  });
  if (!student) redirect("/dashboard/roadmap");

  const source = await prisma.roadmapTemplate.findUnique({
    where: { id: parsed.data.templateId },
    include: {
      weeks: {
        include: { cells: true },
        orderBy: [{ monthIndex: "asc" }, { weekIndex: "asc" }],
      },
    },
  });
  if (!source) redirect("/dashboard/roadmap");

  // Clone template as org-scoped, assign to student
  const cloned = await prisma.$transaction(async (tx) => {
    const tpl = await tx.roadmapTemplate.create({
      data: {
        orgId: org.id,
        name: `${source.name} — ${student.fullName}`,
        year: source.year,
        track: source.track,
        isSystem: false,
      },
    });
    for (const w of source.weeks) {
      const newWeek = await tx.roadmapWeek.create({
        data: {
          templateId: tpl.id,
          monthIndex: w.monthIndex,
          weekIndex: w.weekIndex,
          startDate: w.startDate,
          endDate: w.endDate,
          label: w.label,
        },
      });
      for (const c of w.cells) {
        await tx.roadmapCell.create({
          data: {
            weekId: newWeek.id,
            subjectId: c.subjectId,
            topicText: c.topicText,
          },
        });
      }
    }
    const existing = await tx.studentRoadmap.findUnique({
      where: { studentId: student.id },
    });
    if (existing) {
      await tx.studentRoadmap.update({
        where: { studentId: student.id },
        data: { templateId: tpl.id },
      });
    } else {
      await tx.studentRoadmap.create({
        data: { studentId: student.id, templateId: tpl.id },
      });
    }
    return tpl;
  });

  await writeAudit(session, {
    action: "roadmap.assign",
    entity: "StudentRoadmap",
    entityId: student.id,
    metadata: { sourceTemplateId: source.id, newTemplateId: cloned.id },
  });

  redirect(`/dashboard/roadmap?studentId=${student.id}`);
}

function academicYearStart() {
  const now = new Date();
  return now.getUTCMonth() >= 8 ? now.getUTCFullYear() : now.getUTCFullYear() - 1;
}

function blankWeeks(yearStart: number) {
  const weeks: {
    monthIndex: number;
    weekIndex: number;
    startDate: Date;
    endDate: Date;
    label: string;
  }[] = [];
  let cursor = new Date(Date.UTC(yearStart, 8, 1));
  const last = new Date(Date.UTC(yearStart + 1, 4, 31));
  let weekIndex = 0;
  let lastCalMonth = cursor.getUTCMonth();
  while (cursor <= last) {
    const calMonth = cursor.getUTCMonth();
    const monthIndex = (calMonth + 4) % 12;
    if (monthIndex > 8) break;
    if (calMonth !== lastCalMonth) {
      weekIndex = 0;
      lastCalMonth = calMonth;
    }
    if (weekIndex > 4) {
      cursor = new Date(cursor.getTime() + 7 * 86400000);
      continue;
    }
    const startDate = new Date(cursor);
    const endDate = new Date(cursor.getTime() + 6 * 86400000);
    const fmt = new Intl.DateTimeFormat("tr-TR", { day: "numeric", month: "long", timeZone: "UTC" });
    weeks.push({
      monthIndex,
      weekIndex,
      startDate,
      endDate,
      label: `${fmt.format(startDate)} – ${fmt.format(endDate)}`,
    });
    weekIndex += 1;
    cursor = new Date(cursor.getTime() + 7 * 86400000);
  }
  return weeks;
}

export async function createBlankRoadmap(formData: FormData) {
  const { session, org } = await requireTutorOrg();
  const studentId = String(formData.get("studentId") || "");
  const name = String(formData.get("name") || "").trim();
  const student = await prisma.student.findFirst({
    where: { id: studentId, orgId: org.id },
  });
  if (!student) redirect("/dashboard/roadmap");

  const year = academicYearStart();
  const subjects = await prisma.subject.findMany({
    where: {
      OR: [{ orgId: null }, { orgId: org.id }],
      tracks: { has: student.track },
    },
    orderBy: { order: "asc" },
  });
  const weeks = blankWeeks(year);

  const tpl = await prisma.$transaction(async (tx) => {
    const created = await tx.roadmapTemplate.create({
      data: {
        orgId: org.id,
        name: name || `${student.fullName} yol haritası`,
        year,
        track: student.track,
        isSystem: false,
      },
    });
    for (const w of weeks) {
      const newWeek = await tx.roadmapWeek.create({
        data: {
          templateId: created.id,
          monthIndex: w.monthIndex,
          weekIndex: w.weekIndex,
          startDate: w.startDate,
          endDate: w.endDate,
          label: w.label,
        },
      });
      for (const s of subjects) {
        await tx.roadmapCell.create({
          data: { weekId: newWeek.id, subjectId: s.id, topicText: "" },
        });
      }
    }
    const existing = await tx.studentRoadmap.findUnique({ where: { studentId: student.id } });
    if (existing) {
      await tx.studentRoadmap.update({
        where: { studentId: student.id },
        data: { templateId: created.id },
      });
    } else {
      await tx.studentRoadmap.create({
        data: { studentId: student.id, templateId: created.id },
      });
    }
    return created;
  });

  await writeAudit(session, {
    action: "roadmap.createBlank",
    entity: "StudentRoadmap",
    entityId: student.id,
    metadata: { templateId: tpl.id },
  });

  redirect(`/dashboard/roadmap/${tpl.id}/edit?studentId=${student.id}`);
}

const addWeekSchema = z.object({
  templateId: z.string().min(1),
  studentId: z.string().optional(),
  monthIndex: z.coerce.number().int().min(0).max(8),
  weekIndex: z.coerce.number().int().min(0).max(4),
  label: z.string().max(80).optional(),
  startDate: z.string().min(1),
  endDate: z.string().min(1),
});

export async function addRoadmapWeek(formData: FormData) {
  const { session, org } = await requireTutorOrg();
  const parsed = addWeekSchema.safeParse({
    templateId: formData.get("templateId"),
    studentId: formData.get("studentId") || undefined,
    monthIndex: formData.get("monthIndex"),
    weekIndex: formData.get("weekIndex"),
    label: formData.get("label") || undefined,
    startDate: formData.get("startDate"),
    endDate: formData.get("endDate"),
  });
  if (!parsed.success) return;

  const template = await prisma.roadmapTemplate.findFirst({
    where: { id: parsed.data.templateId, orgId: org.id },
    include: { weeks: { take: 1, include: { cells: true } } },
  });
  if (!template) return;

  const subjectIds = template.weeks[0]
    ? template.weeks[0].cells.map((c) => c.subjectId)
    : (
        await prisma.subject.findMany({
          where: { OR: [{ orgId: null }, { orgId: org.id }], tracks: { has: template.track } },
          select: { id: true },
        })
      ).map((s) => s.id);

  const week = await prisma.roadmapWeek.create({
    data: {
      templateId: template.id,
      monthIndex: parsed.data.monthIndex,
      weekIndex: parsed.data.weekIndex,
      startDate: new Date(parsed.data.startDate),
      endDate: new Date(parsed.data.endDate),
      label: parsed.data.label || null,
      cells: { create: subjectIds.map((subjectId) => ({ subjectId, topicText: "" })) },
    },
  });

  await writeAudit(session, {
    action: "roadmap.addWeek",
    entity: "RoadmapWeek",
    entityId: week.id,
  });

  const q = parsed.data.studentId ? `?studentId=${parsed.data.studentId}` : "";
  redirect(`/dashboard/roadmap/${template.id}/edit${q}`);
}

function editPath(templateId: string, studentId?: string) {
  return `/dashboard/roadmap/${templateId}/edit${studentId ? `?studentId=${studentId}` : ""}`;
}

const addCellSchema = z.object({
  templateId: z.string().min(1),
  weekId: z.string().min(1),
  subjectId: z.string().min(1),
  topicText: z.string().max(500).optional(),
  studentId: z.string().optional(),
});

async function appendOrCreateCell(args: {
  weekId: string;
  subjectId: string;
  topicText: string;
}) {
  const existing = await prisma.roadmapCell.findUnique({
    where: { weekId_subjectId: { weekId: args.weekId, subjectId: args.subjectId } },
  });
  if (!existing) {
    return prisma.roadmapCell.create({
      data: { weekId: args.weekId, subjectId: args.subjectId, topicText: args.topicText },
    });
  }
  const merged = joinTopics([...splitTopics(existing.topicText), ...splitTopics(args.topicText)]);
  return prisma.roadmapCell.update({
    where: { id: existing.id },
    data: { topicText: merged },
  });
}

export async function addRoadmapCell(formData: FormData) {
  return addWeekLesson(formData);
}

export async function addWeekLesson(formData: FormData) {
  const { session, org } = await requireTutorOrg();
  const parsed = addCellSchema.safeParse({
    templateId: formData.get("templateId"),
    weekId: formData.get("weekId"),
    subjectId: formData.get("subjectId"),
    topicText: formData.get("topicText") || "",
    studentId: formData.get("studentId") || undefined,
  });
  if (!parsed.success) return;

  const week = await prisma.roadmapWeek.findFirst({
    where: { id: parsed.data.weekId, template: { id: parsed.data.templateId, orgId: org.id } },
  });
  if (!week) return;

  const subject = await prisma.subject.findFirst({
    where: { id: parsed.data.subjectId, OR: [{ orgId: null }, { orgId: org.id }] },
  });
  if (!subject) return;

  const cell = await appendOrCreateCell({
    weekId: week.id,
    subjectId: subject.id,
    topicText: parsed.data.topicText ?? "",
  });

  await writeAudit(session, {
    action: "roadmap.addCell",
    entity: "RoadmapCell",
    entityId: cell.id,
  });

  redirect(editPath(parsed.data.templateId, parsed.data.studentId));
}

export async function addSubjectColumn(formData: FormData) {
  const { session, org } = await requireTutorOrg();
  const templateId = String(formData.get("templateId") || "");
  const subjectId = String(formData.get("subjectId") || "");
  const studentId = String(formData.get("studentId") || "") || undefined;

  const template = await prisma.roadmapTemplate.findFirst({
    where: { id: templateId, orgId: org.id },
    include: { weeks: { include: { cells: true } } },
  });
  if (!template) return;

  const subject = await prisma.subject.findFirst({
    where: { id: subjectId, OR: [{ orgId: null }, { orgId: org.id }] },
  });
  if (!subject) return;

  for (const week of template.weeks) {
    const has = week.cells.some((c) => c.subjectId === subject.id);
    if (!has) {
      await prisma.roadmapCell.create({
        data: { weekId: week.id, subjectId: subject.id, topicText: "" },
      });
    }
  }

  await writeAudit(session, {
    action: "roadmap.addSubjectColumn",
    entity: "RoadmapTemplate",
    entityId: template.id,
    metadata: { subjectId: subject.id },
  });

  redirect(editPath(template.id, studentId));
}

export async function createSubjectTopic(formData: FormData) {
  const { session, org } = await requireTutorOrg();
  const templateId = String(formData.get("templateId") || "");
  const subjectId = String(formData.get("subjectId") || "");
  const name = String(formData.get("name") || "").trim();
  const studentId = String(formData.get("studentId") || "") || undefined;
  if (!name) return;

  const subject = await prisma.subject.findFirst({
    where: { id: subjectId, OR: [{ orgId: null }, { orgId: org.id }] },
  });
  if (!subject) return;

  const existing = await prisma.topic.findFirst({
    where: { subjectId: subject.id, name: { equals: name, mode: "insensitive" } },
  });
  if (!existing) {
    const last = await prisma.topic.aggregate({
      where: { subjectId: subject.id },
      _max: { order: true },
    });
    await prisma.topic.create({
      data: {
        subjectId: subject.id,
        name,
        level: subject.level,
        order: (last._max.order ?? 0) + 1,
      },
    });
  }

  await writeAudit(session, {
    action: "roadmap.createTopic",
    entity: "Topic",
    entityId: subject.id,
    metadata: { name },
  });

  redirect(editPath(templateId, studentId));
}

export async function saveRoadmapGrid(formData: FormData) {
  const { session, org } = await requireTutorOrg();
  const templateId = String(formData.get("templateId") || "");
  const raw = String(formData.get("payload") || "[]");

  const template = await prisma.roadmapTemplate.findFirst({
    where: { id: templateId, orgId: org.id },
    select: { id: true },
  });
  if (!template) return;

  let rows: { id: string; topicText: string }[] = [];
  try {
    const parsed = JSON.parse(raw) as unknown;
    if (Array.isArray(parsed)) {
      rows = parsed
        .filter((r): r is { id: string; topicText: string } => {
          return Boolean(r && typeof r === "object" && typeof (r as { id?: unknown }).id === "string");
        })
        .map((r) => ({ id: r.id, topicText: String(r.topicText ?? "").slice(0, 2000) }));
    }
  } catch {
    return;
  }

  const cells = await prisma.roadmapCell.findMany({
    where: { id: { in: rows.map((r) => r.id) }, week: { template: { id: template.id, orgId: org.id } } },
    select: { id: true },
  });
  const allowed = new Set(cells.map((c) => c.id));
  const updates = rows
    .filter((r) => allowed.has(r.id))
    .map((r) =>
      prisma.roadmapCell.update({
        where: { id: r.id },
        data: { topicText: joinTopics(splitTopics(r.topicText)) },
      })
    );
  if (updates.length === 0) return;

  await prisma.$transaction(updates);

  await writeAudit(session, {
    action: "roadmap.saveGrid",
    entity: "RoadmapTemplate",
    entityId: template.id,
    metadata: { cells: rows.length },
  });

  revalidatePath(editPath(template.id));
  revalidatePath("/dashboard/roadmap");
}

const updateCellSchema = z.object({
  cellId: z.string().min(1),
  topicText: z.string().max(500),
});

export async function updateRoadmapCell(formData: FormData) {
  const { session, org } = await requireTutorOrg();
  const parsed = updateCellSchema.safeParse({
    cellId: formData.get("cellId"),
    topicText: formData.get("topicText") ?? "",
  });
  if (!parsed.success) return;

  const cell = await prisma.roadmapCell.findUnique({
    where: { id: parsed.data.cellId },
    include: { week: { include: { template: true } } },
  });
  if (!cell || cell.week.template.orgId !== org.id) return;

  await prisma.roadmapCell.update({
    where: { id: parsed.data.cellId },
    data: { topicText: parsed.data.topicText },
  });

  await writeAudit(session, {
    action: "roadmap.updateCell",
    entity: "RoadmapCell",
    entityId: parsed.data.cellId,
  });

  revalidatePath(`/dashboard/roadmap/${cell.week.templateId}/edit`);
}
