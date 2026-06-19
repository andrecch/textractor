# Extracto - Product Requirements Document (PRD)

## 1. Overview

**Product Name:** Extracto  
**Version:** 1.0 (MVP)  
**Date:** January 19, 2026  
**Status:** Planning

### 1.1 Product Vision

Extracto es una aplicación web profesional para la extracción inteligente de información desde documentos PDF e imágenes. Permite a los usuarios seleccionar zonas específicas de documentos y extraer el texto contenido mediante OCR basado en inteligencia artificial.

### 1.2 Problem Statement

Los usuarios necesitan extraer texto de regiones específicas de documentos PDF e imágenes de manera precisa y eficiente. Las herramientas actuales no ofrecen una experiencia fluida para:
- Visualizar documentos con navegación intuitiva
- Seleccionar zonas de interés de forma interactiva
- Ejecutar OCR de calidad sobre regiones específicas
- Administrar múltiples extracciones de forma organizada

### 1.3 Target Users

- Profesionales que trabajan con documentos escaneados
- Investigadores que necesitan extraer datos de papers y reportes
- Analistas que procesan facturas, contratos y documentos legales
- Cualquier usuario que necesite extraer texto de imágenes

---

## 2. Goals & Objectives

### 2.1 Primary Goals

1. **Experiencia de usuario fluida**: Interfaz intuitiva y responsiva
2. **Precisión en extracción**: OCR de alta calidad mediante IA
3. **Organización por secciones**: Sistema de secciones para múltiples regiones
4. **Arquitectura escalable**: Preparada para futuros proveedores OCR

### 2.2 Success Metrics

- Tiempo de extracción < 5 segundos por región
- Precisión OCR > 95% en texto impreso
- Cero pérdida de datos entre sesiones
- Satisfacción del usuario > 4/5 en usabilidad

---

## 3. Functional Requirements

### 3.1 Gestión de Documentos

| ID | Requisito | Prioridad |
|----|-----------|-----------|
| FR-001 | Abrir documentos PDF mediante selector de archivos | P0 |
| FR-002 | Abrir imágenes (PNG, JPG, WEBP) mediante selector de archivos | P0 |
| FR-003 | Cargar archivos mediante drag & drop | P0 |
| FR-004 | Visualizar documentos multipágina con navegación | P0 |
| FR-005 | Zoom in/out y ajuste a pantalla | P0 |
| FR-006 | Desplazamiento horizontal y vertical | P0 |

### 3.2 Sistema de Secciones

| ID | Requisito | Prioridad |
|----|-----------|-----------|
| FR-010 | Al abrir documento, crear automáticamente "Sección 1" | P0 |
| FR-011 | Sección inicial seleccionada por defecto | P0 |
| FR-012 | Renombrar secciones en cualquier momento | P0 |
| FR-013 | Crear nuevas secciones con botón "Agregar sección" | P0 |
| FR-014 | Nombres secuenciales: Sección 1, Sección 2, etc. | P0 |
| FR-015 | Solo una sección activa a la vez | P0 |
| FR-016 | Eliminar secciones existentes | P0 |
| FR-017 | Cada sección almacena: nombre, ID, región, coordenadas, imagen recortada, resultado OCR, estado | P0 |
| FR-018 | Secciones independientes entre sí | P0 |
| FR-019 | Cambiar de sección conserva todas las regiones | P0 |
| FR-020 | Al seleccionar sección, mostrar y permitir editar solo su región | P0 |

### 3.3 Selección de Regiones

| ID | Requisito | Prioridad |
|----|-----------|-----------|
| FR-030 | Dibujar rectángulo de selección sobre el documento | P0 |
| FR-031 | La región se asocia a la sección activa | P0 |
| FR-032 | Visualizar región de la sección activa sobre el documento | P0 |
| FR-033 | Redimensionar región arrastrando bordes/esquinas | P1 |
| FR-034 | Mover región arrastrando el interior | P1 |

