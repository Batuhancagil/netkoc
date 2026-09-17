import { NextResponse } from "next/server";
import { destroySession, getSession } from "@/lib/auth/session";
import { writeAudit } from "@/lib/audit";
import { publicUrl } from "@/lib/public-url";

export async function POST(req: Request) {
  const session = await getSession();
  await writeAudit(session, { action: "auth.logout" });
  await destroySession();
  return NextResponse.redirect(publicUrl("/login", req), { status: 303 });
}

export async function GET(req: Request) {
  return POST(req);
}
