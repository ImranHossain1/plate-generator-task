import { NavLink } from "react-router-dom";
import { useIntl } from "react-intl";
import { useLocale } from "../../i18n";
import AppToggle from "../../components/common/AppToggle";
import { Locale } from "../../utils/types";

export default function Navbar() {
  const { locale, setLocale } = useLocale();
  const intl = useIntl();

  return (
    <header className="w-full border-b bg-background/70 backdrop-blur">
      <div className="container mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
        <NavLink
          to="/"
          className="text-base font-semibold tracking-tight text-foreground hover:opacity-90"
        >
          {intl.formatMessage({ id: "app.title" })}
        </NavLink>

        <AppToggle<Locale>
          value={locale}
          onChange={setLocale}
          ariaLabel={intl.formatMessage({ id: "nav.lang.ariaLabel" })}
          options={[
            { value: "en", label: intl.formatMessage({ id: "nav.lang.en" }) },
            { value: "de", label: intl.formatMessage({ id: "nav.lang.de" }) },
          ]}
          className="rounded-md border"
        />
      </div>
    </header>
  );
}
