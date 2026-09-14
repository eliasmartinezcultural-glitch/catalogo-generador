import { put } from "@vercel/blob";
import { NextResponse } from "next/server";

function slugify(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 48) || "catalogo";
}

export async function POST(request: Request) {
  try {
    const catalog = await request.json();
    if (!catalog?.business || !Array.isArray(catalog.items)) {
      return NextResponse.json({ error: "Catálogo inválido" }, { status: 400 });
    }

    const slug = `${slugify(String(catalog.business))}-${crypto.randomUUID().slice(0, 8)}`;
    const payload = JSON.stringify({ ...catalog, publishedAt: new Date().toISOString(), slug });

    const blob = await put(`catalogs/${slug}.json`, payload, {
      access: "public",
      addRandomSuffix: false,
      contentType: "application/json; charset=utf-8",
      cacheControlMaxAge: 60,
    });

    return NextResponse.json({ slug, url: `/c/${slug}`, blobUrl: blob.url });
  } catch (error) {
    console.error("catalog publish error", error);
    return NextResponse.json({ error: "No se pudo publicar. Verificá Vercel Blob." }, { status: 500 });
  }
}
