/** Web Audio API based sound effects — no external files needed */

type SoundType = "step" | "success" | "fail" | "click" | "loop_tick";

let ctx: AudioContext | null = null;

function getCtx(): AudioContext | null {
  if (typeof window === "undefined") return null;
  if (!ctx) {
    try {
      ctx = new AudioContext();
    } catch {
      return null;
    }
  }
  if (ctx.state === "suspended") {
    ctx.resume().catch(() => {});
  }
  return ctx;
}

function playTone(
  frequency: number,
  duration: number,
  type: OscillatorType = "sine",
  gainPeak = 0.18,
  delay = 0
): void {
  const c = getCtx();
  if (!c) return;

  const osc = c.createOscillator();
  const gain = c.createGain();
  osc.connect(gain);
  gain.connect(c.destination);

  osc.type = type;
  osc.frequency.setValueAtTime(frequency, c.currentTime + delay);

  gain.gain.setValueAtTime(0, c.currentTime + delay);
  gain.gain.linearRampToValueAtTime(gainPeak, c.currentTime + delay + 0.01);
  gain.gain.exponentialRampToValueAtTime(0.001, c.currentTime + delay + duration);

  osc.start(c.currentTime + delay);
  osc.stop(c.currentTime + delay + duration + 0.02);
}

const sounds: Record<SoundType, () => void> = {
  step: () => {
    playTone(440, 0.08, "square", 0.08);
  },
  click: () => {
    playTone(600, 0.06, "square", 0.07);
  },
  loop_tick: () => {
    playTone(520, 0.07, "triangle", 0.1);
    playTone(660, 0.07, "triangle", 0.09, 0.07);
  },
  success: () => {
    // Happy ascending arpeggio
    playTone(523, 0.12, "sine", 0.2, 0);
    playTone(659, 0.12, "sine", 0.2, 0.1);
    playTone(784, 0.12, "sine", 0.2, 0.2);
    playTone(1047, 0.25, "sine", 0.25, 0.3);
  },
  fail: () => {
    // Descending sad tones
    playTone(330, 0.15, "sawtooth", 0.12, 0);
    playTone(247, 0.2, "sawtooth", 0.12, 0.15);
  },
};

let muted = false;

export function playSound(type: SoundType): void {
  if (muted) return;
  try {
    sounds[type]?.();
  } catch {
    // audio not supported
  }
}

export function setMuted(value: boolean): void {
  muted = value;
}

export function isMuted(): boolean {
  return muted;
}
