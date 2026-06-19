# Extracto - Architecture Document

## 1. System Overview

Extracto follows a **monorepo architecture** with clear separation between frontend and backend, using npm workspaces for dependency management.

```
┌─────────────────────────────────────────────────────────────────┐
│                         CLIENT (Browser)                         │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │                    React Application                       │  │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────────┐   │  │
│  │  │   Viewer    │  │   Section   │  │   OCR Results   │   │  │
│  │  │   Panel     │  │   Panel     │  │   Panel         │   │  │
│  │  └──────┬──────┘  └──────┬──────┘  └────────┬────────┘   │  │
│  │         │                │                   │             │  │
│  │  ┌──────┴────────────────┴───────────────────┴──────┐     │  │
│  │  │              Zustand State Stores                 │     │  │
│  │  │  ┌──────────┐ ┌──────────┐ ┌────────┐ ┌────────┐ │     │  │
│  │  │  │ document │ │ section  │ │  ocr   │ │settings│ │     │  │
│  │  │  │  Store   │ │  Store   │ │ Store  │ │ Store  │ │     │  │
│  │  │  └──────────┘ └──────────┘ └────────┘ └────────┘ │     │  │
│  │  └──────────────────────┬────────────────────────────┘     │  │
│  └─────────────────────────┼───────────────────────────────────┘  │
└────────────────────────────┼──────────────────────────────────────┘
                             │ HTTP/REST
                             ▼
┌───────────────────────────────────────────────────────────────────┐
│                        SERVER (Node.js)                            │
│  ┌─────────────────────────────────────────────────────────────┐  │
│  │                   Express Application                        │  │
│  │  ┌──────────────┐  ┌──────────────┐  ┌──────────────────┐  │  │
│  │  │  OCR Routes  │  │ History      │  │  Health Check    │  │  │
│  │  │  /api/ocr/*  │  │ /api/history │  │  /api/health     │  │  │
│  │  └──────┬───────┘  └──────┬───────┘  └──────────────────┘  │  │
│  │         │                 │                                  │  │
│  │  ┌──────┴───────┐  ┌──────┴───────┐                         │  │
│  │  │   NVIDIA     │  │   SQLite     │                         │  │
│  │  │   Build      │  │   Database   │                         │  │
│  │  │   Proxy      │  │   (better-   │                         │  │
│  │  │   Service    │  │   sqlite3)   │                         │  │
│  │  └──────┬───────┘  └──────────────┘                         │  │
│  └─────────┼────────────────────────────────────────────────────┘  │
└────────────┼───────────────────────────────────────────────────────┘
             │ HTTPS
             ▼
┌───────────────────────────────────────────────────────────────────┐
│                    NVIDIA BUILD API                                │
│              (Kimi 2.6 Vision Model)                               │
└───────────────────────────────────────────────────────────────────┘
```

---

## 2. Directory Structure

