import { BaseEdge, getStraightPath, type EdgeProps } from '@xyflow/react';
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

// Per-edge base duration in seconds (matches live default).
const BASE_DUR = 20;

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
  const speed = a.speed ?? 1;
  const token = a.tokenLabel;
  const enabled = a.enabled !== false;

  const [edgePath] = getStraightPath({
    sourceX, sourceY, targetX, targetY,
  });

  // Don't render any animation when paused or disabled.
  if (paused || !enabled) {
    return (
      <BaseEdge
        id={id}
        path={edgePath}
        markerEnd={markerEnd}
        style={{ stroke: 'var(--color-border-strong)', strokeWidth: 1.5 }}
      />
    );
  }

  const dur = BASE_DUR / speed;

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
    </>
  );
}