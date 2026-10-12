let audioCtx: AudioContext | null = null;

function getCtx(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  if (!audioCtx) {
    try {
      audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
    } catch {
      return null;
    }
  }
  return audioCtx;
}

function tone(freq: number, duration: number, type: OscillatorType, volume: number, delay: number = 0): void {
  const ctx = getCtx();
  if (!ctx) return;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = type;
  osc.frequency.value = freq;
  gain.gain.setValueAtTime(0, ctx.currentTime + delay);
  gain.gain.linearRampToValueAtTime(volume, ctx.currentTime + delay + 0.01);
  gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + delay + duration);
  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.start(ctx.currentTime + delay);
  osc.stop(ctx.currentTime + delay + duration);
}

export function playSuccess(): void {
  tone(523.25, 0.12, 'sine', 0.15, 0);
  tone(659.25, 0.12, 'sine', 0.15, 0.1);
  tone(783.99, 0.2, 'sine', 0.15, 0.2);
}

export function playAlert(): void {
  tone(880, 0.15, 'square', 0.12, 0);
  tone(880, 0.15, 'square', 0.12, 0.2);
  tone(880, 0.15, 'square', 0.12, 0.4);
}

export function playPanic(): void {
  tone(1000, 0.1, 'sawtooth', 0.15, 0);
  tone(600, 0.1, 'sawtooth', 0.15, 0.12);
  tone(1000, 0.1, 'sawtooth', 0.15, 0.24);
  tone(600, 0.1, 'sawtooth', 0.15, 0.36);
}

export function playCall(): void {
  tone(659.25, 0.08, 'sine', 0.12, 0);
  tone(880, 0.12, 'sine', 0.12, 0.08);
}

export function playClick(): void {
  tone(440, 0.04, 'sine', 0.06, 0);
}
