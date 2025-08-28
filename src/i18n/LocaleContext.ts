import React from "react";
import type { Locale } from "./LocaleProvider";

export const LocaleCtx = React.createContext<{
  locale: Locale;
  setLocale: React.Dispatch<React.SetStateAction<Locale>>;
}>({ locale: "en", setLocale: () => {} });
