import { useIntl, FormattedMessage } from "react-intl";
import MotifInput from "../previewLayout/plateComponents/MotifInput";
import PlatesList from "./PlatesList";
import AppToggle from "../common/AppToggle";
import { ConfigCardProps, Unit } from "../../utils/types";
import PlatesActions from "./PlatesActions";

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
    <div>
      <MotifInput motifUrl={motifUrl} setCfg={setCfg} />

      <div className="flex items-center justify-between mt-5 mb-2">
        <h3 className="text-base font-medium">
          <FormattedMessage id="config.inputs" />
        </h3>

        <AppToggle<Unit>
          value={unit}
          onChange={setUnit}
          ariaLabel={intl.formatMessage({ id: "units.toggle" })}
          options={[
            { value: "cm", label: intl.formatMessage({ id: "units.cm" }) },
            { value: "inch", label: intl.formatMessage({ id: "units.inch" }) },
          ]}
        />
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
  );
}
