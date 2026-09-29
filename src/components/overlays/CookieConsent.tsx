import { useEffect, useState } from 'react';

interface ConsentState {
  v: 1;
  ads: boolean;
}

const STORAGE_KEY = 'gravelgraph.cookieConsent';

function readConsent(): ConsentState | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as ConsentState;
    if (parsed.v === 1) return parsed;
  } catch {}
  return null;
}

function writeConsent(state: ConsentState) {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); } catch {}
}

export function CookieConsent() {
  const [decision, setDecision] = useState<ConsentState | null>(null);

  useEffect(() => {
    setDecision(readConsent());
  }, []);

  if (decision) return null;

  const accept = () => {
    const next: ConsentState = { v: 1, ads: true };
    writeConsent(next);
    setDecision(next);
  };
  const decline = () => {
    const next: ConsentState = { v: 1, ads: false };
    writeConsent(next);
    setDecision(next);
  };

  return (
    <div
      role="region"
      aria-label="Cookie consent"
      className="absolute bottom-20 left-4 z-40 w-[340px] max-w-[calc(100vw-2rem)] rounded-xl border border-border bg-surface shadow-panel p-4 flex flex-col gap-3"
    >
      <div className="flex items-start gap-2">
        <span
          aria-hidden
          className="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-surface-2 text-accent"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 13a9 9 0 1 1-10-10 7 7 0 0 0 10 10" />
            <circle cx="9" cy="13" r="1" fill="currentColor" />
            <circle cx="14" cy="16" r="1" fill="currentColor" />
            <circle cx="11" cy="9" r="1" fill="currentColor" />
          </svg>
        </span>
        <h3 className="text-sm font-semibold tracking-tight">Cookies</h3>
      </div>

      <p className="text-xs text-muted leading-relaxed">
        Ads keep GravelGraph free. Google can set cookies to personalise and measure
        them — decline and you’ll still see ads, just generic ones.
      </p>
      <p className="text-xs text-muted leading-relaxed">
        Either way your diagrams stay in this browser, and our visitor stats are cookieless.{' '}
        <a href="/privacy/" target="_blank" rel="noopener noreferrer" className="font-semibold text-accent hover:text-accent-hover">
          Privacy &amp; cookies
        </a>
      </p>

      <div className="flex items-center gap-2 pt-1">
        <button
          type="button"
          onClick={accept}
          className="flex-1 h-8 rounded-md text-sm font-medium text-accent-contrast bg-accent hover:bg-accent-hover transition-colors"
        >
          Accept
        </button>
        <button
          type="button"
          onClick={decline}
          className="flex-1 h-8 rounded-md text-sm font-medium text-fg bg-surface-2 hover:bg-surface-3 transition-colors border border-border"
        >
          Decline
        </button>
      </div>
    </div>
  );
}