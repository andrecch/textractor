# Plan de Mejoras — textractor

Plan paso a paso para mejorar rendimiento, seguridad, robustez y calidad de codigo.

> **Rama de trabajo:** `improve/react-doctor` (basada en `main` @ `15c02b4`).
> **Baseline react-doctor:** `npx react-doctor@latest` (v0.9.13) sobre `@textractor/web` —
> **Score inicial: 56 / 100 Critical — 23 issues** (1 error, 22 warnings).
> **Estado 2026-09-05: 87 / 100 Great — 3 issues** (R2.3 pendiente de decision + 2 falsos
> positivos shadcn intocables). Categorias Security y Accessibility en cero.
> Reporte: https://react.doctor/share?p=%40textractor%2Fweb&s=56&e=1&w=22&f=12
> Nota: react-doctor solo puntua el frontend (`packages/web`). El backend (`packages/api`)
> se cubre con las fases 1-2 originales.

---

## Estado de las fases originales (reconciliado 2026-09-05)

| Item | Estado | Detalle |
|------|--------|---------|
| 1.1, 1.2, 1.3 (API key solo servidor) | **RECHAZADO** | Contradice la funcionalidad fusionada en `main` (API key dual: `.env` o front via SQLite) y la decision explicita del usuario. No implementar. |
| 1.4 CORS, 1.5 rate limit, 1.7 helmet | Pendiente | `api/src/index.ts` sigue con `cors()` abierto, sin rate limit ni helmet. |
| 1.6 DEBUG_OCR configurable | Pendiente | Sigue `const DEBUG_OCR = true` en `api/src/routes/ocr.ts:9`, `api/src/services/nvidiaBuild.ts:7`, `web/src/hooks/useOCR.ts:14`. |
| 2.1 Path de DB estable | Hecho (distinto) | Se implemento `TEXTRACTOR_DB_PATH` con default seguro en vez de `DATA_DIR`. |
| 2.2 Graceful shutdown | **Hecho** | `server.close()` + `closeDatabase()` en SIGINT/SIGTERM (`api/src/index.ts`). Verificado en vivo. |
| 2.3 Validacion de input OCR | Pendiente | `ocr.ts` solo verifica `imageBase64` presente. Falta: prefijo `data:image/`, tamaño maximo, 400 claro. |
| 2.4 Whitelist de modelos en backend | Pendiente (prioridad subida) | El backend acepta cualquier `modelId`. Tras el incidente del modelo retirado (410, 2026-08), validar contra lista del servidor con fallback al default. |
| 2.5 Timeout consistente | Pendiente | Ambos lados en 60000ms (`useOCR.ts:13`, `nvidiaBuild.ts:6`). El front debe ser ligeramente mayor (ej. 65s) para que el backend responda primero con error limpio. |
| 2.6 Error handler global Express | Pendiente | Las rutas tienen try/catch pero no hay middleware global ni ocultamiento de detalles en produccion. |
| 2.7 Migraciones versionadas | **Hecho** | Tabla `_migrations` + `002_create_settings.sql` en `main`. |
| 2.8 WAL checkpoint monitoring | Pendiente | Sin implementar. |
| 3.1 Hash completo en cache OCR | Pendiente | `ocrCache.ts:41-43` aun trunca a 1MB antes de hashear. |
| 3.2 Calidad JPEG adaptativa | Pendiente | `useOCR.ts:139` usa calidad fija `0.85`. Ref: linea correcta actual (el plan viejo decia `:87`). |
| 3.3 imageStore a Zustand vanilla | **Hecho (distinto)** | `imageStore.ts` ya es un store externo con `subscribe` consumido via `useSyncExternalStore` (`useAreaImage.ts`). Migrarlo a zustand/vanilla seria churn sin beneficio. No implementar. |
| 3.4 Limite de memoria en pdfCache | Pendiente | `pdfCache.ts:14` sigue contando canvases (`MAX_CACHED_CANVASES = 12`), no bytes. |
| 3.5 Debounce en zona de dibujo | Pendiente | Sin debounce en el crop/preprocess al redimensionar. |
| 4.1 Codigo muerto OCRManager/Providers | Pendiente | `NvidiaBuildProvider`, `OCRManager`, `services/ocr/OCRProvider.ts` siguen sin usarse. |
| 4.2 Tipos duplicados | Pendiente | `types/ocr.ts:1-5` duplica `OCRProvider`. Resolver junto a 4.1. |
| 4.3 Simplificar error handling en useOCR | Pendiente (mas urgente) | El catch crecio: ahora hay ramas Timeout, Abort, `OcrServerError`, `OcrModelRetiredError` + generico. Extraer `classifyAbort(signal)` y un mapeo error->mensaje. Hay 24 tests web como red de seguridad. |
| 4.4 History siempre paginada | Pendiente | `history.ts` aun tiene la rama `paged=false` que retorna array. |
| 4.5 Tipos compartidos | Pendiente | No existe `packages/shared` en `main` (solo existio en la rama `feat/improvement-plan`). Valorar alias de paths frente a paquete separado al implementar. |
| 4.6 Testing minimo | **Hecho (superado)** | API 14/14 + web 24/24 con Vitest/node:test. Mantener y extender por lote. |

