# Extracto MVP Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a web app for intelligent zone extraction from PDFs/images with OCR via Kimi 2.6 Vision (NVIDIA Build), using a section-based architecture.

**Architecture:** Monorepo (npm workspaces) — React frontend (Vite + TS + Tailwind + shadcn) with section-based extraction model. Express backend proxies OCR calls to NVIDIA Build and manages SQLite history. Sections are the core abstraction: each section holds one zone, its crop, and OCR result, decoupled from viewer and OCR engine.

**Tech Stack:**
- Frontend: React 19, Vite 6, TypeScript 5, Tailwind CSS 4, shadcn/ui, Zustand, react-router-dom 7, react-i18next, pdfjs-dist
- Backend: Express 4, TypeScript 5, better-sqlite3, cors, dotenv
- OCR: Kimi 2.6 Vision (NVIDIA Build API)

**Execution Approach:** Subagent-Driven Development — dispatch fresh subagent per task, review between tasks, fast iteration.

---

## File Structure

```
textractor/
├── package.json                          # Root workspaces config
├── packages/
│   ├── web/
│   │   ├── index.html
│   │   ├── package.json
│   │   ├── vite.config.ts
│   │   ├── tsconfig.json
│   │   ├── components.json               # shadcn config
│   │   └── src/
│   │       ├── main.tsx
│   │       ├── App.tsx
│   │       ├── index.css                  # Tailwind v4 entry
│   │       ├── app/
│   │       │   └── routes.tsx
│   │       ├── types/
│   │       │   ├── document.ts
│   │       │   ├── section.ts             # Core section type
│   │       │   ├── ocr.ts
│   │       │   └── settings.ts
│   │       ├── i18n/
│   │       │   ├── index.ts
│   │       │   ├── es.json
│   │       │   └── en.json
│   │       ├── lib/
│   │       │   └── utils.ts
│   │       ├── stores/
│   │       │   ├── documentStore.ts
│   │       │   ├── sectionStore.ts        # Section management
│   │       │   ├── ocrStore.ts
│   │       │   └── settingsStore.ts
│   │       ├── services/
│   │       │   ├── api.ts
│   │       │   ├── imageProcessing.ts
│   │       │   └── ocr/
│   │       │       ├── OCRProvider.ts
│   │       │       ├── OCRManager.ts
│   │       │       └── providers/
│   │       │           └── NvidiaBuildProvider.ts
│   │       ├── hooks/
│   │       │   ├── useDocument.ts
│   │       │   ├── useSection.ts
│   │       │   └── useOCR.ts
│   │       ├── components/
│   │       │   ├── ui/                    # shadcn components
│   │       │   ├── layout/
│   │       │   │   ├── AppLayout.tsx
│   │       │   │   └── Header.tsx
│   │       │   ├── upload/
│   │       │   │   └── FileUpload.tsx
│   │       │   ├── document/
│   │       │   │   ├── DocumentViewer.tsx
│   │       │   │   ├── PDFPageRenderer.tsx
│   │       │   │   ├── ImageRenderer.tsx
│   │       │   │   ├── PageNavigation.tsx
│   │       │   │   └── ZoomControls.tsx
│   │       │   ├── section/
│   │       │   │   ├── SectionPanel.tsx
│   │       │   │   ├── SectionItem.tsx
│   │       │   │   └── SectionOverlay.tsx
│   │       │   ├── ocr/
│   │       │   │   ├── OCRResultPanel.tsx
│   │       │   │   └── OCRResultItem.tsx
│   │       │   ├── history/
│   │       │   │   └── HistoryPanel.tsx
│   │       │   └── settings/
│   │       │       └── SettingsPanel.tsx
│   │       └── pages/
│   │           ├── ViewerPage.tsx
│   │           ├── HistoryPage.tsx
│   │           └── SettingsPage.tsx
│   └── api/
│       ├── package.json
│       ├── tsconfig.json
│       └── src/
│           ├── index.ts
│           ├── routes/
│           │   ├── ocr.ts
│           │   └── history.ts
│           ├── services/
│           │   └── nvidiaBuild.ts
│           ├── db/
│           │   ├── database.ts
│           │   └── migrations/
│           │       └── 001_create_extractions.sql
│           └── types/
│               └── index.ts
```

---

## Task 1: Monorepo Scaffolding

**Files:**
- Modify: `package.json`
- Create: `packages/web/package.json` (placeholder)
- Create: `packages/api/package.json` (placeholder)

- [ ] **Step 1: Rewrite root package.json with workspaces**

```json
{
  "name": "extracto",
  "private": true,
  "version": "1.0.0",
  "workspaces": ["packages/*"],
  "scripts": {
    "dev": "concurrently -n web,api -c blue,green \"npm run dev:web\" \"npm run dev:api\"",
    "dev:web": "npm run dev --workspace=packages/web",
    "dev:api": "npm run dev --workspace=packages/api",
    "build": "npm run build --workspace=packages/api && npm run build --workspace=packages/web",
    "build:web": "npm run build --workspace=packages/web",
    "build:api": "npm run build --workspace=packages/api",
    "lint": "npm run lint --workspace=packages/web && npm run lint --workspace=packages/api"
  },
  "devDependencies": {
    "concurrently": "^9.0.0",
    "typescript": "^5.7.0"
  }
}
```

- [ ] **Step 2: Create directory structure**

Run: `mkdir -p packages/web/src packages/api/src`

- [ ] **Step 3: Install root dependencies**

Run: `npm install`

- [ ] **Step 4: Commit**

```bash
git init
git add .
git commit -m "chore: initialize monorepo with npm workspaces"
```

---

## Task 2: Frontend Foundation (Vite + React + TS + Tailwind + shadcn)

**Files:**
- Create: `packages/web/package.json`
- Create: `packages/web/vite.config.ts`
- Create: `packages/web/tsconfig.json`
- Create: `packages/web/index.html`
- Create: `packages/web/src/main.tsx`
- Create: `packages/web/src/App.tsx`
- Create: `packages/web/src/index.css`
- Create: `packages/web/src/lib/utils.ts`

- [ ] **Step 1: Create web package.json**

```json
{
  "name": "@extracto/web",
  "private": true,
  "version": "1.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "tsc -b && vite build",
    "preview": "vite preview",
    "lint": "eslint ."
  },
  "dependencies": {
    "react": "^19.0.0",
    "react-dom": "^19.0.0",
    "react-router-dom": "^7.0.0",
    "zustand": "^5.0.0",
    "react-i18next": "^15.0.0",
    "i18next": "^24.0.0",
    "pdfjs-dist": "^4.0.0",
    "class-variance-authority": "^0.7.0",
    "clsx": "^2.1.0",
    "tailwind-merge": "^3.0.0",
    "lucide-react": "^0.400.0"
  },
  "devDependencies": {
    "@types/react": "^19.0.0",
    "@types/react-dom": "^19.0.0",
    "@vitejs/plugin-react": "^4.3.0",
    "vite": "^6.0.0",
    "tailwindcss": "^4.0.0",
    "@tailwindcss/vite": "^4.0.0",
    "typescript": "^5.7.0"
  }
}
```

- [ ] **Step 2: Create vite.config.ts**

```typescript
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import path from "path";

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    port: 5173,
    proxy: {
      "/api": {
        target: "http://localhost:3001",
        changeOrigin: true,
      },
    },
  },
});
```

- [ ] **Step 3: Create tsconfig.json**

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "useDefineForClassFields": true,
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "skipLibCheck": true,
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "isolatedModules": true,
    "moduleDetection": "force",
    "noEmit": true,
    "jsx": "react-jsx",
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true,
    "noUncheckedIndexedAccess": true,
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"]
    }
  },
  "include": ["src"]
}
```

- [ ] **Step 4: Create index.html**

```html
<!doctype html>
<html lang="es">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Extracto</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
```

- [ ] **Step 5: Create index.css (Tailwind v4)**

```css
@import "tailwindcss";

@theme {
  --color-background: oklch(1 0 0);
  --color-foreground: oklch(0.145 0 0);
  --color-primary: oklch(0.205 0 0);
  --color-primary-foreground: oklch(0.985 0 0);
  --color-muted: oklch(0.97 0 0);
  --color-muted-foreground: oklch(0.556 0 0);
  --color-accent: oklch(0.97 0 0);
  --color-accent-foreground: oklch(0.205 0 0);
  --color-destructive: oklch(0.577 0.245 27.325);
  --color-border: oklch(0.922 0 0);
  --color-ring: oklch(0.708 0 0);
  --radius-sm: 0.25rem;
  --radius-md: 0.375rem;
  --radius-lg: 0.5rem;
  --radius-xl: 0.75rem;
}

@layer base {
  * {
    @apply border-border;
  }
  body {
    @apply bg-background text-foreground;
    font-family: system-ui, -apple-system, sans-serif;
  }
}
```

- [ ] **Step 6: Create lib/utils.ts**

```typescript
import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
```

- [ ] **Step 7: Create main.tsx and App.tsx (minimal)**

```tsx
// main.tsx
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>
);
```

```tsx
// App.tsx
function App() {
  return (
    <div className="min-h-screen bg-background">
      <h1 className="text-2xl font-bold p-8">Extracto</h1>
    </div>
  );
}

