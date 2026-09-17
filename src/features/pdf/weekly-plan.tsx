import { Document, Page, Text, View, StyleSheet, renderToBuffer } from "@react-pdf/renderer";
import React from "react";
import { calcNet } from "@/lib/utils";

const styles = StyleSheet.create({
  page: { padding: 28, fontSize: 9, fontFamily: "Helvetica" },
  title: { fontSize: 14, fontWeight: 700, marginBottom: 2 },
  sub: { fontSize: 9, color: "#555", marginBottom: 10 },
  sectionTitle: { fontSize: 11, fontWeight: 700, marginTop: 10, marginBottom: 4 },
  tableRow: { flexDirection: "row" },
  th: {
    flex: 1,
    backgroundColor: "#eee",
    padding: 4,
    borderWidth: 0.5,
    borderColor: "#bbb",
    fontWeight: 700,
  },
  td: { flex: 1, padding: 4, borderWidth: 0.5, borderColor: "#ccc" },
  tdSmall: { flex: 0.5, padding: 4, borderWidth: 0.5, borderColor: "#ccc", textAlign: "center" },
  thSmall: {
    flex: 0.5,
    backgroundColor: "#eee",
    padding: 4,
    borderWidth: 0.5,
    borderColor: "#bbb",
    fontWeight: 700,
    textAlign: "center",
  },
  signatureBox: {
    marginTop: 20,
    padding: 10,
    borderWidth: 1,
    borderColor: "#000",
    borderStyle: "solid",
  },
  signatureLine: { marginTop: 20, borderTopWidth: 1, borderColor: "#000", width: "60%" },
  notes: { marginTop: 10, padding: 6, borderWidth: 0.5, borderColor: "#ccc" },
});

type PlanWithIncludes = any;

export async function buildWeeklyPlanPdf(plan: PlanWithIncludes): Promise<Buffer> {
  const doc = <WeeklyPlanDocument plan={plan} />;
  return renderToBuffer(doc);
}

function WeeklyPlanDocument({ plan }: { plan: PlanWithIncludes }) {
  const orgName = plan.student.org?.name ?? "Netkoç";
  const dateFmt = (d: Date) =>
    new Date(d).toLocaleDateString("tr-TR", { day: "2-digit", month: "short" });

  const evalMap = new Map<string, any>();
  for (const de of plan.evaluation?.dailyEvals ?? []) {
    const key = `${new Date(de.dayDate).toISOString().slice(0, 10)}_${de.subjectId}`;
    evalMap.set(key, de);
  }

  const totals = { correct: 0, wrong: 0, blank: 0, minutes: 0 };
  for (const e of plan.evaluation?.dailyEvals ?? []) {
    totals.correct += e.correct;
    totals.wrong += e.wrong;
    totals.blank += e.blank;
    totals.minutes += e.minutes;
  }

  return (
    <Document>
      <Page size="A4" orientation="landscape" style={styles.page}>
        <Text style={styles.title}>{orgName} — Haftalık Program & Değerlendirme</Text>
        <Text style={styles.sub}>
          Öğrenci: {plan.student.fullName} · Alan: {plan.student.track} · Hafta{" "}
          {plan.weekNumber} · {dateFmt(plan.weekStart)} - {dateFmt(plan.weekEnd)}
        </Text>

        <Text style={styles.sectionTitle}>Haftalık Program</Text>
        <View style={styles.tableRow}>
          <View style={styles.thSmall}><Text>Gün</Text></View>
          <View style={styles.thSmall}><Text>Ders</Text></View>
          <View style={styles.th}><Text>Konu</Text></View>
          <View style={styles.thSmall}><Text>Plan Soru</Text></View>
          <View style={styles.thSmall}><Text>Plan Dk</Text></View>
          <View style={styles.thSmall}><Text>D</Text></View>
          <View style={styles.thSmall}><Text>Y</Text></View>
          <View style={styles.thSmall}><Text>B</Text></View>
          <View style={styles.thSmall}><Text>Net</Text></View>
          <View style={styles.thSmall}><Text>Giren</Text></View>
        </View>

        {plan.dailyPlans.map((dp: any) => {
          const key = `${new Date(dp.dayDate).toISOString().slice(0, 10)}_${dp.subjectId}`;
          const ev = evalMap.get(key);
          return (
            <View key={dp.id} style={styles.tableRow} wrap={false}>
              <View style={styles.tdSmall}>
                <Text>{dateFmt(dp.dayDate)}</Text>
              </View>
              <View style={styles.tdSmall}>
                <Text>{dp.subject.code}</Text>
              </View>
              <View style={styles.td}>
                <Text>{dp.topicText ?? ""}</Text>
              </View>
              <View style={styles.tdSmall}>
                <Text>{dp.plannedQuestions}</Text>
              </View>
              <View style={styles.tdSmall}>
                <Text>{dp.plannedMinutes}</Text>
              </View>
              <View style={styles.tdSmall}>
                <Text>{ev?.correct ?? ""}</Text>
              </View>
              <View style={styles.tdSmall}>
                <Text>{ev?.wrong ?? ""}</Text>
              </View>
              <View style={styles.tdSmall}>
                <Text>{ev?.blank ?? ""}</Text>
              </View>
              <View style={styles.tdSmall}>
                <Text>{ev ? calcNet(ev.correct, ev.wrong) : ""}</Text>
              </View>
              <View style={styles.tdSmall}>
                <Text>{ev?.enteredBy === "STUDENT" ? "Ö" : ev?.enteredBy === "TEACHER" ? "H" : ""}</Text>
              </View>
            </View>
          );
        })}

        <View style={[styles.tableRow, { backgroundColor: "#f4f4f4" }]}>
          <View style={[styles.tdSmall, { flex: 3 }]}>
            <Text>Haftalık Toplam</Text>
          </View>
          <View style={styles.tdSmall}><Text>—</Text></View>
          <View style={styles.tdSmall}><Text>{totals.minutes}</Text></View>
          <View style={styles.tdSmall}><Text>{totals.correct}</Text></View>
          <View style={styles.tdSmall}><Text>{totals.wrong}</Text></View>
          <View style={styles.tdSmall}><Text>{totals.blank}</Text></View>
          <View style={styles.tdSmall}>
            <Text>{calcNet(totals.correct, totals.wrong)}</Text>
          </View>
          <View style={styles.tdSmall}><Text></Text></View>
        </View>

        {plan.priorities ? (
          <View style={styles.notes}>
            <Text style={{ fontWeight: 700 }}>Öncelikler:</Text>
            <Text>{plan.priorities}</Text>
          </View>
        ) : null}
        {plan.notes ? (
          <View style={styles.notes}>
            <Text style={{ fontWeight: 700 }}>Notlar:</Text>
            <Text>{plan.notes}</Text>
          </View>
        ) : null}

        <View style={styles.signatureBox}>
          <Text style={{ fontWeight: 700, marginBottom: 4 }}>Veli Onayı</Text>
          <Text>Bu haftanın programını ve değerlendirme sonuçlarını inceledim.</Text>
          <Text style={{ marginTop: 20 }}>Veli Ad Soyad: ______________________________</Text>
          <Text style={{ marginTop: 14 }}>İmza: ______________________________</Text>
          <Text style={{ marginTop: 14 }}>Tarih: ______________________________</Text>
        </View>
      </Page>
    </Document>
  );
}
