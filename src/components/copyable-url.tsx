"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";

export function CopyableUrl({ url, label }: { url: string; label?: string }) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    try {
      await navigator.clipboard.writeText(url);
    } catch {
      const el = document.createElement("textarea");
      el.value = url;
      el.setAttribute("readonly", "");
      el.style.position = "fixed";
      el.style.left = "-9999px";
      document.body.appendChild(el);
      el.select();
      document.execCommand("copy");
      document.body.removeChild(el);
    }
    setCopied(true);
    window.setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="space-y-2">
      {label ? <p className="text-sm font-medium">{label}</p> : null}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
        <input
          readOnly
          value={url}
          onFocus={(e) => e.currentTarget.select()}
          className="w-full min-w-0 flex-1 rounded-md border bg-muted px-3 py-2 font-mono text-xs"
        />
        <Button type="button" size="sm" variant="outline" onClick={copy} className="shrink-0">
          {copied ? "Kopyalandı" : "Kopyala"}
        </Button>
      </div>
      <a href={url} className="block break-all text-xs text-primary underline" target="_blank" rel="noreferrer">
        {url}
      </a>
    </div>
  );
}
