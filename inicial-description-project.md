# Desarrollo de una aplicación web para extracción inteligente de zonas de documentos PDF e imágenes

## Descripción del proyecto

El objetivo de este proyecto es desarrollar una aplicación web moderna
para visualizar documentos PDF e imágenes, permitir la selección de
zonas mediante una interfaz gráfica y extraer tanto la imagen
recortada como el texto contenido en ella utilizando OCR basado en
inteligencia artificial.

La aplicación se llamara ***Texctracto**, y deberá priorizar una experiencia de usuario fluida, una
arquitectura modular, código limpio y una estructura escalable que
facilite futuras ampliaciones y el mantenimiento del proyecto.

------------------------------------------------------------------------

# Stack tecnológico

La aplicación se desarrollará utilizando:

-   React
-   Vite
-   TypeScript
-   Tailwind CSS
-   shadcn/ui

Todas las nuevas funcionalidades deberán respetar esta arquitectura,
reutilizar componentes existentes y mantener una interfaz consistente.

------------------------------------------------------------------------

# Objetivos funcionales

-   Abrir documentos PDF e imágenes.
-   Visualizar documentos con navegación por páginas.
-   Zoom, desplazamiento y ajuste al tamaño de la pantalla.
-   Seleccionar zonas mediante un rectángulo interactivo.
-   Obtener el recorte exacto de la región seleccionada.
-   Ejecutar OCR sobre la región seleccionada.
-   Mostrar el texto reconocido.
-   Copiar o exportar los resultados.

------------------------------------------------------------------------

# OCR

El OCR deberá implementarse mediante una interfaz desacoplada
(`OCRProvider`) administrada por un `OCRManager`, de manera que el resto
de la aplicación sea independiente del proveedor utilizado.

La primera implementación utilizará Kimi 2.6 Vision mediante NVIDIA
Build.

La arquitectura deberá quedar preparada para incorporar futuros motores
OCR sin modificar la lógica principal de la aplicación.

------------------------------------------------------------------------

# Configuración

La aplicación contará con una sección de configuración desde donde el
usuario podrá administrar el comportamiento del OCR.

Inicialmente incluirá:

-   Activar o desactivar OCR.
-   Configurar la API Key de NVIDIA Build.
-   Validar la conexión.
-   Activar o desactivar el preprocesamiento de imágenes.

La estructura deberá diseñarse para permitir agregar nuevos proveedores
OCR y nuevas opciones sin modificar la interfaz existente.

------------------------------------------------------------------------

# Requisitos técnicos

-   Código limpio y mantenible.
-   Arquitectura modular.
-   Componentes reutilizables.
-   Uso de TypeScript en todo el proyecto.
-   Separación entre lógica de negocio y componentes visuales.
-   Alto rendimiento.
-   Fácil escalabilidad.

------------------------------------------------------------------------

# Principios de desarrollo

-   Evitar duplicación de código.
-   Priorizar componentes reutilizables.
-   Mantener una arquitectura desacoplada.
-   Documentar los módulos importantes.
-   Seguir buenas prácticas de React.
-   Evitar lógica de negocio dentro de los componentes de UI.
-   Priorizar mantenibilidad y rendimiento antes que soluciones rápidas.

------------------------------------------------------------------------

# Objetivo final

Construir una herramienta profesional para la extracción inteligente de
información desde documentos PDF e imágenes, priorizando precisión,
velocidad, facilidad de uso y una arquitectura preparada para crecer.

Aunque la primera versión utilizará Kimi 2.6 Vision mediante NVIDIA
Build como motor OCR, toda la aplicación deberá quedar preparada para
integrar nuevos proveedores en el futuro sin realizar cambios
importantes en la arquitectura.
