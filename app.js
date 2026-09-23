const APP_VERSION="1.1.0";
const SCHEMA_VERSION=2;
const KEY="catalogo-express.v2";

const presets={
  almacen:{name:"Almacén",tag:"Productos ricos, atención cercana.",color:"#1f6b52",products:["Pan casero","Huevos","Mermelada artesanal"]},
  emprendimiento:{name:"Mi emprendimiento",tag:"Hecho con dedicación.",color:"#8b4f32",products:["Producto destacado","Producto especial"]},
  servicios:{name:"Mi servicio",tag:"Soluciones simples y profesionales.",color:"#315a8a",products:["Servicio principal","Servicio adicional"]}
};

const base=()=>({
  schemaVersion:SCHEMA_VERSION,
  catalogTitle:"Nuevo catálogo",
  preset:"almacen",
  name:"Almacén La Esquina",
  tag:"Productos ricos, atención cercana.",
  phone:"",
  address:"San Patricio del Chañar",
  hours:"Lun a sáb · 9 a 20 hs",
  payment:"Efectivo · Transferencia",
  delivery:"Retiro en el local · Consultar envío",
  color:"#1f6b52",
  products:[
    {name:"Pan casero",price:"",description:"Hecho en el día.",emoji:"🥖"},
    {name:"Huevos",price:"",description:"Producto fresco.",emoji:"🥚"},
    {name:"Mermelada artesanal",price:"",description:"Preparación artesanal.",emoji:"🍓"}
  ]
});

function normalize(raw){
  const b=base();
  const source=raw&&typeof raw==="object"?raw:{};
  const state={...b,...source,schemaVersion:SCHEMA_VERSION};
  state.products=Array.isArray(source.products)&&source.products.length
    ?source.products.map(p=>({...{name:"",price:"",description:"",emoji:"✨"},...p}))
    :b.products;
  return state;
}

function load(){
  try{
    const raw=JSON.parse(localStorage.getItem(KEY)||"null");
    return normalize(raw);
  }catch{
    return base();
  }
}

let state=load();

function save(){
  state.schemaVersion=SCHEMA_VERSION;
  localStorage.setItem(KEY,JSON.stringify(state));
}

function esc(v){
  return String(v??"").replace(/[&<>"']/g,m=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"}[m]));
}

function money(v){return v?"$ "+esc(v):"Consultar"}

function catalogReady(){
  return Boolean(state.name.trim()&&state.products.some(x=>x.name.trim()));
}

function applyPreset(id){
  const p=presets[id];
  state={...base(),catalogTitle:"Nuevo catálogo",preset:id,name:p.name,tag:p.tag,color:p.color,products:p.products.map((name,i)=>({
    name,price:"",description:"",emoji:["🥖","🥚","🍓","✨"][i]||"✨"
  }))};
  save();
  render();
}

function addProduct(){
  state.products.push({name:"Nuevo producto",price:"",description:"",emoji:"✨"});
  save();
  render();
  setTimeout(()=>document.querySelector(".product:last-child input")?.focus(),0);
}

function duplicateProduct(i){
  const copy={...state.products[i],name:(state.products[i].name||"Producto")+" · copia"};
  state.products.splice(i+1,0,copy);
  save();
  render();
  setTimeout(()=>document.querySelectorAll(".product")[i+1]?.scrollIntoView({behavior:"smooth",block:"center"}),0);
}

function removeProduct(i){
  if(state.products.length===1){
    showStatus("El catálogo necesita al menos un producto.");
    return;
  }
  state.products.splice(i,1);
  save();
  render();
}

function update(path,value){
  const a=path.split(".");
  if(a[0]==="product")state.products[+a[1]][a[2]]=value;
  else state[a[0]]=value;
  save();
  renderPreview();
  updateReadiness();
}

function wa(){
  const digits=(state.phone||"").replace(/\D/g,"");
  return digits?"https://wa.me/"+digits:"#";
}

