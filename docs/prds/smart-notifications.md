# Smart Notifications

> **Status:** Not Started
> **Owner:** Kwadwo
> **Created:** 2026-03-04
> **Priority:** P2
> **Roadmap Phase:** Phase 4 - New Features

---

## 1. Problem

SetFlow currently has zero communication with users outside of active app usage. Once a user closes the app, there is no mechanism to bring them back, remind them to train, or celebrate their progress. This creates several issues:

1. **Broken streaks** - Users forget to train and lose streaks they've been building for weeks, causing demotivation
2. **Missed PR opportunities** - Users don't realize they're close to a personal record, missing the motivational boost of targeted attempts
3. **No weekly reflection** - Without a summary, users don't see the bigger picture of their training consistency and progress
4. **Schedule drift** - Users with training schedules (e.g., Mon/Wed/Fri) gradually drift without gentle reminders
5. **Low retention** - Without re-engagement, users who skip 3+ days are unlikely to return on their own

Gym apps with smart notifications see 40-60% higher 30-day retention compared to notification-free apps. For SetFlow, notifications complete the engagement loop between workout sessions.

---

## 2. Solution

Implement four types of intelligent notifications that provide genuine value rather than generic "time to work out" spam:

### Training Reminders
- Schedule-based reminders tied to user's preferred training days/times
- Smart timing: adjust reminder time based on when user typically opens the app
- Rest day awareness: don't remind on planned rest days

### Streak Protection Warnings
- Alert when a streak is at risk (e.g., "Train today to keep your 14-day streak!")
- Escalating urgency: gentle at start of day, more urgent by evening
- Celebrate streak milestones (7, 14, 30, 60, 100 days)

### PR Proximity Alerts
- Detect when a user's recent progression puts them within striking distance of a PR
- Example: "You're 2.5kg away from your Bench Press PR - go for it next session!"
- Triggered after each workout based on progression analysis

### Weekly Digest
- Push notification with week summary (workouts completed, total volume, PRs hit)
- Optional email digest via Resend for users who prefer email
- Sent on a configurable day (default: Sunday evening)

---

## 3. Success Metrics

| Metric | Target | How to Measure |
|--------|--------|----------------|
| Notification opt-in rate | 60% of active users | Track permission grant vs total users |
| Streak save rate | 30% of at-risk streaks saved after notification | Track streak-risk notification -> same-day workout |
| PR attempt rate after alert | 40% attempt the PR exercise next session | Track PR alert -> next workout exercise selection |
| Weekly digest open rate | 50% of delivered digests opened | Track notification click-through |
| 30-day retention lift | +25% vs non-notified cohort | Cohort analysis: notified vs opted-out users |

---

## 4. Requirements

### Must Have
- [ ] Web Push API integration with service worker
- [ ] Notification permission request flow (non-intrusive, value-first)
- [ ] Training day reminders with configurable days and time
- [ ] Streak-at-risk warnings (triggered when streak will break if no workout today)
- [ ] PR proximity detection and alert after each workout
- [ ] Notification preferences page (toggle each type on/off)
- [ ] Service worker push event handler
- [ ] Backend push subscription storage (Prisma/PostgreSQL)
- [ ] Push notification sending via web-push library

### Should Have
- [ ] Smart timing based on user's typical app open time
- [ ] Weekly digest push notification with workout summary
- [ ] Weekly digest email via Resend (optional opt-in)
- [ ] Streak milestone celebrations (7, 14, 30, 60, 100 days)
- [ ] Notification history/log viewable in app
- [ ] Quiet hours setting (no notifications between 10pm-7am default)

### Won't Have (this version)
- AI-powered optimal training time suggestions
- Social notifications ("Your friend just hit a PR!")
- Integration with calendar apps for schedule sync
- SMS notifications
- In-app notification center with badge counts

---

## 5. User Flow

