import { Transition } from "@headlessui/react";
import PlateRow from "./PlateRow";
import { PlatesListProps } from "../../../utils/types";

export default function PlatesList({
  plates,
  activeId,
  setActiveId,
  updatePlate,
  removePlate,
  unit,
  dismissErrorsKey,
}: PlatesListProps) {
  return (
    <div className="mt-3 space-y-5">
      {plates.map((p, i) => (
        <Transition
          key={p.id}
          appear
          show={p.status !== "removing"}
          enter="transition duration-300 ease-out"
          enterFrom="opacity-0 scale-95 -translate-y-2"
          enterTo="opacity-100 scale-100 translate-y-0"
          leave="transition duration-200 ease-in"
          leaveFrom="opacity-100 scale-100 translate-y-0"
          leaveTo="opacity-0 scale-95 -translate-y-2"
        >
          <div>
            <PlateRow
              plate={p}
              index={i}
              isActive={p.id === activeId}
              onSelect={() => setActiveId(p.id)}
              onChange={(patch) => updatePlate(p.id, patch)}
              onRemove={() => removePlate(p.id)}
              canRemove={plates.length > 1}
              unit={unit}
              dismissErrorsKey={dismissErrorsKey}
            />
          </div>
        </Transition>
      ))}
    </div>
  );
}
