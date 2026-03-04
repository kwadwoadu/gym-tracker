# AI Natural Language Workout Logging

> **Status:** Draft
> **Owner:** Kwadwo
> **Created:** 2026-03-04
> **Priority:** P1
> **Roadmap Phase:** Phase 3 - AI Features

---

## Problem Statement

Manual weight and rep input during workouts is slow and cumbersome. Users have sweaty hands, are out of breath, and are holding their phones awkwardly between sets. The current flow requires tapping into a weight field, using a number pad, tapping reps, optionally logging RPE - 4-6 taps minimum per set. This friction discourages logging every set, especially for supersets where rest time is short.

Voice input would let users log sets hands-free in natural language, dramatically reducing friction and increasing logging compliance.

---

## Proposed Solution

Voice-activated workout logging that accepts natural language input and parses it into structured set data. Users speak naturally ("100kg bench, 8 reps, felt hard") and the system extracts weight, reps, RPE, and exercise context automatically.

### Core Behaviors

1. **One-Shot Voice Logging**: User holds a mic button (or says a wake phrase if AirPods connected) and speaks:
   - "100 kilos, 8 reps, RPE 8"
   - "Same weight, 10 reps"
   - "Up 2.5, did 8"
   - "bodyweight, 12 reps, easy"

   The system parses this into `{ weight: 100, reps: 8, rpe: 8 }` and auto-fills the set logger.

2. **Contextual Understanding**: The parser understands context from the current workout state:
   - "Same weight" = repeat last logged weight
   - "Up 2.5" = last weight + 2.5kg
   - "Down 5" = last weight - 5kg
   - "Failed at 6" = reps: 6, implies RPE 10

3. **Conversational Mode**: User can say "Log my workout" and the AI asks guided questions:
   - "What exercise are you on?" -> "Bench press"
   - "What weight and how many reps?" -> "85 for 10"
   - "How did it feel?" -> "Pretty hard, like an 8"
   - AI: "Got it - 85kg, 10 reps, RPE 8. Logging now."

4. **Multi-Device Input**:
   - Phone mic (primary)
   - Apple Watch (via companion app - future)
   - AirPods / Bluetooth headphones (using phone as relay)

5. **Confirmation & Correction**: After parsing, show a brief confirmation toast with parsed values. User can tap to correct if the parse was wrong.

---

## Success Metrics

| Metric | Target | How to Measure |
|--------|--------|----------------|
| Voice logging accuracy | >90% correct parse on first attempt | Compare voice-parsed vs. manually corrected values |
| Logging speed improvement | 3x faster than manual (2s vs. 6s per set) | Time from mic press to set saved |
| Voice adoption rate | >30% of sets logged via voice after feature discovery | Track input method per set |
| Correction rate | <15% of voice-logged sets need manual correction | Track edits after voice logging |
| Conversational mode usage | >20% of users try conversational mode | Track conversational sessions started |

---

## User Stories

- As a user between sets, I want to say "85 kilos, 10 reps, RPE 8" and have my set logged automatically so I don't have to type with sweaty hands.
- As a user doing the same weight across sets, I want to say "same, 10 reps" and have it fill in the previous weight.
- As a user who doesn't remember the RPE scale, I want to say "felt hard" and have the AI interpret that as an RPE value.
- As a user with AirPods, I want to speak my set data without touching my phone.
- As a user who said something incorrectly, I want to see a confirmation I can quickly tap to correct.
- As a new user, I want to say "Log my workout" and have the AI guide me through each field conversationally.

---

## Technical Scope

### Architecture

```
User presses mic button / says wake phrase
        |
        v
┌──────────────────────┐
│  Web Speech API      │ -- Browser-native speech-to-text
│  (SpeechRecognition) │
└──────────┬───────────┘
        |
        v
┌──────────────────────┐
│  Raw transcript      │ -- "eighty-five kilos ten reps RPE eight"
└──────────┬───────────┘
        |
        v
┌──────────────────────┐
│  NLP Parser          │ -- Extract weight, reps, RPE, modifiers
│  (Tier 1: regex +    │
│   Tier 2: AI)        │
└──────────┬───────────┘
        |
        v
┌──────────────────────┐
│  Context Resolver    │ -- Apply "same weight", "up 2.5" relative to last set
└──────────┬───────────┘
        |
        v
┌──────────────────────┐
│  Confirmation Toast  │ -- "85kg x 10 @ RPE 8" [Save] [Edit]
└──────────┬───────────┘
        |
        v
┌──────────────────────┐
│  Save to SetLog      │ -- Same path as manual logging
└──────────────────────┘
```

### Two-Tier Parsing System

