export const SCHEMA_VERSION=2;
export const LIMITS={products:40,name:80,tag:120,address:120,phone:30,price:20};
export const DEFAULT_STATE={schemaVersion:SCHEMA_VERSION, business:{name:"Almacén La Esquina",tag:"Productos ricos, atención cercana.",phone:"2995551234",address:"San Patricio del Chañar",color:"#1f6b52"}, products:[{name:"Pan casero",price:"3500",emoji:"🥖"},{name:"Docena de huevos",price:"5000",emoji:"🥚"},{name:"Mermelada artesanal",price:"4500",emoji:"🍓"},{name:"Caja de productos",price:"12000",emoji:"🎁"}]};
export function normalize(input={}){
 const b=input.business||{};
 const products=Array.isArray(input.products)?input.products.slice(0,LIMITS.products):[];
 return {schemaVersion:SCHEMA_VERSION,business:{name:String(b.name??DEFAULT_STATE.business.name).trim().slice(0,LIMITS.name),tag:String(b.tag??DEFAULT_STATE.business.tag).trim().slice(0,LIMITS.tag),phone:String(b.phone??"").trim().slice(0,LIMITS.phone),address:String(b.address??"").trim().slice(0,LIMITS.address),color:/^#[0-9a-f]{6}$/i.test(b.color)?b.color:"#1f6b52"},products:products.map((p,i)=>({name:String(p?.name??"Producto "+(i+1)).trim().slice(0,LIMITS.name),price:String(p?.price??"").trim().slice(0,LIMITS.price),emoji:String(p?.emoji??["🥖","🥚","🍓","🎁","🧁","☕"][i%6]).slice(0,4)})).filter(p=>p.name)};
}
export function isMeaningful(state){return Boolean(state.business.name&&state.products.length);}
