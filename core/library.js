const KEY="ocarina.factory.library.v1";
function read(){try{return JSON.parse(localStorage.getItem(KEY)||"[]")}catch{return []}}
function write(v){localStorage.setItem(KEY,JSON.stringify(v))}
export const library={
 all:()=>read().sort((a,b)=>(b.updatedAt||0)-(a.updatedAt||0)),
 save(c){const a=read();const i=a.findIndex(x=>x.id===c.id);if(i>=0)a[i]=c;else a.push(c);write(a);return c},
 remove(id){write(read().filter(x=>x.id!==id))},
 get(id){return read().find(x=>x.id===id)||null},
 duplicate(id){const c=read().find(x=>x.id===id);if(!c)return null;const n={...structuredClone(c),id:crypto.randomUUID(),name:c.name+" · copia",updatedAt:Date.now()};a.push(n);write(a);return n}
};