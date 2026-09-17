export const MONTH_NAMES_TR = [
  "Eylül",
  "Ekim",
  "Kasım",
  "Aralık",
  "Ocak",
  "Şubat",
  "Mart",
  "Nisan",
  "Mayıs",
];

export const TRACK_LABELS: Record<string, string> = {
  SAYISAL: "Sayısal",
  EA: "Eşit Ağırlık",
  SOZEL: "Sözel",
  DIL: "Dil",
};

export const SCOPE_LABELS: Record<string, string> = {
  YKS: "Üniversite sınavı (YKS)",
  GRADE_9: "9. sınıf",
  GRADE_10: "10. sınıf",
  GRADE_11: "11. sınıf",
  GRADE_12: "12. sınıf",
};

export const SCOPE_ORDER = ["YKS", "GRADE_9", "GRADE_10", "GRADE_11", "GRADE_12"] as const;

export function suggestedScope(input: { grade?: number | null; graduationYear?: number | null }) {
  if (input.grade === 9) return "GRADE_9";
  if (input.grade === 10) return "GRADE_10";
  if (input.grade === 11) return "GRADE_11";
  if (input.grade === 12) return "GRADE_12";
  const now = new Date();
  const academicEnd = now.getUTCMonth() >= 8 ? now.getUTCFullYear() + 1 : now.getUTCFullYear();
  if (input.graduationYear === academicEnd) return "GRADE_12";
  if (input.graduationYear === academicEnd + 1) return "GRADE_11";
  if (input.graduationYear === academicEnd + 2) return "GRADE_10";
  if (input.graduationYear === academicEnd + 3) return "GRADE_9";
  return "YKS";
}

export function gradeFromScope(scope: string): number | null {
  if (scope === "GRADE_9") return 9;
  if (scope === "GRADE_10") return 10;
  if (scope === "GRADE_11") return 11;
  if (scope === "GRADE_12") return 12;
  return null;
}
