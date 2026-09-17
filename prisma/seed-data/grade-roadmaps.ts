import type { ExamTrack } from "@prisma/client";
import { schoolUnitsFor, type Grade } from "../../src/lib/official-curriculum";
import { ROADMAP_CALENDAR, shiftWeeks, type SeedRoadmap, type SeedRoadmapWeek } from "./roadmap";

const TRACK_LABEL: Record<ExamTrack, string> = {
  SAYISAL: "Sayısal",
  EA: "Eşit Ağırlık",
  SOZEL: "Sözel",
  DIL: "Dil",
};

const SCOPE_BY_GRADE = {
  9: "GRADE_9",
  10: "GRADE_10",
  11: "GRADE_11",
  12: "GRADE_12",
} as const;

type CurriculumKey = "mat" | "fizik" | "kimya" | "biyo" | "tde" | "tarih" | "inkilap" | "cografya" | "felsefe" | "dkab";

function columnsFor(track: ExamTrack, grade: Grade): { code: string; key: CurriculumKey }[] {
  const common9_10: { code: string; key: CurriculumKey }[] = [
    { code: "MAT1", key: "mat" },
    { code: "TUR", key: "tde" },
    { code: "TAR", key: "tarih" },
    { code: "COG", key: "cografya" },
    { code: "DIN", key: "dkab" },
  ];
  if (grade <= 10) {
    if (track === "SAYISAL" || track === "EA") {
      return [
        ...common9_10,
        { code: "FIZ", key: "fizik" },
        { code: "KIM", key: "kimya" },
        { code: "BIY", key: "biyo" },
      ];
    }
    if (track === "SOZEL") {
      return [...common9_10, { code: "FEL", key: "felsefe" }];
    }
    return [
      { code: "MAT1", key: "mat" },
      { code: "TUR", key: "tde" },
      { code: "DIN", key: "dkab" },
      { code: "YDT_ING", key: "tde" },
    ];
  }
  if (track === "SAYISAL") {
    return [
      { code: "MAT1", key: "mat" },
      { code: "FIZ", key: "fizik" },
      { code: "KIM", key: "kimya" },
      { code: "BIY", key: "biyo" },
      { code: "TUR", key: "tde" },
      { code: grade === 12 ? "TAR" : "TAR", key: grade === 12 ? "inkilap" : "tarih" },
    ];
  }
  if (track === "EA") {
    return [
      { code: "MAT1", key: "mat" },
      { code: "TUR", key: "tde" },
      { code: "TAR", key: grade === 12 ? "inkilap" : "tarih" },
      { code: "COG", key: "cografya" },
      { code: "FEL", key: "felsefe" },
    ];
  }
  if (track === "SOZEL") {
    return [
      { code: "TUR", key: "tde" },
      { code: "TAR", key: grade === 12 ? "inkilap" : "tarih" },
      { code: "COG", key: "cografya" },
      { code: "FEL", key: "felsefe" },
      { code: "DIN", key: "dkab" },
    ];
  }
  return [
    { code: "TUR", key: "tde" },
    { code: "YDT_ING", key: "tde" },
    { code: "MAT1", key: "mat" },
  ];
}

function spreadTitles(titles: string[], weekCount: number): string[] {
  if (titles.length === 0) return Array.from({ length: weekCount }, () => "");
  return Array.from({ length: weekCount }, (_, i) => {
    const idx = Math.min(titles.length - 1, Math.floor((i * titles.length) / weekCount));
    return titles[idx];
  });
}

function englishTitles(weekCount: number): string[] {
  const units = [
    "Tenses",
    "Modals",
    "Passive Voice",
    "Relative Clauses",
    "Conditionals",
    "Reading / Cloze",
  ];
  return spreadTitles(units, weekCount);
}

function buildGradeWeeks(track: ExamTrack, grade: Grade): SeedRoadmapWeek[] {
  const calendar = shiftWeeks(ROADMAP_CALENDAR, 1);
  const cols = columnsFor(track, grade);
  const series = new Map<string, string[]>();
  for (const col of cols) {
    if (col.code === "YDT_ING") {
      const units = schoolUnitsFor(grade, "ydt");
      const titles = units.length ? units.map((u) => u.title) : englishTitles(calendar.length);
      series.set(col.code, spreadTitles(titles, calendar.length));
      continue;
    }
    const units = schoolUnitsFor(grade, col.key);
    const titles = units.map((u) => u.title);
    series.set(col.code, spreadTitles(titles, calendar.length));
  }
  return calendar.map((w, i) => {
    const cells: Record<string, string> = {};
    for (const col of cols) {
      const text = series.get(col.code)?.[i] ?? "";
      if (text) cells[col.code] = text;
    }
    return { ...w, cells };
  });
}

export function buildGradeRoadmaps(year = 2026): SeedRoadmap[] {
  const tracks: ExamTrack[] = ["SAYISAL", "EA", "SOZEL", "DIL"];
  const grades: Grade[] = [9, 10, 11, 12];
  const out: SeedRoadmap[] = [];
  for (const track of tracks) {
    for (const grade of grades) {
      out.push({
        track,
        year,
        scope: SCOPE_BY_GRADE[grade],
        name: `${grade}. Sınıf ${year}-${year + 1} ${TRACK_LABEL[track]}`,
        weeks: buildGradeWeeks(track, grade),
      });
    }
  }
  return out;
}

export const SEED_GRADE_ROADMAPS = buildGradeRoadmaps(2026);
