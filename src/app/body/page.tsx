"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Plus,
  TrendingUp,
  TrendingDown,
  Minus,
  Scale,
  Ruler,
  Percent,
} from "lucide-react";
import db, { generateId, getToday } from "@/lib/db";
import type {
  WeightEntry,
  BodyMeasurement,
  BodyFatEntry,
} from "@/lib/db";
import {
  calculateWeeklyRate,
  getWeightTrend,
  kgToLbs,
  lbsToKg,
} from "@/lib/body-composition/weight-analysis";
import {
  MEASUREMENT_SITES,
  type MeasurementSiteKey,
} from "@/lib/body-composition/types";
import { WeightChart, type Period } from "@/components/body-composition/WeightChart";
import { WeightInput } from "@/components/body-composition/WeightInput";
import { MeasurementForm } from "@/components/body-composition/MeasurementForm";
import { BodyFatCalculator } from "@/components/body-composition/BodyFatCalculator";

const TABS = [
  { key: "weight", label: "Weight", icon: Scale },
  { key: "measurements", label: "Measure", icon: Ruler },
  { key: "bodyfat", label: "Body Fat", icon: Percent },
] as const;

const PERIODS: { key: Period; label: string }[] = [
  { key: "1w", label: "1W" },
  { key: "1m", label: "1M" },
  { key: "3m", label: "3M" },
  { key: "6m", label: "6M" },
  { key: "1y", label: "1Y" },
  { key: "all", label: "All" },
];

type TabKey = (typeof TABS)[number]["key"];

