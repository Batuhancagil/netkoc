"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { requireTutorOrg } from "@/lib/tenant";
import { writeAudit } from "@/lib/audit";

const schema = z.object({
  studentId: z.string().min(1),
  topicId: z.string().min(1),
  date: z.string().min(1),
  testCount: z.coerce.number().int().min(0).default(0),
  correct: z.coerce.number().int().min(0).default(0),
  wrong: z.coerce.number().int().min(0).default(0),
});

export async function addTopicSession(formData: FormData) {
  const { session, org } = await requireTutorOrg();
  const parsed = schema.safeParse({
    studentId: formData.get("studentId"),
    topicId: formData.get("topicId"),
    date: formData.get("date"),
    testCount: formData.get("testCount") ?? 0,
    correct: formData.get("correct") ?? 0,
    wrong: formData.get("wrong") ?? 0,
  });
  if (!parsed.success) redirect("/dashboard/topics");

  const student = await prisma.student.findFirst({
    where: { id: parsed.data.studentId, orgId: org.id },
  });
  if (!student) redirect("/dashboard/topics");

  const topic = await prisma.topic.findUnique({
    where: { id: parsed.data.topicId },
    include: { subject: true },
  });
  if (!topic) redirect("/dashboard/topics");

  await prisma.topicSession.create({
    data: {
      studentId: student.id,
      topicId: topic.id,
      date: new Date(parsed.data.date),
      testCount: parsed.data.testCount,
      correct: parsed.data.correct,
      wrong: parsed.data.wrong,
      source: "KONU",
    },
  });

  await writeAudit(session, {
    action: "topicSession.create",
    entity: "TopicSession",
  });

  redirect(
    `/dashboard/topics?studentId=${student.id}&subjectId=${topic.subjectId}`
  );
}
