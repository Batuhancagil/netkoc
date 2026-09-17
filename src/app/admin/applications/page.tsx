import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { prisma } from "@/lib/db";
import { approveApplication, rejectApplication } from "./actions";
import { CopyableUrl } from "@/components/copyable-url";

export default async function ApplicationsPage({
  searchParams,
}: {
  searchParams: Promise<{ invite?: string }>;
}) {
  const { invite } = await searchParams;
  const applications = await prisma.tutorApplication.findMany({
    orderBy: [{ status: "asc" }, { createdAt: "desc" }],
  });

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Hoca Başvuruları</h1>

      {invite ? (
        <Card className="border-primary">
          <CardHeader>
            <CardTitle>Başvuru onaylandı, davet linki oluşturuldu</CardTitle>
          </CardHeader>
          <CardContent>
            <CopyableUrl url={invite} />
          </CardContent>
        </Card>
      ) : null}

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Ad Soyad</TableHead>
                <TableHead>E-posta</TableHead>
                <TableHead>Telefon</TableHead>
                <TableHead>Mesaj</TableHead>
                <TableHead>Durum</TableHead>
                <TableHead className="text-right">Aksiyon</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {applications.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center text-muted-foreground">
                    Başvuru yok.
                  </TableCell>
                </TableRow>
              ) : (
                applications.map((app) => (
                  <TableRow key={app.id}>
                    <TableCell className="font-medium">{app.fullName}</TableCell>
                    <TableCell>{app.email}</TableCell>
                    <TableCell>{app.phone ?? "—"}</TableCell>
                    <TableCell className="max-w-xs truncate">
                      {app.message ?? "—"}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          app.status === "APPROVED"
                            ? "success"
                            : app.status === "REJECTED"
                            ? "destructive"
                            : "warning"
                        }
                      >
                        {app.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      {app.status === "PENDING" ? (
                        <div className="flex justify-end gap-2">
                          <form action={approveApplication}>
                            <input type="hidden" name="id" value={app.id} />
                            <Button type="submit" size="sm">
                              Onayla & Davet
                            </Button>
                          </form>
                          <form action={rejectApplication}>
                            <input type="hidden" name="id" value={app.id} />
                            <Button type="submit" size="sm" variant="destructive">
                              Reddet
                            </Button>
                          </form>
                        </div>
                      ) : (
                        <span className="text-xs text-muted-foreground">
                          {app.reviewedAt?.toLocaleDateString("tr-TR")}
                        </span>
                      )}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
