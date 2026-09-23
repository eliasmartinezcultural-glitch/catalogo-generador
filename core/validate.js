import {LIMITS} from "./schema.js";
export function validate(state){
 const errors=[];
 if(!state.business.name)errors.push("Falta el nombre del negocio.");
 if(!state.business.phone.replace(/\D/g,""))errors.push("Agregá un WhatsApp para recibir pedidos.");
 if(!state.products.length)errors.push("Agregá al menos un producto.");
 state.products.forEach((p,i)=>{if(!p.name)errors.push("El producto "+(i+1)+" necesita nombre.");if(p.name.length>LIMITS.name)errors.push("Un nombre de producto es demasiado largo.")});
 return errors;
}
