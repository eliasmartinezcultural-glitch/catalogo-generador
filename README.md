# Catalogo Express

## V1.1.0 · Fábrica privada

Herramienta interna de Ocarina para que **Elías produzca catálogos profesionales de forma rápida y sencilla**.

No es un producto para clientes ni un constructor público.

### Principio rector

**Complejidad en el motor. Simplicidad en el frente.**

Flujo de producción:

**Elegir base → cargar negocio → cargar productos → revisar → compartir**

### Esta versión agrega

- Identificación visible de versión: V1.1.0.
- Modelo de datos versionado y normalizado.
- Persistencia local más robusta.
- Indicador interno de preparación del catálogo.
- Duplicación rápida de productos.
- Protección para no dejar el catálogo sin productos.
- Identidad explícita de fábrica privada.
- Vista previa separada conceptualmente de la edición.
- Sin backend.
- Sin Vercel.
- GitHub Pages como destino.

### Regla de desarrollo

La rama `freeze/v1-funcional` conserva la V1 funcional original y no debe modificarse.

Todo desarrollo nuevo ocurre en `main`.

No se agregan funciones por cantidad. Cada capa debe mejorar velocidad de producción, calidad visual, reutilización, robustez o capacidad comercial de los catálogos.

### Versionado

- **V1.0.0** — base funcional congelada.
- **V1.1.0** — consolidación de la fábrica privada y núcleo de producción.
