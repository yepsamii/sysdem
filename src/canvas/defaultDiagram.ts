import { type Edge, type Node } from '@xyflow/react';

export type NodeKind =
  | 'client' | 'cdn' | 'webapp' | 'gateway' | 'api' | 'cache'
  | 'database' | 'queue' | 'worker';

export interface ArchNodeData extends Record<string, unknown> {
  kind: NodeKind;
  label: string;
  sublabel: string;
}

// Default "System Architecture" fixture — mirrors the live first-run default.
// Positions captured from the reference's default state in MM-034: a clean
// grid with 300 px between columns and 3 distinct rows at y=60 (top),
// y=200 (middle), y=340 (bottom). Node size is uniform 180×64.
export const defaultNodes: Node<ArchNodeData>[] = [
  // User node sits at x=0 (left edge of the diagram), middle row.
  { id: 'n_user',      type: 'arch', position: { x:    0, y: 200 }, data: { kind: 'client',   label: 'User',     sublabel: 'Browser' }, width: 180, height: 64 },
  { id: 'n_cdn',       type: 'arch', position: { x:  300, y:  60 }, data: { kind: 'cdn',      label: 'CDN',      sublabel: 'Edge cache' }, width: 180, height: 64 },
  { id: 'n_webapp',    type: 'arch', position: { x:  300, y: 340 }, data: { kind: 'webapp',   label: 'Web App',  sublabel: 'React SPA' }, width: 180, height: 64 },
  { id: 'n_gateway',   type: 'arch', position: { x:  600, y: 200 }, data: { kind: 'gateway',  label: 'API Gateway', sublabel: 'TLS + routing' }, width: 180, height: 64 },
  { id: 'n_api',       type: 'arch', position: { x:  900, y: 200 }, data: { kind: 'api',      label: 'API',      sublabel: 'REST service' }, width: 180, height: 64 },
  { id: 'n_cache',     type: 'arch', position: { x: 1200, y:  60 }, data: { kind: 'cache',    label: 'Cache',    sublabel: 'Redis' }, width: 180, height: 64 },
  { id: 'n_db',        type: 'arch', position: { x: 1200, y: 200 }, data: { kind: 'database', label: 'Database', sublabel: 'Postgres' }, width: 180, height: 64 },
  { id: 'n_queue',     type: 'arch', position: { x: 1200, y: 340 }, data: { kind: 'queue',    label: 'Event Queue', sublabel: 'orders.created' }, width: 180, height: 64 },
  { id: 'n_worker',    type: 'arch', position: { x: 1500, y: 340 }, data: { kind: 'worker',   label: 'Worker',   sublabel: 'Fulfilment' }, width: 180, height: 64 },
];

// Default viewport from live capture in §10.1 — translate(120, 260.286) scale(0.714286).
export const defaultViewport = { x: 120, y: 260, zoom: 0.714286 };

export const defaultEdges: Edge[] = [
  {
    id: 'e_user_cdn',     source: 'n_user',    target: 'n_cdn',     sourceHandle: 'r', targetHandle: 'l',
    type: 'flow', data: { label: 'static assets', animation: { color: '#34d399', direction: 'forward', density: 2, speed: 1, style: 'dots', tokenLabel: 'asset', enabled: true }, arrow: true },
  },
  {
    id: 'e_user_webapp',  source: 'n_user',    target: 'n_webapp',  sourceHandle: 'r', targetHandle: 'l',
    type: 'flow', data: { label: 'app shell', animation: { color: '#22d3ee', direction: 'forward', density: 2, speed: 1, style: 'dots', tokenLabel: 'HTML', enabled: true }, arrow: true },
  },
  {
    id: 'e_cdn_webapp',   source: 'n_cdn',     target: 'n_webapp',  sourceHandle: 'b', targetHandle: 't',
    type: 'flow', data: { animation: { color: '#34d399', direction: 'forward', density: 1, speed: 1, style: 'dots', enabled: true }, arrow: false },
  },
  {
    id: 'e_webapp_gw',    source: 'n_webapp',  target: 'n_gateway', sourceHandle: 'r', targetHandle: 'l',
    type: 'flow', data: { label: 'request / response', animation: { color: '#22d3ee', direction: 'forward', density: 2, speed: 1, style: 'dots', tokenLabel: 'HTTPS', enabled: true }, arrow: true },
  },
  {
    id: 'e_gw_api',       source: 'n_gateway', target: 'n_api',     sourceHandle: 'r', targetHandle: 'l',
    type: 'flow', data: { label: 'route', animation: { color: '#22d3ee', direction: 'forward', density: 1, speed: 1, style: 'dots', tokenLabel: 'route', enabled: true }, arrow: true },
  },
  {
    id: 'e_api_cache',    source: 'n_api',     target: 'n_cache',   sourceHandle: 't', targetHandle: 'b',
    type: 'flow', data: { label: 'session lookup', animation: { color: '#f472b6', direction: 'forward', density: 1, speed: 1, style: 'dots', tokenLabel: 'GET', enabled: true }, arrow: true },
  },
  {
    id: 'e_api_db',       source: 'n_api',     target: 'n_db',      sourceHandle: 'r', targetHandle: 'l',
    type: 'flow', data: { animation: { color: '#f59e0b', direction: 'forward', density: 2, speed: 1, style: 'dots', tokenLabel: 'SQL', enabled: true }, arrow: true },
  },
  {
    id: 'e_api_queue',    source: 'n_api',     target: 'n_queue',   sourceHandle: 'b', targetHandle: 't',
    type: 'flow', data: { label: 'publish event', animation: { color: '#a78bfa', direction: 'forward', density: 1, speed: 1, style: 'dots', tokenLabel: 'event', enabled: true }, arrow: true },
  },
  {
    id: 'e_queue_worker', source: 'n_queue',   target: 'n_worker',  sourceHandle: 'r', targetHandle: 'l',
    type: 'flow', data: { label: 'consume', animation: { color: '#a78bfa', direction: 'forward', density: 1, speed: 1, style: 'dots', tokenLabel: 'msg', enabled: true }, arrow: true },
  },
];