'use client';

import { useState, useMemo } from 'react';
import { format, subDays, parseISO } from 'date-fns';
import { Loader2, Trash2, TrendingUp, TrendingDown, Minus, Scale, Activity, Calendar, Target } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useWeightLogs, useCreateWeightLog, useDeleteWeightLog, useNutritionProfile } from '@/lib/queries';
import { cn } from '@/lib/utils';

export default function WeightTrackingPage() {
  const [date, setDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [weight, setWeight] = useState('');
  const [notes, setNotes] = useState('');

  const { data: weightData, isLoading } = useWeightLogs(90);
  const { data: profile } = useNutritionProfile();
  const createLog = useCreateWeightLog();
  const deleteLog = useDeleteWeightLog();

  const logs = useMemo(() => weightData?.logs ?? [], [weightData?.logs]);
  const trend = weightData?.trend ?? {
    current: null,
    sevenDayAvg: null,
    fourteenDayAvg: null,
    thirtyDayAvg: null,
    weeklyChange: null,
  };

  // Calculate 7-day rolling average for chart data
  const chartData = useMemo(() => {
    if (logs.length === 0) return [];

    // Sort logs oldest-first for charting
    const sorted = [...logs].sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
    );

    return sorted.map((entry) => {
      const entryDate = new Date(entry.date);
      const windowStart = subDays(entryDate, 6);

      // Get all entries within the 7-day window
      const windowEntries = sorted.filter((e) => {
        const d = new Date(e.date);
        return d >= windowStart && d <= entryDate;
      });

      const rollingAvg =
        windowEntries.length > 0
          ? windowEntries.reduce((sum, e) => sum + e.weightKg, 0) / windowEntries.length
          : entry.weightKg;

      return {
        date: format(parseISO(entry.date), 'MMM d'),
        weight: entry.weightKg,
        avg: parseFloat(rollingAvg.toFixed(1)),
      };
    });
  }, [logs]);

  // Y-axis domain with +-2kg padding
  const yDomain = useMemo(() => {
    if (chartData.length === 0) return [70, 80];
    const allWeights = chartData.flatMap((d) => [d.weight, d.avg]);
    const min = Math.floor(Math.min(...allWeights) - 2);
    const max = Math.ceil(Math.max(...allWeights) + 2);
    return [min, max];
  }, [chartData]);

  // Recent entries (last 14, newest first)
  const recentEntries = useMemo(() => {
    return [...logs]
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 14);
  }, [logs]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!weight) return;

    createLog.mutate(
      {
        date,
        weightKg: parseFloat(weight),
        notes: notes || undefined,
        source: 'manual',
      },
      {
        onSuccess: () => {
          setWeight('');
          setNotes('');
          setDate(format(new Date(), 'yyyy-MM-dd'));
        },
      }
    );
  };

  const handleDelete = (id: string) => {
    deleteLog.mutate(id);
  };

  // Adjustment recommendation logic
  const recommendation = useMemo(() => {
    if (!profile || trend.weeklyChange === null) {
      return { type: 'info' as const, message: 'Log weight regularly for trend analysis' };
    }

    const weeklyChange = trend.weeklyChange;

    if (weeklyChange < profile.gainRateMinPerWeek) {
      return {
        type: 'warning' as const,
        message: `Weight gain is below target. Consider increasing calories by ${profile.calorieStepUp} kcal`,
      };
    }

    if (weeklyChange > profile.gainRateMaxPerWeek) {
      return {
        type: 'warning' as const,
        message: `Weight gain is above target. Consider decreasing calories by ${profile.calorieStepDown} kcal`,
      };
    }

    return {
      type: 'success' as const,
      message: `On track - gaining ${weeklyChange.toFixed(2)} kg/week`,
    };
  }, [profile, trend.weeklyChange]);

  if (isLoading) {
    return (
      <div className="max-w-lg mx-auto flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-[#CDFF00]" />
      </div>
    );
  }

  return (
    <div className="max-w-lg mx-auto space-y-6">
      {/* Weight Entry Form */}
      <motion.form
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        onSubmit={handleSubmit}
        className="bg-[#1A1A1A] rounded-xl p-4 border border-[#2A2A2A] space-y-4"
      >
        <h2 className="text-lg font-semibold text-white flex items-center gap-2">
          <Scale className="w-5 h-5 text-[#CDFF00]" />
          Log Weight
        </h2>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs text-[#A0A0A0] mb-1 block">Date</label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full h-11 px-3 rounded-lg bg-[#2A2A2A] border border-[#2A2A2A] text-white text-sm focus:outline-none focus:border-[#CDFF00] transition-colors"
            />
          </div>
          <div>
            <label className="text-xs text-[#A0A0A0] mb-1 block">Weight (kg)</label>
            <input
              type="number"
              step="0.1"
              min="30"
              max="300"
              value={weight}
              onChange={(e) => setWeight(e.target.value)}
              placeholder="80.5"
              className="w-full h-11 px-3 rounded-lg bg-[#2A2A2A] border border-[#2A2A2A] text-white text-sm focus:outline-none focus:border-[#CDFF00] transition-colors placeholder:text-[#666666]"
            />
          </div>
        </div>

        <div>
          <label className="text-xs text-[#A0A0A0] mb-1 block">Notes (optional)</label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="e.g. after breakfast, morning weigh-in"
            rows={2}
            className="w-full px-3 py-2 rounded-lg bg-[#2A2A2A] border border-[#2A2A2A] text-white text-sm focus:outline-none focus:border-[#CDFF00] transition-colors placeholder:text-[#666666] resize-none"
          />
        </div>

        <motion.button
          whileTap={{ scale: 0.97 }}
          type="submit"
          disabled={!weight || createLog.isPending}
          className={cn(
            'w-full h-12 rounded-xl font-semibold text-sm transition-colors',
            weight
              ? 'bg-[#CDFF00] text-[#0A0A0A] hover:bg-[#CDFF00]/90'
              : 'bg-[#2A2A2A] text-[#666666] cursor-not-allowed'
          )}
        >
          {createLog.isPending ? (
            <Loader2 className="w-5 h-5 animate-spin mx-auto" />
          ) : (
            'Log Weight'
          )}
        </motion.button>
      </motion.form>

      {/* Trend Summary Cards */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.05 }}
        className="grid grid-cols-2 gap-3"
      >
        <div className="bg-[#1A1A1A] rounded-xl p-4 border border-[#2A2A2A]">
          <div className="flex items-center gap-2 mb-2">
            <Scale className="w-4 h-4 text-[#A0A0A0]" />
            <span className="text-xs text-[#A0A0A0]">Current</span>
          </div>
          <p className="text-2xl font-bold text-white">
            {trend.current !== null ? `${trend.current.toFixed(1)}` : '--'}
          </p>
          <p className="text-xs text-[#666666] mt-1">kg</p>
        </div>

        <div className="bg-[#1A1A1A] rounded-xl p-4 border border-[#2A2A2A]">
          <div className="flex items-center gap-2 mb-2">
            <Activity className="w-4 h-4 text-[#A0A0A0]" />
            <span className="text-xs text-[#A0A0A0]">7-Day Avg</span>
          </div>
          <p className="text-2xl font-bold text-white">
            {trend.sevenDayAvg !== null ? `${trend.sevenDayAvg.toFixed(1)}` : '--'}
          </p>
          <p className="text-xs text-[#666666] mt-1">kg</p>
        </div>

        <div className="bg-[#1A1A1A] rounded-xl p-4 border border-[#2A2A2A]">
          <div className="flex items-center gap-2 mb-2">
            {trend.weeklyChange !== null && trend.weeklyChange > 0 ? (
              <TrendingUp className="w-4 h-4 text-green-500" />
            ) : trend.weeklyChange !== null && trend.weeklyChange < 0 ? (
              <TrendingDown className="w-4 h-4 text-red-500" />
            ) : (
              <Minus className="w-4 h-4 text-[#A0A0A0]" />
            )}
            <span className="text-xs text-[#A0A0A0]">Weekly Change</span>
          </div>
          <p
            className={cn(
              'text-2xl font-bold',
              trend.weeklyChange !== null && trend.weeklyChange > 0
                ? 'text-green-500'
                : trend.weeklyChange !== null && trend.weeklyChange < 0
                  ? 'text-red-500'
                  : 'text-white'
            )}
          >
            {trend.weeklyChange !== null
              ? `${trend.weeklyChange > 0 ? '+' : ''}${trend.weeklyChange.toFixed(2)}`
              : '--'}
          </p>
          <p className="text-xs text-[#666666] mt-1">kg/week</p>
        </div>

        <div className="bg-[#1A1A1A] rounded-xl p-4 border border-[#2A2A2A]">
          <div className="flex items-center gap-2 mb-2">
            <Target className="w-4 h-4 text-[#A0A0A0]" />
            <span className="text-xs text-[#A0A0A0]">30-Day Avg</span>
          </div>
          <p className="text-2xl font-bold text-white">
            {trend.thirtyDayAvg !== null ? `${trend.thirtyDayAvg.toFixed(1)}` : '--'}
          </p>
          <p className="text-xs text-[#666666] mt-1">kg</p>
        </div>
      </motion.div>

      {/* Weight Trend Chart */}
      {chartData.length > 1 && (
        <motion.section
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
          className="bg-[#1A1A1A] rounded-xl p-4 border border-[#2A2A2A]"
        >
          <h2 className="text-lg font-semibold text-white mb-4">Weight Trend</h2>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData} margin={{ top: 5, right: 5, left: -10, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#2A2A2A" />
                <XAxis
                  dataKey="date"
                  tick={{ fill: '#666666', fontSize: 11 }}
                  tickLine={{ stroke: '#2A2A2A' }}
                  axisLine={{ stroke: '#2A2A2A' }}
                  interval="preserveStartEnd"
                />
                <YAxis
                  domain={yDomain}
                  tick={{ fill: '#666666', fontSize: 11 }}
                  tickLine={{ stroke: '#2A2A2A' }}
                  axisLine={{ stroke: '#2A2A2A' }}
                  tickFormatter={(v: number) => `${v}`}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1A1A1A',
                    border: '1px solid #2A2A2A',
                    borderRadius: '8px',
                    color: '#FFFFFF',
                    fontSize: '13px',
                  }}
                  labelStyle={{ color: '#A0A0A0' }}
                  formatter={(value) => value != null ? `${Number(value).toFixed(1)} kg` : '-'}
                />
                <Line
                  type="monotone"
                  dataKey="weight"
                  stroke="#CDFF00"
                  strokeWidth={2}
                  dot={{ fill: '#CDFF00', r: 3, strokeWidth: 0 }}
                  activeDot={{ r: 5, fill: '#CDFF00' }}
                />
                <Line
                  type="monotone"
                  dataKey="avg"
                  stroke="#666666"
                  strokeWidth={1.5}
                  strokeDasharray="5 5"
                  dot={false}
                  activeDot={{ r: 4, fill: '#666666' }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
          <div className="flex items-center justify-center gap-6 mt-3 pt-3 border-t border-[#2A2A2A]">
            <div className="flex items-center gap-2">
              <div className="w-4 h-0.5 bg-[#CDFF00]" />
              <span className="text-xs text-[#A0A0A0]">Weight</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-0.5 bg-[#666666] border-dashed" style={{ borderTop: '1.5px dashed #666666', height: 0 }} />
              <span className="text-xs text-[#A0A0A0]">7-Day Avg</span>
            </div>
          </div>
        </motion.section>
      )}

      {/* Adjustment Recommendation Banner */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.15 }}
        className={cn(
          'rounded-xl p-4 border',
          recommendation.type === 'success'
            ? 'bg-green-500/10 border-green-500/20'
            : recommendation.type === 'warning'
              ? 'bg-yellow-500/10 border-yellow-500/20'
              : 'bg-[#1A1A1A] border-[#2A2A2A]'
        )}
      >
        <div className="flex items-start gap-3">
          <div
            className={cn(
              'w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5',
              recommendation.type === 'success'
                ? 'bg-green-500/20'
                : recommendation.type === 'warning'
                  ? 'bg-yellow-500/20'
                  : 'bg-[#2A2A2A]'
            )}
          >
            {recommendation.type === 'success' ? (
              <TrendingUp className="w-4 h-4 text-green-500" />
            ) : recommendation.type === 'warning' ? (
              <Activity className="w-4 h-4 text-yellow-500" />
            ) : (
              <Calendar className="w-4 h-4 text-[#A0A0A0]" />
            )}
          </div>
          <p
            className={cn(
              'text-sm leading-relaxed',
              recommendation.type === 'success'
                ? 'text-green-400'
                : recommendation.type === 'warning'
                  ? 'text-yellow-400'
                  : 'text-[#A0A0A0]'
            )}
          >
            {recommendation.message}
          </p>
        </div>
      </motion.div>

      {/* Recent Entries List */}
      <motion.section
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.2 }}
      >
        <h2 className="text-lg font-semibold text-white mb-3">Recent Entries</h2>
        {recentEntries.length === 0 ? (
          <div className="bg-[#1A1A1A] rounded-xl p-8 border border-[#2A2A2A] text-center">
            <Scale className="w-10 h-10 text-[#2A2A2A] mx-auto mb-3" />
            <p className="text-sm text-[#666666]">No entries yet. Log your first weight above.</p>
          </div>
        ) : (
          <div className="space-y-2">
            <AnimatePresence mode="popLayout">
              {recentEntries.map((entry) => (
                <motion.div
                  key={entry.id}
                  layout
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.2 }}
                  className="bg-[#1A1A1A] rounded-xl p-4 border border-[#2A2A2A] flex items-center justify-between"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3">
                      <span className="text-sm text-[#A0A0A0]">
                        {format(parseISO(entry.date), 'MMM d, yyyy')}
                      </span>
                      <span className="text-lg font-semibold text-white">
                        {entry.weightKg.toFixed(1)} kg
                      </span>
                    </div>
                    {entry.notes && (
                      <p className="text-xs text-[#666666] mt-1 truncate">{entry.notes}</p>
                    )}
                  </div>

                  <motion.button
                    whileTap={{ scale: 0.9 }}
                    onClick={() => handleDelete(entry.id)}
                    disabled={deleteLog.isPending}
                    className="w-11 h-11 rounded-lg flex items-center justify-center text-[#666666] hover:text-red-500 hover:bg-red-500/10 transition-colors flex-shrink-0 ml-3"
                  >
                    <Trash2 className="w-4 h-4" />
                  </motion.button>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </motion.section>
    </div>
  );
}