**Tier 1 - Local Regex Parser (offline-capable)**:
- Pattern matching for common formats: "X kg, Y reps", "X for Y", "X by Y"
- Number extraction with unit detection (kg/lbs/pounds/kilos)
- RPE extraction ("RPE 8", "RPE eight", "rate 8")
- Modifier detection ("same", "up", "down", "plus", "minus")
- Natural language RPE: "easy" = 5-6, "moderate" = 7, "hard" = 8, "very hard" = 9, "failed" / "max" = 10

**Tier 2 - AI Parser (for ambiguous input)**:
- Falls back to Claude API when Tier 1 confidence is low
- Handles complex phrases: "I did three more than last time at the same weight"
- Conversational mode guided dialogue
- Multi-language support (future)

### Files to Create

| File | Purpose |
|------|---------|
| `/src/lib/ai/voice-logger.ts` | Orchestrator: speech capture -> parse -> resolve -> confirm |
| `/src/lib/ai/voice-parser.ts` | Tier 1 regex-based NLP parser for set data extraction |
| `/src/lib/ai/voice-context.ts` | Context resolver: handles "same", "up 2.5", relative references |
| `/src/lib/ai/prompts/voice-prompt.ts` | Tier 2 AI prompt for ambiguous input parsing |
| `/src/lib/speech.ts` | Web Speech API wrapper with iOS Safari compatibility handling |
| `/src/components/workout/voice-button.tsx` | Mic button component with recording state animation |
| `/src/components/workout/voice-confirmation.tsx` | Confirmation toast showing parsed values |
| `/src/components/workout/voice-conversation.tsx` | Conversational mode UI with chat-like interface |
| `/src/hooks/use-voice-logging.ts` | React hook managing voice state, parsing, and confirmation flow |
| `/src/app/api/ai/parse-voice/route.ts` | API route for Tier 2 AI parsing |

### Files to Modify

| File | Change |
|------|--------|
| `/src/components/workout/set-logger.tsx` | Add voice button next to manual input fields |
| `/src/components/workout/rest-timer.tsx` | Add "Log via voice" shortcut during rest period |
| `/src/lib/db.ts` | Add `inputMethod: 'manual' \| 'voice'` field to SetLog |
| `/src/lib/feature-flags.ts` | Add `AI_VOICE_LOGGING` feature flag |
| `/src/lib/audio.ts` | Add mic activation/deactivation sounds |

### New Dependencies

| Package | Purpose | Size |
|---------|---------|------|
| None | Web Speech API is browser-native | 0KB |

### API/Model Requirements

| Requirement | Detail |
|-------------|--------|
| Speech-to-Text | Web Speech API (browser native, free) |
| AI Parser (Tier 2) | Claude 3.5 Haiku (fast, for ambiguous input only) |
| Tier 2 input tokens | ~200 (transcript + current exercise context) |
| Tier 2 output tokens | ~50 (structured set data JSON) |
| Tier 2 latency | <1 second |
| Tier 2 frequency | <10% of voice inputs need Tier 2 (most handled by regex) |
| Offline capability | Tier 1 parser works fully offline; speech-to-text requires online (Web Speech API) |

---

## Design Requirements

### Voice Button Integration

```
┌─────────────────────────────────────────┐
│  Set Logger                              │
│  Bench Press - Set 3 of 4                │
│                                          │
│  ┌──────┐  ┌──────┐  ┌──────┐           │
│  │ 85   │  │ 10   │  │ RPE 8│           │
│  │  kg  │  │ reps │  │      │           │
│  └──────┘  └──────┘  └──────┘           │
│                                          │
│  [Complete Set]          [🎤 Voice]      │
│                          ← Mic button    │
└─────────────────────────────────────────┘
```

### Active Recording State

```
┌─────────────────────────────────────────┐
│  ┌───────────────────────────────────┐   │
│  │  ● Recording...                   │   │
│  │                                   │   │
│  │  ~~~ ▁▃▅▇▅▃▁ ~~~                │   │
│  │      (waveform)                   │   │
│  │                                   │   │
│  │  "eighty-five kilos ten reps..."  │   │
│  │                                   │   │
│  │  [Stop]                           │   │
│  └───────────────────────────────────┘   │
└─────────────────────────────────────────┘
```

### Confirmation Toast

```
┌─────────────────────────────────────────┐
│  ┌──── Voice Logged ────────────────┐   │
│  │                                   │   │
│  │  85kg x 10 reps @ RPE 8          │   │
│  │                                   │   │
│  │  [Save]  [Edit]            3s... │   │
│  └───────────────────────────────────┘   │
│  Auto-saves in 3 seconds                │
└─────────────────────────────────────────┘
```

