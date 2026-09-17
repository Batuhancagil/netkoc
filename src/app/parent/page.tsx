import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { requireParent } from "@/lib/auth/guards";
import { prisma } from "@/lib/db";
import { TRACK_LABELS } from "@/lib/constants";

export default async function ParentHomePage() {
  const session = await requireParent();
  const links = await prisma.parentLink.findMany({
    where: { parentUserId: session.userId },
    include: { student: { include: { org: true } } },
  });

  if (links.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Bağlı Öğrenci Yok</CardTitle>
          <CardDescription>
            Hocanız hesabınızı henüz bir öğrenciye bağlamamış görünüyor.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Çocuklarım</h1>
      <div className="grid gap-3 md:grid-cols-2">
        {links.map((l) => (
          <Card key={l.id}>
            <CardHeader>
              <CardTitle>{l.student.fullName}</CardTitle>
              <CardDescription>
                {TRACK_LABELS[l.student.track]} · {l.student.org.name}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Link
                href={`/parent/${l.studentId}`}
                className="text-sm font-medium text-primary hover:underline"
              >
                Detayları gör →
              </Link>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
