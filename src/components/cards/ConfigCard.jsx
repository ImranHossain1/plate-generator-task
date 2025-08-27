import Card from "../ui/Card.jsx";
import MotifInput from "../plates/MotifInput.jsx";
import PlatesList from "../plates/PlatesList.jsx";
import PlatesActions from "../plates/PlatesActions.jsx";

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
}) {
  return (
    <Card title="Configuration">
      <MotifInput motifUrl={motifUrl} setCfg={setCfg} />

      <div className="mt-5">
        <div className="flex items-end justify-between">
          <h3 className="text-base font-medium">Maße. Eingaben</h3>
          <div className="text-xs text-slate-500">
            Total width: <b>{totalWidth.toFixed(2)}</b> cm · Max height:{" "}
            <b>{maxHeight.toFixed(2)}</b> cm
          </div>
        </div>

        <PlatesList
          plates={plates}
          recentlyAdded={recentlyAdded}
          activeId={activeId}
          setActiveId={setActiveId}
          updatePlate={updatePlate}
          removePlate={removePlate}
        />

        <PlatesActions
          plates={plates}
          addPlate={addPlate}
          resetToDefaults={resetToDefaults}
        />
      </div>
    </Card>
  );
}
