# Incidente: OCR Timeouts y Conexión Prematura Cerrada

**Fecha:** 2026-07-07
**Estado:** Parcialmente resuelto (workaround aplicado)
**Severidad:** Alta (funcionalidad core no operativa)
**Componentes afectados:** Backend (`packages/api`), OCR service, Vite proxy

---

## Resumen Ejecutivo

El endpoint OCR del backend experimentaba timeouts de 60 segundos sin devolver resultados. Tras múltiples iteraciones de debugging, se descubrió que el problema raíz es que **`req.on("close")` se dispara prematuramente (~0.2s) en el backend**, abortando la llamada a NVIDIA API antes de que complete. Se aplicó un workaround que elimina el handler de `req.on("close")`, pero esto deja sin resolver la causa raíz del cierre prematuro de la conexión.

**Workaround actual:** Funciona, pero la cancelación real del cliente (cerrar pestaña) ya no detiene la llamada a NVIDIA API, desperdiciando recursos.

---

## Contexto del Proyecto

- **App:** Textractor - extracción de texto de imágenes/PDFs usando OCR con IA
- **Stack:** Monorepo con pnpm (`packages/web` + `packages/api`)
- **Proveedor OCR:** NVIDIA Build API
- **Modelo actual:** `nvidia/nemotron-ocr-v2` (migrado desde `moonshotai/kimi-k2.6` que fue deprecado el 2026-07-07)

---

## Cronología del Problema

### 1. Problema inicial: Kimi K2.6 deprecado
- NVIDIA Build notificó: "This API will be deprecated on 07/07/2026"
- El OCR dejó de funcionar completamente
- **Acción:** Migrar a `nvidia/nemotron-ocr-v2`

### 2. Migración a Nemotron OCR v2 - Timeout persiste
- Se actualizó `MODEL_ID` en `packages/api/src/services/nvidiaBuild.ts`
- Se mantuvo el endpoint Chat API (`integrate.api.nvidia.com/v1/chat/completions`)
- Resultado: Timeout de 60s sin respuesta

### 3. Descubrimiento: Endpoint incorrecto
- Se obtuvo código de ejemplo de NVIDIA para Nemotron OCR v2
- **Hallazgo crítico:** Nemotron OCR v2 usa un endpoint COMPLETAMENTE diferente:
  - **Chat API (incorrecto para CV):** `https://integrate.api.nvidia.com/v1/chat/completions`
  - **CV API (correcto para Nemotron OCR v2):** `https://ai.api.nvidia.com/v1/cv/nvidia/nemotron-ocr-v2`
- Payload también diferente: `{ input: [{ type: "image_url", url: "..." }] }` vs `{ model, messages, ... }`
- **Acción:** Se implementó lógica condicional CV/Chat en `nvidiaBuild.ts`

### 4. Problema nuevo: Conexión se cierra a los 0.2s
- Con el endpoint correcto, logs mostraban: "Request aborted by client" después de 0.2s
- Se probó con `curl` directo al backend (sin proxy de Vite) → **mismo problema**
- Se confirmó: **NO es problema del proxy de Vite**

### 5. Diagnóstico del `req.on("close")` prematuro
- Se agregó logging al handler `req.on("close")`
- Resultado: El evento se dispara a los 0.2s, ANTES de que la llamada a NVIDIA complete
- `res.writableEnded: false, res.headersSent: false` indica que el cliente está cerrando la conexión

### 6. Workaround aplicado
- Se eliminó el handler `req.on("close")` y el `AbortController` del route handler
- Ahora la llamada a NVIDIA API no se aborta prematuramente
- **Resultado:** OCR funciona correctamente

---

## Cambios Aplicados (Pendientes de Commit)

### 1. `packages/api/src/services/nvidiaBuild.ts`
- Agregada constante `CHAT_API_URL` y `CV_API_BASE`
- Agregado array `CV_MODELS = ["nvidia/nemotron-ocr-v2"]`
- Lógica condicional `isCVModel` que detecta si el modelo usa CV API
- Nueva función `extractTextFromCVResponse()` que parsea `data[0].text_detections[].text_prediction.text`
- Para CV API: URL es `https://ai.api.nvidia.com/v1/cv/{model}`, payload es `{ input: [{ type: "image_url", url: imageBase64 }] }`
- Para Chat API: mantiene formato OpenAI anterior

### 2. `packages/api/src/routes/ocr.ts`
- **Eliminado:** Handler `req.on("close")` que abortaba prematuramente
- **Eliminado:** `AbortController` que se pasaba a `callNvidiaBuildVision`
- **Comentado/Mantenido:** El catch de `AbortError` (ya no se dispara, pero se deja por seguridad)

### 3. `packages/web/src/components/history/HistoryPanel.tsx`
- Fix de anidación de botones: `DialogTrigger` ahora usa `render` prop pattern de base-ui
- Cambio: `<DialogTrigger render={<Button variant="ghost" size="sm" />}>` en lugar de envolver un Button

---

## Causa Raíz NO Resuelta

**Pregunta abierta:** ¿Por qué `req.on("close")` se dispara a los 0.2s en el backend cuando se hace una llamada a NVIDIA API?

**Hipótesis:**
1. El `fetch` a NVIDIA API está causando algún problema de recursos que cierra la conexión original
2. Hay un bug en `AbortSignal.any` o `AbortSignal.timeout` en Node.js 24.15.0
3. El `req.on("close")` se está disparando por una razón desconocida (posible bug de Node.js/Express)
4. Posible interacción entre el `fetch` a API externa y el ciclo de eventos de Node.js

