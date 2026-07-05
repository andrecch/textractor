import { create } from "zustand";
import type { Area, AreaZone } from "@/types/area";
import { createDefaultArea } from "@/types/area";
import {
  setAreaImage,
  clearAreaImages,
  clearAllImages,
} from "@/stores/imageStore";

interface AreaState {
  areas: Area[];
  activeAreaId: string | null;
  areaCounter: number;

  getActiveArea: () => Area | null;
  setActiveArea: (id: string) => void;
  addArea: (documentName: string) => void;
  removeArea: (id: string) => void;
  renameArea: (id: string, name: string) => void;
  updateAreaZone: (id: string, pageIndex: number, zone: AreaZone) => void;
  setAreaCroppedImageRaw: (id: string, image: string | null) => void;
  setAreaCroppedImageProcessed: (id: string, image: string | null) => void;
  updateAreaExtractedText: (id: string, text: string) => void;
  updateAreaStatus: (id: string, status: Area["status"], error?: string) => void;
  clearAreas: () => void;
  initializeForNewDocument: (documentName: string) => void;
}

export const useAreaStore = create<AreaState>((set, get) => ({
  areas: [],
  activeAreaId: null,
  areaCounter: 0,

  getActiveArea: () => {
    const { areas, activeAreaId } = get();
    return areas.find((a) => a.id === activeAreaId) ?? null;
  },

  setActiveArea: (id) => set({ activeAreaId: id }),

  addArea: (documentName) =>
    set((state) => {
      const newCounter = state.areaCounter + 1;
      const newArea = createDefaultArea(`Area ${newCounter}`, documentName);
      return {
        areas: [...state.areas, newArea],
        activeAreaId: newArea.id,
        areaCounter: newCounter,
      };
    }),

  removeArea: (id) =>
    set((state) => {
      const newAreas = state.areas.filter((a) => a.id !== id);
      let newActiveId = state.activeAreaId;
      if (state.activeAreaId === id) {
        newActiveId = newAreas[0]?.id ?? null;
      }
      clearAreaImages(id);
      return {
        areas: newAreas,
        activeAreaId: newActiveId,
      };
    }),

  renameArea: (id, name) =>
    set((state) => ({
      areas: state.areas.map((a) =>
        a.id === id ? { ...a, name, updatedAt: new Date().toISOString() } : a
      ),
    })),

  updateAreaZone: (id, pageIndex, zone) =>
    set((state) => ({
      areas: state.areas.map((a) =>
        a.id === id
          ? {
              ...a,
              pageIndex,
              zone,
              status: "zone-defined" as const,
              updatedAt: new Date().toISOString(),
            }
          : a
      ),
    })),

  setAreaCroppedImageRaw: (id, image) => {
    setAreaImage(id, "raw", image);
  },

  setAreaCroppedImageProcessed: (id, image) => {
    setAreaImage(id, "processed", image);
  },

  updateAreaExtractedText: (id, text) =>
    set((state) => ({
      areas: state.areas.map((a) =>
        a.id === id
          ? {
              ...a,
              extractedText: text,
              updatedAt: new Date().toISOString(),
            }
          : a
      ),
    })),

  updateAreaStatus: (id, status, error) =>
    set((state) => ({
      areas: state.areas.map((a) =>
        a.id === id
          ? {
              ...a,
              status,
              errorMessage: error ?? null,
              updatedAt: new Date().toISOString(),
            }
          : a
      ),
    })),

  clearAreas: () => {
    clearAllImages();
    set({ areas: [], activeAreaId: null, areaCounter: 0 });
  },

  initializeForNewDocument: (documentName) => {
    clearAllImages();
    const firstArea = createDefaultArea("Area 1", documentName);
    set({
      areas: [firstArea],
      activeAreaId: firstArea.id,
      areaCounter: 1,
    });
  },
}));
