"use client";

import { useEffect, useMemo, useState } from "react";

type Product = { id: string; name: string; description: string; price: string; category: string; image: string; tag: string };
type Catalog = { business: string; subtitle: string; description: string; phone: string; whatsapp: string; instagram: string; website: string; location: string; primary: string; secondary: string; accent: string; template: string; products: Product[] };

const starter: Catalog = {
  business: "Tu negocio",
  subtitle: "Catálogo digital",
  description: "Presentá tus productos o servicios de forma clara, profesional y lista para compartir.",
  phone: "",
  whatsapp: "",
  instagram: "",
  website: "",
  location: "",
  primary: "#111827",
  secondary: "#f4f5f7",
  accent: "#ffffff",
  template: "elegante",
  products: [
    { id: "1", name: "Producto destacado", description: "Descripción breve y comercial del producto.", price: "$ 0", category: "Destacados", image: "", tag: "Nuevo" },
    { id: "2", name: "Servicio profesional", description: "Explicá qué incluye y por qué conviene contratarlo.", price: "Consultar", category: "Servicios", image: "", tag: "Recomendado" },
  ],
};

function uid() { return Math.random().toString(36).slice(2, 10); }

export default function Home() {
  const [catalog, setCatalog] = useState<Catalog>(starter);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const raw = localStorage.getItem("catalogo-studio-v1");
    if (raw) {
      try { setCatalog(JSON.parse(raw)); } catch { /* ignore corrupt local data */ }
    }
  }, []);

  const categories = useMemo(() => Array.from(new Set(catalog.products.map(p => p.category || "General"))), [catalog.products]);

  function patch(patch: Partial<Catalog>) { setCatalog(prev => ({ ...prev, ...patch })); setSaved(false); }
  function updateProduct(id: string, patchProduct: Partial<Product>) {
    setCatalog(prev => ({ ...prev, products: prev.products.map(p => p.id === id ? { ...p, ...patchProduct } : p) }));
    setSaved(false);
  }
  function addProduct() {
    setCatalog(prev => ({ ...prev, products: [...prev.products, { id: uid(), name: "Nuevo producto", description: "Agregá una descripción comercial.", price: "Consultar", category: "General", image: "", tag: "" }] }));
    setSaved(false);
  }
  function removeProduct(id: string) { setCatalog(prev => ({ ...prev, products: prev.products.filter(p => p.id !== id) })); setSaved(false); }
  function save() { localStorage.setItem("catalogo-studio-v1", JSON.stringify(catalog)); setSaved(true); }
  function reset() { if (confirm("¿Restaurar el catálogo de ejemplo? Se perderán los cambios locales.")) { setCatalog(starter); localStorage.removeItem("catalogo-studio-v1"); setSaved(false); } }
  function exportJson() {
    const blob = new Blob([JSON.stringify(catalog, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob); const a = document.createElement("a"); a.href = url; a.download = `${(catalog.business || "catalogo").toLowerCase().replace(/[^a-z0-9]+/g, "-")}.json`; a.click(); URL.revokeObjectURL(url);
  }
  function importJson(file: File) {
    const reader = new FileReader(); reader.onload = () => { try { setCatalog(JSON.parse(String(reader.result))); setSaved(false); } catch { alert("El archivo no contiene un catálogo válido."); } }; reader.readAsText(file);
  }

  return (
    <div className="shell">
      <header className="topbar">
        <div className="brand"><div className="brand-mark">CS</div><span>Catálogo Studio</span></div>
        <div className="top-actions">
          <button className="btn btn-ghost hide-mobile" onClick={reset}>Restaurar</button>
          <label className="btn btn-ghost hide-mobile">Importar<input hidden type="file" accept="application/json" onChange={e => e.target.files?.[0] && importJson(e.target.files[0])}/></label>
          <button className="btn btn-ghost hide-mobile" onClick={exportJson}>Exportar</button>
          <button className="btn" onClick={() => window.print()}>Imprimir / PDF</button>
          <button className="btn" onClick={save}>{saved ? "Guardado ✓" : "Guardar"}</button>
        </div>
      </header>

      <main className="main">
        <aside className="sidebar">
          <h1>Constructor</h1>
          <p className="intro">Creá un catálogo a medida. Los cambios se reflejan en la vista previa y pueden guardarse en este navegador.</p>

          <div className="section">
            <div className="section-title"><span>Identidad</span></div>
            <Field label="Nombre del negocio"><input value={catalog.business} onChange={e => patch({ business: e.target.value })} /></Field>
            <Field label="Bajada"><input value={catalog.subtitle} onChange={e => patch({ subtitle: e.target.value })} /></Field>
            <Field label="Descripción"><textarea value={catalog.description} onChange={e => patch({ description: e.target.value })} /></Field>
          </div>

          <div className="section">
            <div className="section-title"><span>Contacto</span></div>
            <Field label="Teléfono"><input placeholder="299..." value={catalog.phone} onChange={e => patch({ phone: e.target.value })} /></Field>
            <Field label="WhatsApp"><input placeholder="299..." value={catalog.whatsapp} onChange={e => patch({ whatsapp: e.target.value })} /></Field>
            <Field label="Instagram"><input placeholder="@usuario" value={catalog.instagram} onChange={e => patch({ instagram: e.target.value })} /></Field>
            <Field label="Sitio web"><input placeholder="www.tusitio.com" value={catalog.website} onChange={e => patch({ website: e.target.value })} /></Field>
            <Field label="Ubicación"><input value={catalog.location} onChange={e => patch({ location: e.target.value })} /></Field>
          </div>

          <div className="section">
            <div className="section-title"><span>Estilo</span></div>
            <Field label="Plantilla"><select value={catalog.template} onChange={e => patch({ template: e.target.value })}><option value="elegante">Elegante</option><option value="comercial">Comercial</option><option value="minimal">Minimal</option></select></Field>
            <div className="color-row">
              <Field label="Color principal"><input className="color-input" type="color" value={catalog.primary} onChange={e => patch({ primary: e.target.value })}/></Field>
              <Field label="Fondo secundario"><input className="color-input" type="color" value={catalog.secondary} onChange={e => patch({ secondary: e.target.value })}/></Field>
            </div>
          </div>

          <div className="section">
            <div className="section-title"><span>Productos y servicios</span><span>{catalog.products.length}</span></div>
            {catalog.products.map(p => <ProductEditor key={p.id} product={p} onChange={patchProduct => updateProduct(p.id, patchProduct)} onRemove={() => removeProduct(p.id)} />)}
            <div className="add-row"><button className="btn btn-dark" onClick={addProduct}>+ Agregar ítem</button></div>
          </div>
        </aside>

        <section className="preview-area">
          <div className="preview-toolbar"><span>VISTA PREVIA · ACTUALIZACIÓN EN TIEMPO REAL</span><span>{catalog.products.length} ítems · {categories.length} categorías</span></div>
          <CatalogPreview catalog={catalog} categories={categories} />
        </section>
      </main>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) { return <div className="field"><label>{label}</label>{children}</div>; }

function ProductEditor({ product, onChange, onRemove }: { product: Product; onChange: (p: Partial<Product>) => void; onRemove: () => void }) {
  return <div className="item">
    <div className="item-head"><div><div className="item-name">{product.name || "Sin nombre"}</div><div className="item-meta">{product.category || "General"} · {product.price || "Sin precio"}</div></div><button className="btn btn-small" onClick={onRemove}>Eliminar</button></div>
    <div style={{ marginTop: 10 }}>
      <Field label="Nombre"><input value={product.name} onChange={e => onChange({ name: e.target.value })}/></Field>
      <Field label="Categoría"><input value={product.category} onChange={e => onChange({ category: e.target.value })}/></Field>
      <Field label="Descripción"><textarea value={product.description} onChange={e => onChange({ description: e.target.value })}/></Field>
      <Field label="Precio / modalidad"><input value={product.price} onChange={e => onChange({ price: e.target.value })}/></Field>
      <Field label="Imagen (URL)"><input placeholder="https://..." value={product.image} onChange={e => onChange({ image: e.target.value })}/></Field>
      <Field label="Etiqueta"><input placeholder="Nuevo / Oferta / Recomendado" value={product.tag} onChange={e => onChange({ tag: e.target.value })}/></Field>
    </div>
  </div>;
}

function CatalogPreview({ catalog, categories }: { catalog: Catalog; categories: string[] }) {
  const grouped = categories.map(category => ({ category, products: catalog.products.filter(p => (p.category || "General") === category) }));
  return <article className="catalog">
    <header className="catalog-header" style={{ background: catalog.primary }}>
      <div className="catalog-kicker">{catalog.subtitle || "Catálogo digital"}</div>
      <h2 className="catalog-title">{catalog.business || "Tu negocio"}</h2>
      <p className="catalog-desc">{catalog.description}</p>
      <div className="catalog-contact">
        {catalog.phone && <span className="contact-pill">Tel. {catalog.phone}</span>}
        {catalog.whatsapp && <span className="contact-pill">WhatsApp {catalog.whatsapp}</span>}
        {catalog.instagram && <span className="contact-pill">Instagram {catalog.instagram}</span>}
        {catalog.website && <span className="contact-pill">{catalog.website}</span>}
        {catalog.location && <span className="contact-pill">{catalog.location}</span>}
      </div>
    </header>
    <div className="catalog-body" style={{ background: catalog.secondary }}>
      {grouped.length ? grouped.map(group => <section className="category" key={group.category}>
        <h3 className="category-title">{group.category}</h3>
        <div className="product-grid">{group.products.map(p => <div className="product-card" key={p.id}>
          <div className="product-image">{p.image ? <img src={p.image} alt=""/> : <span>Imagen del producto</span>}</div>
          <div className="product-content">
            <div className="product-name">{p.name || "Producto"}</div>
            <div className="product-desc">{p.description || "Sin descripción."}</div>
            <div className="product-bottom"><div className="price">{p.price || "Consultar"}</div>{p.tag && <span className="tag">{p.tag}</span>}</div>
          </div>
        </div>)}</div>
      </section>) : <div className="empty">Todavía no hay productos o servicios. Agregá el primero desde el constructor.</div>}
      <div className="footer-note">Catálogo preparado con Catálogo Studio · Diseño adaptable para compartir, imprimir o convertir en PDF.</div>
    </div>
  </article>;
}
