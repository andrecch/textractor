# Plan de Mejoras — textractor

Plan paso a paso para mejorar rendimiento, seguridad y robustez.

---

## Fase 1: Seguridad (prioridad alta)

| # | Mejora | Archivo(s) | Que hacer |
|---|--------|-----------|-----------|
| 1.1 | **No exponer la API key** | `api/src/routes/config.ts` | Eliminar el campo `preview`. Retornar solo `{ hasKey: boolean }`. |
| 1.2 | **API key solo desde servidor** | `api/src/services/nvidiaBuild.ts:24` | Eliminar el fallback `apiKey \|\| process.env.NVIDIA_API_KEY`. La key solo debe vivir en `.env` del servidor. |
| 1.3 | **Eliminar apiKey del body** | `api/src/routes/ocr.ts`, `web/src/services/api.ts`, `web/src/hooks/useOCR.ts` | No enviar la API key desde el frontend. El backend la toma de `process.env`. Remover parametro `apiKey` en `ocrExtract()`. |
| 1.4 | **Restringir CORS** | `api/src/index.ts:18` | Cambiar `cors()` abierto por `cors({ origin: ['http://127.0.0.1:5173'] })` en dev, o variable de entorno `CORS_ORIGIN`. |
| 1.5 | **Rate limiting basico** | `api/src/index.ts` | Agregar `express-rate-limit` — ej. 20 req/min para `/api/ocr/extract`. |
| 1.6 | **DEBUG_OCR configurable** | 3 archivos | Cambiar `const DEBUG_OCR = true` a `process.env.DEBUG === 'true'` o similar en los 3 sitios. |

---

## Fase 2: Robustez (prioridad alta)

| # | Mejora | Archivo(s) | Que hacer |
|---|--------|-----------|-----------|
| 2.1 | **Path de DB estable** | `api/src/db/database.ts:12` | Usar `appRoot` o variable `DATA_DIR` en vez de path relativo que se rompe entre dev/build. Algo como `path.join(process.env.DATA_DIR ?? path.join(os.homedir(), '.textractor'), 'data')`. |
| 2.2 | **Graceful shutdown** | `api/src/index.ts` | Escuchar `SIGINT`/`SIGTERM`, cerrar el server y hacer `db.close()`. |
| 2.3 | **Validacion de input** | `api/src/routes/ocr.ts` | Validar: `imageBase64` no vacio, que empiece con `data:image/`, tamaño maximo ~5MB base64. Retornar 400 claro. |
| 2.4 | **Validacion de modelo** | `api/src/services/nvidiaBuild.ts` | No confiar en `modelId` del cliente. Validar contra un whitelist de modelos permitidos en el backend (no solo en el frontend). |
| 2.5 | **Timeout consistente** | `useOCR.ts:10` + `nvidiaBuild.ts:5` | Ambos definen `OCR_TIMEOUT_MS = 60000`. Unificar: el frontend deberia tener un timeout ligeramente mayor al backend (ej. 65s vs 60s) para que el backend siempre responda primero con error limpio. |
| 2.6 | **Error handler global Express** | `api/src/index.ts` | Agregar middleware de error al final: `(err, req, res, next) => { ... }` que capture errores no manejados y retorne JSON estructurado. |
| 2.7 | **Migraciones versionadas** | `api/src/db/database.ts` | No ejecutar `001_create_extractions.sql` a ciegas. Crear tabla `_migrations` y verificar cuales ya se corrieron antes de ejecutar. |

---

## Fase 3: Rendimiento (prioridad media)

