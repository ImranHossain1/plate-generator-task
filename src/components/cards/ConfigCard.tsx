import { useIntl, FormattedMessage } from "react-intl";
import { Plate, PlateConfig } from "../../constants/plates";
import MotifInput from "../plates/MotifInput";
import PlatesList from "../plates/PlatesList";
import PlatesActions from "../plates/PlatesActions";
import AppToggle from "../common/AppToggle";
import AppCard from "../common/AppCard";

type Unit = "cm" | "inch";

type ConfigCardProps = {
  plates: Plate[];
  motifUrl: string;
  setCfg: React.Dispatch<React.SetStateAction<PlateConfig>>;
  totalWidth: number; // in cm
  maxHeight: number; // in cm
  recentlyAdded?: string | null;
  activeId: string | null;
  setActiveId: (id: string | null) => void;
  updatePlate: (id: string, patch: Partial<Pick<Plate, "w" | "h">>) => void;
  removePlate: (id: string) => void;
  addPlate: () => void;
  resetToDefaults: () => void;
  unit: Unit;
  setUnit: (u: Unit) => void;
};

export default function ConfigCard({
  plates,
  motifUrl,
  setCfg,
  totalWidth,
  maxHeight,
  recentlyAdded = null,
  activeId,
  setActiveId,
  updatePlate,
  removePlate,
  addPlate,
  resetToDefaults,
  unit,
  setUnit,
}: ConfigCardProps) {
  const intl = useIntl();

  return (
    <AppCard
      title={intl.formatMessage({ id: "config.title" })}
      action={
        <AppToggle<Unit>
          value={unit}
          onChange={setUnit}
          ariaLabel={intl.formatMessage({ id: "units.toggle" })}
          options={[
            { value: "cm", label: intl.formatMessage({ id: "units.cm" }) },
            { value: "inch", label: intl.formatMessage({ id: "units.inch" }) },
          ]}
        />
      }
    >
      <MotifInput motifUrl={motifUrl} setCfg={setCfg} />

      <h3 className="mt-5 mb-2">
        <FormattedMessage id="config.inputs" />
      </h3>

      <PlatesList
        plates={plates}
        recentlyAdded={recentlyAdded}
        activeId={activeId}
        setActiveId={setActiveId}
        updatePlate={updatePlate}
        removePlate={removePlate}
        unit={unit}
      />

      <PlatesActions
        plates={plates}
        addPlate={addPlate}
        resetToDefaults={resetToDefaults}
        unit={unit}
        totalWidth={totalWidth}
        maxHeight={maxHeight}
      />
    </AppCard>
  );
}
