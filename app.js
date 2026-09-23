import {createStore} from "./core/store.js";
import {buildShareUrl} from "./core/codec.js";
import {renderEditor,renderCatalog} from "./ui/render.js";
import {validate} from "./core/validate.js";
import {PRESETS,getPreset} from "./core/presets.js";
import {compressImage} from "./core/media.js";
import {factoryDB} from "./core/library.js";
import {saveDraft,newClient,checkpoint,duplicateDraft} from "./core/factory.js";
import {STATUS,STATUS_LABEL,nextAction} from "./core/workflow.js";

const $=s=>document.querySelector(s),store=createStore(),editor=$("#productEditor"),catalog=$("#catalog");
let currentDraftId=localStorage.getItem("ocarina.factory.current")||"";
let currentClientId=localStorage.getItem("ocarina.factory.client")||"";
let currentDraftName=localStorage.getItem("ocarina.factory.name")||"";
let currentStatus=STATUS.DRAFT;
let syncing=false,saveTimer=0;
let editorSignature="";
let forceEditorRender=false;

function requestEditorRefresh(){forceEditorRender=true}

function editorShapeSignature(s){
  return [
    currentDraftId,
    s.products.length,
    ...s.products.map(p=>[p.image||"",p.emoji||"",p.featured?"1":"0"].join("~"))
  ].join("|");
}

function ensureContext(s){
  if(currentDraftId){
    const c=factoryDB.getCatalog(currentDraftId);
    if(c){currentClientId=c.clientId||currentClientId;currentDraftName=c.name;currentStatus=c.status||STATUS.DRAFT;return}
  }
  if(location.hash)return;
  if(!currentClientId){
    const client=newClient(s.business.name||"Nuevo cliente");currentClientId=client.id;
    localStorage.setItem("ocarina.factory.client",currentClientId);
  }
  if(!currentDraftId){
    const d=saveDraft(currentDraftName||s.business.name||"Nuevo catálogo",s,"",currentClientId);
    currentDraftId=d.id;currentDraftName=d.name;currentStatus=d.status;
    localStorage.setItem("ocarina.factory.current",currentDraftId);localStorage.setItem("ocarina.factory.name",currentDraftName);
  }
}

function client(){return currentClientId?factoryDB.getClient(currentClientId):null}
function scheduleSave(s){
  clearTimeout(saveTimer);
  saveTimer=setTimeout(()=>saveCurrent(s),450);
}
function saveCurrent(s){
  if(location.hash)return;
  ensureContext(s);
  const existing=currentDraftId&&factoryDB.getCatalog(currentDraftId);
  if(existing&&existing.status===STATUS.PUBLISHED&&JSON.stringify(existing.state)!==JSON.stringify(s))currentStatus=STATUS.DRAFT;
  const saved=saveDraft(currentDraftName||s.business.name,s,currentDraftId,currentClientId);
  currentDraftId=saved.id;currentDraftName=saved.name;currentStatus=saved.status;
  localStorage.setItem("ocarina.factory.current",currentDraftId);
  localStorage.setItem("ocarina.factory.name",currentDraftName);
  $("#autosave").textContent="Guardado local · "+new Date().toLocaleTimeString([],{hour:"2-digit",minute:"2-digit"});
}

