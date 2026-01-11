// Time Periods - Unified view combining meals + supplements by time of day
// Maps meal slots to supplement blocks for the merged log page

import { DayType } from './supplement-protocol';
import { MealSlot } from './meal-templates';

export interface TimePeriod {
  id: string;
  label: string;
  icon: string;
  timeRange: string;
  mealSlot: MealSlot;
  supplementBlocks: string[]; // Block IDs from supplement-protocol.ts
}

// Time periods vary by day type because supplement timing changes
// based on when you train (AM vs PM vs rest day)

const REST_DAY_PERIODS: TimePeriod[] = [
  {
    id: 'morning',
    label: 'Morning',
    icon: '☀️',
    timeRange: '5:00-8:00am',
    mealSlot: 'breakfast',
    supplementBlocks: ['morning'],
  },
  {
    id: 'mid-morning',
    label: 'Mid-Morning',
    icon: '🧠',
    timeRange: '8:00-11:00am',
    mealSlot: 'midMorning',
    supplementBlocks: ['deep-work'],
  },
  {
    id: 'lunch',
    label: 'Lunch',
    icon: '🍽️',
    timeRange: '12:00-14:00',
    mealSlot: 'lunch',
    supplementBlocks: ['afternoon'],
  },
  {
    id: 'afternoon',
    label: 'Afternoon',
    icon: '🌤️',
    timeRange: '14:00-18:00',
    mealSlot: 'snack',
    supplementBlocks: [],
  },
  {
    id: 'evening',
    label: 'Evening',
    icon: '🌙',
    timeRange: '18:00-21:00',
    mealSlot: 'dinner',
    supplementBlocks: ['evening'],
  },
];

const AM_TRAINING_PERIODS: TimePeriod[] = [
  {
    id: 'pre-workout',
    label: 'Pre-Workout',
    icon: '💪',
    timeRange: '5:00-5:30am',
    mealSlot: 'breakfast', // Pre-workout shake/snack
    supplementBlocks: ['pre-workout'],
  },
  {
    id: 'post-workout',
    label: 'Post-Workout',
    icon: '🍳',
    timeRange: '7:00-9:00am',
    mealSlot: 'midMorning', // Post-workout meal
    supplementBlocks: ['post-workout'],
  },
  {
    id: 'mid-morning',
    label: 'Mid-Morning',
    icon: '🧠',
    timeRange: '9:00-12:00',
    mealSlot: 'lunch', // Deep work snack
    supplementBlocks: ['deep-work'],
  },
  {
    id: 'afternoon',
    label: 'Afternoon',
    icon: '🌤️',
    timeRange: '12:00-18:00',
    mealSlot: 'snack',
    supplementBlocks: [],
  },
  {
    id: 'evening',
    label: 'Evening',
    icon: '🌙',
    timeRange: '18:00-21:00',
    mealSlot: 'dinner',
    supplementBlocks: ['evening'],
  },
];

const PM_TRAINING_PERIODS: TimePeriod[] = [
  {
    id: 'morning',
    label: 'Morning',
    icon: '☀️',
    timeRange: '5:00-8:00am',
    mealSlot: 'breakfast',
    supplementBlocks: ['morning'],
  },
  {
    id: 'mid-morning',
    label: 'Mid-Morning',
    icon: '🧠',
    timeRange: '8:00-12:00',
    mealSlot: 'midMorning',
    supplementBlocks: ['deep-work'],
  },
  {
    id: 'pre-workout',
    label: 'Pre-Workout',
    icon: '💪',
    timeRange: '13:00-14:00',
    mealSlot: 'lunch',
    supplementBlocks: ['pre-workout'],
  },
  {
    id: 'afternoon',
    label: 'Afternoon',
    icon: '🌤️',
    timeRange: '14:00-18:00',
    mealSlot: 'snack',
    supplementBlocks: [],
  },
  {
    id: 'evening',
    label: 'Evening',
    icon: '🌙',
    timeRange: '18:00-21:00',
    mealSlot: 'dinner',
    supplementBlocks: ['evening'],
  },
];

export const TIME_PERIODS: Record<DayType, TimePeriod[]> = {
  rest: REST_DAY_PERIODS,
  'am-training': AM_TRAINING_PERIODS,
  'pm-training': PM_TRAINING_PERIODS,
};

// Helper to get time periods for a given day type
export function getTimePeriodsForDayType(dayType: DayType): TimePeriod[] {
  return TIME_PERIODS[dayType];
}

// Helper to find which time period a meal slot belongs to
export function getTimePeriodForMealSlot(
  dayType: DayType,
  mealSlot: MealSlot
): TimePeriod | undefined {
  return TIME_PERIODS[dayType].find((period) => period.mealSlot === mealSlot);
}

// Helper to find which time period a supplement block belongs to
export function getTimePeriodForSupplementBlock(
  dayType: DayType,
  blockId: string
): TimePeriod | undefined {
  return TIME_PERIODS[dayType].find((period) =>
    period.supplementBlocks.includes(blockId)
  );
}
