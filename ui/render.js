export function esc(v){return String(v??"").replace(/[&<>"']/g,m=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"}[m]))}
export function renderEditor(root,state,actions){
 root.innerHTML=state.products.map((p,i)=>`<div class="product-row"><input data-action="name" data-index="${i}" value="${esc(p.name)}" aria-label="Nombre del producto"><input data-action="price" data-index="${i}" value="${esc(p.price)}" aria-label="Precio" inputmode="numeric"><button class="delete" data-action="remove" data-index="${i}" aria-label="Eliminar producto">×</button></div>`).join("");
 root.onclick=e=>{const b=e.target.closest("[data-action=remove]");if(b)actions.remove(+b.dataset.index)};
 root.oninput=e=>{if(!e.target.dataset.action||e.target.dataset.action==="remove")return;actions.edit(+e.target.dataset.index,e.target.dataset.action,e.target.value)};
}
export function renderCatalog(root,state){
 const b=state.business,wa=b.phone.replace(/\D/g,"");
 root.innerHTML=`<div class="catalog-hero" style="background:${esc(b.color)}"><span class="mini">Catálogo local</span><h3>${esc(b.name||"Tu negocio")}</h3><p>${esc(b.tag||"Productos y servicios")}</p></div><div class="catalog-body"><div class="catalog-location">${b.address?"📍 "+esc(b.address):""}</div><div class="items">${state.products.map((p,i)=>`<article class="item"><div class="thumb">${esc(p.emoji)}</div><div><h4>${esc(p.name)}</h4><p>Disponible por pedido</p></div><strong class="price">${p.price?"$ "+esc(p.price):"Consultar"}</strong></article>`).join("")}</div>${wa?`<a class="buy" href="https://wa.me/${wa}?text=${encodeURIComponent("Hola, quiero consultar por un producto de "+b.name)}" target="_blank" rel="noopener">Pedir por WhatsApp →</a>`:""}<div class="powered">Catálogo Express · Ocarina Producciones</div></div>`;
}
