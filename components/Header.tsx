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
  const activeIndex = Math.max(0, LANGUAGES.findIndex((option) => option.value === lang));

  const links = [
    { href: "/", label: t.navAnalyze },
    { href: "/about", label: t.navAbout },
  ];

  return (
    <header className="sticky top-0 z-40 border-b border-line/70 bg-void/80 backdrop-blur-xl">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="flex h-16 items-center justify-between gap-3">
          <Link href="/" className="group flex shrink-0 items-center gap-2.5 rounded-lg">
            <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl border border-signal/30 bg-signal/10 text-lg leading-none transition-all duration-300 group-hover:-rotate-12 group-hover:scale-105 group-hover:border-signal/60 group-hover:bg-signal/20">
              <span aria-hidden>🦀</span>
            </span>
            <span className="whitespace-nowrap leading-tight">
              <span className="block text-sm font-semibold tracking-tight text-chalk transition-colors group-hover:text-signal">
                {t.brand}
              </span>
              <span className="hidden text-[11px] text-mist-2 sm:block">{t.tagline}</span>
            </span>
          </Link>

          <nav className="hidden items-center gap-1 sm:flex" aria-label="Main">
            {links.map((link) => {
              const active = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`group relative whitespace-nowrap rounded-lg px-3 py-2 text-[13px] font-medium transition-colors ${
                    active ? "bg-panel-2 text-chalk" : "text-mist hover:bg-panel hover:text-chalk"
                  }`}
                >
                  <span className="relative z-10">{link.label}</span>
                  <span
                    aria-hidden
                    className={`absolute inset-x-3 bottom-1 h-px origin-left bg-signal transition-transform duration-300 ${
                      active ? "scale-x-100" : "scale-x-0 group-hover:scale-x-100"
                    }`}
                  />
                </Link>
              );
            })}
          </nav>

          <div
            className="relative flex shrink-0 rounded-lg border border-line bg-panel p-0.5"
            role="group"
            aria-label={t.langLabel}
          >
            <span
              aria-hidden
              className="absolute bottom-0.5 left-0.5 top-0.5 w-[calc(50%-2px)] rounded-md bg-signal shadow-[0_0_14px_-2px_rgba(246,183,60,0.7)] transition-transform duration-300 ease-out"
              style={{ transform: `translateX(${activeIndex * 100}%)` }}
            />
            {LANGUAGES.map((option) => {
              const active = lang === option.value;
              return (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => setLang(option.value)}
                  aria-pressed={active}
                  className={`relative z-10 w-11 rounded-md py-1 text-[11px] font-semibold tracking-wide transition-colors duration-200 ${
                    active ? "text-void" : "text-mist hover:text-chalk"
                  }`}
                >
                  {option.label}
                </button>
              );
            })}
          </div>
        </div>

        <nav className="flex gap-1 pb-2 sm:hidden" aria-label="Main">
          {links.map((link) => {
            const active = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`flex-1 rounded-lg border px-3 py-1.5 text-center text-[12px] font-medium transition-all duration-200 active:scale-[0.98] ${
                  active
                    ? "border-signal/40 bg-signal/10 text-signal"
                    : "border-line/70 bg-panel text-mist hover:border-line-2 hover:text-chalk"
                }`}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>
      </div>
    </header>
  );
}
