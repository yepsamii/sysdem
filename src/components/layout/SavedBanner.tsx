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
      className="relative shrink-0 px-3 py-1.5 bg-surface border-b border-border text-xs text-muted text-center"
    >
      <span>
        Your work is saved <strong className="text-fg">in this browser only</strong>
        {' '}— no account, no server. Use <strong className="text-fg">Save</strong> to keep a .gravel file, or{' '}
        <strong className="text-fg">Copy link</strong> to share it.
      </span>
      <button
        type="button"
        aria-label="Dismiss saved-locally notice"
        onClick={dismiss}
        className="absolute right-2 top-1/2 -translate-y-1/2 inline-flex items-center justify-center rounded p-1 hover:bg-surface-2 text-faint hover:text-fg transition-colors"
      >
        <Icon name="x" size={12} />
      </button>
    </div>
  );
}
