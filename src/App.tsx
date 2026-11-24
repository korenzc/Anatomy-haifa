import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { useCallback, useEffect, useRef, useState, type ComponentType } from 'react';
import { IconBook, IconChart, IconPath, IconPractice } from './components/Icons';
import { FlashcardsView } from './components/FlashcardsView';
import { SessionView } from './components/SessionView';
import type { FlashConfig } from './lib/flash';
import { dueCount, sessionForNode, type Session } from './lib/session';
import { useBack } from './lib/back';
import { onSpeechFail } from './lib/speech';
import { getState, useStore } from './lib/store';
import { DictionaryScreen } from './screens/DictionaryScreen';
import { PathScreen } from './screens/PathScreen';
import { PracticeScreen } from './screens/PracticeScreen';
import { ProgressScreen } from './screens/ProgressScreen';

type Tab = 'path' | 'practice' | 'dictionary' | 'progress';

const TABS: { id: Tab; label: string; Icon: ComponentType<{ width?: number }> }[] = [
  { id: 'path', label: 'מסלול', Icon: IconPath },
  { id: 'practice', label: 'תרגול', Icon: IconPractice },
  { id: 'dictionary', label: 'מילון', Icon: IconBook },
  { id: 'progress', label: 'התקדמות', Icon: IconChart },
];

function useTheme() {
  const theme = useStore((s) => s.settings.theme);
  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'system') root.removeAttribute('data-theme');
    else root.setAttribute('data-theme', theme);
    // keep each meta's own scheme when following the system; force both when the user picked one
    document.querySelectorAll('meta[name="theme-color"]').forEach((m) => {
      const forDark = theme === 'system' ? (m.getAttribute('media') ?? '').includes('dark') : theme === 'dark';
      m.setAttribute('content', forDark ? '#15171C' : '#F5F7FC');
    });
  }, [theme]);
}

export default function App() {
  useTheme();
  const reduce = useReducedMotion();
  const [tab, setTab] = useState<Tab>(() => (['path', 'practice', 'dictionary', 'progress'].includes(sessionStorage.getItem('tab') ?? '') ? (sessionStorage.getItem('tab') as Tab) : 'path'));
  const [session, setSession] = useState<Session | null>(null);
  const [sessionKey, setSessionKey] = useState(0);
  const [flash, setFlash] = useState<FlashConfig | null>(null);
  const [toastMsg, setToastMsg] = useState<string | null>(null);
  const scroller = useRef<HTMLDivElement>(null);
  const due = useStore((s) => dueCount(s));

  useEffect(() => {
    try {
      sessionStorage.setItem('tab', tab);
    } catch {
      /* ignore */
    }
  }, [tab]);

  const start = useCallback((s: Session) => {
    setSession(s);
    setSessionKey((k) => k + 1);
  }, []);

  // Back during a lesson: the lesson decides (quit sheet / leave results).
  const backHandler = useRef<(() => boolean) | null>(null);
  useBack(session !== null, () => (backHandler.current ? backHandler.current() : (setSession(null), false)));
  const registerBack = useCallback((fn: (() => boolean) | null) => {
    backHandler.current = fn;
  }, []);
  const closeSession = useCallback(() => setSession(null), []);
  useBack(flash !== null, () => (setFlash(null), false));
  const closeFlash = useCallback(() => setFlash(null), []);
  const overlay = !!session || !!flash;

  const toast = useCallback((m: string) => {
    setToastMsg(m);
  }, []);
  useEffect(() => {
    onSpeechFail(() => toast('ההקראה לא עובדת בדפדפן הזה. נסו לפתוח את האתר בספארי או בכרום'));
    return () => onSpeechFail(null);
  }, [toast]);
  useEffect(() => {
    if (!toastMsg) return;
    const id = setTimeout(() => setToastMsg(null), 2600);
    return () => clearTimeout(id);
  }, [toastMsg]);

  const selectTab = (t: Tab) => {
    if (t === tab) scroller.current?.scrollTo({ top: 0, behavior: 'smooth' });
    else {
      setTab(t);
      scroller.current?.scrollTo({ top: 0 });
    }
  };

  const retry = session?.node
    ? () => {
        const n = session.node!;
        return sessionForNode(n, getState(), session.kind === 'jump');
      }
    : undefined;

  return (
    <div className="app" dir="rtl">
      <main className="scroller" ref={scroller} aria-hidden={overlay} inert={overlay}>
        {tab === 'path' && <PathScreen start={start} openTab={selectTab} />}
        {tab === 'practice' && <PracticeScreen start={start} startFlash={setFlash} toast={toast} />}
        {tab === 'dictionary' && <DictionaryScreen />}
        {tab === 'progress' && <ProgressScreen toast={toast} />}
      </main>

      <nav className="tabbar" aria-label="ניווט ראשי" aria-hidden={overlay} inert={overlay}>
        <div className="tabbar-inner">
          {TABS.map(({ id, label, Icon }) => (
            <button key={id} className="tab press" aria-current={tab === id ? 'page' : undefined} onClick={() => selectTab(id)}>
              <Icon />
              <span>{label}</span>
              {id === 'practice' && due > 0 && <span className="tab-badge num">{due > 99 ? '99+' : due}</span>}
            </button>
          ))}
        </div>
      </nav>

      <AnimatePresence>
        {session && (
          <motion.div
            key={sessionKey}
            initial={reduce ? { opacity: 0 } : { opacity: 0, transform: 'translateY(24px)' }}
            animate={{ opacity: 1, transform: 'translateY(0px)' }}
            exit={reduce ? { opacity: 0 } : { opacity: 0, transform: 'translateY(24px)', transition: { duration: 0.18, ease: [0.23, 1, 0.32, 1] } }}
            transition={{ duration: 0.32, ease: [0.32, 0.72, 0, 1] }}
            style={{ position: 'fixed', inset: 0, zIndex: 40 }}
          >
            <SessionView initial={session} onExit={closeSession} retry={retry} onAgain={start} registerBack={registerBack} />
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {flash && (
          <motion.div
            initial={reduce ? { opacity: 0 } : { opacity: 0, transform: 'translateY(24px)' }}
            animate={{ opacity: 1, transform: 'translateY(0px)' }}
            exit={reduce ? { opacity: 0 } : { opacity: 0, transform: 'translateY(24px)', transition: { duration: 0.18, ease: [0.23, 1, 0.32, 1] } }}
            transition={{ duration: 0.32, ease: [0.32, 0.72, 0, 1] }}
            style={{ position: 'fixed', inset: 0, zIndex: 40 }}
          >
            <FlashcardsView config={flash} onExit={closeFlash} />
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {toastMsg && (
          <motion.div
            className="toast"
            role="status"
            initial={reduce ? { opacity: 0 } : { opacity: 0, transform: 'translateY(16px)' }}
            animate={reduce ? { opacity: 1 } : { opacity: 1, transform: 'translateY(0px)' }}
            exit={reduce ? { opacity: 0 } : { opacity: 0, transform: 'translateY(16px)', transition: { duration: 0.15, ease: [0.23, 1, 0.32, 1] } }}
            transition={{ duration: 0.3, ease: [0.23, 1, 0.32, 1] }}
          >
            {toastMsg}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
