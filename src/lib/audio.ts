// Audio feedback for workout timer
// Uses Web Audio API for reliable playback on iOS

class AudioManager {
  private audioContext: AudioContext | null = null;
  private isInitialized = false;

  // Initialize audio context (must be called from user interaction)
  async init(): Promise<void> {
    if (this.isInitialized) return;

    try {
      this.audioContext = new (window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext })
          .webkitAudioContext)();

      // Resume context if suspended (iOS requirement)
      if (this.audioContext.state === "suspended") {
        await this.audioContext.resume();
      }

      this.isInitialized = true;
      console.log("Audio initialized");
    } catch (error) {
      console.error("Failed to initialize audio:", error);
    }
  }

  // Play a beep sound
  playBeep(
    frequency: number = 800,
    duration: number = 150,
    volume: number = 0.5
  ): void {
    if (!this.audioContext) return;

    const oscillator = this.audioContext.createOscillator();
    const gainNode = this.audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(this.audioContext.destination);

    oscillator.frequency.value = frequency;
    oscillator.type = "sine";

    gainNode.gain.setValueAtTime(volume, this.audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(
      0.01,
      this.audioContext.currentTime + duration / 1000
    );

    oscillator.start(this.audioContext.currentTime);
    oscillator.stop(this.audioContext.currentTime + duration / 1000);
  }

  // Short beep for set start
  playSetStart(): void {
    this.playBeep(600, 100, 0.4);
  }

  // Warning beep (10 seconds left)
  playWarning(): void {
    this.playBeep(440, 200, 0.5);
  }

  // Rest complete - double beep
  playRestComplete(): void {
    this.playBeep(880, 150, 0.6);
    setTimeout(() => this.playBeep(880, 150, 0.6), 200);
  }

  // Countdown tick (last 5 seconds)
  playTick(): void {
    this.playBeep(600, 50, 0.3);
  }

  // Workout complete - success melody
  playWorkoutComplete(): void {
    const notes = [523, 659, 784, 1047]; // C5, E5, G5, C6
    notes.forEach((freq, i) => {
      setTimeout(() => this.playBeep(freq, 200, 0.5), i * 150);
    });
  }

  // PR achieved - celebration
  playPR(): void {
    const notes = [784, 988, 1175, 1319]; // G5, B5, D6, E6
    notes.forEach((freq, i) => {
      setTimeout(() => this.playBeep(freq, 150, 0.5), i * 100);
    });
    // Shimmer layer
    setTimeout(() => this.playShimmer(), 200);
  }

  // Set complete - ascending two-note chime
  playSetComplete(): void {
    this.playBeep(523, 100, 0.4); // C5
    setTimeout(() => this.playBeep(659, 100, 0.4), 150); // E5
  }

  // Shimmer sound for PR detection overlay
  playShimmer(): void {
    if (!this.audioContext) return;
    const osc = this.audioContext.createOscillator();
    const gain = this.audioContext.createGain();
    osc.connect(gain);
    gain.connect(this.audioContext.destination);
    osc.type = "sine";
    osc.frequency.setValueAtTime(2000, this.audioContext.currentTime);
    osc.frequency.linearRampToValueAtTime(4000, this.audioContext.currentTime + 0.3);
    gain.gain.setValueAtTime(0.2, this.audioContext.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.3);
    osc.start(this.audioContext.currentTime);
    osc.stop(this.audioContext.currentTime + 0.3);
  }

  // Streak milestone fanfare
  playStreakMilestone(days: number): void {
    if (days >= 100) {
      const notes = [523, 659, 784, 1047, 1319]; // C-E-G-C6-E6
      notes.forEach((freq, i) => {
        setTimeout(() => this.playBeep(freq, 200, 0.5), i * 200);
      });
    } else if (days >= 30) {
      const notes = [523, 659, 784, 1047]; // C-E-G-C6
      notes.forEach((freq, i) => {
        setTimeout(() => this.playBeep(freq, 150, 0.45 + i * 0.05), i * 150);
      });
    } else {
      const notes = [523, 659, 784]; // C-E-G
      notes.forEach((freq, i) => {
        setTimeout(() => this.playBeep(freq, 100, 0.4), i * 100);
      });
    }
  }
}

// Singleton instance
export const audioManager = new AudioManager();