export default App;
```

- [ ] **Step 8: Install dependencies**

Run: `npm install`

- [ ] **Step 9: Initialize shadcn/ui**

Run: `npx shadcn@latest init --workspace packages/web`

- [ ] **Step 10: Add core shadcn components**

Run: `npx shadcn@latest add button input label card dialog dropdown-menu separator sheet tabs textarea toast tooltip --workspace packages/web`

- [ ] **Step 11: Verify dev server starts**

Run: `npm run dev:web`
Expected: Vite dev server running at http://localhost:5173

- [ ] **Step 12: Commit**

```bash
git add .
git commit -m "feat: scaffold frontend with React, Vite, Tailwind, shadcn"
```

---

## Task 3: Backend Foundation (Express + TS + SQLite)

**Files:**
- Create: `packages/api/package.json`
- Create: `packages/api/tsconfig.json`
- Create: `packages/api/src/index.ts`
- Create: `packages/api/src/db/database.ts`
- Create: `packages/api/src/db/migrations/001_create_extractions.sql`
- Create: `packages/api/.env.example`

- [ ] **Step 1: Create api package.json**

```json
{
  "name": "@extracto/api",
  "private": true,
  "version": "1.0.0",
  "type": "module",
  "scripts": {
    "dev": "tsx watch src/index.ts",
    "build": "tsc",
    "start": "node dist/index.js",
    "lint": "eslint ."
  },
  "dependencies": {
    "express": "^4.21.0",
    "cors": "^2.8.5",
    "better-sqlite3": "^11.0.0",
    "dotenv": "^16.4.0"
  },
  "devDependencies": {
    "@types/express": "^5.0.0",
    "@types/cors": "^2.8.17",
    "@types/better-sqlite3": "^7.6.0",
    "tsx": "^4.19.0",
    "typescript": "^5.7.0"
  }
}
```

- [ ] **Step 2: Create tsconfig.json**

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "ESNext",
    "moduleResolution": "bundler",
    "lib": ["ES2020"],
    "outDir": "./dist",
    "rootDir": "./src",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true,
    "declaration": true,
    "declarationMap": true,
    "sourceMap": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true
  },
  "include": ["src"],
  "exclude": ["node_modules", "dist"]
}
```

- [ ] **Step 3: Create database migration SQL**

```sql
-- packages/api/src/db/migrations/001_create_extractions.sql
CREATE TABLE IF NOT EXISTS extractions (
  id TEXT PRIMARY KEY,
  document_name TEXT NOT NULL,
  section_name TEXT NOT NULL,
  page_index INTEGER NOT NULL,
  zone_x REAL NOT NULL,
  zone_y REAL NOT NULL,
  zone_width REAL NOT NULL,
  zone_height REAL NOT NULL,
  extracted_text TEXT NOT NULL,
  provider TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_extractions_created_at ON extractions(created_at DESC);
```

- [ ] **Step 4: Create database.ts**

```typescript
// packages/api/src/db/database.ts
import Database from "better-sqlite3";
import { readFileSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));

let db: Database.Database;

export function getDatabase(): Database.Database {
  if (!db) {
    const dbPath = join(__dirname, "../../data/extracto.db");
    db = new Database(dbPath);
    db.pragma("journal_mode = WAL");
    db.pragma("foreign_keys = ON");
  }
  return db;
}

export function runMigrations(): void {
  const database = getDatabase();
  const migration = readFileSync(
    join(__dirname, "migrations/001_create_extractions.sql"),
    "utf-8"
  );
  database.exec(migration);
}
```

- [ ] **Step 5: Create Express server entry point**

```typescript
// packages/api/src/index.ts
import express from "express";
import cors from "cors";
import { runMigrations } from "./db/database.js";

const app = express();
const PORT = process.env.PORT ?? 3001;

app.use(cors());
app.use(express.json({ limit: "50mb" }));

app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

runMigrations();

app.listen(PORT, () => {
  console.log(`[extracto-api] running on http://localhost:${PORT}`);
});

export default app;
```

- [ ] **Step 6: Create .env.example**

```
PORT=3001
```

- [ ] **Step 7: Create data directory**

Run: `mkdir -p packages/api/data`

- [ ] **Step 8: Install and verify**

Run: `npm install`
Run: `npm run dev:api`
Expected: `[extracto-api] running on http://localhost:3001`

- [ ] **Step 9: Commit**

```bash
git add .
git commit -m "feat: scaffold backend with Express, TypeScript, SQLite"
```

---

## Task 4: Core Types and Interfaces

**Files:**
- Create: `packages/web/src/types/document.ts`
- Create: `packages/web/src/types/section.ts`
- Create: `packages/web/src/types/ocr.ts`
- Create: `packages/web/src/types/settings.ts`
- Create: `packages/api/src/types/index.ts`

- [ ] **Step 1: Create document types**

```typescript
// packages/web/src/types/document.ts
export type DocumentType = "pdf" | "image";

export interface DocumentFile {
  id: string;
  name: string;
  type: DocumentType;
  file: File;
  url: string;
  pageCount: number;
}
```

- [ ] **Step 2: Create section types (CORE)**

```typescript
// packages/web/src/types/section.ts
export interface SectionZone {
  x: number;
  y: number;
  width: number;
  height: number;
}

export type SectionStatus = "empty" | "zone-defined" | "processing" | "extracted" | "error";

export interface Section {
  id: string;
  name: string;
  pageIndex: number;
  zone: SectionZone | null;
  croppedImage: string | null;
  extractedText: string | null;
  status: SectionStatus;
  errorMessage: string | null;
  createdAt: string;
  updatedAt: string;
}

export function createDefaultSection(name: string): Section {
  const now = new Date().toISOString();
  return {
    id: crypto.randomUUID(),
    name,
    pageIndex: 0,
    zone: null,
    croppedImage: null,
    extractedText: null,
    status: "empty",
    errorMessage: null,
    createdAt: now,
    updatedAt: now,
  };
}
```

- [ ] **Step 3: Create OCR types**

```typescript
// packages/web/src/types/ocr.ts
export interface OCRProvider {
  readonly name: string;
  extractText(imageBase64: string, apiKey: string): Promise<string>;
  validateConnection(apiKey: string): Promise<boolean>;
}

export interface OCROptions {
  apiKey: string;
  preprocessingEnabled: boolean;
}

export interface ExtractionRecord {
  id: string;
  documentName: string;
  sectionName: string;
  pageIndex: number;
  zone: { x: number; y: number; width: number; height: number };
  extractedText: string;
  provider: string;
  createdAt: string;
}
```

- [ ] **Step 4: Create settings types**

```typescript
// packages/web/src/types/settings.ts
export interface AppSettings {
  ocrEnabled: boolean;
  preprocessingEnabled: boolean;
  apiKey: string;
  language: "es" | "en";
}

export const DEFAULT_SETTINGS: AppSettings = {
  ocrEnabled: true,
  preprocessingEnabled: true,
  apiKey: "",
  language: "es",
};
```

- [ ] **Step 5: Create backend types**

```typescript
// packages/api/src/types/index.ts
export interface OCRRequest {
  imageBase64: string;
  apiKey: string;
}

export interface OCRResponse {
  text: string;
  provider: string;
}

export interface ValidationResult {
  valid: boolean;
  error?: string;
}

export interface ExtractionRow {
  id: string;
  document_name: string;
  section_name: string;
  page_index: number;
  zone_x: number;
  zone_y: number;
  zone_width: number;
  zone_height: number;
  extracted_text: string;
  provider: string;
  created_at: string;
}
```

- [ ] **Step 6: Commit**

```bash
git add .
git commit -m "feat: define core types with Section as central abstraction"
```

---

## Task 5: State Management (Zustand Stores)

**Files:**
- Create: `packages/web/src/stores/documentStore.ts`
- Create: `packages/web/src/stores/sectionStore.ts`
- Create: `packages/web/src/stores/ocrStore.ts`
- Create: `packages/web/src/stores/settingsStore.ts`

- [ ] **Step 1: Create documentStore**

```typescript
// packages/web/src/stores/documentStore.ts
import { create } from "zustand";
import type { DocumentFile } from "@/types/document";

interface DocumentState {
  document: DocumentFile | null;
  currentPage: number;
  zoom: number;

  setDocument: (doc: DocumentFile) => void;
  setPage: (page: number) => void;
  setZoom: (zoom: number) => void;
  zoomIn: () => void;
  zoomOut: () => void;
  fitToScreen: () => void;
  clearDocument: () => void;
}

const ZOOM_STEP = 0.25;
const ZOOM_MIN = 0.25;
const ZOOM_MAX = 5;

export const useDocumentStore = create<DocumentState>((set) => ({
  document: null,
  currentPage: 0,
  zoom: 1,

  setDocument: (doc) => set({ document: doc, currentPage: 0, zoom: 1 }),

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

  clearDocument: () =>
    set({ document: null, currentPage: 0, zoom: 1 }),
}));
```

- [ ] **Step 2: Create sectionStore (CORE)**

```typescript
// packages/web/src/stores/sectionStore.ts
import { create } from "zustand";
import type { Section, SectionZone } from "@/types/section";
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
  updateSectionZone: (id: string, pageIndex: number, zone: SectionZone) => void;
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
      const newSection = createDefaultSection(`Sección ${newCounter}`);
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
    const firstSection = createDefaultSection("Sección 1");
    set({
      sections: [firstSection],
      activeSectionId: firstSection.id,
      sectionCounter: 1,
    });
  },
}));
```

- [ ] **Step 3: Create settingsStore**

```typescript
// packages/web/src/stores/settingsStore.ts
import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { AppSettings } from "@/types/settings";
import { DEFAULT_SETTINGS } from "@/types/settings";

interface SettingsState {
  settings: AppSettings;
  updateSettings: (partial: Partial<AppSettings>) => void;
  resetSettings: () => void;
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      settings: DEFAULT_SETTINGS,

      updateSettings: (partial) =>
        set((state) => ({
          settings: { ...state.settings, ...partial },
        })),

      resetSettings: () => set({ settings: DEFAULT_SETTINGS }),
    }),
    {
      name: "extracto-settings",
    }
  )
);
```

- [ ] **Step 4: Create ocrStore (simplified - results now live in sections)**

