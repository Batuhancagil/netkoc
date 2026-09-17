import type { ExamTrack } from "@prisma/client";

// Academic year 2025-2026 weekly schedule derived directly from the source Excel
// ("Yol haritam" sheet). Each entry maps subject code -> topic text for that week.
// Subjects referenced must exist in SEED_SUBJECTS.

export type SeedRoadmapWeek = {
  monthIndex: number; // 0 = September, 8 = May
  weekIndex: number;
  label: string;
  startDate: string; // ISO
  endDate: string;
  cells: Record<string, string>; // subjectCode -> topic
};

export type SeedRoadmap = {
  track: ExamTrack;
  name: string;
  year: number;
  scope?: "YKS" | "GRADE_9" | "GRADE_10" | "GRADE_11" | "GRADE_12";
  weeks: SeedRoadmapWeek[];
};

const SAYISAL_WEEKS: SeedRoadmapWeek[] = [
  // EYLUL
  {
    monthIndex: 0,
    weekIndex: 0,
    label: "1-7 Eylül",
    startDate: "2025-09-01",
    endDate: "2025-09-07",
    cells: {
      MAT1: "Temel kav. Tekçift. Ardışık. Faktöriyel",
      PROB: "Oran orantı",
      AYT_MAT: "Fonksiyonlar",
      GEO: "Doğruda ve Üçgende Açılar",
      FIZ: "Fizik Bilimine Giriş",
      KIM: "Kimya Bilimi",
      BIY: "Yaşam bilimi biyoloji",
      TUR: "Sözcükte Anlam",
    },
  },
  {
    monthIndex: 0,
    weekIndex: 1,
    label: "8-14 Eylül",
    startDate: "2025-09-08",
    endDate: "2025-09-14",
    cells: {
      MAT1: "Sayı bas. Asal say. Bölme. Ebob ekok. Rasyonel",
      PROB: "Sayı kesir problemleri",
      AYT_MAT: "Fonksiyonlar",
      GEO: "Doğruda ve Üçgende Açılar",
      FIZ: "Özkütle - dayanıklılık",
      KIM: "Atomun Yapısı",
      BIY: "Yaşam bilimi biyoloji",
      TUR: "Sözcükte Anlam",
    },
  },
  {
    monthIndex: 0,
    weekIndex: 2,
    label: "15-21 Eylül",
    startDate: "2025-09-15",
    endDate: "2025-09-21",
    cells: {
      MAT1: "1. dereceden denklem eşitsizlik",
      PROB: "Yaş problemleri",
      AYT_MAT: "Analitik Geometri",
      GEO: "Dik ve Özel Üçgenler",
      FIZ: "Basınç - Kaldırma Kuvveti",
      KIM: "Periyodik Tablo",
      BIY: "Hücre - madde geçişi",
      TUR: "Cümlede Anlam",
    },
  },
  {
    monthIndex: 0,
    weekIndex: 3,
    label: "22-28 Eylül",
    startDate: "2025-09-22",
    endDate: "2025-09-28",
    cells: {
      MAT1: "Mutlak değer",
      PROB: "İşçi problemleri",
      AYT_MAT: "Analitik Geometri",
      GEO: "Dik ve Özel Üçgenler",
      FIZ: "Isı Sıcaklık - Genleşme",
      KIM: "Kimyasal Türler Arası Etkileşimler",
      BIY: "Hücre - madde geçişi",
      TUR: "Cümlede Anlam",
    },
  },
  // EKIM
  {
    monthIndex: 1,
    weekIndex: 0,
    label: "29 Eylül - 5 Ekim",
    startDate: "2025-09-29",
    endDate: "2025-10-05",
    cells: {
      MAT1: "Üslü sayılar",
      PROB: "Hız hareket problemleri",
      AYT_MAT: "2. Dereceden Denklemler",
      GEO: "İkizkenar Üçgen",
      FIZ: "Hareket - Kuvvet",
      KIM: "Kimyasal Türler Arası Etkileşimler",
      BIY: "Hücre Organelleri",
      TUR: "Anlatım Biçimleri",
    },
  },
  {
    monthIndex: 1,
    weekIndex: 1,
    label: "6-12 Ekim",
    startDate: "2025-10-06",
    endDate: "2025-10-12",
    cells: {
      MAT1: "Köklü sayılar",
      PROB: "Yüzde problemleri",
      AYT_MAT: "2. Dereceden Denklemler",
      GEO: "Eşkenar Üçgen",
      FIZ: "İş Güç Enerji",
      KIM: "Maddenin Halleri",
      BIY: "Hücre Organelleri",
      TUR: "Paragrafın yapısı",
    },
  },
  {
    monthIndex: 1,
    weekIndex: 2,
    label: "13-19 Ekim",
    startDate: "2025-10-13",
    endDate: "2025-10-19",
    cells: {
      MAT1: "Çarpanlara ayırma",
      PROB: "Karışım problemleri",
      AYT_MAT: "Parabol",
      GEO: "Üçgende Açıortay",
      FIZ: "Elektrik - Alan",
      KIM: "Doğa ve Kimya",
      BIY: "Canlıların Sınıflandırılması",
      TUR: "Paragrafın yapısı",
    },
  },
  {
    monthIndex: 1,
    weekIndex: 3,
    label: "20-26 Ekim",
    startDate: "2025-10-20",
    endDate: "2025-10-26",
    cells: {
      MAT1: "Kümeler",
      PROB: "Faiz problemleri",
      AYT_MAT: "Parabol",
      GEO: "Üçgende Kenarortay",
      FIZ: "Ohm - Güç - Parlaklık",
      KIM: "Kimyanın Temel Kanunları",
      BIY: "Hücre Bölünmesi ve Üreme",
      TUR: "Paragraf - Konu Ana Düşünce",
    },
  },
  {
    monthIndex: 1,
    weekIndex: 4,
    label: "27 Ekim - 2 Kasım",
    startDate: "2025-10-27",
    endDate: "2025-11-02",
    cells: {
      MAT1: "Fonksiyonlar",
      PROB: "Sayısal mantık problemleri",
      AYT_MAT: "Polinom",
      GEO: "Üçgende Eşlik ve Benzerlik",
      FIZ: "Manyetizma",
      KIM: "Mol kavramı",
      BIY: "Hücre Bölünmesi ve Üreme",
      TUR: "Paragraf Yardımcı Düşünce",
    },
  },
  // KASIM
  {
    monthIndex: 2,
    weekIndex: 0,
    label: "3-9 Kasım",
    startDate: "2025-11-03",
    endDate: "2025-11-09",
    cells: {
      MAT1: "Fonksiyonlar",
      PROB: "Problem denemeler",
      AYT_MAT: "Polinom",
      GEO: "Üçgende Eşlik ve Benzerlik",
      FIZ: "Optik",
      KIM: "Kimyasal Tepkime Hesaplamalar",
      BIY: "Kalıtım",
      TUR: "Paragraf Yardımcı Düşünce",
    },
  },
  {
    monthIndex: 2,
    weekIndex: 1,
    label: "10-16 Kasım",
    startDate: "2025-11-10",
    endDate: "2025-11-16",
    cells: {
      MAT1: "Sayma - Permütasyon - Kombinasyon",
      PROB: "Problem denemeler",
      AYT_MAT: "Eşitsizlik",
      GEO: "Üçgende Alan",
      FIZ: "Optik",
      KIM: "Karışımlar",
      BIY: "Kalıtım",
      TUR: "Ses Bilgisi",
    },
  },
  {
    monthIndex: 2,
    weekIndex: 2,
    label: "17-23 Kasım",
    startDate: "2025-11-17",
    endDate: "2025-11-23",
    cells: {
      MAT1: "Binom Olasılık",
      PROB: "Problem denemeler",
      AYT_MAT: "Genel Tekrar",
      GEO: "Üçgende Alan",
      FIZ: "Dalgalar",
      KIM: "Asit Baz Tuz",
      BIY: "Ekosistem Ekoloji",
      TUR: "Ses Bilgisi",
    },
  },
  {
    monthIndex: 2,
    weekIndex: 3,
    label: "24-30 Kasım",
    startDate: "2025-11-24",
    endDate: "2025-11-30",
    cells: {
      MAT1: "TYT Mat branş deneme",
      PROB: "Problem denemeler",
      AYT_MAT: "Logaritma",
      GEO: "Üçgende Açı-Kenar Bağıntı",
      FIZ: "Dalgalar",
      KIM: "Kimya Her Yerde",
      BIY: "TYT Biyoloji branş",
      TUR: "Yazım Kuralları",
    },
  },
  // ARALIK
  {
    monthIndex: 3,
    weekIndex: 0,
    label: "1-7 Aralık",
    startDate: "2025-12-01",
    endDate: "2025-12-07",
    cells: {
      MAT1: "TYT Mat branş",
      AYT_MAT: "Logaritma",
      GEO: "Çokgenler",
      FIZ: "TYT Fizik branş",
      KIM: "TYT Kimya branş",
      BIY: "TYT Biyoloji branş",
      TUR: "Yazım Kuralları",
    },
  },
  {
    monthIndex: 3,
    weekIndex: 1,
    label: "8-14 Aralık",
    startDate: "2025-12-08",
    endDate: "2025-12-14",
    cells: {
      MAT1: "TYT Mat branş",
      AYT_MAT: "Diziler",
      GEO: "Dörtgenler - Deltoid",
      FIZ: "Vektörler - Kuvvet",
      KIM: "Modern Atom Teorisi",
      BIY: "Sinir Sistemi",
      TUR: "Noktalama İşaretleri",
    },
  },
  {
    monthIndex: 3,
    weekIndex: 2,
    label: "15-21 Aralık",
    startDate: "2025-12-15",
    endDate: "2025-12-21",
    cells: {
      MAT1: "TYT Mat branş",
      AYT_MAT: "Genel Tekrar",
      GEO: "Paralelkenar",
      FIZ: "Tork ve Denge",
      KIM: "Gazlar",
      BIY: "Endokrin",
      TUR: "Sözcükte Yapı",
    },
  },
  {
    monthIndex: 3,
    weekIndex: 3,
    label: "22-28 Aralık",
    startDate: "2025-12-22",
    endDate: "2025-12-28",
    cells: {
      MAT1: "TYT Mat branş",
      AYT_MAT: "Trigonometri 1",
      GEO: "Eşkenar Dörtgen",
      FIZ: "Ağırlık ve Kütle Merkezi",
      KIM: "Gazlar",
      BIY: "Duyu Organları",
      TUR: "Sözcük Türleri",
    },
  },
  // OCAK
  {
    monthIndex: 4,
    weekIndex: 0,
    label: "29 Aralık - 4 Ocak",
    startDate: "2025-12-29",
    endDate: "2026-01-04",
    cells: {
      MAT1: "TYT Mat branş",
      AYT_MAT: "Trigonometri 1",
      GEO: "Dikdörtgen",
      FIZ: "Basit Makinalar",
      KIM: "Çözeltiler",
      BIY: "Destek ve Hareket",
      TUR: "Sözcük Türleri",
    },
  },
  {
    monthIndex: 4,
    weekIndex: 1,
    label: "5-11 Ocak",
    startDate: "2026-01-05",
    endDate: "2026-01-11",
    cells: {
      MAT1: "TYT Mat branş",
      AYT_MAT: "Trigonometri 2",
      GEO: "Kare",
      FIZ: "Doğrusal Hareket",
      KIM: "Çözeltiler",
      BIY: "Sindirim Sistemi",
      TUR: "Edat - Bağlaç - Ünlem",
    },
  },
  {
    monthIndex: 4,
    weekIndex: 2,
    label: "12-18 Ocak",
    startDate: "2026-01-12",
    endDate: "2026-01-18",
    cells: {
      MAT1: "TYT Mat branş",
      AYT_MAT: "Trigonometri 2",
      GEO: "Yamuk",
      FIZ: "Newton Hareket Yasaları",
      KIM: "Kimya ve Enerji (Entalpi)",
      BIY: "Dolaşım Sistemi",
      TUR: "Eylemler",
    },
  },
  {
    monthIndex: 4,
    weekIndex: 3,
    label: "19-25 Ocak",
    startDate: "2026-01-19",
    endDate: "2026-01-25",
    cells: {
      MAT1: "TYT Mat branş",
      AYT_MAT: "Genel Tekrar",
      GEO: "Çemberde Açılar",
      FIZ: "İş Güç Enerji",
      KIM: "Kimyasal Tepkimelerde Hız",
      BIY: "Solunum Sistemi",
      TUR: "Fiilde Çatı",
    },
  },
  {
    monthIndex: 4,
    weekIndex: 4,
    label: "26 Ocak - 1 Şubat",
    startDate: "2026-01-26",
    endDate: "2026-02-01",
    cells: {
      MAT1: "TYT Mat branş",
      AYT_MAT: "Limit",
      GEO: "Çemberde Uzunluk",
      FIZ: "Yeryüzünde Hareket",
      KIM: "Kimyasal Tepkimelerde Denge",
      BIY: "Üriner Sistem",
      TUR: "Ek Fiil",
    },
  },
  // SUBAT
  {
    monthIndex: 5,
    weekIndex: 0,
    label: "2-8 Şubat",
    startDate: "2026-02-02",
    endDate: "2026-02-08",
    cells: {
      MAT1: "TYT Mat branş",
      AYT_MAT: "Limit",
      GEO: "Çemberde Uzunluk",
      FIZ: "İtme Momentum",
      KIM: "Asit Baz Dengesi",
      BIY: "Üreme Sistemi",
      TUR: "Cümlenin Öğeleri",
    },
  },
  {
    monthIndex: 5,
    weekIndex: 1,
    label: "9-15 Şubat",
    startDate: "2026-02-09",
    endDate: "2026-02-15",
    cells: {
      MAT1: "TYT Mat branş",
      AYT_MAT: "Limit",
      GEO: "Daire",
      FIZ: "Çembersel Hareket",
      KIM: "Çözünürlük Dengesi",
      BIY: "Sistemler Genel Tekrar",
      TUR: "Cümle Türleri",
    },
  },
  {
    monthIndex: 5,
    weekIndex: 2,
    label: "16-22 Şubat",
    startDate: "2026-02-16",
    endDate: "2026-02-22",
    cells: {
      MAT1: "TYT Mat branş",
      AYT_MAT: "Türev 1",
      GEO: "Noktanın Analitiği",
      FIZ: "Çembersel Hareket",
      KIM: "Çözünürlük Dengesi",
      BIY: "Genden Proteine",
      TUR: "Cümle Türleri",
    },
  },
  {
    monthIndex: 5,
    weekIndex: 3,
    label: "23 Şubat - 1 Mart",
    startDate: "2026-02-23",
    endDate: "2026-03-01",
    cells: {
      MAT1: "TYT Mat branş",
      AYT_MAT: "Türev 1",
      GEO: "Doğrunun Analitiği",
      FIZ: "Açısal Momentum - Kepler",
      KIM: "Kimya ve Elektrik",
      BIY: "Genden Proteine",
      TUR: "Anlatım Bozuklukları",
    },
  },
  // MART
  {
    monthIndex: 6,
    weekIndex: 0,
    label: "2-8 Mart",
    startDate: "2026-03-02",
    endDate: "2026-03-08",
    cells: {
      MAT1: "TYT Mat branş",
      AYT_MAT: "Türev 1",
      GEO: "Doğrunun Analitiği",
      FIZ: "Basit Harmonik Hareket",
      KIM: "Kimya ve Elektrik",
      BIY: "Genden Proteine",
      TUR: "Türkçe branş",
    },
  },
  {
    monthIndex: 6,
    weekIndex: 1,
    label: "9-15 Mart",
    startDate: "2026-03-09",
    endDate: "2026-03-15",
    cells: {
      MAT1: "TYT Mat branş",
      AYT_MAT: "Türev 2",
      GEO: "Dönüşümler",
      FIZ: "Elektrik Kuvvet - Alan - Potansiyel",
      KIM: "Karbon Kimyası",
      BIY: "Canlılarda Enerji Dönüşümleri",
      TUR: "Türkçe branş",
    },
  },
  {
    monthIndex: 6,
    weekIndex: 2,
    label: "16-22 Mart",
    startDate: "2026-03-16",
    endDate: "2026-03-22",
    cells: {
      MAT1: "TYT Mat branş",
      AYT_MAT: "Türev 2",
      GEO: "Çemberin Analitiği",
      FIZ: "Yüklü Parçacıklar - Sığaçlar",
      KIM: "Karbon Kimyası",
      BIY: "Canlılarda Enerji Dönüşümleri",
      TUR: "Türkçe branş",
    },
  },
  {
    monthIndex: 6,
    weekIndex: 3,
    label: "23-29 Mart",
    startDate: "2026-03-23",
    endDate: "2026-03-29",
    cells: {
      MAT1: "TYT Mat branş",
      AYT_MAT: "İntegral 1",
      GEO: "Analitik Genel Tekrar",
      FIZ: "Manyetizma",
      KIM: "Hidrokarbonlar (Alkan)",
      BIY: "Bitki Biyolojisi",
      TUR: "Türkçe branş",
    },
  },
  // NISAN
  {
    monthIndex: 7,
    weekIndex: 0,
    label: "30 Mart - 5 Nisan",
    startDate: "2026-03-30",
    endDate: "2026-04-05",
    cells: {
      MAT1: "Mat branş ales",
      AYT_MAT: "İntegral 1",
      GEO: "Prizmalar",
      FIZ: "İndüksiyon - Alternatif Akım",
      KIM: "Hidrokarbonlar (Alken)",
      BIY: "Bitki Biyolojisi",
      TUR: "Türkçe branş ales",
    },
  },
  {
    monthIndex: 7,
    weekIndex: 1,
    label: "6-12 Nisan",
    startDate: "2026-04-06",
    endDate: "2026-04-12",
    cells: {
      MAT1: "Mat branş ales",
      AYT_MAT: "İntegral 2",
      GEO: "Piramit",
      FIZ: "Dalga Mekaniği",
      KIM: "Hidrokarbonlar (Alkin)",
      BIY: "Bitki Biyolojisi",
      TUR: "Türkçe branş ales",
    },
  },
  {
    monthIndex: 7,
    weekIndex: 2,
    label: "13-19 Nisan",
    startDate: "2026-04-13",
    endDate: "2026-04-19",
    cells: {
      MAT1: "Mat branş ales",
      AYT_MAT: "Limit Türev İntegral Tekrar",
      GEO: "Küre",
      FIZ: "Atom Fiziği - Radyoaktivite",
      KIM: "Fonksiyonel Gruplar (Alkol - Eter)",
      BIY: "Komünite ve Popülasyon",
      TUR: "Türkçe branş ales",
    },
  },
  {
    monthIndex: 7,
    weekIndex: 3,
    label: "20-26 Nisan",
    startDate: "2026-04-20",
    endDate: "2026-04-26",
    cells: {
      MAT1: "Mat branş ales",
      AYT_MAT: "Kümeler",
      GEO: "Dönel Cisimler",
      FIZ: "Modern Fizik",
      KIM: "Fonksiyonel Gruplar (Aldehit - Ester)",
      BIY: "Biyoloji AYT Genel Tekrar",
      TUR: "Türkçe branş ales",
    },
  },
  {
    monthIndex: 7,
    weekIndex: 4,
    label: "27 Nisan - 3 Mayıs",
    startDate: "2026-04-27",
    endDate: "2026-05-03",
    cells: {
      MAT1: "Mat branş ales",
      AYT_MAT: "Sayma - Olasılık",
      GEO: "Geo branş denemeler",
      FIZ: "Modern Fiziğin Uygulamaları",
      KIM: "Enerji Kaynakları",
      BIY: "Biyoloji AYT Branş",
      TUR: "Türkçe branş ales",
    },
  },
  // MAYIS
  {
    monthIndex: 8,
    weekIndex: 0,
    label: "4-10 Mayıs",
    startDate: "2026-05-04",
    endDate: "2026-05-10",
    cells: {
      MAT1: "TYT deneme",
      AYT_MAT: "Sayma - Olasılık",
      FIZ: "Fizik AYT Branş",
      KIM: "Kimya AYT Branş",
      BIY: "Biyoloji AYT Branş",
      TUR: "Türkçe branş deneme",
    },
  },
  {
    monthIndex: 8,
    weekIndex: 1,
    label: "11-17 Mayıs",
    startDate: "2026-05-11",
    endDate: "2026-05-17",
    cells: {
      MAT1: "TYT deneme",
      AYT_MAT: "AYT Mat Branş Deneme",
      FIZ: "Fizik AYT Branş",
      KIM: "Kimya AYT Branş",
      BIY: "Biyoloji AYT Branş",
      TUR: "TYT deneme",
    },
  },
  {
    monthIndex: 8,
    weekIndex: 2,
    label: "18-24 Mayıs",
    startDate: "2026-05-18",
    endDate: "2026-05-24",
    cells: {
      MAT1: "TYT deneme",
      AYT_MAT: "AYT Mat Branş Deneme",
      FIZ: "Fizik AYT Branş",
      KIM: "Kimya AYT Branş",
      BIY: "Biyoloji AYT Branş",
      TUR: "TYT deneme",
    },
  },
  {
    monthIndex: 8,
    weekIndex: 3,
    label: "25-31 Mayıs",
    startDate: "2026-05-25",
    endDate: "2026-05-31",
    cells: {
      MAT1: "TYT deneme",
      AYT_MAT: "AYT Mat Branş Deneme",
      FIZ: "AYT Fen branş",
      KIM: "AYT Fen branş",
      BIY: "AYT Fen branş",
      TUR: "TYT deneme",
    },
  },
];

