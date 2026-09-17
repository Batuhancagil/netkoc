import { notFound } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { prisma } from "@/lib/db";
import { acceptInvite } from "./actions";

export default async function InvitePage({
  params,
  searchParams,
}: {
  params: Promise<{ token: string }>;
  searchParams: Promise<{ error?: string }>;
}) {
  const { token } = await params;
  const { error } = await searchParams;

  const invite = await prisma.invite.findUnique({ where: { token } });
  if (!invite) notFound();
  const expired = invite.expiresAt < new Date();
  const used = invite.usedAt !== null;

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/30 px-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Davet</CardTitle>
          <CardDescription>
            {invite.kind === "TUTOR"
              ? "Hoca olarak Netkoç'a katıl."
              : invite.kind === "STUDENT"
              ? "Öğrenci olarak hesabını aktifleştir."
              : "Veli olarak hesabını aktifleştir."}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {used ? (
            <p className="rounded-md bg-muted px-3 py-2 text-sm">
              Bu davet daha önce kullanılmış. Giriş sayfasından devam edin.
            </p>
          ) : expired ? (
            <p className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">
              Davetin süresi dolmuş. Davet sahibinden yenilemesini isteyin.
            </p>
          ) : (
            <form action={acceptInvite} className="space-y-4">
              <input type="hidden" name="token" value={invite.token} />
              {error ? (
                <div className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">
                  {error === "password" ? "Şifre en az 8 karakter olmalı." : "Bir hata oluştu."}
                </div>
              ) : null}
              <div className="space-y-2">
                <Label htmlFor="fullName">Ad Soyad</Label>
                <Input
                  id="fullName"
                  name="fullName"
                  defaultValue={invite.fullName ?? ""}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">E-posta</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  defaultValue={invite.email ?? ""}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Şifre</Label>
                <Input id="password" name="password" type="password" required minLength={8} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password2">Şifre (tekrar)</Label>
                <Input id="password2" name="password2" type="password" required minLength={8} />
              </div>
              <Button type="submit" className="w-full">
                Hesabı Aktifleştir
              </Button>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
