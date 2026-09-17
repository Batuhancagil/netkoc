import crypto from "crypto";
import { prisma } from "./db";
import type { InviteKind, Role } from "@prisma/client";
import { publicUrl } from "./public-url";

export function generateToken() {
  return crypto.randomBytes(24).toString("base64url");
}

export function inviteExpiry(days = 7) {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d;
}

export function buildInviteUrl(token: string) {
  return publicUrl(`/invite/${token}`);
}

export async function createInvite(params: {
  kind: InviteKind;
  role: Role;
  createdById: string;
  email?: string | null;
  fullName?: string | null;
  orgId?: string | null;
  studentId?: string | null;
  linkStudentId?: string | null;
  expiresInDays?: number;
}) {
  const token = generateToken();
  const invite = await prisma.invite.create({
    data: {
      kind: params.kind,
      role: params.role,
      token,
      email: params.email ?? null,
      fullName: params.fullName ?? null,
      orgId: params.orgId ?? null,
      studentId: params.studentId ?? null,
      linkStudentId: params.linkStudentId ?? null,
      expiresAt: inviteExpiry(params.expiresInDays ?? 7),
      createdById: params.createdById,
    },
  });
  return { invite, url: buildInviteUrl(token) };
}
