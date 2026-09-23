import {LIMITS} from "./schema.js";
export function validate(state){
  const errors=[];
  if(!state.business.name)errors.push("Falta el nombre del negocio.");
  if(!state.business.phone.replace(/\D/g,""))errors.push("Agregá un WhatsApp para recibir pedidos.");
  if(!state.products.length)errors.push("Agregá al menos un producto.");
  state.products.forEach((p,i)=>{
    if(!p.name)errors.push("El producto "+(i+1)+" necesita nombre.");
    if(p.name.length>LIMITS.name)errors.push("Un nombre de producto es demasiado largo.");
    if(p.description.length>LIMITS.description)errors.push("Una descripción es demasiado larga.");
  });
  const media=(state.business.logo?.length||0)+state.products.reduce((n,p)=>n+(p.image?.length||0),0);
  if(media>250000)errors.push("Las imágenes ocupan demasiado. Quitá alguna foto para poder compartir el enlace.");
  return errors;
}