---

## Fase 0: Hallazgos react-doctor (nuevo, ordenado por impacto en score)

Cada item fue verificado contra el codigo. Veredicto: **confirmado**, **revision-humana** o **falso-positivo**.
No suprimir reglas ni tocar configuracion: arreglar el codigo.

### R0 — Root route sin error boundary (el unico ERROR, confianza alta)

| | |
|---|---|
| Regla | `react-router-require-root-error-boundary` |
| Evidencia | `web/src/app/routes.tsx:27-36` — ninguna ruta define `errorElement`. Hay `Suspense` pero ningun boundary de errores: un throw en render deja la pagina en blanco. |
| Accion | `errorElement` en la ruta raiz (`AppLayout`) con componente que use `useRouteError` + boton de recuperacion (i18n). |
| Archivos | `web/src/app/routes.tsx`, nuevo `web/src/app/RootErrorBoundary.tsx`, claves i18n ES/EN. |

### R1 — Botones solo-icono sin nombre accesible ×8 (confianza alta, mecanico)

| | |
|---|---|
| Regla | `shadcn-icon-button-requires-label` |
| Evidencia | `AreaItem.tsx:92,103,124,135`, `AreaPanel.tsx:36`, `PageNavigation.tsx:14,26`, `HistoryPanel.tsx:162` — `size="icon"` con solo icono lucide, sin `aria-label`. |
| Accion | `aria-label={t(...)}` en los 8 + claves i18n ES/EN (`area.*`, `viewer.*`, `history.*`). |
| Nota | No inventar labels en ingles dentro del codigo: usar i18n (convencion del repo). |

### R2 — AreaItem: interaccion, IME y estado (confianza media-alta)

| # | Regla | Evidencia | Accion |
|---|-------|-----------|--------|
| R2.1 | `click-events-have-key-events` + `no-static-element-interactions` | `AreaItem.tsx:71-77` — `div` clicable sin `role`/`tabIndex`/teclado. Ojo: dentro hay `<button>`s reales, asi que NO convertir a `<button>` (anidado invalido). | `role="button" tabIndex={0}` + `onKeyDown` Enter/Espacio en el `div`, manteniendo `stopPropagation`. |
| R2.2 | `no-enter-submit-without-ime-composition-guard` | `AreaItem.tsx:63-66` — Enter guarda sin comprobar `e.nativeEvent.isComposing`. Rompe IME (japones/chino/coreano). | Guard de 1 linea: `if (e.nativeEvent.isComposing) return;`. |
### R2.3 — `autoEdit` (EXCEPCION JUSTIFICADA, no implementar — 2026-09-05)

