"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useLang } from "./Providers";
import type { Lang } from "@/lib/detection/types";

const LANGUAGES: Array<{ value: Lang; label: string }> = [
  { value: "en", label: "EN" },
  { value: "ms", label: "BM" },
];

export function Header() {
  const { t, lang, setLang } = useLang();
  const pathname = usePathname();

  const links = [
    { href: "/", label: t.navAnalyze },
    { href: "/about", label: t.navAbout },
  ];

  return (
    <header className="sticky top-0 z-40 border-b border-line/70 bg-void/80 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-3 px-4 sm:px-6">
        <Link href="/" className="flex items-center gap-2.5 rounded-lg">
          <span className="grid h-9 w-9 place-items-center rounded-xl border border-signal/30 bg-signal/10 text-lg leading-none">
            <span aria-hidden>🦀</span>
          </span>
          <span className="leading-tight">
            <span className="block text-sm font-semibold tracking-tight text-chalk">{t.brand}</span>
            <span className="hidden text-[11px] text-mist-2 sm:block">{t.tagline}</span>
          </span>
        </Link>

        <nav className="flex items-center gap-1" aria-label="Main">
          {links.map((link) => {
            const active = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`rounded-lg px-3 py-2 text-[13px] font-medium transition-colors ${
                  active ? "bg-panel-2 text-chalk" : "text-mist hover:bg-panel hover:text-chalk"
                }`}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>

        <div
          className="flex items-center gap-0.5 rounded-lg border border-line bg-panel p-0.5"
          role="group"
          aria-label={t.langLabel}
        >
          {LANGUAGES.map((option) => {
            const active = lang === option.value;
            return (
              <button
                key={option.value}
                type="button"
                onClick={() => setLang(option.value)}
                aria-pressed={active}
                className={`rounded-md px-2.5 py-1 text-[11px] font-semibold tracking-wide transition-colors ${
                  active ? "bg-signal text-void" : "text-mist hover:text-chalk"
                }`}
              >
                {option.label}
              </button>
            );
          })}
        </div>
      </div>
    </header>
  );
}
