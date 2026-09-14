import { list, put } from "@vercel/blob";
import { normalizeCatalog, type Catalog } from "./catalog";

const PREFIX = "catalogs/";

export async function saveCatalog(slug: string, catalog: Catalog) {
  const payload = JSON.stringify({
    ...catalog,
    publishedAt: new Date().toISOString(),
    slug,
  });

  return put(`${PREFIX}${slug}.json`, payload, {
    access: "public",
    addRandomSuffix: false,
    contentType: "application/json; charset=utf-8",
    cacheControlMaxAge: 60,
  });
}

export async function readCatalog(slug: string): Promise<Catalog | null> {
  try {
    const result = await list({ prefix: `${PREFIX}${slug}.json`, limit: 1 });
    const file = result.blobs[0];
    if (!file) return null;

    const response = await fetch(file.url, { cache: "no-store" });
    if (!response.ok) return null;

    return normalizeCatalog(await response.json());
  } catch (error) {
    console.error("catalog read error", error);
    return null;
  }
}