### Flow 1: Enable Notifications
1. User completes their 3rd workout (trigger point for value demonstration)
2. Bottom sheet appears: "Never miss a workout - get smart reminders?"
3. Shows preview of notification types with toggle
4. User taps "Enable Notifications"
5. Browser permission dialog appears
6. User grants permission
7. Push subscription saved to backend
8. User lands on notification preferences page

### Flow 2: Streak Protection
1. User has a 14-day workout streak
2. It's 10am on a training day, no workout logged yet
3. Push notification: "14-day streak at risk! Train today to keep it alive"
4. User taps notification -> opens SetFlow to home page
5. User completes workout -> streak preserved
6. If no workout by 6pm, second reminder: "Last chance! Your 14-day streak expires at midnight"

### Flow 3: PR Proximity Alert
1. User finishes a bench press workout, logging 87.5kg x 6 reps
2. Post-workout analysis detects: current PR is 90kg x 5 reps
3. Next morning, push notification: "You're 2.5kg away from a Bench Press PR! Next session could be the one"
4. User taps notification -> opens SetFlow with bench press highlighted

### Flow 4: Weekly Digest
1. Sunday 7pm (configurable)
2. Push notification: "Your week: 4 workouts, 12,450kg total volume, 1 new PR"
3. User taps notification -> opens weekly summary view
4. Optional: email version sent via Resend with charts

### Flow 5: Manage Preferences
1. User navigates to Settings > Notifications
2. Sees toggles for each notification type
3. Configures training days (Mon, Wed, Fri)
4. Sets reminder time (7:30am)
5. Sets quiet hours (10pm-7am)
6. Saves preferences

---

## 6. Design

### UI Components

| Component | Purpose |
|-----------|---------|
| `NotificationPrompt` | Value-first bottom sheet for permission request |
| `NotificationPreferences` | Settings page with toggles per notification type |
| `TrainingSchedulePicker` | Day and time selector for reminders |
| `QuietHoursSelector` | Time range picker for do-not-disturb |
| `WeeklyDigestCard` | In-app weekly summary (also used as notification content) |
| `PRProximityBanner` | In-app banner showing nearby PRs |

### Visual Design

**Notification Permission Prompt**:
- Bottom sheet with 60% screen height
- Background: `#1A1A1A`
- Header: "Stay on track" in 20px bold white
- 3 preview cards showing notification examples
- CTA: `#CDFF00` "Enable Smart Reminders" button (56px height)
- Skip: Ghost text "Maybe later" below CTA

**Notification Preferences**:
- Background: `#0A0A0A`
- Toggle rows: `#1A1A1A` cards, 60px height
- Toggle switch: `#CDFF00` when active, `#333333` when off
- Description text: 12px `#A0A0A0` below each toggle

**Push Notification Design** (OS-level):
- Icon: SetFlow logo (96x96)
- Badge: `#CDFF00` accent
- Body: Concise, action-oriented text
- Action button: "Open SetFlow"

### Wireframe - Permission Prompt

```
+------------------------------------------+
|                                          |
|          (app content behind)            |
|                                          |
+------------------------------------------+
| +--------------------------------------+ |
| |                                      | |
| |       Stay On Track                  | |
| |                                      | |
| | +----------------------------------+ | |
| | | [bell] Training Reminders        | | |
| | | "Time to train - Upper Push"     | | |
| | +----------------------------------+ | |
| |                                      | |
| | +----------------------------------+ | |
| | | [fire] Streak Protection         | | |
| | | "14-day streak at risk!"         | | |
| | +----------------------------------+ | |
| |                                      | |
| | +----------------------------------+ | |
| | | [trophy] PR Alerts               | | |
| | | "2.5kg away from Bench PR"       | | |
| | +----------------------------------+ | |
| |                                      | |
| | [==== Enable Smart Reminders ====] | |
| |                                      | |
| |           Maybe later                | |
| +--------------------------------------+ |
+------------------------------------------+
```

### Wireframe - Notification Preferences

