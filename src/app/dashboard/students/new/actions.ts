"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { requireTutorOrg } from "@/lib/tenant";
import { writeAudit } from "@/lib/audit";

const schema = z.object({
  fullName: z.string().trim().min(2),
  track: z.enum(["SAYISAL", "EA", "SOZEL", "DIL"]),
  graduationYear: z.coerce.number().int().min(2024).max(2040).optional().or(z.nan()),
  notes: z.string().trim().optional().or(z.literal("")),
});

export async function createStudent(formData: FormData) {
  const { session, org } = await requireTutorOrg();
  const gy = formData.get("graduationYear");
  const parsed = schema.safeParse({
    fullName: formData.get("fullName"),
    track: formData.get("track"),
    graduationYear: gy && gy !== "" ? Number(gy) : undefined,
    notes: formData.get("notes"),
  });
  if (!parsed.success) redirect("/dashboard/students/new?error=invalid");

  const student = await prisma.student.create({
    data: {
      orgId: org.id,
      fullName: parsed.data.fullName,
      track: parsed.data.track,
      graduationYear:
        parsed.data.graduationYear && !Number.isNaN(parsed.data.graduationYear)
          ? Number(parsed.data.graduationYear)
          : null,
      notes: parsed.data.notes || null,
    },
  });

  await writeAudit(session, {
    action: "student.create",
    entity: "Student",
    entityId: student.id,
  });

  redirect(`/dashboard/students/${student.id}`);
}
