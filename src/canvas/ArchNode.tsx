import { Handle, Position, type NodeProps } from '@xyflow/react';
import type { ArchNodeData } from './defaultDiagram';

// Per-kind icon (lucide-style line) and accent colour.
// Colours map to the edge particle palette in REVERSE_ENGINEERING.md §4.2.
const KIND: Record<string, { stroke: string; bg: string; label: string }> = {
  client:   { stroke: '#94a3b8', bg: '#1a1f29', label: '◐' },
  cdn:      { stroke: '#22d3ee', bg: '#0a2a32', label: '☁' },
  webapp:   { stroke: '#22d3ee', bg: '#0a2a32', label: '▢' },
  gateway:  { stroke: '#22d3ee', bg: '#0a2a32', label: '⇄' },
  api:      { stroke: '#22d3ee', bg: '#0a2a32', label: '⌘' },
  cache:    { stroke: '#f472b6', bg: '#2a1424', label: '⚡' },
  database: { stroke: '#f59e0b', bg: '#2a1a08', label: '⌗' },
  queue:    { stroke: '#a78bfa', bg: '#1a1838', label: '⌇' },
  worker:   { stroke: '#a78bfa', bg: '#1a1838', label: '⚙' },
};

export function ArchNode({ data, selected }: NodeProps) {
  const d = data as ArchNodeData;
  const k = KIND[d.kind] ?? { stroke: '#22d3ee', bg: '#0a2a32', label: '◇' };
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
        className="h-10 w-10 rounded-md flex items-center justify-center text-lg font-semibold shrink-0"
        style={{ background: k.bg, color: k.stroke }}
        aria-hidden
      >
        {k.label}
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