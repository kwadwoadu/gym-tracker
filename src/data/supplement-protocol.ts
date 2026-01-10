// Supplement Protocol for Daily Tracking
// Based on AduOS health/supplement-protocol.md

export type DayType = 'rest' | 'am-training' | 'pm-training';

export interface SupplementItem {
  id: string;
  name: string;
  dose: string;
  notes?: string;
  smoothieMix?: boolean; // Can be added to smoothie
  optional?: boolean;
  alternatives?: string; // e.g., "OR Coffee"
}

export interface SupplementBlock {
  id: string;
  label: string;
  icon: string; // Emoji for visual identification
  timeRange: string;
  items: SupplementItem[];
}

// Rest Day Protocol
const REST_DAY_PROTOCOL: SupplementBlock[] = [
  {
    id: 'morning',
    label: 'Morning',
    icon: '☀️',
    timeRange: '5:00-6:00am',
    items: [
      { id: 'd3-k2', name: 'D3 + K2', dose: '400 IU + 200mcg', notes: 'Take with fat' },
      { id: 'b-complex', name: 'B Complex', dose: '1 cap' },
      { id: 'super-foods', name: 'Super Foods', dose: '1 serving', smoothieMix: true, optional: true },
    ],
  },
  {
    id: 'deep-work',
    label: 'Deep Work',
    icon: '🧠',
    timeRange: '8:00-9:00am',
    items: [
      { id: 'evobrain', name: 'Evobrain', dose: '2 caps', notes: 'Caffeine-free nootropic' },
      { id: 'caffeine', name: 'Caffeine', dose: '200mg', alternatives: 'OR Coffee', notes: 'Pick one' },
      { id: 'theanine', name: 'L-Theanine', dose: '250mg', smoothieMix: true, notes: 'Pairs with caffeine' },
    ],
  },
  {
    id: 'afternoon',
    label: 'Afternoon',
    icon: '🌤️',
    timeRange: '12:00-13:00',
    items: [
      { id: 'electrolytes', name: 'Electrolytes', dose: '80mg caffeine', optional: true, notes: 'If need boost' },
    ],
  },
  {
    id: 'evening',
    label: 'Evening',
    icon: '🌙',
    timeRange: '20:00-21:00',
    items: [
      { id: 'magnesium', name: 'Magnesium', dose: '1 serving', notes: 'Relaxation, sleep' },
      { id: 'ashwagandha', name: 'Ashwagandha', dose: '500mg', notes: 'KSM-66, cortisol' },
      { id: 'zinc', name: 'Zinc', dose: '15-30mg', notes: 'With dinner, immune & recovery' },
    ],
  },
];

// AM Training Protocol (5:00-7:00am workout)
const AM_TRAINING_PROTOCOL: SupplementBlock[] = [
  {
    id: 'pre-workout',
    label: 'Pre-Workout',
    icon: '💪',
    timeRange: '5:00-5:30am',
    items: [
      { id: 'citrulline', name: 'Citrulline Malate', dose: '5-10g', smoothieMix: true, notes: '30 min before' },
      { id: 'electrolytes', name: 'Electrolytes', dose: '80mg caffeine' },
      { id: 'energy-gel', name: 'Energy Gel', dose: '100mg caffeine', optional: true, notes: 'If needed' },
    ],
  },
  {
    id: 'post-workout',
    label: 'Post-Workout',
    icon: '🍳',
    timeRange: '7:00-8:00am',
    items: [
      { id: 'd3-k2', name: 'D3 + K2', dose: '400 IU + 200mcg', notes: 'With breakfast' },
      { id: 'b-complex', name: 'B Complex', dose: '1 cap' },
    ],
  },
  {
    id: 'deep-work',
    label: 'Deep Work',
    icon: '🧠',
    timeRange: '9:00am',
    items: [
      { id: 'evobrain', name: 'Evobrain', dose: '2 caps', notes: 'Caffeine-free nootropic' },
      { id: 'theanine', name: 'L-Theanine', dose: '250mg', smoothieMix: true, notes: 'No more caffeine' },
    ],
  },
  {
    id: 'evening',
    label: 'Evening',
    icon: '🌙',
    timeRange: '20:00-21:00',
    items: [
      { id: 'magnesium', name: 'Magnesium', dose: '1 serving', notes: 'Relaxation, sleep' },
      { id: 'ashwagandha', name: 'Ashwagandha', dose: '500mg', notes: 'KSM-66, cortisol' },
      { id: 'zinc', name: 'Zinc', dose: '15-30mg', notes: 'With dinner, immune & recovery' },
    ],
  },
];

// PM Training Protocol (14:00-17:00 workout)
const PM_TRAINING_PROTOCOL: SupplementBlock[] = [
  {
    id: 'morning',
    label: 'Morning',
    icon: '☀️',
    timeRange: '5:00-6:00am',
    items: [
      { id: 'd3-k2', name: 'D3 + K2', dose: '400 IU + 200mcg', notes: 'Take with fat' },
      { id: 'b-complex', name: 'B Complex', dose: '1 cap' },
      { id: 'super-foods', name: 'Super Foods', dose: '1 serving', smoothieMix: true, optional: true },
    ],
  },
  {
    id: 'deep-work',
    label: 'Deep Work',
    icon: '🧠',
    timeRange: '8:00-9:00am',
    items: [
      { id: 'evobrain', name: 'Evobrain', dose: '2 caps', notes: 'Caffeine-free nootropic' },
      { id: 'caffeine', name: 'Caffeine', dose: '200mg', alternatives: 'OR Coffee', notes: 'Pick one' },
      { id: 'theanine', name: 'L-Theanine', dose: '250mg', smoothieMix: true, notes: 'Pairs with caffeine' },
    ],
  },
  {
    id: 'pre-workout',
    label: 'Pre-Workout',
    icon: '💪',
    timeRange: '13:30-14:00',
    items: [
      { id: 'citrulline', name: 'Citrulline Malate', dose: '10g', smoothieMix: true, notes: '30 min before' },
      { id: 'electrolytes', name: 'Electrolytes', dose: '80mg caffeine', notes: 'Watch caffeine total' },
    ],
  },
  {
    id: 'evening',
    label: 'Evening',
    icon: '🌙',
    timeRange: '20:00-21:00',
    items: [
      { id: 'magnesium', name: 'Magnesium', dose: '1 serving', notes: 'Relaxation, sleep' },
      { id: 'ashwagandha', name: 'Ashwagandha', dose: '500mg', notes: 'KSM-66, cortisol' },
      { id: 'zinc', name: 'Zinc', dose: '15-30mg', notes: 'With dinner, immune & recovery' },
    ],
  },
];

export const SUPPLEMENT_PROTOCOLS: Record<DayType, SupplementBlock[]> = {
  rest: REST_DAY_PROTOCOL,
  'am-training': AM_TRAINING_PROTOCOL,
  'pm-training': PM_TRAINING_PROTOCOL,
};

// Day type labels for display
export const DAY_TYPE_LABELS: Record<DayType, string> = {
  rest: 'Rest Day',
  'am-training': 'AM Training',
  'pm-training': 'PM Training',
};

// Helper to get total supplement count for a day type
export function getTotalSupplementCount(dayType: DayType): number {
  return SUPPLEMENT_PROTOCOLS[dayType].reduce(
    (total, block) => total + block.items.filter((item) => !item.optional).length,
    0
  );
}

// Helper to get all supplement IDs for a day type
export function getAllSupplementIds(dayType: DayType): string[] {
  return SUPPLEMENT_PROTOCOLS[dayType].flatMap((block) =>
    block.items.map((item) => `${block.id}-${item.id}`)
  );
}