```
+------------------------------------------+
| [<] Notification Settings                |
+------------------------------------------+
|                                          |
| REMINDERS                                |
| +--------------------------------------+ |
| | Training Reminders           [====o] | |
| | Remind me on training days           | |
| +--------------------------------------+ |
| +--------------------------------------+ |
| | Training Days                        | |
| | [M] [T] [W] [T] [F] [S] [S]        | |
| |  *       *       *                  | |
| +--------------------------------------+ |
| +--------------------------------------+ |
| | Reminder Time              7:30 AM   | |
| +--------------------------------------+ |
|                                          |
| MOTIVATION                               |
| +--------------------------------------+ |
| | Streak Protection            [====o] | |
| | Warn when streak is at risk          | |
| +--------------------------------------+ |
| +--------------------------------------+ |
| | PR Proximity Alerts          [====o] | |
| | Alert when close to a PR             | |
| +--------------------------------------+ |
| +--------------------------------------+ |
| | Streak Celebrations          [====o] | |
| | Celebrate milestone streaks          | |
| +--------------------------------------+ |
|                                          |
| SUMMARY                                  |
| +--------------------------------------+ |
| | Weekly Digest (Push)         [====o] | |
| | Sunday summary of your week          | |
| +--------------------------------------+ |
| +--------------------------------------+ |
| | Weekly Digest (Email)        [o====] | |
| | Receive summary via email            | |
| +--------------------------------------+ |
|                                          |
| QUIET HOURS                              |
| +--------------------------------------+ |
| | Do Not Disturb       10:00pm-7:00am  | |
| +--------------------------------------+ |
|                                          |
+------------------------------------------+
```

### Wireframe - Weekly Digest Notification

```
+------------------------------------------+
| SetFlow                          just now |
| Your Week in Review                       |
|                                           |
| 4 workouts | 12,450kg volume | 1 PR      |
|                                           |
| [Open SetFlow]                            |
+------------------------------------------+
```

---

## 7. Technical Spec

### Push Subscription Schema (Prisma)

```typescript
// prisma/schema.prisma (add to existing schema)
model PushSubscription {
  id        String   @id @default(cuid())
  userId    String
  endpoint  String   @unique
  p256dh    String   // Public key
  auth      String   // Auth secret
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  user User @relation(fields: [userId], references: [id])

  @@index([userId])
}

model NotificationPreference {
  id                String   @id @default(cuid())
  userId            String   @unique
  trainingReminders Boolean  @default(true)
  trainingDays      Int[]    @default([1, 3, 5]) // 0=Sun, 1=Mon...
  reminderTime      String   @default("07:30")   // HH:MM format
  streakProtection  Boolean  @default(true)
  prAlerts          Boolean  @default(true)
  streakCelebrations Boolean @default(true)
  weeklyDigestPush  Boolean  @default(true)
  weeklyDigestEmail Boolean  @default(false)
  digestDay         Int      @default(0)          // 0=Sunday
  quietStart        String   @default("22:00")
  quietEnd          String   @default("07:00")
  createdAt         DateTime @default(now())
  updatedAt         DateTime @updatedAt

  user User @relation(fields: [userId], references: [id])
}
```

### Service Worker Push Handler

```typescript
// /public/sw-push.js (imported by main service worker)

self.addEventListener('push', (event) => {
  if (!event.data) return;

  const data = event.data.json();

  const options = {
    body: data.body,
    icon: '/icons/icon-192x192.png',
    badge: '/icons/badge-96x96.png',
    tag: data.tag || 'setflow-notification',
    renotify: data.renotify || false,
    data: {
      url: data.url || '/',
      type: data.type,
    },
    actions: data.actions || [
      { action: 'open', title: 'Open SetFlow' },
    ],
    vibrate: [100, 50, 100],
  };

  event.waitUntil(
    self.registration.showNotification(data.title, options)
  );
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  const url = event.notification.data?.url || '/';

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true })
      .then((windowClients) => {
        // Focus existing window if open
        for (const client of windowClients) {
          if (client.url.includes('gym.adu.dk') && 'focus' in client) {
            client.navigate(url);
            return client.focus();
          }
        }
        // Open new window
        return clients.openWindow(url);
      })
  );
});
```

