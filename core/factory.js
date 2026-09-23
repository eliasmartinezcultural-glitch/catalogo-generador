import {library} from "./library.js";
export function newClient(name="Nuevo cliente"){return {id:crypto.randomUUID(),name,businessName:"",state:null,updatedAt:Date.now()}}
export function saveDraft(name,state,id){return library.save({id:id||crypto.randomUUID(),name:name||state.business.name||"Sin nombre",businessName:state.business.name,state:structuredClone(state),updatedAt:Date.now()})}
export function duplicateDraft(id){return library.duplicate(id)}