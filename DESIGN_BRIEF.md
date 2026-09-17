# Netkoç — Claude Design brief

Aşağıyı Claude Design’a olduğu gibi yapıştır. Amaç: mevcut Tailwind varsayılan görünümü değil, **gerçek bir ürün sistemi**.

---

## 1. Ürün

**Netkoç**, Türkiye’deki özel ders / YKS koçları için çok kiracılı (multi-tenant) takip paneli.

Tek cümle: *Hoca öğrencisinin haftasını planlar, netini görür, veli de aynı gerçeği görür — kâğıt program ve Excel deneme takibinin yerine.*

Canlı ürün: YKS koçluk (TYT + AYT). LGS / ortaokul yok. Net hesabı lise kuralı: **D − Y/4**.

Değiştirilecek şey işlev değil **yüz**. Mevcut uygulama Next.js, açık gri sistem fontu, generic dashboard. Yeni tasarım aynı işleri daha net, daha “koç masası” gibi göstermeli.

## 2. Kimin için

Dört rol, dört bakış. Aynı veri, farklı yetki.

| Rol | Kim | Ne yapar |
| --- | --- | --- |
| **Hoca (öğretmen)** | Asıl kullanıcı. 5–40 öğrencili koç. | Öğrenci ekler, haftalık program yazar, deneme neti girer, konu ilerlemesi, ödeme haftası, veliye PDF. |
| **Öğrenci** | 11–12. sınıf YKS adayı | Kendi programını görür, planlanan soru/süreyi D/Y olarak işler, deneme ve konu durumunu okur. |
| **Veli** | Anne/baba | Özet: bu hafta ne kadar uyuldu, net trendi, ödeme. Düzenleme yok. |
| **Platform yöneticisi** | Netkoç operasyon | Hoca başvurularını onaylar, davet gönderir. Öğrenci verisine girmez. |

Hoca kendi “okulunu” (organizasyon) yönetir. Başka hocanın öğrencisi görünmez.

## 3. Marka

- **Ad:** Netkoç (ç ile). Slogan değil, ürün adı.
- **Kategori:** YKS koçluk işletim sistemi — edtech oyunu / mor gradient startup değil.
- **Kişilik:** Sakin, net, öğretmen masası. Kırtasiye + modern araç. Abartısız güven.
- **Dil:** Tüm UI **Türkçe**. TYT, AYT, net, branş, deneme, yol haritası, D/Y. İngilizce menü yok (`Dashboard`, `Settings` yasak).
- **Ses:** Kısa, iş gibi. “Harika bir öğrenme yolculuğu” yok.

## 4. Görsel yön (yeni tasarım)

Mevcut hali *boş Tailwind*: sistem sans, gri `#e5e7eb` / `#9ca3af`, beyaz kart, mor/indigo varsayılanı yok bile — karakter yok.

İstenen:

- **Masaüstü öncelik** (hoca günde 1–2 saat laptop). Öğrenci/veli **telefon**. Aynı sistem, iki yoğunluk.
- Tipografi: okunaklı; rakamlar (net, D, Y, süre) tabular / belirgin. Başlıklar sakin serif *veya* güçlü grotesk — ikisinden biri, ikisi birden değil.
- Renk: tek marka rengi + nötr kâğıt zemin. Net **pozitif/negatif** için yeşil/kırmızı; marka rengi bunlarla yarışmasın. Mor “AI SaaS” ve çocuk-uygulaması paleti yok.
- Yoğunluk: Excel’i kopyalama. Haftalık program **takvim/ızgara**, deneme **küçük trend + net**, öğrenci listesi **skan edilebilir**.
- Boş hal: “Henüz öğrenci yok — davet gönder” gerçek kopya. Lorem yok.
- PWA/mobil: alt bar öğrenci/velide; hocada sol nav masaüstü, üst bar dar ekran.

## 5. Ana ekranlar (tasarla)

Önce bunlar. Her ekran için masaüstü + mobil frame.

