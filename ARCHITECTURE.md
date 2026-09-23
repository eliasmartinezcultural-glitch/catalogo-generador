# Catálogo Generador — arquitectura v2

## Principio
**Complejidad interna / simplicidad externa.**

La interfaz expone solo cuatro acciones: editar negocio, editar productos, agregar producto y compartir. El sistema interno separa datos, persistencia, codificación, validación y presentación.

## Capas
- `core/schema.js`: contrato de datos, versión, límites y normalización.
- `core/store.js`: estado único, persistencia local y suscripciones.
- `core/codec.js`: serialización segura del catálogo dentro del enlace compartido.
- `core/validate.js`: reglas antes de publicar/compartir.
- `ui/render.js`: presentación y sanitización HTML.
- `app.js`: orquestador mínimo de interfaz.
- `index.html`: superficie comercial.
- `styles.css`: sistema visual.

## Reglas estructurales
1. La UI nunca modifica datos sin pasar por el store.
2. Los datos entrantes se normalizan antes de usarse.
3. Los enlaces compartidos llevan versión de esquema para permitir migraciones futuras.
4. El catálogo no depende de servidor, login ni base de datos.
5. La validación bloquea compartir cuando falta información comercial esencial.
6. Los nombres y textos renderizados se escapan para evitar inyección HTML.
7. Los límites evitan catálogos absurdamente grandes.
8. El motor está preparado para incorporar después plantillas, imágenes, categorías, horarios, métricas y otros productos sin rehacer la base.

## Próxima expansión
El siguiente salto no debe complicar la pantalla principal. Debe agregar capacidades detrás de las mismas acciones:
- motor de plantillas visuales;
- imágenes por producto;
- categorías;
- configuración de CTA;
- exportación/duplicación;
- migraciones de esquema;
- analítica opcional;
- sistema de presets para fabricar rápidamente catálogos de clientes.

## Regla comercial
Un operador debería poder producir un catálogo terminado en minutos, sin entender la arquitectura interna.