```typescript
// packages/web/src/stores/ocrStore.ts
import { create } from "zustand";

interface OCRState {
  isProcessing: boolean;
  setProcessing: (isProcessing: boolean) => void;
}

export const useOCRStore = create<OCRState>((set) => ({
  isProcessing: false,
  setProcessing: (isProcessing) => set({ isProcessing }),
}));
```

- [ ] **Step 5: Commit**

```bash
git add .
git commit -m "feat: add Zustand stores with section-based architecture"
```

---

## Task 6: i18n Setup

**Files:**
- Create: `packages/web/src/i18n/index.ts`
- Create: `packages/web/src/i18n/es.json`
- Create: `packages/web/src/i18n/en.json`

- [ ] **Step 1: Create Spanish translations**

```json
{
  "app": {
    "title": "Extracto",
    "subtitle": "Extracción inteligente de zonas"
  },
  "nav": {
    "viewer": "Visor",
    "history": "Historial",
    "settings": "Configuración"
  },
  "upload": {
    "title": "Abrir documento",
    "dropzone": "Arrastra un archivo PDF o imagen aquí",
    "or": "o",
    "browse": "Seleccionar archivo",
    "accepted": "PDF, PNG, JPG, WEBP"
  },
  "viewer": {
    "page": "Página",
    "of": "de",
    "zoomIn": "Acercar",
    "zoomOut": "Alejar",
    "fitToScreen": "Ajustar",
    "noDocument": "No hay documento abierto"
  },
  "section": {
    "title": "Secciones",
    "empty": "No hay secciones",
    "add": "Agregar sección",
    "delete": "Eliminar",
    "rename": "Renombrar",
    "defaultName": "Sección",
    "status": {
      "empty": "Sin zona",
      "zonedefined": "Zona definida",
      "processing": "Procesando...",
      "extracted": "Extraído",
      "error": "Error"
    },
    "extract": "Extraer texto",
    "extractAll": "Extraer todas"
  },
  "ocr": {
    "title": "Resultados OCR",
    "empty": "Selecciona una zona y extrae texto",
    "processing": "Procesando...",
    "copy": "Copiar",
    "copied": "Copiado",
    "exportTxt": "Exportar .txt",
    "error": "Error en el reconocimiento",
    "disabled": "OCR desactivado"
  },
  "settings": {
    "title": "Configuración",
    "ocrEnabled": "Activar OCR",
    "preprocessing": "Preprocesamiento de imagen",
    "apiKey": "API Key de NVIDIA Build",
    "apiKeyPlaceholder": "Introduce tu API Key",
    "validate": "Validar conexión",
    "valid": "Conexión válida",
    "invalid": "Conexión inválida",
    "language": "Idioma",
    "save": "Guardar"
  },
  "history": {
    "title": "Historial de extracciones",
    "empty": "No hay extracciones previas",
    "document": "Documento",
    "section": "Sección",
    "page": "Página",
    "date": "Fecha",
    "provider": "Proveedor",
    "view": "Ver texto",
    "clear": "Limpiar historial"
  }
}
```

- [ ] **Step 2: Create English translations**

```json
{
  "app": {
    "title": "Extracto",
    "subtitle": "Intelligent zone extraction"
  },
  "nav": {
    "viewer": "Viewer",
    "history": "History",
    "settings": "Settings"
  },
  "upload": {
    "title": "Open document",
    "dropzone": "Drop a PDF or image file here",
    "or": "or",
    "browse": "Browse files",
    "accepted": "PDF, PNG, JPG, WEBP"
  },
  "viewer": {
    "page": "Page",
    "of": "of",
    "zoomIn": "Zoom in",
    "zoomOut": "Zoom out",
    "fitToScreen": "Fit to screen",
    "noDocument": "No document open"
  },
  "section": {
    "title": "Sections",
    "empty": "No sections",
    "add": "Add section",
    "delete": "Delete",
    "rename": "Rename",
    "defaultName": "Section",
    "status": {
      "empty": "No zone",
      "zonedefined": "Zone defined",
      "processing": "Processing...",
      "extracted": "Extracted",
      "error": "Error"
    },
    "extract": "Extract text",
    "extractAll": "Extract all"
  },
  "ocr": {
    "title": "OCR Results",
    "empty": "Select a zone and extract text",
    "processing": "Processing...",
    "copy": "Copy",
    "copied": "Copied",
    "exportTxt": "Export .txt",
    "error": "Recognition error",
    "disabled": "OCR disabled"
  },
  "settings": {
    "title": "Settings",
    "ocrEnabled": "Enable OCR",
    "preprocessing": "Image preprocessing",
    "apiKey": "NVIDIA Build API Key",
    "apiKeyPlaceholder": "Enter your API Key",
    "validate": "Validate connection",
    "valid": "Connection valid",
    "invalid": "Connection invalid",
    "language": "Language",
    "save": "Save"
  },
  "history": {
    "title": "Extraction history",
    "empty": "No previous extractions",
    "document": "Document",
    "section": "Section",
    "page": "Page",
    "date": "Date",
    "provider": "Provider",
    "view": "View text",
    "clear": "Clear history"
  }
}
```

- [ ] **Step 3: Create i18n configuration**

```typescript
// packages/web/src/i18n/index.ts
import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import es from "./es.json";
import en from "./en.json";

i18n.use(initReactI18next).init({
  resources: {
    es: { translation: es },
    en: { translation: en },
  },
  lng: "es",
  fallbackLng: "es",
  interpolation: {
    escapeValue: false,
  },
});

export default i18n;
```

- [ ] **Step 4: Import i18n in main.tsx**

Add to the top of `packages/web/src/main.tsx`:
```typescript
import "./i18n";
```

- [ ] **Step 5: Commit**

```bash
git add .
git commit -m "feat: add i18n with Spanish and English translations"
```

---

## Task 7: File Upload Component

**Files:**
- Create: `packages/web/src/components/upload/FileUpload.tsx`
- Create: `packages/web/src/hooks/useDocument.ts`

- [ ] **Step 1: Create useDocument hook**

```typescript
// packages/web/src/hooks/useDocument.ts
import { useCallback } from "react";
import { useDocumentStore } from "@/stores/documentStore";
import { useSectionStore } from "@/stores/sectionStore";
import type { DocumentFile } from "@/types/document";
import * as pdfjsLib from "pdfjs-dist";

pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
  "pdfjs-dist/build/pdf.worker.mjs",
  import.meta.url
).toString();

const ACCEPTED_TYPES = [
  "application/pdf",
  "image/png",
  "image/jpeg",
  "image/webp",
];

const IMAGE_TYPES = ["image/png", "image/jpeg", "image/webp"];

export function useDocument() {
  const { setDocument, clearDocument: clearDoc } = useDocumentStore();
  const { initializeForNewDocument } = useSectionStore();

  const loadDocument = useCallback(
    async (file: File) => {
      if (!ACCEPTED_TYPES.includes(file.type)) {
        throw new Error(`Unsupported file type: ${file.type}`);
      }

      const url = URL.createObjectURL(file);
      const isImage = IMAGE_TYPES.includes(file.type);

      let pageCount = 1;
      if (file.type === "application/pdf") {
        const pdf = await pdfjsLib.getDocument(url).promise;
        pageCount = pdf.numPages;
        pdf.destroy();
      }

      const doc: DocumentFile = {
        id: crypto.randomUUID(),
        name: file.name,
        type: isImage ? "image" : "pdf",
        file,
        url,
        pageCount,
      };

      setDocument(doc);
      initializeForNewDocument();
    },
    [setDocument, initializeForNewDocument]
  );

  const clearDocument = useCallback(() => {
    clearDoc();
    useSectionStore.getState().clearSections();
  }, [clearDoc]);

  return { loadDocument, clearDocument };
}
```

- [ ] **Step 2: Create FileUpload component**

```tsx
// packages/web/src/components/upload/FileUpload.tsx
import { useCallback, useState, useRef } from "react";
import { useTranslation } from "react-i18next";
import { Upload } from "lucide-react";
import { cn } from "@/lib/utils";
import { useDocument } from "@/hooks/useDocument";

export function FileUpload() {
  const { t } = useTranslation();
  const { loadDocument } = useDocument();
  const [isDragOver, setIsDragOver] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = useCallback(
    async (file: File) => {
      try {
        await loadDocument(file);
      } catch {
        alert("Unsupported file type. Please use PDF, PNG, JPG, or WEBP.");
      }
    },
    [loadDocument]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragOver(false);
      const file = e.dataTransfer.files[0];
      if (file) handleFile(file);
    },
    [handleFile]
  );

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback(() => {
    setIsDragOver(false);
  }, []);

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) handleFile(file);
      e.target.value = "";
    },
    [handleFile]
  );

  return (
    <div
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onClick={() => inputRef.current?.click()}
      className={cn(
        "flex flex-col items-center justify-center gap-4 rounded-lg border-2 border-dashed p-12 cursor-pointer transition-colors",
        isDragOver
          ? "border-primary bg-primary/5"
          : "border-border hover:border-primary/50"
      )}
    >
      <Upload className="h-12 w-12 text-muted-foreground" />
      <div className="text-center">
        <p className="text-lg font-medium">{t("upload.dropzone")}</p>
        <p className="text-sm text-muted-foreground mt-1">
          {t("upload.or")}{" "}
          <span className="text-primary underline">{t("upload.browse")}</span>
        </p>
        <p className="text-xs text-muted-foreground mt-2">
          {t("upload.accepted")}
        </p>
      </div>
      <input
        ref={inputRef}
        type="file"
        accept=".pdf,.png,.jpg,.jpeg,.webp"
        onChange={handleInputChange}
        className="hidden"
      />
    </div>
  );
}
```

