import { Handle, Position, type NodeProps } from '@xyflow/react';
import type { ComponentType } from 'react';
import { Icon } from '../components/ui/Icon';
import type { ArchNodeData } from './defaultDiagram';

// Per-kind colour + Lucide icon (matches REVERSE_ENGINEERING.md §4.2 palette).
// The icon tile uses the colour at 20% opacity as background, full opacity as icon colour —
// matching the reference's "tinted tile" chrome.
const KIND: Record<
  string,
  { color: string; icon: ComponentType<{ size?: number; strokeWidth?: number; className?: string }> | null; lucideName: string | null }
> = {
  client:   { color: '#38bdf8', icon: null, lucideName: 'monitor-smartphone' },
  cdn:      { color: '#38bdf8', icon: null, lucideName: 'cloud' },
  webapp:   { color: '#34d399', icon: null, lucideName: 'app-window' },
  gateway:  { color: '#818cf8', icon: null, lucideName: 'route' },
  api:      { color: '#22d3ee', icon: null, lucideName: 'server-cog' },
  cache:    { color: '#f472b6', icon: null, lucideName: 'zap' },
  database: { color: '#f59e0b', icon: null, lucideName: 'database' },
  queue:    { color: '#c084fc', icon: null, lucideName: 'waypoints' },
  worker:   { color: '#a78bfa', icon: null, lucideName: 'boxes' },
};

export function ArchNode({ data, selected }: NodeProps) {
  const d = data as ArchNodeData;
  const k = KIND[d.kind] ?? { color: '#22d3ee', lucideName: 'square' };
  // 20% opacity tint of the kind colour, matching the reference's
  // `background: color(srgb 0.21 0.74 0.97 / 0.2)` rendering.
  const tileBg = `color-mix(in srgb, ${k.color} 20%, transparent)`;
  return (
    <div
      className={
        'group relative flex items-center gap-2.5 rounded-xl border bg-surface ' +
        'px-3 py-2.5 min-h-full w-full shadow-panel transition-colors ' +
        (selected ? 'border-accent' : 'border-border')
      }
      style={{ borderColor: selected ? 'var(--color-accent)' : 'var(--color-border)' }}
    >
      <div
        className="grid place-items-center h-9 w-9 rounded-lg shrink-0 overflow-hidden"
        style={{ background: tileBg, color: k.color }}
        aria-hidden
      >
        {k.lucideName && <Icon name={k.lucideName as never} size={18} strokeWidth={1.75} className="" />}
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-sm font-semibold leading-tight truncate" title={d.label}>
          {d.label}
        </div>
        <div className="text-xs text-faint leading-tight truncate">{d.sublabel}</div>
      </div>

      {/* 8 invisible hover handles per node (top/right/bottom/left × center/quarter/three-quarter) */}
      <Handle id="t"  position={Position.Top}    type="source" className="!opacity-0 group-hover:!opacity-100 transition-opacity duration-150" />
      <Handle id="ta" position={Position.Top}    type="source" className="!opacity-0 group-hover:!opacity-100 transition-opacity duration-150" style={{ left: '25%' }} />
      <Handle id="tb" position={Position.Top}    type="source" className="!opacity-0 group-hover:!opacity-100 transition-opacity duration-150" style={{ left: '75%' }} />
      <Handle id="r"  position={Position.Right}  type="source" className="!opacity-0 group-hover:!opacity-100 transition-opacity duration-150" />
      <Handle id="ra" position={Position.Right}  type="source" className="!opacity-0 group-hover:!opacity-100 transition-opacity duration-150" style={{ top: '25%' }} />
      <Handle id="rb" position={Position.Right}  type="source" className="!opacity-0 group-hover:!opacity-100 transition-opacity duration-150" style={{ top: '75%' }} />
      <Handle id="b"  position={Position.Bottom} type="source" className="!opacity-0 group-hover:!opacity-100 transition-opacity duration-150" />
      <Handle id="ba" position={Position.Bottom} type="source" className="!opacity-0 group-hover:!opacity-100 transition-opacity duration-150" style={{ left: '25%' }} />
      <Handle id="bb" position={Position.Bottom} type="source" className="!opacity-0 group-hover:!opacity-100 transition-opacity duration-150" style={{ left: '75%' }} />
      <Handle id="l"  position={Position.Left}   type="source" className="!opacity-0 group-hover:!opacity-100 transition-opacity duration-150" />
      <Handle id="la" position={Position.Left}   type="source" className="!opacity-0 group-hover:!opacity-100 transition-opacity duration-150" style={{ top: '25%' }} />
      <Handle id="lb" position={Position.Left}   type="source" className="!opacity-0 group-hover:!opacity-100 transition-opacity duration-150" style={{ top: '75%' }} />

      {/* Target handles (same ids, type=target) */}
      <Handle id="t"  position={Position.Top}    type="target" className="!opacity-0 group-hover:!opacity-100 transition-opacity duration-150" />
      <Handle id="r"  position={Position.Right}  type="target" className="!opacity-0 group-hover:!opacity-100 transition-opacity duration-150" />
      <Handle id="b"  position={Position.Bottom} type="target" className="!opacity-0 group-hover:!opacity-100 transition-opacity duration-150" />
      <Handle id="l"  position={Position.Left}   type="target" className="!opacity-0 group-hover:!opacity-100 transition-opacity duration-150" />
    </div>
  );
}