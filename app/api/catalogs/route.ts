import { put } from "@vercel/blob";
import { NextResponse } from "next/server";
import { normalizeCatalog, slugify } from "../../../lib/catalog";

export const runtime = "nodejs";

function errorMessage(error: unknown) {
  if (error instanceof Error) return error.message;
  if (typeof error === "string") return error;
  try { return JSON.stringify(error); } catch { return "Error desconocido"; }
}

export async function POST(request: Request) {
  try {
    const input = await request.json();
    const catalog = normalizeCatalog(input);
    if (!catalog?.business) {
      return NextResponse.json({ error: "Completá el nombre del negocio." }, { status: 400 });
    }
    if (!catalog.whatsapp.trim()) {
      return NextResponse.json({ error: "Agregá un WhatsApp para que los clientes puedan consultar." }, { status: 400 });
    }
    if (!catalog.items.length) {
      return NextResponse.json({ error: "Agregá al menos un producto o servicio." }, { status: 400 });
    }

    const slug = `${slugify(catalog.business)}-${crypto.randomUUID().slice(0, 8)}`;
    const payload = JSON.stringify({ ...catalog, publishedAt: new Date().toISOString(), slug });

    const blob = await put(`catalogs/${slug}.json`, payload, {
      access: "public",
      addRandomSuffix: false,
      contentType: "application/json; charset=utf-8",
      cacheControlMaxAge: 60,
    });

    return NextResponse.json({ slug, url: `/c/${slug}`, blobUrl: blob.url });
  } catch (error) {
    const detail = errorMessage(error);
    console.error("catalog publish error", detail, error);
    return NextResponse.json({ error: "No se pudo publicar el catálogo.", detail }, { status: 500 });
  }
}