| | |
|---|---|
| Regla | `no-adjust-state-on-prop-change` en `AreaItem.tsx:45-49` |
| Analisis | El efecto es necesario, no un bug: `AreaPanel` actualiza `newAreaId` en un efecto *posterior* al render donde nace el area, asi que el item monta con `autoEdit=false` y el prop flipa a `true` despues. Sin el efecto, el rename no se auto-abre al crear. No hay loop (el `setState` con el mismo valor no re-renderiza) ni cambio de comportamiento observable. |
| Alternativas descartadas | `key` con remontaje: pierde el texto a medio escribir si se crea un area mientras se renombra otra. Control total por el padre: rediseño del contrato `AreaPanel<->AreaItem`, churn injustificado para 1 warning benigno. |
| Decision | Se deja el codigo como esta. El warning permanecera en los rescans; es aceptado con evidencia. |

### R3 — FileUpload sin teclado (confianza alta)

| | |
|---|---|
| Regla | `no-static-element-interactions` |
| Evidencia | `FileUpload.tsx:56-68` — `div` con `onClick`+drop. El `<input type=file>` esta con `hidden` (no enfocable). Usuarios de teclado no pueden abrir archivos. |
| Accion | `role="button" tabIndex={0}` + `onKeyDown` Enter/Espacio -> `inputRef.click()` + `aria-label` i18n. |

### R4 — AreaOverlay: canvas sin semantica + iteraciones encadenadas

| # | Regla | Evidencia | Accion |
|---|-------|-----------|--------|
| R4.1 | `no-static-element-interactions` | `AreaOverlay.tsx:56-63` — superficie de dibujo con solo eventos de raton. | **Revision-humana**: es un canvas de dibujo, no un boton. No lleva handlers de teclado; lleva `role="application"` (o `img`) + `aria-label` descriptivo i18n. |
| R4.2 | `js-combine-iterations` | `AreaOverlay.tsx:43-45` — `.map().filter()` en cada render. | Un solo paso (`flatMap` o bucle). Trivial, sin cambio de comportamiento. |

### R5 — Funcion pura reconstruida por render (confianza alta, trivial)

| | |
|---|---|
| Regla | `prefer-module-scope-pure-function` |
| Evidencia | `HistoryPanel.tsx:70-78` — `handleExport` se recrea por render (no depende del estado del componente, solo del record). |
| Accion | Envolver en `useCallback` (o mover a modulo). Igual patron aplica a `buildImageFileName` en `OCRResultPanel.tsx:38` — incluirlo en el mismo lote. |

### R6 — Complejidad alta en componentes (confianza media)

| | |
|---|---|
| Regla | `no-high-complexity-react-function` ×2 |
| Evidencia | `OCRResultPanel.tsx:25` (229 lineas: 3 estados, copy/export/descargas) y `SettingsPanel.tsx:29` (secciones api-key + modelo + toggles; crecio tras la feature de API key). |
| Accion | Extraer subcomponentes sin cambiar comportamiento (ej. botones de export/descarga, secciones de settings). Lote separado por componente. |

### R7 — Simplificar useOCR (solapa con 4.3, confianza alta)

Ver 4.3 arriba. Receta: `classifyAbort(signal)` + tabla error->mensaje usando los deps ya inyectables (`getTimeoutMessage`, `getServerDownMessage`, `getModelRetiredMessage`). Los 24 tests web cubren la regresion.

### R8 — Exports no-componente en ui/* (FALSO POSITIVO, no tocar)

| | |
|---|---|
| Regla | `only-export-components` ×2 |
| Evidencia | `button.tsx:58` (`buttonVariants`), `tabs.tsx:82` — patron canonico de shadcn. Cambiarlo divergiria del upstream sin beneficio. |

### R9 — pnpm hardening (HECHO 2026-09-05, score 62 -> 85)

