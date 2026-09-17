import Link from "next/link";
import { notFound } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { requireTutorOrg } from "@/lib/tenant";
import { prisma } from "@/lib/db";
import { formatDate } from "@/lib/utils";
import { inviteStudent, inviteParent } from "./actions";
import { CopyableUrl } from "@/components/copyable-url";

export default async function StudentDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ invite?: string }>;
}) {
  const { id } = await params;
  const { invite } = await searchParams;
  const { org } = await requireTutorOrg();
  const student = await prisma.student.findFirst({
    where: { id, orgId: org.id },
    include: {
      user: true,
      parentLinks: { include: { parent: true } },
      roadmap: { include: { template: true } },
      payments: { orderBy: { weekIndex: "asc" } },
      _count: { select: { weeklyPlans: true, trialExams: true, topicSessions: true } },
    },
  });
  if (!student) notFound();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">{student.fullName}</h1>
          <p className="text-sm text-muted-foreground">
            <Badge variant="outline">{student.track}</Badge>
            {student.grade ? (
              <Badge variant="secondary" className="ml-1">
                {student.grade}. sınıf
              </Badge>
            ) : (
              <Badge variant="secondary" className="ml-1">
                YKS / mezun
              </Badge>
            )}{" "}
            <span className="ml-2">Başlangıç: {formatDate(student.startDate)}</span>
          </p>
        </div>
        <div className="flex gap-2">
          <Button asChild variant="outline">
            <Link href={`/dashboard/weekly?studentId=${student.id}`}>Haftalık Program</Link>
          </Button>
          <Button asChild variant="outline">
            <Link href={`/dashboard/roadmap?studentId=${student.id}`}>Yol Haritası</Link>
          </Button>
          <Button asChild variant="outline">
            <Link href={`/dashboard/trials?studentId=${student.id}`}>Denemeler</Link>
          </Button>
          <Button asChild variant="outline">
            <Link href={`/dashboard/payments?studentId=${student.id}`}>Ödeme</Link>
          </Button>
        </div>
      </div>

      {invite ? (
        <Card className="border-primary">
          <CardHeader>
            <CardTitle>Yeni davet linki</CardTitle>
          </CardHeader>
          <CardContent>
            <CopyableUrl url={invite} />
          </CardContent>
        </Card>
      ) : null}

      <div className="grid gap-4 md:grid-cols-4">
        <Metric label="Haftalık Plan" value={student._count.weeklyPlans} />
        <Metric label="Deneme" value={student._count.trialExams} />
        <Metric label="Konu Oturumu" value={student._count.topicSessions} />
        <Metric
          label="Yol Haritası"
          value={student.roadmap ? student.roadmap.template.name : "—"}
        />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Öğrenci Hesabı</CardTitle>
          <CardDescription>
            {student.user
              ? `${student.user.fullName} · ${student.user.email}`
              : "Öğrenci henüz portale davet edilmemiş."}
          </CardDescription>
        </CardHeader>
        {!student.user ? (
          <CardContent>
            <form action={inviteStudent} className="flex flex-wrap gap-3">
              <input type="hidden" name="studentId" value={student.id} />
              <div className="min-w-[240px] flex-1 space-y-1">
                <Label htmlFor="studentEmail">E-posta</Label>
                <Input id="studentEmail" name="email" type="email" required />
              </div>
              <div className="flex items-end">
                <Button type="submit">Öğrenci Daveti Oluştur</Button>
              </div>
            </form>
          </CardContent>
        ) : null}
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Veli Bağlantıları</CardTitle>
          <CardDescription>
            Öğrenciye birden çok veli bağlanabilir. Veliler salt okunur erişim görür.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {student.parentLinks.length > 0 ? (
            <ul className="space-y-1 text-sm">
              {student.parentLinks.map((p) => (
                <li key={p.id}>
                  <strong>{p.parent.fullName}</strong>{" "}
                  <span className="text-muted-foreground">· {p.parent.email}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-muted-foreground">Henüz veli bağlı değil.</p>
          )}
          <form action={inviteParent} className="flex flex-wrap gap-3">
            <input type="hidden" name="studentId" value={student.id} />
            <div className="min-w-[200px] flex-1 space-y-1">
              <Label htmlFor="parentName">Veli Adı</Label>
              <Input id="parentName" name="fullName" required />
            </div>
            <div className="min-w-[240px] flex-1 space-y-1">
              <Label htmlFor="parentEmail">Veli E-postası</Label>
              <Input id="parentEmail" name="email" type="email" required />
            </div>
            <div className="flex items-end">
              <Button type="submit">Veli Daveti Oluştur</Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

function Metric({ label, value }: { label: string; value: number | string }) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">{label}</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="truncate text-xl font-bold">{value}</p>
      </CardContent>
    </Card>
  );
}
