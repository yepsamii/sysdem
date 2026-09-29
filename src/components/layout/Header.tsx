import { Icon } from '../ui/Icon';
import { useTheme } from '../../store/theme';
import { useFlow } from '../../store/flow';
import { useUi } from '../../store/ui';

export function Header() {
  const theme = useTheme((s) => s.theme);
  const toggle = useTheme((s) => s.toggle);
  const paused = useFlow((s) => s.paused);
  const togglePaused = useFlow((s) => s.togglePaused);
  const mode = useFlow((s) => s.mode);
  const setMode = useFlow((s) => s.setMode);
  const toggleComponents = useUi((s) => s.toggleComponents);

  const iconBtn =
    'inline-flex items-center justify-center rounded-md p-1.5 transition-colors hover:bg-surface-2 text-fg disabled:opacity-40 disabled:pointer-events-none';
  const iconBtnPressed =
    'inline-flex items-center justify-center rounded-md p-1.5 transition-colors bg-accent text-accent-contrast';
  const chipBtn =
    'inline-flex items-center justify-center gap-2 rounded-lg font-medium transition-colors duration-150 select-none whitespace-nowrap bg-surface-2 text-fg hover:bg-surface-3 border border-border h-8 px-3 text-sm';
  const sep = 'h-6 w-px bg-border mx-1';

  return (
    <header
      role="banner"
      className="h-12 w-full shrink-0 border-b border-border bg-surface flex items-center gap-1 px-2"
    >
      <Icon name="logo" size={18} className="text-accent mx-1" />
      <span className="text-sm font-semibold tracking-tight mr-2 select-none hidden sm:inline">
        GravelGraph
      </span>

      {/* Mobile: hamburger toggles the Components panel */}
      <button
        type="button"
        aria-label="Open Components"
        className={`lg:hidden ${iconBtn}`}
        onClick={toggleComponents}
      >
        <Icon name="menu" />
      </button>

      {/* File button — desktop only (mobile hamburger takes its place) */}
      <button type="button" aria-label="File" className={`hidden lg:inline-flex ${iconBtn}`}>
        <Icon name="file" />
      </button>

      {/* Secondary toolbar group — desktop only */}
      <div className="hidden lg:flex items-center gap-1">
        <button type="button" aria-label="Select — drag a box to select multiple (V)" className={iconBtn} aria-pressed="false">
          <Icon name="cursor" />
        </button>
        <button type="button" aria-label="Hand — drag to pan the canvas (H)" className={iconBtnPressed} aria-pressed="true">
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
        <button type="button" aria-label="Export diagram" className={chipBtn}>
          <Icon name="download" size={15} />
          <span>Export</span>
        </button>
        <button type="button" aria-label="Present (fullscreen playback)" className={chipBtn}>
          <Icon name="present" size={15} />
          <span>Present</span>
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

      {/* Primary toolbar group — always visible (chips collapse to icons below xl) */}
      <div className="flex items-center gap-1">
        <span className={`${sep} hidden lg:inline-block`} aria-hidden />
        <button type="button" aria-label="Compare architecture" className={`hidden xl:inline-flex ${iconBtn}`}>
          <Icon name="compare" />
        </button>
        <button
          type="button"
          aria-label="Continuous — every edge flows"
          className={mode === 'continuous' ? iconBtnPressed : iconBtn}
          aria-pressed={mode === 'continuous'}
          onClick={() => setMode('continuous')}
        >
          <Icon name="continuous" />
        </button>
        <button
          type="button"
          aria-label="Causal — data ripples through in order"
          className={mode === 'causal' ? iconBtnPressed : iconBtn}
          aria-pressed={mode === 'causal'}
          onClick={() => setMode('causal')}
        >
          <Icon name="causal" />
        </button>
        <button
          type="button"
          aria-label="Scenario — narrated steps"
          className={mode === 'scenario' ? iconBtnPressed : iconBtn}
          aria-pressed={mode === 'scenario'}
          onClick={() => setMode('scenario')}
        >
          <Icon name="scenario" />
        </button>
        <button
          type="button"
          aria-label={paused ? 'Resume data flow' : 'Pause data flow'}
          className={paused ? iconBtnPressed : iconBtn}
          aria-pressed={paused}
          onClick={togglePaused}
        >
          <Icon name={paused ? 'play' : 'pause'} />
        </button>
        <button type="button" aria-label="Help — shortcuts, about & contact" className={`hidden md:inline-flex ${iconBtn}`}>
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