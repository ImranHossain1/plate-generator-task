import { useIntl, FormattedMessage } from "react-intl";
import Card from "../ui/Card";
import MotifInput from "../plates/MotifInput";
import PlatesList from "../plates/PlatesList";
import PlatesActions from "../plates/PlatesActions";
import ToggleButton from "../ui/ToggleButton";
import type { Plate, PlateConfig } from "@/constants/plates";

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
    <Card title={intl.formatMessage({ id: "config.title" })}>
      <MotifInput motifUrl={motifUrl} setCfg={setCfg} />

      <div className="mt-5">
        <div className="flex items-end justify-between">
          <h3 className="text-base font-medium">
            <FormattedMessage id="config.inputs" />
          </h3>

          <div className="flex justify-end mb-3">
            <ToggleButton<Unit>
              value={unit}
              onChange={setUnit}
              options={[
                { value: "cm", label: intl.formatMessage({ id: "units.cm" }) },
                {
                  value: "inch",
                  label: intl.formatMessage({ id: "units.inch" }),
                },
              ]}
            />
          </div>
        </div>

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
      </div>
    </Card>
  );
}