```
textractor/
├── package.json                    # Root workspaces config
├── docs/                           # Documentation
│   ├── PRD.md                      # Product Requirements
│   ├── ARCHITECTURE.md             # This file
│   └── superpowers/plans/          # Implementation plans
│
├── packages/
│   ├── web/                        # Frontend Application
│   │   ├── package.json
│   │   ├── vite.config.ts
│   │   ├── tsconfig.json
│   │   ├── components.json         # shadcn/ui config
│   │   ├── index.html
│   │   └── src/
│   │       ├── main.tsx            # Entry point
│   │       ├── App.tsx             # Root component
│   │       ├── index.css           # Tailwind v4 entry
│   │       │
│   │       ├── app/                # Application config
│   │       │   └── routes.tsx      # React Router config
│   │       │
│   │       ├── types/              # TypeScript type definitions
│   │       │   ├── document.ts     # Document types
│   │       │   ├── section.ts      # Section types (CORE)
│   │       │   ├── ocr.ts          # OCR types
│   │       │   └── settings.ts     # Settings types
│   │       │
│   │       ├── i18n/               # Internationalization
│   │       │   ├── index.ts        # i18n config
│   │       │   ├── es.json         # Spanish translations
│   │       │   └── en.json         # English translations
│   │       │
│   │       ├── lib/                # Utilities
│   │       │   └── utils.ts        # cn() helper
│   │       │
│   │       ├── stores/             # Zustand state management
│   │       │   ├── documentStore.ts
│   │       │   ├── sectionStore.ts # CORE - Section management
│   │       │   ├── ocrStore.ts
│   │       │   └── settingsStore.ts
│   │       │
│   │       ├── services/           # Business logic services
│   │       │   ├── api.ts          # API client
│   │       │   ├── imageProcessing.ts
│   │       │   └── ocr/
│   │       │       ├── OCRProvider.ts      # Interface
│   │       │       ├── OCRManager.ts       # Manager
│   │       │       └── providers/
│   │       │           └── NvidiaBuildProvider.ts
│   │       │
│   │       ├── hooks/              # Custom React hooks
│   │       │   ├── useDocument.ts
│   │       │   ├── useSection.ts   # CORE - Section logic
│   │       │   └── useOCR.ts
│   │       │
│   │       ├── components/         # React components
│   │       │   ├── ui/             # shadcn/ui components
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
│   │       │   ├── section/        # CORE - Section components
│   │       │   │   ├── SectionPanel.tsx
│   │       │   │   ├── SectionItem.tsx
│   │       │   │   └── SectionOverlay.tsx
│   │       │   ├── ocr/
│   │       │   │   └── OCRResultPanel.tsx
│   │       │   ├── history/
│   │       │   │   └── HistoryPanel.tsx
│   │       │   └── settings/
│   │       │       └── SettingsPanel.tsx
│   │       │
│   │       └── pages/              # Page components
│   │           ├── ViewerPage.tsx
│   │           ├── HistoryPage.tsx
│   │           └── SettingsPage.tsx
│   │
│   └── api/                        # Backend Application
│       ├── package.json
│       ├── tsconfig.json
│       ├── data/                   # SQLite database (gitignored)
│       │   └── extracto.db
│       └── src/
│           ├── index.ts            # Express entry point
│           ├── routes/
│           │   ├── ocr.ts          # OCR proxy routes
│           │   └── history.ts      # History CRUD routes
│           ├── services/
│           │   └── nvidiaBuild.ts  # NVIDIA API client
│           ├── db/
│           │   ├── database.ts     # SQLite connection
│           │   └── migrations/
│           │       └── 001_create_extractions.sql
│           └── types/
│               └── index.ts        # Backend types
```

---

## 3. Core Concepts

### 3.1 Section Model (Central Abstraction)

The **Section** is the core abstraction of Extracto. Every extraction lives within a section.

```typescript
interface Section {
  id: string;                    // Unique identifier
  name: string;                  // User-defined name (e.g., "Sección 1")
  pageIndex: number;             // Document page where region is located
  region: SectionRegion | null;  // Coordinates of the selected area
  croppedImage: string | null;   // Base64 of the cropped region
  extractedText: string | null;  // OCR result
  status: SectionStatus;         // Lifecycle state
  errorMessage: string | null;   // Error details if status is "error"
  createdAt: string;             // ISO timestamp
  updatedAt: string;             // ISO timestamp
}

type SectionStatus = 
  | "empty"           // No region defined
  | "region-defined"  // Region drawn, ready for OCR
  | "processing"      // OCR in progress
  | "extracted"       // OCR completed successfully
  | "error";          // OCR failed

interface SectionRegion {
  x: number;
  y: number;
  width: number;
  height: number;
}
```

**Key behaviors:**
- On document load, "Sección 1" is created automatically
- Only one section can be active at a time
- Each section's region is independent and persists across navigation
- Switching sections shows only that section's region on the viewer

### 3.2 OCR Architecture

The OCR system follows the **Strategy Pattern** for extensibility:

