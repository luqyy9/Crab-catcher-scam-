"use client";

import Link from "next/link";
import { Header } from "@/components/Header";
import { useLang } from "@/components/Providers";

const STEP_ICONS = ["🧹", "🔗", "📊", "💡"];

export default function AboutPage() {
  const { t } = useLang();

  return (
    <>
      <Header />
      <main className="relative mx-auto w-full max-w-3xl px-4 pb-16 pt-10 sm:px-6 sm:pt-14">
        <div className="aurora -top-24 right-0 h-56 w-56 bg-signal/20" />
        <div
          className="aurora left-0 top-40 h-52 w-52 bg-danger/10"
          style={{ animationDelay: "-9s" }}
        />

        <h1 className="gradient-text text-3xl font-semibold tracking-tight sm:text-4xl">
          {t.aboutTitle}
        </h1>
        <p className="mt-4 text-[14px] leading-7 text-mist">{t.aboutIntro}</p>

        <ol className="stagger-children mt-8 grid gap-3 sm:grid-cols-2">
          {t.aboutSteps.map((step, index) => (
            <li key={step.title} className="card-hover panel p-4">
              <span className="grid h-8 w-8 place-items-center rounded-lg border border-line bg-panel-2 text-sm">
                <span aria-hidden>{STEP_ICONS[index] ?? "•"}</span>
              </span>
              <h2 className="mt-3 text-[13px] font-semibold text-signal">{step.title}</h2>
              <p className="mt-1.5 text-[13px] leading-6 text-mist">{step.body}</p>
            </li>
          ))}
        </ol>

        <section className="mt-10">
          <h2 className="text-[11px] font-semibold uppercase tracking-[0.16em] text-mist-2">
            {t.aboutLimitsTitle}
          </h2>
          <ul className="mt-3 space-y-2">
            {t.aboutLimits.map((item) => (
              <li
                key={item}
                className="flex gap-2.5 rounded-lg px-2 py-1 text-[13px] leading-6 text-chalk/85 transition-colors hover:bg-white/[0.025]"
              >
                <span className="mt-[9px] h-1 w-1 shrink-0 rounded-full bg-danger/70" />
                {item}
              </li>
            ))}
          </ul>
        </section>

        <section className="mt-10">
          <h2 className="text-[11px] font-semibold uppercase tracking-[0.16em] text-mist-2">
            {t.aboutPrivacyTitle}
          </h2>
          <p className="mt-3 text-[13px] leading-6 text-mist">{t.aboutPrivacy}</p>
        </section>

        <p className="mt-10 rounded-xl border border-line bg-panel p-4 text-[12px] leading-6 text-mist-2">
          {t.aboutDisclaimer}
        </p>

        <Link href="/" className="btn btn-primary btn-shine mt-8 w-full px-4 py-2.5 sm:w-auto">
          {t.aboutCta}
          <span aria-hidden>→</span>
        </Link>
      </main>
    </>
  );
}
