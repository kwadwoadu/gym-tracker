"use client";

import { useState, useMemo } from "react";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import { Input } from "@/components/ui/input";
import {
  MEASUREMENT_SITES,
  type MeasurementSiteKey,
  type BodyMeasurement,
} from "@/lib/body-composition/types";

interface MeasurementFormProps {
  open: boolean;
  onClose: () => void;
  onSave: (measurements: Partial<Record<MeasurementSiteKey, number>>) => void;
  previous?: BodyMeasurement | null;
  unit: "cm" | "in";
}

export function MeasurementForm({
  open,
  onClose,
  onSave,
  previous,
  unit,
}: MeasurementFormProps) {
  const [values, setValues] = useState<Record<string, string>>(() => {
    const init: Record<string, string> = {};
    for (const site of MEASUREMENT_SITES) {
      const prev = previous?.[site.key as keyof BodyMeasurement];
      init[site.key] = typeof prev === "number" ? prev.toString() : "";
    }
    return init;
  });

  const grouped = useMemo(() => {
    const groups: Record<string, typeof MEASUREMENT_SITES[number][]> = {};
    for (const site of MEASUREMENT_SITES) {
      if (!groups[site.group]) groups[site.group] = [];
      groups[site.group].push(site);
    }
    return groups;
  }, []);

  const handleSave = () => {
    const measurements: Partial<Record<MeasurementSiteKey, number>> = {};
    for (const site of MEASUREMENT_SITES) {
      const val = parseFloat(values[site.key]);
      if (!isNaN(val) && val > 0) {
        measurements[site.key] = val;
      }
    }
    if (Object.keys(measurements).length === 0) return;
    onSave(measurements);
    onClose();
  };

  return (
    <Drawer open={open} onOpenChange={(o) => !o && onClose()}>
      <DrawerContent className="bg-background border-border max-h-[85vh]">
        <div className="overflow-y-auto px-4 pb-8">
          <DrawerHeader className="px-0">
            <DrawerTitle className="text-white text-left">
              Update Measurements ({unit})
            </DrawerTitle>
          </DrawerHeader>

          <div className="space-y-6">
            {Object.entries(grouped).map(([group, sites]) => (
              <div key={group}>
                <h3 className="text-xs font-semibold text-white/40 uppercase tracking-[0.08em] mb-3">
                  {group}
                </h3>
                <div className="space-y-2">
                  {sites.map((site) => (
                    <div
                      key={site.key}
                      className="flex items-center gap-3 bg-card rounded-xl p-3"
                    >
                      <span className="text-sm text-white/70 w-20 shrink-0">
                        {site.label}
                      </span>
                      <Input
                        type="number"
                        inputMode="decimal"
                        step="0.1"
                        value={values[site.key]}
                        onChange={(e) =>
                          setValues((v) => ({
                            ...v,
                            [site.key]: e.target.value,
                          }))
                        }
                        placeholder="--"
                        className="bg-secondary border-none text-white text-right h-10"
                      />
                      <span className="text-xs text-white/30 w-6">{unit}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <button
            onClick={handleSave}
            className="w-full mt-6 h-14 rounded-xl bg-primary text-black font-semibold text-lg active:scale-[0.98] transition-transform"
          >
            Save Measurements
          </button>
        </div>
      </DrawerContent>
    </Drawer>
  );
}
