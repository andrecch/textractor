import { create } from "zustand";

interface OCRState {
  isProcessing: boolean;
  setProcessing: (isProcessing: boolean) => void;
}

export const useOCRStore = create<OCRState>((set) => ({
  isProcessing: false,
  setProcessing: (isProcessing) => set({ isProcessing }),
}));
