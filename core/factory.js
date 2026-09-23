import {factoryDB} from "./library.js";
export function newClient(name="Nuevo cliente"){const now=Date.now();return factoryDB.saveClient({id:crypto.randomUUID(),name,phone:"",notes:"",createdAt:now,updatedAt:now})}
export function newCatalog(clientId,name="Nuevo catálogo",state=null){const now=Date.now();return factoryDB.saveCatalog({id:crypto.randomUUID(),clientId,name,status:"DRAFT",state,version:1,history:[],publicationId:null,createdAt:now,updatedAt:now})}
export function saveDraft(name,state,id,clientId){let c=id&&factoryDB.getCatalog(id);if(!c)c=newCatalog(clientId||"",name||state.business.name,state);c.name=name||c.name||state.business.name||"Sin nombre";c.clientId=clientId||c.clientId;c.state=structuredClone(state);return factoryDB.saveCatalog(c)}
export function checkpoint(id,status){return factoryDB.checkpoint(id,status)}
export function duplicateDraft(id){return factoryDB.duplicateCatalog(id)}