import { type ButtonHTMLAttributes, forwardRef } from 'react';

type IconName =
  | 'menu' | 'file' | 'cursor' | 'hand' | 'pencil' | 'line' | 'arrow'
  | 'download' | 'upload' | 'present' | 'undo' | 'redo' | 'compare'
  | 'continuous' | 'causal' | 'scenario' | 'pause' | 'play' | 'help'
  | 'sun' | 'moon' | 'logo' | 'settings' | 'search' | 'plus' | 'minus'
  | 'fit' | 'lock' | 'unlock' | 'x' | 'check' | 'circle' | 'square'
  // Component shapes
  | 'rectangle' | 'rounded-rect' | 'ellipse' | 'diamond' | 'triangle'
  | 'hexagon' | 'cylinder' | 'type'
  // Clients & network
  | 'monitor-smartphone' | 'cloud' | 'route' | 'scale'
  // Compute
  | 'app-window' | 'server' | 'server-cog' | 'square-function'
  // Data & storage / Messaging / Security / Structure
  | 'database' | 'database-zap' | 'zap' | 'hard-drive' | 'waypoints'
  | 'shield-check' | 'globe' | 'boxes' | 'sticky-note';

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
  // Shapes
  rectangle: 'M5 3h14a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2z',
  'rounded-rect': 'M2 6a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2z',
  ellipse: 'M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20z',
  diamond: 'M2.7 10.3a2.41 2.41 0 0 0 0 3.41l7.59 7.59a2.41 2.41 0 0 0 3.41 0l7.59-7.59a2.41 2.41 0 0 0 0-3.41l-7.59-7.59a2.41 2.41 0 0 0-3.41 0z',
  triangle: 'M13.73 4a2 2 0 0 0-3.46 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3z',
  hexagon: 'M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z',
  cylinder: 'M12 2a9 3 0 1 0 0 6 9 3 0 0 0 0-6z M3 5v14a9 3 0 0 0 18 0V5',
  type: 'M12 4v16 M4 7V5a1 1 0 0 1 1-1h14a1 1 0 0 1 1 1v2 M9 20h6',
  // Clients & network
  'monitor-smartphone': 'M18 8V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v7a2 2 0 0 0 2 2h8 M10 19v-4 M7 19h5 M16 12h4a2 2 0 0 1 2 2v6a2 2 0 0 1-2 2h-4a2 2 0 0 1-2-2v-6a2 2 0 0 1 2-2z',
  cloud: 'M17.5 19H9a7 7 0 1 1 6.71-9h1.79a4.5 4.5 0 1 1 0 9z',
  route: 'M6 19a3 3 0 1 0 0-6 3 3 0 0 0 0 6z M9 19h8.5a3.5 3.5 0 0 0 0-7h-11a3.5 3.5 0 0 1 0-7H15 M18 5a3 3 0 1 0 0 6 3 3 0 0 0 0-6z',
  scale: 'M12 3v18 M16 7l3 8a5 5 0 0 1-6 0z M3 7h18 M5 8l3 8a5 5 0 0 1-6 0z M7 21h10',
  // Compute
  'app-window': 'M2 4h20a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2z M2 8h20 M10 4v4 M6 4v4',
  server: 'M2 4a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v4a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2z M2 16a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v4a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2z M6 6h.01 M6 18h.01',
  'server-cog': 'M5 10H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v4a2 2 0 0 1-2 2h-1 M5 14H4a2 2 0 0 0-2 2v4a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-4a2 2 0 0 0-2-2h-1 M12 12a3 3 0 1 0 0-6 3 3 0 0 0 0 6z M9 17l-1 2 M15 17l1 2 M12 17v3 M7 14h2 M15 14h2 M8 9h8',
  'square-function': 'M3 5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z M9 17c2 0 2.8-1 2.8-2.8V10c0-2 1-3.3 3.2-3 M9 11.2h5.7',
  // Data & storage / Messaging / Security / Structure
  database: '<ellipse cx="12" cy="5" rx="9" ry="3"></ellipse><path d="M3 5V19A9 3 0 0 0 21 19V5"></path><path d="M3 12A9 3 0 0 0 21 12"></path>',
  'database-zap': '<ellipse cx="12" cy="5" rx="9" ry="3"></ellipse><path d="M3 5V19A9 3 0 0 0 15 21.84"></path><path d="M21 5V8"></path><path d="M21 12L18 17H22L19 22"></path><path d="M3 12A9 3 0 0 0 14.59 14.87"></path>',
  zap: '<path d="M4 14a1 1 0 0 1-.78-1.63l9.9-10.2a.5.5 0 0 1 .86.46l-1.92 6.02A1 1 0 0 0 13 10h7a1 1 0 0 1 .78 1.63l-9.9 10.2a.5.5 0 0 1-.86-.46l1.92-6.02A1 1 0 0 0 11 14z"></path>',
  'hard-drive': '<path d="M10 16h.01"></path><path d="M2.212 11.577a2 2 0 0 0-.212.896V18a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-5.527a2 2 0 0 0-.212-.896L18.55 5.11A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z"></path><path d="M21.946 12.013H2.054"></path><path d="M6 16h.01"></path>',
  waypoints: '<path d="m10.586 5.414-5.172 5.172"></path><path d="m18.586 13.414-5.172 5.172"></path><path d="M6 12h12"></path><circle cx="12" cy="20" r="2"></circle><circle cx="12" cy="4" r="2"></circle><circle cx="20" cy="12" r="2"></circle><circle cx="4" cy="12" r="2"></circle>',
  'shield-check': '<path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z"></path><path d="m9 12 2 2 4-4"></path>',
  globe: '<circle cx="12" cy="12" r="10"></circle><path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20"></path><path d="M2 12h20"></path>',
  boxes: '<path d="M2.97 12.92A2 2 0 0 0 2 14.63v3.24a2 2 0 0 0 .97 1.71l3 1.8a2 2 0 0 0 2.06 0L12 19v-5.5l-5-3-4.03 2.42Z"></path><path d="m7 16.5-4.74-2.85"></path><path d="m7 16.5 5-3"></path><path d="M7 16.5v5.17"></path><path d="M12 13.5V19l3.97 2.38a2 2 0 0 0 2.06 0l3-1.8a2 2 0 0 0 .97-1.71v-3.24a2 2 0 0 0-.97-1.71L17 10.5l-5 3Z"></path><path d="m17 16.5-5-3"></path><path d="m17 16.5 4.74-2.85"></path><path d="M17 16.5v5.17"></path><path d="M7.97 4.42A2 2 0 0 0 7 6.13v4.37l5 3 5-3V6.13a2 2 0 0 0-.97-1.71l-3-1.8a2 2 0 0 0-2.06 0l-3 1.8Z"></path><path d="M12 8 7.26 5.15"></path><path d="m12 8 4.74-2.85"></path><path d="M12 13.5V8"></path>',
  'sticky-note': '<path d="M21 9a2.4 2.4 0 0 0-.706-1.706l-3.588-3.588A2.4 2.4 0 0 0 15 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2z"></path><path d="M15 3v5a1 1 0 0 0 1 1h5"></path>',
};

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
  name: IconName;
  size?: number;
  strokeWidth?: number;
}

export const Icon = forwardRef<HTMLButtonElement, Props>(function Icon(
  { name, size = 16, strokeWidth = 1.75, className = '', ...rest },
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
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      {paths[name].includes('<') ? (
        <g dangerouslySetInnerHTML={{ __html: paths[name] }} />
      ) : (
        <path d={paths[name]} />
      )}
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
