import { create } from "zustand";
import type { Section, SectionRegion } from "@/types/section";
import { createDefaultSection } from "@/types/section";

interface SectionState {
  sections: Section[];
  activeSectionId: string | null;
  sectionCounter: number;

  getActiveSection: () => Section | null;
  setActiveSection: (id: string) => void;
  addSection: () => void;
  removeSection: (id: string) => void;
  renameSection: (id: string, name: string) => void;
  updateSectionRegion: (id: string, pageIndex: number, region: SectionRegion) => void;
  updateSectionCroppedImage: (id: string, image: string) => void;
  updateSectionExtractedText: (id: string, text: string) => void;
  updateSectionStatus: (id: string, status: Section["status"], error?: string) => void;
  clearSections: () => void;
  initializeForNewDocument: () => void;
}

export const useSectionStore = create<SectionState>((set, get) => ({
  sections: [],
  activeSectionId: null,
  sectionCounter: 0,

  getActiveSection: () => {
    const { sections, activeSectionId } = get();
    return sections.find((s) => s.id === activeSectionId) ?? null;
  },

  setActiveSection: (id) => set({ activeSectionId: id }),

  addSection: () =>
    set((state) => {
      const newCounter = state.sectionCounter + 1;
      const newSection = createDefaultSection(`Seccion ${newCounter}`);
      return {
        sections: [...state.sections, newSection],
        activeSectionId: newSection.id,
        sectionCounter: newCounter,
      };
    }),

  removeSection: (id) =>
    set((state) => {
      const newSections = state.sections.filter((s) => s.id !== id);
      let newActiveId = state.activeSectionId;
      if (state.activeSectionId === id) {
        newActiveId = newSections[0]?.id ?? null;
      }
      return {
        sections: newSections,
        activeSectionId: newActiveId,
      };
    }),

  renameSection: (id, name) =>
    set((state) => ({
      sections: state.sections.map((s) =>
        s.id === id ? { ...s, name, updatedAt: new Date().toISOString() } : s
      ),
    })),

  updateSectionRegion: (id, pageIndex, region) =>
    set((state) => ({
      sections: state.sections.map((s) =>
        s.id === id
          ? {
              ...s,
              pageIndex,
              region,
              status: "region-defined" as const,
              updatedAt: new Date().toISOString(),
            }
          : s
      ),
    })),

  updateSectionCroppedImage: (id, image) =>
    set((state) => ({
      sections: state.sections.map((s) =>
        s.id === id
          ? { ...s, croppedImage: image, updatedAt: new Date().toISOString() }
          : s
      ),
    })),

  updateSectionExtractedText: (id, text) =>
    set((state) => ({
      sections: state.sections.map((s) =>
        s.id === id
          ? {
              ...s,
              extractedText: text,
              status: "extracted" as const,
              updatedAt: new Date().toISOString(),
            }
          : s
      ),
    })),

  updateSectionStatus: (id, status, error) =>
    set((state) => ({
      sections: state.sections.map((s) =>
        s.id === id
          ? {
              ...s,
              status,
              errorMessage: error ?? null,
              updatedAt: new Date().toISOString(),
            }
          : s
      ),
    })),

  clearSections: () => set({ sections: [], activeSectionId: null, sectionCounter: 0 }),

  initializeForNewDocument: () => {
    const firstSection = createDefaultSection("Seccion 1");
    set({
      sections: [firstSection],
      activeSectionId: firstSection.id,
      sectionCounter: 1,
    });
  },
}));
