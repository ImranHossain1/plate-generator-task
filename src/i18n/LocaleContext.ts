import React from "react";
import { Locale } from "../utils/types";

export const LocaleCtx = React.createContext<{
  locale: Locale;
  setLocale: React.Dispatch<React.SetStateAction<Locale>>;
}>({ locale: "en", setLocale: () => {} });