| | |
|---|---|
| Regla | `require-pnpm-hardening` ×2 (exigia `minimumReleaseAge` + `trustPolicy`) |
| Hallazgo clave | Habia **tres** `pnpm-workspace.yaml` (raiz + `packages/web` + `packages/api`). El escaner lee el del proyecto (`web`), que no tenia hardening. Peor: los anidados decian `allowBuilds: false` contradiciendo el `true` de la raiz — una mina: correr `pnpm install` dentro de un paquete bloquearia el build de better-sqlite3/esbuild. |
| Accion | `minimumReleaseAge: 1440` + `trustPolicy: no-downgrade` en la raiz; **eliminados los dos `pnpm-workspace.yaml` anidados** (`git rm`, venian de `61b58fc`, nada dependia de ellos). |
| Incidente en verificacion | `trustPolicy` rechazo el lockfile: `semver@6.3.1` (pin legitimo de `@babel/core` via `helper-compilation-targets`, rango `^6.3.0`, integrity fijado). Override a v7 descartado (riesgo en babel). Solucion: `trustPolicyExclude: [semver@6.3.1]` documentado. `CI=true pnpm install --frozen-lockfile` pasa (616 entradas). |

---

## Orden de ejecucion sugerido (revisado)

```
R0 (unico error)
R1 (8 a11y mecanicos, mismo lote + i18n)
R2.2 -> R2.1 -> R3 (interacciones; R2.3 con revision humana al final del lote)
R4.2 -> R4.1 -> R5 (micro-rendimiento + canvas)
R7 (+ 4.3, mismo lote: useOCR)
R6 (un componente por lote: OCRResultPanel, luego SettingsPanel)
R9 (config pnpm)
1.6 (DEBUG_OCR) -> 2.5 (timeout 65s front)
2.3 -> 2.4 (validacion input + whitelist; 2.4 con test de modelo retirado)
2.6 (error handler global) -> 1.4 -> 1.5 -> 1.7 (CORS + rate limit + helmet)
3.1 -> 3.2 (rendimiento OCR, quick wins)
4.1 -> 4.2 (codigo muerto) -> 4.4 (history paginada)
3.4 -> 3.5 (pdfCache memoria + debounce zona)
4.5 (tipos compartidos; decidir alias vs paquete)
2.8 (WAL checkpoint; ultimo: perf fina de BD)
```

Items 1.1-1.3, 2.1, 2.2, 2.7, 3.3, 4.6 no se ejecutan (hechos o rechazados, ver tabla de estado).

---

## Reglas de ejecucion (obligatorias por lote)

- Un lote = una familia de reglas. Commits pequeños con conventional commits (`fix(web): ...`).
- `npx react-doctor@latest --verbose --scope changed` antes y despues de cada lote + tests del paquete afectado despues de cada lote.
- Verificar cada hallazgo contra el codigo antes de tocarlo; lo marcado `revision-humana` se pregunta antes de editar.
- Reglas del repo: i18n para todo texto visible, TypeScript estricto, sin comentarios salvo peticion, sin commit/push sin confirmacion explicita.
- Si un fix requiere decision de API/UX/arquitectura, se detiene y se pregunta.
- Objetivo: subir el score 56/100 re-ejecutando `npx react-doctor@latest` al final de cada lote.

---

## Notas tecnicas

- **Express 4.21** (no 5.x): Los handlers async necesitan `try/catch` manualmente. Validar que todas las rutas async sigan el patron.
- **React Router v7** (`react-router-dom`): el error boundary de R0 usa `errorElement` + `useRouteError` (no confundir con `ErrorBoundary` de React 19 para otros casos).
- **Zustand v5**: los stores ya exponen `getState()`; para logica fuera de React se sigue usando `store.getState()`, no nuevos hooks.
- **better-sqlite3**: statements preparados una sola vez a nivel de modulo y reutilizados (fix del crash nativo, `main` @ `01dd77e`). No reintroducir `db.prepare()` por llamada.
- **shadcn/base-ui**: no renombrar ni reestructurar `ui/*`; los exports auxiliares (`buttonVariants`, etc.) son patron upstream (R8).
- **MCP context7**: no fue necesario para este plan (APIs estandar verificadas en codigo). Usar bajo demanda en implementacion si alguna regla requiere sintaxis vigente (ej. R0 con react-router v7, R9 con pnpm v11).

---

*Creado: 2026-07-22*
*Actualizado: 2026-09-05* (baseline react-doctor 56/100 + reconciliacion con `main`)