### 3.4 OCR y Extracción

| ID | Requisito | Prioridad |
|----|-----------|-----------|
| FR-040 | Ejecutar OCR sobre región de la sección activa | P0 |
| FR-041 | Mostrar texto reconocido en panel de resultados | P0 |
| FR-042 | Copiar texto al portapapeles | P0 |
| FR-043 | Exportar resultado como archivo .txt | P0 |
| FR-044 | Preprocesamiento de imagen (escala de grises, contraste, brillo, binarización) | P0 |
| FR-045 | Indicador visual de estado: pendiente, procesando, éxito, error | P0 |

### 3.5 Configuración

| ID | Requisito | Prioridad |
|----|-----------|-----------|
| FR-050 | Activar/desactivar OCR globalmente | P0 |
| FR-051 | Configurar API Key de NVIDIA Build | P0 |
| FR-052 | Validar conexión con el proveedor OCR | P0 |
| FR-053 | Activar/desactivar preprocesamiento de imágenes | P0 |
| FR-054 | Cambiar idioma de la interfaz (ES/EN) | P0 |
| FR-055 | Persistir configuración en localStorage | P0 |

### 3.6 Historial

| ID | Requisito | Prioridad |
|----|-----------|-----------|
| FR-060 | Guardar extracciones en base de datos SQLite | P0 |
| FR-061 | Listar extracciones previas con metadatos | P0 |
| FR-062 | Ver detalle de extracción en modal | P0 |
| FR-063 | Exportar extracción del historial como .txt | P0 |
| FR-064 | Limpiar historial completo | P0 |

---

## 4. Non-Functional Requirements

### 4.1 Performance

| ID | Requisito | Target |
|----|-----------|--------|
| NFR-001 | Tiempo de carga de documento | < 2s para PDFs de 10 páginas |
| NFR-002 | Tiempo de respuesta OCR | < 5s por región |
| NFR-003 | Fluidez de navegación | 60 FPS en zoom/pan |
| NFR-004 | Tamaño de bundle | < 500KB gzipped |

### 4.2 Usability

| ID | Requisito |
|----|-----------|
| NFR-010 | Interfaz responsive (desktop-first) |
| NFR-011 | Soporte para teclado (atajos básicos) |
| NFR-012 | Feedback visual para todas las acciones |
| NFR-013 | Mensajes de error claros y accionables |

### 4.3 Maintainability

| ID | Requisito |
|----|-----------|
| NFR-020 | Código TypeScript estricto |
| NFR-021 | Separación clara entre UI y lógica de negocio |
| NFR-022 | Componentes reutilizables |
| NFR-023 | Arquitectura desacoplada para proveedores OCR |
| NFR-024 | Documentación de módulos importantes |

### 4.4 Security

| ID | Requisito |
|----|-----------|
| NFR-030 | API Key almacenada solo en localStorage del usuario |
| NFR-031 | Llamadas a API externas solo desde backend (proxy) |
| NFR-032 | No exponer API Key en logs o errores |

---

## 5. Technical Constraints

### 5.1 Tech Stack

**Frontend:**
- React 19
- Vite 6
- TypeScript 5
- Tailwind CSS 4
- shadcn/ui
- Zustand (state management)
- react-router-dom 7
- react-i18next
- pdfjs-dist

**Backend:**
- Express 4
- TypeScript 5
- better-sqlite3
- cors
- dotenv

**OCR:**
- Kimi 2.6 Vision via NVIDIA Build API

### 5.2 Architecture Decisions

1. **Monorepo con npm workspaces**: Frontend y backend en un solo repositorio
2. **Secciones como abstracción central**: Cada extracción vive dentro de una sección
3. **OCR desacoplado**: Interfaz `OCRProvider` para futuros proveedores
4. **Backend como proxy**: Todas las llamadas a APIs externas pasan por el backend
5. **SQLite para historial**: Base de datos embebida, sin infraestructura adicional

