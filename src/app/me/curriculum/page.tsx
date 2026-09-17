import { CurriculumBrowser } from "@/components/curriculum-browser";

export default function StudentCurriculumPage() {
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Sınıf ve konu listesi</h1>
      <CurriculumBrowser />
    </div>
  );
}
