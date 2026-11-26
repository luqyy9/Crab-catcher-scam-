"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { dict, type Dict } from "@/lib/i18n";
import type { Lang } from "@/lib/detection/types";

const LANG_KEY = "crabcatcher.lang";

interface LangContextValue {
  lang: Lang;
  setLang: (lang: Lang) => void;
  t: Dict;
}

const LangContext = createContext<LangContextValue | null>(null);

export function Providers({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>("en");

  useEffect(() => {
    try {
      const stored = window.localStorage.getItem(LANG_KEY);
      if (stored === "en" || stored === "ms") {
        setLangState(stored);
        document.documentElement.lang = stored === "ms" ? "ms" : "en";
      }
    } catch {
      // localStorage can be blocked; English is a safe default.
    }
  }, []);

  const setLang = useCallback((next: Lang) => {
    setLangState(next);
    document.documentElement.lang = next === "ms" ? "ms" : "en";
    try {
      window.localStorage.setItem(LANG_KEY, next);
    } catch {
      // ignore
    }
  }, []);

  const value = useMemo<LangContextValue>(
    () => ({ lang, setLang, t: dict(lang) }),
    [lang, setLang],
  );

  return <LangContext.Provider value={value}>{children}</LangContext.Provider>;
}

export function useLang(): LangContextValue {
  const context = useContext(LangContext);
  if (!context) {
    throw new Error("useLang must be used inside <Providers>");
  }
  return context;
}
