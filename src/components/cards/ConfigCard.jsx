import { useIntl, FormattedMessage } from "react-intl";
import Card from "../ui/Card.jsx";
import MotifInput from "../plates/MotifInput.jsx";
import PlatesList from "../plates/PlatesList.jsx";
import PlatesActions from "../plates/PlatesActions.jsx";
import ToggleButton from "../ui/ToggleButton.jsx";

export default function ConfigCard({
  plates,
  motifUrl,
  setCfg,
  totalWidth,
  maxHeight,
  recentlyAdded,
  activeId,
  setActiveId,
  updatePlate,
  removePlate,
  addPlate,
  resetToDefaults,
  unit,
  setUnit,
}) {
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
            <ToggleButton
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
