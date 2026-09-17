import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function LandingPage() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-background to-muted/40">
      <header className="container flex items-center justify-between py-6">
        <h1 className="text-2xl font-bold">Netkoç</h1>
        <nav className="flex items-center gap-3">
          <Button asChild variant="ghost">
            <Link href="/apply">Hoca Başvurusu</Link>
          </Button>
          <Button asChild>
            <Link href="/login">Giriş Yap</Link>
          </Button>
        </nav>
      </header>

      <section className="container py-16">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="text-4xl font-bold tracking-tight md:text-5xl">
            YKS koçluk takibi, kâğıttan dijitale.
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            Hocalar için haftalık program, deneme analizi, konu takibi ve ödeme
            yönetimi tek bir panelde. Öğrenciler ve veliler kendi
            görünümlerinden ilerlemeyi takip eder.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Button asChild size="lg">
              <Link href="/apply">Hoca olarak katıl</Link>
            </Button>
            <Button asChild size="lg" variant="outline">
              <Link href="/curriculum">YKS konu listesi</Link>
            </Button>
            <Button asChild size="lg" variant="outline">
              <Link href="/login">Hesabım var, giriş yap</Link>
            </Button>
          </div>
        </div>
      </section>

      <section className="container grid gap-6 pb-20 md:grid-cols-3">
        <Feature
          title="Haftalık Program + Değerlendirme"
          desc="Günlük ders, soru ve süre planı. Öğrencinin girdiği D/Y'yi anlık takip et, PDF çıktısını veli imzasıyla yazdır."
        />
        <Feature
          title="Deneme Analizi"
          desc="Genel ve branş denemeleri, otomatik net (D - Y/4) hesabı, konu kırılımı ve trend grafikleri."
        />
        <Feature
          title="Çok Kiracılı"
          desc="Her hoca kendi öğrencilerini ve müfredatını yönetir. Platform yöneticisi hoca ekler, veri izole kalır."
        />
      </section>
    </main>
  );
}

function Feature({ title, desc }: { title: string; desc: string }) {
  return (
    <div className="rounded-lg border bg-card p-6 shadow-sm">
      <h3 className="text-lg font-semibold">{title}</h3>
      <p className="mt-2 text-sm text-muted-foreground">{desc}</p>
    </div>
  );
}
