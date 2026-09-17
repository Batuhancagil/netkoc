import Link from "next/link";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

export type NavItem = { href: string; label: string };

export function AppHeader({
  title,
  subtitle,
  userName,
  nav,
  activePath,
}: {
  title: string;
  subtitle?: string;
  userName: string;
  nav: NavItem[];
  activePath: string;
}) {
  return (
    <header className="border-b bg-card">
      <div className="container flex h-14 items-center justify-between gap-4">
        <div className="flex items-center gap-6">
          <Link href="/" className="text-lg font-bold">
            Netkoç
          </Link>
          <span className="hidden text-sm text-muted-foreground md:inline">
            {title}
            {subtitle ? <span className="ml-2 opacity-70">· {subtitle}</span> : null}
          </span>
        </div>
        <div className="flex items-center gap-4">
          <span className="hidden text-sm text-muted-foreground md:inline">
            {userName}
          </span>
          <form action="/api/auth/logout" method="post">
            <Button type="submit" variant="ghost" size="sm">
              Çıkış
            </Button>
          </form>
        </div>
      </div>
      {nav.length > 0 ? (
        <nav className="container flex flex-wrap gap-1 overflow-x-auto border-t py-2">
          {nav.map((item) => {
            const active =
              activePath === item.href || activePath.startsWith(item.href + "/");
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "rounded-md px-3 py-1.5 text-sm font-medium transition-colors",
                  active
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                )}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>
      ) : null}
    </header>
  );
}
