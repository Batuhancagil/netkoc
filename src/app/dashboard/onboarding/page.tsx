import { redirect } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { requireTutor } from "@/lib/auth/guards";
import { setupOrg } from "./actions";

export default async function OnboardingPage() {
  const session = await requireTutor();
  if (session.orgId) redirect("/dashboard");
  return (
    <div className="mx-auto max-w-xl">
      <Card>
        <CardHeader>
          <CardTitle>Organizasyonunu Oluştur</CardTitle>
          <CardDescription>
            Kendi öğrencilerini yöneteceğin bir alan oluştur. Daha sonra
            değiştirebilirsin.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form action={setupOrg} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Organizasyon Adı</Label>
              <Input
                id="name"
                name="name"
                defaultValue={`${session.fullName} Koçluk`}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="weekStartsOn">Haftanın ilk günü</Label>
              <Select id="weekStartsOn" name="weekStartsOn" defaultValue="1">
                <option value="1">Pazartesi (ISO / varsayılan)</option>
                <option value="0">Pazar</option>
                <option value="4">Perşembe (Excel stili)</option>
              </Select>
            </div>
            <Button type="submit" className="w-full">
              Devam Et
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