// Minimal EA/SOZEL/DIL templates: inherit TYT skeleton from Sayısal but map
// track-specific subjects. Organizations can customise.
function buildWeekForTrack(
  sayWeek: SeedRoadmapWeek,
  extraCells: Record<string, string>,
  dropSubjects: string[]
): SeedRoadmapWeek {
  const cells: Record<string, string> = {};
  for (const [k, v] of Object.entries(sayWeek.cells)) {
    if (!dropSubjects.includes(k)) cells[k] = v;
  }
  return { ...sayWeek, cells: { ...cells, ...extraCells } };
}

const EA_WEEKS: SeedRoadmapWeek[] = SAYISAL_WEEKS.map((w) =>
  buildWeekForTrack(
    w,
    {
      AYT_EDB: "Edebiyat tekrar / yeni konu",
      AYT_TAR: "Tarih tekrar / yeni konu",
      AYT_COG: "Coğrafya tekrar / yeni konu",
    },
    ["FIZ", "KIM", "BIY", "AYT_MAT"]
  )
);

const SOZEL_WEEKS: SeedRoadmapWeek[] = SAYISAL_WEEKS.map((w) =>
  buildWeekForTrack(
    w,
    {
      AYT_EDB: "Edebiyat tekrar / yeni konu",
      AYT_TAR: "Tarih tekrar / yeni konu",
      AYT_COG: "Coğrafya tekrar / yeni konu",
      AYT_FEL: "Felsefe Grubu tekrar / yeni konu",
    },
    ["FIZ", "KIM", "BIY", "MAT1", "AYT_MAT", "GEO"]
  )
);

