import { useEffect, useState } from 'react';
import { Icon } from '../ui/Icon';

interface Starter {
  id: string;
  title: string;
  description: string;
  icon: 'route' | 'cloud' | 'arrow' | 'database-zap' | 'zap' | 'waypoints' | 'monitor-smartphone';
  iconBg: string;
  iconFg: string;
}

const STARTERS: Starter[] = [
  {
    id: 'system',
    title: 'System architecture',
    description: 'A 3-tier web app as a living diagram: a browser request runs the API spine to Postgres while assets flow through the CDN and orders fan out to a cache and an event-driven worker — real payloads on every edge.',
    icon: 'route',
    iconBg: 'bg-[#dbeafe]',
    iconFg: 'text-[#3b82f6]',
  },
  {
    id: 'cloud',
    title: 'Cloud architecture',
    description: 'AWS serverless in official icons: a request writes to DynamoDB, then fans out through SQS to an async worker Lambda.',
    icon: 'cloud',
    iconBg: 'bg-[#ffedd5]',
    iconFg: 'text-[#f59e0b]',
  },
  {
    id: 'api',
    title: 'API request flow',
    description: 'Step through one request and its reply, one message at a time: client to API to Postgres and back.',
    icon: 'arrow',
    iconBg: 'bg-[#dbeafe]',
    iconFg: 'text-[#3b82f6]',
  },
  {
    id: 'order',
    title: 'Order flowchart',
    description: 'Top-down order decision flow: receive it, check stock, then ship or backorder to finish.',
    icon: 'database-zap',
    iconBg: 'bg-[#dcfce7]',
    iconFg: 'text-[#22c55e]',
  },
  {
    id: 'telemetry',
    title: 'Real-time telemetry (UDP)',
    description: 'IoT sensors fire UDP datagrams that a stream processor turns into live dashboards, rollups and alerts.',
    icon: 'zap',
    iconBg: 'bg-[#f3e8ff]',
    iconFg: 'text-[#a855f7]',
  },
  {
    id: 'etl',
    title: 'ETL / CSV pipeline',
    description: 'CSV lands in S3, an Airflow DAG extracts it, Spark cleans it, Snowflake stores it, and Looker charts daily revenue.',
    icon: 'waypoints',
    iconBg: 'bg-[#dcfce7]',
    iconFg: 'text-[#22c55e]',
  },
  {
    id: 'streaming',
    title: 'Event streaming',
    description: 'Order events land on a Kafka topic and fan out live to a stream processor, search index, warehouse and cache — with a dead-letter branch.',
    icon: 'monitor-smartphone',
    iconBg: 'bg-[#fce7f3]',
    iconFg: 'text-[#ec4899]',
  },
];

const STORAGE_KEY = 'gravelgraph.seenWelcome';

export function WelcomeModal() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    try {
      if (!localStorage.getItem(STORAGE_KEY)) {
        setOpen(true);
      }
    } catch {}
  }, []);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') dismiss();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  function dismiss() {
    try { localStorage.setItem(STORAGE_KEY, '1'); } catch {}
    setOpen(false);
  }

  function pick(id: string) {
    // All 7 starters load the default System architecture fixture for now
    // (matches the reference's "click any starter → load a similar template"
    // behavior at a high level; per-template fixtures will arrive in MM-041+).
    try { localStorage.setItem(STORAGE_KEY, '1'); } catch {}
    setOpen(false);
    if (id !== 'system') {
      // No-op placeholder so future per-starter loaders have a hook.
    }
  }

  if (!open) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="What would you like to make?"
      className="fixed inset-0 z-50 flex items-start justify-center p-4 sm:p-12 bg-black/30 backdrop-blur-sm overflow-y-auto"
      onClick={(e) => {
        if (e.target === e.currentTarget) dismiss();
      }}
    >
      <div className="relative w-full max-w-[640px] rounded-2xl border border-border bg-surface shadow-panel my-8 flex flex-col">
        <div className="flex items-start justify-between gap-4 px-6 pt-5 pb-3">
          <h2 className="text-base font-semibold tracking-tight pr-8">
            What would you like to make?
          </h2>
          <button
            type="button"
            aria-label="Close"
            onClick={dismiss}
            className="absolute top-4 right-4 inline-flex h-7 w-7 items-center justify-center rounded-md text-fg-muted hover:text-fg hover:bg-surface-2 transition-colors"
          >
            <Icon name="x" size={16} />
          </button>
        </div>
        <div className="px-6 pb-5 text-sm text-muted leading-relaxed">
          Pick a starting point and we'll drop in a live example, so you can see
          what GravelGraph does straight away. Change anything you like — or
          clear it and start fresh. Nothing is uploaded; your work stays in this
          browser.
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 px-4 pb-4">
          {STARTERS.map((s) => (
            <button
              key={s.id}
              type="button"
              onClick={() => pick(s.id)}
              className="group text-left rounded-xl border border-border bg-surface-2 hover:bg-surface-3 hover:border-border-strong transition-colors p-3 flex flex-col gap-1.5 min-h-[88px]"
            >
              <span
                aria-hidden
                className={`inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-md ${s.iconBg} ${s.iconFg}`}
              >
                <Icon name={s.icon} size={15} />
              </span>
              <span className="text-sm font-semibold tracking-tight text-fg">
                {s.title}
              </span>
              <span className="text-xs text-muted leading-snug">
                {s.description}
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}