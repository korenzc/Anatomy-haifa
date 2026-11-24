/**
 * Hardware / browser Back for overlays (sheets, the lesson screen).
 * Each open overlay owns one history entry. Back closes the top overlay;
 * closing an overlay from the UI consumes its entry so history never piles up.
 */
import { useEffect, useRef } from 'react';

interface Entry {
  id: number;
  /** return true to stay open (the entry is re-armed) */
  onBack: () => boolean;
  /** whether its history entry has actually been pushed yet */
  pushed: boolean;
}

const stack: Entry[] = [];
/** history.back() calls we issued ourselves and whose popstate hasn't arrived yet */
let pendingBacks = 0;
let nextId = 1;

/**
 * history.back() is asynchronous. If an overlay closes and another opens in the same tick
 * (sheet button → lesson), pushing immediately would let the late back() pop the new entry.
 * So while our own back()s are in flight, new pushes wait for them to land.
 */
function flush() {
  if (pendingBacks > 0) return;
  for (const e of stack)
    if (!e.pushed) {
      history.pushState({ overlay: e.id }, '');
      e.pushed = true;
    }
}

if (typeof window !== 'undefined') {
  window.addEventListener('popstate', () => {
    if (pendingBacks > 0) {
      pendingBacks--;
      flush();
      return;
    }
    const top = stack.pop();
    if (!top) return;
    if (top.onBack()) {
      top.pushed = false;
      stack.push(top);
      flush();
    }
  });
}

function push(onBack: () => boolean): number {
  const id = nextId++;
  stack.push({ id, onBack, pushed: false });
  flush();
  return id;
}

function release(id: number) {
  const i = stack.findIndex((e) => e.id === id);
  if (i < 0) return; // already consumed by Back
  const [e] = stack.splice(i, 1);
  if (!e.pushed) return; // never reached history — nothing to undo
  pendingBacks++;
  history.back();
}

/** While `active`, Back calls `onBack` (return true to stay open). */
export function useBack(active: boolean, onBack: () => boolean) {
  const ref = useRef(onBack);
  ref.current = onBack;
  useEffect(() => {
    if (!active) return;
    const id = push(() => ref.current());
    return () => release(id);
  }, [active]);
}

/** True while any sheet is open (keyboard shortcuts behind it should pause). */
export const overlayOpen = () => typeof document !== 'undefined' && !!document.querySelector('.sheet');