const DIL_WEEKS: SeedRoadmapWeek[] = SAYISAL_WEEKS.map((w) =>
  buildWeekForTrack(
    w,
    { YDT_ING: "YDT İngilizce çalışma", AYT_EDB: "Edebiyat (opsiyonel)" },
    ["FIZ", "KIM", "BIY", "AYT_MAT", "GEO"]
  )
);

function shiftIsoYear(iso: string, years: number) {
  const [y, m, d] = iso.split("-").map(Number);
  const dt = new Date(Date.UTC(y + years, (m ?? 1) - 1, d ?? 1));
  return dt.toISOString().slice(0, 10);
}

export function shiftWeeks(weeks: SeedRoadmapWeek[], years: number): SeedRoadmapWeek[] {
  return weeks.map((w) => ({
    ...w,
    startDate: shiftIsoYear(w.startDate, years),
    endDate: shiftIsoYear(w.endDate, years),
  }));
}

export const ROADMAP_CALENDAR: SeedRoadmapWeek[] = SAYISAL_WEEKS.map((w) => ({
  monthIndex: w.monthIndex,
  weekIndex: w.weekIndex,
  label: w.label,
  startDate: w.startDate,
  endDate: w.endDate,
  cells: {},
}));

export const SEED_ROADMAPS: SeedRoadmap[] = [
  { track: "SAYISAL", name: "YKS 2025-2026 Sayısal", year: 2025, scope: "YKS", weeks: SAYISAL_WEEKS },
  { track: "EA", name: "YKS 2025-2026 Eşit Ağırlık", year: 2025, scope: "YKS", weeks: EA_WEEKS },
  { track: "SOZEL", name: "YKS 2025-2026 Sözel", year: 2025, scope: "YKS", weeks: SOZEL_WEEKS },
  { track: "DIL", name: "YKS 2025-2026 Dil", year: 2025, scope: "YKS", weeks: DIL_WEEKS },
  { track: "SAYISAL", name: "YKS 2026-2027 Sayısal", year: 2026, scope: "YKS", weeks: shiftWeeks(SAYISAL_WEEKS, 1) },
  { track: "EA", name: "YKS 2026-2027 Eşit Ağırlık", year: 2026, scope: "YKS", weeks: shiftWeeks(EA_WEEKS, 1) },
  { track: "SOZEL", name: "YKS 2026-2027 Sözel", year: 2026, scope: "YKS", weeks: shiftWeeks(SOZEL_WEEKS, 1) },
  { track: "DIL", name: "YKS 2026-2027 Dil", year: 2026, scope: "YKS", weeks: shiftWeeks(DIL_WEEKS, 1) },
];
