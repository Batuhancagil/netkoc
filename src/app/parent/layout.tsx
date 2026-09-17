import { ReactNode } from "react";
import { headers } from "next/headers";
import { requireParent } from "@/lib/auth/guards";
import { AppHeader } from "@/components/app-header";

export default async function ParentLayout({ children }: { children: ReactNode }) {
  const session = await requireParent();
  const hdrs = await headers();
  const activePath = hdrs.get("x-pathname") ?? "/parent";
  return (
    <div className="min-h-screen bg-muted/20">
      <AppHeader
        title="Veli Paneli"
        userName={session.fullName}
        nav={[{ href: "/parent", label: "Çocuklarım" }]}
        activePath={activePath}
      />
      <main className="container py-6">{children}</main>
    </div>
  );
}