### Push Subscription Client

```typescript
// /src/lib/notifications/push-subscription.ts

export async function subscribeToPush(): Promise<PushSubscription | null> {
  if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
    console.warn('Push notifications not supported');
    return null;
  }

  const permission = await Notification.requestPermission();
  if (permission !== 'granted') {
    return null;
  }

  const registration = await navigator.serviceWorker.ready;

  const subscription = await registration.pushManager.subscribe({
    userVisibleOnly: true,
    applicationServerKey: urlBase64ToUint8Array(
      process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!
    ),
  });

  // Save subscription to backend
  await fetch('/api/notifications/subscribe', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(subscription.toJSON()),
  });

  return subscription;
}

export async function unsubscribeFromPush(): Promise<void> {
  const registration = await navigator.serviceWorker.ready;
  const subscription = await registration.pushManager.getSubscription();

  if (subscription) {
    await subscription.unsubscribe();
    await fetch('/api/notifications/unsubscribe', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ endpoint: subscription.endpoint }),
    });
  }
}

function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding)
    .replace(/-/g, '+')
    .replace(/_/g, '/');
  const rawData = window.atob(base64);
  return Uint8Array.from([...rawData].map((char) => char.charCodeAt(0)));
}
```

### PR Proximity Detection

```typescript
// /src/lib/notifications/pr-proximity.ts
import { type SetLog, type WorkoutLog } from '@/lib/types';

interface PRProximityResult {
  exerciseName: string;
  currentMax: number;
  prWeight: number;
  gap: number;
  unit: 'kg' | 'lbs';
}

export function detectPRProximity(
  recentLogs: WorkoutLog[],
  allTimePRs: Map<string, number>,
  threshold: number = 5 // kg gap to trigger alert
): PRProximityResult[] {
  const results: PRProximityResult[] = [];

  // Get max weight per exercise from recent session
  const lastWorkout = recentLogs
    .sort((a, b) => b.date.localeCompare(a.date))[0];

  if (!lastWorkout) return results;

  const exerciseMaxes = new Map<string, number>();

  for (const set of lastWorkout.sets) {
    const current = exerciseMaxes.get(set.exerciseId) || 0;
    if (set.weight > current) {
      exerciseMaxes.set(set.exerciseId, set.weight);
    }
  }

  // Compare against all-time PRs
  for (const [exerciseId, maxWeight] of exerciseMaxes) {
    const pr = allTimePRs.get(exerciseId);
    if (!pr) continue;

    const gap = pr - maxWeight;
    if (gap > 0 && gap <= threshold) {
      results.push({
        exerciseName: exerciseId, // Resolve to name in caller
        currentMax: maxWeight,
        prWeight: pr,
        gap,
        unit: 'kg',
      });
    }
  }

  return results;
}
```

### Streak Risk Detection

```typescript
// /src/lib/notifications/streak-risk.ts
import { type WorkoutLog } from '@/lib/types';

interface StreakStatus {
  currentStreak: number;
  atRisk: boolean;
  hoursRemaining: number;
  lastWorkoutDate: string;
}

export function getStreakStatus(
  workoutLogs: WorkoutLog[],
  now: Date = new Date()
): StreakStatus {
  const completedLogs = workoutLogs
    .filter(l => l.isComplete)
    .sort((a, b) => b.date.localeCompare(a.date));

  if (completedLogs.length === 0) {
    return { currentStreak: 0, atRisk: false, hoursRemaining: 0, lastWorkoutDate: '' };
  }

  // Calculate streak
  let streak = 1;
  for (let i = 0; i < completedLogs.length - 1; i++) {
    const current = new Date(completedLogs[i].date);
    const previous = new Date(completedLogs[i + 1].date);
    const diffDays = Math.floor(
      (current.getTime() - previous.getTime()) / (1000 * 60 * 60 * 24)
    );

    if (diffDays === 1) {
      streak++;
    } else {
      break;
    }
  }

  // Check if at risk (last workout was yesterday, none today)
  const lastDate = new Date(completedLogs[0].date);
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const lastDay = new Date(lastDate.getFullYear(), lastDate.getMonth(), lastDate.getDate());
  const daysSinceLast = Math.floor(
    (today.getTime() - lastDay.getTime()) / (1000 * 60 * 60 * 24)
  );

  const atRisk = daysSinceLast === 1; // Last workout was yesterday, none today
  const endOfDay = new Date(today);
  endOfDay.setHours(23, 59, 59, 999);
  const hoursRemaining = Math.max(
    0,
    (endOfDay.getTime() - now.getTime()) / (1000 * 60 * 60)
  );

  return {
    currentStreak: streak,
    atRisk,
    hoursRemaining: Math.round(hoursRemaining * 10) / 10,
    lastWorkoutDate: completedLogs[0].date,
  };
}
```