- [ ] **Step 3: Commit**

```bash
git add .
git commit -m "feat: add file upload with drag & drop and section initialization"
```

---

## Task 8: Document Viewer (PDF + Images + Navigation + Zoom)

**Files:**
- Create: `packages/web/src/components/document/DocumentViewer.tsx`
- Create: `packages/web/src/components/document/PDFPageRenderer.tsx`
- Create: `packages/web/src/components/document/ImageRenderer.tsx`
- Create: `packages/web/src/components/document/PageNavigation.tsx`
- Create: `packages/web/src/components/document/ZoomControls.tsx`
- Create: `packages/web/src/components/section/SectionOverlay.tsx` (placeholder)

- [ ] **Step 1: Create PDFPageRenderer**

```tsx
// packages/web/src/components/document/PDFPageRenderer.tsx
import { useEffect, useRef, useCallback } from "react";
import * as pdfjsLib from "pdfjs-dist";

interface PDFPageRendererProps {
  url: string;
  pageIndex: number;
  zoom: number;
  onPageSizeChange: (width: number, height: number) => void;
}

export function PDFPageRenderer({
  url,
  pageIndex,
  zoom,
  onPageSizeChange,
}: PDFPageRendererProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const pdfDocRef = useRef<pdfjsLib.PDFDocumentProxy | null>(null);

  const renderPage = useCallback(async () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    try {
      if (!pdfDocRef.current) {
        pdfDocRef.current = await pdfjsLib.getDocument(url).promise;
      }

      const pdfDoc = pdfDocRef.current;
      const page = await pdfDoc.getPage(pageIndex + 1);
      const viewport = page.getViewport({ scale: zoom * 2 });

      const context = canvas.getContext("2d");
      if (!context) return;

      canvas.width = viewport.width;
      canvas.height = viewport.height;

      onPageSizeChange(viewport.width, viewport.height);

      await page.render({
        canvasContext: context,
        viewport,
      }).promise;
    } catch (err) {
      console.error("Error rendering PDF page:", err);
    }
  }, [url, pageIndex, zoom, onPageSizeChange]);

  useEffect(() => {
    renderPage();
  }, [renderPage]);

  useEffect(() => {
    return () => {
      pdfDocRef.current?.destroy();
      pdfDocRef.current = null;
    };
  }, [url]);

  return (
    <canvas
      ref={canvasRef}
      className="max-w-none shadow-lg"
    />
  );
}
```

- [ ] **Step 2: Create ImageRenderer**

```tsx
// packages/web/src/components/document/ImageRenderer.tsx
import { useEffect, useRef, useCallback } from "react";

interface ImageRendererProps {
  url: string;
  zoom: number;
  onPageSizeChange: (width: number, height: number) => void;
}

export function ImageRenderer({
  url,
  zoom,
  onPageSizeChange,
}: ImageRendererProps) {
  const imgRef = useRef<HTMLImageElement>(null);

  const handleLoad = useCallback(() => {
    const img = imgRef.current;
    if (!img) return;
    onPageSizeChange(img.naturalWidth * zoom, img.naturalHeight * zoom);
  }, [zoom, onPageSizeChange]);

  useEffect(() => {
    const img = imgRef.current;
    if (img && img.complete) {
      handleLoad();
    }
  }, [handleLoad]);

  return (
    <img
      ref={imgRef}
      src={url}
      alt="Document"
      onLoad={handleLoad}
      style={{
        width: "auto",
        height: "auto",
        transform: `scale(${zoom})`,
        transformOrigin: "top left",
      }}
      className="max-w-none shadow-lg"
      draggable={false}
    />
  );
}
```

- [ ] **Step 3: Create PageNavigation**

```tsx
// packages/web/src/components/document/PageNavigation.tsx
import { useTranslation } from "react-i18next";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useDocumentStore } from "@/stores/documentStore";

export function PageNavigation() {
  const { t } = useTranslation();
  const { document, currentPage, setPage } = useDocumentStore();

  if (!document || document.pageCount <= 1) return null;

  return (
    <div className="flex items-center gap-2">
      <Button
        variant="outline"
        size="icon"
        onClick={() => setPage(currentPage - 1)}
        disabled={currentPage <= 0}
      >
        <ChevronLeft className="h-4 w-4" />
      </Button>
      <span className="text-sm text-muted-foreground">
        {t("viewer.page")} {currentPage + 1} {t("viewer.of")}{" "}
        {document.pageCount}
      </span>
      <Button
        variant="outline"
        size="icon"
        onClick={() => setPage(currentPage + 1)}
        disabled={currentPage >= document.pageCount - 1}
      >
        <ChevronRight className="h-4 w-4" />
      </Button>
    </div>
  );
}
```

- [ ] **Step 4: Create ZoomControls**

```tsx
// packages/web/src/components/document/ZoomControls.tsx
import { useTranslation } from "react-i18next";
import { ZoomIn, ZoomOut, Maximize } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useDocumentStore } from "@/stores/documentStore";

export function ZoomControls() {
  const { t } = useTranslation();
  const { zoom, zoomIn, zoomOut, fitToScreen } = useDocumentStore();

  return (
    <div className="flex items-center gap-1">
      <Button
        variant="outline"
        size="icon"
        onClick={zoomOut}
        title={t("viewer.zoomOut")}
      >
        <ZoomOut className="h-4 w-4" />
      </Button>
      <span className="text-sm text-muted-foreground w-14 text-center">
        {Math.round(zoom * 100)}%
      </span>
      <Button
        variant="outline"
        size="icon"
        onClick={zoomIn}
        title={t("viewer.zoomIn")}
      >
        <ZoomIn className="h-4 w-4" />
      </Button>
      <Button
        variant="outline"
        size="icon"
        onClick={fitToScreen}
        title={t("viewer.fitToScreen")}
      >
        <Maximize className="h-4 w-4" />
      </Button>
    </div>
  );
}
```

- [ ] **Step 5: Create placeholder SectionOverlay**

```tsx
// packages/web/src/components/section/SectionOverlay.tsx
interface SectionOverlayProps {
  width: number;
  height: number;
}

export function SectionOverlay({ width, height }: SectionOverlayProps) {
  return (
    <div
      className="absolute inset-0"
      style={{ width, height }}
    />
  );
}
```

- [ ] **Step 6: Create DocumentViewer**

```tsx
// packages/web/src/components/document/DocumentViewer.tsx
import { useState, useCallback } from "react";
import { useDocumentStore } from "@/stores/documentStore";
import { PDFPageRenderer } from "./PDFPageRenderer";
import { ImageRenderer } from "./ImageRenderer";
import { PageNavigation } from "./PageNavigation";
import { ZoomControls } from "./ZoomControls";
import { SectionOverlay } from "@/components/section/SectionOverlay";

export function DocumentViewer() {
  const { document, currentPage, zoom } = useDocumentStore();
  const [pageSize, setPageSize] = useState({ width: 0, height: 0 });

  const handlePageSizeChange = useCallback(
    (width: number, height: number) => {
      setPageSize({ width, height });
    },
    []
  );

  if (!document) return null;

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between p-2 border-b">
        <PageNavigation />
        <ZoomControls />
      </div>
      <div className="flex-1 overflow-auto p-4 bg-muted/30">
        <div
          className="relative inline-block"
          style={{ width: pageSize.width, height: pageSize.height }}
        >
          {document.type === "pdf" ? (
            <PDFPageRenderer
              url={document.url}
              pageIndex={currentPage}
              zoom={zoom}
              onPageSizeChange={handlePageSizeChange}
            />
          ) : (
            <ImageRenderer
              url={document.url}
              zoom={zoom}
              onPageSizeChange={handlePageSizeChange}
            />
          )}
          <SectionOverlay
            width={pageSize.width}
            height={pageSize.height}
          />
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 7: Commit**

```bash
git add .
git commit -m "feat: add document viewer with PDF/image rendering, zoom, navigation"
```

---

## Task 9: Section Panel & Overlay

**Files:**
- Create: `packages/web/src/components/section/SectionPanel.tsx`
- Create: `packages/web/src/components/section/SectionItem.tsx`
- Create: `packages/web/src/hooks/useSection.ts`
- Modify: `packages/web/src/components/section/SectionOverlay.tsx`

- [ ] **Step 1: Create useSection hook**

```typescript
// packages/web/src/hooks/useSection.ts
import { useCallback, useRef, useState } from "react";
import { useSectionStore } from "@/stores/sectionStore";
import { useDocumentStore } from "@/stores/documentStore";
import type { SectionZone } from "@/types/section";

export function useSection() {
  const {
    sections,
    activeSectionId,
    getActiveSection,
    setActiveSection,
    addSection,
    removeSection,
    renameSection,
    updateSectionZone,
  } = useSectionStore();
  const { currentPage } = useDocumentStore();

  const [isDrawing, setIsDrawing] = useState(false);
  const startPoint = useRef<{ x: number; y: number } | null>(null);
  const [previewRect, setPreviewRect] = useState<SectionZone | null>(null);

  const activeSection = getActiveSection();

  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      if (e.button !== 0 || !activeSectionId) return;
      const rect = e.currentTarget.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      startPoint.current = { x, y };
      setIsDrawing(true);
      setPreviewRect({ x, y, width: 0, height: 0 });
    },
    [activeSectionId]
  );

  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      if (!isDrawing || !startPoint.current) return;
      const rect = e.currentTarget.getBoundingClientRect();
      const currentX = e.clientX - rect.left;
      const currentY = e.clientY - rect.top;

      const x = Math.min(startPoint.current.x, currentX);
      const y = Math.min(startPoint.current.y, currentY);
      const width = Math.abs(currentX - startPoint.current.x);
      const height = Math.abs(currentY - startPoint.current.y);

      setPreviewRect({ x, y, width, height });
    },
    [isDrawing]
  );

  const handleMouseUp = useCallback(() => {
    if (!isDrawing || !previewRect || !activeSectionId) return;

    if (previewRect.width > 5 && previewRect.height > 5) {
      updateSectionZone(activeSectionId, currentPage, previewRect);
    }

    startPoint.current = null;
    setIsDrawing(false);
    setPreviewRect(null);
  }, [isDrawing, previewRect, activeSectionId, currentPage, updateSectionZone]);

  return {
    sections,
    activeSection,
    activeSectionId,
    isDrawing,
    previewRect,
    setActiveSection,
    addSection,
    removeSection,
    renameSection,
    handleMouseDown,
    handleMouseMove,
    handleMouseUp,
  };
}
```

- [ ] **Step 2: Create SectionItem**

```tsx
// packages/web/src/components/section/SectionItem.tsx
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Trash2, Pencil, Check, X, Circle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import type { Section } from "@/types/section";

