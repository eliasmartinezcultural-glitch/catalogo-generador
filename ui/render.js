import {compressImage} from "../core/media.js";

export function esc(v){return String(v??"").replace(/[&<>"']/g,m=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"}[m]))}
function safeUrl(v){const s=String(v||"").trim();return /^https?:\/\//i.test(s)?s:"";}
function waUrl(phone,text){const wa=String(phone||"").replace(/\D/g,"");return wa?"https://wa.me/"+wa+"?text="+encodeURIComponent(text):""}

export function renderEditor(root,state,actions){
  root.innerHTML=state.products.map((p,i)=>'<div class="product-row"><div class="prod-main"><div class="mini-thumb">'+(p.image?'<img src="'+esc(p.image)+'" alt="">':esc(p.emoji))+'</div><div class="prod-fields"><input data-action="name" data-index="'+i+'" value="'+esc(p.name)+'" aria-label="Nombre"><input class="desc-input" data-action="description" data-index="'+i+'" value="'+esc(p.description)+'" placeholder="Descripción breve"></div></div><input data-action="price" data-index="'+i+'" value="'+esc(p.price)+'" aria-label="Precio" inputmode="decimal" placeholder="$"><label class="photo-btn" title="Foto">📷<input type="file" accept="image/*" data-photo="'+i+'"></label><button class="delete" data-action="remove" data-index="'+i+'" aria-label="Eliminar">×</button></div>').join("");
  root.onclick=e=>{const b=e.target.closest("[data-action=remove]");if(b)actions.remove(+b.dataset.index)};
  root.onchange=e=>{if(e.target.dataset.photo!==undefined){const f=e.target.files[0];if(!f)return;compressImage(f,{max:720,quality:.76}).then(src=>actions.photo(+e.target.dataset.photo,src)).catch(()=>{});}};
  root.oninput=e=>{if(e.target.dataset.action&&e.target.dataset.action!=="remove")actions.edit(+e.target.dataset.index,e.target.dataset.action,e.target.value)};
}

export function renderCatalog(root,state){
  const b=state.business,a=state.appearance,wa=waUrl(b.phone,"Hola, quiero consultar por un producto de "+b.name);
  const products=[...state.products].sort((x,y)=>Number(y.featured)-Number(x.featured));
  const social=[];
  if(b.instagram){const href=safeUrl(b.instagram)||"https://instagram.com/"+b.instagram.replace(/^@/,"");social.push('<a href="'+esc(href)+'" target="_blank" rel="noopener">Instagram</a>')}
  if(b.facebook){const href=safeUrl(b.facebook);if(href)social.push('<a href="'+esc(href)+'" target="_blank" rel="noopener">Facebook</a>')}
  const info=a.showInfo&&[b.hours,b.payment,b.delivery].some(Boolean)?'<div class="info-box">'+(b.hours?'<div><span>HORARIOS</span><strong>'+esc(b.hours)+'</strong></div>':"")+(b.payment?'<div><span>PAGO</span><strong>'+esc(b.payment)+'</strong></div>':"")+(b.delivery?'<div><span>ENTREGA</span><strong>'+esc(b.delivery)+'</strong></div>':"")+'</div>':"";
  const items=products.map(p=>{const cls="item "+(p.featured?"featured ":"")+a.layout;const media=p.image?'<img class="item-photo" src="'+esc(p.image)+'" alt="'+esc(p.name)+'">':'<span>'+esc(p.emoji)+'</span>';return '<article class="'+cls+'"><div class="thumb">'+media+'</div><div class="item-copy"><h4>'+esc(p.name)+(p.featured?' <b class="badge">DESTACADO</b>':"")+'</h4>'+(a.showDescriptions&&p.description?'<p>'+esc(p.description)+'</p>':"")+'</div>'+(a.showPrices?'<strong class="price">'+(p.price?"$ "+esc(p.price):"Consultar")+'</strong>':"")+'</article>'}).join("");
  const logo=b.logo?'<img class="catalog-logo" src="'+esc(b.logo)+'" alt="Logo de '+esc(b.name)+'">':"";
  root.innerHTML='<div class="catalog-shell theme-'+esc(a.theme)+'"><div class="catalog-hero" style="background:linear-gradient(135deg,'+esc(b.color)+',#111a)">'+logo+'<span class="mini">Catálogo · '+esc(a.layout==="featured"?"selección destacada":"productos")+'</span><h3>'+esc(b.name||"Tu negocio")+'</h3><p>'+esc(b.tag||"Productos y servicios")+'</p></div><div class="catalog-body">'+(a.showLocation&&b.address?'<div class="catalog-location">📍 '+esc(b.address)+'</div>':"")+'<div class="items">'+items+'</div>'+info+(wa?'<a class="buy" href="'+esc(wa)+'" target="_blank" rel="noopener">'+esc(a.buttonText||"Pedir por WhatsApp")+' →</a>':"")+(social.length?'<div class="socials">'+social.join("")+'</div>':"")+'<div class="powered">Catálogo Express · Ocarina Producciones</div></div></div>';
}
