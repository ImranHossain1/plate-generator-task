import { NavLink } from "react-router-dom";
import { useIntl } from "react-intl";
import { useLocale } from "../../../i18n/useLocale.js";
import ToggleButton from "../../../components/ui/ToggleButton.jsx";

const Navbar = () => {
  const { locale, setLocale } = useLocale();
  const intl = useIntl();

  return (
    <header className="border-b bg-white/70 backdrop-blur">
      <div className="mx-auto max-w-6xl px-4 py-3 flex items-center justify-between">
        <NavLink to="/" className="font-semibold tracking-tight">
          {/* localized app title */}
          {intl.formatMessage({ id: "app.title" })}
        </NavLink>

        <div className="flex items-center gap-6">
          {/* language toggle */}
          <ToggleButton
            value={locale}
            onChange={(v) => setLocale(v)}
            options={[
              { value: "en", label: intl.formatMessage({ id: "nav.lang.en" }) },
              { value: "de", label: intl.formatMessage({ id: "nav.lang.de" }) },
            ]}
          />
        </div>
      </div>
    </header>
  );
};

export default Navbar;