```
┌─────────────────────────────────────────────────────┐
│                   OCRManager                         │
│  ┌───────────────────────────────────────────────┐  │
│  │  providers: Map<string, OCRProvider>          │  │
│  │  activeProvider: string                       │  │
│  └───────────────────────────────────────────────┘  │
│                                                      │
│  + registerProvider(provider: OCRProvider): void     │
│  + setActiveProvider(name: string): void             │
│  + getActiveProvider(): OCRProvider                  │
│  + extractText(imageBase64, apiKey): Promise<string> │
│  + validateConnection(apiKey): Promise<boolean>      │
└─────────────────────────────────────────────────────┘
                         ▲
                         │ implements
                         │
         ┌───────────────┴───────────────┐
         │                               │
┌────────┴────────┐            ┌─────────┴────────┐
│  OCRProvider    │            │ NvidiaBuild      │
│  (interface)    │            │ Provider         │
├─────────────────┤            ├──────────────────┤
│ name: string    │            │ name = "nvidia"  │
│ extractText()   │            │ extractText()    │
│ validateConn()  │            │ validateConn()   │
└─────────────────┘            └──────────────────┘
```

**Flow:**
1. Frontend crops region from canvas
2. Optional preprocessing applied (grayscale, contrast, etc.)
3. Image sent to backend via `/api/ocr/extract`
4. Backend proxies to NVIDIA Build API
5. Response returned to frontend
6. Result stored in active section

### 3.3 State Management

Zustand stores are organized by domain:

```
┌─────────────────────────────────────────────────────────────────┐
│                         State Layer                              │
├──────────────────┬──────────────────┬────────────┬──────────────┤
│  documentStore   │  sectionStore    │ ocrStore   │ settingsStore│
├──────────────────┼──────────────────┼────────────┼──────────────┤
│ document: Doc    │ sections: []     │ processing │ settings: {} │
│ currentPage: 0   │ activeId: str    │            │              │
│ zoom: 1          │ counter: 0       │            │              │
├──────────────────┼──────────────────┼────────────┼──────────────┤
│ setDocument()    │ addSection()     │ setProc()  │ update()     │
│ setPage()        │ removeSection()  │            │ reset()      │
│ setZoom()        │ renameSection()  │            │              │
│ zoomIn/Out()     │ updateRegion()   │            │              │
│ clearDocument()  │ updateText()     │            │              │
│                  │ setActive()      │            │              │
│                  │ initialize()     │            │              │
└──────────────────┴──────────────────┴────────────┴──────────────┘
```

**Persistence:**
- `settingsStore`: Persisted to localStorage via zustand/middleware
- Other stores: Ephemeral, reset on document change

---

## 4. Data Flow

### 4.1 Document Loading Flow

```
User drops file
      │
      ▼
┌─────────────┐     ┌──────────────┐     ┌─────────────────┐
│ FileUpload  │────▶│ useDocument  │────▶│ documentStore   │
│ Component   │     │ hook         │     │ .setDocument()  │
└─────────────┘     └──────┬───────┘     └────────┬────────┘
                           │                       │
                           │                       ▼
                    ┌──────┴───────┐     ┌─────────────────┐
                    │ pdfjs-dist   │     │ sectionStore    │
                    │ (count pages)│     │ .initialize()   │
                    └──────────────┘     │ → "Sección 1"   │
                                         └─────────────────┘
```

### 4.2 Region Selection Flow

```
User draws rectangle on viewer
      │
      ▼
┌─────────────────┐     ┌──────────────┐     ┌─────────────────┐
│ SectionOverlay  │────▶│ useSection   │────▶│ sectionStore    │
│ onMouseUp       │     │ hook         │     │ .updateRegion() │
└─────────────────┘     └──────────────┘     └─────────────────┘
                                                      │
                                                      ▼
                                              ┌───────────────┐
                                              │ Section state │
                                              │ updated:      │
                                              │ - pageIndex   │
                                              │ - region      │
                                              │ - status      │
                                              └───────────────┘
```

### 4.3 OCR Extraction Flow

