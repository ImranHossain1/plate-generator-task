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
  return (
    <Card title="Configuration">
      <MotifInput motifUrl={motifUrl} setCfg={setCfg} />

      <div className="mt-5">
        <div className="flex items-end justify-between">
          <h3 className="text-base font-medium">Maße. Eingaben</h3>
          <div className="flex justify-end mb-3">
            <ToggleButton
              value={unit}
              onChange={setUnit}
              options={[
                { value: "cm", label: "cm" },
                { value: "inch", label: "inch" },
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
