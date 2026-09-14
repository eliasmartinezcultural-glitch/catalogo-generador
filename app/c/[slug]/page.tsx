import { notFound } from "next/navigation";
import { headers } from "next/headers";
import type { CSSProperties } from "react";
import { cache } from "react";
import { instagramUsername, safeExternalUrl, whatsappPhone } from "../../../lib/catalog";
import { readCatalog } from "../../../lib/catalog-store";
import type { Catalog } from "../../../lib/catalog";

export const dynamic = "force-dynamic";

const getCatalog = cache(async (slug: string): Promise<Catalog | null> => readCatalog(slug));

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const c = await getCatalog(slug);
  if (!c) return { title: "Catálogo no encontrado" };
  const title = `${c.business} · Catálogo digital`;
  const description = c.description || `Conocé los productos y servicios de ${c.business}.`;
  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: "website",
      images: [{ url: `/c/${slug}/opengraph-image`, width: 1200, height: 630, alt: `Catálogo de ${c.business}` }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [`/c/${slug}/opengraph-image`],
    },
  };
}

export default async function PublicCatalog({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const c = await getCatalog(slug);
  if (!c) notFound();

  const requestHeaders = await headers();
  const host = requestHeaders.get("x-forwarded-host") || requestHeaders.get("host") || "localhost:3000";
  const protocol = requestHeaders.get("x-forwarded-proto") || "https";
  const shareUrl = `${protocol}://${host}/c/${slug}`;
  const shareText = `Mirá el catálogo de ${c.business}: ${shareUrl}`;
  const wa = whatsappPhone(c.whatsapp);
  const ig = instagramUsername(c.instagram);
  const web = safeExternalUrl(c.website);
  const cats = Array.from(new Set(c.items.map(x => (x.category || "").trim() || "General")));

  return <main className={`public-page ${c.template}`} style={{ "--primary": c.primary, "--secondary": c.secondary } as CSSProperties}>
    <article className="public-catalog">
      <header className="public-cover">
        <div className="public-brand">
          {c.logo ? <img src={c.logo} alt={`Logo de ${c.business}`} /> : <span>{(c.business || "N").slice(0, 1).toUpperCase()}</span>}
          <small>{c.subtitle || "Catálogo digital"}</small>
        </div>
        <small>CATÁLOGO DIGITAL · {new Date().getFullYear()}</small>
        <h1>{c.business}</h1>
        {c.description && <p>{c.description}</p>}
        <div className="public-contact">
          {wa && <a href={`https://wa.me/${wa}`} target="_blank" rel="noreferrer">WhatsApp</a>}
          {c.phone && <a href={`tel:${c.phone.replace(/[^\d+]/g, "")}`}>Llamar</a>}
          {ig && <a href={`https://instagram.com/${ig}`} target="_blank" rel="noreferrer">Instagram</a>}
          {web && <a href={web} target="_blank" rel="noreferrer">Web</a>}
          {c.location && <span>{c.location}</span>}
        </div>
      </header>
      <div className="public-body">
        <div className="share-strip">
          <span>Catálogo online · consultá directamente</span>
          <a className="share-action" href={`https://wa.me/?text=${encodeURIComponent(shareText)}`} target="_blank" rel="noreferrer">Compartir por WhatsApp</a>
        </div>
        {cats.map(cat => <section className="public-category" key={cat}>
          <h2>{cat}</h2>
          <div className="public-grid">
            {c.items.filter(i => (i.category || "General").trim() === cat).map(i => <article className="public-card" key={i.id}>
              <div className="public-image">
                {i.image ? <img src={i.image} alt={i.name} loading="lazy" /> : <span>{(i.name || "P").slice(0, 1).toUpperCase()}</span>}
              </div>
              <div className="public-card-body">
                {i.tag && <small>{i.tag}</small>}
                <h3>{i.name || "Producto o servicio"}</h3>
                {i.description && <p>{i.description}</p>}
                <div className="public-bottom">
                  <strong>{i.price || "Consultar"}</strong>
                  {wa && <a href={`https://wa.me/${wa}?text=${encodeURIComponent(`Hola, quiero consultar por ${i.name || "un producto"}.`)}`} target="_blank" rel="noreferrer">Consultar por WhatsApp →</a>}
                </div>
              </div>
            </article>)}
          </div>
        </section>)}
      </div>
      <footer className="public-footer">
        <strong>{c.business}</strong>
        <span>Catálogo online</span>
        {wa && <a href={`https://wa.me/${wa}`} target="_blank" rel="noreferrer">Consultar por WhatsApp</a>}
      </footer>
    </article>
    {wa && <div className="mobile-contact"><a href={`https://wa.me/${wa}?text=${encodeURIComponent(`Hola, quiero consultar por el catálogo de ${c.business}.`)}`} target="_blank" rel="noreferrer">Consultar por WhatsApp</a></div>}
  </main>;
}
