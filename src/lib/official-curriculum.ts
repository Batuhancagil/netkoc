export type Grade = 9 | 10 | 11 | 12;
export type ExamHint = "TYT" | "AYT" | "HER İKİSİ";
export type ProgramKind = "yks2018" | "school2026";

export type CurriculumUnit = {
  code: string;
  title: string;
  topics: string[];
  exam: ExamHint;
};

export type CurriculumSubject = {
  id: string;
  name: string;
  group: "sayısal" | "sözel" | "ortak";
  grades: Record<Grade, CurriculumUnit[]>;
};

export type SourceLink = {
  title: string;
  url: string;
  note: string;
};

export const CURRICULUM_YEAR = "2026-2027";

export const OFFICIAL_SOURCES: SourceLink[] = [
  {
    title: "TTKB duyurusu — 2026 YKS konu ve kazanımlar",
    url: "https://ttkb.meb.gov.tr/www/osym-tarafindan-2026-yilinda-gerceklestirilecek-quotyuksekogretim-kurumlari-sinavi-yksquotna-esas-derslere-ait-konu-ve-kazanimlar/icerik/831",
    note: "26 Kasım 2025. 2027 YKS için ayrı resmî belge henüz yok.",
  },
  {
    title: "TTKB 2026 YKS PDF (TYT / AYT / YDT kazanımları)",
    url: "https://ttkb.meb.gov.tr/meb_iys_dosyalar/2025_11/26164023_2026_yks.pdf",
    note: "2018 lise programının sınıf–ünite–kazanım metni. YKS 2027 12. sınıfların resmî sınav dayanağı bu belgedir.",
  },
  {
    title: "OGM — 2026-2027 Maarif taslak çerçeve yıllık planlar",
    url: "https://ogm.meb.gov.tr/www/2026-2027-egitim-ogretim-yili-turkiye-yuzyili-maarif-modeli-taslak-cerceve-planlar-yayimlandi/icerik/2633",
    note: "1 Eylül 2026. Hazırlık + 9 + 10 + 11 Maarif; 12. sınıf önceki program.",
  },
  {
    title: "MEB öğretim programları (Maarif + 2018)",
    url: "https://mufredat.meb.gov.tr/programlar.aspx",
    note: "Ders PDF’leri: matematik, fizik, kimya, biyoloji ve diğerleri.",
  },
  {
    title: "Maarif matematik programı PDF",
    url: "https://mufredat.meb.gov.tr/Dosyalar/202582695225533-matematik.pdf",
    note: "9–12 tema ve öğrenme çıktıları.",
  },
  {
    title: "Maarif fizik programı PDF",
    url: "https://mufredat.meb.gov.tr/Dosyalar/202582694751283-fizik.pdf",
    note: "9–12 ünite tabloları.",
  },
  {
    title: "Maarif kimya programı PDF",
    url: "https://mufredat.meb.gov.tr/Dosyalar/20258269501949-kimya.pdf",
    note: "9–12 tema ve içerik çerçevesi.",
  },
  {
    title: "Maarif biyoloji programı PDF",
    url: "https://mufredat.meb.gov.tr/Dosyalar/202582694327111-biyoloji.pdf",
    note: "9–12 tema ve içerik çerçevesi.",
  },
];

function u(
  code: string,
  title: string,
  topics: string[],
  exam: ExamHint
): CurriculumUnit {
  return { code, title, topics, exam };
}

