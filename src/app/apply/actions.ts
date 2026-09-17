"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import { prisma } from "@/lib/db";

const schema = z.object({
  fullName: z.string().trim().min(2),
  email: z.string().trim().toLowerCase().email(),
  phone: z.string().trim().optional().or(z.literal("")),
  message: z.string().trim().optional().or(z.literal("")),
});

export async function submitApplication(formData: FormData) {
  const parsed = schema.safeParse({
    fullName: formData.get("fullName"),
    email: formData.get("email"),
    phone: formData.get("phone"),
    message: formData.get("message"),
  });
  if (!parsed.success) redirect("/apply?status=error");

  await prisma.tutorApplication.create({
    data: {
      fullName: parsed.data.fullName,
      email: parsed.data.email,
      phone: parsed.data.phone || null,
      message: parsed.data.message || null,
      status: "PENDING",
    },
  });

  redirect("/apply?status=ok");
}
