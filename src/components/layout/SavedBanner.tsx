import { useEffect, useState } from 'react';
import { Icon } from '../ui/Icon';

const STORAGE_KEY = 'gravelgraph.seenSavedBanner';

export function SavedBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    try {
      if (localStorage.getItem(STORAGE_KEY) !== '1') setVisible(true);
    } catch {
      setVisible(true);
    }
  }, []);

  if (!visible) return null;

  const dismiss = () => {
    try { localStorage.setItem(STORAGE_KEY, '1'); } catch {}
    setVisible(false);
  };

  return (
    <div
      role="region"
      aria-label="Saved locally notice"
      className="flex shrink-0 items-start justify-center gap-2 px-3 py-2 bg-surface border-b border-border"
    >
      <p className="text-xs text-muted leading-relaxed">
        Your work is saved <strong className="text-fg">in this browser only</strong>
        {' '}— no account, no server. Use <strong className="text-fg">Save</strong> to keep a .gravel file, or{' '}
        <strong className="text-fg">Copy link</strong> to share it.
      </p>
      <button
        type="button"
        aria-label="Dismiss"
        onClick={dismiss}
        className="shrink-0 inline-flex items-center justify-center rounded p-1 text-faint hover:text-fg hover:bg-surface-2 transition-colors"
      >
        <Icon name="x" size={12} />
      </button>
    </div>
  );
}
