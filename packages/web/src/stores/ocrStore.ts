import { create } from "zustand";

interface OCRState {
  isProcessing: boolean;
  abortController: AbortController | null;
  setProcessing: (isProcessing: boolean) => void;
  setAbortController: (controller: AbortController | null) => void;
  cancelExtraction: () => void;
}

export const useOCRStore = create<OCRState>((set, get) => ({
  isProcessing: false,
  abortController: null,
  setProcessing: (isProcessing) => set({ isProcessing }),
  setAbortController: (controller) => set({ abortController: controller }),
  cancelExtraction: () => {
    const { abortController } = get();
    if (abortController) {
      abortController.abort();
    }
  },
}));