### Weekly Digest Generator

```typescript
// /src/lib/notifications/weekly-digest.ts
import { type WorkoutLog } from '@/lib/types';

interface WeeklyDigest {
  workoutCount: number;
  totalVolume: number;     // kg
  totalSets: number;
  totalReps: number;
  newPRs: number;
  streakDays: number;
  topExercise: string;     // Most volume
  comparedToLastWeek: {
    workouts: number;      // +/- difference
    volume: number;        // +/- difference in kg
  };
}

export function generateWeeklyDigest(
  thisWeekLogs: WorkoutLog[],
  lastWeekLogs: WorkoutLog[],
  streak: number,
  newPRCount: number
): WeeklyDigest {
  const completedThis = thisWeekLogs.filter(l => l.isComplete);
  const completedLast = lastWeekLogs.filter(l => l.isComplete);

  const thisVolume = completedThis.reduce((total, log) => {
    return total + log.sets.reduce((setTotal, set) => {
      return setTotal + (set.weight * set.reps);
    }, 0);
  }, 0);

  const lastVolume = completedLast.reduce((total, log) => {
    return total + log.sets.reduce((setTotal, set) => {
      return setTotal + (set.weight * set.reps);
    }, 0);
  }, 0);

  const totalSets = completedThis.reduce(
    (total, log) => total + log.sets.length, 0
  );

  const totalReps = completedThis.reduce((total, log) => {
    return total + log.sets.reduce((s, set) => s + set.reps, 0);
  }, 0);

  // Find top exercise by volume
  const exerciseVolumes = new Map<string, number>();
  for (const log of completedThis) {
    for (const set of log.sets) {
      const vol = exerciseVolumes.get(set.exerciseId) || 0;
      exerciseVolumes.set(set.exerciseId, vol + set.weight * set.reps);
    }
  }
  const topExercise = [...exerciseVolumes.entries()]
    .sort(([, a], [, b]) => b - a)[0]?.[0] || 'None';

  return {
    workoutCount: completedThis.length,
    totalVolume: Math.round(thisVolume),
    totalSets,
    totalReps,
    newPRs: newPRCount,
    streakDays: streak,
    topExercise,
    comparedToLastWeek: {
      workouts: completedThis.length - completedLast.length,
      volume: Math.round(thisVolume - lastVolume),
    },
  };
}

export function formatDigestMessage(digest: WeeklyDigest): string {
  const volumeStr = digest.totalVolume >= 1000
    ? `${(digest.totalVolume / 1000).toFixed(1)}t`
    : `${digest.totalVolume}kg`;

  let message = `${digest.workoutCount} workouts | ${volumeStr} volume`;

  if (digest.newPRs > 0) {
    message += ` | ${digest.newPRs} PR${digest.newPRs > 1 ? 's' : ''}`;
  }

  return message;
}
```

### Notification API Route

