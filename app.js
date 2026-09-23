import {createStore} from "./core/store.js";
import {buildShareUrl} from "./core/codec.js";
import {renderEditor,renderCatalog} from "./ui/render.js";
import {validate} from "./core/validate.js";
import {PRESETS,getPreset} from "./core/presets.js";
import {compressImage} from "./core/media.js";

const $=s=>document.querySelector(s),store=createStore(),editor=$("#productEditor"),catalog=$("#catalog");
const presetRoot=$("#presets");
let syncing=false;

function renderPresets(){
  presetRoot.innerHTML=PRESETS.map(p=>`<button class="preset ${p.id===store.get().presetId?"active":""}" data-preset="${p.id}">
    <strong>${p.name}</strong><small>${p.desc}</small>
  </button>`).join("");
}
function applyPreset(id){
  const p=getPreset(id);
  store.patch(s=>{
    s.presetId=id;s.business.color=p.color;s.business.tag=p.tag;
    s.products=s.products.map((x,i)=>({...x,emoji:x.emoji||p.emojis[i%p.emojis.length]}));
    return s;
  });
}
function syncForm(s){
  syncing=true;
  const b=s.business,a=s.appearance;
  $("#bizName").value=b.name;$("#bizTag").value=b.tag;$("#bizPhone").value=b.phone;
  $("#bizAddress").value=b.address;$("#bizColor").value=b.color;
  $("#bizHours").value=b.hours;$("#bizPayment").value=b.payment;$("#bizDelivery").value=b.delivery;
  $("#bizInstagram").value=b.instagram;$("#bizFacebook").value=b.facebook;
  $("#theme").value=a.theme;$("#layout").value=a.layout;$("#buttonText").value=a.buttonText;
  $("#showPrices").checked=a.showPrices;$("#showDescriptions").checked=a.showDescriptions;
  $("#showLocation").checked=a.showLocation;$("#showInfo").checked=a.showInfo;
  syncing=false;
  document.documentElement.style.setProperty("--accent",b.color);
}
function paint(s){
  syncForm(s);
  renderEditor(editor,s,{
    edit:(i,k,v)=>store.patch(x=>{x.products[i][k]=v;return x}),
    remove:i=>store.patch(x=>{x.products.splice(i,1);return x}),
    photo:(i,v)=>store.patch(x=>{x.products[i].image=v;return x}),
    feature:i=>store.patch(x=>{x.products[i].featured=!x.products[i].featured;return x})
  });
  renderCatalog(catalog,s);
  $("#productCount").textContent=s.products.length+" productos";
  $("#status").textContent=location.hash?"CATÁLOGO COMPARTIDO":"BORRADOR LOCAL";
  renderPresets();
}
store.subscribe(paint);

presetRoot.onclick=e=>{const b=e.target.closest("[data-preset]");if(b)applyPreset(b.dataset.preset)};

async function handleImage(file,callback,max){
  try{show("Optimizando imagen…");callback(await compressImage(file,{max,quality:.68}));show("Imagen lista");}
  catch(e){show("No pude cargar esa imagen.");}
}
$("#logoFile").onchange=e=>handleImage(e.target.files[0],src=>store.patch(s=>{s.business.logo=src;return s}),300);

const businessMap={
  bizName:["business","name"],bizTag:["business","tag"],bizPhone:["business","phone"],
  bizAddress:["business","address"],bizColor:["business","color"],bizHours:["business","hours"],
  bizPayment:["business","payment"],bizDelivery:["business","delivery"],
  bizInstagram:["business","instagram"],bizFacebook:["business","facebook"]
};
Object.entries(businessMap).forEach(([id,[group,key]])=>{
  $("#"+id).addEventListener("input",e=>{
    if(syncing)return;
    store.patch(s=>{s[group][key]=e.target.value;return s});
  });
});
const appearanceMap={theme:"theme",layout:"layout",buttonText:"buttonText"};
Object.entries(appearanceMap).forEach(([id,key])=>$("#"+id).addEventListener("change",e=>{
  if(syncing)return;store.patch(s=>{s.appearance[key]=e.target.value;return s});
}));
["showPrices","showDescriptions","showLocation","showInfo"].forEach(id=>$("#"+id).addEventListener("change",e=>{
  store.patch(s=>{s.appearance[id]=e.target.checked;return s});
}));

$("#addProduct").onclick=()=>store.patch(s=>{
  const p=getPreset(s.presetId);
  s.products.push({name:"Nuevo producto",price:"",description:"",emoji:p.emojis[s.products.length%p.emojis.length],image:"",featured:false});
  return s;
});

async function share(){
  const errors=validate(store.get());
  if(errors.length){show(errors[0]);return}
  const url=buildShareUrl(store.get());
  if(url.length>8000){show("El catálogo es demasiado pesado. Reducí fotos o cantidad de productos.");return}
  history.replaceState(null,"",url);
  try{await navigator.clipboard.writeText(url);show("Enlace copiado. Listo para WhatsApp.");}
  catch{prompt("Copiá este enlace:",url);}
  $("#status").textContent="ENLACE LISTO";
}
$("#shareBtn").onclick=share;$("#shareTop").onclick=share;
$("#resetBtn").onclick=()=>{if(confirm("¿Volver al catálogo de ejemplo?")){localStorage.removeItem("ocarina.catalog.v2");location.hash="";location.reload()}};
function show(msg){const t=$("#toast");t.textContent=msg;t.classList.add("show");clearTimeout(show.timer);show.timer=setTimeout(()=>t.classList.remove("show"),2600)}

paint(store.get());
