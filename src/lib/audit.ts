import { headers } from "next/headers";
import { prisma } from "./db";
import type { SessionPayload } from "./auth/session";

export type AuditEntry = {
  action: string;
  entity?: string;
  entityId?: string;
  metadata?: Record<string, unknown>;
};

export async function writeAudit(session: SessionPayload | null, entry: AuditEntry) {
  if (!session) return;
  try {
    const hdrs = await headers();
    const ip = hdrs.get("x-forwarded-for")?.split(",")[0]?.trim() ?? null;
    const ua = hdrs.get("user-agent") ?? null;

    await prisma.auditLog.create({
      data: {
        actorUserId: session.userId,
        impersonatedUserId: session.impersonatingUserId ?? null,
        orgId: session.orgId,
        action: entry.action,
        entity: entry.entity,
        entityId: entry.entityId,
        metadata: (entry.metadata as object | undefined) ?? undefined,
        ip,
        userAgent: ua,
      },
    });
  } catch (err) {
    console.error("[audit] failed to write log", err);
  }
}