1. **Pazarlama / giriş kapısı (`/`)**  
   Hoca başvurusu + giriş. Değer: program, deneme neti, çok hocanın ayrı çalışma alanı. CTA: “Hoca olarak katıl” / “Giriş yap”.

2. **Giriş (`/login`)**  
   E-posta + şifre. Davet linki notu. “Hoca olmak için başvuru.” Minimal, güven.

3. **Hoca başvurusu (`/apply`)**  
   Ad, e-posta, telefon, mesaj. “Yönetici inceler, davet gider.”

4. **Hoca — öğrenci listesi**  
   Kart/satır: ad, alan (Sayısal / EA / Sözel / Dil), son net, bu hafta uyum, ödeme durumu. Arama + alan filtresi.

5. **Hoca — öğrenci özeti**  
   Tek bakışta: hedef alan, yol haritası ilerlemesi, son 3 deneme neti, bu haftanın programı, ödeme.

6. **Haftalık program + değerlendirme**  
   Hafta başı–sonu. Gün × ders ızgarası: konu, planlanan soru, planlanan dakika. Öğrenci D/Y girince hoca görür. Veli imzalı **PDF** hissi (yazdırılabilir sayfa).

7. **Deneme analizi**  
   TYT: Türkçe, Mat, Sosyal, Fen (D/Y → net). AYT branş netleri alana göre. Konu kırılımı. Zaman içinde net grafiği. “Genel deneme” vs “branş deneme”.

8. **Konu / yol haritası**  
   2025–2026 sistem şablonları: Sayısal, Eşit Ağırlık, Sözel, Dil. Hafta hücreleri; tamamlanan konu. 21 ders, ~285 konu. Ağaç değil, ilerleme hissi.

9. **Ödeme**  
   Öğrenci × hafta. Durum: bekliyor / ödendi. Hoca işletmesi, fintech uygulaması değil.

10. **Öğrenci görünümü**  
    Bugün ne çalışacağım, D/Y girişi, netlerim. Sade; hoca paneli değil.

11. **Veli görünümü**  
    Bu hafta uyum, net trendi, ödeme. Tek sütun, büyük rakam, az buton.

12. **Platform admin**  
    Başvuru kuyruğu, hoca daveti. Soğuk, operasyonel. Öğrenci PII’si yok.

## 6. Bileşenler

- Buton: birincil / ikincil / tehlikeli (öğrenci sil).
- Form: label üstte, Türkçe hata.
- Tablo + kart (dar ekranda kart).
- Net rozeti (ör. 28.5).
- Hafta seçici.
- Boş / yükleniyor / hata.
- Davet kopyalama.
- PDF program sayfası (A4, veli imza alanı).

## 7. Kısıtlar

- Türkçe UI, Türkiye YKS terimleri.
- Çok kiracı: hoca A, hoca B’nin öğrencisini görmez.
- Kayıt açık değil; hoca **başvuru → yönetici daveti**.
- Mobil + masaüstü. Erişilebilir kontrast.
- Logo: wordmark “Netkoç” + sade marka. Okul arması / kelebek / mezuniyet şapkası klise değil.
- İkon seti tek dil.

## 8. Teslim

- Masaüstü 1440 ve mobil 390: kapı, login, hoca öğrenci listesi, haftalık program, deneme, öğrenci bugünü, veli özeti.
- Renk, tipografi, boşluk token’ları.
- Açık/koyu zorunlu değil; **açık kâğıt** varsayılan. Koyu isteğe bağlı.

## 9. Yapma

- Lorem ipsum, İngilizce nav.
- Mor-mavi SaaS gradient, 3D karakter, “AI tutor”.
- Oyunlaştırılmış XP / rozet yağmuru.
- LGS veya ilkokul görseli.
- Mevcut gri Tailwind’i “biraz yuvarlatmak”.

---

**Kısa özet:** Netkoç, YKS koçunun işletim paneli. Tasarım bir öğretmen masasına yakışmalı: net rakam, haftalık ızgara, veliye sakin özet. Hedef kitle koç, öğrenci ve veli; dil Türkçe.
