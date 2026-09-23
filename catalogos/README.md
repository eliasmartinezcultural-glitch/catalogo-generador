# Publicaciones

Las publicaciones reales son archivos estáticos dentro de `catalogos/<slug>/index.html`.

GitHub Pages publica archivos estáticos directamente desde el repositorio. Esto permite que cada catálogo tenga una URL estable y que el HTML contenga title, description y Open Graph desde el servidor, en lugar de depender de un hash del navegador.

La siguiente etapa de infraestructura es conectar el botón Publicar de la fábrica con un proceso autorizado de escritura/compilación que genere automáticamente esa carpeta.

Referencia: GitHub Pages publica archivos estáticos que se incorporan al repositorio.