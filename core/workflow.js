export const STATUS={DRAFT:"DRAFT",READY:"READY",PUBLISHED:"PUBLISHED"};
export const STATUS_LABEL={DRAFT:"BORRADOR",READY:"LISTO",PUBLISHED:"PUBLICADO"};
export function nextAction(status){
  if(status===STATUS.DRAFT)return {label:"Marcar listo →",target:STATUS.READY};
  if(status===STATUS.READY)return {label:"Publicar catálogo →",target:STATUS.PUBLISHED};
  return {label:"Actualizar publicación →",target:STATUS.PUBLISHED};
}