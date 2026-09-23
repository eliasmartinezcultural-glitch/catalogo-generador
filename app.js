const $=s=>document.querySelector(s);
const defaultProducts=[
{name:"Pan casero",price:"3500"},
{name:"Docena de huevos",price:"5000"},
{name:"Mermelada artesanal",price:"4500"},
{name:"Caja de productos",price:"12000"}
];
let products=[...defaultProducts];

function esc(v){return String(v??"").replace(/[&<>"']/g,m=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"}[m]))}
function phone(){return $("bizPhone").value.replace(/\D/g,"")}
function renderEditor(){
 $("productEditor").innerHTML=products.map((p,i)=>`<div class="product-row">
 <input data-i="${i}" data-k="name" value="${esc(p.name)}" aria-label="Producto">
 <input data-i="${i}" data-k="price" value="${esc(p.price)}" aria-label="Precio" inputmode="numeric">
 <button class="delete" data-del="${i}" title="Eliminar">×</button>
 </div>`).join("");
}
function render(){
 const name=$("bizName").value||"Tu negocio";
 const tag=$("bizTag").value||"Productos y servicios";
 const address=$("bizAddress").value||"San Patricio del Chañar";
 const color=$("bizColor").value||"#1f6b52";
 document.documentElement.style.setProperty("--accent",color);
 const wa=phone();
 $("catalog").innerHTML=`<div class="catalog-hero">
   <span class="mini">Catálogo local</span><h3>${esc(name)}</h3><p>${esc(tag)}</p>
 </div><div class="catalog-body">
   <div class="catalog-location">📍 ${esc(address)}</div>
   <div class="items">${products.map((p,i)=>`<article class="item">
     <div class="thumb">${["🥖","🥚","🍓","🎁","🧁","☕"][i%6]}</div>
     <div><h4>${esc(p.name||"Producto")}</h4><p>Disponible por pedido</p></div>
     <strong class="price">$ ${esc(p.price||"Consultar")}</strong>
   </article>`).join("")}</div>
   <a class="buy" href="${wa?"https://wa.me/"+wa+"?text="+encodeURIComponent("Hola, quiero consultar por un producto de "+name):"#"}" target="_blank">Pedir por WhatsApp →</a>
   <div class="powered">Catálogo Express · Ocarina Producciones</div>
 </div>`;
}
function state(){
 return {n:$("bizName").value,t:$("bizTag").value,w:$("bizPhone").value,a:$("bizAddress").value,c:$("bizColor").value,p:products};
}
function encodeState(){
 const bytes=new TextEncoder().encode(JSON.stringify(state()));
 let bin=""; bytes.forEach(b=>bin+=String.fromCharCode(b));
 return btoa(bin).replace(/\+/g,"-").replace(/\//g,"_").replace(/=+$/,"");
}
function loadState(){
 const raw=location.hash.replace(/^#catalog=/,"");
 if(!raw)return;
 try{
  const bin=atob(raw.replace(/-/g,"+").replace(/_/g,"/")+"==");
  const data=JSON.parse([...bin].map(c=>String.fromCharCode(c.charCodeAt(0))).join(""));
  $("bizName").value=data.n||"";
  $("bizTag").value=data.t||"";
  $("bizPhone").value=data.w||"";
  $("bizAddress").value=data.a||"";
  $("bizColor").value=data.c||"#1f6b52";
  products=Array.isArray(data.p)?data.p:products;
 }catch(e){console.warn("No se pudo cargar el catálogo",e)}
}
function share(){
 const url=location.href.split("#")[0]+"#catalog="+encodeState();
 history.replaceState(null,"",url);
 navigator.clipboard?.writeText(url).then(()=>toast("Enlace copiado. Ya podés enviarlo por WhatsApp.")).catch(()=>{prompt("Copiá este enlace:",url)});
}
function toast(msg){const t=$("#toast");t.textContent=msg;t.classList.add("show");setTimeout(()=>t.classList.remove("show"),2600)}
document.addEventListener("input",e=>{
 if(e.target.matches("[data-i][data-k]"))products[+e.target.dataset.i][e.target.dataset.k]=e.target.value;
 render();
});
document.addEventListener("click",e=>{
 if(e.target.dataset.del!==undefined){products.splice(+e.target.dataset.del,1);renderEditor();render()}
});
["bizName","bizTag","bizPhone","bizAddress","bizColor"].forEach(id=>$(`#${id}`).addEventListener("input",render));
$("#addProduct").onclick=()=>{products.push({name:"Nuevo producto",price:"6000"});renderEditor();render()};
$("#shareBtn").onclick=share;
$("#shareTop").onclick=share;
loadState();renderEditor();render();