interface SectionItemProps {
  section: Section;
  isActive: boolean;
  onSelect: (id: string) => void;
  onDelete: (id: string) => void;
  onRename: (id: string, name: string) => void;
}

const statusColors: Record<Section["status"], string> = {
  empty: "text-muted-foreground",
  "zone-defined": "text-blue-500",
  processing: "text-yellow-500",
  extracted: "text-green-500",
  error: "text-destructive",
};

export function SectionItem({
  section,
  isActive,
  onSelect,
  onDelete,
  onRename,
}: SectionItemProps) {
  const { t } = useTranslation();
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState(section.name);

  const handleSaveRename = () => {
    if (editName.trim()) {
      onRename(section.id, editName.trim());
    }
    setIsEditing(false);
  };

  const handleCancelRename = () => {
    setEditName(section.name);
    setIsEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") handleSaveRename();
    if (e.key === "Escape") handleCancelRename();
  };

  const statusLabel = t(`section.status.${section.status.replace("-", "")}` as const);

  return (
    <div
      className={cn(
        "flex items-center gap-2 rounded-md border p-2 cursor-pointer transition-colors",
        isActive ? "border-primary bg-primary/5" : "hover:bg-muted/50"
      )}
      onClick={() => !isEditing && onSelect(section.id)}
    >
      <Circle className={cn("h-3 w-3 fill-current", statusColors[section.status])} />

      {isEditing ? (
        <div className="flex-1 flex items-center gap-1">
          <Input
            value={editName}
            onChange={(e) => setEditName(e.target.value)}
            onKeyDown={handleKeyDown}
            className="h-7 text-sm"
            autoFocus
            onClick={(e) => e.stopPropagation()}
          />
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6"
            onClick={(e) => {
              e.stopPropagation();
              handleSaveRename();
            }}
          >
            <Check className="h-3 w-3" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6"
            onClick={(e) => {
              e.stopPropagation();
              handleCancelRename();
            }}
          >
            <X className="h-3 w-3" />
          </Button>
        </div>
      ) : (
        <>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">{section.name}</p>
            <p className="text-xs text-muted-foreground">
              {t("viewer.page")} {section.pageIndex + 1} · {statusLabel}
            </p>
          </div>
          <div className="flex gap-0.5">
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6"
              onClick={(e) => {
                e.stopPropagation();
                setIsEditing(true);
              }}
            >
              <Pencil className="h-3 w-3" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6"
              onClick={(e) => {
                e.stopPropagation();
                onDelete(section.id);
              }}
            >
              <Trash2 className="h-3 w-3" />
            </Button>
          </div>
        </>
      )}
    </div>
  );
}
```

- [ ] **Step 3: Create SectionPanel**

```tsx
// packages/web/src/components/section/SectionPanel.tsx
import { useTranslation } from "react-i18next";
import { Plus, Play } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { SectionItem } from "./SectionItem";
import { useSection } from "@/hooks/useSection";
import { useOCR } from "@/hooks/useOCR";

export function SectionPanel() {
  const { t } = useTranslation();
  const {
    sections,
    activeSectionId,
    setActiveSection,
    addSection,
    removeSection,
    renameSection,
  } = useSection();
  const { extractActive, isProcessing } = useOCR();

  return (
    <div className="flex flex-col h-full w-64 border-r bg-background">
      <div className="flex items-center justify-between p-3 border-b">
        <h2 className="text-sm font-semibold">{t("section.title")}</h2>
        <Button
          variant="outline"
          size="icon"
          className="h-7 w-7"
          onClick={addSection}
        >
          <Plus className="h-4 w-4" />
        </Button>
      </div>

      <div className="flex-1 overflow-auto p-2 space-y-1">
        {sections.map((section) => (
          <SectionItem
            key={section.id}
            section={section}
            isActive={section.id === activeSectionId}
            onSelect={setActiveSection}
            onDelete={removeSection}
            onRename={renameSection}
          />
        ))}
      </div>

      <Separator />

      <div className="p-3">
        <Button
          className="w-full"
          onClick={extractActive}
          disabled={isProcessing || !activeSectionId}
        >
          <Play className="h-4 w-4 mr-2" />
          {t("section.extract")}
        </Button>
      </div>
    </div>
  );
}
```

- [ ] **Step 4: Implement full SectionOverlay**

```tsx
// packages/web/src/components/section/SectionOverlay.tsx
import { useSection } from "@/hooks/useSection";
import { useDocumentStore } from "@/stores/documentStore";
import { cn } from "@/lib/utils";

interface SectionOverlayProps {
  width: number;
  height: number;
}

export function SectionOverlay({ width, height }: SectionOverlayProps) {
  const {
    activeSection,
    isDrawing,
    previewRect,
    handleMouseDown,
    handleMouseMove,
    handleMouseUp,
  } = useSection();
  const { currentPage } = useDocumentStore();

  const showZone =
    activeSection &&
    activeSection.pageIndex === currentPage &&
    activeSection.zone;

  return (
    <div
      className="absolute inset-0 cursor-crosshair"
      style={{ width, height }}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
    >
      {showZone && activeSection.zone && (
        <div
          className="absolute border-2 border-primary bg-primary/10 pointer-events-none"
          style={{
            left: activeSection.zone.x,
            top: activeSection.zone.y,
            width: activeSection.zone.width,
            height: activeSection.zone.height,
          }}
        />
      )}
      {isDrawing && previewRect && previewRect.width > 0 && previewRect.height > 0 && (
        <div
          className={cn(
            "absolute border-2 border-dashed border-blue-500 bg-blue-500/10 pointer-events-none"
          )}
          style={{
            left: previewRect.x,
            top: previewRect.y,
            width: previewRect.width,
            height: previewRect.height,
          }}
        />
      )}
    </div>
  );
}
```

- [ ] **Step 5: Commit**

```bash
git add .
git commit -m "feat: add section panel with add, delete, rename, and zone selection"
```

---

## Task 10: Image Preprocessing Service

**Files:**
- Create: `packages/web/src/services/imageProcessing.ts`

- [ ] **Step 1: Create image processing service**

```typescript
// packages/web/src/services/imageProcessing.ts
export interface PreprocessOptions {
  grayscale: boolean;
  brightness: number;
  contrast: number;
  binarize: boolean;
  binarizeThreshold: number;
}

const DEFAULT_OPTIONS: PreprocessOptions = {
  grayscale: true,
  brightness: 1.0,
  contrast: 1.2,
  binarize: false,
  binarizeThreshold: 128,
};

export function preprocessImage(
  sourceCanvas: HTMLCanvasElement,
  options: Partial<PreprocessOptions> = {}
): string {
  const opts = { ...DEFAULT_OPTIONS, ...options };
  const { width, height } = sourceCanvas;

  const outputCanvas = document.createElement("canvas");
  outputCanvas.width = width;
  outputCanvas.height = height;
  const ctx = outputCanvas.getContext("2d")!;

  ctx.filter = [
    opts.grayscale ? "grayscale(100%)" : "",
    `brightness(${opts.brightness})`,
    `contrast(${opts.contrast})`,
  ]
    .filter(Boolean)
    .join(" ");

  ctx.drawImage(sourceCanvas, 0, 0);

  if (opts.binarize) {
    const imageData = ctx.getImageData(0, 0, width, height);
    const data = imageData.data;
    for (let i = 0; i < data.length; i += 4) {
      const avg = (data[i]! + data[i + 1]! + data[i + 2]!) / 3;
      const val = avg >= opts.binarizeThreshold ? 255 : 0;
      data[i] = val;
      data[i + 1] = val;
      data[i + 2] = val;
    }
    ctx.putImageData(imageData, 0, 0);
  }

  return outputCanvas.toDataURL("image/png");
}

export function cropZone(
  sourceCanvas: HTMLCanvasElement,
  x: number,
  y: number,
  width: number,
  height: number
): HTMLCanvasElement {
  const cropped = document.createElement("canvas");
  cropped.width = width;
  cropped.height = height;
  const ctx = cropped.getContext("2d")!;
  ctx.drawImage(sourceCanvas, x, y, width, height, 0, 0, width, height);
  return cropped;
}
```

- [ ] **Step 2: Commit**

```bash
git add .
git commit -m "feat: add canvas-based image preprocessing service"
```

---

## Task 11: OCR Architecture (Provider + Manager + NVIDIA Build)

**Files:**
- Create: `packages/web/src/services/ocr/OCRProvider.ts`
- Create: `packages/web/src/services/ocr/OCRManager.ts`
- Create: `packages/web/src/services/ocr/providers/NvidiaBuildProvider.ts`
- Create: `packages/web/src/services/api.ts`

- [ ] **Step 1: Create OCRProvider interface**

```typescript
// packages/web/src/services/ocr/OCRProvider.ts
export interface OCRProvider {
  readonly name: string;
  extractText(imageBase64: string, apiKey: string): Promise<string>;
  validateConnection(apiKey: string): Promise<boolean>;
}
```

- [ ] **Step 2: Create OCRManager**

```typescript
// packages/web/src/services/ocr/OCRManager.ts
import type { OCRProvider } from "./OCRProvider";

