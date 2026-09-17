"use client";

import { useMemo, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { CopyableUrl } from "@/components/copyable-url";
import {
  CURRICULUM_YEAR,
  OFFICIAL_SOURCES,
  PROGRAMS,
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

export function CurriculumBrowser() {
  const [program, setProgram] = useState<ProgramKind>("yks2018");
  const [grade, setGrade] = useState<Grade | "all">("all");
  const [subjectId, setSubjectId] = useState("all");
  const [exam, setExam] = useState<ExamHint | "all">("all");
  const [q, setQ] = useState("");

  const pack = PROGRAMS[program];

  const filtered = useMemo(() => {
    const needle = q.trim().toLocaleLowerCase("tr");
    return pack.subjects
      .filter((s) => subjectId === "all" || s.id === subjectId)
      .map((s) => {
        const grades = GRADES.filter((g) => grade === "all" || g === grade)
          .map((g) => {
            const units = s.grades[g].filter((u) => {
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
  }, [pack, grade, subjectId, exam, q]);

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
            {CURRICULUM_YEAR} eğitim yılı. Ticari “2027 konu listesi” siteleri resmî değildir.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 text-sm leading-relaxed">
          <p>
            İki ayrı liste var. <strong>YKS kapsamı</strong> TTKB’nin 26 Kasım 2025’te yayımladığı 2026
            YKS PDF’sidir (2018 programı). <strong>2027 YKS için ayrı bir TTKB belgesi henüz yok.</strong>{" "}
            Bu yılki 12. sınıflar okulda da 2018 programını okur; sınav dayanakları budur.
          </p>
          <p>
            <strong>Okulda bu yıl görülen</strong> ise OGM’nin 1 Eylül 2026 duyurusuna göre hazırlık,
            9, 10 ve 11’de Maarif Modeli; 12’de önceki programdır. 9–11 matematik, fizik, kimya ve
            biyoloji temaları resmî program PDF’lerinden alınmıştır.
          </p>
        </CardContent>
      </Card>

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
            {pack.subjects.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </Select>
        </div>
        <div>
          <Label>Sınav</Label>
          <Select value={exam} onChange={(e) => setExam(e.target.value as ExamHint | "all")}>
            <option value="all">TYT + AYT</option>
            <option value="TYT">TYT</option>
            <option value="AYT">AYT</option>
          </Select>
        </div>
        <div>
          <Label>Ara</Label>
          <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Türev, fotosentez, Tanzimat…" />
        </div>
      </div>

      <p className="text-sm text-muted-foreground">
        {unitCount} ünite / tema. Boş gelen ders-sınıf kombinasyonu o sınıfta o dersin programda
        olmadığını gösterir (ör. felsefe 9, inkılap 9–11).
      </p>

      {filtered.length === 0 ? (
        <Card>
          <CardContent className="pt-6 text-sm text-muted-foreground">
            Bu süzgeçte ünite yok. Sınıfı veya aramayı genişlet.
          </CardContent>
        </Card>
      ) : (
        filtered.map(({ subject, grades }) => (
          <Card key={subject.id}>
            <CardHeader>
              <CardTitle className="text-lg">{subject.name}</CardTitle>
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