**Lo que sabemos:**
- NO es problema del proxy de Vite (reproduce con curl directo)
- NO es problema de la API key (validación funciona en Settings)
- NO es problema del modelo (endpoint correcto está implementado)
- El `fetch` a NVIDIA API nunca completa antes de que se cierre la conexión

---

## Próximos Pasos para Diagnóstico Completo

### 1. Reproducir con logging detallado
Agregar try-catch alrededor del `fetch` en `nvidiaBuild.ts` para capturar el error exacto:

```typescript
try {
  const response = await fetch(apiUrl, { ... });
  // ... procesar respuesta
} catch (err) {
  if (DEBUG_OCR) {
    console.error(`[OCR-API] Fetch error:`, err);
    console.error(`[OCR-API] Error stack:`, err instanceof Error ? err.stack : 'N/A');
  }
  throw err;
}
```

### 2. Probar sin el `AbortSignal.timeout`
Verificar si el problema está en `AbortSignal.timeout(60000)` o en la combinación con `AbortSignal.any()`:

```typescript
// Temporal: remover el timeout para ver si el fetch completa
// const timeoutSignal = AbortSignal.timeout(OCR_TIMEOUT_MS);
// const combinedSignal = signal ? AbortSignal.any([signal, timeoutSignal]) : timeoutSignal;
const response = await fetch(apiUrl, {
  method: "POST",
  headers,
  body: JSON.stringify(payload),
  // signal: combinedSignal, // Comentado temporalmente
});
```

### 3. Probar con un modelo Chat API (no CV)
Cambiar temporalmente a un modelo que use Chat API (como `nvidia/llama-3.2-11b-vision-instruct`) y ver si el problema persiste. Esto aislaría si el problema es específico de CV API o general.

### 4. Verificar versión de Node.js
Confirmar que Node.js 24.15.0 no tiene bugs conocidos con `fetch` o `AbortSignal`. Considerar downgradear a Node.js 20 LTS si es necesario.

### 5. Investigar el comportamiento de `req.on("close")` en Node.js 24
Buscar issues conocidos en el repositorio de Node.js sobre `req.on("close")` disparándose prematuramente.

### 6. Probar con diferentes tamaños de imagen
Verificar si el problema es específico de imágenes pequeñas (19.9 KB) o si ocurre con cualquier tamaño.

---

## Solución Definitiva Propuesta

Una vez identificada la causa raíz, la solución debería:

1. **Restaurar el `req.on("close")` handler** para detectar cancelaciones reales del cliente
2. **Usar `res.writableEnded` y `res.headersSent`** como guards para evitar abortar prematuramente
3. **Enviar respuesta HTTP 499** cuando se detecta cancelación real del cliente
4. **Logging detallado** para monitorear el comportamiento en producción

```typescript
// Solución objetivo (no implementada aún)
const abortController = new AbortController();
let isClientDisconnected = false;

req.on("close", () => {
  // Solo abortar si el response no se ha enviado
  if (!res.headersSent && !res.writableEnded) {
    isClientDisconnected = true;
    abortController.abort();
  }
});

try {
  const text = await callNvidiaBuildVision(imageBase64, apiKey, model, abortController.signal);
  if (isClientDisconnected) {
    // Cliente se desconectó, no enviar respuesta
    return;
  }
  res.json({ text, provider: "nvidia-build" });
} catch (err) {
  if (err instanceof Error && err.name === "AbortError") {
    if (isClientDisconnected) {
      // Cancelación real del cliente, no enviar error
      return;
    }
    // Abort por timeout u otra razón
    res.status(500).json({ error: "OCR request timed out" });
  } else {
    res.status(500).json({ error: err.message });
  }
}
```

---

## Archivos de Referencia

- `packages/api/src/services/nvidiaBuild.ts` - Servicio de NVIDIA con lógica CV/Chat
- `packages/api/src/routes/ocr.ts` - Route handler (con workaround aplicado)
- `packages/web/src/components/history/HistoryPanel.tsx` - Fix de anidación de botones
- `packages/web/src/config/ocrModels.ts` - Lista de modelos disponibles
- `packages/web/src/components/settings/SettingsPanel.tsx` - Selector de modelo

## Commits Pendientes

Todos los cambios están en working tree, sin commit:
- `packages/api/src/routes/ocr.ts` (modificado)
- `packages/api/src/services/nvidiaBuild.ts` (modificado)
- `packages/web/src/components/history/HistoryPanel.tsx` (modificado)

---

## Comandos Útiles para Debugging

```powershell
# Probar endpoint OCR directamente con curl
curl -Method POST -Uri "http://127.0.0.1:3001/api/ocr/extract" -ContentType "application/json" -Body '{"imageBase64":"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg=="}'

# Ver logs del backend en tiempo real
# (depende de cómo se ejecute el backend)

# Verificar versión de Node.js
node --version
```

---

## Contexto Adicional

- **Fecha del deprecation de Kimi K2.6:** 2026-07-07 (mismo día que se reportó el problema)
- **API key:** Tier gratuito, validada en Settings
- **Tamaños de imagen probados:** 10KB - 150KB
- **Timeout configurado:** 60 segundos (frontend y backend)
- **Calidad JPEG:** 0.85 (85%)