export class OCRManager {
  private providers: Map<string, OCRProvider> = new Map();
  private activeProvider: string | null = null;

  registerProvider(provider: OCRProvider): void {
    this.providers.set(provider.name, provider);
    if (!this.activeProvider) {
      this.activeProvider = provider.name;
    }
  }

  setActiveProvider(name: string): void {
    if (!this.providers.has(name)) {
      throw new Error(`OCR provider "${name}" not registered`);
    }
    this.activeProvider = name;
  }

  getActiveProvider(): OCRProvider {
    if (!this.activeProvider) {
      throw new Error("No active OCR provider");
    }
    const provider = this.providers.get(this.activeProvider);
    if (!provider) {
      throw new Error(`OCR provider "${this.activeProvider}" not found`);
    }
    return provider;
  }

  async extractText(imageBase64: string, apiKey: string): Promise<string> {
    const provider = this.getActiveProvider();
    return provider.extractText(imageBase64, apiKey);
  }

  async validateConnection(apiKey: string): Promise<boolean> {
    const provider = this.getActiveProvider();
    return provider.validateConnection(apiKey);
  }

  getProviderNames(): string[] {
    return Array.from(this.providers.keys());
  }
}

export const ocrManager = new OCRManager();
```

- [ ] **Step 3: Create API client**

```typescript
// packages/web/src/services/api.ts
const API_BASE = "/api";

export async function ocrExtract(
  imageBase64: string,
  apiKey: string
): Promise<{ text: string; provider: string }> {
  const response = await fetch(`${API_BASE}/ocr/extract`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ imageBase64, apiKey }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error ?? "OCR request failed");
  }

  return response.json();
}

export async function ocrValidate(
  apiKey: string
): Promise<{ valid: boolean; error?: string }> {
  const response = await fetch(`${API_BASE}/ocr/validate`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ apiKey }),
  });

  if (!response.ok) {
    return { valid: false, error: "Connection failed" };
  }

  return response.json();
}

export async function getHistory(): Promise<unknown[]> {
  const response = await fetch(`${API_BASE}/history`);
  if (!response.ok) throw new Error("Failed to fetch history");
  return response.json();
}

export async function saveExtraction(data: {
  documentName: string;
  sectionName: string;
  pageIndex: number;
  zone: { x: number; y: number; width: number; height: number };
  extractedText: string;
  provider: string;
}): Promise<void> {
  const response = await fetch(`${API_BASE}/history`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!response.ok) throw new Error("Failed to save extraction");
}

export async function clearHistory(): Promise<void> {
  const response = await fetch(`${API_BASE}/history`, { method: "DELETE" });
  if (!response.ok) throw new Error("Failed to clear history");
}
```

- [ ] **Step 4: Create NvidiaBuildProvider**

```typescript
// packages/web/src/services/ocr/providers/NvidiaBuildProvider.ts
import type { OCRProvider } from "../OCRProvider";
import { ocrExtract, ocrValidate } from "@/services/api";

export class NvidiaBuildProvider implements OCRProvider {
  readonly name = "nvidia-build";

  async extractText(imageBase64: string, apiKey: string): Promise<string> {
    const result = await ocrExtract(imageBase64, apiKey);
    return result.text;
  }

  async validateConnection(apiKey: string): Promise<boolean> {
    const result = await ocrValidate(apiKey);
    return result.valid;
  }
}
```

- [ ] **Step 5: Commit**

```bash
git add .
git commit -m "feat: add OCR architecture with OCRProvider, OCRManager, NVIDIA Build provider"
```

---

## Task 12: Backend OCR Proxy Routes

**Files:**
- Create: `packages/api/src/services/nvidiaBuild.ts`
- Create: `packages/api/src/routes/ocr.ts`
- Modify: `packages/api/src/index.ts`

- [ ] **Step 1: Create NVIDIA Build service**

```typescript
// packages/api/src/services/nvidiaBuild.ts
const NVIDIA_API_URL = "https://integrate.api.nvidia.com/v1/chat/completions";
const MODEL_ID = "microsoft/florence-2";

export async function callNvidiaBuildVision(
  imageBase64: string,
  apiKey: string
): Promise<string> {
  const response = await fetch(NVIDIA_API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: MODEL_ID,
      messages: [
        {
          role: "user",
          content: [
            {
              type: "text",
              text: "Extract all visible text from this image. Return only the extracted text, nothing else.",
            },
            {
              type: "image_url",
              image_url: { url: imageBase64 },
            },
          ],
        },
      ],
      max_tokens: 4096,
      temperature: 0.1,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`NVIDIA API error (${response.status}): ${errorText}`);
  }

  const data = await response.json();
  return data.choices?.[0]?.message?.content ?? "";
}

export async function validateNvidiaBuildKey(
  apiKey: string
): Promise<{ valid: boolean; error?: string }> {
  try {
    const tinyPng =
      "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==";
    await callNvidiaBuildVision(tinyPng, apiKey);
    return { valid: true };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    if (message.includes("401") || message.includes("403")) {
      return { valid: false, error: "Invalid API key" };
    }
    return { valid: false, error: message };
  }
}
```

- [ ] **Step 2: Create OCR routes**

```typescript
// packages/api/src/routes/ocr.ts
import { Router } from "express";
import {
  callNvidiaBuildVision,
  validateNvidiaBuildKey,
} from "../services/nvidiaBuild.js";

const router = Router();

router.post("/extract", async (req, res) => {
  try {
    const { imageBase64, apiKey } = req.body;

    if (!imageBase64 || !apiKey) {
      res.status(400).json({ error: "imageBase64 and apiKey are required" });
      return;
    }

    const text = await callNvidiaBuildVision(imageBase64, apiKey);
    res.json({ text, provider: "nvidia-build" });
  } catch (err) {
    const message = err instanceof Error ? err.message : "OCR failed";
    res.status(500).json({ error: message });
  }
});

router.post("/validate", async (req, res) => {
  try {
    const { apiKey } = req.body;

    if (!apiKey) {
      res.status(400).json({ error: "apiKey is required" });
      return;
    }

    const result = await validateNvidiaBuildKey(apiKey);
    res.json(result);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Validation failed";
    res.status(500).json({ valid: false, error: message });
  }
});

export default router;
```

- [ ] **Step 3: Register OCR routes in index.ts**

Add to `packages/api/src/index.ts`:

```typescript
import ocrRoutes from "./routes/ocr.js";
// ...
app.use("/api/ocr", ocrRoutes);
```

- [ ] **Step 4: Commit**

```bash
git add .
git commit -m "feat: add backend OCR proxy routes for NVIDIA Build API"
```

---

## Task 13: OCR Execution Flow (Section-based)

**Files:**
- Create: `packages/web/src/hooks/useOCR.ts`

- [ ] **Step 1: Create useOCR hook**

```typescript
// packages/web/src/hooks/useOCR.ts
import { useCallback } from "react";
import { useOCRStore } from "@/stores/ocrStore";
import { useSectionStore } from "@/stores/sectionStore";
import { useDocumentStore } from "@/stores/documentStore";
import { useSettingsStore } from "@/stores/settingsStore";
import { preprocessImage, cropZone } from "@/services/imageProcessing";
import { ocrExtract, saveExtraction } from "@/services/api";
import * as pdfjsLib from "pdfjs-dist";

async function getSourceCanvas(): Promise<HTMLCanvasElement> {
  const { document, currentPage, zoom } = useDocumentStore.getState();
  if (!document) throw new Error("No document loaded");

  return new Promise((resolve, reject) => {
    if (document.type === "pdf") {
      (async () => {
        try {
          const pdf = await pdfjsLib.getDocument(document.url).promise;
          const page = await pdf.getPage(currentPage + 1);
          const viewport = page.getViewport({ scale: zoom * 2 });
          const canvas = document.createElement("canvas");
          const ctx = canvas.getContext("2d")!;
          canvas.width = viewport.width;
          canvas.height = viewport.height;
          await page.render({ canvasContext: ctx, viewport }).promise;
          pdf.destroy();
          resolve(canvas);
        } catch (err) {
          reject(err);
        }
      })();
    } else {
      const img = new Image();
      img.crossOrigin = "anonymous";
      img.onload = () => {
        const canvas = document.createElement("canvas");
        canvas.width = img.naturalWidth * zoom;
        canvas.height = img.naturalHeight * zoom;
        const ctx = canvas.getContext("2d")!;
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        resolve(canvas);
      };
      img.onerror = reject;
      img.src = document.url;
    }
  });
}