| # | Mejora | Archivo(s) | Que hacer |
|---|--------|-----------|-----------|
| 3.1 | **Cache OCR — hash completo** | `api/src/services/ocrCache.ts:41-43` | Eliminar el truncamiento `slice(0, 1MB)`. Hashear la imagen completa para evitar colisiones. El costo de hash SHA-256 en strings grandes es minimo en Node. |
| 3.2 | **Adaptar calidad JPEG** | `web/src/hooks/useOCR.ts:87` | Usar calidad proporcional: si la imagen > 2MB, bajar a 0.6; si > 500KB, usar 0.75. El OCR no necesita alta fidelidad visual. |
| 3.3 | **Limpiar imageStore** | `web/src/stores/imageStore.ts` | Migrar a Zustand con `useSyncExternalStore` nativo. El store manual actual funciona pero es mas fragil y no se integra con devtools. |
| 3.4 | **PDF canvas — limitar memoria** | `web/src/services/pdfCache.ts:14` | `MAX_CACHED_CANVASES = 12` puede consumir mucha RAM en PDFs grandes. Agregar un limite de memoria total (ej. ~200MB) y contar bytes, no solo cantidad. |
| 3.5 | **Debounce en zona de dibujo** | `web/src/hooks/useArea.ts` | Ya usa RAF para el preview rect (bien). Pero el `useEffect` de crop/preprocess se dispara en cada cambio de `activeArea`. Agregar debounce de ~150ms al procesar imagen cuando se redimensiona la zona. |
| 3.6 | **Compresion de respuesta** | `api/src/index.ts:19` | Ya usa `compression()` (bien). Verificar que el `text` de OCR (que puede ser largo) se beneficie: agregar header `Content-Type: application/json; charset=utf-8`. |

---

## Fase 4: Calidad de codigo (prioridad media-baja, facilita mantenimiento)

| # | Mejora | Archivo(s) | Que hacer |
|---|--------|-----------|-----------|
| 4.1 | **Eliminar OCRManager/Providers muertos** | `web/src/services/ocr/` (todo el directorio) | `NvidiaBuildProvider`, `OCRManager`, `OCRProvider` (en services) no se usan. `useOCR.ts` llama directo a `ocrExtract()`. Eliminar o integrar correctamente. |
| 4.2 | **Eliminar tipos duplicados** | `web/src/types/ocr.ts` | `OCRProvider` en `types/ocr.ts` y `services/ocr/OCRProvider.ts` son identicos. Si se elimina 4.1, limpiar. |
| 4.3 | **Simplificar useOCR error handling** | `web/src/hooks/useOCR.ts` | Los 6 bloques de `wasCancelled`/`wasTimeout` (~40 lineas) se reducen a un helper `classifyAbort(signal)` que retorne `{ cancelled, timeout }` una sola vez. |
| 4.4 | **API de history consistente** | `api/src/routes/history.ts:55-57` | Siempre retornar formato paginado (`{ records, total, ... }`), sin el modo `paged=false` que retorna un array. |
| 4.5 | **Tipos compartidos** | Crear `packages/shared/` | `OCRRequest`, `OCRResponse`, `ExtractionRow` deberian estar en un paquete compartido para que web y api usen los mismos tipos sin duplicar. |
| 4.6 | **Testing minimo** | Crear `tests/` | Agregar al menos: test de migraciones, test de cache OCR (hit/miss/expiry), test de `cleanOcrResponse`, test de `sanitizeFileName`. Vitest para ambos paquetes. |

---

## Orden de ejecucion sugerido

```
1.1 -> 1.2 -> 1.3   (seguridad de API key, van juntos)
1.4 -> 1.5          (CORS + rate limit)
2.1 -> 2.2 -> 2.3   (robustez del backend)
2.6 -> 2.7          (error handler + migraciones)
3.1 -> 3.2          (rendimiento OCR, quick wins)
4.1 -> 4.2 -> 4.3   (limpieza de codigo muerto)
1.6, 2.4, 2.5       (items menores, en cualquier momento)
3.3 -> 3.4 -> 3.5   (rendimiento, mas involucrado)
4.4 -> 4.5 -> 4.6   (calidad + tests)
```

---

*Creado: 2026-07-22*
