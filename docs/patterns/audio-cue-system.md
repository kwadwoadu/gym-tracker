# Audio Cue System Pattern

## When to Use

- Timer alerts and countdowns
- Workout feedback sounds
- Achievement celebrations
- Any audio feedback in PWA (especially iOS)

## Core Principle

Web Audio API with iOS compatibility. iOS Safari blocks autoplay - AudioContext MUST be initialized from user interaction (touch/click).

## Implementation

### Singleton AudioManager

```typescript
// CORRECT: Singleton pattern with lazy initialization
class AudioManager {
  private audioContext: AudioContext | null = null;
  private isInitialized = false;

  async init(): Promise<void> {
    if (this.isInitialized) return;

    // Support webkit prefix for older Safari
    this.audioContext = new (window.AudioContext ||
      (window as any).webkitAudioContext)();

    // iOS requirement: resume if suspended
    if (this.audioContext.state === "suspended") {
      await this.audioContext.resume();
    }

    this.isInitialized = true;
  }
}

export const audioManager = new AudioManager();
```

### Initialize on User Interaction

```typescript
// CORRECT: Init from button click
function StartWorkoutButton() {
  const handleStart = async () => {
    await audioManager.init(); // User gesture triggers this
    startWorkout();
  };
  return <button onClick={handleStart}>Start</button>;
}

// WRONG: Init on component mount (fails on iOS)
useEffect(() => {
  audioManager.init(); // No user gesture, will fail
}, []);
```

### Generate Tones Programmatically

```typescript
// CORRECT: Oscillator-based tones (no audio files needed)
playBeep(frequency = 800, duration = 150, volume = 0.5): void {
  if (!this.audioContext) return;

  const oscillator = this.audioContext.createOscillator();
  const gainNode = this.audioContext.createGain();

  oscillator.connect(gainNode);
  gainNode.connect(this.audioContext.destination);

  oscillator.frequency.value = frequency;
  oscillator.type = "sine";

  // Fade out to prevent clicks
  gainNode.gain.setValueAtTime(volume, this.audioContext.currentTime);
  gainNode.gain.exponentialRampToValueAtTime(
    0.01,
    this.audioContext.currentTime + duration / 1000
  );

  oscillator.start(this.audioContext.currentTime);
  oscillator.stop(this.audioContext.currentTime + duration / 1000);
}
```

### Named Sound Methods

```typescript
// CORRECT: Semantic methods for different events
playSetStart(): void { this.playBeep(600, 100, 0.4); }
playWarning(): void { this.playBeep(440, 200, 0.5); }
playRestComplete(): void {
  this.playBeep(880, 150, 0.6);
  setTimeout(() => this.playBeep(880, 150, 0.6), 200); // Double beep
}
playWorkoutComplete(): void {
  const notes = [523, 659, 784, 1047]; // C5, E5, G5, C6 melody
  notes.forEach((freq, i) => {
    setTimeout(() => this.playBeep(freq, 200, 0.5), i * 150);
  });
}

// WRONG: Magic numbers everywhere
playSound(type: string) {
  if (type === "start") this.playBeep(600, 100, 0.4);
  if (type === "end") this.playBeep(880, 150, 0.6);
}
```

## Files Using This Pattern

- `/lib/audio.ts` - AudioManager singleton
- `/components/workout/RestTimer.tsx` - Timer countdown sounds
- `/components/workout/WorkoutSession.tsx` - Workout complete sound

## Gotchas

1. **User gesture required** - First audio MUST come from click/touch
2. **Resume suspended context** - iOS suspends AudioContext on page load
3. **webkitAudioContext fallback** - Older Safari uses prefixed version
4. **Fade out tones** - Abrupt stops cause audible clicks
5. **No HTML5 Audio** - `<audio>` tags unreliable on iOS PWA
6. **Volume ramp** - Use exponentialRampToValueAtTime, not setValueAtTime

## Testing

1. Test on iOS Safari (not Chrome simulator)
2. Test as PWA (Add to Home Screen)
3. Verify sound plays after first tap
4. Test with device on silent mode
5. Test with low power mode enabled
