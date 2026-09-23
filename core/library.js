const KEY="ocarina.factory.db.v2";
const LEGACY="ocarina.factory.library.v1";
function read(){try{const raw=JSON.parse(localStorage.getItem(KEY)||"null");if(raw&&raw.clients&&raw.catalogs&&raw.publications)return raw}catch{}const db={clients:[],catalogs:[],publications:[]};try{const old=JSON.parse(localStorage.getItem(LEGACY)||"[]");old.forEach(x=>{const clientId=crypto.randomUUID(),now=x.updatedAt||Date.now();db.clients.push({id:clientId,name:x.businessName||x.name||"Cliente",phone:x.state?.business?.phone||"",notes:"",createdAt:now,updatedAt:now});db.catalogs.push({id:x.id,clientId,name:x.name||x.businessName||"Catálogo",status:"DRAFT",state:x.state,version:1,history:[],publicationId:null,createdAt:now,updatedAt:now})})}catch{}write(db);return db}
function write(v){localStorage.setItem(KEY,JSON.stringify(v))}
const clone=v=>structuredClone(v);
export const factoryDB={
allClients(){return read().clients.sort((a,b)=>(b.updatedAt||0)-(a.updatedAt||0))},
getClient(id){return read().clients.find(x=>x.id===id)||null},
saveClient(c){const db=read(),i=db.clients.findIndex(x=>x.id===c.id);c.updatedAt=Date.now();if(i>=0)db.clients[i]=c;else db.clients.push(c);write(db);return c},
allCatalogs(){return read().catalogs.sort((a,b)=>(b.updatedAt||0)-(a.updatedAt||0))},
getCatalog(id){return read().catalogs.find(x=>x.id===id)||null},
saveCatalog(c,{snapshot=false}={}){
const db=read(),i=db.catalogs.findIndex(x=>x.id===c.id),old=i>=0?db.catalogs[i]:null;
if(old&&snapshot&&JSON.stringify(old.state)!==JSON.stringify(c.state)){c.history=[...(old.history||[]),{version:old.version||1,status:old.status,state:clone(old.state),savedAt:Date.now()}].slice(-5);c.version=(old.version||1)+1}else if(old){c.history=old.history||[];c.version=old.version||1}
c.updatedAt=Date.now();if(i>=0)db.catalogs[i]=c;else db.catalogs.push(c);write(db);return c},
removeCatalog(id){const db=read();db.catalogs=db.catalogs.filter(x=>x.id!==id);db.publications=db.publications.filter(x=>x.catalogId!==id);write(db)},
duplicateCatalog(id){const db=read(),c=db.catalogs.find(x=>x.id===id);if(!c)return null;const n={...clone(c),id:crypto.randomUUID(),name:c.name+" · copia",status:"DRAFT",version:1,history:[],publicationId:null,createdAt:Date.now(),updatedAt:Date.now()};db.catalogs.push(n);write(db);return n},
checkpoint(id,status){const db=read(),c=db.catalogs.find(x=>x.id===id);if(!c)return null;c.history=[...(c.history||[]),{version:c.version||1,status:c.status,state:clone(c.state),savedAt:Date.now()}].slice(-5);c.version=(c.version||1)+1;c.status=status;c.updatedAt=Date.now();write(db);return c},
restore(id,index){const db=read(),c=db.catalogs.find(x=>x.id===id);if(!c||!c.history?.[index])return null;const h=c.history[index];c.state=clone(h.state);c.status="DRAFT";c.version=(c.version||1)+1;c.updatedAt=Date.now();write(db);return c},
publish(id,shareUrl){const db=read(),c=db.catalogs.find(x=>x.id===id);if(!c)return null;const p={id:crypto.randomUUID(),catalogId:id,status:"PUBLISHED",publishedAt:Date.now(),version:c.version||1,shareUrl,snapshot:clone(c.state)};db.publications.push(p);c.publicationId=p.id;c.status="PUBLISHED";c.updatedAt=Date.now();write(db);return p},
getPublication(id){return read().publications.find(x=>x.id===id)||null}
};