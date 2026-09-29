import { create } from 'zustand';

type FlowMode = 'continuous' | 'causal' | 'scenario';

interface FlowStore {
  paused: boolean;
  mode: FlowMode;
  togglePaused: () => void;
  setMode: (m: FlowMode) => void;
}

export const useFlow = create<FlowStore>((set) => ({
  paused: false,
  mode: 'continuous',
  togglePaused: () => set((s) => ({ paused: !s.paused })),
  setMode: (m) => set({ mode: m }),
}));