import { Dumbbell, Timer, BookOpen, Scale, Bot, Users, Trophy } from "lucide-react";

export interface MoreRouteItem {
  href: string;
  icon: typeof Dumbbell;
  label: string;
  description: string;
}

/**
 * Single source of truth for all "More" menu routes.
 * Used by both more-sheet.tsx (menu items) and bottom-tab-bar.tsx (active state).
 */
export const MORE_ROUTES: MoreRouteItem[] = [
  {
    href: "/exercises",
    icon: Dumbbell,
    label: "Exercises",
    description: "Browse exercise library",
  },
  {
    href: "/community",
    icon: Users,
    label: "Community",
    description: "Leaderboard, groups & templates",
  },
  {
    href: "/gamification",
    icon: Trophy,
    label: "Achievements",
    description: "XP, challenges & badges",
  },
  {
    href: "/timer",
    icon: Timer,
    label: "Timer",
    description: "AMRAP, EMOM, Tabata, Custom",
  },
  {
    href: "/form-library",
    icon: BookOpen,
    label: "Form Library",
    description: "Exercise cues & technique",
  },
  {
    href: "/body",
    icon: Scale,
    label: "Body",
    description: "Weight, measurements, body fat",
  },
  {
    href: "/trainer",
    icon: Bot,
    label: "AI Coach",
    description: "Personal trainer chat",
  },
];

/** Derived route paths for active-state checks */
export const MORE_ROUTE_PATHS = MORE_ROUTES.map((r) => r.href);
