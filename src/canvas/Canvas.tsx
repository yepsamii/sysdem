import { Background, Controls, MiniMap, ReactFlow, type EdgeTypes, type NodeTypes } from '@xyflow/react';
import { useMemo } from 'react';
import { ArchNode } from './ArchNode';
import { FlowEdge } from './FlowEdge';
import { defaultEdges, defaultNodes, defaultViewport } from './defaultDiagram';

const nodeTypes: NodeTypes = { arch: ArchNode };
const edgeTypes: EdgeTypes = { flow: FlowEdge };

export function Canvas() {
  const nodes = useMemo(() => defaultNodes, []);
  const edges = useMemo(() => defaultEdges, []);

  return (
    <ReactFlow
      nodes={nodes}
      edges={edges}
      nodeTypes={nodeTypes}
      edgeTypes={edgeTypes}
      defaultViewport={defaultViewport}
      minZoom={0.2}
      maxZoom={2}
      colorMode="dark"
      proOptions={{ hideAttribution: false }}
      fitView={false}
      panOnScroll
      selectionOnDrag
      panOnDrag={[1]}
      nodesDraggable
      nodesConnectable
      elementsSelectable
    >
      <Background
        variant="dots"
        gap={20}
        size={1}
        color="color-mix(in srgb, var(--color-border-strong) 60%, transparent)"
      />
      <Controls
        showInteractive={false}
        position="bottom-left"
        className="!bg-surface !border-border !shadow-panel"
        style={{ borderRadius: '0.5rem', overflow: 'hidden' }}
      />
      <MiniMap
        position="bottom-right"
        pannable
        zoomable
        nodeColor={(n) => {
          const kind = (n.data as { kind?: string } | undefined)?.kind;
          switch (kind) {
            case 'cdn':
            case 'webapp':
            case 'gateway':
            case 'api':      return '#22d3ee';
            case 'cache':    return '#f472b6';
            case 'database': return '#f59e0b';
            case 'queue':    return '#a78bfa';
            case 'worker':   return '#a78bfa';
            case 'client':   return '#94a3b8';
            default:         return '#22d3ee';
          }
        }}
        maskColor="rgba(11,14,20,0.7)"
        style={{
          background: 'var(--color-surface)',
          border: '1px solid var(--color-border)',
          borderRadius: '0.5rem',
        }}
      />
    </ReactFlow>
  );
}