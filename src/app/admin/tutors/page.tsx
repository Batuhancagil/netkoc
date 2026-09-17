import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { prisma } from "@/lib/db";
import { createTutorInvite, toggleTutorStatus, startImpersonation } from "./actions";
import { CopyableUrl } from "@/components/copyable-url";
import { publicUrl } from "@/lib/public-url";

export default async function TutorsPage({
  searchParams,
}: {
  searchParams: Promise<{ invite?: string }>;
}) {
  const { invite } = await searchParams;
  const tutors = await prisma.user.findMany({
    where: { role: "TUTOR" },
    orderBy: { createdAt: "desc" },
    include: {
      org: { include: { _count: { select: { students: true } } } },
    },
  });
  const pendingInvites = await prisma.invite.findMany({
    where: { kind: "TUTOR", usedAt: null, expiresAt: { gt: new Date() } },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Hocalar</h1>

      {invite ? (
        <Card className="border-primary">
          <CardHeader>
            <CardTitle>Yeni davet linki</CardTitle>
            <CardDescription>
              Bu linki hocaya iletin. Tek kullanımlık, 7 gün geçerli.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <CopyableUrl url={invite} />
          </CardContent>
        </Card>
      ) : null}

      <Card>
        <CardHeader>
          <CardTitle>Yeni hoca daveti oluştur</CardTitle>
          <CardDescription>
            Hoca bu linkten giriş yapıp kendi şifresini belirler.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form action={createTutorInvite} className="grid gap-3 md:grid-cols-4">
            <div className="space-y-1 md:col-span-2">
              <Label htmlFor="fullName">Ad Soyad</Label>
              <Input id="fullName" name="fullName" required />
            </div>
            <div className="space-y-1 md:col-span-2">
              <Label htmlFor="email">E-posta</Label>
              <Input id="email" name="email" type="email" required />
            </div>
            <div className="space-y-1 md:col-span-4">
              <Label htmlFor="orgName">Organizasyon Adı (ops.)</Label>
              <Input
                id="orgName"
                name="orgName"
                placeholder="Boş bırakılırsa 'Ad Soyad Koçluk' olarak oluşturulur"
              />
            </div>
            <div className="flex items-end md:col-span-4">
              <Button type="submit">Davet Linki Oluştur</Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Kayıtlı Hocalar</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Hoca</TableHead>
                <TableHead>E-posta</TableHead>
                <TableHead>Organizasyon</TableHead>
                <TableHead>Öğrenci</TableHead>
                <TableHead>Durum</TableHead>
                <TableHead className="text-right">Aksiyon</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {tutors.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center text-muted-foreground">
                    Henüz kayıtlı hoca yok.
                  </TableCell>
                </TableRow>
              ) : (
                tutors.map((tutor) => (
                  <TableRow key={tutor.id}>
                    <TableCell className="font-medium">{tutor.fullName}</TableCell>
                    <TableCell>{tutor.email}</TableCell>
                    <TableCell>{tutor.org?.name ?? "—"}</TableCell>
                    <TableCell>{tutor.org?._count.students ?? 0}</TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          tutor.status === "ACTIVE"
                            ? "success"
                            : tutor.status === "PENDING"
                            ? "warning"
                            : "destructive"
                        }
                      >
                        {tutor.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <form action={startImpersonation}>
                          <input type="hidden" name="userId" value={tutor.id} />
                          <Button type="submit" size="sm" variant="outline">
                            Impersonate
                          </Button>
                        </form>
                        <form action={toggleTutorStatus}>
                          <input type="hidden" name="userId" value={tutor.id} />
                          <Button
                            type="submit"
                            size="sm"
                            variant={tutor.status === "DISABLED" ? "default" : "destructive"}
                          >
                            {tutor.status === "DISABLED" ? "Aktifleştir" : "Devre dışı"}
                          </Button>
                        </form>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {pendingInvites.length > 0 ? (
        <Card>
          <CardHeader>
            <CardTitle>Kullanılmamış Davetler</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Ad</TableHead>
                  <TableHead>E-posta</TableHead>
                  <TableHead>Son Geçerlilik</TableHead>
                  <TableHead>Link</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {pendingInvites.map((inv) => (
                  <TableRow key={inv.id}>
                    <TableCell>{inv.fullName ?? "—"}</TableCell>
                    <TableCell>{inv.email ?? "—"}</TableCell>
                    <TableCell>{inv.expiresAt.toLocaleDateString("tr-TR")}</TableCell>
                    <TableCell className="max-w-sm">
                      <CopyableUrl url={publicUrl(`/invite/${inv.token}`)} />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      ) : null}
    </div>
  );
}
