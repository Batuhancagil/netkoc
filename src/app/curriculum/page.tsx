import Link from "next/link";
import { Button } from "@/components/ui/button";
import { CurriculumBrowser } from "@/components/curriculum-browser";

export default function PublicCurriculumPage() {
  return (
    <main className="min-h-screen bg-muted/20">
      <header className="border-b bg-background">
        <div className="container flex flex-wrap items-center justify-between gap-3 py-4">
          <div>
            <p className="text-xs uppercase tracking-wide text-muted-foreground">Netkoç</p>
            <h1 className="text-2xl font-bold">YKS ve lise konu listesi</h1>
          </div>
          <div className="flex gap-2">
            <Button asChild variant="outline">
              <Link href="/">Ana sayfa</Link>
            </Button>
            <Button asChild>
              <Link href="/login">Giriş</Link>
            </Button>
          </div>
        </div>
      </header>
      <div className="container py-6">
        <CurriculumBrowser />
      </div>
    </main>
  );
}
