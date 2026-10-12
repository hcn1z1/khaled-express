// Native Web Audio API sound effects for barcode scanner POS terminal

class SoundService {
  private ctx: AudioContext | null = null;
  private soundEnabled: boolean = true;

  constructor() {
    // Sound enabled by default
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('khaled_sound_enabled');
      if (saved !== null) {
        this.soundEnabled = saved === 'true';
      }
    }
  }

  private getContext(): AudioContext | null {
    if (typeof window === 'undefined') return null;
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
    return this.ctx;
  }

  public isEnabled(): boolean {
    return this.soundEnabled;
  }

  public toggleSound(): boolean {
    this.soundEnabled = !this.soundEnabled;
    localStorage.setItem('khaled_sound_enabled', String(this.soundEnabled));
    if (this.soundEnabled) {
      this.playSuccess();
    }
    return this.soundEnabled;
  }

  /**
   * High-pitch pleasant double beep for successful barcode scan
   */
  public playSuccess() {
    if (!this.soundEnabled) return;
    try {
      const ctx = this.getContext();
      if (!ctx) return;

      const now = ctx.currentTime;
      
      // Beep 1
      const osc1 = ctx.createOscillator();
      const gain1 = ctx.createGain();
      osc1.type = 'sine';
      osc1.frequency.setValueAtTime(1046.5, now); // C6
      gain1.gain.setValueAtTime(0.15, now);
      gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.08);
      osc1.connect(gain1);
      gain1.connect(ctx.destination);
      osc1.start(now);
      osc1.stop(now + 0.08);

      // Beep 2
      const osc2 = ctx.createOscillator();
      const gain2 = ctx.createGain();
      osc2.type = 'sine';
      osc2.frequency.setValueAtTime(1318.5, now + 0.09); // E6
      gain2.gain.setValueAtTime(0.15, now + 0.09);
      gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.18);
      osc2.connect(gain2);
      gain2.connect(ctx.destination);
      osc2.start(now + 0.09);
      osc2.stop(now + 0.18);
    } catch (e) {
      // Audio might be restricted until user gesture
    }
  }

  /**
   * Low alert buzz for scan error / custody invalid step
   */
  public playError() {
    if (!this.soundEnabled) return;
    try {
      const ctx = this.getContext();
      if (!ctx) return;

      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(220, now); // A3 buzz
      gain.gain.setValueAtTime(0.2, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.25);
    } catch (e) {
      // Audio might be restricted
    }
  }
}

export const sound = new SoundService();
