import {DEFAULT_STATE,normalize} from "./schema.js";
import {decodeState} from "./codec.js";
const KEY="ocarina.catalog.v2";
export function createStore(){
 let state=normalize(DEFAULT_STATE), listeners=[];
 const notify=()=>listeners.forEach(fn=>fn(state));
 const api={get:()=>state,set(next){state=normalize(next);localStorage.setItem(KEY,JSON.stringify(state));notify()},patch(fn){api.set(fn(structuredClone(state)))},subscribe(fn){listeners.push(fn);return()=>listeners=listeners.filter(x=>x!==fn)}};
 const hash=location.hash.match(/^#catalog=(.+)$/)?.[1];
 const shared=decodeState(hash);
 if(shared) state=normalize(shared); else {try{const saved=JSON.parse(localStorage.getItem(KEY)||"null");if(saved)state=normalize(saved)}catch{}}
 return api;
}