function render(){
  document.querySelector("#app").innerHTML=
  '<div class="shell">'+
    '<header class="topbar">'+
      '<div class="brand"><span>CATÁLOGO EXPRESS</span><small>Fábrica privada · Ocarina</small></div>'+
      '<div class="version">V'+APP_VERSION+'</div>'+
      '<div class="top-actions"><button class="btn ghost" id="reset">Nuevo</button><button class="btn primary" id="share">Compartir</button></div>'+
    '</header>'+
    '<main class="workspace">'+
      '<section class="panel builder">'+
        '<div class="eyebrow">Producción privada</div>'+
        '<h1 class="title">Crear un catálogo profesional.</h1>'+
        '<p class="muted">Elegí una base, cargá los datos y productos. La fábrica se ocupa del resto.</p>'+
        '<div class="section">'+
          '<div class="section-head"><h3>1 · Punto de partida</h3><span class="step">BASE</span></div>'+
          '<div class="field"><label>Modelo</label><select id="preset"></select></div>'+
        '</div>'+
        '<div class="section">'+
          '<div class="section-head"><h3>2 · Identidad</h3><span class="step">NEGOCIO</span></div>'+
          '<div class="field"><label>Nombre del negocio</label><input data-k="name" placeholder="Ej. Almacén La Esquina"></div>'+
          '<div class="field"><label>Frase corta</label><input data-k="tag" placeholder="Una frase que identifique al negocio"></div>'+
          '<div class="grid2"><div class="field"><label>WhatsApp</label><input data-k="phone" inputmode="tel" placeholder="549299..."></div><div class="field"><label>Color principal</label><input data-k="color" type="color"></div></div>'+
          '<div class="field"><label>Dirección</label><input data-k="address"></div>'+
        '</div>'+
        '<div class="section">'+
          '<div class="section-head"><h3>3 · Información útil</h3><span class="step">DATOS</span></div>'+
          '<div class="field"><label>Horarios</label><input data-k="hours"></div>'+
          '<div class="field"><label>Medios de pago</label><input data-k="payment"></div>'+
          '<div class="field"><label>Entrega / retiro</label><input data-k="delivery"></div>'+
        '</div>'+
        '<div class="section">'+
          '<div class="section-head"><h3>4 · Productos</h3><span class="count" id="count">'+state.products.length+' productos</span></div>'+
          '<div id="products"></div><button class="add" id="add">+ Agregar producto</button>'+
        '</div>'+
        '<div class="section final-section">'+
          '<div class="production-state" id="readiness"></div>'+
          '<div class="toolbar"><button class="btn primary" id="share2">Crear enlace de WhatsApp</button><button class="btn" id="reset2">Empezar de nuevo</button></div>'+
          '<div id="status"></div>'+
        '</div>'+
      '</section>'+
      '<section class="panel preview-wrap"><div class="preview-label"><span>VISTA DEL CLIENTE</span><strong>Se actualiza sola</strong></div><div class="preview-frame"><div class="phone" id="preview"></div></div></section>'+
    '</main>'+
  '</div>';

  const sel=document.querySelector("#preset");
  sel.innerHTML=Object.entries(presets).map(([k,p])=>'<option value="'+k+'">'+p.name+"</option>").join("");
  sel.value=state.preset;

  document.querySelectorAll("[data-k]").forEach(el=>{
    el.value=state[el.dataset.k]??"";
  });

  document.querySelector("#products").innerHTML=state.products.map((p,i)=>
    '<div class="product">'+
      '<div class="product-head"><span class="product-name">Producto '+(i+1)+'</span><div class="product-actions"><button class="mini-btn" title="Duplicar" data-duplicate="'+i+'">＋</button><button class="icon-btn" title="Eliminar" data-remove="'+i+'">×</button></div></div>'+
      '<div class="grid2"><div class="field"><label>Nombre</label><input data-p="'+i+'.name" value="'+esc(p.name)+'"></div><div class="field"><label>Precio</label><input data-p="'+i+'.price" value="'+esc(p.price)+'" inputmode="decimal" placeholder="Ej. 4500"></div></div>'+
      '<div class="field"><label>Descripción</label><input data-p="'+i+'.description" value="'+esc(p.description)+'" placeholder="Qué recibe el cliente"></div>'+
      '<div class="field"><label>Ícono</label><input data-p="'+i+'.emoji" value="'+esc(p.emoji)+'" maxlength="4"></div>'+
    '</div>'
  ).join("");

  bind();
  renderPreview();
  updateReadiness();
}

