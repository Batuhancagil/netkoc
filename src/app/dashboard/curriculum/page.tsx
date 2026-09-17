import { CurriculumBrowser } from "@/components/curriculum-browser";

export default function DashboardCurriculumPage() {
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Müfredat / Konu Listesi</h1>
      <CurriculumBrowser />
    </div>
  );
}
