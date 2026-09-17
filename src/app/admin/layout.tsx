import { ReactNode } from "react";
import { headers } from "next/headers";
import { requireAdmin } from "@/lib/auth/guards";
import { AppHeader } from "@/components/app-header";

const NAV = [
  { href: "/admin", label: "Özet" },
  { href: "/admin/tutors", label: "Hocalar" },
  { href: "/admin/applications", label: "Başvurular" },
  { href: "/admin/audit", label: "Audit Log" },
];

export default async function AdminLayout({ children }: { children: ReactNode }) {
  const session = await requireAdmin();
  const hdrs = await headers();
  const activePath =
    hdrs.get("x-pathname") ?? hdrs.get("x-invoke-path") ?? "/admin";
  return (
    <div className="min-h-screen bg-muted/20">
      <AppHeader
        title="Platform Yönetimi"
        userName={session.fullName}
        nav={NAV}
        activePath={activePath}
      />
      <main className="container py-6">{children}</main>
    </div>
  );
}
