import { create } from 'zustand';

interface UiStore {
  componentsOpen: boolean;
  setComponentsOpen: (open: boolean) => void;
  toggleComponents: () => void;
}

export const useUi = create<UiStore>((set, get) => ({
  componentsOpen: false,
  setComponentsOpen: (open) => set({ componentsOpen: open }),
  toggleComponents: () => set({ componentsOpen: !get().componentsOpen }),
}));