/** YKS sınav kapsamı: TTKB 2026 PDF = 2018 programı, sınıf sınıf. */
export const YKS_2018_SUBJECTS: CurriculumSubject[] = [
  {
    id: "mat",
    name: "Matematik",
    group: "sayısal",
    grades: {
      9: [
        u("9.1", "Mantık", ["Önermeler ve bileşik önermeler", "De Morgan", "Koşullu / iki yönlü koşullu önerme", "Niceleyiciler (∀, ∃)", "Tanım, aksiyom, teorem, ispat"], "TYT"),
        u("9.2", "Kümeler", ["Temel kavramlar", "Alt küme ve eşitlik", "Birleşim, kesişim, fark, tümleme", "Kartezyen çarpım"], "TYT"),
        u("9.3", "Denklemler ve Eşitsizlikler", ["Sayı kümeleri", "Bölünebilme, EBOB-EKOK", "1. dereceden denklem ve eşitsizlik", "Mutlak değer", "Üslü ve köklü ifadeler", "Oran-orantı ve uygulamalar (sayı, yaş, işçi, yüzde, karışım, hız)"], "TYT"),
        u("9.4", "Üçgenler", ["Açı ve kenar", "Eşlik ve benzerlik", "Açıortay, kenarortay, yükseklik", "Dik üçgen, Pisagor, Öklid", "Trigonometrik oranlar", "Üçgenin alanı"], "TYT"),
        u("9.5", "Veri", ["Merkezî eğilim ve yayılım", "Histogram ve grafik yorumu"], "TYT"),
      ],
      10: [
        u("10.1", "Sayma ve Olasılık", ["Toplama-çarpma", "Faktöriyel, permütasyon, kombinasyon", "Pascal üçgeni, binom", "Basit olay olasılıkları"], "TYT"),
        u("10.2", "Fonksiyonlar", ["Fonksiyon kavramı ve türleri", "Grafik", "Bileşke ve ters"], "HER İKİSİ"),
        u("10.3", "Polinomlar", ["Polinom işlemleri", "Çarpanlara ayırma", "Rasyonel ifadeler"], "HER İKİSİ"),
        u("10.4", "İkinci Dereceden Denklemler", ["Kök, diskriminant", "Karmaşık sayı (eşlenik düzeyinde)", "Kök-katsayı ilişkileri"], "AYT"),
        u("10.5", "Dörtgenler ve Çokgenler", ["Çokgenler", "Yamuk, paralelkenar, eşkenar dörtgen, dikdörtgen, kare, deltoid"], "TYT"),
        u("10.6", "Uzay Geometri", ["Dik prizma ve dik piramit: alan-hacim"], "TYT"),
      ],
      11: [
        u("11.1", "Trigonometri", ["Yönlü açı, derece-radyan", "Trigonometrik fonksiyonlar", "Sinüs ve kosinüs teoremleri", "Grafik, periyot, ters fonksiyon"], "AYT"),
        u("11.2", "Analitik Geometri", ["İki nokta arası uzaklık", "İçten-dıştan bölme", "Doğru denklemi, eğim, diklik-paralellik", "Noktanın doğruya uzaklığı"], "AYT"),
        u("11.3", "Fonksiyonlarda Uygulamalar", ["Ortalama değişim", "İkinci dereceden fonksiyon / parabol", "Öteleme ve simetri dönüşümleri"], "AYT"),
        u("11.4", "Denklem ve Eşitsizlik Sistemleri", ["2. dereceden iki bilinmeyenli sistem", "2. dereceden eşitsizlik ve sistemleri"], "AYT"),
        u("11.5", "Çember ve Daire", ["Kiriş, teğet, kesen", "Merkez-çevre-iç-dış-teğet kiriş açı", "Daire çevre ve alan"], "AYT"),
        u("11.6", "Uzay Geometri", ["Küre, dik dairesel silindir ve koni"], "AYT"),
        u("11.7", "Olasılık", ["Koşullu olasılık", "Bağımlı-bağımsız ve bileşik olay", "Deneysel ve teorik olasılık"], "AYT"),
      ],
      12: [
        u("12.1", "Üstel ve Logaritmik Fonksiyonlar", ["Üstel fonksiyon", "Logaritma (10 ve e)", "Üstel-logaritmik denklem ve eşitsizlik"], "AYT"),
        u("12.2", "Diziler", ["Aritmetik ve geometrik dizi", "Fibonacci", "İlk n terim toplamı"], "AYT"),
        u("12.3", "Trigonometri", ["Toplam-fark ve iki kat açı", "Trigonometrik denklemler"], "AYT"),
        u("12.4", "Dönüşümler", ["Öteleme, dönme, simetri"], "AYT"),
        u("12.5", "Türev", ["Limit ve süreklilik", "Anlık değişim ve türev", "Türev uygulamaları (ekstremum, grafik)"], "AYT"),
        u("12.6", "İntegral", ["Belirsiz integral", "Belirli integral ve alan"], "AYT"),
        u("12.7", "Analitik Geometri", ["Çemberin analitik incelenmesi", "Doğru-çember durumu"], "AYT"),
      ],
    },
  },
  {
    id: "fizik",
    name: "Fizik",
    group: "sayısal",
    grades: {
      9: [
        u("9.1", "Fizik Bilimine Giriş", ["Fiziğin önemi ve alt dalları", "Temel-türetilmiş, skaler-vektörel nicelikler"], "TYT"),
        u("9.2", "Madde ve Özellikleri", ["Özkütle, dayanınç, esneklik", "Adezyon, kohezyon, yüzey gerilimi"], "TYT"),
        u("9.3", "Hareket ve Kuvvet", ["Konum, hız, ivme", "Newton yasaları", "Sürtünme"], "TYT"),
        u("9.4", "Enerji", ["İş, güç, mekanik enerji", "Enerjinin korunumu"], "TYT"),
        u("9.5", "Isı ve Sıcaklık", ["Isı, öz ısı, hâl değişimi", "Genleşme"], "TYT"),
        u("9.6", "Elektrostatik", ["Yük, Coulomb, elektrik alan"], "TYT"),
      ],
      10: [
        u("10.1", "Elektrik ve Manyetizma", ["Akım, direnç, Ohm", "Seri-paralel", "Manyetik alan"], "TYT"),
        u("10.2", "Basınç ve Kaldırma Kuvveti", ["Katı-sıvı-gaz basıncı", "Arşimet"], "TYT"),
        u("10.3", "Dalgalar", ["Yay, su, ses dalgaları", "Deprem dalgaları"], "TYT"),
        u("10.4", "Optik", ["Aydınlanma, gölge", "Yansıma, düzlem ve küresel ayna", "Kırılma, mercek, prizma"], "TYT"),
      ],
      11: [
        u("11.1", "Kuvvet ve Hareket", ["Vektörler", "Bağıl hareket", "Newton uygulamaları", "İtme-momentum", "Tork, denge, kütle merkezi"], "AYT"),
        u("11.2", "Elektrik ve Manyetizma", ["Elektrik alan ve potansiyel", "Sığaç", "Manyetik kuvvet", "İndüksiyon"], "AYT"),
      ],
      12: [
        u("12.1", "Çembersel Hareket", ["Düzgün çembersel hareket", "Açısal hız, merkezcil kuvvet"], "AYT"),
        u("12.2", "Basit Harmonik Hareket", ["Yay ve basit sarkaç", "Periyot"], "AYT"),
        u("12.3", "Dalga Mekaniği", ["Girişim, kırınım, Doppler"], "AYT"),
        u("12.4", "Atom Fiziğine Giriş ve Radyoaktivite", ["Atom modelleri", "Radyoaktif bozunma"], "AYT"),
        u("12.5", "Modern Fizik", ["Özel görelilik", "Kuantum, fotoelektrik"], "AYT"),
        u("12.6", "Modern Fiziğin Teknolojideki Uygulamaları", ["X-ışını, lazer, görüntüleme"], "AYT"),
      ],
    },
  },
  {
    id: "kimya",
    name: "Kimya",
    group: "sayısal",
    grades: {
      9: [
        u("9.1", "Kimya Bilimi", ["Simyadan kimyaya", "Element, bileşik, formül", "Laboratuvar güvenliği"], "TYT"),
        u("9.2", "Atom ve Periyodik Sistem", ["Atom modelleri", "Periyodik özellikler", "Metal-ametal-soy gaz"], "TYT"),
        u("9.3", "Kimyasal Türler Arası Etkileşimler", ["İyonik, kovalent, metalik bağ", "Zayıf etkileşimler"], "TYT"),
        u("9.4", "Maddenin Hâlleri", ["Katı, sıvı, gaz", "Plazma"], "TYT"),
        u("9.5", "Doğa ve Kimya", ["Su, hava, toprak", "Çevre kimyası"], "TYT"),
      ],
      10: [
        u("10.1", "Kimyanın Temel Kanunları ve Kimyasal Hesaplamalar", ["Kütlenin korunumu, sabit ve katlı oranlar", "Mol, denkleştirme, stokiyometri"], "TYT"),
        u("10.2", "Karışımlar", ["Homojen-heterojen", "Ayırma teknikleri", "Çözelti derişimi"], "TYT"),
        u("10.3", "Asitler, Bazlar ve Tuzlar", ["pH, indikatör", "Nötralleşme", "Tuzlar"], "TYT"),
      ],
      11: [
        u("11.1", "Modern Atom Teorisi", ["Kuantum sayıları", "Orbital, elektron dizilimi"], "AYT"),
        u("11.2", "Gazlar", ["Gaz yasaları", "İdeal gaz", "Kinetik teori"], "AYT"),
        u("11.3", "Sıvı Çözeltiler ve Çözünürlük", ["Derişim, çözünürlük", "Koligatif özellikler"], "AYT"),
        u("11.4", "Kimyasal Tepkimelerde Enerji", ["Entalpi, oluşum ısısı", "Hess"], "AYT"),
        u("11.5", "Kimyasal Tepkimelerde Hız", ["Hız denklemi", "Etkenler, katalizör"], "AYT"),
        u("11.6", "Kimyasal Tepkimelerde Denge", ["Kc, Le Chatelier", "Asit-baz ve çözünürlük dengesi"], "AYT"),
      ],
      12: [
        u("12.1", "Kimya ve Elektrik", ["Redoks", "Galvanik pil, elektroliz", "Korozyon"], "AYT"),
        u("12.2", "Karbon Kimyasına Giriş", ["Organik-anorganik", "Lewis, hibritleşme, allotrop"], "AYT"),
        u("12.3", "Organik Bileşikler", ["Alkan, alken, alkin, aromatik", "Alkol, eter, karbonil, karboksilik asit, ester"], "AYT"),
        u("12.4", "Enerji Kaynakları ve Bilimsel Gelişmeler", ["Fosil ve alternatif enerji", "Sürdürülebilirlik, nanoteknoloji"], "AYT"),
      ],
    },
  },
  {
    id: "biyo",
    name: "Biyoloji",
    group: "sayısal",
    grades: {
      9: [
        u("9.1", "Yaşam Bilimi Biyoloji", ["Canlıların ortak özellikleri", "Bilimsel yöntem"], "TYT"),
        u("9.2", "Hücre", ["Hücre teorisi", "Organeller", "Madde geçişi"], "TYT"),
        u("9.3", "Canlılar Dünyası", ["Sınıflandırma", "Canlı âlemleri"], "TYT"),
      ],
      10: [
        u("10.1", "Hücre Bölünmeleri", ["Mitoz, mayoz", "Hücre döngüsü"], "TYT"),
        u("10.2", "Kalıtımın Genel İlkeleri", ["Mendel", "Kalıtım problemleri"], "TYT"),
        u("10.3", "Ekosistem Ekolojisi ve Güncel Çevre Sorunları", ["Madde-enerji akışı", "Çevre sorunları"], "TYT"),
      ],
      11: [
        u("11.1", "İnsan Fizyolojisi", ["Sinir, endokrin, destek-hareket", "Sindirim, dolaşım, solunum, boşaltım", "Üreme, duyu"], "AYT"),
        u("11.2", "Komünite ve Popülasyon Ekolojisi", ["Komünite", "Popülasyon dinamikleri"], "AYT"),
      ],
      12: [
        u("12.1", "Genden Proteine", ["Nükleik asitler, replikasyon", "Protein sentezi", "Genetik mühendisliği ve biyoteknoloji"], "AYT"),
        u("12.2", "Canlılarda Enerji Dönüşümleri", ["ATP", "Fotosentez, kemosentez", "Hücresel solunum"], "AYT"),
        u("12.3", "Bitki Biyolojisi", ["Bitki yapı ve fizyolojisi"], "AYT"),
        u("12.4", "Canlılar ve Çevre", ["Varyasyon, adaptasyon, doğal seçilim"], "AYT"),
      ],
    },
  },
  {
    id: "tde",
    name: "Türk Dili ve Edebiyatı",
    group: "sözel",
    grades: {
      9: [
        u("9.1", "Giriş", ["Edebiyatın doğası", "İletişim"], "TYT"),
        u("9.2", "Hikâye", ["Öyküleyici metin çözümleme"], "HER İKİSİ"),
        u("9.3", "Şiir", ["Ahenk, tema, imge"], "HER İKİSİ"),
        u("9.4", "Masal / Fabl", ["Anlatmaya bağlı türler"], "HER İKİSİ"),
        u("9.5", "Roman", ["Roman inceleme"], "HER İKİSİ"),
        u("9.6", "Tiyatro", ["Sahne metni"], "HER İKİSİ"),
        u("9.7", "Biyografi / Otobiyografi", ["Bilgilendirici tür"], "TYT"),
        u("9.8", "Mektup / E-posta", ["İşlevsel yazılar"], "TYT"),
        u("9.9", "Günlük / Blog", ["Kişisel anlatı"], "TYT"),
      ],
      10: [
        u("10.1", "Giriş", ["Edebiyat-tarih-din ilişkisi"], "HER İKİSİ"),
        u("10.2", "Hikâye", ["Dönem ve tür"], "HER İKİSİ"),
        u("10.3", "Şiir", ["Akım ve nazım biçimi"], "HER İKİSİ"),
        u("10.4", "Destan / Efsane", ["Sözlü kültür"], "HER İKİSİ"),
        u("10.5", "Roman", ["Roman geleneği"], "HER İKİSİ"),
        u("10.6", "Tiyatro", ["Geleneksel ve modern"], "HER İKİSİ"),
        u("10.7", "Anı (Hatıra)", ["Anı türü"], "TYT"),
        u("10.8", "Haber Metni", ["Bilgilendirici metin"], "TYT"),
        u("10.9", "Gezi Yazısı", ["Gezi türü"], "TYT"),
      ],
      11: [
        u("11.1", "Giriş", ["Dönem-akım çerçevesi"], "AYT"),
        u("11.2", "Hikâye", ["Modern hikâye"], "AYT"),
        u("11.3", "Şiir", ["Modern şiir"], "AYT"),
        u("11.4", "Makale", ["Düşünce yazısı"], "HER İKİSİ"),
        u("11.5", "Sohbet ve Fıkra", ["Köşe yazısı türleri"], "HER İKİSİ"),
        u("11.6", "Roman", ["Roman ve akımlar"], "AYT"),
        u("11.7", "Tiyatro", ["Modern tiyatro"], "AYT"),
        u("11.8", "Eleştiri", ["Eleştirel metin"], "AYT"),
        u("11.9", "Mülakat / Röportaj", ["Söyleşi türü"], "TYT"),
      ],
      12: [
        u("12.1", "Giriş", ["Cumhuriyet dönemi çerçevesi"], "AYT"),
        u("12.2", "Hikâye", ["Cumhuriyet hikâyesi"], "AYT"),
        u("12.3", "Şiir", ["Cumhuriyet şiiri"], "AYT"),
        u("12.4", "Roman", ["Cumhuriyet romanı"], "AYT"),
        u("12.5", "Tiyatro", ["Cumhuriyet tiyatrosu"], "AYT"),
        u("12.6", "Deneme", ["Deneme türü"], "HER İKİSİ"),
        u("12.7", "Söylev (Nutuk)", ["Hitabet"], "AYT"),
      ],
    },
  },
  {
    id: "tarih",
    name: "Tarih",
    group: "sözel",
    grades: {
      9: [
        u("9.1", "Tarih ve Zaman", ["Tarih bilimi", "Takvimler, yüzyıl hesabı"], "TYT"),
        u("9.2", "İnsanlığın İlk Dönemleri", ["Yazı öncesi", "İlk Çağ medeniyet havzaları"], "TYT"),
        u("9.3", "Orta Çağ’da Dünya", ["Siyasi yapılar", "Tarım ve ticaret yolları"], "TYT"),
        u("9.4", "İlk ve Orta Çağlarda Türk Dünyası", ["Asya Hun, Kök Türk, Uygur", "Töre"], "TYT"),
        u("9.5", "İslam Medeniyetinin Doğuşu", ["İslam’ın doğuşu ve yayılışı"], "TYT"),
        u("9.6", "Türklerin İslamiyet’i Kabulü ve İlk Türk İslam Devletleri", ["Karahanlı, Gazneli, Büyük Selçuklu"], "TYT"),
      ],
      10: [
        u("10.1", "Yerleşme ve Devletleşme Sürecinde Selçuklu Türkiyesi", ["Türkiye Selçukluları"], "TYT"),
        u("10.2", "Beylikten Devlete Osmanlı Siyaseti (1302-1453)", ["Kuruluş"], "TYT"),
        u("10.3", "Devletleşme Sürecinde Savaşçılar ve Askerler", ["Tımar, yeniçeri, devşirme"], "TYT"),
        u("10.4", "Beylikten Devlete Osmanlı Medeniyeti", ["İlmiye-kalemiye-seyfiye"], "TYT"),
        u("10.5", "Dünya Gücü Osmanlı (1453-1595)", ["Yükselme"], "TYT"),
        u("10.6", "Sultan ve Osmanlı Merkez Teşkilatı", ["Saray ve divan"], "TYT"),
        u("10.7", "Klasik Çağda Osmanlı Toplum Düzeni", ["Millet sistemi, vakıf"], "TYT"),
      ],
      11: [
        u("11.1", "Değişen Dünya Dengeleri Karşısında Osmanlı Siyaseti (1595-1774)", ["Duraklama-gerileme siyaseti"], "AYT"),
        u("11.2", "Değişim Çağında Avrupa ve Osmanlı", ["Rönesans, Reform, Coğrafi Keşifler"], "AYT"),
        u("11.3", "Devrimler Çağında Değişen Devlet-Toplum İlişkileri", ["Fransız İhtilali ve etkileri"], "AYT"),
        u("11.4", "Uluslararası İlişkilerde Denge Stratejisi (1774-1914)", ["Tanzimat, Meşrutiyet"], "AYT"),
        u("11.5", "XIX. ve XX. Yüzyılda Değişen Sosyo-Ekonomik Hayat", ["Sanayi, göç, fikir akımları"], "AYT"),
      ],
      12: [],
    },
  },
  {
    id: "inkilap",
    name: "T.C. İnkılap Tarihi ve Atatürkçülük",
    group: "sözel",
    grades: {
      9: [],
      10: [],
      11: [],
      12: [
        u("12.1", "20. Yüzyıl Başlarında Osmanlı Devleti ve Dünya", ["I. Dünya Savaşı öncesi"], "AYT"),
        u("12.2", "Millî Mücadele", ["Kongreler, TBMM, zafer"], "AYT"),
        u("12.3", "Atatürkçülük ve Türk İnkılabı", ["İnkılaplar, ilkeler"], "AYT"),
        u("12.4", "İki Savaş Arasındaki Dönemde Türkiye ve Dünya", ["1923-1939"], "AYT"),
        u("12.5", "II. Dünya Savaşı Sürecinde Türkiye ve Dünya", ["Savaş yılları"], "AYT"),
        u("12.6", "II. Dünya Savaşı Sonrasında Türkiye ve Dünya", ["Çok partili hayat"], "AYT"),
        u("12.7", "Toplumsal Devrim Çağında Dünya ve Türkiye", ["1960-1980"], "AYT"),
        u("12.8", "21. Yüzyılın Eşiğinde Türkiye ve Dünya", ["1990 sonrası"], "AYT"),
      ],
    },
  },
  {
    id: "cografya",
    name: "Coğrafya",
    group: "sözel",
    grades: {
      9: [
        u("9.1", "Doğal Sistemler", ["Doğa-insan", "Dünya’nın şekli ve hareketleri", "Koordinat, harita", "İklim unsurları"], "TYT"),
        u("9.2", "Beşeri Sistemler", ["Yerleşme", "Türkiye’de idari yapı"], "TYT"),
        u("9.3", "Küresel Ortam: Bölgeler ve Ülkeler", ["Bölge türleri", "Haritada ülke sınıflaması"], "TYT"),
        u("9.4", "Çevre ve Toplum", ["Doğal afet farkındalığı", "Çevre sorunları"], "TYT"),
      ],
      10: [
        u("10.1", "Doğal Sistemler", ["Yer şekilleri", "İklim tipleri", "Su, toprak, bitki"], "TYT"),
        u("10.2", "Beşeri Sistemler", ["Nüfus, göç", "Ekonomik faaliyetler"], "TYT"),
        u("10.3", "Küresel Ortam: Bölgeler ve Ülkeler", ["Uluslararası ulaşım hatları"], "TYT"),
        u("10.4", "Çevre ve Toplum", ["Afetler ve korunma", "Türkiye’de afetler"], "TYT"),
      ],
      11: [
        u("11.1", "Doğal Sistemler", ["Biyoçeşitlilik", "Su ve toprak yönetimi"], "AYT"),
        u("11.2", "Beşeri Sistemler", ["Nüfus politikaları", "Şehirleşme"], "AYT"),
        u("11.3", "Küresel Ortam: Bölgeler ve Ülkeler", ["Ülkeler ve örgütler"], "AYT"),
        u("11.4", "Çevre ve Toplum", ["Küresel çevre sorunları"], "AYT"),
      ],
      12: [
        u("12.1", "Doğal Sistemler", ["Doğal kaynaklar ve enerji"], "AYT"),
        u("12.2", "Beşeri Sistemler", ["Ekonomik faaliyetler", "Ulaşım, ticaret, turizm", "Bölgesel kalkınma"], "AYT"),
        u("12.3", "Küresel Ortam: Bölgeler ve Ülkeler", ["Türkiye’nin jeopolitiği"], "AYT"),
        u("12.4", "Çevre ve Toplum", ["Sürdürülebilirlik"], "AYT"),
      ],
    },
  },
  {
    id: "felsefe",
    name: "Felsefe",
    group: "sözel",
    grades: {
      9: [],
      10: [
        u("10.1", "Felsefeyi Tanıma", ["Felsefenin anlamı", "Felsefi düşüncenin özellikleri"], "TYT"),
        u("10.2", "Felsefe ile Düşünme", ["Argüman, tümdengelim-tümevarım", "Felsefi soru"], "TYT"),
        u("10.3", "Felsefenin Temel Konuları ve Problemleri", ["Varlık, bilgi, bilim, ahlak, din, siyaset, sanat felsefesi"], "HER İKİSİ"),
        u("10.4", "Felsefi Okuma ve Yazma", ["Metin analizi", "Deneme"], "TYT"),
      ],
      11: [
        u("11.1", "MÖ 6. Yüzyıl – MS 2. Yüzyıl Felsefesi", ["İlkçağ", "Sokrates, Platon, Aristoteles"], "AYT"),
        u("11.2", "MS 2. Yüzyıl – MS 15. Yüzyıl Felsefesi", ["Hristiyan ve İslam felsefesi", "İnanç-akıl"], "AYT"),
        u("11.3", "15. Yüzyıl – 17. Yüzyıl Felsefesi", ["Hümanizm, Descartes, Bacon"], "AYT"),
        u("11.4", "18. Yüzyıl – 19. Yüzyıl Felsefesi", ["Aydınlanma", "Locke, Kant, Hegel"], "AYT"),
        u("11.5", "20. Yüzyıl Felsefesi", ["Varoluşçuluk, pozitivizm, hermeneutik"], "AYT"),
      ],
      12: [],
    },
  },
  {
    id: "dkab",
    name: "Din Kültürü ve Ahlak Bilgisi",
    group: "ortak",
    grades: {
      9: [
        u("9.1", "Bilgi ve İnanç", ["Bilgi-inanç ilişkisi"], "TYT"),
        u("9.2", "Din ve İslam", ["İman esasları"], "TYT"),
        u("9.3", "İslam ve İbadet", ["İbadet ilkeleri"], "TYT"),
        u("9.4", "Gençlik ve Değerler", ["Ahlak ve değer"], "TYT"),
        u("9.5", "Gönül Coğrafyamız", ["İslam coğrafyası"], "TYT"),
      ],
      10: [
        u("10.1", "Allah-İnsan İlişkisi", ["Kulluk"], "TYT"),
        u("10.2", "Hz. Muhammed ve Gençlik", ["Siyer"], "TYT"),
        u("10.3", "Din ve Hayat", ["Aile, çevre, ekonomi"], "TYT"),
        u("10.4", "Ahlaki Tutum ve Davranışlar", ["İslam ahlakı"], "TYT"),
        u("10.5", "İslam Düşüncesinde İtikadî, Siyasî ve Fıkhî Yorumlar", ["Mezhepler"], "TYT"),
      ],
      11: [
        u("11.1", "Dünya ve Ahiret", ["Ahiret inancı"], "TYT"),
        u("11.2", "Kur’an’a Göre Hz. Muhammed", ["Peygamberlik"], "TYT"),
        u("11.3", "Kur’an’da Bazı Kavramlar", ["Temel kavramlar"], "TYT"),
        u("11.4", "İnançla İlgili Meseleler", ["Yeni dinî akımlar"], "TYT"),
        u("11.5", "Yahudilik ve Hıristiyanlık", ["İlahi dinler"], "TYT"),
      ],
      12: [
        u("12.1", "İslam ve Bilim", ["Din-bilim"], "TYT"),
        u("12.2", "Anadolu’da İslam", ["Anadolu İslam kültürü"], "TYT"),
        u("12.3", "İslam Düşüncesinde Tasavvufî Yorumlar", ["Tasavvuf"], "TYT"),
        u("12.4", "Güncel Dinî Meseleler", ["Fıkhî güncel konular"], "TYT"),
        u("12.5", "Hint ve Çin Dinleri", ["Hinduizm, Budizm"], "TYT"),
      ],
    },
  },
];