function renderLibrary(){
  const list=$("#libraryList"),q=($("#librarySearch").value||"").trim().toLowerCase();
  const items=factoryDB.allCatalogs().filter(x=>{const c=factoryDB.getClient(x.clientId);return !q||x.name.toLowerCase().includes(q)||(c?.name||"").toLowerCase().includes(q)});
  list.innerHTML=items.length?items.map(x=>{
    const c=factoryDB.getClient(x.clientId),label=STATUS_LABEL[x.status]||"BORRADOR";
    return `<div class="library-item"><div class="library-main"><strong>${esc(x.name)}</strong><small>${esc(c?.name||"Sin cliente")} · v${x.version||1} · ${label}</small></div><div class="library-tools"><button data-open="${x.id}">Abrir</button><button data-history="${x.id}" class="mini-action">Historial</button></div></div>`;
  }).join(""):"<p class="empty">No hay catálogos que coincidan.</p>";
}
function renderHistory(id){
  const c=factoryDB.getCatalog(id);if(!c)return;
  $("#historyTitle").textContent=c.name;
  const h=(c.history||[]).slice().reverse();
  $("#historyList").innerHTML=h.length?h.map((x,i)=>`<div class="history-item"><div><strong>Versión ${x.version}</strong><small>${STATUS_LABEL[x.status]||x.status} · ${new Date(x.savedAt).toLocaleString()}</small></div><button data-restore="${c.id}" data-index="${c.history.length-1-i}">Restaurar</button></div>`).join(""):"<p class="empty">Todavía no hay versiones históricas.</p>";
  $("#historyPanel").classList.add("open");
}
function renderPresets(){
  $("#presets").innerHTML=PRESETS.map(p=>`<button class="preset ${p.id===store.get().presetId?"active":""}" data-preset="${p.id}"><strong>${p.name}</strong><small>${p.desc}</small></button>`).join("");
}
function applyPreset(id){
  requestEditorRefresh();
  const p=getPreset(id);
  store.patch(s=>{s.presetId=id;s.business.color=p.color;s.business.tag=p.tag;s.products=s.products.map((x,i)=>({...x,emoji:x.emoji||p.emojis[i%p.emojis.length]}));return s});
}
function syncForm(s,force=false){
  if(!force && document.activeElement && $(".editor")?.contains(document.activeElement)) return;
  syncing=true;const b=s.business,a=s.appearance,c=client();
  $("#clientName").value=c?.name||b.name;$("#clientPhone").value=c?.phone||"";$("#clientNotes").value=c?.notes||"";
  $("#bizName").value=b.name;$("#bizTag").value=b.tag;$("#bizPhone").value=b.phone;$("#bizAddress").value=b.address;$("#bizColor").value=b.color;
  $("#bizHours").value=b.hours;$("#bizPayment").value=b.payment;$("#bizDelivery").value=b.delivery;$("#bizInstagram").value=b.instagram;$("#bizFacebook").value=b.facebook;
  $("#theme").value=a.theme;$("#layout").value=a.layout;$("#buttonText").value=a.buttonText;$("#showPrices").checked=a.showPrices;$("#showDescriptions").checked=a.showDescriptions;$("#showLocation").checked=a.showLocation;$("#showInfo").checked=a.showInfo;
  syncing=false;document.documentElement.style.setProperty("--accent",b.color);
}
function paint(s){
  ensureContext(s);

  // El editor no se reconstruye por cada tecla: solo cuando cambia su estructura.
  const shape=editorShapeSignature(s);
  const mustRefreshEditor=forceEditorRender || shape!==editorSignature;
  if(mustRefreshEditor){
    syncForm(s,true);
    renderEditor(editor,s,{
      edit:(i,k,v)=>store.patch(x=>{x.products[i][k]=v;return x}),
      remove:i=>{requestEditorRefresh();store.patch(x=>{x.products.splice(i,1);return x})},
      photo:(i,v)=>{requestEditorRefresh();store.patch(x=>{x.products[i].image=v;return x})},
      feature:i=>{requestEditorRefresh();store.patch(x=>{x.products[i].featured=!x.products[i].featured;return x})}
    });
    editorSignature=shape;
    forceEditorRender=false;
  }

  // El catálogo es una proyección independiente del estado y se actualiza siempre.
  renderCatalog(catalog,s);
  renderPresets();
  $("#productCount").textContent=s.products.length+" productos";
  $("#draftName").textContent=currentDraftName||s.business.name||"Nuevo catálogo";

  const label=STATUS_LABEL[currentStatus]||"BORRADOR",action=nextAction(currentStatus);
  $("#status").textContent=label;
  $("#workflowLabel").textContent="● "+label;
  $("#workflowBtn").textContent=action.label;
  $("#workflowHint").textContent=currentStatus===STATUS.DRAFT
    ?"Producí y revisá. Al marcar Listo se valida y se guarda un checkpoint."
    :currentStatus===STATUS.READY
      ?"Todo validado. Publicá cuando quieras para generar la publicación."
      :"Publicado. Si modificás algo, vuelve automáticamente a Borrador.";
}
store.subscribe(s=>{paint(s);scheduleSave(s)});
function esc(v){return String(v??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;","\"":"&#39;",'"':"&quot;","'":"&#39;"}[c]))}

