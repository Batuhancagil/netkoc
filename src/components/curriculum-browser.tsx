"use client";

import { useMemo, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { CopyableUrl } from "@/components/copyable-url";
import { TRACK_LABELS } from "@/lib/constants";
import {
  CURRICULUM_TRACKS,
  CURRICULUM_YEAR,
  OFFICIAL_SOURCES,
  PROGRAMS,
  subjectFitsTrack,
  subjectTrackWeight,
  tracksForSubject,
  unitFitsTrack,
  type CurriculumTrack,
  type ExamHint,
  type Grade,
  type ProgramKind,
} from "@/lib/official-curriculum";

const GRADES: Grade[] = [9, 10, 11, 12];

function examVariant(exam: ExamHint): "default" | "secondary" | "outline" {
  if (exam === "TYT") return "default";
  if (exam === "AYT") return "secondary";
  return "outline";
}

function groupLabel(group: string) {
  if (group === "sayısal") return "Sayısal ders";
  if (group === "sözel") return "Sözel ders";
  if (group === "dil") return "Dil / YDT";
  return "Ortak (TYT)";
}

export function CurriculumBrowser() {
  const [program, setProgram] = useState<ProgramKind>("yks2018");
  const [track, setTrack] = useState<CurriculumTrack | "all">("all");
  const [grade, setGrade] = useState<Grade | "all">("all");
  const [subjectId, setSubjectId] = useState("all");
  const [exam, setExam] = useState<ExamHint | "all">("all");
  const [q, setQ] = useState("");

  const pack = PROGRAMS[program];
  const visibleSubjects = useMemo(
    () =>
      pack.subjects
        .filter((s) => subjectFitsTrack(s, track))
        .sort((a, b) => subjectTrackWeight(a.id, track) - subjectTrackWeight(b.id, track)),
    [pack, track]
  );

  const filtered = useMemo(() => {
    const needle = q.trim().toLocaleLowerCase("tr");
    return visibleSubjects
      .filter((s) => subjectId === "all" || s.id === subjectId)
      .map((s) => {
        const grades = GRADES.filter((g) => grade === "all" || g === grade)
          .map((g) => {
            const units = s.grades[g].filter((u) => {
              if (!unitFitsTrack(s.id, u, track)) return false;
              if (exam !== "all" && u.exam !== exam && u.exam !== "HER İKİSİ") return false;
              if (!needle) return true;
              const hay = `${s.name} ${u.code} ${u.title} ${u.topics.join(" ")}`.toLocaleLowerCase("tr");
              return hay.includes(needle);
            });
            return { grade: g, units };
          })
          .filter((row) => row.units.length > 0);
        return { subject: s, grades };
      })
      .filter((row) => row.grades.length > 0);
  }, [visibleSubjects, grade, subjectId, exam, q, track]);

  const unitCount = filtered.reduce(
    (n, row) => n + row.grades.reduce((m, g) => m + g.units.length, 0),
    0
  );

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Sınıf — ders — konu listesi</CardTitle>
          <CardDescription>
            {CURRICULUM_YEAR} eğitim yılı. Sayısal, eşit ağırlık, sözel ve dil (YDT) ayrı seçilir.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 text-sm leading-relaxed">
          <p>
            Önce <strong>alanı</strong> seç. Sayısal’da AYT fen–matematik, EA’da matematik + edebiyat +
            tarih–coğrafya, Sözel’de edebiyat–tarih–coğrafya–felsefe–DKAB, Dil’de YDT İngilizce öne çıkar.
            TYT Türkçe, sosyal, matematik ve fen tüm alanlarda durur.
          </p>
          <p>
            <strong>YKS kapsamı</strong> TTKB 26 Kasım 2025 / 2026 YKS PDF’sidir (2018 program).{" "}
            <strong>Okulda bu yıl</strong> 9–11 STEM Maarif, diğer dersler 2018 ünite adıyla; 12. sınıf 2018.
            Almanca / Fransızca YDT aynı soru tipleridir; dil bilgisi o dile göredir.
          </p>
        </CardContent>
      </Card>

      <div>
        <Label>Alan</Label>
        <div className="mt-2 flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => {
              setTrack("all");
              setSubjectId("all");
            }}
            className={`rounded-md border px-3 py-2 text-sm ${
              track === "all" ? "border-primary bg-primary/10 font-medium" : "hover:bg-muted/40"
            }`}
          >
            Tüm alanlar
          </button>
          {CURRICULUM_TRACKS.map((value) => (
            <button
              key={value}
              type="button"
              onClick={() => {
                setTrack(value);
                setSubjectId("all");
              }}
              className={`rounded-md border px-3 py-2 text-sm ${
                track === value ? "border-primary bg-primary/10 font-medium" : "hover:bg-muted/40"
              }`}
            >
              {TRACK_LABELS[value]}
            </button>
          ))}
        </div>
        <p className="mt-2 text-xs text-muted-foreground">
          {track === "all"
            ? "Tüm dersler. Alan seçince o alandaki AYT / YDT ünitesi öne çıkar."
            : track === "SAYISAL"
              ? "AYT matematik, fizik, kimya, biyoloji + TYT ortak."
              : track === "EA"
                ? "AYT matematik, edebiyat, tarih, coğrafya + TYT fen ve ortak."
                : track === "SOZEL"
                  ? "AYT edebiyat, tarih, inkılap, coğrafya, felsefe, DKAB + TYT mat–fen."
                  : "YDT İngilizce + TYT Türkçe, sosyal, matematik, fen. AYT branş yok."}
        </p>
      </div>

      <div className="grid gap-3 md:grid-cols-2">
        {(Object.keys(PROGRAMS) as ProgramKind[]).map((key) => (
          <button
            key={key}
            type="button"
            onClick={() => {
              setProgram(key);
              setSubjectId("all");
            }}
            className={`rounded-lg border p-4 text-left transition ${
              program === key ? "border-primary bg-primary/5" : "hover:bg-muted/40"
            }`}
          >
            <p className="font-semibold">{PROGRAMS[key].label}</p>
            <p className="mt-1 text-xs text-muted-foreground">{PROGRAMS[key].blurb}</p>
          </button>
        ))}
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <Label>Sınıf</Label>
          <Select value={String(grade)} onChange={(e) => setGrade(e.target.value === "all" ? "all" : (Number(e.target.value) as Grade))}>
            <option value="all">Tüm sınıflar</option>
            {GRADES.map((g) => (
              <option key={g} value={g}>
                {g}. sınıf
              </option>
            ))}
          </Select>
        </div>
        <div>
          <Label>Ders</Label>
          <Select value={subjectId} onChange={(e) => setSubjectId(e.target.value)}>
            <option value="all">Tüm dersler</option>
            {visibleSubjects.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </Select>
        </div>
        <div>
          <Label>Sınav</Label>
          <Select value={exam} onChange={(e) => setExam(e.target.value as ExamHint | "all")}>
            <option value="all">TYT + AYT + YDT</option>
            <option value="TYT">TYT</option>
            <option value="AYT">AYT</option>
            <option value="YDT">YDT</option>
          </Select>
        </div>
        <div>
          <Label>Ara</Label>
          <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Türev, Tanzimat, cloze…" />
        </div>
      </div>

      <p className="text-sm text-muted-foreground">
        {unitCount} ünite / tema
        {track !== "all" ? ` · ${TRACK_LABELS[track]}` : ""}. Boş gelen ders-sınıf o programda yok
        (ör. felsefe 9, inkılap 9–11) veya seçilen alana ait değil.
      </p>

      {filtered.length === 0 ? (
        <Card>
          <CardContent className="pt-6 text-sm text-muted-foreground">
            Bu alan ve süzgeçte ünite yok. Alanı, sınıfı veya aramayı genişlet.
          </CardContent>
        </Card>
      ) : (
        filtered.map(({ subject, grades }) => (
          <Card key={subject.id}>
            <CardHeader>
              <CardTitle className="text-lg">{subject.name}</CardTitle>
              <CardDescription className="flex flex-wrap gap-1">
                <Badge variant="outline">{groupLabel(subject.group)}</Badge>
                {tracksForSubject(subject.id).map((t) => (
                  <Badge key={t} variant={t === track ? "default" : "secondary"}>
                    {TRACK_LABELS[t]}
                  </Badge>
                ))}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {grades.map(({ grade: g, units }) => (
                <div key={g}>
                  <p className="mb-2 text-sm font-semibold">{g}. sınıf</p>
                  <div className="space-y-3">
                    {units.map((unit) => (
                      <div key={unit.code} className="rounded-md border p-3">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="font-mono text-xs text-muted-foreground">{unit.code}</span>
                          <span className="font-medium">{unit.title}</span>
                          <Badge variant={examVariant(unit.exam)}>{unit.exam}</Badge>
                        </div>
                        {unit.topics.length > 0 ? (
                          <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-muted-foreground">
                            {unit.topics.map((t) => (
                              <li key={t}>{t}</li>
                            ))}
                          </ul>
                        ) : null}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        ))
      )}

      <Card>
        <CardHeader>
          <CardTitle>Resmî kaynaklar</CardTitle>
          <CardDescription>Kopyalanabilir tam adres. Ticari konu listesi değil.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-5">
          {OFFICIAL_SOURCES.map((src) => (
            <div key={src.url} className="space-y-1">
              <CopyableUrl url={src.url} label={src.title} />
              <p className="text-xs text-muted-foreground">{src.note}</p>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
