import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { prisma } from "@/lib/db";

const PAGE_SIZE = 30;

export default async function AuditPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; action?: string; page?: string }>;
}) {
  const sp = await searchParams;
  const page = Math.max(1, Number(sp.page ?? 1));
  const q = sp.q?.trim() ?? "";
  const action = sp.action?.trim() ?? "";

  const where: any = {};
  if (action) where.action = { contains: action, mode: "insensitive" };
  if (q) {
    where.OR = [
      { actor: { fullName: { contains: q, mode: "insensitive" } } },
      { actor: { email: { contains: q, mode: "insensitive" } } },
      { entity: { contains: q, mode: "insensitive" } },
    ];
  }

  const [total, logs] = await Promise.all([
    prisma.auditLog.count({ where }),
    prisma.auditLog.findMany({
      where,
      orderBy: { createdAt: "desc" },
      include: { actor: true, impersonated: true },
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
    }),
  ]);

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  const makeHref = (p: number) => {
    const params = new URLSearchParams();
    if (q) params.set("q", q);
    if (action) params.set("action", action);
    params.set("page", String(p));
    return `/admin/audit?${params.toString()}`;
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Audit Log</h1>

      <Card>
        <CardContent className="pt-6">
          <form className="grid gap-3 md:grid-cols-4">
            <div className="space-y-1 md:col-span-2">
              <Label htmlFor="q">Ara (kullanıcı / entity)</Label>
              <Input id="q" name="q" defaultValue={q} />
            </div>
            <div className="space-y-1">
              <Label htmlFor="action">Aksiyon</Label>
              <Input id="action" name="action" defaultValue={action} placeholder="ör. auth.login" />
            </div>
            <div className="flex items-end">
              <Button type="submit">Filtrele</Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Tarih</TableHead>
                <TableHead>Actor</TableHead>
                <TableHead>Aksiyon</TableHead>
                <TableHead>Entity</TableHead>
                <TableHead>Impersonated</TableHead>
                <TableHead>IP</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {logs.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center text-muted-foreground">
                    Kayıt yok.
                  </TableCell>
                </TableRow>
              ) : (
                logs.map((log) => (
                  <TableRow key={log.id}>
                    <TableCell className="whitespace-nowrap text-xs">
                      {log.createdAt.toLocaleString("tr-TR")}
                    </TableCell>
                    <TableCell>
                      <div className="font-medium">{log.actor.fullName}</div>
                      <div className="text-xs text-muted-foreground">{log.actor.email}</div>
                    </TableCell>
                    <TableCell>
                      <code className="rounded bg-muted px-2 py-0.5 text-xs">{log.action}</code>
                    </TableCell>
                    <TableCell className="text-xs">
                      {log.entity}
                      {log.entityId ? (
                        <span className="text-muted-foreground"> ({log.entityId.slice(0, 8)})</span>
                      ) : null}
                    </TableCell>
                    <TableCell className="text-xs">
                      {log.impersonated?.fullName ?? "—"}
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">
                      {log.ip ?? "—"}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <div className="flex items-center justify-between text-sm">
        <span className="text-muted-foreground">
          Toplam {total} kayıt — Sayfa {page}/{totalPages}
        </span>
        <div className="flex gap-2">
          <Button asChild variant="outline" size="sm" disabled={page <= 1}>
            <Link href={makeHref(Math.max(1, page - 1))}>Önceki</Link>
          </Button>
          <Button asChild variant="outline" size="sm" disabled={page >= totalPages}>
            <Link href={makeHref(Math.min(totalPages, page + 1))}>Sonraki</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