function renderPreview(){
  const p=document.querySelector("#preview");
  if(!p)return;
  const valid=catalogReady();
  const cards=state.products.length
    ?state.products.map(x=>
      '<article class="card"><div class="thumb">'+esc(x.emoji||"✨")+'</div><div><h4>'+esc(x.name||"Producto sin nombre")+'</h4>'+
      (x.description?"<p>"+esc(x.description)+"</p>":"")+
      '<div class="price">'+money(x.price)+"</div></div></article>"
    ).join("")
    :'<div class="empty">Agregá tu primer producto para verlo acá.</div>';

  p.innerHTML=
    '<div class="store-hero" style="background:'+esc(state.color)+'">'+
      '<div class="tag">'+esc(state.tag||"Tu catálogo digital")+'</div>'+
      '<h1>'+esc(state.name||"Nombre de tu negocio")+'</h1>'+
      '<div class="small">'+esc(state.address||"Agregá tu ubicación")+'</div>'+
    '</div>'+
    '<div class="store-info">'+
      (state.hours?"<div>🕘 "+esc(state.hours)+"</div>":"")+
      (state.payment?"<div>💳 "+esc(state.payment)+"</div>":"")+
      (state.delivery?"<div>📦 "+esc(state.delivery)+"</div>":"")+
    '</div>'+
    '<div class="catalog"><div class="catalog-title">Productos</div>'+cards+
      '<button class="cta" style="background:'+esc(state.color)+'" id="waButton">'+(state.phone?"Pedir por WhatsApp":"Cargá WhatsApp")+"</button>"+
      (valid?'<div class="status">✓ Catálogo listo para compartir</div>':'<div class="status danger">Falta nombre o al menos un producto.</div>')+
    '</div>';

  document.querySelector("#waButton").onclick=()=>{
    if(state.phone)window.open(wa(),"_blank");
    else showStatus("Cargá el número de WhatsApp primero.");
  };
}

function updateReadiness(){
  const el=document.querySelector("#readiness");
  if(!el)return;
  const hasName=Boolean(state.name.trim());
  const hasProduct=state.products.some(x=>x.name.trim());
  const hasPhone=Boolean((state.phone||"").replace(/\D/g,""));
  el.innerHTML=
    '<span class="'+(hasName?"ok":"pending")+'">● Negocio</span>'+
    '<span class="'+(hasProduct?"ok":"pending")+'">● Productos</span>'+
    '<span class="'+(hasPhone?"ok":"pending")+'">● WhatsApp</span>'+
    '<b>'+(hasName&&hasProduct?"Listo para revisar":"Faltan datos")+'</b>';
}

function bind(){
  document.querySelector("#preset").onchange=e=>applyPreset(e.target.value);
  document.querySelectorAll("[data-k]").forEach(el=>el.oninput=e=>update(el.dataset.k,e.target.value));
  document.querySelectorAll("[data-p]").forEach(el=>el.oninput=e=>{
    const a=el.dataset.p.split(".");
    update("product."+a[0]+"."+a[1],e.target.value);
  });
  document.querySelectorAll("[data-remove]").forEach(el=>el.onclick=()=>removeProduct(+el.dataset.remove));
  document.querySelectorAll("[data-duplicate]").forEach(el=>el.onclick=()=>duplicateProduct(+el.dataset.duplicate));
  document.querySelector("#add").onclick=addProduct;
  document.querySelectorAll("#reset,#reset2").forEach(b=>b.onclick=()=>{
    if(confirm("¿Empezar un catálogo nuevo?")){
      state=base();
      save();
      render();
    }
  });
  document.querySelectorAll("#share,#share2").forEach(b=>b.onclick=share);
}

async function share(){
  const digits=(state.phone||"").replace(/\D/g,"");
  if(!digits){
    showStatus("Cargá el número de WhatsApp antes de compartir.");
    return;
  }
  const url="https://wa.me/"+digits+"?text="+encodeURIComponent("Hola, quiero consultar el catálogo de "+(state.name||"tu negocio")+".");
  try{
    await navigator.clipboard.writeText(url);
    showStatus("Enlace de WhatsApp copiado.");
  }catch{
    prompt("Copiá este enlace:",url);
  }
}

function showStatus(msg){
  const s=document.querySelector("#status");
  if(s)s.innerHTML='<div class="status">✓ '+esc(msg)+"</div>";
}

render();