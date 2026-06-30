<div align="center">

# Textractor

**Extracción inteligente de texto desde PDF e imágenes mediante OCR con IA**

[![ES](https://img.shields.io/badge/Leer%20en-Español-red?style=for-the-badge)](#espanol)
[![EN](https://img.shields.io/badge/Read%20in-English-blue?style=for-the-badge)](#english)

</div>

> **Idiomas disponibles:** [English](#english) · [Español](#espanol)

---

<a id="english"></a>

## 🇬🇧 English

### About

Textractor is a modern web application for **intelligently extracting text from specific zones of PDF documents and images** using AI-powered OCR.

Open a file, draw a rectangle over the area of interest, and Textractor crops that zone and runs OCR on it — keeping every extraction organized in **Sections**. The first implementation uses **Kimi 2.6 Vision** via **NVIDIA Build**, but the OCR layer is fully decoupled (`OCRProvider` / `OCRManager`) so new engines can be added without touching the UI.

### Features

- 📄 **Document viewer** for PDF and images (PNG, JPG, WEBP) with multi-page navigation
- 🔍 **Zoom and pan** with smooth controls
- ✂️ **Interactive zone selection** with drag-to-draw rectangles
- 🗂️ **Sections** to organize multiple extractions in the same document
- 🤖 **OCR via AI** (Kimi 2.6 Vision · NVIDIA Build), with optional image preprocessing
- 🌍 **Bilingual interface** (Spanish / English)
- 🕓 **History** of all extractions, persisted in SQLite
- ⚙️ **Configurable settings** stored in `localStorage`

### Screenshots

> 📌 *Placeholders — replace with real captures when available.*

| Viewer | History | Settings |
| :---: | :---: | :---: |
| _Screenshot: viewer with zone selection and OCR result_ | _Screenshot: history panel_ | _Screenshot: settings page_ |

### Tech Stack

**Frontend** (`packages/web`)
- React 19 · Vite 6 · TypeScript 5
- Tailwind CSS 4 · shadcn/ui
- Zustand (state) · react-router-dom 7
- react-i18next (i18n) · pdfjs-dist

**Backend** (`packages/api`)
- Node.js · Express 4 · TypeScript 5
- better-sqlite3 (history) · dotenv

**OCR**
- Kimi 2.6 Vision via NVIDIA Build API (proxied through the backend)

### System Requirements

**Required**
- **Node.js ≥ 20** (LTS 20, 22 or 24 recommended)
- **pnpm ≥ 9** (this project uses `pnpm-lock.yaml`)
- **NVIDIA Build API key** with access to the Kimi 2.6 Vision model

**Only if prebuilt binaries are not available for your platform**
- Windows: **MSVC Build Tools** (Visual Studio Build Tools with the "Desktop development with C++" workload)
- macOS: **Xcode Command Line Tools** (`xcode-select --install`)
- Linux: **build-essential** (`gcc`, `g++`, `make`) and **Python 3**
- These are only needed as a fallback for `better-sqlite3` (and similar native modules) when no prebuilt `.node` binary is published for your OS / architecture / Node version. On mainstream platforms (Windows x64, macOS x64/arm64, Linux x64/arm64) with a current Node LTS, **no compilation is required** — prebuilt binaries are downloaded automatically.

> 💡 *Tip:* if you don't want to manage the pnpm version manually, you can use Corepack (`corepack enable`).

### Installation

```bash
# 1. Clone the repository
git clone https://github.com/andrecch/textractor.git
cd textractor

# 2. Install dependencies
pnpm install

# 3. Configure environment variables
cp .env.example .env
# Edit .env and add your NVIDIA API key:
#   NVIDIA_API_KEY=nvapi-...

# 4. Start the dev servers (web + api in parallel)
pnpm dev
```

After starting:

- Frontend: <http://localhost:5173>
- Backend: <http://localhost:3001>

Vite automatically proxies `/api/*` requests to the backend.

### Available Scripts

| Script | Description |
| --- | --- |
| `pnpm dev` | Starts web (Vite) and API (tsx watch) in parallel |
| `pnpm dev:web` | Starts only the frontend |
| `pnpm dev:api` | Starts only the backend |
| `pnpm build` | Production build of both packages |
| `pnpm build:web` | Build only the frontend |
| `pnpm build:api` | Build only the backend |
| `pnpm lint` | Run ESLint on both packages |

### Quick Usage

1. Open the app and **load a PDF or image** (file picker or drag & drop).
2. The first **Section** is created automatically — type a name for it if you want.
3. **Draw a rectangle** over the area you want to extract.
4. Click **Extract** to run OCR on that zone.
5. **Copy** the text or **export** it as `.txt`.
6. Add more sections for other zones of the document.
7. Find every extraction later in the **History** page.

### Project Structure

```
textractor/
├── packages/
│   ├── web/          # React + Vite frontend
│   └── api/          # Express backend + SQLite
├── docs/             # PRD, architecture, plans
├── .env.example      # Environment variables template
└── package.json      # Root workspace config
```

For deeper details, see [`docs/PRD.md`](docs/PRD.md) and [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md).

---

<a id="espanol"></a>

## 🇪🇸 Español

### Acerca de

Textractor es una aplicación web moderna para **extraer texto de forma inteligente desde zonas específicas de documentos PDF e imágenes** usando OCR con IA.

Abre un archivo, dibuja un rectángulo sobre la zona de interés y Textractor recorta esa zona y ejecuta OCR sobre ella, manteniendo cada extracción organizada en **Secciones**. La primera implementación utiliza **Kimi 2.6 Vision** a través de **NVIDIA Build**, pero la capa de OCR está completamente desacoplada (`OCRProvider` / `OCRManager`), por lo que se pueden añadir nuevos motores sin tocar la interfaz.

### Características

- 📄 **Visor de documentos** PDF e imágenes (PNG, JPG, WEBP) con navegación multipágina
- 🔍 **Zoom y desplazamiento** con controles fluidos
- ✂️ **Selección interactiva de zonas** con rectángulos arrastrables
- 🗂️ **Secciones** para organizar múltiples extracciones en el mismo documento
- 🤖 **OCR con IA** (Kimi 2.6 Vision · NVIDIA Build), con preprocesamiento de imagen opcional
- 🌍 **Interfaz bilingüe** (Español / Inglés)
- 🕓 **Historial** de todas las extracciones, persistido en SQLite
- ⚙️ **Configuración personalizable** guardada en `localStorage`

### Capturas de pantalla

> 📌 *Marcadores — reemplaza con capturas reales cuando estén disponibles.*

| Visor | Historial | Configuración |
| :---: | :---: | :---: |
| _Captura: visor con selección de zona y resultado OCR_ | _Captura: panel de historial_ | _Captura: página de configuración_ |

### Stack Tecnológico

**Frontend** (`packages/web`)
- React 19 · Vite 6 · TypeScript 5
- Tailwind CSS 4 · shadcn/ui
- Zustand (estado) · react-router-dom 7
- react-i18next (i18n) · pdfjs-dist

**Backend** (`packages/api`)
- Node.js · Express 4 · TypeScript 5
- better-sqlite3 (historial) · dotenv

**OCR**
- Kimi 2.6 Vision vía API de NVIDIA Build (proxificado a través del backend)

### Requisitos del sistema

**Obligatorios**
- **Node.js ≥ 20** (se recomienda LTS 20, 22 o 24)
- **pnpm ≥ 9** (este proyecto usa `pnpm-lock.yaml`)
- **API key de NVIDIA Build** con acceso al modelo Kimi 2.6 Vision

**Solo si los prebuilt binaries no están disponibles para tu plataforma**
- Windows: **MSVC Build Tools** (Visual Studio Build Tools con la carga de trabajo "Desarrollo para escritorio con C++")
- macOS: **Xcode Command Line Tools** (`xcode-select --install`)
- Linux: **build-essential** (`gcc`, `g++`, `make`) y **Python 3**
- Esto solo se necesita como fallback para `better-sqlite3` (y módulos nativos similares) cuando no exista un binario precompilado `.node` para tu SO / arquitectura / versión de Node. En plataformas comunes (Windows x64, macOS x64/arm64, Linux x64/arm64) con un Node LTS actual, **no se requiere compilar nada** — los prebuilt se descargan automáticamente.

> 💡 *Tip:* si no quieres gestionar la versión de pnpm manualmente, puedes usar Corepack (`corepack enable`).

### Instalación

```bash
# 1. Clonar el repositorio
git clone https://github.com/andrecch/textractor.git
cd textractor

# 2. Instalar dependencias
pnpm install

# 3. Configurar variables de entorno
cp .env.example .env
# Edita .env y agrega tu API key de NVIDIA:
#   NVIDIA_API_KEY=nvapi-...

# 4. Iniciar los servidores de desarrollo (web + api en paralelo)
pnpm dev
```

Una vez iniciado:

- Frontend: <http://localhost:5173>
- Backend: <http://localhost:3001>

Vite redirige automáticamente las peticiones `/api/*` al backend.

### Scripts disponibles

| Script | Descripción |
| --- | --- |
| `pnpm dev` | Inicia web (Vite) y API (tsx watch) en paralelo |
| `pnpm dev:web` | Inicia solo el frontend |
| `pnpm dev:api` | Inicia solo el backend |
| `pnpm build` | Build de producción de ambos paquetes |
| `pnpm build:web` | Build solo del frontend |
| `pnpm build:api` | Build solo del backend |
| `pnpm lint` | Ejecuta ESLint en ambos paquetes |

### Uso rápido

1. Abre la app y **carga un PDF o imagen** (selector de archivos o drag & drop).
2. La primera **Sección** se crea automáticamente — cámbiale el nombre si lo deseas.
3. **Dibuja un rectángulo** sobre la zona que quieres extraer.
4. Pulsa **Extraer** para ejecutar OCR sobre esa zona.
5. **Copia** el texto o **expórtalo** como `.txt`.
6. Agrega más secciones para otras zonas del documento.
7. Encuentra todas las extracciones después en la página de **Historial**.

### Estructura del proyecto

```
textractor/
├── packages/
│   ├── web/          # Frontend React + Vite
│   └── api/          # Backend Express + SQLite
├── docs/             # PRD, arquitectura, planes
├── .env.example      # Plantilla de variables de entorno
└── package.json      # Configuración de workspaces raíz
```

Para más detalle, consulta [`docs/PRD.md`](docs/PRD.md) y [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md).
