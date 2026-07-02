import { create } from "zustand";
import type { Area, AreaZone } from "@/types/area";
import { createDefaultArea } from "@/types/area";

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
  updateAreaCroppedImageRaw: (id: string, image: string) => void;
  updateAreaCroppedImageProcessed: (id: string, image: string) => void;
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

  updateAreaCroppedImageRaw: (id, image) =>
    set((state) => ({
      areas: state.areas.map((a) =>
        a.id === id
          ? { ...a, croppedImageRaw: image, updatedAt: new Date().toISOString() }
          : a
      ),
    })),

  updateAreaCroppedImageProcessed: (id, image) =>
    set((state) => ({
      areas: state.areas.map((a) =>
        a.id === id
          ? {
              ...a,
              croppedImageProcessed: image,
              status: "extracted" as const,
              updatedAt: new Date().toISOString(),
            }
          : a
      ),
    })),

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

  clearAreas: () => set({ areas: [], activeAreaId: null, areaCounter: 0 }),

  initializeForNewDocument: (documentName) => {
    const firstArea = createDefaultArea("Area 1", documentName);
    set({
      areas: [firstArea],
      activeAreaId: firstArea.id,
      areaCounter: 1,
    });
  },
}));
