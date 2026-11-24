/** Sound + haptics for answer feedback, in the same frame as the visual (Apple: harmony). */
import { getState } from './store';

let ctx: AudioContext | null = null;

function audio(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  const AC = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  if (!AC) return null;
  ctx ??= new AC();
  if (ctx.state === 'suspended') void ctx.resume();
  return ctx;
}

function tone(freqs: number[], dur = 0.12, type: OscillatorType = 'sine', gap = 0.08, vol = 0.12) {
  const ac = audio();
  if (!ac) return;
  const t0 = ac.currentTime;
  freqs.forEach((f, i) => {
    const o = ac.createOscillator();
    const g = ac.createGain();
    o.type = type;
    o.frequency.value = f;
    const s = t0 + i * gap;
    g.gain.setValueAtTime(0, s);
    g.gain.linearRampToValueAtTime(vol, s + 0.01);
    g.gain.exponentialRampToValueAtTime(0.0001, s + dur);
    o.connect(g).connect(ac.destination);
    o.start(s);
    o.stop(s + dur + 0.02);
  });
}

function vibrate(pattern: number | number[]) {
  if (!getState().settings.haptics) return;
  try {
    navigator.vibrate?.(pattern);
  } catch {
    /* unsupported */
  }
}

export function feedbackCorrect() {
  if (getState().settings.sound) tone([880, 1318.5], 0.16, 'sine', 0.07);
  vibrate(12);
}

export function feedbackWrong() {
  if (getState().settings.sound) tone([233, 196], 0.18, 'triangle', 0.09, 0.1);
  vibrate([20, 40, 20]);
}

export function feedbackComplete() {
  if (getState().settings.sound) tone([523.25, 659.25, 783.99, 1046.5], 0.22, 'sine', 0.09);
  vibrate([10, 30, 10]);
}

export function tick() {
  vibrate(6);
}
