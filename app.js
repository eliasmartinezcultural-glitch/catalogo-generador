import {createStore} from "./core/store.js";
import {buildShareUrl} from "./core/codec.js";
import {renderEditor,renderCatalog} from "./ui/render.js";
import {validate} from "./core/validate.js";
const $=s=>document.querySelector(s),store=createStore(),editor=$("#productEditor"),catalog=$("#catalog");
let syncing=false;
function syncForm(s){syncing=true;$("#bizName").value=s.business.name;$("#bizTag").value=s.business.tag;$("#bizPhone").value=s.business.phone;$("#bizAddress").value=s.business.address;$("#bizColor").value=s.business.color;syncing=false;document.documentElement.style.setProperty("--accent",s.business.color)}
function paint(s){syncForm(s);renderEditor(editor,s,{edit:(i,k,v)=>store.patch(x=>{x.products[i][k]=v;return x}),remove:i=>store.patch(x=>{x.products.splice(i,1);return x})});renderCatalog(catalog,s);$("#productCount").textContent=s.products.length+" productos";$("#status").textContent=location.hash?"CATÁLOGO COMPARTIDO":"BORRADOR LOCAL"}
store.subscribe(paint);
["bizName","bizTag","bizPhone","bizAddress","bizColor"].forEach(id=>$("#"+id).addEventListener("input",e=>{if(syncing)return;const key={bizName:"name",bizTag:"tag",bizPhone:"phone",bizAddress:"address",bizColor:"color"}[id];store.patch(s=>{s.business[key]=e.target.value;return s})}));
$("#addProduct").onclick=()=>store.patch(s=>{s.products.push({name:"Nuevo producto",price:"6000",emoji:["🥖","🥚","🍓","🎁","🧁","☕"][s.products.length%6]});return s});
function share(){const errors=validate(store.get());if(errors.length){show(errors[0]);return}const url=buildShareUrl(store.get());history.replaceState(null,"",url);navigator.clipboard?.writeText(url).then(()=>show("Enlace copiado. Listo para WhatsApp.")).catch(()=>prompt("Copiá este enlace:",url));$("#status").textContent="ENLACE LISTO"}
$("#shareBtn").onclick=share;$("#shareTop").onclick=share;
$("#resetBtn").onclick=()=>{if(confirm("¿Volver al catálogo de ejemplo?")){localStorage.removeItem("ocarina.catalog.v2");location.hash="";location.reload()}};
function show(msg){const t=$("#toast");t.textContent=msg;t.classList.add("show");setTimeout(()=>t.classList.remove("show"),2600)}
paint(store.get());