"use client";

import { useEffect, useMemo, useState } from "react";

type Product = { id: string; name: string; description: string; price: string; category: string; image: string; tag: string };
type Catalog = {
  business: string; subtitle: string; description: string; logo: string;
  phone: string; whatsapp: string; instagram: string; website: string; location: string;
  primary: string; secondary: string; template: "elegante" | "comercial" | "minimal";
  products: Product[];
};

const starter: Catalog = {
  business: "Tu negocio", subtitle: "Catálogo digital", description: "Presentá tus productos o servicios de forma clara, profesional y lista para compartir.", logo: "",
  phone: "", whatsapp: "", instagram: "", website: "", location: "", primary: "#111827", secondary: "#f4f5f7", template: "elegante",
  products: [
    { id: "1", name: "Producto destacado", description: "Descripción breve y comercial del producto.", price: "$ 0", category: "Destacados", image: "", tag: "Nuevo" },
    { id: "2", name: "Servicio profesional", description: "Explicá qué incluye y por qué conviene contratarlo.", price: "Consultar", category: "Servicios", image: "", tag: "Recomendado" },
  ],
};

function uid() { return Math.random().toString(36).slice(2, 10); }
function cleanPhone(value: string) { return value.replace(/[^0-9]/g, ""); }
function normalizeUrl(value: string) { if (!value) return ""; return /^https?:\/\//i.test(value) ? value : `https://${value}`; }

export default function Home() {
  const [catalog, setCatalog] = useState<Catalog>(starter);
  const [saved, setSaved] = useState(false);
  const [activeSection, setActiveSection] = useState<"identity" | "contact" | "style" | "items">("identity");

  useEffect(() => {
    const raw = localStorage.getItem("catalogo-studio-v2");
    if (raw) { try { setCatalog({ ...starter, ...JSON.parse(raw) }); } catch {} }
  }, []);

  const categories = useMemo(() => Array.from(new Set(catalog.products.map(p => p.category.trim() || "General"))), [catalog.products]);
  function patch(patch: Partial<Catalog>) { setCatalog(prev => ({ ...prev, ...patch })); setSaved(false); }
  function updateProduct(id: string, patchProduct: Partial<Product>) { setCatalog(prev => ({ ...prev, products: prev.products.map(p => p.id === id ? { ...p, ...patchProduct } : p) })); setSaved(false); }
  function addProduct() { setCatalog(prev => ({ ...prev, products: [...prev.products, { id: uid(), name: "Nuevo ítem", description: "Agregá una descripción comercial.", price: "Consultar", category: "General", image: "", tag: "" }] })); setActiveSection("items"); setSaved(false); }
  function duplicateProduct(id: string) { setCatalog(prev => { const i = prev.products.findIndex(p => p.id === id); if (i < 0) return prev; const copy = { ...prev.products[i], id: uid(), name: `${prev.products[i].name} (copia)` }; const products = [...prev.products]; products.splice(i + 1, 0, copy); return { ...prev, products }; }); setSaved(false); }
  function moveProduct(id: string, direction: -1 | 1) { setCatalog(prev => { const i = prev.products.findIndex(p => p.id === id), j = i + direction; if (i < 0 || j < 0 || j >= prev.products.length) return prev; const products = [...prev.products]; [products[i], products[j]] = [products[j], products[i]]; return { ...prev, products }; }); setSaved(false); }
  function removeProduct(id: string) { setCatalog(prev => ({ ...prev, products: prev.products.filter(p => p.id !== id) })); setSaved(false); }
  function save() { localStorage.setItem("catalogo-studio-v2", JSON.stringify(catalog)); setSaved(true); }
  function reset() { if (confirm("¿Restaurar el catálogo inicial? Se perderán los cambios locales.")) { setCatalog(starter); localStorage.removeItem("catalogo-studio-v2"); setSaved(false); } }
  function exportJson() { const blob = new Blob([JSON.stringify(catalog, null, 2)], { type: "application/json" }); const url = URL.createObjectURL(blob); const a = document.createElement("a"); a.href = url; a.download = `${(catalog.business || "catalogo").toLowerCase().replace(/[^a-z0-9]+/g, "-")}.json`; a.click(); URL.revokeObjectURL(url); }
  function importJson(file: File) { const reader = new FileReader(); reader.onload = () => { try { const data = JSON.parse(String(reader.result)); if (!Array.isArray(data.products)) throw new Error(); setCatalog({ ...starter, ...data }); setSaved(false); } catch { alert("El archivo no contiene un catálogo válido."); } }; reader.readAsText(file); }

  return <div className="shell">
    <header className="topbar">
      <div className="brand"><div className="brand-mark">CS</div><div><strong>Catálogo Studio</strong><small>Constructor profesional</small></div></div>
      <div className="top-actions">
        <button className="btn btn-ghost hide-mobile" onClick={reset}>Restaurar</button>
        <label className="btn btn-ghost hide-mobile">Importar<input hidden type="file" accept="application/json" onChange={e => e.target.files?.[0] && importJson(e.target.files[0])}/></label>
        <button className="btn btn-ghost hide-mobile" onClick={exportJson}>Exportar</button>
        <button className="btn btn-light" onClick={() => window.print()}>PDF / Imprimir</button>
        <button className="btn btn-primary" onClick={save}>{saved ? "Guardado ✓" : "Guardar"}</button>
      </div>
    </header>

    <main className="workspace">
      <aside className="sidebar">
        <div className="builder-head"><div><h1>Crear catálogo</h1><p>Completá los datos y mirá el resultado a la derecha.</p></div><span className="status-dot">●</span></div>
        <nav className="builder-nav">
          <button className={activeSection === "identity" ? "active" : ""} onClick={() => setActiveSection("identity")}>01 <span>Identidad</span></button>
          <button className={activeSection === "contact" ? "active" : ""} onClick={() => setActiveSection("contact")}>02 <span>Contacto</span></button>
          <button className={activeSection === "style" ? "active" : ""} onClick={() => setActiveSection("style")}>03 <span>Diseño</span></button>
          <button className={activeSection === "items" ? "active" : ""} onClick={() => setActiveSection("items")}>04 <span>Productos</span><b>{catalog.products.length}</b></button>
        </nav>

        {activeSection === "identity" && <Panel title="Identidad del catálogo">
          <Field label="Nombre del negocio"><input autoFocus value={catalog.business} onChange={e => patch({ business: e.target.value })}/></Field>
          <Field label="Bajada / especialidad"><input value={catalog.subtitle} onChange={e => patch({ subtitle: e.target.value })}/></Field>
          <Field label="Presentación"><textarea value={catalog.description} onChange={e => patch({ description: e.target.value })}/></Field>
          <Field label="Logo · URL de imagen"><input placeholder="https://..." value={catalog.logo} onChange={e => patch({ logo: e.target.value })}/></Field>
          <p className="hint">Si no tenés logo, dejalo vacío. El catálogo funciona igual.</p>
        </Panel>}

        {activeSection === "contact" && <Panel title="Datos de contacto">
          <Field label="WhatsApp"><input placeholder="299 123 4567" value={catalog.whatsapp} onChange={e => patch({ whatsapp: e.target.value })}/></Field>
          <Field label="Teléfono"><input placeholder="299 123 4567" value={catalog.phone} onChange={e => patch({ phone: e.target.value })}/></Field>
          <Field label="Instagram"><input placeholder="@tuemprendimiento" value={catalog.instagram} onChange={e => patch({ instagram: e.target.value })}/></Field>
          <Field label="Sitio web"><input placeholder="www.tusitio.com" value={catalog.website} onChange={e => patch({ website: e.target.value })}/></Field>
          <Field label="Ubicación"><input placeholder="San Patricio del Chañar, Neuquén" value={catalog.location} onChange={e => patch({ location: e.target.value })}/></Field>
          <p className="hint">Los datos cargados se convierten en botones reales en la vista previa.</p>
        </Panel>}

        {activeSection === "style" && <Panel title="Identidad visual">
          <Field label="Plantilla"><div className="template-grid">{(["elegante","comercial","minimal"] as const).map(t => <button key={t} className={catalog.template === t ? "template active" : "template"} onClick={() => patch({ template: t })}><span className={`template-sample ${t}`}></span><strong>{t[0].toUpperCase()+t.slice(1)}</strong></button>)}</div></Field>
          <div className="color-row"><Field label="Color principal"><input className="color-input" type="color" value={catalog.primary} onChange={e => patch({ primary: e.target.value })}/></Field><Field label="Fondo"><input className="color-input" type="color" value={catalog.secondary} onChange={e => patch({ secondary: e.target.value })}/></Field></div>
          <button className="btn btn-wide" onClick={() => patch({ primary: starter.primary, secondary: starter.secondary, template: "elegante" })}>Restaurar diseño base</button>
        </Panel>}

        {activeSection === "items" && <Panel title="Productos y servicios" subtitle={`${catalog.products.length} ítems · ${categories.length} categorías`}>
          {catalog.products.map((p, i) => <ProductEditor key={p.id} product={p} index={i} total={catalog.products.length} onChange={v => updateProduct(p.id, v)} onRemove={() => removeProduct(p.id)} onDuplicate={() => duplicateProduct(p.id)} onMove={d => moveProduct(p.id, d)}/>)}
          <button className="btn btn-primary btn-wide" onClick={addProduct}>+ Agregar producto o servicio</button>
        </Panel>}
      </aside>

      <section className="preview-area">
        <div className="preview-toolbar"><div><strong>VISTA PREVIA</strong><span> · {catalog.template}</span></div><span>{catalog.products.length} ítems · actualización instantánea</span></div>
        <CatalogPreview catalog={catalog} categories={categories}/>
      </section>
    </main>
  </div>;
}

function Panel({ title, subtitle, children }: { title: string; subtitle?: string; children: React.ReactNode }) { return <div className="panel"><div className="panel-title"><div><h2>{title}</h2>{subtitle && <span>{subtitle}</span>}</div></div>{children}</div>; }
function Field({ label, children }: { label: string; children: React.ReactNode }) { return <div className="field"><label>{label}</label>{children}</div>; }

function ProductEditor({ product, index, total, onChange, onRemove, onDuplicate, onMove }: { product: Product; index: number; total: number; onChange: (p: Partial<Product>) => void; onRemove: () => void; onDuplicate: () => void; onMove: (d: -1 | 1) => void }) {
  return <div className="item">
    <div className="item-head"><div className="item-number">{String(index + 1).padStart(2,"0")}</div><div className="item-summary"><strong>{product.name || "Sin nombre"}</strong><span>{product.category || "General"} · {product.price || "Consultar"}</span></div><div className="item-actions"><button title="Subir" disabled={index===0} onClick={() => onMove(-1)}>↑</button><button title="Bajar" disabled={index===total-1} onClick={() => onMove(1)}>↓</button><button title="Duplicar" onClick={onDuplicate}>⧉</button><button className="danger" title="Eliminar" onClick={onRemove}>×</button></div></div>
    <details><summary>Editar ítem</summary><div className="item-fields">
      <Field label="Nombre"><input value={product.name} onChange={e => onChange({ name: e.target.value })}/></Field>
      <div className="two"><Field label="Categoría"><input value={product.category} onChange={e => onChange({ category: e.target.value })}/></Field><Field label="Precio / modalidad"><input value={product.price} onChange={e => onChange({ price: e.target.value })}/></Field></div>
      <Field label="Descripción"><textarea value={product.description} onChange={e => onChange({ description: e.target.value })}/></Field>
      <div className="two"><Field label="Imagen · URL"><input placeholder="https://..." value={product.image} onChange={e => onChange({ image: e.target.value })}/></Field><Field label="Etiqueta"><input placeholder="Oferta / Nuevo" value={product.tag} onChange={e => onChange({ tag: e.target.value })}/></Field></div>
    </div></details>
  </div>;
}

function CatalogPreview({ catalog, categories }: { catalog: Catalog; categories: string[] }) {
  const grouped = categories.map(category => ({ category, products: catalog.products.filter(p => (p.category.trim() || "General") === category) }));
  const wa = cleanPhone(catalog.whatsapp);
  return <article className={`catalog template-${catalog.template}`} style={{ ["--catalog-primary" as string]: catalog.primary, ["--catalog-secondary" as string]: catalog.secondary } as React.CSSProperties}>
    <header className="catalog-header">
      <div className="header-main">{catalog.logo && <img className="catalog-logo" src={normalizeUrl(catalog.logo)} alt="Logo"/>}<div className="catalog-kicker">{catalog.subtitle || "Catálogo digital"}</div><h2 className="catalog-title">{catalog.business || "Tu negocio"}</h2><p className="catalog-desc">{catalog.description}</p></div>
      <div className="catalog-contact">
        {wa && <a href={`https://wa.me/${wa}`} target="_blank" rel="noreferrer">WhatsApp</a>}
        {catalog.phone && <a href={`tel:${cleanPhone(catalog.phone)}`}>Llamar</a>}
        {catalog.instagram && <a href={`https://instagram.com/${catalog.instagram.replace(/^@/,"")}`} target="_blank" rel="noreferrer">Instagram</a>}
        {catalog.website && <a href={normalizeUrl(catalog.website)} target="_blank" rel="noreferrer">Web</a>}
        {catalog.location && <span>⌖ {catalog.location}</span>}
      </div>
    </header>
    <div className="catalog-body">
      {grouped.length ? grouped.map(group => <section className="category" key={group.category}><div className="category-head"><h3>{group.category}</h3><span>{group.products.length}</span></div><div className="product-grid">{group.products.map(p => <div className="product-card" key={p.id}><div className="product-image">{p.image ? <img src={normalizeUrl(p.image)} alt={p.name}/> : <div><span>Sin imagen</span></div>}{p.tag && <b className="tag">{p.tag}</b>}</div><div className="product-content"><h4>{p.name || "Producto"}</h4><p>{p.description || "Sin descripción."}</p><div className="product-bottom"><strong>{p.price || "Consultar"}</strong>{wa && <a className="mini-cta" href={`https://wa.me/${wa}?text=${encodeURIComponent(`Hola, quiero consultar por ${p.name}`)}`} target="_blank" rel="noreferrer">Consultar</a>}</div></div></div>)}</div></section>) : <div className="empty">Agregá tu primer producto o servicio desde el constructor.</div>}
      <footer><strong>{catalog.business || "Tu negocio"}</strong><span>Catálogo digital · Información y contacto</span></footer>
    </div>
  </article>;
}
