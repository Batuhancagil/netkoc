import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { requireTutorOrg } from "@/lib/tenant";
import { prisma } from "@/lib/db";
import { TRACK_LABELS } from "@/lib/constants";
import { formatDate, formatTL } from "@/lib/utils";
import {
  initializeWeeklyPayments,
  togglePaymentPaid,
  upsertPayment,
} from "./actions";

export default async function PaymentsPage({
  searchParams,
}: {
  searchParams: Promise<{ studentId?: string }>;
}) {
  const { org } = await requireTutorOrg();
  const { studentId } = await searchParams;

  const students = await prisma.student.findMany({
    where: { orgId: org.id },
    orderBy: { fullName: "asc" },
  });
  const active = studentId ? students.find((s) => s.id === studentId) : students[0];
  if (!active) {
    return <p className="text-sm text-muted-foreground">Önce öğrenci ekle.</p>;
  }

  const payments = await prisma.payment.findMany({
    where: { studentId: active.id },
    orderBy: { weekIndex: "asc" },
  });

  const totalPlanned = payments.reduce(
    (s, p) => s + (p.amount ? Number(p.amount) : 0),
    0
  );
  const totalPaid = payments.reduce(
    (s, p) => s + (p.paidAt && p.amount ? Number(p.amount) : 0),
    0
  );
  const paidCount = payments.filter((p) => p.paidAt).length;
  const pendingCount = payments.length - paidCount;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Ödeme Takibi</h1>

      <form method="get" className="flex flex-wrap items-end gap-3">
        <div className="min-w-[240px] space-y-1">
          <Label>Öğrenci</Label>
          <Select name="studentId" defaultValue={active.id}>
            {students.map((s) => (
              <option key={s.id} value={s.id}>
                {s.fullName} ({TRACK_LABELS[s.track]})
              </option>
            ))}
          </Select>
        </div>
        <Button type="submit" variant="outline">Seç</Button>
      </form>

      <div className="grid gap-3 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Haftalar</CardDescription>
            <CardTitle className="text-2xl">{payments.length}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Ödenen</CardDescription>
            <CardTitle className="text-2xl">{paidCount}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Bekleyen</CardDescription>
            <CardTitle className="text-2xl">{pendingCount}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Toplam Tahsilat</CardDescription>
            <CardTitle className="text-2xl">{formatTL(totalPaid)}</CardTitle>
          </CardHeader>
          <CardContent className="text-xs text-muted-foreground">
            Planlanan: {formatTL(totalPlanned)}
          </CardContent>
        </Card>
      </div>

      {payments.length === 0 ? (
        <Card>
          <CardHeader>
            <CardTitle>42 Haftalık Plan Oluştur</CardTitle>
            <CardDescription>
              Başlangıç tarihi ve opsiyonel haftalık tutar ile tüm dönem
              otomatik oluşturulur.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form action={initializeWeeklyPayments} className="grid gap-3 md:grid-cols-5">
              <input type="hidden" name="studentId" value={active.id} />
              <div className="space-y-1 md:col-span-2">
                <Label>Başlangıç (Pazartesi)</Label>
                <Input
                  type="date"
                  name="startDate"
                  required
                  defaultValue={new Date().toISOString().slice(0, 10)}
                />
              </div>
              <div className="space-y-1">
                <Label>Hafta Sayısı</Label>
                <Input type="number" name="weeks" defaultValue="42" min="1" max="52" />
              </div>
              <div className="space-y-1">
                <Label>Haftalık Ücret (TL)</Label>
                <Input name="weeklyAmount" placeholder="opsiyonel" />
              </div>
              <div className="flex items-end">
                <Button type="submit">Oluştur</Button>
              </div>
            </form>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Haftalık Ödeme Grid'i</CardTitle>
            <CardDescription>
              Satırdaki "Öde" butonu ile ödendi işaretleyebilir, tutar
              girmek/güncellemek için satırı düzenleyebilirsin.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-sm">
                <thead>
                  <tr className="bg-muted">
                    <th className="border p-2 text-left">Hafta</th>
                    <th className="border p-2 text-left">Vade</th>
                    <th className="border p-2 text-left">Tutar</th>
                    <th className="border p-2 text-left">Not</th>
                    <th className="border p-2 text-center">Durum</th>
                    <th className="border p-2 text-center">Aksiyon</th>
                  </tr>
                </thead>
                <tbody>
                  {payments.map((p) => (
                    <tr key={p.id}>
                      <td className="border p-1 text-center">{p.weekIndex}</td>
                      <td className="border p-1">
                        <form
                          action={upsertPayment}
                          className="flex flex-wrap items-center gap-1"
                        >
                          <input type="hidden" name="studentId" value={active.id} />
                          <input type="hidden" name="weekIndex" value={p.weekIndex} />
                          <Input
                            type="date"
                            name="dueDate"
                            defaultValue={new Date(p.dueDate).toISOString().slice(0, 10)}
                            className="h-8 w-36"
                          />
                      </form>
                      </td>
                      <td className="border p-1">
                        <form
                          action={upsertPayment}
                          className="flex items-center gap-1"
                        >
                          <input type="hidden" name="studentId" value={active.id} />
                          <input type="hidden" name="weekIndex" value={p.weekIndex} />
                          <input
                            type="hidden"
                            name="dueDate"
                            value={new Date(p.dueDate).toISOString().slice(0, 10)}
                          />
                          {p.paidAt ? (
                            <input type="hidden" name="paid" value="on" />
                          ) : null}
                          <Input
                            name="amount"
                            defaultValue={p.amount ? String(p.amount) : ""}
                            placeholder="—"
                            className="h-8 w-24"
                          />
                          <input
                            type="hidden"
                            name="note"
                            value={p.note ?? ""}
                          />
                          <Button type="submit" variant="ghost" className="h-8 px-2 text-xs">
                            Kaydet
                          </Button>
                        </form>
                      </td>
                      <td className="border p-1">
                        <form
                          action={upsertPayment}
                          className="flex items-center gap-1"
                        >
                          <input type="hidden" name="studentId" value={active.id} />
                          <input type="hidden" name="weekIndex" value={p.weekIndex} />
                          <input
                            type="hidden"
                            name="dueDate"
                            value={new Date(p.dueDate).toISOString().slice(0, 10)}
                          />
                          <input
                            type="hidden"
                            name="amount"
                            value={p.amount ? String(p.amount) : ""}
                          />
                          {p.paidAt ? (
                            <input type="hidden" name="paid" value="on" />
                          ) : null}
                          <Input
                            name="note"
                            defaultValue={p.note ?? ""}
                            placeholder="not"
                            className="h-8 w-40"
                          />
                        </form>
                      </td>
                      <td className="border p-1 text-center">
                        {p.paidAt ? (
                          <Badge className="bg-emerald-600 text-white">
                            {formatDate(p.paidAt)}
                          </Badge>
                        ) : (
                          <Badge variant="outline">Bekliyor</Badge>
                        )}
                      </td>
                      <td className="border p-1 text-center">
                        <form action={togglePaymentPaid}>
                          <input type="hidden" name="id" value={p.id} />
                          <Button
                            type="submit"
                            variant={p.paidAt ? "outline" : "default"}
                            className="h-8 px-2 text-xs"
                          >
                            {p.paidAt ? "Geri Al" : "Öde"}
                          </Button>
                        </form>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
