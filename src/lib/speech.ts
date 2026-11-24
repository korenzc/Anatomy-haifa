/**
 * English pronunciation.
 * First choice is a recording (public/audio, see `npm run audio`) played through one shared
 * <audio> element: same voice on every phone, and on iPhone it plays even with the ring/silent
 * switch on — the Web Speech API is muted there and has other phone quirks. The Web Speech API stays as the fallback for words without a file.
 */
import { audioUrl, speakable } from './audio';

let failListener: (() => void) | null = null;
/** Called when a tapped word could not be played at all. */
export function onSpeechFail(fn: (() => void) | null) {
  failListener = fn;
}

export const canSpeak = () => typeof window !== 'undefined' && ('Audio' in window || 'speechSynthesis' in window);
const hasSynth = () => typeof window !== 'undefined' && 'speechSynthesis' in window;

// 10 ms of silence, used to unlock the player inside the first tap.
const SILENCE =
  'data:audio/wav;base64,UklGRsQAAABXQVZFZm10IBAAAAABAAEAQB8AAIA+AAACABAAZGF0YaAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA';

let player: HTMLAudioElement | null = null;
const getPlayer = () => (player ??= new Audio());

/* ---------- Web Speech fallback ---------- */

let voice: SpeechSynthesisVoice | null = null;
// Keep the live utterance referenced: browsers may garbage-collect it mid-word.
let current: SpeechSynthesisUtterance | null = null;

const lang = (v: SpeechSynthesisVoice) => (v.lang ?? '').replace('_', '-').toLowerCase();
// iOS ships joke voices (Bubbles, Zarvox…) under en-US; never land on one by accident.
const NOVELTY = /albert|bad news|bahh|bells|boing|bubbles|cellos|good news|jester|organ|superstar|trinoids|whisper|wobble|zarvox|fred|junior|ralph|kathy/i;
const PREFERRED = /samantha|daniel|karen|google us english|aaron|nicky|english united states/i;

function pickVoice(): SpeechSynthesisVoice | null {
  const en = window.speechSynthesis.getVoices().filter((v) => lang(v).startsWith('en') && !NOVELTY.test(v.name));
  // A non-local voice may need a download or a network round-trip and then stay silent.
  const local = en.filter((v) => v.localService);
  const pool = local.length ? local : en;
  return pool.find((v) => PREFERRED.test(v.name)) ?? pool.find((v) => lang(v) === 'en-us') ?? pool[0] ?? null;
}

function synthSpeak(word: string, tapped: boolean) {
  if (!hasSynth()) {
    if (tapped) failListener?.();
    return;
  }
  const synth = window.speechSynthesis;
  if (!voice) voice = pickVoice();
  const go = () => {
    const u = new SpeechSynthesisUtterance(speakable(word));
    u.lang = voice ? lang(voice) : 'en-US';
    if (voice) u.voice = voice;
    u.rate = 0.85;
    let started = false;
    u.onstart = () => (started = true);
    u.onend = () => {
      if (current === u) current = null;
    };
    u.onerror = (e) => {
      if (current === u) current = null;
      if (tapped && e.error !== 'interrupted' && e.error !== 'canceled') failListener?.();
    };
    current = u;
    if (synth.paused) synth.resume(); // Chrome on Android can get stuck paused
    synth.speak(u);
    if (tapped)
      setTimeout(() => {
        if (!started && current === u && !synth.speaking) failListener?.();
      }, 2500);
  };
  if (current && (synth.speaking || synth.pending)) {
    synth.cancel();
    setTimeout(go, 60); // Chrome drops a speak() issued in the same tick as cancel()
  } else go();
}

/* ---------- unlock on the first tap ---------- */

if (typeof window !== 'undefined') {
  // iOS only lets audio start inside a tap until it has played once. Unlock both paths on the
  // first tap anywhere, so words played automatically later (lesson intro cards) are heard too.
  const events = ['touchend', 'click', 'keydown'];
  const unlock = () => {
    events.forEach((e) => document.removeEventListener(e, unlock, true));
    const p = getPlayer();
    if (!p.src) {
      p.src = SILENCE;
      p.play().catch(() => {});
    }
    if (hasSynth()) {
      const synth = window.speechSynthesis;
      synth.addEventListener?.('voiceschanged', () => (voice = pickVoice()));
      if (!synth.speaking && !synth.pending) {
        const u = new SpeechSynthesisUtterance(' ');
        u.volume = 0;
        synth.speak(u);
      }
    }
  };
  events.forEach((e) => document.addEventListener(e, unlock, true));
}

/** `tapped`: the student asked for this word, so tell them if nothing comes out. */
export function speak(word: string, tapped = false) {
  if (!canSpeak()) return;
  if (current && hasSynth()) window.speechSynthesis.cancel();
  if (!('Audio' in window)) return synthSpeak(word, tapped);

  const p = getPlayer();
  p.pause();
  p.src = audioUrl(word);
  p.play().catch((err: DOMException) => {
    if (err.name === 'AbortError') return; // a newer word replaced this one
    // Played before any tap (iOS autoplay rule) — stay quiet, the next tap unlocks.
    if (err.name === 'NotAllowedError' && !tapped) return;
    synthSpeak(word, tapped); // no recording for this word, or the file could not load
  });
}
