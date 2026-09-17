import { ReactNode } from "react";
import { headers } from "next/headers";
import { requireStudent } from "@/lib/auth/guards";
import { AppHeader } from "@/components/app-header";

const NAV = [
  { href: "/me", label: "Bu Hafta" },
  { href: "/me/roadmap", label: "Yol Haritam" },
  { href: "/me/progress", label: "İlerlemem" },
];

export default async function StudentLayout({ children }: { children: ReactNode }) {
  const session = await requireStudent();
  const hdrs = await headers();
  const activePath = hdrs.get("x-pathname") ?? "/me";
  return (
    <div className="min-h-screen bg-muted/20">
      <AppHeader
        title="Öğrenci Paneli"
        userName={session.fullName}
        nav={NAV}
        activePath={activePath}
      />
      <main className="container py-6">{children}</main>
    </div>
  );
}
