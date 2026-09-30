import { BaseEdge, EdgeLabelRenderer, getStraightPath, type EdgeProps } from '@xyflow/react';
import { useFlow } from '../store/flow';

interface AnimationSpec {
  color?: string;
  direction?: 'forward' | 'both';
  density?: number;
  speed?: number;
  style?: 'dots' | 'dash' | 'pulse';
  tokenLabel?: string;
  enabled?: boolean;
}

interface FlowEdgeData extends Record<string, unknown> {
  label?: string;
  animation?: AnimationSpec;
  arrow?: boolean;
}

const FALLBACK_COLOR = '#22d3ee';

// Reference uses a constant particle velocity of 20 px/s — duration is
// derived from the edge's polyline length so all particles travel at the
// same visual speed regardless of how long the edge is.
const PARTICLE_SPEED_PX_PER_S = 20;

export function FlowEdge(props: EdgeProps) {
  const {
    id, sourceX, sourceY, targetX, targetY,
    data, markerEnd,
  } = props;
  const paused = useFlow((s) => s.paused);
  const d = (data as FlowEdgeData | undefined) ?? {};
  const a = d.animation ?? {};
  const color = a.color ?? FALLBACK_COLOR;
  const direction = a.direction ?? 'forward';
  const density = Math.max(1, Math.min(4, a.density ?? 1));
  // `speed` is a user-facing multiplier: 1 = default, 2 = twice as fast.
  const speed = a.speed ?? 1;
  const token = a.tokenLabel;
  const enabled = a.enabled !== false;

  const [edgePath, labelX, labelY] = getStraightPath({
    sourceX, sourceY, targetX, targetY,
  });

  // Length of the polyline (source→target is a single straight segment
  // for getStraightPath, but the formula is generic for any future
  // polyline edges).
  const edgeLen = Math.hypot(targetX - sourceX, targetY - sourceY);
  // dur = length / (speed * PARTICLE_SPEED_PX_PER_S). speed multiplier is
  // already accounted for via "faster" = "smaller duration".
  const dur = edgeLen / (PARTICLE_SPEED_PX_PER_S * speed);

  const labelEl = d.label && (
    <EdgeLabelRenderer>
      <div
        className="nodrag nopan absolute px-1.5 py-0.5 rounded bg-surface border border-border text-xs text-fg pointer-events-auto"
        style={{ transform: `translate(-50%,-50%) translate(${labelX}px, ${labelY}px)` }}
        title="Drag to slide along the edge · double-click to centre"
      >
        {d.label}
      </div>
    </EdgeLabelRenderer>
  );

  // Don't render any animation when paused or disabled.
  if (paused || !enabled) {
    return (
      <>
        <BaseEdge
          id={id}
          path={edgePath}
          markerEnd={markerEnd}
          style={{ stroke: 'var(--color-border-strong)', strokeWidth: 1.5 }}
        />
        {labelEl}
      </>
    );
  }

  // Build particle set: density dots in 'forward', plus reverse if direction === 'both'.
  type Particle = { dir: 'forward' | 'reverse'; phase: number };
  const particles: Particle[] = [];
  for (let i = 0; i < density; i++) {
    particles.push({ dir: 'forward', phase: i / density });
    if (direction === 'both') {
      particles.push({ dir: 'reverse', phase: (i + 0.5) / density });
    }
  }

  return (
    <>
      <BaseEdge
        id={id}
        path={edgePath}
        markerEnd={markerEnd}
        style={{ stroke: 'var(--color-border-strong)', strokeWidth: 1.5 }}
      />
      <g pointerEvents="none">
        {particles.map((p, idx) => {
          const keyPoints = p.dir === 'forward' ? '0;1' : '1;0';
          const begin = `-${p.phase * dur}s`;
          return (
            <g key={`${id}-p-${idx}`}>
              <circle r="3.2" fill={color}>
                <animateMotion
                  dur={`${dur}s`}
                  begin={begin}
                  repeatCount="indefinite"
                  keyPoints={keyPoints}
                  keyTimes="0;1"
                  calcMode="linear"
                  path={edgePath}
                />
              </circle>
              {token && (
                <text
                  fontSize="9"
                  fill={color}
                  textAnchor="middle"
                  dy="-7"
                  fontFamily="var(--font-mono)"
                >
                  {token}
                  <animateMotion
                    dur={`${dur}s`}
                    begin={`-${(p.phase + 0.04) * dur}s`}
                    repeatCount="indefinite"
                    keyPoints={keyPoints}
                    keyTimes="0;1"
                    calcMode="linear"
                    path={edgePath}
                  />
                </text>
              )}
            </g>
          );
        })}
      </g>
      {labelEl}
    </>
  );
}