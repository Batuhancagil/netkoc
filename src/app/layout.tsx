import type { Metadata } from "next";
import { ReactNode } from "react";
import "./globals.css";
import { ImpersonationBanner } from "@/components/impersonation-banner";
import { getSession } from "@/lib/auth/session";

export const metadata: Metadata = {
  title: "Netkoç — YKS Koçluk Takip",
  description:
    "Hocalar için çok kiracılı YKS koçluk takip platformu. Haftalık program, deneme analizi, konu takibi ve ödeme yönetimi.",
};

export default async function RootLayout({ children }: { children: ReactNode }) {
  const session = await getSession();

  return (
    <html lang="tr" suppressHydrationWarning>
      <body className="min-h-screen bg-background font-sans antialiased">
        {session?.impersonatingUserId ? (
          <ImpersonationBanner
            adminName={session.adminName ?? "Admin"}
            targetName={session.fullName}
          />
        ) : null}
        {children}
      </body>
    </html>
  );
}
