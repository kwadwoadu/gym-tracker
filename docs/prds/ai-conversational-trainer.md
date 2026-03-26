# AI Conversational Trainer

> **Status:** Shipped
> **Owner:** Kwadwo
> **Created:** 2026-03-26
> **Priority:** P2
> **Roadmap Phase:** Phase 4 - Advanced AI
> **Parent:** [`ai-personal-trainer.md`](ai-personal-trainer.md) (vision doc)

---

## 1. Problem Statement

Users training alone have no one to discuss their training with. When they wonder "Should I train today after bad sleep?", "Why are my squats stalling?", or "What should I change about my program?", they either search the internet (generic answers), ask friends (unqualified), or ignore the question entirely. SetFlow collects rich training data (workout logs, PRs, RPE, program structure) but provides no way for users to ask questions about their own data and get contextual, data-backed answers.

The existing AI Coach chat (shipped) handles basic Q&A with markdown rendering and follow-up prompts. This PRD extends it into a full conversational trainer that has deep awareness of the user's training history, current program, performance trends, and goals.

---

## 2. Proposed Solution

A chat-based AI trainer interface where users can have natural conversations about their training. The trainer has access to the user's complete SetFlow context (profile, program, workout history, PRs, trends) and provides personalized, data-backed coaching advice.

### Core Behaviors

1. **Context-Aware Conversations**: The trainer knows the user's goals, current program, recent workouts, PRs, and performance trends. Every response is personalized based on actual data.

2. **Quick Action Chips**: Pre-built conversation starters for common questions:
   - "Should I train today?"
   - "Analyze my week"
   - "Why am I stalling?"
   - "What should I change?"

3. **Structured Advice**: When the trainer suggests program changes, it shows a structured diff (current vs. proposed) that the user can accept or dismiss.

4. **Streaming Responses**: Chat uses response streaming for natural UX (typing indicator then progressive text reveal).

5. **Trainer Personality**: Encouraging but honest. Direct, not flowery. Uses gym terminology naturally. Evidence-based approach favoring compound movements, progressive overload, adequate recovery.

6. **Clear Boundaries**: Never diagnoses injuries (refers to physiotherapist). Never prescribes supplements (only suggests timing). Never gives mental health advice. Proactively adds disclaimers for medical-adjacent topics.

---

## 3. Success Metrics

| Metric | Target | How to Measure |
|--------|--------|----------------|
| Chat engagement | >3 conversations per user per week | Track chat sessions started |
| Response helpfulness | >4.0/5 average rating per response | Optional thumbs up/down on AI messages |
| Feature retention | >60% of users who try it use it again within 7 days | Track return usage |
| Quick action usage | >50% of sessions start with a quick action chip | Track chip taps vs. freeform input |
| User retention impact | +15% 30-day retention for trainer users vs. non-users | Cohort comparison |
| Average conversation length | 3-5 turns per session | Track turns per conversation |

---

## 4. Requirements

### Must Have
- [ ] Chat interface with user and AI message bubbles
- [ ] Context engine aggregating user profile, current program, recent workouts (4 weeks), PRs
- [ ] Quick action chips for common questions
- [ ] Response streaming (typing indicator then progressive text)
- [ ] Conversation history stored in IndexedDB (last 50 conversations)
- [ ] Clear trainer personality and boundaries in system prompt
- [ ] Medical/injury disclaimer when relevant
- [ ] API route keeping API key server-side
- [ ] Feature gated behind `AI_CONVERSATIONAL_TRAINER` flag

### Should Have
- [ ] Structured program change suggestions with accept/dismiss
- [ ] Thumbs up/down feedback on AI responses
- [ ] Floating action button (FAB) accessible from any screen
- [ ] Voice input option (reuses voice logging infrastructure)
- [ ] Conversation history browsable (past conversations list)
- [ ] "Quiet hours" setting (disable trainer notifications during workout)

### Won't Have (This Version)
- [ ] Proactive trainer notifications (trainer initiates conversation)
- [ ] Multi-modal responses (images, charts in chat)
- [ ] Integration with external data (Whoop, nutrition) - see ai-recovery-integration PRD
- [ ] Auto program adjustment from chat - see ai-adaptive-periodization PRD
- [ ] PR predictions in chat - see ai-predictive-analytics PRD

