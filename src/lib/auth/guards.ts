import { redirect } from "next/navigation";
import type { Role } from "@prisma/client";
import { getSession, type SessionPayload } from "./session";

export async function requireSession(): Promise<SessionPayload> {
  const session = await getSession();
  if (!session) redirect("/login");
  return session;
}

export async function requireRole(...allowed: Role[]): Promise<SessionPayload> {
  const session = await requireSession();
  if (!allowed.includes(session.role)) {
    redirect("/login?error=forbidden");
  }
  return session;
}

export async function requireAdmin() {
  return requireRole("PLATFORM_ADMIN");
}

export async function requireTutor() {
  return requireRole("TUTOR", "PLATFORM_ADMIN");
}

export async function requireStudent() {
  return requireRole("STUDENT");
}

export async function requireParent() {
  return requireRole("PARENT");
}
