import { type ButtonHTMLAttributes, forwardRef } from 'react';

type IconName =
  | 'menu' | 'file' | 'cursor' | 'hand' | 'pencil' | 'line' | 'arrow'
  | 'download' | 'upload' | 'present' | 'undo' | 'redo' | 'compare'
  | 'continuous' | 'causal' | 'scenario' | 'pause' | 'play' | 'help'
  | 'sun' | 'moon' | 'logo' | 'settings' | 'search' | 'plus' | 'minus'
  | 'fit' | 'lock' | 'unlock' | 'x' | 'check' | 'circle' | 'square';

const paths: Record<IconName, string> = {
  menu: 'M3 6h18M3 12h18M3 18h18',
  file: 'M14 3H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z M14 3v6h6',
  cursor: 'M5 3l5 17 2-8 8-2z',
  hand: 'M7 11V5a2 2 0 1 1 4 0v6 M11 11V4a2 2 0 1 1 4 0v7 M15 11V6a2 2 0 1 1 4 0v8c0 4-2 7-6 7s-7-2-7-6v-3l-2-3a1.5 1.5 0 0 1 2-2l3 4',
  pencil: 'M3 21l3-1 11-11-2-2L4 18z M14 7l3 3',
  line: 'M4 20L20 4',
  arrow: 'M4 20L20 4 M14 4h6v6',
  download: 'M12 4v12 M6 12l6 6 6-6 M4 20h16',
  upload: 'M12 20V8 M6 12l6-6 6 6 M4 4h16',
  present: 'M3 4h18v12H3z M8 20h8 M12 16v4',
  undo: 'M9 14l-5-5 5-5 M4 9h10a6 6 0 0 1 0 12h-4',
  redo: 'M15 14l5-5-5-5 M20 9H10a6 6 0 0 0 0 12h4',
  compare: 'M3 6h7v14H3z M14 4h7v16h-7 M10 12h4',
  continuous: 'M3 12h6 M9 12a3 3 0 1 0 6 0 a3 3 0 1 0 -6 0 M15 12h6',
  causal: 'M3 12h6 M9 12h6 M15 12h6 M3 12l3-2v4z M21 12l-3-2v4z M9 12l3-2v4z M15 12l3-2v4z',
  scenario: 'M4 6h4v4H4z M10 6h10v4H10z M4 14h4v4H4z M10 14h10v4H10z',
  pause: 'M7 5v14 M17 5v14',
  play: 'M7 5v14l11-7z',
  help: 'M9 9a3 3 0 1 1 5 2c-1 1-2 1.5-2 3 M12 17h.01 M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0',
  sun: 'M12 4V2 M12 22v-2 M4 12H2 M22 12h-2 M5.6 5.6 4.2 4.2 M19.8 19.8l-1.4-1.4 M5.6 18.4 4.2 19.8 M19.8 4.2l-1.4 1.4 M12 17a5 5 0 1 0 0-10 5 5 0 0 0 0 10',
  moon: 'M21 13a9 9 0 1 1-10-10 7 7 0 0 0 10 10',
  logo: 'M5 18l3-12 3 8 3-7 4 11',
  settings: 'M12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8 M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1',
  search: 'M11 19a8 8 0 1 0 0-16 8 8 0 0 0 0 16 M21 21l-4.3-4.3',
  plus: 'M12 5v14 M5 12h14',
  minus: 'M5 12h14',
  fit: 'M4 9V4h5 M20 9V4h-5 M4 15v5h5 M20 15v5h-5 M9 9h6v6H9z',
  lock: 'M5 11h14v10H5z M8 11V7a4 4 0 1 1 8 0v4',
  unlock: 'M5 11h14v10H5z M8 11V7a4 4 0 0 1 7-2.6',
  x: 'M6 6l12 12 M18 6L6 18',
  check: 'M5 12l5 5L20 7',
  circle: 'M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18',
  square: 'M4 4h16v16H4z',
};

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
  name: IconName;
  size?: number;
}

export const Icon = forwardRef<HTMLButtonElement, Props>(function Icon(
  { name, size = 16, className = '', ...rest },
  ref
) {
  const isButton = rest.type !== undefined || rest.onClick !== undefined;
  const inner = (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d={paths[name]} />
    </svg>
  );
  if (!isButton) return <span className={`inline-flex ${className}`}>{inner}</span>;
  return (
    <button
      ref={ref}
      type="button"
      className={`inline-flex items-center justify-center rounded-md p-1.5 transition-colors hover:bg-surface-2 text-fg ${className}`}
      {...rest}
    >
      {inner}
    </button>
  );
});
