export interface WeightEntry {
  id: string;
  date: string; // YYYY-MM-DD
  weight: number; // always stored in kg
  unit: "kg" | "lbs";
  createdAt: string;
}

export interface BodyMeasurement {
  id: string;
  date: string; // YYYY-MM-DD
  chest?: number; // cm
  shoulders?: number;
  waist?: number;
  hips?: number;
  neck?: number;
  leftBicep?: number;
  rightBicep?: number;
  leftThigh?: number;
  rightThigh?: number;
  leftCalf?: number;
  rightCalf?: number;
  unit: "cm" | "in";
  createdAt: string;
}

export interface BodyFatEntry {
  id: string;
  date: string;
  percentage: number;
  method: "navy" | "manual";
  createdAt: string;
}

export const MEASUREMENT_SITES = [
  { key: "chest", label: "Chest", group: "Upper Body" },
  { key: "shoulders", label: "Shoulders", group: "Upper Body" },
  { key: "neck", label: "Neck", group: "Upper Body" },
  { key: "leftBicep", label: "L Bicep", group: "Arms" },
  { key: "rightBicep", label: "R Bicep", group: "Arms" },
  { key: "waist", label: "Waist", group: "Midsection" },
  { key: "hips", label: "Hips", group: "Midsection" },
  { key: "leftThigh", label: "L Thigh", group: "Legs" },
  { key: "rightThigh", label: "R Thigh", group: "Legs" },
  { key: "leftCalf", label: "L Calf", group: "Legs" },
  { key: "rightCalf", label: "R Calf", group: "Legs" },
] as const;

export type MeasurementSiteKey = (typeof MEASUREMENT_SITES)[number]["key"];