export function useOCR() {
  const { isProcessing, setProcessing } = useOCRStore();

  const extractActive = useCallback(async () => {
    const { settings } = useSettingsStore.getState();
    const { document } = useDocumentStore.getState();
    const { getActiveSection, updateSectionStatus, updateSectionExtractedText, updateSectionCroppedImage } =
      useSectionStore.getState();

    if (!settings.ocrEnabled || !settings.apiKey || !document) return;

    const section = getActiveSection();
    if (!section || !section.zone) return;

    updateSectionStatus(section.id, "processing");
    setProcessing(true);

    try {
      const sourceCanvas = await getSourceCanvas();
      const cropped = cropZone(
        sourceCanvas,
        section.zone.x,
        section.zone.y,
        section.zone.width,
        section.zone.height
      );

      const imageData = settings.preprocessingEnabled
        ? preprocessImage(cropped)
        : cropped.toDataURL("image/png");

      updateSectionCroppedImage(section.id, imageData);

      const response = await ocrExtract(imageData, settings.apiKey);

      updateSectionExtractedText(section.id, response.text);

      await saveExtraction({
        documentName: document.name,
        sectionName: section.name,
        pageIndex: section.pageIndex,
        zone: section.zone,
        extractedText: response.text,
        provider: response.provider,
      });
    } catch (err) {
      updateSectionStatus(
        section.id,
        "error",
        err instanceof Error ? err.message : "Unknown error"
      );
    } finally {
      setProcessing(false);
    }
  }, [setProcessing]);

  return { extractActive, isProcessing };
}
```

- [ ] **Step 2: Commit**

```bash
git add .
git commit -m "feat: add OCR execution flow tied to active section"
```

---

## Task 14: OCR Result Display & Export

**Files:**
- Create: `packages/web/src/components/ocr/OCRResultPanel.tsx`

- [ ] **Step 1: Create OCRResultPanel**

```tsx
// packages/web/src/components/ocr/OCRResultPanel.tsx
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Copy, Check, Download, Loader2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useSectionStore } from "@/stores/sectionStore";
import { useOCRStore } from "@/stores/ocrStore";

