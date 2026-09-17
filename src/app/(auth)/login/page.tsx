import Link from "next/link";
import { redirect } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { loginAction } from "./actions";
import { getSession } from "@/lib/auth/session";
import { dashboardPathForRole } from "@/lib/auth/paths";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const session = await getSession();
  if (session) redirect(dashboardPathForRole(session.role));
  const { error } = await searchParams;
  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/30 px-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl">Netkoç'a Giriş</CardTitle>
          <CardDescription>
            Hesabınıza giriş yapın. Davet aldıysanız linkten devam edin.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form action={loginAction} className="space-y-4">
            {error ? (
              <div className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">
                {error === "invalid"
                  ? "E-posta veya şifre hatalı."
                  : error === "disabled"
                  ? "Hesabınız devre dışı bırakılmış."
                  : error === "forbidden"
                  ? "Bu sayfaya erişim yetkiniz yok."
                  : "Bir hata oluştu."}
              </div>
            ) : null}
            <div className="space-y-2">
              <Label htmlFor="email">E-posta</Label>
              <Input id="email" type="email" name="email" required autoComplete="email" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Şifre</Label>
              <Input
                id="password"
                type="password"
                name="password"
                required
                autoComplete="current-password"
              />
            </div>
            <Button type="submit" className="w-full">
              Giriş Yap
            </Button>
          </form>
          <div className="mt-6 text-center text-sm text-muted-foreground">
            Hoca olmak için{" "}
            <Link href="/apply" className="font-medium text-primary hover:underline">
              başvuru yap
            </Link>
            .
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