$("#presets").onclick=e=>{const b=e.target.closest("[data-preset]");if(b)applyPreset(b.dataset.preset)};
$("#libraryBtn").onclick=()=>{$("#libraryPanel").classList.add("open");renderLibrary()};
$("#closeLibrary").onclick=()=>$("#libraryPanel").classList.remove("open");
$("#librarySearch").oninput=renderLibrary;
$("#libraryList").onclick=e=>{
  const open=e.target.closest("[data-open]"),hist=e.target.closest("[data-history]");
  if(open){const d=factoryDB.getCatalog(open.dataset.open);if(!d)return;requestEditorRefresh();currentDraftId=d.id;currentClientId=d.clientId;currentDraftName=d.name;currentStatus=d.status;localStorage.setItem("ocarina.factory.current",currentDraftId);localStorage.setItem("ocarina.factory.client",currentClientId);localStorage.setItem("ocarina.factory.name",currentDraftName);location.hash="";store.set(d.state);$("#libraryPanel").classList.remove("open");show("Catálogo abierto")}
  if(hist)renderHistory(hist.dataset.history);
};
$("#closeHistory").onclick=()=>$("#historyPanel").classList.remove("open");
$("#historyList").onclick=e=>{const b=e.target.closest("[data-restore]");if(!b)return;const d=factoryDB.restore(b.dataset.restore,Number(b.dataset.index));if(!d)return;requestEditorRefresh();currentDraftId=d.id;currentClientId=d.clientId;currentDraftName=d.name;currentStatus=d.status;localStorage.setItem("ocarina.factory.current",currentDraftId);localStorage.setItem("ocarina.factory.name",currentDraftName);store.set(d.state);$("#historyPanel").classList.remove("open");show("Versión restaurada")};

$("#newBtn").onclick=()=>{
  const s=store.get(),c=newClient("Nuevo cliente");requestEditorRefresh();currentClientId=c.id;
  const d=saveDraft("Nuevo catálogo",s,"",currentClientId);currentDraftId=d.id;currentDraftName=d.name;currentStatus=STATUS.DRAFT;
  localStorage.setItem("ocarina.factory.current",currentDraftId);localStorage.setItem("ocarina.factory.client",currentClientId);localStorage.setItem("ocarina.factory.name",currentDraftName);
  location.hash="";location.reload();
};
$("#duplicateBtn").onclick=()=>{
  if(!currentDraftId){show("Todavía no hay un catálogo para duplicar.");return}
  const d=duplicateDraft(currentDraftId);if(!d){show("No se pudo duplicar.");return}requestEditorRefresh();
  currentDraftId=d.id;currentClientId=d.clientId;currentDraftName=d.name;currentStatus=STATUS.DRAFT;
  localStorage.setItem("ocarina.factory.current",currentDraftId);localStorage.setItem("ocarina.factory.client",currentClientId);localStorage.setItem("ocarina.factory.name",currentDraftName);
  store.set(d.state);show("Catálogo duplicado como nuevo borrador");
};

