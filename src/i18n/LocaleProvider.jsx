import { useEffect, useMemo, useState } from "react";
import { IntlProvider } from "react-intl";
import { LocaleCtx } from "./LocaleContext";
import en from "./en.json";
import de from "./de.json";

const MESSAGES = { en, de };

export function LocaleProvider({ children }) {
  const [locale, setLocale] = useState(
    () =>
      localStorage.getItem("locale") ||
      (navigator.language?.startsWith("de") ? "de" : "en")
  );

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
