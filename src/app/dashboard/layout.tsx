import { ReactNode } from "react";
import { headers } from "next/headers";
import { requireTutor } from "@/lib/auth/guards";
import { AppHeader } from "@/components/app-header";
import { prisma } from "@/lib/db";

const NAV = [
  { href: "/dashboard", label: "Özet" },
  { href: "/dashboard/students", label: "Öğrenciler" },
  { href: "/dashboard/roadmap", label: "Yol Haritası" },
  { href: "/dashboard/weekly", label: "Haftalık Program" },
  { href: "/dashboard/curriculum", label: "Müfredat" },
  { href: "/dashboard/topics", label: "Konu Takibi" },
  { href: "/dashboard/trials", label: "Deneme Analizi" },
  { href: "/dashboard/monthly", label: "Aylık Rapor" },
  { href: "/dashboard/payments", label: "Ödeme" },
];

export default async function DashboardLayout({ children }: { children: ReactNode }) {
  const session = await requireTutor();
  const hdrs = await headers();
  const activePath = hdrs.get("x-pathname") ?? "/dashboard";
  const org = session.orgId
    ? await prisma.organization.findUnique({ where: { id: session.orgId } })
    : null;

  const showNav = Boolean(session.orgId) && !activePath.startsWith("/dashboard/onboarding");

  return (
    <div className="min-h-screen bg-muted/20">
      <AppHeader
        title={org?.name ?? "Hoca Paneli"}
        userName={session.fullName}
        nav={showNav ? NAV : []}
        activePath={activePath}
      />
      <main className="container py-6">{children}</main>
    </div>
  );
}
