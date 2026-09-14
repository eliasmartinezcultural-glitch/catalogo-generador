import { list } from "@vercel/blob";
import { notFound } from "next/navigation";

export const dynamic = "force-dynamic";

type Item = { id:string; name:string; description:string; price:string; category:string; image:string; tag:string };
type Catalog = { business:string; subtitle:string; description:string; logo:string; phone:string; whatsapp:string; instagram:string; website:string; location:string; primary:string; secondary:string; template:"elegante"|"comercial"|"minimal"; items:Item[] };

async function getCatalog(slug: string): Promise<Catalog | null> {
  const result = await list({ prefix: `catalogs/${slug}.json`, limit: 1 });
  const file = result.blobs[0];
  if (!file) return null;
  const response = await fetch(file.url, { cache: "no-store" });
  if (!response.ok) return null;
  return response.json();
}

function cleanPhone(v:string){ return v.replace(/[^\d]/g, ""); }

export default async function PublicCatalog({ params }: { params: Promise<{ slug:string }> }) {
  const { slug } = await params;
  const c = await getCatalog(slug);
  if (!c) notFound();
  const wa = cleanPhone(c.whatsapp || "");
  const ig = (c.instagram || "").replace(/^@/, "");
  const cats = Array.from(new Set(c.items.map(x => x.category.trim() || "General")));

  return <main className={`public-page ${c.template}`} style={{"--primary":c.primary,"--secondary":c.secondary} as React.CSSProperties}>
    <article className="public-catalog">
      <header className="public-cover">
        <div className="public-brand">{c.logo ? <img src={c.logo} alt={`Logo de ${c.business}`} /> : <span>{(c.business || "N").slice(0,1).toUpperCase()}</span>}<small>{c.subtitle || "Catálogo digital"}</small></div>
        <small>CATÁLOGO DIGITAL · {new Date().getFullYear()}</small>
        <h1>{c.business}</h1>
        <p>{c.description}</p>
        <div className="public-contact">
          {wa && <a href={`https://wa.me/${wa}`} target="_blank" rel="noreferrer">WhatsApp</a>}
          {c.phone && <a href={`tel:${cleanPhone(c.phone)}`}>Llamar</a>}
          {ig && <a href={`https://instagram.com/${ig}`} target="_blank" rel="noreferrer">Instagram</a>}
          {c.website && <a href={c.website.startsWith("http") ? c.website : `https://${c.website}`} target="_blank" rel="noreferrer">Web</a>}
          {c.location && <span>{c.location}</span>}
        </div>
      </header>
      <div className="public-body">
        {cats.map(cat => <section className="public-category" key={cat}><h2>{cat}</h2><div className="public-grid">
          {c.items.filter(i => (i.category || "General").trim() === cat).map(i => <article className="public-card" key={i.id}>
            <div className="public-image">{i.image ? <img src={i.image} alt={i.name} /> : <span>{i.name.slice(0,1).toUpperCase()}</span>}</div>
            <div className="public-card-body">{i.tag && <small>{i.tag}</small>}<h3>{i.name}</h3><p>{i.description}</p><div className="public-bottom"><strong>{i.price || "Consultar"}</strong>{wa && <a href={`https://wa.me/${wa}?text=${encodeURIComponent(`Hola, quiero consultar por ${i.name}.`)}`} target="_blank" rel="noreferrer">Consultar por WhatsApp →</a>}</div></div>
          </article>)}
        </div></section>)}
      </div>
      <footer className="public-footer"><strong>{c.business}</strong><span>Catálogo online</span>{wa && <a href={`https://wa.me/${wa}`} target="_blank" rel="noreferrer">Consultar por WhatsApp</a>}</footer>
    </article>
  </main>;
}
