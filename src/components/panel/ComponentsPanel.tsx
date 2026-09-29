import { useState } from 'react';
import { Icon, type IconName } from '../ui/Icon';
import { useUi } from '../../store/ui';
import { usePanelResize } from '../../hooks/usePanelResize';

interface ComponentItem {
  name: string;
  iconName: IconName;
  /** Optional semantic color used to tint the tile background + icon stroke. */
  iconColor?: string;
}

interface Group {
  label: string;
  items: ComponentItem[];
  defaultOpen?: boolean;
  /** 'provider' renders a smaller uppercase pill-style section label with a count badge
   *  (matches AWS / Google Cloud / etc. in the reference). Default = standard first-party style. */
  variant?: 'default' | 'provider';
  /** Optional override for the count badge (e.g. reference shows "805" for AWS but we
   *  only ship a handful of items — display the published total, not items.length). */
  displayCount?: number;
}

function ItemIcon({ name, color }: { name: IconName; color?: string }) {
  if (color) {
    return (
      <div
        className="grid place-items-center h-6 w-6 rounded-md shrink-0 overflow-hidden"
        aria-hidden
        style={{
          background: `color-mix(in srgb, ${color} 20%, transparent 80%)`,
          color,
        }}
      >
        <Icon name={name} size={15} strokeWidth={2} />
      </div>
    );
  }
  return (
    <div className="grid place-items-center h-6 w-6 rounded-md shrink-0 overflow-hidden bg-surface-2 text-fg">
      <Icon name={name} size={15} strokeWidth={2} />
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
      { name: 'Rectangle', iconName: 'rectangle' },
      { name: 'Rounded',   iconName: 'rounded-rect' },
      { name: 'Ellipse',   iconName: 'ellipse' },
      { name: 'Diamond',   iconName: 'diamond' },
      { name: 'Triangle',  iconName: 'triangle' },
      { name: 'Hexagon',   iconName: 'hexagon' },
      { name: 'Cylinder',  iconName: 'cylinder' },
      { name: 'Text',      iconName: 'type' },
    ],
    defaultOpen: true,
  },
  {
    label: 'Clients & Network',
    items: [
      { name: 'Client',      iconName: 'monitor-smartphone' },
      { name: 'CDN',         iconName: 'cloud' },
      { name: 'API Gateway', iconName: 'route' },
      { name: 'Load Balancer', iconName: 'scale' },
    ],
    defaultOpen: true,
  },
  {
    label: 'Compute',
    items: [
      { name: 'Web App', iconName: 'app-window' },
      { name: 'API',     iconName: 'server-cog' },
      { name: 'Service', iconName: 'app-window' },
      { name: 'Function',iconName: 'square-function' },
    ],
  },
  {
    label: 'Data & Storage',
    items: [
      { name: 'Database', iconName: 'database',     iconColor: 'rgb(245, 158, 11)' },
      { name: 'NoSQL',    iconName: 'database-zap', iconColor: 'rgb(251, 146, 60)' },
      { name: 'Cache',    iconName: 'zap',          iconColor: 'rgb(244, 114, 182)' },
      { name: 'Storage',  iconName: 'hard-drive',   iconColor: 'rgb(148, 163, 184)' },
    ],
  },
  {
    label: 'Messaging',
    items: [
      { name: 'Queue', iconName: 'waypoints', iconColor: 'rgb(192, 132, 252)' },
    ],
  },
  {
    label: 'Security & External',
    items: [
      { name: 'Auth',     iconName: 'shield-check', iconColor: 'rgb(52, 211, 153)' },
      { name: 'External', iconName: 'globe',        iconColor: 'rgb(148, 163, 184)' },
    ],
  },
  {
    label: 'Structure',
    items: [
      { name: 'Group', iconName: 'boxes',       iconColor: 'rgb(100, 116, 139)' },
      { name: 'Note',  iconName: 'sticky-note', iconColor: 'rgb(251, 191, 36)' },
    ],
  },
  // Provider sections — each renders as an uppercase pill-style group label with a
  // count badge. The full item libraries are deferred to MM-016 (requires ~1700
  // brand-specific SVG paths). For now, each section ships a small representative
  // sample using generic Lucide placeholders so the rendering path is exercised.
  // `displayCount` shows the reference's published total so the badge matches.
  {
    label: 'AWS',
    displayCount: 805,
    variant: 'provider',
    defaultOpen: false,
    items: [
      { name: 'EC2',     iconName: 'server' },
      { name: 'S3',      iconName: 'hard-drive' },
      { name: 'Lambda',  iconName: 'square-function' },
      { name: 'RDS',     iconName: 'database' },
      { name: 'SQS',     iconName: 'waypoints' },
    ],
  },
  {
    label: 'Google Cloud',
    displayCount: 238,
    variant: 'provider',
    defaultOpen: false,
    items: [
      { name: 'Compute Engine', iconName: 'server' },
      { name: 'Cloud Storage',  iconName: 'hard-drive' },
      { name: 'BigQuery',       iconName: 'database' },
      { name: 'Pub/Sub',        iconName: 'waypoints' },
    ],
  },
  {
    label: 'Azure',
    displayCount: 638,
    variant: 'provider',
    defaultOpen: false,
    items: [
      { name: 'Virtual Machine', iconName: 'server' },
      { name: 'Blob Storage',    iconName: 'hard-drive' },
      { name: 'SQL Database',    iconName: 'database' },
      { name: 'Functions',       iconName: 'square-function' },
    ],
  },
  {
    label: 'Cloudflare',
    displayCount: 9,
    variant: 'provider',
    defaultOpen: true,
    items: [
      { name: 'Workers',  iconName: 'square-function' },
      { name: 'R2',       iconName: 'hard-drive' },
      { name: 'D1',       iconName: 'database' },
      { name: 'KV',       iconName: 'zap' },
    ],
  },
  {
    label: 'Databases',
    displayCount: 8,
    variant: 'provider',
    defaultOpen: true,
    items: [
      { name: 'PostgreSQL', iconName: 'brand-postgresql', iconColor: 'rgb(65, 105, 225)' },
      { name: 'MySQL',      iconName: 'brand-mysql',      iconColor: 'rgb(68, 121, 161)' },
      { name: 'MongoDB',    iconName: 'brand-mongodb',    iconColor: 'rgb(71, 162, 72)' },
      { name: 'Redis',      iconName: 'brand-redis',      iconColor: 'rgb(255, 68, 56)' },
      { name: 'Cassandra',  iconName: 'brand-cassandra',  iconColor: 'rgb(18, 135, 177)' },
      { name: 'Neo4j',      iconName: 'brand-neo4j',      iconColor: 'rgb(69, 129, 195)' },
      { name: 'Supabase',   iconName: 'brand-supabase',   iconColor: 'rgb(63, 207, 142)' },
      { name: 'DuckDB',     iconName: 'brand-duckdb',     iconColor: 'rgb(255, 240, 0)' },
    ],
  },
  {
    label: 'Data & Analytics',
    displayCount: 7,
    variant: 'provider',
    defaultOpen: true,
    items: [
      { name: 'Snowflake',     iconName: 'brand-snowflake',     iconColor: 'rgb(41, 181, 232)' },
      { name: 'Databricks',    iconName: 'brand-databricks',    iconColor: 'rgb(255, 54, 33)' },
      { name: 'Spark',         iconName: 'brand-apache-spark',  iconColor: 'rgb(226, 90, 28)' },
      { name: 'Airflow',       iconName: 'brand-airflow',       iconColor: 'rgb(1, 124, 238)' },
      { name: 'ClickHouse',    iconName: 'brand-clickhouse',    iconColor: 'rgb(250, 255, 105)' },
      { name: 'Elasticsearch', iconName: 'brand-elasticsearch', iconColor: 'rgb(0, 85, 113)' },
      { name: 'Looker',        iconName: 'brand-looker',        iconColor: 'rgb(66, 133, 244)' },
    ],
  },
  {
    label: 'Messaging & Streaming',
    displayCount: 2,
    variant: 'provider',
    defaultOpen: true,
    items: [
      { name: 'Kafka',     iconName: 'brand-kafka',     iconColor: 'rgb(123, 123, 123)' },
      { name: 'RabbitMQ',  iconName: 'brand-rabbitmq',  iconColor: 'rgb(255, 102, 0)' },
    ],
  },
  {
    label: 'DevOps & Observability',
    displayCount: 11,
    variant: 'provider',
    defaultOpen: true,
    items: [
      { name: 'Docker',     iconName: 'brand-docker',     iconColor: 'rgb(36, 150, 237)' },
      { name: 'Kubernetes', iconName: 'brand-kubernetes', iconColor: 'rgb(50, 108, 229)' },
      { name: 'Terraform',  iconName: 'brand-terraform',  iconColor: 'rgb(132, 79, 186)' },
      { name: 'NGINX',      iconName: 'brand-nginx',      iconColor: 'rgb(0, 150, 57)' },
      { name: 'Cloudflare', iconName: 'brand-cloudflare', iconColor: 'rgb(243, 128, 32)' },
      { name: 'Prometheus', iconName: 'brand-prometheus', iconColor: 'rgb(230, 82, 44)' },
      { name: 'Grafana',    iconName: 'brand-grafana',    iconColor: 'rgb(244, 104, 0)' },
      { name: 'Datadog',    iconName: 'brand-datadog',    iconColor: 'rgb(99, 44, 166)' },
      { name: 'Sentry',     iconName: 'brand-sentry',     iconColor: 'rgb(54, 45, 89)' },
      { name: 'GitHub',     iconName: 'brand-github',     iconColor: 'rgb(139, 148, 158)' },
      { name: 'GitLab',     iconName: 'brand-gitlab',     iconColor: 'rgb(252, 109, 38)' },
    ],
  },
  {
    label: 'SaaS & Identity',
    displayCount: 4,
    variant: 'provider',
    defaultOpen: true,
    items: [
      { name: 'Stripe',   iconName: 'brand-stripe',   iconColor: 'rgb(99, 91, 255)' },
      { name: 'Auth0',    iconName: 'brand-auth0',    iconColor: 'rgb(235, 84, 36)' },
      { name: 'Okta',     iconName: 'brand-okta',     iconColor: 'rgb(0, 125, 193)' },
      { name: 'Firebase', iconName: 'brand-firebase', iconColor: 'rgb(255, 202, 40)' },
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

  // Vertical resize handle on the panel's right edge. The hook updates the
  // aside's inline width on pointer drag and persists the final width.
  const { separatorProps } = usePanelResize({
    targetSelector: 'aside[aria-label="Components"]',
    minWidth: 200,
    maxFraction: 0.5,
    storageKey: 'gravelgraph.componentsPanel.width',
  });

  // Search query (case-insensitive substring filter across item names).
  const [query, setQuery] = useState('');
  const q = query.trim().toLowerCase();

  // Derived groups: when querying, filter items + drop empty groups + force-expand.
  const visibleGroups = q
    ? GROUPS
        .map((g) => ({
          ...g,
          items: g.items.filter((it) => it.name.toLowerCase().includes(q)),
        }))
        .filter((g) => g.items.length > 0)
    : GROUPS;

  // Per-group open flag: query overrides openMap to force-expand matching groups.
  const isOpen = (label: string) => (q ? true : !!openMap[label]);

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
          ? 'relative fixed top-12 left-0 z-30 w-[280px] bottom-0 border-r border-border bg-surface flex flex-col overflow-hidden lg:static lg:shrink-0 lg:z-auto lg:w-[280px] lg:h-full shadow-panel lg:shadow-none'
          : 'hidden lg:flex lg:shrink-0 lg:relative lg:w-[280px] lg:h-full lg:border-r lg:border-border lg:bg-surface lg:flex-col lg:overflow-hidden'
      }
    >
      {/* Resize handle (desktop only) — drag to adjust panel width. */}
      <div {...separatorProps} />
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
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full pl-7 pr-2 h-8 rounded-md bg-surface-2 border border-border text-sm placeholder:text-faint focus:outline-none focus:ring-2 focus:ring-accent/40"
          />
        </div>
        <div className="flex items-center justify-center gap-4 mt-2 text-xs text-faint">
          <button type="button" title="Expand every section" onClick={onExpandAll} className="inline-flex items-center gap-1 hover:text-fg transition-colors">
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden><polyline points="7 15 12 20 17 15"/></svg>
            Expand all
          </button>
          <button type="button" title="Collapse every section" onClick={onCollapseAll} className="inline-flex items-center gap-1 hover:text-fg transition-colors">
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
        {visibleGroups.map((group) => {
          const open = isOpen(group.label);
          const variant = group.variant ?? 'default';
          // Badge count: when searching show match count, otherwise show default count.
          const badgeCount = q ? group.items.length : (group.displayCount ?? group.items.length);
          return (
            <section
              key={group.label}
              className={variant === 'provider' ? 'mt-1.5' : 'px-3 mt-2'}
            >
              <button
                type="button"
                aria-expanded={open}
                onClick={() => toggle(group.label)}
                className={
                  variant === 'provider'
                    ? 'flex items-center gap-1 w-full px-1 py-1 rounded text-[11px] font-semibold uppercase tracking-wide text-faint hover:text-fg hover:bg-surface-3 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent'
                    : 'w-full flex items-center gap-1.5 text-[11px] font-semibold tracking-wider text-muted hover:text-fg transition-colors'
                }
              >
                {variant === 'provider' ? (
                  <Icon name="chevron-right" size={12} strokeWidth={2} className={`shrink-0 transition-transform ${open ? 'rotate-90' : ''}`} />
                ) : (
                  <Chevron open={open} />
                )}
                <span className="truncate">{group.label}</span>
                {variant === 'provider' ? (
                  <span className="ml-auto shrink-0 rounded-full bg-surface-3 px-1.5 text-[10px] normal-case tracking-normal text-muted">
                    {badgeCount}
                  </span>
                ) : (
                  <span className="ml-auto text-faint font-normal">{badgeCount}</span>
                )}
              </button>
              {open && (
                <div className={variant === 'provider' ? 'flex flex-col gap-1 mt-1' : 'flex flex-col gap-1 mt-1.5'}>
                  {group.items.map((item) => (
                    <button
                      key={item.name}
                      type="button"
                      draggable
                      title={`Add ${item.name} — drag onto canvas or click`}
                      className="group flex items-center gap-1.5 rounded-lg border border-border bg-surface-2 hover:bg-surface-3 hover:border-border-strong px-1.5 py-2 text-left transition-colors cursor-grab active:cursor-grabbing focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
                    >
                      {item.iconName ? <ItemIcon name={item.iconName} color={item.iconColor} /> : null}
                      <span className="min-w-0 flex flex-col">
                        <span className="text-xs font-medium text-fg truncate">{item.name}</span>
                      </span>
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