/** 2026-27 okulda görülen: 9-11 Maarif (resmî program PDF), 12. sınıf 2018. */
export const SCHOOL_2026_SUBJECTS: CurriculumSubject[] = [
  {
    id: "mat",
    name: "Matematik (Maarif 9–11 / 2018 12)",
    group: "sayısal",
    grades: {
      9: [
        u("MAT.9.1", "Sayılar", ["Üslü ve köklü gösterimler", "Gerçek sayı aralıkları ve kümeler", "Sayı kümelerinin özellikleri", "İşlem özelliklerinin cebirsel ifadesi"], "TYT"),
        u("MAT.9.2", "Nicelikler ve Değişimler", ["Doğrusal referans fonksiyon", "Mutlak değer fonksiyonu", "Doğrusal denklem ve eşitsizlik problemleri"], "TYT"),
        u("MAT.9.3", "Algoritma ve Bilişim", ["Algoritmik problem çözme", "Akış şeması, sözde kod"], "TYT"),
        u("MAT.9.4", "Geometrik Şekiller", ["Üçgende açı-kenar", "Doğrulama ve ispat"], "TYT"),
        u("MAT.9.5", "Eşlik ve Benzerlik", ["Üçgende eşlik ve benzerlik"], "TYT"),
        u("MAT.9.6", "İstatistiksel Araştırma Süreci", ["Nicel veri", "Histogram, kutu grafiği", "Ortalama, ortanca, standart sapma"], "TYT"),
        u("MAT.9.7", "Veriden Olasılığa", ["Olasılık modelleme"], "TYT"),
      ],
      10: [
        u("MAT.10.1", "Sayılar", ["Asal çarpan, bölen", "EBOB-EKOK", "Bölümünden kalan"], "TYT"),
        u("MAT.10.2", "Nicelikler ve Değişimler", ["Fonksiyon şartları", "Karesel, karekök, rasyonel fonksiyon", "Ters fonksiyon", "Denklem-eşitsizlik problemleri"], "HER İKİSİ"),
        u("MAT.10.3", "Sayma, Algoritma ve Bilişim", ["Sayma problemleri", "Cebirsel-fonksiyonel işlemlerin algoritması"], "TYT"),
        u("MAT.10.4", "Geometrik Şekiller", ["Dörtgen ve çokgen"], "TYT"),
        u("MAT.10.5", "Analitik İnceleme", ["İki nokta uzaklığı", "Bölme noktası", "Doğrunun analitiği"], "AYT"),
        u("MAT.10.6", "İstatistiksel Araştırma Süreci", ["İki değişken / karşılaştırma"], "TYT"),
        u("MAT.10.7", "Veriden Olasılığa", ["Olasılık"], "TYT"),
      ],
      11: [
        u("MAT.11.1a", "Nicelikler ve Değişimler (1)", ["Trigonometrik fonksiyonlar", "Trigonometrik denklemler"], "AYT"),
        u("MAT.11.1b", "Nicelikler ve Değişimler (2)", ["Üstel ve logaritmik fonksiyon", "Üstel-logaritmik denklem ve eşitsizlik"], "AYT"),
        u("MAT.11.1c", "Nicelikler ve Değişimler (3)", ["Fonksiyonların bileşkesi", "Dört işlem"], "AYT"),
        u("MAT.11.2", "Geometrik Şekiller", ["Çember ve daire"], "AYT"),
        u("MAT.11.3", "İstatistiksel Araştırma Süreci", ["İleri veri analizi"], "AYT"),
      ],
      12: YKS_2018_SUBJECTS.find((s) => s.id === "mat")!.grades[12],
    },
  },
  {
    id: "fizik",
    name: "Fizik (Maarif 9–11 / 2018 12)",
    group: "sayısal",
    grades: {
      9: [
        u("FİZ.9.1", "Fizik Bilimi ve Kariyer Keşfi", ["Fiziğin tanımı ve alt dalları", "Bilim insanları", "Kariyer"], "TYT"),
        u("FİZ.9.2", "Kuvvet ve Hareket", ["SI birimleri", "Skaler-vektörel", "Temel kuvvetler", "Hareket türleri"], "TYT"),
        u("FİZ.9.3", "Akışkanlar", ["Basınç", "Durgun sıvılarda basınç", "Kaldırma", "Akışkan sürati ve basınç"], "TYT"),
        u("FİZ.9.4", "Enerji", ["Isı, sıcaklık, iç enerji", "Öz ısı, hâl değişimi"], "TYT"),
      ],
      10: [
        u("FİZ.10.1", "Kuvvet ve Hareket", ["Hareket ve kuvvetin ileri uygulamaları"], "TYT"),
        u("FİZ.10.2", "Enerji", ["Mekanik enerji ve dönüşümler"], "TYT"),
        u("FİZ.10.3", "Elektrik", ["Akım, devre, elektrik enerjisi"], "TYT"),
        u("FİZ.10.4", "Dalgalar", ["Dalga özellikleri", "Ses / deprem farkındalığı"], "TYT"),
      ],
      11: [
        u("FİZ.11.1", "Kuvvet ve Hareket", ["Vektör, bağıl hareket, Newton, momentum"], "AYT"),
        u("FİZ.11.2", "Elektrik ve Manyetizma", ["Alan, potansiyel, sığaç, indüksiyon"], "AYT"),
        u("FİZ.11.3", "Madde ve Doğası", ["Maddenin fiziksel özellikleri"], "AYT"),
        u("FİZ.11.4", "Optik", ["Yansıma, kırılma, mercek, dalga optiği"], "AYT"),
      ],
      12: YKS_2018_SUBJECTS.find((s) => s.id === "fizik")!.grades[12],
    },
  },
  {
    id: "kimya",
    name: "Kimya (Maarif 9–11 / 2018 12)",
    group: "sayısal",
    grades: {
      9: [
        u("KİM.9.1", "Etkileşim", ["Günlük hayatta kimya ve güvenlik", "Kimyanın alt disiplinleri", "Bohr ve modern atom", "Orbital, elektron dizilimi", "Periyodik tablo ve periyodik özellikler", "İyon oluşumu"], "TYT"),
        u("KİM.9.2", "Çeşitlilik", ["Metalik, iyonik, kovalent bağ", "Lewis, polarite, adlandırma", "Moleküller arası etkileşim", "Katı ve sıvı özellikleri"], "TYT"),
        u("KİM.9.3", "Sürdürülebilirlik", ["Nanoparçacıklar", "Yeşil kimya / atık önleme"], "TYT"),
      ],
      10: [
        u("KİM.10.1", "Etkileşim", ["Tepkime türleri, mol, denkleştirme, stokiyometri", "Gaz yasaları, ideal gaz, Graham"], "TYT"),
        u("KİM.10.2", "Çeşitlilik", ["Çözünme, derişim (molarite, ppm)", "Çözünürlük ve etkenleri", "Kaynama-donma noktası değişimi"], "TYT"),
        u("KİM.10.3", "Sürdürülebilirlik", ["Makro-mikro deney", "Atmosfer tepkimeleri ve küresel sorunlar"], "TYT"),
      ],
      11: [
        u("KİM.11.1", "Etkileşim", ["Tepkime enerjisi / entalpi", "Bağ ve oluşum ısısı", "Tepkime hızı ve etkenleri"], "AYT"),
        u("KİM.11.2", "Çeşitlilik", ["Kimyasal denge", "Asit-baz teorileri, pH, titrasyon", "Çözünürlük çarpımı"], "AYT"),
        u("KİM.11.3", "Sürdürülebilirlik", ["Yeşil hidrojen", "Nanoteknoloji, mikro/nanoplastik"], "AYT"),
      ],
      12: YKS_2018_SUBJECTS.find((s) => s.id === "kimya")!.grades[12],
    },
  },
  {
    id: "biyo",
    name: "Biyoloji (Maarif 9–11 / 2018 12)",
    group: "sayısal",
    grades: {
      9: [
        u("BİY.9.1", "Yaşam", ["Biyolojinin dönüm noktaları", "Bilimin doğası ve bilim etiği", "Canlıların ortak özellikleri", "Sınıflandırma, üç domain", "Biyoçeşitlilik"], "TYT"),
        u("BİY.9.2", "Organizasyon", ["İnorganik ve organik moleküller", "Enzim", "Prokaryot-ökaryot hücre", "Doku-organ-sistem"], "TYT"),
      ],
      10: [
        u("BİY.10.1", "Enerji", ["ATP", "Fotosentez ve kemosentez", "Sindirim", "Hücresel solunum ve fermantasyon"], "TYT"),
        u("BİY.10.2", "Ekoloji", ["Ekosistem, komünite, popülasyon", "Madde döngüleri", "Ekolojik sürdürülebilirlik"], "TYT"),
      ],
      11: [
        u("BİY.11.1", "Tepki", ["Bitkide hormon, tropizma, nasti", "Nöron ve sinir sistemi", "Kas-iskelet", "Bağışıklık"], "AYT"),
        u("BİY.11.2", "Homeostazi", ["Endokrin, dolaşım, solunum, boşaltım", "Geri bildirim", "Diyabet örnekleri"], "AYT"),
      ],
      12: YKS_2018_SUBJECTS.find((s) => s.id === "biyo")!.grades[12],
    },
  },
];