```
User clicks "Extract"
      │
      ▼
┌─────────────┐     ┌──────────────┐     ┌───────────────────┐
│ SectionPanel│────▶│ useOCR hook  │────▶│ getSourceCanvas() │
│ Button      │     │              │     │ (render PDF/img)  │
└─────────────┘     └──────┬───────┘     └─────────┬─────────┘
                           │                        │
                           │                        ▼
                    ┌──────┴───────┐     ┌───────────────────┐
                    │ sectionStore │     │ cropRegion()      │
                    │ .getStatus() │     │ + preprocessImage │
                    └──────────────┘     └─────────┬─────────┘
                                                   │
                                                   ▼
                    ┌───────────────┐     ┌───────────────────┐
                    │ API Client    │◀────│ image as base64   │
                    │ ocrExtract()  │     └───────────────────┘
                    └───────┬───────┘
                            │ POST /api/ocr/extract
                            ▼
                    ┌───────────────┐     ┌───────────────────┐
                    │ Backend       │────▶│ NVIDIA Build API  │
                    │ OCR Route     │     │ (Kimi 2.6 Vision) │
                    └───────┬───────┘     └─────────┬─────────┘
                            │                       │
                            │◀──────────────────────┘
                            │ { text, provider }
                            ▼
                    ┌───────────────┐     ┌───────────────────┐
                    │ sectionStore  │     │ saveExtraction()  │
                    │ .updateText() │     │ → /api/history    │
                    └───────────────┘     │ → SQLite DB       │
                                          └───────────────────┘
```

---

## 5. API Design

### 5.1 Backend Endpoints

| Method | Endpoint | Description | Request Body | Response |
|--------|----------|-------------|--------------|----------|
| GET | `/api/health` | Health check | - | `{ status, timestamp }` |
| POST | `/api/ocr/extract` | Extract text from image | `{ imageBase64, apiKey }` | `{ text, provider }` |
| POST | `/api/ocr/validate` | Validate API key | `{ apiKey }` | `{ valid, error? }` |
| GET | `/api/history` | List extractions | - | `ExtractionRecord[]` |
| POST | `/api/history` | Save extraction | `ExtractionRecord` | `{ id }` |
| DELETE | `/api/history` | Clear history | - | `{ success }` |

### 5.2 Request/Response Types

