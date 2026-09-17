import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { submitApplication } from "./actions";

export default async function ApplyPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const { status } = await searchParams;
  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/30 px-4 py-10">
      <Card className="w-full max-w-xl">
        <CardHeader>
          <CardTitle className="text-2xl">Hoca Başvurusu</CardTitle>
          <CardDescription>
            Başvurunuz platform yöneticisi tarafından incelendikten sonra size
            davet linki gönderilir.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {status === "ok" ? (
            <div className="space-y-4 text-center">
              <div className="rounded-md bg-emerald-100 px-4 py-3 text-sm text-emerald-900">
                Başvurunuz alındı. Onaylandığında e-posta ile davet linki
                gönderilecek.
              </div>
              <Button asChild variant="outline">
                <Link href="/">Ana sayfaya dön</Link>
              </Button>
            </div>
          ) : (
            <form action={submitApplication} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="fullName">Ad Soyad</Label>
                <Input id="fullName" name="fullName" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">E-posta</Label>
                <Input id="email" name="email" type="email" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Telefon (ops.)</Label>
                <Input id="phone" name="phone" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="message">Mesaj</Label>
                <Textarea
                  id="message"
                  name="message"
                  placeholder="Kendinizden ve hedeflediğiniz öğrenci kitlesinden kısaca bahsedin."
                />
              </div>
              <Button type="submit" className="w-full">
                Başvuruyu Gönder
              </Button>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
