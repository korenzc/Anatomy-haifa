import { Component, type ReactNode } from 'react';
import { STORAGE_KEY } from '../lib/store';

/** Last line of defence: never leave a student staring at a blank screen. */
export class ErrorBoundary extends Component<{ children: ReactNode }, { error: Error | null }> {
  state = { error: null as Error | null };

  static getDerivedStateFromError(error: Error) {
    return { error };
  }

  reset = () => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) localStorage.setItem(`${STORAGE_KEY}:broken-${Date.now()}`, raw);
      localStorage.removeItem(STORAGE_KEY);
    } catch {
      /* ignore */
    }
    location.reload();
  };

  render() {
    if (!this.state.error) return this.props.children;
    return (
      <div dir="rtl" style={{ minHeight: '100dvh', display: 'grid', placeItems: 'center', padding: 24, textAlign: 'center' }}>
        <div style={{ maxWidth: 360 }}>
          <div style={{ fontSize: 48 }}>🩺</div>
          <h1 style={{ fontSize: 'var(--fs-title2)', margin: '8px 0' }}>משהו השתבש</h1>
          <p className="hint" style={{ marginBottom: 18 }}>
            נראה שהנתונים השמורים במכשיר פגומים. אפשר לנסות לטעון מחדש, או להתחיל מחדש (גיבוי של הנתונים נשמר בצד).
          </p>
          <button className="btn btn-primary press" onClick={() => location.reload()}>
            טעינה מחדש
          </button>
          <button className="btn btn-plain press" style={{ color: 'var(--red-text)', marginTop: 6 }} onClick={this.reset}>
            להתחיל מחדש
          </button>
        </div>
      </div>
    );
  }
}