```typescript
// OCR Extract
interface OCRRequest {
  imageBase64: string;
  apiKey: string;
}

interface OCRResponse {
  text: string;
  provider: string;
}

// Validation
interface ValidationResult {
  valid: boolean;
  error?: string;
}

// History
interface ExtractionRecord {
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

---

## 6. Database Schema

```sql
CREATE TABLE extractions (
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

CREATE INDEX idx_extractions_created_at ON extractions(created_at DESC);
```

---

## 7. Component Architecture

### 7.1 Component Hierarchy

```
App
└── RouterProvider
    └── AppLayout
        ├── Header (navigation)
        └── <Outlet />
            ├── ViewerPage
            │   ├── FileUpload (when no document)
            │   └── (when document loaded)
            │       ├── SectionPanel (left sidebar)
            │       │   ├── SectionItem[] (list)
            │       │   └── Extract Button
            │       ├── DocumentViewer (center)
            │       │   ├── PageNavigation
            │       │   ├── ZoomControls
            │       │   ├── PDFPageRenderer | ImageRenderer
            │       │   └── SectionOverlay (region drawing)
            │       └── OCRResultPanel (right sidebar)
            │
            ├── HistoryPage
            │   └── HistoryPanel
            │
            └── SettingsPage
                └── SettingsPanel
```

### 7.2 Component Responsibilities

| Component | Responsibility | Dependencies |
|-----------|---------------|--------------|
| `FileUpload` | File selection, drag & drop | `useDocument` |
| `DocumentViewer` | Container for page rendering | `documentStore`, `SectionOverlay` |
| `PDFPageRenderer` | Render PDF page to canvas | `pdfjs-dist` |
| `ImageRenderer` | Render image with zoom | - |
| `SectionPanel` | List sections, add/remove | `useSection`, `useOCR` |
| `SectionItem` | Display section, edit name | - |
| `SectionOverlay` | Draw region on document | `useSection` |
| `OCRResultPanel` | Show OCR result, copy/export | `sectionStore`, `ocrStore` |
| `SettingsPanel` | Configure app settings | `settingsStore` |
| `HistoryPanel` | List past extractions | API client |

---

## 8. Security Considerations

### 8.1 API Key Handling

```
┌─────────────┐                    ┌─────────────┐
│   Browser   │                    │   Backend   │
├─────────────┤                    ├─────────────┤
│             │  1. POST /ocr      │             │
│  Settings   │  { apiKey, image } │             │
│  Store      │ ──────────────────▶│  NVIDIA     │
│ (localStorage)                   │  Proxy      │
│             │                    │             │──▶ NVIDIA API
│             │  2. Response       │             │
│             │ ◀──────────────────│             │◀── Response
│             │  { text }          │             │
└─────────────┘                    └─────────────┘

Key points:
- API Key stored in browser localStorage (user's device only)
- Key sent to backend only when extracting
- Backend does NOT persist the key
- All NVIDIA API calls go through backend proxy
```

### 8.2 Input Validation

- File type validation (PDF, PNG, JPG, WEBP only)
- Image size limits (50MB max via Express body parser)
- API key format validation
- Region coordinates bounds checking

---

## 9. Performance Optimizations

### 9.1 Frontend

| Technique | Description |
|-----------|-------------|
| Lazy PDF rendering | Only render current page |
| Canvas caching | Cache rendered PDF pages |
| Debounced zoom | Prevent excessive re-renders |
| Virtualized lists | For long section/history lists (future) |
| Web Workers | PDF.js worker for parsing |

### 9.2 Backend

| Technique | Description |
|-----------|-------------|
| Connection pooling | SQLite WAL mode |
| Query indexing | Index on created_at |
| Response compression | gzip for large text responses |
| Request limiting | Prevent abuse (future) |

---

## 10. Testing Strategy

### 10.1 Unit Tests

- **Stores**: Test state mutations
- **Services**: Test business logic (image processing, OCR manager)
- **Hooks**: Test hook behavior with mocked stores

### 10.2 Integration Tests

- **API routes**: Test request/response cycles
- **Database**: Test migrations and queries
- **OCR flow**: End-to-end extraction (mocked API)

### 10.3 E2E Tests (Future)

- Complete user flows with Playwright
- File upload → region selection → extraction → history

---

## 11. Deployment Considerations

### 11.1 Development

```bash
# Start both frontend and backend
npm run dev

# Frontend: http://localhost:5173
# Backend:  http://localhost:3001
# Vite proxies /api/* to backend
```

### 11.2 Production (Future)

```
┌─────────────┐      ┌─────────────┐
│   Nginx /   │      │   Node.js   │
│   CDN       │─────▶│   Backend   │
│ (frontend)  │      │   (API)     │
└─────────────┘      └──────┬──────┘
                            │
                     ┌──────┴──────┐
                     │   SQLite    │
                     │   (file)    │
                     └─────────────┘
```

Options:
- Static frontend on Vercel/Netlify
- Backend on Railway/Fly.io
- SQLite volume for persistence

---

## 12. Extensibility

### 12.1 Adding a New OCR Provider

1. Create `packages/web/src/services/ocr/providers/NewProvider.ts`
2. Implement `OCRProvider` interface
3. Register with `OCRManager`:
   ```typescript
   ocrManager.registerProvider(new NewProvider());
   ```
4. Add backend route if needed
5. Update settings UI to allow provider selection

### 12.2 Adding New Export Formats

1. Add export function in `OCRResultPanel`
2. Implement format conversion (e.g., PDF, DOCX)
3. Add button to UI

### 12.3 Adding Section Features

The section model is designed for extension:
- **Grouping**: Add `groupId` field
- **Ordering**: Add `order` field
- **Templates**: Add `promptTemplate` field
- **Duplication**: Clone section with new ID

---

## 13. Decision Log

| Decision | Rationale | Alternatives Considered |
|----------|-----------|------------------------|
| npm workspaces | Simple monorepo, no extra tools | Turborepo, Nx, Lerna |
| Zustand | Lightweight, no boilerplate | Redux, Jotai, Recoil |
| shadcn/ui | Copy-paste, full control | MUI, Ant Design, Radix |
| SQLite | Embedded, no infra | PostgreSQL, MongoDB |
| Express | Mature, large ecosystem | Fastify, Hono, Koa |
| Tailwind v4 | Latest features, CSS-first | Styled-components, CSS modules |
| Sections as core | Organized multi-region extraction | Flat zone list, no grouping |

---

## 14. Glossary

| Term | Definition |
|------|------------|
| Section | Core abstraction containing a region, its crop, and OCR result |
| Region | Rectangular area selected on the document |
| OCR | Optical Character Recognition |
| NVIDIA Build | NVIDIA's platform for accessing AI models via API |
| Kimi 2.6 Vision | Vision model used for OCR |
| Proxy | Backend intermediary that forwards requests to external APIs |
