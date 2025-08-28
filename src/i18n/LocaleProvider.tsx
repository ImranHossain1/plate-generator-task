import React, { useEffect, useMemo, useState } from "react";
import { IntlProvider } from "react-intl";
import { LocaleCtx } from "./LocaleContext";
import en from "./en.json";
import de from "./de.json";

export type Locale = "en" | "de";

type Messages = Record<string, string>;
const MESSAGES: Record<Locale, Messages> = {
  en: en as Messages,
  de: de as Messages,
};

function getInitialLocale(): Locale {
  const saved = localStorage.getItem("locale");
  if (saved === "de" || saved === "en") return saved;
  return navigator.language?.startsWith("de") ? "de" : "en";
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
