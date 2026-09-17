import { CurriculumBrowser } from "@/components/curriculum-browser";

export default function DashboardCurriculumPage() {
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Müfredat / Konu Listesi</h1>
      <p className="text-sm text-muted-foreground">
        Sayısal, eşit ağırlık, sözel veya dil seç; liste o alanın TYT / AYT / YDT ünitesine göre daralır.
      </p>
      <CurriculumBrowser />
    </div>
  );
}