```typescript
// /src/app/api/notifications/send/route.ts
import { NextResponse } from 'next/server';
import webpush from 'web-push';
import { prisma } from '@/lib/prisma';

webpush.setVapidDetails(
  'mailto:k@adu.dk',
  process.env.VAPID_PUBLIC_KEY!,
  process.env.VAPID_PRIVATE_KEY!
);

interface NotificationPayload {
  title: string;
  body: string;
  url?: string;
  tag?: string;
  type: 'reminder' | 'streak' | 'pr' | 'digest';
}

export async function POST(request: Request) {
  const { userId, payload } = await request.json() as {
    userId: string;
    payload: NotificationPayload;
  };

  const subscriptions = await prisma.pushSubscription.findMany({
    where: { userId },
  });

  const results = await Promise.allSettled(
    subscriptions.map(async (sub) => {
      try {
        await webpush.sendNotification(
          {
            endpoint: sub.endpoint,
            keys: { p256dh: sub.p256dh, auth: sub.auth },
          },
          JSON.stringify(payload)
        );
      } catch (error: unknown) {
        // Remove expired subscriptions
        if (error instanceof webpush.WebPushError && error.statusCode === 410) {
          await prisma.pushSubscription.delete({
            where: { id: sub.id },
          });
        }
        throw error;
      }
    })
  );

  const sent = results.filter(r => r.status === 'fulfilled').length;
  const failed = results.filter(r => r.status === 'rejected').length;

  return NextResponse.json({ sent, failed });
}
```

### Email Digest via Resend

```typescript
// /src/lib/notifications/email-digest.ts
import { Resend } from 'resend';
import { type WeeklyDigest } from './weekly-digest';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendWeeklyDigestEmail(
  to: string,
  digest: WeeklyDigest
): Promise<void> {
  const volumeStr = digest.totalVolume >= 1000
    ? `${(digest.totalVolume / 1000).toFixed(1)}t`
    : `${digest.totalVolume}kg`;

  await resend.emails.send({
    from: 'SetFlow <noreply@gym.adu.dk>',
    to,
    subject: `Your Week: ${digest.workoutCount} workouts, ${volumeStr} volume`,
    html: `
      <div style="font-family: Inter, sans-serif; background: #0A0A0A; color: white; padding: 32px; border-radius: 12px;">
        <h1 style="color: #CDFF00; font-size: 24px; margin-bottom: 24px;">Your Week in Review</h1>

        <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; margin-bottom: 24px;">
          <div style="background: #1A1A1A; padding: 16px; border-radius: 8px; text-align: center;">
            <div style="font-size: 32px; font-weight: bold; color: #CDFF00;">${digest.workoutCount}</div>
            <div style="font-size: 12px; color: #A0A0A0;">Workouts</div>
          </div>
          <div style="background: #1A1A1A; padding: 16px; border-radius: 8px; text-align: center;">
            <div style="font-size: 32px; font-weight: bold; color: #CDFF00;">${volumeStr}</div>
            <div style="font-size: 12px; color: #A0A0A0;">Volume</div>
          </div>
          <div style="background: #1A1A1A; padding: 16px; border-radius: 8px; text-align: center;">
            <div style="font-size: 32px; font-weight: bold; color: #CDFF00;">${digest.newPRs}</div>
            <div style="font-size: 12px; color: #A0A0A0;">New PRs</div>
          </div>
        </div>

        <div style="background: #1A1A1A; padding: 16px; border-radius: 8px; margin-bottom: 16px;">
          <div style="color: #A0A0A0; font-size: 12px;">Current Streak</div>
          <div style="font-size: 20px; font-weight: bold;">${digest.streakDays} days</div>
        </div>

        <div style="background: #1A1A1A; padding: 16px; border-radius: 8px; margin-bottom: 24px;">
          <div style="color: #A0A0A0; font-size: 12px;">Compared to Last Week</div>
          <div style="font-size: 14px; margin-top: 8px;">
            Workouts: ${digest.comparedToLastWeek.workouts >= 0 ? '+' : ''}${digest.comparedToLastWeek.workouts} |
            Volume: ${digest.comparedToLastWeek.volume >= 0 ? '+' : ''}${digest.comparedToLastWeek.volume}kg
          </div>
        </div>

        <a href="https://gym.adu.dk" style="display: block; background: #CDFF00; color: black; text-align: center; padding: 16px; border-radius: 8px; text-decoration: none; font-weight: bold;">
          Open SetFlow
        </a>
      </div>
    `,
  });
}
```

