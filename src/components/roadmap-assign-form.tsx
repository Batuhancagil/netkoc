"use client";

import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { SCOPE_LABELS, SCOPE_ORDER, TRACK_LABELS } from "@/lib/constants";
import { assignRoadmapFromTemplate, createBlankRoadmap } from "@/app/dashboard/roadmap/actions";

export type AssignableTemplate = {
  id: string;
  name: string;
  track: string;
  scope: string;
  isSystem: boolean;
  weekCount: number;
};

export function RoadmapAssignForm({
  studentId,
  studentName,
  defaultTrack,
  suggestedScope,
  studentGrade,
  templates,
}: {
  studentId: string;
  studentName: string;
  defaultTrack: string;
  suggestedScope: string;
  studentGrade?: number | null;
  templates: AssignableTemplate[];
}) {
  const [track, setTrack] = useState(defaultTrack);
  const [scope, setScope] = useState("YKS");

  const filtered = useMemo(
    () => templates.filter((t) => t.track === track && t.scope === scope),
    [templates, track, scope]
  );

  const defaultTemplateId = filtered.find((t) => t.isSystem && t.name.includes("2026"))?.id ?? filtered[0]?.id ?? "";

  return (
    <div className="space-y-6">
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="space-y-1">
          <Label htmlFor="assign-track">Alan</Label>
          <Select id="assign-track" value={track} onChange={(e) => setTrack(e.target.value)}>
            {Object.entries(TRACK_LABELS).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </Select>
        </div>
        <div className="space-y-1">
          <Label htmlFor="assign-scope">Şablon türü</Label>
          <Select id="assign-scope" value={scope} onChange={(e) => setScope(e.target.value)}>
            {SCOPE_ORDER.map((value) => (
              <option key={value} value={value}>
                {SCOPE_LABELS[value]}
              </option>
            ))}
          </Select>
          {suggestedScope !== scope ? (
            <button
              type="button"
              className="text-xs text-primary underline"
              onClick={() => setScope(suggestedScope)}
            >
              Önerilen: {SCOPE_LABELS[suggestedScope]}
            </button>
          ) : null}
        </div>
      </div>
      <p className="text-sm text-muted-foreground">
        Üniversiteye hazırlıyorsan <strong>YKS</strong> şablonunu seç. Öğrenci hâlâ 9–12. sınıftaysa o
        sınıfın şablonunu seç. Alan ve tür kilitli değil; öğrenciye göre sen karar ver.
        {studentGrade
          ? ` Kayıtta ${studentGrade}. sınıf görünüyor; istersen ${SCOPE_LABELS[suggestedScope] ?? `${studentGrade}. sınıf`} şablonuna geç.`
          : suggestedScope !== "YKS"
            ? ` Mezuniyet yılına göre ${SCOPE_LABELS[suggestedScope]} de uygun olabilir.`
            : ""}
      </p>

      <form action={assignRoadmapFromTemplate} className="flex flex-wrap items-end gap-3">
        <input type="hidden" name="studentId" value={studentId} />
        <input type="hidden" name="track" value={track} />
        <div className="min-w-[280px] flex-1 space-y-1">
          <Label htmlFor="templateId">Hazır şablon</Label>
          <Select id="templateId" name="templateId" required={filtered.length > 0} disabled={filtered.length === 0} defaultValue={defaultTemplateId} key={`${track}-${scope}-${defaultTemplateId}`}>
            {filtered.length === 0 ? (
              <option value="">Bu alan ve tür için şablon yok</option>
            ) : (
              filtered.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name} {t.isSystem ? "(Sistem)" : "(Kendi)"} — {t.weekCount} hafta
                </option>
              ))
            )}
          </Select>
        </div>
        <Button type="submit" disabled={filtered.length === 0}>
          Şablonu klonla ve ata
        </Button>
      </form>

      <form action={createBlankRoadmap} className="flex flex-wrap items-end gap-3 border-t pt-4">
        <input type="hidden" name="studentId" value={studentId} />
        <input type="hidden" name="track" value={track} />
        <input type="hidden" name="scope" value={scope} />
        <div className="min-w-[280px] flex-1 space-y-1">
          <Label htmlFor="blank-name">Boş harita adı</Label>
          <input
            id="blank-name"
            name="name"
            defaultValue={`${studentName} — ${SCOPE_LABELS[scope] ?? scope}`}
            key={`${studentName}-${scope}`}
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
          />
        </div>
        <Button type="submit">Boş harita oluştur ve düzenle</Button>
      </form>
    </div>
  );
}