---

## 5. User Flows

### Flow 1: Quick Action - "Should I Train Today?"

1. User taps trainer FAB (bottom-right, #CDFF00, 56px)
2. Chat interface opens with quick action chips
3. User taps "Should I train today?"
4. Typing indicator appears (3 animated dots)
5. Trainer streams response: "Based on your schedule, today is Upper Push day. You trained yesterday (Lower Body, moderate volume). Your recent consistency is 3.5/4 days this week. I'd recommend training today - you're well within your recovery capacity. Your bench press has been progressing well, so push for the programmed weights."
6. User reads response, optionally asks follow-up: "What if I only slept 5 hours?"
7. Trainer adjusts: "With 5 hours of sleep, I'd still train but reduce intensity by ~10%. Drop working weights from 85kg to 77.5kg on bench and focus on technique. Keep volume the same."

### Flow 2: "Why Am I Stalling?"

1. User opens trainer and taps "Why am I stalling?"
2. Trainer analyzes workout history and identifies stalled lifts
3. Response: "Your bench press has been at 85kg x 10 for 3 weeks, and your OHP hasn't progressed in 2 weeks. Looking at your data: your training volume increased 25% over the last 3 weeks while your rest times have crept up from 90s to 150s. This suggests accumulated fatigue. I'd recommend: (1) a deload week at 60% intensity, (2) returning with paused bench reps for 2 weeks, (3) keeping OHP volume at current level but adding 1 back-off set."
4. User asks: "Should I deload this week?"
5. Trainer responds with specific deload program

### Flow 3: Freeform Question

1. User types: "My shoulder has been feeling tight after bench. Should I be worried?"
2. Trainer responds with data-backed analysis: "Looking at your training data, your chest volume increased 25% over the past 3 weeks. That tightness could be from the volume spike. I'd suggest: (1) Add band pull-aparts between bench sets, (2) Reduce bench from 4 to 3 working sets next week, (3) Add face pulls to your pull day warmup. If it persists beyond 2 weeks, consider seeing a physio. I'm not able to diagnose injuries."

### Flow 4: Off-Topic Question

1. User asks: "What supplements should I take for muscle growth?"
2. Trainer: "I don't prescribe supplements. What I can help with is optimizing your training stimulus and recovery timing. Based on your data, your protein timing could improve - you're often training in the morning without a pre-workout meal. That's a bigger lever than any supplement."

---

## 6. Technical Spec

### Architecture

```
User sends message
       |
       v
+---------------------+
|  Context Engine     | -- Aggregates profile, program, workouts, PRs, trends
+----------+----------+
           |
           v
+---------------------+
|  Build AI Prompt    | -- System prompt + context + conversation history
+----------+----------+
           |
           v
+---------------------+
|  Claude API         | -- Claude Sonnet 4.6 (streaming)
|  (Streaming)        |
+----------+----------+
           |
           v
+---------------------+
|  Render Response    | -- Progressive text reveal with markdown
+---------------------+
```

### Context Engine

```typescript
interface TrainerContext {
  profile: {
    goals: string[];
    experience: string;
    equipment: string;
    injuries: string[];
    trainingDaysPerWeek: number;
  };
  currentProgram: {
    name: string;
    weekNumber: number;
    mesocycleLength: number;
    trainingDays: { name: string; exercises: string[] }[];
  };
  recentPerformance: {
    last4Weeks: {
      sessionsCompleted: number;
      totalVolume: number;
      averageRPE: number;
      prsHit: string[];
    };
    stalledExercises: {
      exercise: string;
      weeksStalled: number;
      lastWeight: number;
      lastReps: number;
    }[];
    volumeTrend: number[]; // weekly totals
    consistencyRate: number;
  };
  recentPRs: { exercise: string; weight: number; reps: number; date: string }[];
}
```

### Files to Create

| File | Purpose |
|------|---------|
| `/src/lib/ai/conversational-trainer.ts` | Chat orchestrator: context building, message management, API calls |
| `/src/lib/ai/trainer-context.ts` | Builds TrainerContext from IndexedDB data |
| `/src/lib/ai/prompts/trainer-prompt.ts` | System prompt with personality, boundaries, knowledge |
| `/src/components/trainer/trainer-chat.tsx` | Full-screen chat interface |
| `/src/components/trainer/trainer-message.tsx` | Individual message bubble (user and AI) |
| `/src/components/trainer/trainer-fab.tsx` | Floating action button |
| `/src/components/trainer/quick-actions.tsx` | Quick action chip row |
| `/src/hooks/use-trainer.ts` | Hook for trainer state, conversation history |
| `/src/hooks/use-trainer-context.ts` | Hook for building TrainerContext |
| `/src/app/trainer/page.tsx` | Trainer chat page |
| `/src/app/api/ai/trainer/route.ts` | API route with streaming response |

### Files to Modify

| File | Change |
|------|--------|
| `/src/lib/db.ts` | Add `TrainerConversation` interface and table |
| `/src/lib/queries.ts` | Add `useTrainerChat()`, `useTrainerHistory()` hooks |
| `/src/components/layout/bottom-nav.tsx` | Add trainer FAB above nav |
| `/src/lib/feature-flags.ts` | Add `AI_CONVERSATIONAL_TRAINER` feature flag |

### API/Model Requirements

| Requirement | Detail |
|-------------|--------|
| Model | Claude Sonnet 4.6 (needs reasoning for training decisions) |
| Context window | ~8,000-12,000 tokens (TrainerContext + conversation history) |
| Output tokens | ~500-1,000 per response |
| Latency | 3-8 seconds for full response (streaming makes it feel faster) |
| Cost per turn | ~$0.03-0.05 |
| Conversation history | Last 20 messages in context; older summarized |
| Streaming | Required for chat UX |
| Daily limit | 10 conversations/day (free tier) |

---

## 7. Design

### Trainer Chat Interface

```
+-------------------------------------------+
|  AI Trainer                        [...]  |
+-------------------------------------------+
|                                           |
|  Quick Actions:                           |
|  [Should I train?] [Analyze week]        |
|  [Why am I stalling?] [What to change?]  |
|                                           |
|  +-------------------------------+        |
|  | Trainer: Good morning! Based  |        |
|  | on your training this week,   |        |
|  | you've completed 3/4 planned  |        |
|  | sessions. Nice consistency.   |        |
|  |                               |        |
|  | Today is Upper Push day.      |        |
|  | Ready to train?               |        |
|  +-------------------------------+        |
|                                           |
|       +-------------------------------+   |
|       | You: My shoulder is tight     |   |
|       | after bench lately.           |   |
|       +-------------------------------+   |
|                                           |
|  +-------------------------------+        |
|  | Trainer: Looking at your data, |        |
|  | your chest volume increased    |        |
|  | 25% over 3 weeks. I suggest:  |        |
|  |                               |        |
|  | 1. Band pull-aparts between   |        |
|  |    bench sets (3x15)          |        |
|  | 2. Reduce bench from 4 to 3   |        |
|  |    working sets               |        |
|  | 3. Add face pulls to pull day |        |
|  |                               |        |
|  | If it persists beyond 2 weeks,|        |
|  | consider seeing a physio.     |        |
|  +-------------------------------+        |
|                                           |
|  [Mic]  [Type a message...]      [Send]  |
+-------------------------------------------+
```

### Floating Action Button

```
+----------------------------+
|  [Any screen content]      |
|                            |
|                      +--+  |
|                      |AI|  |  <- 56px, #CDFF00 bg
|                      +--+  |     bottom-right, above nav
+----------------------------+
```

### Component Table

| Component | File | Purpose |
|-----------|------|---------|
| TrainerChat | `trainer-chat.tsx` | Full-screen chat with message list and input |
| TrainerMessage | `trainer-message.tsx` | Individual bubble with markdown rendering |
| TrainerFAB | `trainer-fab.tsx` | 56px floating button, accent color |
| QuickActions | `quick-actions.tsx` | Horizontal chip row |
| useTrainer | `use-trainer.ts` | Chat state, streaming, history |

### Visual Spec

| Element | Value |
|---------|-------|
| Chat background | #0A0A0A |
| AI message bubble | #1A1A1A, #CDFF00 3px left border, 12px radius |
| User message bubble | #2A2A2A, no accent border, 12px radius |
| Quick action chips | Outlined, #CDFF00 text, #CDFF00/10 bg, 32px height |
| FAB | 56px circle, #CDFF00 bg, AI icon in #0A0A0A |
| FAB glow (pending notification) | Pulsing #CDFF00 box-shadow |
| Typing indicator | 3 dots animation in #CDFF00 |
| Streaming text | Text appears progressively, no flicker |
| Input field | #2A2A2A bg, 44px height, 12px radius |
| Send button | #CDFF00, 44px |
| Font | Inter, 16px message body, 14px timestamp |
| Touch targets | 44px minimum all interactive elements |

---

## 8. Implementation Plan

### Dependencies Checklist
- [ ] Shared AI client (`ai-client.ts`) with streaming support
- [ ] Workout history queries working (last 4 weeks)
- [ ] PR tracking functional
- [ ] Program data accessible
- [ ] OnboardingProfile data available

### Build Order

1. **Create trainer context builder** - `/src/lib/ai/trainer-context.ts` aggregating all user data into TrainerContext
2. **Create system prompt** - `/src/lib/ai/prompts/trainer-prompt.ts` with personality, boundaries, data formatting
3. **Create trainer orchestrator** - `/src/lib/ai/conversational-trainer.ts` managing context, history, API calls
4. **Create streaming API route** - `/src/app/api/ai/trainer/route.ts` with response streaming
5. **Create useTrainer hook** - managing chat state, streaming text, conversation history
6. **Create message component** - `trainer-message.tsx` with markdown rendering, timestamp
7. **Create quick actions** - `quick-actions.tsx` with chip row
8. **Create chat page** - `trainer-chat.tsx` combining messages, input, quick actions
9. **Create FAB** - `trainer-fab.tsx` positioned above bottom nav
10. **Create trainer page route** - `/src/app/trainer/page.tsx`
11. **Add DB table** - TrainerConversation in `db.ts`
12. **Integrate FAB** - Add to bottom nav layout
13. **Add feature flag** - `AI_CONVERSATIONAL_TRAINER` in `feature-flags.ts`

---

## 9. Edge Cases

| Edge Case | Handling |
|-----------|----------|
| User asks medical question ("Is this a torn rotator cuff?") | Disclaimer: "I'm a training AI, not a medical professional. Based on your description, I'd recommend seeing a physiotherapist. Meanwhile, avoid overhead movements." |
| User hasn't trained in 2+ weeks | Suggest return-to-training protocol: reduce volume 40%, intensity 20%, rebuild over 2 weeks |
| Conversation goes off-topic (e.g., relationship advice) | Politely redirect: "That's outside my expertise. I'm best at training, recovery, and nutrition-related questions." |
| Multiple conflicting goals ("get shredded and gain 10kg muscle") | Explain trade-offs honestly: "These goals require different approaches. Shall we focus on one first?" |
| New user with <1 week of data | Limited to onboarding-based advice: "I'll have much better recommendations after a few weeks of training data." |
| Offline | Chat disabled (requires API). Show cached last conversation. Queue messages for when online. |
| High usage (many conversations/day) | Daily limit: 10 conversations. Show: "You've reached today's conversation limit. Resets at midnight." |
| AI suggests dangerously heavy weight | Validator caps suggestions at max 110% of current working weight; never >+5kg increase |
| User overrides all AI advice | After 3 consecutive overrides: "I notice you've been adjusting my recommendations. Would you prefer different advice style?" |

---

## 10. Testing

### Functional Tests
- [ ] Chat loads with trainer context (profile, program, recent workouts)
- [ ] Quick action chips generate appropriate responses
- [ ] Response streaming works (typing indicator then progressive text)
- [ ] Conversation history saved to IndexedDB
- [ ] Previous conversations browsable
- [ ] Trainer references actual user data in responses (exercise names, weights, dates)
- [ ] Medical disclaimer appears for injury-related questions
- [ ] Off-topic redirect works for non-training questions
- [ ] Daily conversation limit enforced (10/day)
- [ ] Voice input works (reuses voice logging mic button)
- [ ] Markdown rendered correctly in AI messages (bold, lists, headings)
- [ ] Offline state: chat disabled, cached conversation shown

### UI Verification
- [ ] FAB visible on all main screens (home, program, stats)
- [ ] FAB positioned bottom-right, above nav, 56px, #CDFF00
- [ ] Chat background #0A0A0A
- [ ] AI bubbles #1A1A1A with #CDFF00 left border
- [ ] User bubbles #2A2A2A
- [ ] Quick action chips outlined with #CDFF00 text
- [ ] Typing indicator animates correctly
- [ ] Streaming text appears smoothly without flicker
- [ ] Input field meets 44px height
- [ ] Send button meets 44px touch target
- [ ] Scrolling works with long conversations

---

## 11. Launch Checklist

- [ ] Feature flag `AI_CONVERSATIONAL_TRAINER` added and tested
- [ ] Streaming API route working end-to-end
- [ ] Trainer context includes real user data (not dummy)
- [ ] System prompt reviewed for personality and boundaries
- [ ] Medical disclaimer copy reviewed by team
- [ ] Daily limit enforced (10 conversations)
- [ ] Conversation history persists across sessions
- [ ] FAB does not obstruct content on any page
- [ ] Tested on iOS Safari PWA mode
- [ ] Tested on Chrome Android
- [ ] Cost monitoring: track API spend per day
- [ ] Markdown rendering tested with all common patterns (bold, lists, code)
- [ ] Offline behavior: graceful disabled state

---

## 12. Risks & Mitigations

| Risk | Impact | Mitigation |
|------|--------|------------|
| Users treat AI as medical advisor | Liability, bad advice | Consistent disclaimers; never diagnose; always refer to professionals |
| Low response quality (generic advice) | Users abandon feature | Rich context engine; include specific data points in every response |
| High API cost per conversation | Budget overrun | Daily limit (10 conversations); use conversation summarization for history; monitor spend |
| Streaming failures mid-response | Broken UX | Retry logic; show partial response with "Continue" button |
| Trainer gives contradictory advice across sessions | Confusion | Include conversation summary in context; maintain consistent training philosophy |
| Users expect 24/7 proactive coaching | Feature doesn't match expectations | Clear positioning: "Ask your trainer anything" not "Your trainer watches everything" |
| Context window overflow with long history | API errors or truncated context | Summarize conversations older than 20 messages; cap context at 12K tokens |
| Trainer suggests exercises not in user's program | Confusion with program management | Only reference exercises from user's active program and exercise database |

---

## 13. Dependencies

| Dependency | Status | Required For |
|------------|--------|-------------|
| PRD 1: AI Program Generation (shared AI client) | Required | API infrastructure, streaming support |
| Workout history data (4+ weeks) | Per-user | Meaningful context for advice |
| Program data model | Complete | Current program context |
| PR tracking | Complete | Performance trend data |
| OnboardingProfile | Complete | User profile context |
| Feature flags system | Complete | Gating rollout |
| Streaming API support in Next.js | Available | Chat UX |

### Privacy & Data

| Data | Where It Goes | Retention |
|------|---------------|-----------|
| Aggregated workout history (trends, not raw logs) | Sent to Claude API per conversation | Not stored by API |
| Current program structure | Sent to Claude API | Not stored by API |
| Personal records | Sent to Claude API | Not stored by API |
| Conversation history | Stored locally in IndexedDB | Last 50 conversations, older auto-archived |
| User profile (goals, injuries) | Sent to Claude API | Not stored by API |

### User Consent
- First trainer use: "Your AI Trainer analyzes your training history and goals to provide personalized coaching. All data is processed securely and not stored on external servers."
- Users can export/delete all trainer data from Settings

---

## 14. Changelog

| Date | Change |
|------|--------|
| 2026-03-26 | Initial draft - split from ai-personal-trainer.md vision doc. Full 14-section PRD with all requirements, flows, and specs. |