### Files to Create

| File | Purpose |
|------|---------|
| `src/lib/notifications/push-subscription.ts` | Client-side push subscription management |
| `src/lib/notifications/pr-proximity.ts` | PR proximity detection logic |
| `src/lib/notifications/streak-risk.ts` | Streak risk detection |
| `src/lib/notifications/weekly-digest.ts` | Weekly digest data generation |
| `src/lib/notifications/email-digest.ts` | Resend email digest sender |
| `src/components/notifications/NotificationPrompt.tsx` | Permission request bottom sheet |
| `src/components/notifications/NotificationPreferences.tsx` | Settings page with toggles |
| `src/components/notifications/TrainingSchedulePicker.tsx` | Day/time selector |
| `src/components/notifications/QuietHoursSelector.tsx` | Do-not-disturb time range |
| `src/app/api/notifications/subscribe/route.ts` | Save push subscription endpoint |
| `src/app/api/notifications/unsubscribe/route.ts` | Remove push subscription endpoint |
| `src/app/api/notifications/send/route.ts` | Send push notification endpoint |
| `src/app/api/cron/notifications/route.ts` | Cron job for scheduled notifications |
| `src/app/settings/notifications/page.tsx` | Notification preferences page |
| `public/sw-push.js` | Service worker push event handler |

### Files to Modify

| File | Change |
|------|--------|
| `prisma/schema.prisma` | Add PushSubscription and NotificationPreference models |
| `public/sw.js` | Import sw-push.js for push event handling |
| `src/app/settings/page.tsx` | Add "Notifications" link to settings menu |
| `src/components/workout/WorkoutComplete.tsx` | Trigger PR proximity check after workout |
| `.env.local` | Add VAPID keys and Resend API key |

---

## 8. Implementation Plan

### Dependencies
- [ ] `web-push` npm package for server-side push notifications
- [ ] `resend` npm package for email digest (optional)
- [ ] VAPID key pair generation (`web-push generate-vapid-keys`)
- [ ] Resend account and API key (for email digest feature)
- [ ] Vercel Cron Jobs for scheduled notification sending
- [ ] PostgreSQL (via Prisma) for push subscription storage

### Build Order

1. [ ] **Generate VAPID keys** - Create key pair for Web Push API
2. [ ] **Prisma schema update** - Add PushSubscription and NotificationPreference models
3. [ ] **Create push subscription client** - Subscribe/unsubscribe flow
4. [ ] **Create service worker push handler** - Receive and display notifications
5. [ ] **Create API routes** - Subscribe, unsubscribe, send endpoints
6. [ ] **Build NotificationPrompt** - Value-first permission request sheet
7. [ ] **Build NotificationPreferences** - Settings page with toggles
8. [ ] **Implement streak risk detection** - Logic + notification trigger
9. [ ] **Implement PR proximity detection** - Post-workout analysis + alert
10. [ ] **Build training day reminders** - Cron-based scheduled notifications
11. [ ] **Build weekly digest** - Data aggregation + push notification
12. [ ] **Add email digest** - Resend integration for optional email
13. [ ] **Set up Vercel Cron** - Schedule reminder and digest jobs
14. [ ] **Test on iOS Safari PWA** - Push permission, notification display
15. [ ] **Test notification lifecycle** - Subscribe, receive, click, unsubscribe

### Agents to Consult
- **PWA Specialist** - Web Push API on iOS Safari (supported since iOS 16.4)
- **Software Engineer** - API route design, cron job setup
- **Database Specialist** - Prisma schema for subscriptions
- **Progress Analyst** - PR proximity thresholds, streak logic

---

## 9. Testing

