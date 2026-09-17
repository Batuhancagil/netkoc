import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { requireTutorOrg } from "@/lib/tenant";
import { prisma } from "@/lib/db";
import { formatDate } from "@/lib/utils";

export default async function StudentsPage() {
  const { org } = await requireTutorOrg();

  const students = await prisma.student.findMany({
    where: { orgId: org.id },
    orderBy: { createdAt: "desc" },
    include: {
      user: true,
      parentLinks: { include: { parent: true } },
      _count: { select: { weeklyPlans: true, trialExams: true } },
    },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Öğrenciler</h1>
        <Button asChild>
          <Link href="/dashboard/students/new">Yeni Öğrenci</Link>
        </Button>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Ad Soyad</TableHead>
                <TableHead>Alan</TableHead>
                <TableHead>Giriş Tarihi</TableHead>
                <TableHead>Hesap</TableHead>
                <TableHead>Veli</TableHead>
                <TableHead>Program</TableHead>
                <TableHead>Deneme</TableHead>
                <TableHead />
              </TableRow>
            </TableHeader>
            <TableBody>
              {students.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center text-muted-foreground">
                    Henüz öğrenci eklenmedi.
                  </TableCell>
                </TableRow>
              ) : (
                students.map((s) => (
                  <TableRow key={s.id}>
                    <TableCell className="font-medium">
                      <Link className="hover:underline" href={`/dashboard/students/${s.id}`}>
                        {s.fullName}
                      </Link>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{s.track}</Badge>
                      {s.grade ? (
                        <Badge variant="secondary" className="ml-1">
                          {s.grade}. sınıf
                        </Badge>
                      ) : null}
                    </TableCell>
                    <TableCell>{formatDate(s.startDate)}</TableCell>
                    <TableCell className="text-xs">
                      {s.user ? (
                        <span className="text-emerald-700">Aktif</span>
                      ) : (
                        <span className="text-muted-foreground">Davet yok</span>
                      )}
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">
                      {s.parentLinks.length > 0
                        ? s.parentLinks.map((p) => p.parent.fullName).join(", ")
                        : "—"}
                    </TableCell>
                    <TableCell className="text-xs">{s._count.weeklyPlans}</TableCell>
                    <TableCell className="text-xs">{s._count.trialExams}</TableCell>
                    <TableCell className="text-right">
                      <Button asChild size="sm" variant="outline">
                        <Link href={`/dashboard/students/${s.id}`}>Detay</Link>
                      </Button>
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