---

## 6. Out of Scope (MVP)

Las siguientes funcionalidades NO están incluidas en el MVP pero la arquitectura debe soportarlas:

- Autenticación de usuarios
- Múltiples proveedores OCR simultáneos
- Sincronización en la nube
- Colaboración en tiempo real
- Procesamiento por lotes
- Plantillas de extracción
- Exportación a múltiples formatos (solo .txt en MVP)
- Soporte móvil completo
- Modo offline

---

## 7. Future Enhancements (Post-MVP)

| Feature | Descripción | Prioridad |
|---------|-------------|-----------|
| Duplicar secciones | Copiar región y configuración a nueva sección | P2 |
| Reordenar secciones | Drag & drop para cambiar orden | P2 |
| Agrupar secciones | Categorías/folders para organizar | P3 |
| Reglas de procesamiento | Asociar prompts personalizados por sección | P2 |
| Exportación masiva | Exportar todas las secciones de una vez | P2 |
| Historial por documento | Filtrar historial por documento específico | P2 |
| Búsqueda en historial | Buscar texto en extracciones previas | P3 |
| Anotaciones | Añadir notas a las secciones | P3 |

---

## 8. Risks & Mitigations

| Riesgo | Impacto | Probabilidad | Mitigación |
|--------|---------|--------------|------------|
| API de NVIDIA Build inestable | Alto | Media | Arquitectura preparada para cambiar proveedor |
| Baja precisión OCR en ciertos documentos | Medio | Media | Preprocesamiento de imagen configurable |
| API Key expuesta accidentalmente | Alto | Baja | Proxy backend, validación de inputs |
| Performance con PDFs grandes | Medio | Media | Lazy loading de páginas, virtualización |
| Complejidad de estado con secciones | Medio | Media | Zustand con stores bien definidos |

---

## 9. Timeline (Estimated)

| Fase | Duración | Entregables |
|------|----------|-------------|
| Setup & Scaffolding | 1 día | Monorepo, frontend, backend |
| Core Features | 3 días | Viewer, secciones, selección |
| OCR Integration | 2 días | Provider, proxy, ejecución |
| Settings & History | 1 día | Panel settings, historial DB |
| Integration & QA | 1 día | Testing, fixes, polish |
| **Total** | **8 días** | **MVP completo** |

---

## 10. Acceptance Criteria

El MVP se considera completo cuando:

- [ ] Se puede abrir un PDF o imagen
- [ ] Se puede navegar entre páginas (PDF)
- [ ] Se puede hacer zoom y desplazamiento
- [ ] Al abrir documento, se crea "Sección 1" automáticamente
- [ ] Se pueden crear, renombrar y eliminar secciones
- [ ] Se puede dibujar una región en la sección activa
- [ ] Cambiar de sección muestra su región correspondiente
- [ ] Se puede ejecutar OCR sobre la región activa
- [ ] Se puede copiar y exportar el resultado
- [ ] La configuración se guarda y persiste
- [ ] Las extracciones se guardan en historial
- [ ] La interfaz funciona en español e inglés
- [ ] No hay errores de TypeScript
- [ ] El build se genera sin errores

---

## 11. Appendix

### 11.1 Glossary

- **Sección**: Unidad de extracción que contiene una región, su imagen recortada y el resultado OCR
- **Región**: Área rectangular seleccionada sobre el documento
- **OCR**: Optical Character Recognition - reconocimiento óptico de caracteres
- **NVIDIA Build**: Plataforma de NVIDIA para acceder a modelos de IA vía API

### 11.2 References

- [NVIDIA Build Documentation](https://docs.nvidia.com/nim/)
- [Kimi 2.6 Vision Model](https://build.nvidia.com/)
- [pdfjs-dist Documentation](https://mozilla.github.io/pdf.js/)
- [shadcn/ui Components](https://ui.shadcn.com/)
