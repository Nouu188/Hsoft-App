import { create } from 'zustand';

interface UIState {
  isBottomSheetVisible: boolean;
  setBottomSheetVisible: (isVisible: boolean) => void;
}

export const useUIStore = create<UIState>((set) => ({
  isBottomSheetVisible: false,
  setBottomSheetVisible: (isVisible) => set({ isBottomSheetVisible: isVisible }),
}));