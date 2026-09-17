import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { prisma } from "@/lib/db";

export default async function AdminDashboardPage() {
  const [
    tutorCount,
    activeTutorCount,
    pendingApps,
    studentCount,
    recentLogs,
    orgCount,
  ] = await Promise.all([
    prisma.user.count({ where: { role: "TUTOR" } }),
    prisma.user.count({ where: { role: "TUTOR", status: "ACTIVE" } }),
    prisma.tutorApplication.count({ where: { status: "PENDING" } }),
    prisma.student.count(),
    prisma.auditLog.findMany({
      take: 10,
      orderBy: { createdAt: "desc" },
      include: { actor: true, impersonated: true },
    }),
    prisma.organization.count({ where: { disabledAt: null } }),
  ]);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Platform Özeti</h1>

      <div className="grid gap-4 md:grid-cols-4">
        <Metric label="Aktif Organizasyon" value={orgCount} />
        <Metric label="Toplam Hoca" value={tutorCount} sublabel={`${activeTutorCount} aktif`} />
        <Metric label="Toplam Öğrenci" value={studentCount} />
        <Metric
          label="Bekleyen Başvuru"
          value={pendingApps}
          href={pendingApps > 0 ? "/admin/applications" : undefined}
        />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Son Audit Kayıtları</CardTitle>
          <CardDescription>Platformdaki son 10 aksiyon</CardDescription>
        </CardHeader>
        <CardContent>
          {recentLogs.length === 0 ? (
            <p className="text-sm text-muted-foreground">Henüz kayıt yok.</p>
          ) : (
            <ul className="space-y-2 text-sm">
              {recentLogs.map((log) => (
                <li key={log.id} className="flex items-center justify-between border-b pb-2 last:border-0">
                  <span>
                    <strong>{log.actor.fullName}</strong>
                    {log.impersonatedUserId ? (
                      <span className="text-amber-700"> (→ {log.impersonated?.fullName})</span>
                    ) : null}{" "}
                    <span className="text-muted-foreground">{log.action}</span>
                    {log.entity ? (
                      <span className="text-muted-foreground"> · {log.entity}</span>
                    ) : null}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {log.createdAt.toLocaleString("tr-TR")}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function Metric({
  label,
  value,
  sublabel,
  href,
}: {
  label: string;
  value: number;
  sublabel?: string;
  href?: string;
}) {
  const content = (
    <Card className={href ? "transition hover:shadow-md" : undefined}>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {label}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-3xl font-bold">{value}</p>
        {sublabel ? (
          <p className="mt-1 text-xs text-muted-foreground">{sublabel}</p>
        ) : null}
      </CardContent>
    </Card>
  );
  return href ? <Link href={href}>{content}</Link> : content;
}
