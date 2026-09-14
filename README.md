# Catálogo Studio

Generador web de catálogos profesionales, personalizados y operativos para emprendimientos, comercios, empresas y profesionales.

## Objetivo

La aplicación no está pensada como un simple diseño de catálogo. El núcleo es un constructor editable que permite:

- definir identidad y datos comerciales;
- crear productos y servicios;
- agrupar por categorías;
- modificar colores y plantilla;
- ver cambios en tiempo real;
- guardar el trabajo localmente;
- importar/exportar el catálogo como JSON;
- imprimir o generar PDF desde el navegador.

## Stack

- Next.js + React + TypeScript
- CSS propio, sin dependencia visual externa
- Persistencia inicial con `localStorage`
- Preparado para desplegar en Vercel

## Arquitectura por etapas

### V1 — Constructor local

Es la versión inicial funcional. Prioriza el motor de edición y la representación visual antes de sumar infraestructura innecesaria.

### V2 — Catálogos publicados

El siguiente salto debe incorporar persistencia remota y URLs públicas para que un catálogo pueda abrirse desde cualquier dispositivo. La aplicación deberá separar claramente:

- editor privado;
- modelo de catálogo;
- renderer público;
- almacenamiento;
- publicación.

### V3 — Producto comercial

Funciones posibles: cuentas de clientes, múltiples catálogos, duplicación, plantillas profesionales, QR, enlaces de contacto, dominio personalizado, analítica y planes comerciales.

## Regla de desarrollo

Cada intervención debe aumentar la capacidad real del producto. Primero funcionalidad y arquitectura; después refinamiento visual.
