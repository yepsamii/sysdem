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

  // Icon-only square button — used for the canvas-mode toggles.
  // Reference uses 36×36 squares with 18px icons. Local previously used 28×28 / 16px.
  // `inline-flex` is intentionally omitted so `hidden lg:inline-flex ${iconBtn}` wrappers
  // actually hide the button at non-lg widths (see MM-039). Wrappers provide the display.
  const iconBtn =
    'items-center justify-center rounded-lg transition-colors hover:bg-surface-2 text-fg disabled:opacity-40 disabled:pointer-events-none h-9 w-9';
  // Pressed variant for selected mode toggle.
  const iconBtnPressed =
    'inline-flex items-center justify-center rounded-lg transition-colors bg-surface text-fg h-9 w-9 shadow-sm';
  // Pill used for Export / Present / Pause — has a label next to the icon.
  const chipBtn =
    'inline-flex items-center justify-center gap-2 rounded-lg font-medium transition-colors duration-150 select-none whitespace-nowrap bg-surface-2 text-fg hover:bg-surface-3 border border-border h-8 px-3 text-sm';
  // File dropdown button — labeled, with a chevron, no border (matches reference).
  // `inline-flex` omitted — see `iconBtn` note (MM-039). Wrappers provide the display.
  const fileBtn =
    'items-center justify-center gap-1 rounded-lg font-medium transition-colors duration-150 select-none whitespace-nowrap text-fg hover:bg-surface-2 h-8 pl-2.5 pr-1.5 text-sm';
  // 1px vertical separator between toolbar groups (matches reference w-px h-5 bg-border mx-0.5).
  const sep = 'w-px h-5 bg-border mx-0.5';
  // Container that groups mode-toggle pills (matches reference's bg-surface-2 bordered rounded-lg p-0.5 gap-0.5).
  const segmentedGroup =
    'inline-flex items-center rounded-lg bg-surface-2 border border-border p-0.5 gap-0.5';

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

      {/* Separator between brand mark and File dropdown (matches reference's gap-2/mx-1) */}
      <span className={`${sep} hidden lg:inline-block`} aria-hidden />

      {/* File dropdown pill — labeled "File" with chevron (matches reference's 58×32 pill) */}
      <button
        type="button"
        aria-label="File"
        aria-haspopup="menu"
        className={`hidden lg:flex ${fileBtn}`}
      >
        <span>File</span>
        <Icon name="chevron-down" size={14} />
      </button>

      <span className={`${sep} hidden lg:inline-block`} aria-hidden />

      {/* Secondary toolbar group — canvas mode toggles + Export + Present */}
      <div className="hidden lg:flex items-center gap-1">
        <button type="button" aria-label="Select — drag a box to select multiple (V)" className={`inline-flex ${iconBtn}`} aria-pressed="false">
          <Icon name="cursor" />
        </button>
        <button type="button" aria-label="Hand — drag to pan the canvas (H)" className={iconBtnPressed} aria-pressed="true">
          <Icon name="hand" />
        </button>
        <button type="button" aria-label="Draw — freehand pen" className={`inline-flex ${iconBtn}`} aria-pressed="false">
          <Icon name="pencil" />
        </button>
        <button type="button" aria-label="Line — draw a freestanding line" className={`inline-flex ${iconBtn}`} aria-pressed="false">
          <Icon name="line" />
        </button>
        <button type="button" aria-label="Arrow — draw a freestanding arrow" className={`inline-flex ${iconBtn}`} aria-pressed="false">
          <Icon name="arrow" />
        </button>

        <span className={`${sep} hidden lg:inline-block`} aria-hidden />

        <button type="button" aria-label="Export diagram" className={chipBtn}>
          <Icon name="download" size={15} />
          <span>Export</span>
        </button>
        <button type="button" aria-label="Present (fullscreen playback)" className={chipBtn}>
          <Icon name="present" size={15} />
          <span>Present</span>
        </button>
      </div>

      {/* Tertiary toolbar group — undo / redo (matches reference's separate cluster) */}
      <div className="hidden lg:flex items-center gap-1">
        <span className={`${sep} hidden lg:inline-block`} aria-hidden />
        <button type="button" aria-label="Undo (⌘ / Ctrl + Z)" className={`inline-flex ${iconBtn}`} disabled>
          <Icon name="undo" />
        </button>
        <button type="button" aria-label="Redo (⌘ / Ctrl + Shift + Z)" className={`inline-flex ${iconBtn}`} disabled>
          <Icon name="redo" />
        </button>
      </div>

      {/* Center cluster: green-dot indicator with "Saved locally · just now" */}
      <div className="flex-1 flex justify-center">
        <span className="hidden xl:flex min-w-0 items-center gap-1.5 text-xs text-faint select-none" aria-label="Autosaved in this browser…">
          <span className="h-1.5 w-1.5 rounded-full bg-success shrink-0" aria-hidden />
          <span className="truncate">Saved locally · just now</span>
        </span>
      </div>

      {/* Primary toolbar group — Compare + segmented mode-toggle pill, then Pause, help, theme toggle */}
      <div className="flex items-center gap-1">
        {/* Compare icon sits left of the segmented mode group (matches reference's right cluster at x≈1037) */}
        <button type="button" aria-label="Compare architecture" className={`hidden lg:flex ${iconBtn}`}>
          <Icon name="compare" />
        </button>

        {/* Mode toggles grouped in a segmented pill (matches reference's 112×34 bordered group) */}
        <div className={segmentedGroup} role="group" aria-label="Playback mode">
          <button
            type="button"
            aria-label="Continuous — every edge flows"
            className={`inline-flex flex-1 items-center justify-center gap-1.5 h-7 px-2.5 rounded-md text-sm font-medium whitespace-nowrap transition-colors ${
              mode === 'continuous' ? 'bg-surface text-fg shadow-sm' : 'text-fg-muted hover:text-fg'
            }`}
            aria-pressed={mode === 'continuous'}
            onClick={() => setMode('continuous')}
          >
            <Icon name="continuous" size={14} />
          </button>
          <button
            type="button"
            aria-label="Causal — data ripples through in order"
            className={`inline-flex flex-1 items-center justify-center gap-1.5 h-7 px-2.5 rounded-md text-sm font-medium whitespace-nowrap transition-colors ${
              mode === 'causal' ? 'bg-surface text-fg shadow-sm' : 'text-fg-muted hover:text-fg'
            }`}
            aria-pressed={mode === 'causal'}
            onClick={() => setMode('causal')}
          >
            <Icon name="causal" size={14} />
          </button>
          <button
            type="button"
            aria-label="Scenario — narrated steps"
            className={`inline-flex flex-1 items-center justify-center gap-1.5 h-7 px-2.5 rounded-md text-sm font-medium whitespace-nowrap transition-colors ${
              mode === 'scenario' ? 'bg-surface text-fg shadow-sm' : 'text-fg-muted hover:text-fg'
            }`}
            aria-pressed={mode === 'scenario'}
            onClick={() => setMode('scenario')}
          >
            <Icon name="scenario" size={14} />
          </button>
        </div>

        {/* Pause chip */}
        <button
          type="button"
          aria-label={paused ? 'Resume data flow' : 'Pause data flow'}
          className={chipBtn}
          aria-pressed={paused}
          onClick={togglePaused}
        >
          <Icon name={paused ? 'play' : 'pause'} size={15} />
          <span className="hidden xl:inline">{paused ? 'Play' : 'Pause'}</span>
        </button>

        <button type="button" aria-label="Help — shortcuts, about & contact" className={`hidden lg:flex ${iconBtn}`}>
          <Icon name="help" />
        </button>
        <button
          type="button"
          aria-label={theme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme'}
          className={`inline-flex ${iconBtn}`}
          onClick={toggle}
        >
          <Icon name={theme === 'dark' ? 'sun' : 'moon'} />
        </button>
      </div>
    </header>
  );
}