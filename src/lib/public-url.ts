const FALLBACK = "https://netkoc-web-production.up.railway.app";

function stripSlash(s: string) {
  return s.replace(/\/$/, "");
}

function isLocalHost(host: string) {
  return /^(localhost|127\.0\.0\.1)(:\d+)?$/i.test(host);
}

/** Tarayıcıya giden mutlak köken. Railway iç adresi (localhost:8080) kullanılmaz. */
export function publicOrigin(req?: Request): string {
  const env = process.env.APP_URL?.trim();
  if (env) {
    try {
      const u = new URL(env.includes("://") ? env : `https://${env}`);
      if (!isLocalHost(u.host)) return stripSlash(u.origin);
    } catch {
      /* ignore */
    }
  }

  const railway = process.env.RAILWAY_PUBLIC_DOMAIN?.trim();
  if (railway) {
    const host = railway.replace(/^https?:\/\//, "").replace(/\/$/, "");
    if (host && !isLocalHost(host)) return `https://${host}`;
  }

  if (req) {
    const proto = req.headers.get("x-forwarded-proto") ?? "https";
    const host = (req.headers.get("x-forwarded-host") ?? req.headers.get("host") ?? "").split(",")[0].trim();
    if (host && !isLocalHost(host)) return `${proto}://${host}`;
  }

  return FALLBACK;
}

export function publicUrl(path: string, req?: Request): string {
  const p = path.startsWith("/") ? path : `/${path}`;
  return `${publicOrigin(req)}${p}`;
}
