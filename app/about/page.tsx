"use client";

import { Header } from "@/components/Header";
import { useLang } from "@/components/Providers";

export default function AboutPage() {
  const { t } = useLang();

  return (
    <>
      <Header />
      <main className="mx-auto w-full max-w-3xl px-4 pb-16 pt-10 sm:px-6 sm:pt-14">
        <h1 className="text-3xl font-semibold tracking-tight text-chalk">{t.aboutTitle}</h1>
        <p className="mt-4 text-[14px] leading-7 text-mist">{t.aboutIntro}</p>

        <ol className="mt-8 space-y-3">
          {t.aboutSteps.map((step) => (
            <li key={step.title} className="panel p-4">
              <h2 className="text-[13px] font-semibold text-signal">{step.title}</h2>
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
              <li key={item} className="flex gap-2.5 text-[13px] leading-6 text-chalk/85">
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
      </main>
    </>
  );
}
