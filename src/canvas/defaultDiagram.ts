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
// Positions match the live default state captured in REVERSE_ENGINEERING.md §6.2.
export const defaultNodes: Node<ArchNodeData>[] = [
  // User node is partially clipped at top-left in the default view.
  { id: 'n_user',      type: 'arch', position: { x:  -40, y: 200 }, data: { kind: 'client',   label: 'User',     sublabel: 'Browser' }, width: 180, height: 64 },
  { id: 'n_cdn',       type: 'arch', position: { x:  320, y:  90 }, data: { kind: 'cdn',      label: 'CDN',      sublabel: 'Edge cache' }, width: 180, height: 64 },
  { id: 'n_webapp',    type: 'arch', position: { x:  320, y: 240 }, data: { kind: 'webapp',   label: 'Web App',  sublabel: 'React SPA' }, width: 180, height: 64 },
  { id: 'n_gateway',   type: 'arch', position: { x:  600, y: 165 }, data: { kind: 'gateway',  label: 'API Gateway', sublabel: 'TLS + routing' }, width: 180, height: 64 },
  { id: 'n_api',       type: 'arch', position: { x:  870, y: 165 }, data: { kind: 'api',      label: 'API',      sublabel: 'REST service' }, width: 180, height: 64 },
  { id: 'n_cache',     type: 'arch', position: { x: 1110, y:  60 }, data: { kind: 'cache',    label: 'Cache',    sublabel: 'Redis' }, width: 180, height: 64 },
  { id: 'n_db',        type: 'arch', position: { x: 1110, y: 180 }, data: { kind: 'database', label: 'Database', sublabel: 'Postgres' }, width: 180, height: 64 },
  { id: 'n_queue',     type: 'arch', position: { x: 1110, y: 300 }, data: { kind: 'queue',    label: 'Event Queue', sublabel: 'orders.created' }, width: 180, height: 64 },
  { id: 'n_worker',    type: 'arch', position: { x: 1370, y: 300 }, data: { kind: 'worker',   label: 'Worker',   sublabel: 'Fulfilment' }, width: 180, height: 64 },
];

// Default viewport from live capture in §10.1 (~translate(96, 261.8) scale(0.6))
export const defaultViewport = { x: 96, y: 180, zoom: 0.7 };

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