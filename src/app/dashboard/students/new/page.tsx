import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { requireTutorOrg } from "@/lib/tenant";
import { createStudent } from "./actions";

export default async function NewStudentPage() {
  await requireTutorOrg();
  return (
    <div className="mx-auto max-w-2xl">
      <Card>
        <CardHeader>
          <CardTitle>Yeni Öğrenci</CardTitle>
        </CardHeader>
        <CardContent>
          <form action={createStudent} className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="fullName">Ad Soyad</Label>
              <Input id="fullName" name="fullName" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="track">Alan</Label>
              <Select id="track" name="track" required defaultValue="SAYISAL">
                <option value="SAYISAL">Sayısal</option>
                <option value="EA">Eşit Ağırlık</option>
                <option value="SOZEL">Sözel</option>
                <option value="DIL">Dil</option>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="grade">Sınıf (isteğe bağlı)</Label>
              <Select id="grade" name="grade" defaultValue="">
                <option value="">Mezun / yalnızca YKS</option>
                <option value="9">9. sınıf</option>
                <option value="10">10. sınıf</option>
                <option value="11">11. sınıf</option>
                <option value="12">12. sınıf</option>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="graduationYear">Mezuniyet Yılı</Label>
              <Input id="graduationYear" name="graduationYear" type="number" min="2024" max="2040" />
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="notes">Notlar</Label>
              <Textarea id="notes" name="notes" rows={3} />
            </div>
            <div className="md:col-span-2">
              <Button type="submit" className="w-full md:w-auto">Oluştur</Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
