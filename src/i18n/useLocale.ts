import { useContext } from "react";
import { LocaleCtx } from "./LocaleContext";

export function useLocale() {
  return useContext(LocaleCtx);
}
