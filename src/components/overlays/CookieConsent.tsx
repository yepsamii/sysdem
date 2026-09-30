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
      className="absolute bottom-1 left-3 z-40 w-[396px] max-w-[calc(100vw-1.5rem)] rounded-xl border border-border bg-surface shadow-panel p-4"
    >
      <div className="flex items-start gap-3">
        <span
          aria-hidden
          className="grid place-items-center h-8 w-8 shrink-0 rounded-lg bg-accent/15 text-accent"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 2a10 10 0 1 0 10 10 4 4 0 0 1-5-5 4 4 0 0 1-5-5" />
            <path d="M8.5 8.5v.01" />
            <path d="M16 15.5v.01" />
            <path d="M12 12v.01" />
            <path d="M11 17v.01" />
            <path d="M7 14v.01" />
          </svg>
        </span>
        <div className="min-w-0 flex-1">
          <h3 className="text-sm font-semibold tracking-tight">Cookies</h3>
          <p className="mt-1 text-xs text-muted leading-relaxed">
            Ads keep GravelGraph free. Google can set cookies to personalise and measure
            them — decline and you’ll still see ads, just generic ones.
          </p>
          <p className="mt-1 text-xs text-muted leading-relaxed">
            Either way your diagrams stay in this browser, and our visitor stats are cookieless.{' '}
            <a href="/privacy/" target="_blank" rel="noopener noreferrer" className="font-semibold text-accent hover:text-accent-hover">
              Privacy &amp; cookies
            </a>
          </p>

          <div className="mt-3 flex items-center gap-2">
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
      </div>
    </div>
  );
}