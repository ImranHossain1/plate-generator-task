import React, { useEffect, useMemo, useState } from "react";
import { IntlProvider } from "react-intl";
import { LocaleCtx } from "./LocaleContext";
import en from "./en.json";
import de from "./de.json";
import { Locale, Messages } from "../utils/types";

const MESSAGES: Record<Locale, Messages> = {
  en: en as Messages,
  de: de as Messages,
};

function getInitialLocale(): Locale {
  try {
    const saved = localStorage.getItem("locale");
    if (saved === "de" || saved === "en") return saved;
  } catch {
    // ignore storage errors, fall back to navigator
  }

  if (
    typeof navigator !== "undefined" &&
    navigator.language?.startsWith("de")
  ) {
    return "de";
  }
  return "en";
}

type LocaleProviderProps = {
  children: React.ReactNode;
};

export function LocaleProvider({ children }: LocaleProviderProps) {
  const [locale, setLocale] = useState<Locale>(getInitialLocale);

  useEffect(() => {
    localStorage.setItem("locale", locale);
    document.documentElement.lang = locale;
  }, [locale]);

  const value = useMemo(() => ({ locale, setLocale }), [locale]);

  return (
    <LocaleCtx.Provider value={value}>
      <IntlProvider
        locale={locale}
        messages={MESSAGES[locale]}
        defaultLocale="en"
      >
        {children}
      </IntlProvider>
    </LocaleCtx.Provider>
  );
}
