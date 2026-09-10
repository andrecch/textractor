import { create } from "zustand";
import type { DocumentFile } from "@/types/document";

interface DocumentState {
  document: DocumentFile | null;
  currentPage: number;
  zoom: number;
  rotationByPage: Record<number, number>;

  setDocument: (doc: DocumentFile) => void;
  setPage: (page: number) => void;
  setZoom: (zoom: number) => void;
  zoomIn: () => void;
  zoomOut: () => void;
  fitToScreen: () => void;
  getRotation: (page: number) => number;
  rotateCW: (page: number) => void;
  clearDocument: () => void;
}

const ZOOM_STEP = 0.25;
const ZOOM_MIN = 0.25;
const ZOOM_MAX = 5;

export const useDocumentStore = create<DocumentState>((set, get) => ({
  document: null,
  currentPage: 0,
  zoom: 1,
  rotationByPage: {},

  setDocument: (doc) =>
    set({ document: doc, currentPage: 0, zoom: 1, rotationByPage: {} }),

  setPage: (page) => set({ currentPage: page }),

  setZoom: (zoom) =>
    set({ zoom: Math.min(ZOOM_MAX, Math.max(ZOOM_MIN, zoom)) }),

  zoomIn: () =>
    set((state) => ({
      zoom: Math.min(ZOOM_MAX, state.zoom + ZOOM_STEP),
    })),

  zoomOut: () =>
    set((state) => ({
      zoom: Math.max(ZOOM_MIN, state.zoom - ZOOM_STEP),
    })),

  fitToScreen: () => set({ zoom: 1 }),

  getRotation: (page) => get().rotationByPage[page] ?? 0,

  rotateCW: (page) =>
    set((state) => ({
      rotationByPage: {
        ...state.rotationByPage,
        [page]: ((state.rotationByPage[page] ?? 0) + 90) % 360,
      },
    })),

  clearDocument: () =>
    set({ document: null, currentPage: 0, zoom: 1, rotationByPage: {} }),
}));
