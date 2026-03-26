# AI Natural Language Workout Logging

> **Status:** SHIPPED
> **Owner:** Kwadwo
> **Created:** 2026-03-04
> **Priority:** P1
> **Roadmap Phase:** Phase 3 - AI Features

---

## 1. Problem Statement

Manual weight and rep input during workouts is slow and cumbersome. Users have sweaty hands, are out of breath, and are holding their phones awkwardly between sets. The current flow requires tapping into a weight field, using a number pad, tapping reps, optionally logging RPE - 4-6 taps minimum per set. This friction discourages logging every set, especially for supersets where rest time is short.

Voice input would let users log sets hands-free in natural language, dramatically reducing friction and increasing logging compliance.

---

## 2. Proposed Solution

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

## 3. Success Metrics

| Metric | Target | How to Measure |
|--------|--------|----------------|
| Voice logging accuracy | >90% correct parse on first attempt | Compare voice-parsed vs. manually corrected values |
| Logging speed improvement | 3x faster than manual (2s vs. 6s per set) | Time from mic press to set saved |
| Voice adoption rate | >30% of sets logged via voice after feature discovery | Track input method per set |
| Correction rate | <15% of voice-logged sets need manual correction | Track edits after voice logging |
| Conversational mode usage | >20% of users try conversational mode | Track conversational sessions started |

---

## 4. Requirements

### Must Have
- [ ] Voice button in set logger UI (hold-to-record or tap-to-toggle)
- [ ] Web Speech API integration for speech-to-text
- [ ] Tier 1 local regex parser for common formats (weight, reps, RPE extraction)
- [ ] Context resolver for relative references ("same weight", "up 2.5", "down 5")
- [ ] Confirmation toast with parsed values and auto-save countdown (3s)
- [ ] Edit option on confirmation toast for corrections
- [ ] Natural language RPE ("easy" = 5-6, "hard" = 8, "failed" = 10)
- [ ] `inputMethod: 'manual' | 'voice'` tracking on SetLog
- [ ] Graceful degradation when Web Speech API not supported (hide voice button)

### Should Have
- [ ] Tier 2 AI parser fallback for ambiguous input (confidence < 85%)
- [ ] Conversational mode for guided voice logging
- [ ] Waveform visualization during recording (Framer Motion)
- [ ] Mixed unit handling ("225 pounds" auto-converts to kg if user preference is kg)
- [ ] Batch logging ("three sets of 10 at 80" parses to 3 sets)
- [ ] Mic activation/deactivation sounds via Web Audio API
- [ ] User consent dialog on first voice use

### Won't Have (This Version)
- [ ] Apple Watch companion app for voice input
- [ ] Wake phrase activation (not possible on iOS web)
- [ ] Multi-language support (English only in V1)
- [ ] Offline speech-to-text (Web Speech API requires internet)

### Browser Compatibility Notes

| Browser | SpeechRecognition Support | Notes |
|---------|--------------------------|-------|
| Chrome (Android/Desktop) | Full support via `webkitSpeechRecognition` | Uses Google servers for STT |
| Safari (iOS 14.5+) | Supported via `webkitSpeechRecognition` | Uses Apple servers for STT. Requires user gesture to start. No continuous mode. |
| Safari (macOS) | Supported | Same as iOS Safari |
| Edge | Full support | Chromium-based, mirrors Chrome |
| Firefox | Not supported | Hide voice button entirely |

**Key Safari/iOS Differences:**
- Must use `webkitSpeechRecognition` (not `SpeechRecognition`)
- Requires explicit user tap to start (no programmatic trigger)
- `continuous` mode unreliable on iOS - use single-shot recognition
- Permission prompt appears on first use (standard browser mic permission)
- Audio playback context may need user gesture to resume after mic use

---

## 5. User Flows

### Flow 1: Quick Voice Logging (Primary)