### Conversational Mode

```
┌─────────────────────────────────────────┐
│  Voice Coach                      [x]   │
├─────────────────────────────────────────┤
│                                          │
│  ┌──────────────────────────────┐        │
│  │ AI: What exercise?           │        │
│  └──────────────────────────────┘        │
│                                          │
│         ┌──────────────────────────────┐ │
│         │ You: Bench press             │ │
│         └──────────────────────────────┘ │
│                                          │
│  ┌──────────────────────────────┐        │
│  │ AI: Weight and reps?         │        │
│  └──────────────────────────────┘        │
│                                          │
│         ┌──────────────────────────────┐ │
│         │ You: 85 for 10               │ │
│         └──────────────────────────────┘ │
│                                          │
│  ┌──────────────────────────────┐        │
│  │ AI: Got it! 85kg x 10.      │        │
│  │ How hard was it? (RPE)       │        │
│  └──────────────────────────────┘        │
│                                          │
│  [🎤 Speak]                [Type...]    │
└─────────────────────────────────────────┘
```

### Visual Style
- Mic button: circular, accent color (#CDFF00) background, 48px diameter
- Recording state: pulsing red dot, waveform visualization (Framer Motion)
- Confirmation toast: slides up from bottom, auto-dismisses after 3s if no edit
- Conversational mode: chat bubble UI, AI bubbles left-aligned, user bubbles right-aligned
- Dark theme throughout

---

## Edge Cases

| Edge Case | Handling |
|-----------|----------|
| Noisy gym environment | Show "Couldn't understand. Try again?" with option to type manually |
| Speech API not supported (older browsers) | Hide voice button entirely; no degraded experience |
| iOS Safari speech restrictions | Require user gesture (button tap) to start; can't use wake phrase on iOS web |
| User says exercise name instead of set data | Detect exercise name, switch to that exercise in the current workout |
| Ambiguous numbers: "one ten" (110 or 1 set of 10?) | Use context: if current exercise typically uses >50kg, interpret as 110; otherwise ask |
| Mixed units: "225 pounds" when app is set to kg | Parse the unit spoken, convert to user's preferred unit |
| User says "cancel" or "never mind" | Abort parsing, return to manual mode |
| Bluetooth mic (AirPods) audio quality issues | Web Speech API handles this; may need higher volume threshold |
| Multiple sets in one phrase: "Three sets of 10 at 80" | Parse all three sets, show batch confirmation |
| Non-English input | V1: English only. Show language setting in voice preferences |
| Speech API returns mid-sentence (partial results) | Wait for final result (isFinal flag) before parsing |

---

## Privacy & Data

| Data | Where It Goes | Retention |
|------|---------------|-----------|
| Voice audio | Processed by Web Speech API (browser/OS level) | Not stored by SetFlow |
| Transcript text | Processed locally by Tier 1 parser | Not stored (transient) |
| Ambiguous transcripts (Tier 2) | Sent to Claude API for parsing | Not stored by API |
| Parsed set data | Stored in IndexedDB as normal SetLog | Until user deletes |
| Input method tracking | Stored locally (analytics) | Aggregated only |

### User Consent
- First use shows brief explanation: "Voice logging sends your speech to your browser's speech recognition service. SetFlow never stores audio recordings."
- Microphone permission handled by browser (standard permission prompt)
- Users can disable voice logging entirely in Settings

### Important Notes
- SetFlow never stores audio recordings
- Web Speech API processes audio at the browser/OS level (Google's servers for Chrome, Apple's for Safari)
- Only the text transcript is used by SetFlow; audio is discarded immediately
- Tier 2 AI parsing sends only the text transcript, never audio

---

## Priority

**P1 - Should Ship**

Voice logging addresses the single biggest UX friction point in the app (manual data entry during workouts). It has the potential to dramatically increase logging compliance, which improves all downstream features (progressive overload, copilot, analytics). The Web Speech API is free and browser-native, making this a high-impact, relatively low-cost feature.

---

## Dependencies

| Dependency | Status | Required For |
|------------|--------|-------------|
| Web Speech API browser support | Available (Chrome, Safari, Edge) | Core functionality |
| Set logging flow | Complete | Integration point |
| AI client (`ai-client.ts`) | Created in PRD 1 | Tier 2 parsing |
| Audio system (`audio.ts`) | Complete | Mic activation sounds |
| Feature flags system | Complete | Gating rollout |
| PRD 1 (AI Program Generation) | Recommended first | Shared AI infrastructure |

---

## Changelog

| Date | Change |
|------|--------|
| 2026-03-04 | Initial draft |
