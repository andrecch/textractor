# Proyecto Textractor

## Descripción
Aplicación Tauri para extracción inteligente de zonas de texto en documentos PDF e imágenes usando OCR con IA (NVIDIA Build / Kimi 2.6 Vision).

## Stack Tecnológico
- **Frontend:** React 19 + Vite + TypeScript
- **UI:** shadcn/ui + @base-ui/react + Tailwind CSS 4
- **Estado:** Zustand
- **Rutas:** react-router-dom v7
- **i18n:** react-i18next (español/inglés)
- **Backend:** Tauri (Rust)

## Funcionalidades Implementadas
- **Selección automática de texto:** Al editar nombres de secciones, el texto se selecciona automáticamente para facilitar la edición
- **Visualización de zonas:** Todas las zonas de extracción se muestran simultáneamente con colores distintos y etiquetas
- **Panel OCR reorganizado:** Dividido en dos secciones (Recorte de Imagen y Reconocimiento de Texto) con scroll independiente 50/50
- **Botón de extraer:** Movido del panel izquierdo al panel de Reconocimiento de Texto como botón con icono Play

## Estructura de Carpetas
```
packages/web/src/
├── components/
│   ├── document/       # Visor de documentos (PDFPageRenderer, ImageRenderer, DocumentViewer)
│   ├── ocr/            # Panel de resultados OCR (OCRResultPanel)
│   ├── section/        # Panel de secciones (SectionPanel, SectionItem, SectionOverlay)
│   ├── upload/         # Pantalla de bienvenida y carga (WelcomeScreen, FileUpload)
│   └── ui/             # Componentes shadcn/ui
├── hooks/              # Hooks personalizados (useSection, useOCR)
├── i18n/               # Traducciones (es.json, en.json)
├── pages/              # Páginas (ViewerPage)
├── services/           # Servicios (API, canvas, procesamiento de imagen)
├── stores/             # Stores Zustand (sectionStore, ocrStore, documentStore, settingsStore)
└── types/              # Tipos TypeScript (section.ts, ocr.ts)
```

## Convenciones Específicas
- Las coordenadas de zonas se almacenan en píxeles renderizados (no en coordenadas del documento natural)
- Los nombres de secciones por defecto son "Seccion 1", "Seccion 2", etc.
- El OCR usa `croppedImageRaw` (sin procesar) y `croppedImageProcessed` (preprocesada)
- Los estados de sección son: "empty" | "zone-defined" | "processing" | "extracted" | "error"