export function OCRResultPanel() {
  const { t } = useTranslation();
  const { getActiveSection } = useSectionStore();
  const { isProcessing } = useOCRStore();
  const [copied, setCopied] = useState(false);

  const activeSection = getActiveSection();

  const handleCopy = async () => {
    if (!activeSection?.extractedText) return;
    await navigator.clipboard.writeText(activeSection.extractedText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleExportTxt = () => {
    if (!activeSection?.extractedText) return;
    const blob = new Blob([activeSection.extractedText], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `extracto-${activeSection.name}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (isProcessing) {
    return (
      <div className="flex flex-col h-full">
        <div className="p-4 border-b">
          <h2 className="text-lg font-semibold">{t("ocr.title")}</h2>
        </div>
        <div className="flex-1 flex items-center justify-center">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" />
            {t("ocr.processing")}
          </div>
        </div>
      </div>
    );
  }

  if (activeSection?.status === "error") {
    return (
      <div className="flex flex-col h-full">
        <div className="p-4 border-b">
          <h2 className="text-lg font-semibold">{t("ocr.title")}</h2>
        </div>
        <div className="flex-1 flex items-center justify-center p-4">
          <div className="flex items-center gap-2 text-destructive">
            <AlertCircle className="h-4 w-4" />
            {t("ocr.error")}: {activeSection.errorMessage}
          </div>
        </div>
      </div>
    );
  }

  if (!activeSection?.extractedText) {
    return (
      <div className="flex flex-col h-full">
        <div className="p-4 border-b">
          <h2 className="text-lg font-semibold">{t("ocr.title")}</h2>
        </div>
        <div className="flex-1 flex items-center justify-center">
          <p className="text-sm text-muted-foreground text-center px-4">
            {t("ocr.empty")}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between p-4 border-b">
        <h2 className="text-lg font-semibold">{t("ocr.title")}</h2>
        <div className="flex gap-1">
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={handleCopy}>
            {copied ? (
              <Check className="h-4 w-4 text-green-500" />
            ) : (
              <Copy className="h-4 w-4" />
            )}
          </Button>
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={handleExportTxt}>
            <Download className="h-4 w-4" />
          </Button>
        </div>
      </div>
      <div className="flex-1 overflow-auto p-4">
        <pre className="whitespace-pre-wrap text-sm">{activeSection.extractedText}</pre>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add .
git commit -m "feat: add OCR result display with copy and .txt export"
```

---

## Task 15: Settings Panel

**Files:**
- Create: `packages/web/src/components/settings/SettingsPanel.tsx`

- [ ] **Step 1: Create SettingsPanel**

```tsx
// packages/web/src/components/settings/SettingsPanel.tsx
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { CheckCircle, XCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { useSettingsStore } from "@/stores/settingsStore";
import { ocrValidate } from "@/services/api";

type ValidationState = "idle" | "validating" | "valid" | "invalid";

export function SettingsPanel() {
  const { t, i18n } = useTranslation();
  const { settings, updateSettings } = useSettingsStore();
  const [validationState, setValidationState] = useState<ValidationState>("idle");
  const [validationError, setValidationError] = useState("");

  const handleValidate = async () => {
    if (!settings.apiKey) return;
    setValidationState("validating");
    try {
      const result = await ocrValidate(settings.apiKey);
      if (result.valid) {
        setValidationState("valid");
      } else {
        setValidationState("invalid");
        setValidationError(result.error ?? "");
      }
    } catch {
      setValidationState("invalid");
      setValidationError("Connection failed");
    }
  };

  const handleLanguageChange = (lang: "es" | "en") => {
    updateSettings({ language: lang });
    i18n.changeLanguage(lang);
  };

  return (
    <div className="max-w-lg mx-auto p-8">
      <h1 className="text-2xl font-bold mb-6">{t("settings.title")}</h1>

      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <Label>{t("settings.language")}</Label>
          <div className="flex gap-2">
            <Button
              variant={settings.language === "es" ? "default" : "outline"}
              size="sm"
              onClick={() => handleLanguageChange("es")}
            >
              ES
            </Button>
            <Button
              variant={settings.language === "en" ? "default" : "outline"}
              size="sm"
              onClick={() => handleLanguageChange("en")}
            >
              EN
            </Button>
          </div>
        </div>

        <Separator />

        <div className="flex items-center justify-between">
          <Label>{t("settings.ocrEnabled")}</Label>
          <Button
            variant={settings.ocrEnabled ? "default" : "outline"}
            size="sm"
            onClick={() => updateSettings({ ocrEnabled: !settings.ocrEnabled })}
          >
            {settings.ocrEnabled ? "ON" : "OFF"}
          </Button>
        </div>

        <div className="flex items-center justify-between">
          <Label>{t("settings.preprocessing")}</Label>
          <Button
            variant={settings.preprocessingEnabled ? "default" : "outline"}
            size="sm"
            onClick={() =>
              updateSettings({
                preprocessingEnabled: !settings.preprocessingEnabled,
              })
            }
          >
            {settings.preprocessingEnabled ? "ON" : "OFF"}
          </Button>
        </div>

        <Separator />

        <div className="space-y-2">
          <Label>{t("settings.apiKey")}</Label>
          <Input
            type="password"
            placeholder={t("settings.apiKeyPlaceholder")}
            value={settings.apiKey}
            onChange={(e) => updateSettings({ apiKey: e.target.value })}
          />
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleValidate}
              disabled={validationState === "validating" || !settings.apiKey}
            >
              {validationState === "validating" && (
                <Loader2 className="h-3 w-3 mr-1 animate-spin" />
              )}
              {t("settings.validate")}
            </Button>
            {validationState === "valid" && (
              <span className="flex items-center gap-1 text-sm text-green-600">
                <CheckCircle className="h-4 w-4" />
                {t("settings.valid")}
              </span>
            )}
            {validationState === "invalid" && (
              <span className="flex items-center gap-1 text-sm text-destructive">
                <XCircle className="h-4 w-4" />
                {t("settings.invalid")}: {validationError}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add .
git commit -m "feat: add settings panel with API key, OCR toggle, preprocessing, language"
```

---

## Task 16: History (DB + API + UI)

**Files:**
- Create: `packages/api/src/routes/history.ts`
- Modify: `packages/api/src/index.ts`
- Create: `packages/web/src/components/history/HistoryPanel.tsx`

- [ ] **Step 1: Create history routes**

```typescript
// packages/api/src/routes/history.ts
import { Router } from "express";
import { getDatabase } from "../db/database.js";
import type { ExtractionRow } from "../types/index.js";

const router = Router();

router.get("/", (_req, res) => {
  try {
    const db = getDatabase();
    const rows = db
      .prepare("SELECT * FROM extractions ORDER BY created_at DESC LIMIT 100")
      .all() as ExtractionRow[];

    const records = rows.map((row) => ({
      id: row.id,
      documentName: row.document_name,
      sectionName: row.section_name,
      pageIndex: row.page_index,
      zone: {
        x: row.zone_x,
        y: row.zone_y,
        width: row.zone_width,
        height: row.zone_height,
      },
      extractedText: row.extracted_text,
      provider: row.provider,
      createdAt: row.created_at,
    }));

    res.json(records);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to fetch";
    res.status(500).json({ error: message });
  }
});

router.post("/", (req, res) => {
  try {
    const { documentName, sectionName, pageIndex, zone, extractedText, provider } =
      req.body;

    if (!documentName || !extractedText) {
      res.status(400).json({ error: "documentName and extractedText required" });
      return;
    }

    const db = getDatabase();
    const id = crypto.randomUUID();

    db.prepare(
      `INSERT INTO extractions (id, document_name, section_name, page_index, zone_x, zone_y, zone_width, zone_height, extracted_text, provider)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
    ).run(
      id,
      documentName,
      sectionName ?? "Unknown",
      pageIndex ?? 0,
      zone?.x ?? 0,
      zone?.y ?? 0,
      zone?.width ?? 0,
      zone?.height ?? 0,
      extractedText,
      provider ?? "unknown"
    );

    res.status(201).json({ id });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to save";
    res.status(500).json({ error: message });
  }
});

router.delete("/", (_req, res) => {
  try {
    const db = getDatabase();
    db.prepare("DELETE FROM extractions").run();
    res.json({ success: true });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to clear";
    res.status(500).json({ error: message });
  }
});

export default router;
```

- [ ] **Step 2: Register history routes in index.ts**

Add to `packages/api/src/index.ts`:

```typescript
import historyRoutes from "./routes/history.js";
// ...
app.use("/api/history", historyRoutes);
```

- [ ] **Step 3: Create HistoryPanel component**

```tsx
// packages/web/src/components/history/HistoryPanel.tsx
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Trash2, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { getHistory, clearHistory } from "@/services/api";

interface HistoryRecord {
  id: string;
  documentName: string;
  sectionName: string;
  pageIndex: number;
  extractedText: string;
  provider: string;
  createdAt: string;
}

export function HistoryPanel() {
  const { t } = useTranslation();
  const [records, setRecords] = useState<HistoryRecord[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchHistory = async () => {
    try {
      const data = (await getHistory()) as HistoryRecord[];
      setRecords(data);
    } catch {
      setRecords([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  const handleClear = async () => {
    await clearHistory();
    setRecords([]);
  };

  const handleExport = (record: HistoryRecord) => {
    const blob = new Blob([record.extractedText], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `extracto-${record.sectionName}-${record.id.slice(0, 8)}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (loading) {
    return <div className="p-8 text-center text-muted-foreground">...</div>;
  }

  return (
    <div className="max-w-3xl mx-auto p-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">{t("history.title")}</h1>
        {records.length > 0 && (
          <Button variant="outline" size="sm" onClick={handleClear}>
            <Trash2 className="h-4 w-4 mr-1" />
            {t("history.clear")}
          </Button>
        )}
      </div>

      {records.length === 0 ? (
        <p className="text-center text-muted-foreground py-12">
          {t("history.empty")}
        </p>
      ) : (
        <div className="space-y-2">
          {records.map((record) => (
            <div
              key={record.id}
              className="flex items-center justify-between rounded border p-3"
            >
              <div className="flex items-center gap-3">
                <FileText className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">{record.documentName}</p>
                  <p className="text-xs text-muted-foreground">
                    {record.sectionName} · {t("history.page")} {record.pageIndex + 1} ·{" "}
                    {record.provider} ·{" "}
                    {new Date(record.createdAt).toLocaleString()}
                  </p>
                </div>
              </div>
              <div className="flex gap-1">
                <Dialog>
                  <DialogTrigger asChild>
                    <Button variant="ghost" size="sm">
                      {t("history.view")}
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl">
                    <DialogHeader>
                      <DialogTitle>
                        {record.documentName} — {record.sectionName}
                      </DialogTitle>
                    </DialogHeader>
                    <pre className="whitespace-pre-wrap text-sm max-h-96 overflow-auto p-4 bg-muted rounded">
                      {record.extractedText}
                    </pre>
                  </DialogContent>
                </Dialog>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => handleExport(record)}
                >
                  <FileText className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
```

- [ ] **Step 4: Commit**

```bash
git add .
git commit -m "feat: add extraction history with SQLite backend and UI"
```

---

## Task 17: App Layout, Routing & Final Integration

**Files:**
- Create: `packages/web/src/app/routes.tsx`
- Create: `packages/web/src/components/layout/AppLayout.tsx`
- Create: `packages/web/src/components/layout/Header.tsx`
- Create: `packages/web/src/pages/ViewerPage.tsx`
- Create: `packages/web/src/pages/HistoryPage.tsx`
- Create: `packages/web/src/pages/SettingsPage.tsx`
- Modify: `packages/web/src/App.tsx`
- Modify: `packages/web/src/main.tsx`

- [ ] **Step 1: Create pages**

```tsx
// packages/web/src/pages/ViewerPage.tsx
import { useDocumentStore } from "@/stores/documentStore";
import { FileUpload } from "@/components/upload/FileUpload";
import { DocumentViewer } from "@/components/document/DocumentViewer";
import { SectionPanel } from "@/components/section/SectionPanel";
import { OCRResultPanel } from "@/components/ocr/OCRResultPanel";
import { Separator } from "@/components/ui/separator";

export function ViewerPage() {
  const { document } = useDocumentStore();

  if (!document) {
    return (
      <div className="flex items-center justify-center h-full p-8">
        <div className="w-full max-w-2xl">
          <FileUpload />
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-full">
      <SectionPanel />
      <div className="flex-1 overflow-hidden">
        <DocumentViewer />
      </div>
      <Separator orientation="vertical" />
      <div className="w-80 overflow-hidden">
        <OCRResultPanel />
      </div>
    </div>
  );
}
```

```tsx
// packages/web/src/pages/HistoryPage.tsx
import { HistoryPanel } from "@/components/history/HistoryPanel";

export function HistoryPage() {
  return <HistoryPanel />;
}
```

```tsx
// packages/web/src/pages/SettingsPage.tsx
import { SettingsPanel } from "@/components/settings/SettingsPanel";

export function SettingsPage() {
  return <SettingsPanel />;
}
```

- [ ] **Step 2: Create Header**

```tsx
// packages/web/src/components/layout/Header.tsx
import { useTranslation } from "react-i18next";
import { Link, useLocation } from "react-router-dom";
import { FileText, History, Settings } from "lucide-react";
import { cn } from "@/lib/utils";

export function Header() {
  const { t } = useTranslation();
  const location = useLocation();

  const links = [
    { to: "/", icon: FileText, label: t("nav.viewer") },
    { to: "/history", icon: History, label: t("nav.history") },
    { to: "/settings", icon: Settings, label: t("nav.settings") },
  ];

  return (
    <header className="border-b bg-background">
      <div className="flex items-center justify-between px-4 h-12">
        <Link to="/" className="flex items-center gap-2 font-bold text-lg">
          Extracto
        </Link>
        <nav className="flex items-center gap-1">
          {links.map(({ to, icon: Icon, label }) => (
            <Link
              key={to}
              to={to}
              className={cn(
                "flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm transition-colors",
                location.pathname === to
                  ? "bg-accent text-accent-foreground font-medium"
                  : "text-muted-foreground hover:text-foreground hover:bg-accent/50"
              )}
            >
              <Icon className="h-4 w-4" />
              {label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}
```

- [ ] **Step 3: Create AppLayout**

```tsx
// packages/web/src/components/layout/AppLayout.tsx
import { Outlet } from "react-router-dom";
import { Header } from "./Header";

export function AppLayout() {
  return (
    <div className="flex flex-col h-screen">
      <Header />
      <main className="flex-1 overflow-hidden">
        <Outlet />
      </main>
    </div>
  );
}
```

- [ ] **Step 4: Create routes**

```tsx
// packages/web/src/app/routes.tsx
import { createBrowserRouter } from "react-router-dom";
import { AppLayout } from "@/components/layout/AppLayout";
import { ViewerPage } from "@/pages/ViewerPage";
import { HistoryPage } from "@/pages/HistoryPage";
import { SettingsPage } from "@/pages/SettingsPage";

export const router = createBrowserRouter([
  {
    element: <AppLayout />,
    children: [
      { path: "/", element: <ViewerPage /> },
      { path: "/history", element: <HistoryPage /> },
      { path: "/settings", element: <SettingsPage /> },
    ],
  },
]);
```

- [ ] **Step 5: Update App.tsx**

```tsx
// packages/web/src/App.tsx
import { RouterProvider } from "react-router-dom";
import { router } from "@/app/routes";

function App() {
  return <RouterProvider router={router} />;
}

export default App;
```

- [ ] **Step 6: Verify full app works**

Run: `npm run dev`
Expected: App starts with routing, can navigate between Viewer, History, Settings.

- [ ] **Step 7: Commit**

```bash
git add .
git commit -m "feat: add app layout, routing, and final integration"
```

---

## Task 18: Integration Testing & QA

- [ ] **Step 1: Test complete flow**

1. Start both servers: `npm run dev`
2. Upload a PDF or image
3. Verify "Sección 1" is created automatically
4. Draw a zone on the document
5. Configure API key in Settings
6. Click "Extraer texto"
7. Verify OCR result appears
8. Add a new section, draw another zone
9. Rename a section
10. Delete a section
11. Check History page shows the extraction
12. Export result as .txt

- [ ] **Step 2: Run lint and build**

Run: `npm run lint`
Run: `npm run build`
Expected: No errors.

- [ ] **Step 3: Final commit**

```bash
git add .
git commit -m "chore: integration testing and QA complete"
```

---

## Summary

| # | Task | Key Files |
|---|------|-----------|
| 1 | Monorepo Scaffolding | `package.json` |
| 2 | Frontend Foundation | `packages/web/*` |
| 3 | Backend Foundation | `packages/api/*` |
| 4 | Core Types | `types/section.ts` (CORE) |
| 5 | Zustand Stores | `stores/sectionStore.ts` (CORE) |
| 6 | i18n Setup | `i18n/es.json`, `i18n/en.json` |
| 7 | File Upload | `hooks/useDocument.ts`, `FileUpload.tsx` |
| 8 | Document Viewer | `DocumentViewer.tsx`, renderers |
| 9 | **Section Panel & Overlay** | `SectionPanel.tsx`, `SectionItem.tsx`, `SectionOverlay.tsx` |
| 10 | Image Preprocessing | `services/imageProcessing.ts` |
| 11 | OCR Architecture | `OCRManager.ts`, `NvidiaBuildProvider.ts` |
| 12 | Backend OCR Routes | `routes/ocr.ts`, `nvidiaBuild.ts` |
| 13 | OCR Execution (Section) | `hooks/useOCR.ts` |
| 14 | Results Display | `OCRResultPanel.tsx` |
| 15 | Settings Panel | `SettingsPanel.tsx` |
| 16 | History | `routes/history.ts`, `HistoryPanel.tsx` |
| 17 | Layout & Routing | `AppLayout.tsx`, `Header.tsx`, pages |
| 18 | Integration & QA | Testing |

---

**Plan complete. Execution approach: Subagent-Driven Development**

Each task will be dispatched to a fresh subagent. Review between tasks ensures quality and allows course correction.
