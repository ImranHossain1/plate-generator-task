import { createContext } from "react";

export const LocaleCtx = createContext({
  locale: "en",
  setLocale: () => {},
});