1. User is in active workout, on Bench Press Set 3
2. User taps the mic button (circular, #CDFF00, 48px) next to the set logger inputs
3. Recording state activates: red pulsing dot, waveform animation, live transcript preview
4. User says: "85 kilos, 10 reps, RPE 8"
5. User releases mic button (or taps Stop)
6. Tier 1 parser extracts: `{ weight: 85, reps: 10, rpe: 8 }` (confidence: 100%)
7. Confirmation toast slides up: "85kg x 10 reps @ RPE 8" with [Save] and [Edit]
8. Auto-saves after 3 seconds if user doesn't tap Edit
9. Set logged with `inputMethod: 'voice'`

### Flow 2: Relative Reference

1. User logged previous set at 85kg
2. User taps mic and says "same weight, 8 reps"
3. Context resolver maps "same weight" to 85kg from last set
4. Confirmation toast: "85kg x 8 reps" with [Save] and [Edit]

### Flow 3: Ambiguous Input (Tier 2 Fallback)

1. User says "I did three more than last time at the same weight"
2. Tier 1 confidence is 40% (can't parse complex relative reference)
3. System falls back to Tier 2 AI parser via API
4. AI resolves: last set was 8 reps, so "three more" = 11 reps, same weight = 85kg
5. Confirmation toast: "85kg x 11 reps" with [Save] and [Edit]
6. If Tier 2 takes >1.5s, auto-complete with Tier 1 best-guess + edit prompt

### Flow 4: Conversational Mode

1. User taps "Log via Voice" during rest timer
2. Conversational UI opens (chat-like interface)
3. AI asks: "What exercise are you on?"
4. User speaks: "Bench press"
5. AI asks: "What weight and how many reps?"
6. User speaks: "85 for 10"
7. AI asks: "How did it feel?"
8. User speaks: "Pretty hard, like an 8"
9. AI confirms: "Got it - 85kg, 10 reps, RPE 8. Logging now."
10. Set saved with confirmation

---

## 6. Technical Spec

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

### Confidence Scoring

- Tier 1 minimum confidence threshold: 85%
- Scoring: (fields_matched / total_required_fields) * 100
- Required fields: weight (40%), reps (40%), RPE (20% - optional)
- Example: "eighty-five kilos" -> weight extracted (40%), reps missing -> 40% confidence -> triggers Tier 2
- Ambiguous keywords ("same", "up", "down"): require 95% confidence threshold to stay on Tier 1
- If Tier 2 timeout (>1.5s): use Tier 1 result even if confidence <85%, show edit toast

### Integration with Form Analysis

Voice-logged sets will have formScore = null. Form analysis (ai-form-analysis.md) requires video input and only applies to manually-logged or video-analyzed sets. Voice input and form analysis are independent features that coexist on the SetLog model without conflict.

### Fallback Strategy

- If Tier 2 API call exceeds 1.5 seconds, auto-complete with Tier 1 result
- Show disambiguation toast: "Couldn't parse perfectly - tap to edit"
- Queue failed Tier 2 requests in Dexie for re-parse when network is stable
- For offline: Tier 1 regex parser works fully offline; show "Voice input requires internet for best accuracy" toast

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
| AI Parser (Tier 2) | Claude 4.5 Haiku (claude-haiku-4-5-20251001, fast, for ambiguous input only) |
| Tier 2 input tokens | ~200 (transcript + current exercise context) |
| Tier 2 output tokens | ~50 (structured set data JSON) |
| Tier 2 latency | <1 second |
| Tier 2 frequency | <10% of voice inputs need Tier 2 (most handled by regex) |
| Offline capability | Tier 1 parser works fully offline; speech-to-text requires online (Web Speech API) |

---

## 7. Design

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

### Component Table

| Component | File | Purpose |
|-----------|------|---------|
| VoiceButton | `voice-button.tsx` | Mic button with recording state animation |
| VoiceConfirmation | `voice-confirmation.tsx` | Toast with parsed values, Save/Edit, auto-save countdown |
| VoiceConversation | `voice-conversation.tsx` | Chat-like conversational logging UI |
| useVoiceLogging | `use-voice-logging.ts` | Hook managing voice state, parsing, confirmation |

### Visual Spec

| Element | Value |
|---------|-------|
| Mic button | Circular, 48px diameter, #CDFF00 background, mic icon in #0A0A0A |
| Recording state | Pulsing red dot (#EF4444), waveform in #CDFF00, #1A1A1A background |
| Confirmation toast | #1A1A1A bg, slides up from bottom, 12px border-radius |
| Auto-save countdown | Circular progress in #CDFF00, 3s timer |
| Conversational bubbles | AI: left-aligned #1A1A1A, User: right-aligned #2A2A2A |
| Transcript preview | #A0A0A0 text, italic, updates in real-time |
| Font | Inter, 16px body, 14px caption |
| Touch targets | 48px mic button, 44px minimum for Save/Edit |

---

## 8. Implementation Plan

### Dependencies Checklist
- [ ] Shared AI client (`ai-client.ts`) exists from PRD 1
- [ ] Web Speech API available in target browsers (Chrome, Safari, Edge)
- [ ] Set logger component accessible for integration
- [ ] Audio system (`audio.ts`) supports mic activation sounds

### Build Order

1. **Create speech wrapper** - `/src/lib/speech.ts` with Web Speech API abstraction, Safari/Chrome compatibility, permission handling
2. **Create Tier 1 regex parser** - `/src/lib/ai/voice-parser.ts` with number extraction, unit detection, RPE mapping, modifier detection
3. **Create context resolver** - `/src/lib/ai/voice-context.ts` handling "same", "up", "down" relative to workout state
4. **Create Tier 2 AI prompt** - `/src/lib/ai/prompts/voice-prompt.ts` for ambiguous input
5. **Create API route** - `/src/app/api/ai/parse-voice/route.ts` for Tier 2 parsing
6. **Create voice orchestrator** - `/src/lib/ai/voice-logger.ts` combining speech capture, parsing, context resolution
7. **Create voice button component** - `voice-button.tsx` with recording animation
8. **Create confirmation toast** - `voice-confirmation.tsx` with parsed values, edit option, auto-save
9. **Create conversational mode UI** - `voice-conversation.tsx` with chat interface
10. **Create useVoiceLogging hook** - managing voice state, parsing flow, confirmation
11. **Integrate with set logger** - Add voice button to `set-logger.tsx`
12. **Integrate with rest timer** - Add "Log via voice" shortcut to `rest-timer.tsx`
13. **Modify DB schema** - Add `inputMethod` field to SetLog in `db.ts`
14. **Add feature flag** - `AI_VOICE_LOGGING` in `feature-flags.ts`
15. **Add mic sounds** - Activation/deactivation sounds in `audio.ts`

---

## 9. Edge Cases

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

## 10. Testing

### Functional Tests
- [ ] Voice recognition works on Chrome Android
- [ ] Voice recognition works on iOS Safari (PWA mode)
- [ ] Voice recognition works on Chrome Desktop
- [ ] Voice button hidden on Firefox (unsupported)
- [ ] Tier 1 parses "85 kilos, 10 reps, RPE 8" correctly
- [ ] Tier 1 parses "same weight, 8 reps" using context from last set
- [ ] Tier 1 parses "up 2.5, did 10" as (last weight + 2.5kg), 10 reps
- [ ] Tier 1 parses natural RPE: "felt hard" maps to RPE 8
- [ ] Tier 1 handles "failed at 6" as reps: 6, RPE: 10
- [ ] Tier 2 fallback triggers when Tier 1 confidence < 85%
- [ ] Tier 2 timeout (>1.5s) auto-completes with Tier 1 best-guess
- [ ] Confirmation toast auto-saves after 3 seconds
- [ ] Edit button on toast opens manual input with pre-filled values
- [ ] "Cancel" / "never mind" aborts parsing
- [ ] Mixed units ("225 pounds") converted to user's preferred unit
- [ ] Batch logging ("three sets of 10 at 80") creates 3 sets
- [ ] Microphone permission prompt appears on first use
- [ ] InputMethod tracked as 'voice' on saved SetLog

### UI Verification
- [ ] Mic button is 48px circular with #CDFF00 background
- [ ] Recording state shows pulsing red dot animation
- [ ] Waveform visualization animates during recording
- [ ] Live transcript preview updates in real-time
- [ ] Confirmation toast slides up from bottom smoothly
- [ ] Auto-save countdown circle animates in #CDFF00
- [ ] Conversational mode bubbles align correctly (AI left, user right)
- [ ] Dark theme consistent (#0A0A0A bg, #1A1A1A toast bg)
- [ ] Mic activation sound plays on tap
- [ ] Voice button accessible but not intrusive in set logger layout

---

## 11. Launch Checklist

- [ ] Feature flag `AI_VOICE_LOGGING` added and tested (on/off)
- [ ] Web Speech API wrapper tested on iOS Safari 14.5+
- [ ] Web Speech API wrapper tested on Chrome Android
- [ ] Tier 1 parser accuracy >90% on 50 test phrases
- [ ] Tier 2 API route working with shared `ai-client.ts`
- [ ] Mic permission flow tested on iOS (requires user gesture)
- [ ] Mic permission flow tested on Chrome
- [ ] Voice button hidden on unsupported browsers
- [ ] Confirmation toast UX tested with real users during workout
- [ ] Audio feedback (mic sounds) plays correctly on iOS
- [ ] Consent dialog copy reviewed
- [ ] Offline behavior: voice button shows "Requires internet" tooltip
- [ ] No audio recordings stored anywhere (privacy audit)
- [ ] Tested on iOS Safari PWA (Add to Home Screen mode)
- [ ] Bundle size impact measured

---

## 12. Risks & Mitigations

| Risk | Impact | Mitigation |
|------|--------|------------|
| Noisy gym environment reduces accuracy | High correction rate, frustration | Show manual fallback prominently; suggest moving phone closer to mouth |
| iOS Safari Web Speech API instability | Feature unreliable on primary target device | Thorough testing on iOS 14.5+; graceful fallback to manual input |
| Web Speech API removed or deprecated | Feature breaks entirely | Abstract behind `/src/lib/speech.ts` wrapper; could swap to Whisper API if needed |
| Users expect always-listening (wake phrase) | Disappointed when they must tap button | Clear onboarding tooltip: "Tap the mic button to start voice logging" |
| Tier 2 AI costs from ambiguous input | Unexpected billing | Most inputs handled by Tier 1 regex (<10% need Tier 2); rate limit Tier 2 calls |
| Privacy concerns about voice data | Users avoid feature | Clear consent dialog; emphasize browser-level processing; never store audio |
| Multilingual users speak in non-English | Parse failures | V1 English only; show language setting; planned multi-language in V2 |
| Simultaneous audio (music playing) conflicts with mic | Recognition degraded | Note in UI: "For best results, pause music before voice logging" |

---

## 13. Dependencies

| Dependency | Status | Required For |
|------------|--------|-------------|
| Web Speech API browser support | Available (Chrome, Safari, Edge) | Core functionality |
| Set logging flow | Complete | Integration point |
| AI client (`ai-client.ts`) | Created in PRD 1 | Tier 2 parsing |
| Audio system (`audio.ts`) | Complete | Mic activation sounds |
| Feature flags system | Complete | Gating rollout |
| PRD 1 (AI Program Generation) | Recommended first | Shared AI infrastructure |

### Privacy & Data

| Data | Where It Goes | Retention |
|------|---------------|-----------|
| Voice audio | Processed by Web Speech API (browser/OS level) | Not stored by SetFlow |
| Transcript text | Processed locally by Tier 1 parser | Not stored (transient) |
| Ambiguous transcripts (Tier 2) | Sent to Claude API for parsing | Not stored by API |
| Parsed set data | Stored in IndexedDB as normal SetLog | Until user deletes |
| Input method tracking | Stored locally (analytics) | Aggregated only |

### Important Notes
- SetFlow never stores audio recordings
- Web Speech API processes audio at the browser/OS level (Google's servers for Chrome, Apple's for Safari)
- Only the text transcript is used by SetFlow; audio is discarded immediately
- Tier 2 AI parsing sends only the text transcript, never audio

### User Consent
- First use shows brief explanation: "Voice logging sends your speech to your browser's speech recognition service. SetFlow never stores audio recordings."
- Microphone permission handled by browser (standard permission prompt)
- Users can disable voice logging entirely in Settings

---

## 14. Changelog

| Date | Change |
|------|--------|
| 2026-03-04 | Initial draft |
| 2026-03-26 | PRD quality audit: Updated model to Claude 4.5 Haiku. Added browser compatibility table (Safari/Chrome/Firefox differences). Added Requirements (MoSCoW), User Flows, Implementation Plan, Component Table, Visual Spec, Testing, Launch Checklist, Risks & Mitigations. Restructured to 14-section standard. |
| 2026-03-26 | Status updated to SHIPPED - implementation verified in codebase |