export default function BodyPage() {
  const router = useRouter();
  const [tab, setTab] = useState<TabKey>("weight");
  const [period, setPeriod] = useState<Period>("1m");
  const [unit, setUnit] = useState<"kg" | "lbs">("kg");
  const [showWeightInput, setShowWeightInput] = useState(false);
  const [showMeasurementForm, setShowMeasurementForm] = useState(false);
  const [showBodyFatCalc, setShowBodyFatCalc] = useState(false);
  const [weightEntries, setWeightEntries] = useState<WeightEntry[]>([]);
  const [bodyMeasurements, setBodyMeasurements] = useState<BodyMeasurement[]>([]);
  const [bodyFatEntries, setBodyFatEntries] = useState<BodyFatEntry[]>([]);

  const loadData = useCallback(async () => {
    const [weights, measurements, fatEntries, settings] = await Promise.all([
      db.weightEntries.orderBy("date").toArray(),
      db.bodyMeasurements.orderBy("date").reverse().toArray(),
      db.bodyFatEntries.orderBy("date").reverse().toArray(),
      db.userSettings.get("user-settings"),
    ]);
    setWeightEntries(weights);
    setBodyMeasurements(measurements);
    setBodyFatEntries(fatEntries);
    if (settings?.weightUnit) setUnit(settings.weightUnit);
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const latestWeight = useMemo(() => {
    if (!weightEntries?.length) return null;
    const sorted = [...weightEntries].sort((a, b) =>
      b.date.localeCompare(a.date)
    );
    return sorted[0];
  }, [weightEntries]);

  const weeklyRate = useMemo(() => {
    if (!weightEntries?.length) return null;
    return calculateWeeklyRate(weightEntries);
  }, [weightEntries]);

  const trend = getWeightTrend(weeklyRate);

  const displayWeight = useCallback(
    (kg: number) => (unit === "lbs" ? kgToLbs(kg) : kg),
    [unit]
  );

  // Save weight
  const handleSaveWeight = async (value: number) => {
    const weightKg = unit === "lbs" ? lbsToKg(value) : value;
    const today = getToday();

    // Check for existing entry today - replace it
    const existing = await db.weightEntries.where("date").equals(today).first();
    if (existing) {
      await db.weightEntries.update(existing.id, {
        weight: weightKg,
        unit,
        createdAt: new Date().toISOString(),
      });
    } else {
      await db.weightEntries.add({
        id: generateId(),
        date: today,
        weight: weightKg,
        unit,
        createdAt: new Date().toISOString(),
      });
    }
    loadData();
  };

  // Save measurements
  const handleSaveMeasurements = async (
    measurements: Partial<Record<MeasurementSiteKey, number>>
  ) => {
    await db.bodyMeasurements.add({
      id: generateId(),
      date: getToday(),
      ...measurements,
      unit: "cm",
      createdAt: new Date().toISOString(),
    } as BodyMeasurement);
    loadData();
  };

  // Save body fat
  const handleSaveBodyFat = async (percentage: number) => {
    await db.bodyFatEntries.add({
      id: generateId(),
      date: getToday(),
      percentage,
      method: "navy",
      createdAt: new Date().toISOString(),
    });
    loadData();
  };

  const latestMeasurement = bodyMeasurements?.[0] || null;
  const previousMeasurement = bodyMeasurements?.[1] || null;

  return (
    <div className="min-h-screen bg-[#0A0A0A] pb-24">
      {/* Header */}
      <header className="flex items-center justify-between px-4 pt-safe-top pb-3">
        <div className="flex items-center gap-3">
          <button onClick={() => router.back()} className="p-2 -ml-2">
            <ArrowLeft className="w-6 h-6 text-white/60" />
          </button>
          <h1 className="text-lg font-bold text-white">Body</h1>
        </div>
        <button
          onClick={() => setUnit(unit === "kg" ? "lbs" : "kg")}
          className="px-3 py-1.5 rounded-full text-xs font-medium bg-[#1A1A1A] text-white/50"
        >
          {unit.toUpperCase()}
        </button>
      </header>

      {/* Tabs */}
      <div className="px-4 pb-4">
        <div className="flex gap-1 bg-[#1A1A1A] rounded-xl p-1">
          {TABS.map((t) => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-lg text-xs font-medium transition-all ${
                tab === t.key
                  ? "bg-[#CDFF00] text-black"
                  : "text-white/40"
              }`}
            >
              <t.icon className="w-3.5 h-3.5" />
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* Weight Tab */}
      {tab === "weight" && (
        <div className="px-4 space-y-4">
          {/* Current Weight + Trend */}
          <div className="bg-[#1A1A1A] rounded-xl p-4">
            <div className="flex items-center justify-between mb-1">
              <p className="text-xs text-white/40">Current Weight</p>
              {weeklyRate !== null && (
                <div className="flex items-center gap-1">
                  {trend === "losing" && (
                    <TrendingDown className="w-3.5 h-3.5 text-[#22C55E]" />
                  )}
                  {trend === "gaining" && (
                    <TrendingUp className="w-3.5 h-3.5 text-[#F59E0B]" />
                  )}
                  {trend === "maintaining" && (
                    <Minus className="w-3.5 h-3.5 text-white/40" />
                  )}
                  <span
                    className={`text-xs font-medium ${
                      trend === "losing"
                        ? "text-[#22C55E]"
                        : trend === "gaining"
                        ? "text-[#F59E0B]"
                        : "text-white/40"
                    }`}
                  >
                    {weeklyRate > 0 ? "+" : ""}
                    {displayWeight(weeklyRate)}/wk
                  </span>
                </div>
              )}
            </div>
            <p className="text-3xl font-bold text-white">
              {latestWeight
                ? `${displayWeight(latestWeight.weight)} ${unit}`
                : "--"}
            </p>
          </div>

          {/* Period Selector */}
          <div className="flex gap-1.5">
            {PERIODS.map((p) => (
              <button
                key={p.key}
                onClick={() => setPeriod(p.key)}
                className={`flex-1 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  period === p.key
                    ? "bg-[#CDFF00] text-black"
                    : "bg-[#1A1A1A] text-white/40"
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>

          {/* Chart */}
          <div className="bg-[#1A1A1A] rounded-xl p-3">
            <WeightChart
              entries={
                (weightEntries || []).map((e) => ({
                  ...e,
                  weight: unit === "lbs" ? kgToLbs(e.weight) : e.weight,
                })) as import("@/lib/body-composition/types").WeightEntry[]
              }
              period={period}
            />
          </div>

          {/* Recent Entries */}
          {weightEntries && weightEntries.length > 0 && (
            <div>
              <h3 className="text-xs font-semibold text-white/40 uppercase tracking-[0.08em] mb-2">
                Recent Entries
              </h3>
              <div className="space-y-1">
                {[...weightEntries]
                  .sort((a, b) => b.date.localeCompare(a.date))
                  .slice(0, 7)
                  .map((entry, i, arr) => {
                    const prev = arr[i + 1];
                    const delta = prev
                      ? Math.round(
                          (displayWeight(entry.weight) -
                            displayWeight(prev.weight)) *
                            10
                        ) / 10
                      : null;
                    return (
                      <div
                        key={entry.id}
                        className="flex items-center justify-between bg-[#1A1A1A] rounded-lg px-4 py-3"
                      >
                        <span className="text-sm text-white/60">
                          {new Date(entry.date).toLocaleDateString("en", {
                            month: "short",
                            day: "numeric",
                          })}
                        </span>
                        <div className="flex items-center gap-3">
                          <span className="text-sm font-medium text-white">
                            {displayWeight(entry.weight)} {unit}
                          </span>
                          {delta !== null && (
                            <span
                              className={`text-xs ${
                                delta > 0
                                  ? "text-[#F59E0B]"
                                  : delta < 0
                                  ? "text-[#22C55E]"
                                  : "text-white/30"
                              }`}
                            >
                              {delta > 0 ? "+" : ""}
                              {delta}
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Measurements Tab */}
      {tab === "measurements" && (
        <div className="px-4 space-y-4">
          {latestMeasurement && (
            <p className="text-xs text-white/30">
              Last updated:{" "}
              {new Date(latestMeasurement.date).toLocaleDateString("en", {
                month: "short",
                day: "numeric",
                year: "numeric",
              })}
            </p>
          )}

          {!latestMeasurement ? (
            <div className="text-center py-12">
              <Ruler className="w-8 h-8 text-white/20 mx-auto mb-3" />
              <p className="text-sm text-white/40 mb-4">
                No measurements yet
              </p>
              <button
                onClick={() => setShowMeasurementForm(true)}
                className="px-6 py-3 rounded-xl bg-[#CDFF00] text-black font-semibold active:scale-[0.98] transition-transform"
              >
                Add First Measurement
              </button>
            </div>
          ) : (
            <>
              {(() => {
                const groups: Record<
                  string,
                  typeof MEASUREMENT_SITES[number][]
                > = {};
                for (const site of MEASUREMENT_SITES) {
                  if (!groups[site.group]) groups[site.group] = [];
                  groups[site.group].push(site);
                }
                return Object.entries(groups).map(([group, sites]) => {
                  const hasSiteData = sites.some((s) => {
                    const val =
                      latestMeasurement[
                        s.key as keyof BodyMeasurement
                      ];
                    return typeof val === "number";
                  });
                  if (!hasSiteData) return null;
                  return (
                    <div key={group}>
                      <h3 className="text-xs font-semibold text-white/40 uppercase tracking-[0.08em] mb-2">
                        {group}
                      </h3>
                      <div className="grid grid-cols-3 gap-2">
                        {sites.map((site) => {
                          const val =
                            latestMeasurement[
                              site.key as keyof BodyMeasurement
                            ];
                          if (typeof val !== "number") return null;
                          const prevVal = previousMeasurement
                            ? (previousMeasurement[
                                site.key as keyof BodyMeasurement
                              ] as number | undefined)
                            : undefined;
                          const delta =
                            typeof prevVal === "number"
                              ? Math.round((val - prevVal) * 10) / 10
                              : null;
                          return (
                            <div
                              key={site.key}
                              className="bg-[#1A1A1A] rounded-xl p-3"
                            >
                              <p className="text-[11px] text-white/40 mb-1">
                                {site.label}
                              </p>
                              <p className="text-lg font-bold text-white">
                                {val}
                              </p>
                              <div className="flex items-center gap-1 mt-0.5">
                                <span className="text-[10px] text-white/30">
                                  cm
                                </span>
                                {delta !== null && (
                                  <span
                                    className={`text-[10px] font-medium ${
                                      delta > 0
                                        ? "text-[#22C55E]"
                                        : delta < 0
                                        ? "text-[#EF4444]"
                                        : "text-white/30"
                                    }`}
                                  >
                                    {delta > 0 ? "+" : ""}
                                    {delta}
                                  </span>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                });
              })()}
            </>
          )}
        </div>
      )}

      {/* Body Fat Tab */}
      {tab === "bodyfat" && (
        <div className="px-4 space-y-4">
          {bodyFatEntries && bodyFatEntries.length > 0 ? (
            <>
              <div className="bg-[#1A1A1A] rounded-xl p-5 text-center">
                <p className="text-xs text-white/40 mb-1">Latest Estimate</p>
                <p className="text-4xl font-bold text-white">
                  {bodyFatEntries[0].percentage}%
                </p>
                <p className="text-xs text-white/30 mt-1">
                  {new Date(bodyFatEntries[0].date).toLocaleDateString("en", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })}{" "}
                  - Navy Method
                </p>
              </div>

              {bodyFatEntries.length > 1 && (
                <div>
                  <h3 className="text-xs font-semibold text-white/40 uppercase tracking-[0.08em] mb-2">
                    History
                  </h3>
                  <div className="space-y-1">
                    {bodyFatEntries.slice(0, 10).map((entry, i, arr) => {
                      const prev = arr[i + 1];
                      const delta = prev
                        ? Math.round(
                            (entry.percentage - prev.percentage) * 10
                          ) / 10
                        : null;
                      return (
                        <div
                          key={entry.id}
                          className="flex items-center justify-between bg-[#1A1A1A] rounded-lg px-4 py-3"
                        >
                          <span className="text-sm text-white/60">
                            {new Date(entry.date).toLocaleDateString("en", {
                              month: "short",
                              day: "numeric",
                            })}
                          </span>
                          <div className="flex items-center gap-3">
                            <span className="text-sm font-medium text-white">
                              {entry.percentage}%
                            </span>
                            {delta !== null && (
                              <span
                                className={`text-xs ${
                                  delta < 0
                                    ? "text-[#22C55E]"
                                    : delta > 0
                                    ? "text-[#EF4444]"
                                    : "text-white/30"
                                }`}
                              >
                                {delta > 0 ? "+" : ""}
                                {delta}%
                              </span>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-12">
              <Percent className="w-8 h-8 text-white/20 mx-auto mb-3" />
              <p className="text-sm text-white/40 mb-4">
                No body fat data yet
              </p>
              <button
                onClick={() => setShowBodyFatCalc(true)}
                className="px-6 py-3 rounded-xl bg-[#CDFF00] text-black font-semibold active:scale-[0.98] transition-transform"
              >
                Calculate Body Fat
              </button>
            </div>
          )}
        </div>
      )}

      {/* FAB */}
      <button
        onClick={() => {
          if (tab === "weight") setShowWeightInput(true);
          else if (tab === "measurements") setShowMeasurementForm(true);
          else setShowBodyFatCalc(true);
        }}
        className="fixed bottom-24 right-4 w-14 h-14 rounded-full bg-[#CDFF00] text-black flex items-center justify-center shadow-lg active:scale-95 transition-transform z-30"
      >
        <Plus className="w-6 h-6" />
      </button>

      {/* Drawers */}
      <WeightInput
        open={showWeightInput}
        onClose={() => setShowWeightInput(false)}
        onSave={handleSaveWeight}
        lastWeight={
          latestWeight ? displayWeight(latestWeight.weight) : undefined
        }
        unit={unit}
      />
      <MeasurementForm
        open={showMeasurementForm}
        onClose={() => setShowMeasurementForm(false)}
        onSave={handleSaveMeasurements}
        previous={latestMeasurement}
        unit="cm"
      />
      <BodyFatCalculator
        open={showBodyFatCalc}
        onClose={() => setShowBodyFatCalc(false)}
        onSave={handleSaveBodyFat}
      />
    </div>
  );
}