### Functional Tests
- [ ] Push subscription saves correctly to database
- [ ] Unsubscribe removes subscription from database
- [ ] Service worker receives and displays push notification
- [ ] Notification click opens correct page in app
- [ ] Streak risk correctly identifies at-risk streaks
- [ ] PR proximity detects exercises within threshold
- [ ] Weekly digest calculates correct totals
- [ ] Training day reminder fires on correct days/times
- [ ] Quiet hours prevents notifications during blocked period
- [ ] Email digest sends correctly via Resend
- [ ] Expired subscriptions (410) are cleaned up automatically
- [ ] Notification preferences persist across sessions

### UI Verification
- [ ] Permission prompt appears after 3rd workout (not before)
- [ ] All toggle switches meet 44px touch target
- [ ] Training day picker is intuitive (tap to select/deselect)
- [ ] Time picker is scrollable and precise
- [ ] Dark theme renders correctly on preferences page
- [ ] Bottom sheet animation is smooth (60fps)
- [ ] Works on iOS Safari PWA (push requires iOS 16.4+)
- [ ] Works on Android Chrome
- [ ] Notification icon displays correctly on all platforms
- [ ] Notification text is readable and not truncated

---

## 10. Launch Checklist

- [ ] Code complete
- [ ] Tests passing
- [ ] PR reviewed (`/review`)
- [ ] Changelog updated
- [ ] Patterns extracted (`/codify`)
- [ ] VAPID keys generated and stored in environment
- [ ] Prisma migration applied
- [ ] Resend account configured (if email digest enabled)
- [ ] Vercel Cron configured for scheduled notifications
- [ ] Deployed to staging
- [ ] iOS Safari PWA push tested (requires iOS 16.4+)
- [ ] Android Chrome push tested
- [ ] Notification lifecycle tested end-to-end
- [ ] Deployed to production
- [ ] Roadmap status updated

---

## Edge Cases

| Edge Case | Handling |
|-----------|----------|
| User denies notification permission | Show "Notifications disabled" in settings with instructions to re-enable |
| iOS < 16.4 (no Web Push support) | Hide notification features entirely, show "Update iOS for notifications" |
| User has multiple devices | Store subscription per device, send to all active subscriptions |
| Notification permission revoked at OS level | Detect on next app open, update UI accordingly |
| Cron job fires during quiet hours | Check quiet hours before sending, defer to next allowed window |
| User in different timezone | Store timezone in preferences, calculate send time accordingly |
| Streak broken before notification sent | Don't send "at risk" if streak already broken, send "Start a new streak" instead |
| No PRs to compare against (new user) | Skip PR proximity check until at least 2 weeks of data |
| Weekly digest with zero workouts | Send encouraging message: "Let's get back on track this week" |

---

## Risks & Mitigations

| Risk | Impact | Mitigation |
|------|--------|------------|
| Users perceive notifications as spam | Opt-out, negative brand perception | Value-first approach: only send genuinely useful notifications |
| iOS Safari push reliability | Notifications may not arrive on iOS | Test thoroughly, document iOS requirements (16.4+, added to home screen) |
| VAPID key rotation | All subscriptions invalidated | Store keys securely, plan rotation strategy |
| Resend rate limits | Email digest delivery failures | Batch sending, respect rate limits, queue system |
| Over-notification | User fatigue | Default to minimal notifications, let users opt-in to more |
| Cron job failures | Missed scheduled notifications | Vercel Cron monitoring, fallback retry logic |

---

## Dependencies

- Requires Clerk auth (already implemented) for user identification
- Requires PostgreSQL (via Prisma) for subscription storage
- Requires workout logging (core feature) for streak and PR data
- `web-push` npm package (server-side notification sending)
- `resend` npm package (optional, for email digest)
- Vercel Cron Jobs (for scheduled notification triggers)
- iOS 16.4+ for Web Push API support on Safari

---

## Changelog

| Date | Change |
|------|--------|
| 2026-03-04 | Initial draft |
