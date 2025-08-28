import { motion as Motion, AnimatePresence } from "framer-motion";
import PlateRow from "./PlateRow";
import type { Plate } from "@/constants/plates";

type Unit = "cm" | "inch";

type PlatesListProps = {
  plates: (Plate & { status?: "removing" | "idle" })[],
  recentlyAdded?: string | null,
  activeId: string | null,
  setActiveId: (id: string | null) => void,
  updatePlate: (id: string, patch: Partial<Pick<Plate, "w" | "h">>) => void,
  removePlate: (id: string) => void,
  unit: Unit,
};

export default function PlatesList({
  plates,
  recentlyAdded = null,
  activeId,
  setActiveId,
  updatePlate,
  removePlate,
  unit,
}: PlatesListProps) {
  return (
    <div className="mt-3 space-y-5">
      <AnimatePresence>
        {plates.map((p, i) => (
          <Motion.div
            key={p.id}
            layout
            initial={
              p.id === recentlyAdded
                ? { opacity: 0, scale: 0.8, y: -10 }
                : false
            }
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={
              p.status === "removing"
                ? { opacity: 0, scale: 0.8, y: -10 }
                : { opacity: 0 }
            }
            transition={{ duration: 0.4 }}
          >
            <PlateRow
              plate={p}
              index={i}
              isActive={p.id === activeId}
              onSelect={() => setActiveId(p.id)}
              onChange={(patch) => updatePlate(p.id, patch)}
              onRemove={() => removePlate(p.id)}
              canRemove={plates.length > 1}
              unit={unit}
            />
          </Motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
