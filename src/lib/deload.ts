/**
 * Deload session management
 * Handles deload week state via localStorage
 */

const DELOAD_KEY = "setflow-deload-session";

export interface DeloadSession {
  startDate: string; // ISO date (YYYY-MM-DD)
  endDate: string; // ISO date (startDate + 7 days)
  protocol: {
    intensityReduction: number; // 0.3 = 30%
    volumeReduction: number; // 0.4 = 40%
  };
}

/**
 * Get the currently active deload session, or null if none/expired.
 */
export function getActiveDeload(): DeloadSession | null {
  if (typeof window === "undefined") return null;

  const raw = localStorage.getItem(DELOAD_KEY);
  if (!raw) return null;

  try {
    const session: DeloadSession = JSON.parse(raw);
    const today = new Date().toISOString().split("T")[0];

    if (today >= session.startDate && today <= session.endDate) {
      return session;
    }

    // Session has expired - clean up
    localStorage.removeItem(DELOAD_KEY);
    return null;
  } catch {
    localStorage.removeItem(DELOAD_KEY);
    return null;
  }
}

/**
 * Start a new deload session with today as start date.
 * Duration is always 7 days.
 */
export function startDeload(
  intensityReduction: number,
  volumeReduction: number
): DeloadSession {
  const start = new Date();
  const end = new Date(start);
  end.setDate(end.getDate() + 7);

  const session: DeloadSession = {
    startDate: start.toISOString().split("T")[0],
    endDate: end.toISOString().split("T")[0],
    protocol: {
      intensityReduction,
      volumeReduction,
    },
  };

  localStorage.setItem(DELOAD_KEY, JSON.stringify(session));
  return session;
}

/**
 * End the current deload session immediately.
 */
export function endDeload(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(DELOAD_KEY);
}

/**
 * Check if a deload session is currently active.
 */
export function isDeloadActive(): boolean {
  return getActiveDeload() !== null;
}

/**
 * Get the current day number (1-7) within the deload week.
 * Returns 0 if no deload is active.
 */
export function getDeloadDay(): number {
  const session = getActiveDeload();
  if (!session) return 0;

  const start = new Date(session.startDate);
  const today = new Date(new Date().toISOString().split("T")[0]);
  const diffMs = today.getTime() - start.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  return diffDays + 1; // Day 1 on start date
}

/**
 * Get the number of days remaining in the deload session.
 * Returns 0 if no deload is active.
 */
export function getDaysRemaining(): number {
  const session = getActiveDeload();
  if (!session) return 0;

  const end = new Date(session.endDate);
  const today = new Date(new Date().toISOString().split("T")[0]);
  const diffMs = end.getTime() - today.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  return Math.max(0, diffDays);
}

/**
 * Calculate the deloaded weight from a normal weight.
 * Rounds to the nearest 0.5 for plate-friendly values.
 */
export function getDeloadWeight(
  normalWeight: number,
  intensityReduction?: number
): number {
  const reduction = intensityReduction ?? getActiveDeload()?.protocol.intensityReduction ?? 0;
  const reduced = normalWeight * (1 - reduction);
  return Math.round(reduced * 2) / 2; // Round to nearest 0.5
}