export const PROGRAMS: Record<
  ProgramKind,
  { label: string; blurb: string; subjects: CurriculumSubject[] }
> = {
  yks2018: {
    label: "YKS sınav kapsamı (2018 program / TTKB 2026)",
    blurb:
      "ÖSYM’nin 2026 YKS’sine esas TTKB belgesi 2018 lise programının sınıf–ünite listesidir. 2027 YKS için ayrı PDF henüz yok; bu yılki 12. sınıflar hâlâ bu programdan sorumludur. TYT kabaca 9–10 (+ temel matematik), AYT kabaca 11–12 (+ ilgili 10. sınıf).",
    subjects: YKS_2018_SUBJECTS,
  },
  school2026: {
    label: "Bu yıl okulda görülen (2026-2027)",
    blurb:
      "OGM 1 Eylül 2026: hazırlık, 9, 10 ve 11. sınıflarda Türkiye Yüzyılı Maarif Modeli; 12. sınıfta önceki (2018) program. Aşağıda matematik, fizik, kimya ve biyoloji resmî program PDF’lerinden. Edebiyat, tarih, coğrafya ve DKAB da 9–11’de Maarif’e geçti; tam tema listesi için mufredat.meb.gov.tr.",
    subjects: SCHOOL_2026_SUBJECTS,
  },
};

export function countUnits(subjects: CurriculumSubject[]): number {
  return subjects.reduce(
    (n, s) => n + ([9, 10, 11, 12] as Grade[]).reduce((m, g) => m + s.grades[g].length, 0),
    0
  );
}

/** 9–11 STEM Maarif, diğer dersler ve 12. sınıf 2018/TTKB. */
export function schoolUnitsFor(grade: Grade, subjectId: string): CurriculumUnit[] {
  const school = SCHOOL_2026_SUBJECTS.find((s) => s.id === subjectId);
  const yks = YKS_2018_SUBJECTS.find((s) => s.id === subjectId);
  if (grade === 12) return yks?.grades[12] ?? [];
  return school?.grades[grade]?.length ? school.grades[grade] : yks?.grades[grade] ?? [];
}
