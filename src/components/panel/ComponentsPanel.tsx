import { useState, type ReactNode } from 'react';
import { Icon } from '../ui/Icon';
import { useUi } from '../../store/ui';

interface ComponentItem {
  name: string;
  icon: ReactNode;
}

interface Group {
  label: string;
  items: ComponentItem[];
  defaultOpen?: boolean;
}

function shapeIcon(symbol: string) {
  return (
    <div className="h-9 w-9 rounded-md flex items-center justify-center bg-surface-2 text-fg border border-border">
      <span aria-hidden className="text-base leading-none">{symbol}</span>
    </div>
  );
}

function Chevron({ open }: { open: boolean }) {
  return (
    <svg
      width="12" height="12" viewBox="0 0 24 24"
      fill="none" stroke="currentColor" strokeWidth="2.5"
      strokeLinecap="round" strokeLinejoin="round"
      aria-hidden
      style={{ transform: open ? 'rotate(90deg)' : 'rotate(0deg)', transition: 'transform 150ms' }}
    >
      <polyline points="9 18 15 12 9 6" />
    </svg>
  );
}

const GROUPS: Group[] = [
  {
    label: 'Shapes',
    items: [
      { name: 'Rectangle', icon: shapeIcon('▭') },
      { name: 'Rounded',   icon: shapeIcon('⬜') },
      { name: 'Ellipse',   icon: shapeIcon('◯') },
      { name: 'Diamond',   icon: shapeIcon('◇') },
      { name: 'Triangle',  icon: shapeIcon('△') },
      { name: 'Hexagon',   icon: shapeIcon('⬡') },
      { name: 'Cylinder',  icon: shapeIcon('⌭') },
      { name: 'Text',      icon: shapeIcon('T') },
    ],
    defaultOpen: true,
  },
  {
    label: 'Clients & Network',
    items: [
      { name: 'Client',      icon: shapeIcon('◐') },
      { name: 'CDN',         icon: shapeIcon('☁') },
      { name: 'API Gateway', icon: shapeIcon('⇄') },
      { name: 'Load Balancer', icon: shapeIcon('⇆') },
    ],
    defaultOpen: true,
  },
  {
    label: 'Compute',
    items: [
      { name: 'Server',  icon: shapeIcon('▣') },
      { name: 'Function',icon: shapeIcon('ƒ') },
      { name: 'Container', icon: shapeIcon('◫') },
      { name: 'Worker',  icon: shapeIcon('⚙') },
    ],
  },
];

export function ComponentsPanel() {
  const [openMap, setOpenMap] = useState<Record<string, boolean>>(() => {
    const init: Record<string, boolean> = {};
    GROUPS.forEach((g) => { init[g.label] = !!g.defaultOpen; });
    return init;
  });

  const componentsOpen = useUi((s) => s.componentsOpen);
  const setComponentsOpen = useUi((s) => s.setComponentsOpen);

  const toggle = (label: string) => setOpenMap((m) => ({ ...m, [label]: !m[label] }));
  const allOpen = GROUPS.every((g) => openMap[g.label]);
  const allClosed = GROUPS.every((g) => !openMap[g.label]);

  const onExpandAll = () => {
    const next: Record<string, boolean> = {};
    GROUPS.forEach((g) => { next[g.label] = true; });
    setOpenMap(next);
  };
  const onCollapseAll = () => {
    const next: Record<string, boolean> = {};
    GROUPS.forEach((g) => { next[g.label] = false; });
    setOpenMap(next);
  };

  return (
    <aside
      aria-label="Components"
      className={
        componentsOpen
          ? 'fixed top-12 left-0 z-30 w-[280px] bottom-0 border-r border-border bg-surface flex flex-col overflow-hidden lg:static lg:shrink-0 lg:z-auto lg:w-[280px] lg:h-full shadow-panel lg:shadow-none'
          : 'hidden lg:flex lg:shrink-0 lg:w-[280px] lg:h-full lg:border-r lg:border-border lg:bg-surface lg:flex-col lg:overflow-hidden'
      }
    >
      {/* Header */}
      <header className="h-10 px-3 flex items-center justify-between border-b border-border">
        <h2 className="text-sm font-semibold tracking-tight">Components</h2>
        <button
          type="button"
          aria-label="Close Components"
          className="inline-flex items-center justify-center rounded-md p-1 hover:bg-surface-2 text-fg"
          onClick={() => setComponentsOpen(false)}
        >
          <Icon name="x" size={14} />
        </button>
      </header>

      {/* Search */}
      <div className="px-3 pt-3 pb-2">
        <div className="relative">
          <span className="absolute left-2 top-1/2 -translate-y-1/2 text-faint">
            <Icon name="search" size={14} />
          </span>
          <input
            type="search"
            placeholder="Search components & services"
            aria-label="Search components and services"
            className="w-full pl-7 pr-2 h-8 rounded-md bg-surface-2 border border-border text-sm placeholder:text-faint focus:outline-none focus:ring-2 focus:ring-accent/40"
          />
        </div>
        <div className="flex items-center justify-center gap-4 mt-2 text-xs text-faint">
          <button type="button" title="Expand every section" className="inline-flex items-center gap-1 hover:text-fg transition-colors">
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden><polyline points="7 15 12 20 17 15"/></svg>
            Expand all
          </button>
          <button type="button" title="Collapse every section" className="inline-flex items-center gap-1 hover:text-fg transition-colors">
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden><polyline points="7 20 12 15 17 20"/></svg>
            Collapse all
          </button>
        </div>
      </div>

      {/* Stencils group (always visible header, no body yet) */}
      <div className="px-3 mt-2">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-semibold tracking-wider text-muted">Stencils</span>
          <div className="flex items-center gap-1 text-muted">
            <button title="Import stencils (.json)" className="p-1 rounded hover:bg-surface-2 hover:text-fg transition-colors">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                <path d="M12 3v12" /><polyline points="6 11 12 17 18 11" />
              </svg>
            </button>
            <button title="Export stencils" className="p-1 rounded hover:bg-surface-2 hover:text-fg transition-colors">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                <path d="M12 15V3" /><polyline points="6 9 12 3 18 9" />
              </svg>
            </button>
          </div>
        </div>
        <p className="text-[11px] text-faint italic mt-1 leading-snug">
          Select elements, then “Save as stencil” to reuse them here.
        </p>
      </div>

      {/* Component groups (scrollable) */}
      <div className="flex-1 overflow-y-auto mt-2 pb-3">
        {GROUPS.map((group) => {
          const open = openMap[group.label];
          return (
            <section key={group.label} className="px-3 mt-2">
              <button
                type="button"
                aria-expanded={open}
                onClick={() => toggle(group.label)}
                className="w-full flex items-center gap-1.5 text-[11px] font-semibold tracking-wider text-muted hover:text-fg transition-colors"
              >
                <Chevron open={open} />
                <span>{group.label}</span>
                <span className="ml-auto text-faint font-normal">{group.items.length}</span>
              </button>
              {open && (
                <div className="grid grid-cols-2 gap-1.5 mt-1.5">
                  {group.items.map((item) => (
                    <button
                      key={item.name}
                      type="button"
                      className="flex items-center gap-2 px-2 py-1.5 rounded-md border border-border bg-surface hover:bg-surface-2 transition-colors text-left min-w-0"
                    >
                      {item.icon}
                      <span className="text-xs font-medium truncate" title={item.name}>{item.name}</span>
                    </button>
                  ))}
                </div>
              )}
            </section>
          );
        })}
      </div>
    </aside>
  );
}