async function handleImage(file,callback,max){if(!file)return;try{show("Optimizando imagen…");callback(await compressImage(file,{max,quality:.68}));show("Imagen lista")}catch{show("No pude cargar esa imagen.")}}
$("#logoFile").onchange=e=>handleImage(e.target.files[0],src=>store.patch(s=>{s.business.logo=src;return s}),300);

const businessMap={bizName:["business","name"],bizTag:["business","tag"],bizPhone:["business","phone"],bizAddress:["business","address"],bizColor:["business","color"],bizHours:["business","hours"],bizPayment:["business","payment"],bizDelivery:["business","delivery"],bizInstagram:["business","instagram"],bizFacebook:["business","facebook"]};
Object.entries(businessMap).forEach(([id,[group,key]])=>$("#"+id).addEventListener("input",e=>{if(syncing)return;store.patch(s=>{s[group][key]=e.target.value;return s})}));
$("#clientName").addEventListener("input",e=>{if(syncing)return;const c=client();if(c){c.name=e.target.value;factoryDB.saveClient(c)}});
$("#clientPhone").addEventListener("input",e=>{if(syncing)return;const c=client();if(c){c.phone=e.target.value;factoryDB.saveClient(c)}});
$("#clientNotes").addEventListener("input",e=>{if(syncing)return;const c=client();if(c){c.notes=e.target.value;factoryDB.saveClient(c)}});

const appearanceMap={theme:"theme",layout:"layout",buttonText:"buttonText"};
Object.entries(appearanceMap).forEach(([id,key])=>$("#"+id).addEventListener("change",e=>{if(syncing)return;store.patch(s=>{s.appearance[key]=e.target.value;return s})}));
["showPrices","showDescriptions","showLocation","showInfo"].forEach(id=>$("#"+id).addEventListener("change",e=>store.patch(s=>{s.appearance[id]=e.target.checked;return s})));
$("#addProduct").onclick=()=>{requestEditorRefresh();store.patch(s=>{const p=getPreset(s.presetId);s.products.push({name:"Nuevo producto",price:"",description:"",emoji:p.emojis[s.products.length%p.emojis.length],image:"",featured:false});return s});

async function publish(){
  const errors=validate(store.get());if(errors.length){show(errors[0]);return}
  const url=buildShareUrl(store.get());if(url.length>8000){show("El catálogo es demasiado pesado. Reducí fotos o cantidad de productos.");return}
  clearTimeout(saveTimer);saveCurrent(store.get());
  if(currentStatus===STATUS.DRAFT){checkpoint(currentDraftId,STATUS.READY);currentStatus=STATUS.READY;paint(store.get());show("Catálogo validado y marcado como listo");return}
  history.replaceState(null,"",url);
  const pub=factoryDB.publish(currentDraftId,url);if(!pub){show("No se pudo registrar la publicación.");return}
  currentStatus=STATUS.PUBLISHED;$("#status").textContent="PUBLICADO";
  try{await navigator.clipboard.writeText(url);show("Publicado y enlace copiado.")}catch{prompt("Copiá este enlace:",url)}
  paint(store.get());
}
$("#workflowBtn").onclick=publish;
async function share(){const errors=validate(store.get());if(errors.length){show(errors[0]);return}const url=buildShareUrl(store.get());if(url.length>8000){show("El catálogo es demasiado pesado.");return}history.replaceState(null,"",url);try{await navigator.clipboard.writeText(url);show("Enlace copiado. Listo para WhatsApp.")}catch{prompt("Copiá este enlace:",url)}}
$("#shareBtn").onclick=share;$("#shareTop").onclick=share;
$("#resetBtn")?.addEventListener("click",()=>{if(confirm("¿Volver al catálogo de ejemplo?")){localStorage.removeItem("ocarina.catalog.v2");location.hash="";location.reload()}});
function show(msg){const t=$("#toast");t.textContent=msg;t.classList.add("show");clearTimeout(show.timer);show.timer=setTimeout(()=>t.classList.remove("show"),2600)}
paint(store.get());
