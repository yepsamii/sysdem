import { Icon } from '../ui/Icon';
import { useTheme } from '../../store/theme';

export function Header() {
  const theme = useTheme((s) => s.theme);
  const toggle = useTheme((s) => s.toggle);

  const iconBtn =
    'inline-flex items-center justify-center rounded-md p-1.5 transition-colors hover:bg-surface-2 text-fg disabled:opacity-40 disabled:pointer-events-none';
  const sep = 'h-6 w-px bg-border mx-1';

  return (
    <header
      role="banner"
      className="h-12 w-full shrink-0 border-b border-border bg-surface flex items-center gap-1 px-2"
    >
      <Icon name="logo" size={18} className="text-accent mx-1" />
      <span className="text-sm font-semibold tracking-tight mr-2 select-none">
        GravelGraph
      </span>

      <button type="button" aria-label="Menu" className={`lg:hidden ${iconBtn}`}>
        <Icon name="menu" />
      </button>
      <button type="button" aria-label="File" className={iconBtn}>
        <Icon name="file" />
      </button>

      <div className="hidden lg:flex items-center gap-1">
        <button type="button" aria-label="Select — drag a box to select multiple (V)" className={iconBtn} aria-pressed="false">
          <Icon name="cursor" />
        </button>
        <button type="button" aria-label="Hand — drag to pan the canvas (H)" className={iconBtn} aria-pressed="true">
          <Icon name="hand" />
        </button>
        <button type="button" aria-label="Draw — freehand pen" className={iconBtn} aria-pressed="false">
          <Icon name="pencil" />
        </button>
        <button type="button" aria-label="Line — draw a freestanding line" className={iconBtn} aria-pressed="false">
          <Icon name="line" />
        </button>
        <button type="button" aria-label="Arrow — draw a freestanding arrow" className={iconBtn} aria-pressed="false">
          <Icon name="arrow" />
        </button>
        <button type="button" aria-label="Export diagram" className={iconBtn}>
          <Icon name="download" />
        </button>
        <button type="button" aria-label="Present (fullscreen playback)" className={iconBtn}>
          <Icon name="present" />
        </button>
        <button type="button" aria-label="Undo (⌘ / Ctrl + Z)" className={iconBtn} disabled>
          <Icon name="undo" />
        </button>
        <button type="button" aria-label="Redo (⌘ / Ctrl + Shift + Z)" className={iconBtn} disabled>
          <Icon name="redo" />
        </button>
      </div>

      <div className="flex-1 flex justify-center">
        <span className="text-xs text-faint hidden sm:inline" aria-label="Autosaved in this browser…">
          Saved locally · just now
        </span>
      </div>

      <div className="hidden lg:flex items-center gap-1">
        <span className={sep} aria-hidden />
        <button type="button" aria-label="Compare architecture" className={iconBtn}>
          <Icon name="compare" />
        </button>
        <button type="button" aria-label="Continuous — every edge flows" className={iconBtn} aria-pressed="true">
          <Icon name="continuous" />
        </button>
        <button type="button" aria-label="Causal — data ripples through in order" className={iconBtn} aria-pressed="false">
          <Icon name="causal" />
        </button>
        <button type="button" aria-label="Scenario — narrated steps" className={iconBtn} aria-pressed="false">
          <Icon name="scenario" />
        </button>
        <button type="button" aria-label="Pause data flow" className={iconBtn} aria-pressed="true">
          <Icon name="pause" />
        </button>
        <button type="button" aria-label="Help — shortcuts, about & contact" className={iconBtn}>
          <Icon name="help" />
        </button>
        <button
          type="button"
          aria-label={theme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme'}
          className={iconBtn}
          onClick={toggle}
        >
          <Icon name={theme === 'dark' ? 'sun' : 'moon'} />
        </button>
      </div>
    </header>
  );
}