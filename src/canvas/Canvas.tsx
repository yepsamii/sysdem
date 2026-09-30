import { Background, Controls, MiniMap, ReactFlow, type EdgeTypes, type NodeTypes } from '@xyflow/react';
import { useMemo } from 'react';
import { useTheme } from '../store/theme';
import { ArchNode } from './ArchNode';
import { FlowEdge } from './FlowEdge';
import { defaultEdges, defaultNodes, defaultViewport } from './defaultDiagram';

const nodeTypes: NodeTypes = { arch: ArchNode };
const edgeTypes: EdgeTypes = { flow: FlowEdge };

export function Canvas() {
  const nodes = useMemo(() => defaultNodes, []);
  const edges = useMemo(() => defaultEdges, []);
  const theme = useTheme((s) => s.theme);

  return (
    <ReactFlow
      nodes={nodes}
      edges={edges}
      nodeTypes={nodeTypes}
      edgeTypes={edgeTypes}
      defaultViewport={defaultViewport}
      minZoom={0.2}
      maxZoom={2}
      colorMode={theme}
      proOptions={{ hideAttribution: true }}
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
        showInteractive
        position="bottom-left"
        style={{ borderRadius: '0.5rem', overflow: 'hidden' }}
      />
      <MiniMap
        position="bottom-right"
        pannable
        zoomable
        nodeColor={(n) => {
          const kind = (n.data as { kind?: string } | undefined)?.kind;
          const hex = (() => {
            switch (kind) {
              case 'client':
              case 'cdn':      return '#38bdf8';
              case 'webapp':   return '#34d399';
              case 'gateway':  return '#818cf8';
              case 'api':      return '#22d3ee';
              case 'cache':    return '#f472b6';
              case 'database': return '#f59e0b';
              case 'queue':    return '#c084fc';
              case 'worker':   return '#a78bfa';
              default:         return '#22d3ee';
            }
          })();
          return `color-mix(in srgb, ${hex} 55%, var(--color-surface-2))`;
        }}
        nodeStrokeColor={() => 'transparent'}
        nodeBorderRadius={4}
        maskColor="transparent"
        style={{
          background: 'var(--color-surface)',
          border: '1px solid var(--color-border)',
          borderRadius: '0.75rem',
        }}
      />
    </ReactFlow>
  );
}