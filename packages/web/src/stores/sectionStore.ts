import { create } from "zustand";
import type { Section, SectionZone } from "@/types/section";
import { createDefaultSection } from "@/types/section";

interface SectionState {
  sections: Section[];
  activeSectionId: string | null;
  sectionCounter: number;

  getActiveSection: () => Section | null;
  setActiveSection: (id: string) => void;
  addSection: (documentName: string) => void;
  removeSection: (id: string) => void;
  renameSection: (id: string, name: string) => void;
  updateSectionZone: (id: string, pageIndex: number, zone: SectionZone) => void;
  updateSectionCroppedImageRaw: (id: string, image: string) => void;
  updateSectionCroppedImageProcessed: (id: string, image: string) => void;
  updateSectionExtractedText: (id: string, text: string) => void;
  updateSectionStatus: (id: string, status: Section["status"], error?: string) => void;
  clearSections: () => void;
  initializeForNewDocument: (documentName: string) => void;
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

  addSection: (documentName) =>
    set((state) => {
      const newCounter = state.sectionCounter + 1;
      const newSection = createDefaultSection(`Seccion ${newCounter}`, documentName);
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

  updateSectionZone: (id, pageIndex, zone) =>
    set((state) => ({
      sections: state.sections.map((s) =>
        s.id === id
          ? {
              ...s,
              pageIndex,
              zone,
              status: "zone-defined" as const,
              updatedAt: new Date().toISOString(),
            }
          : s
      ),
    })),

  updateSectionCroppedImageRaw: (id, image) =>
    set((state) => ({
      sections: state.sections.map((s) =>
        s.id === id
          ? { ...s, croppedImageRaw: image, updatedAt: new Date().toISOString() }
          : s
      ),
    })),

  updateSectionCroppedImageProcessed: (id, image) =>
    set((state) => ({
      sections: state.sections.map((s) =>
        s.id === id
          ? {
              ...s,
              croppedImageProcessed: image,
              status: "extracted" as const,
              updatedAt: new Date().toISOString(),
            }
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

  initializeForNewDocument: (documentName) => {
    const firstSection = createDefaultSection("Seccion 1", documentName);
    set({
      sections: [firstSection],
      activeSectionId: firstSection.id,
      sectionCounter: 1,
    });
  },
}));
