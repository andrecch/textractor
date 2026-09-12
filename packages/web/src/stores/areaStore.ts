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
  autoExtractPendingId: string | null;

  getActiveArea: () => Area | null;
  setActiveArea: (id: string) => void;
  addArea: (documentName: string) => void;
  removeArea: (id: string) => void;
  renameArea: (id: string, name: string) => void;
  updateAreaZone: (id: string, pageIndex: number, zone: AreaZone) => void;
  consumeAutoExtract: (id: string) => boolean;
  clearAreaZone: (id: string) => void;
  rotateZonesCW: (pageIndex: number, pageHeight: number) => void;
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
  autoExtractPendingId: null,

  getActiveArea: () => {
    const { areas, activeAreaId } = get();
    return areas.find((a) => a.id === activeAreaId) ?? null;
  },

  setActiveArea: (id) => set({ activeAreaId: id }),

  addArea: (documentName) =>
    set((state) => {
      const newCounter = state.areaCounter + 1;
      const newArea = createDefaultArea(`Área ${newCounter}`, documentName);
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
        autoExtractPendingId:
          state.autoExtractPendingId === id ? null : state.autoExtractPendingId,
      };
    }),

  renameArea: (id, name) =>
    set((state) => ({
      areas: state.areas.map((a) =>
        a.id === id ? { ...a, name, updatedAt: new Date().toISOString() } : a
      ),
    })),

  updateAreaZone: (id, pageIndex, zone) => {
    clearAreaImages(id);
    set((state) => ({
      autoExtractPendingId: id,
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
    }));
  },

  consumeAutoExtract: (id) => {
    if (get().autoExtractPendingId !== id) return false;
    set({ autoExtractPendingId: null });
    return true;
  },

  clearAreaZone: (id) => {
    clearAreaImages(id);
    set((state) => ({
      areas: state.areas.map((a) =>
        a.id === id
          ? {
              ...a,
              zone: null,
              status: "empty" as const,
              extractedText: null,
              errorMessage: null,
              updatedAt: new Date().toISOString(),
            }
          : a
      ),
    }));
  },

  rotateZonesCW: (pageIndex, pageHeight) =>
    set((state) => ({
      areas: state.areas.map((a) =>
        a.zone && a.pageIndex === pageIndex
          ? {
              ...a,
              zone: {
                x: pageHeight - a.zone.y - a.zone.height,
                y: a.zone.x,
                width: a.zone.height,
                height: a.zone.width,
              },
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
    set({
      areas: [],
      activeAreaId: null,
      areaCounter: 0,
      autoExtractPendingId: null,
    });
  },

  initializeForNewDocument: (documentName) => {
    clearAllImages();
    const firstArea = createDefaultArea("Área 1", documentName);
    set({
      areas: [firstArea],
      activeAreaId: firstArea.id,
      areaCounter: 1,
      autoExtractPendingId: null,
    });
  },
}));
