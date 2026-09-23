const enc=new TextEncoder(),dec=new TextDecoder();
export function encodeState(state){const bytes=enc.encode(JSON.stringify(state));let s="";for(const b of bytes)s+=String.fromCharCode(b);return btoa(s).replace(/\+/g,"-").replace(/\//g,"_").replace(/=+$/,"");}
export function decodeState(raw){if(!raw)return null;try{const bin=atob(raw.replace(/-/g,"+").replace(/_/g,"/")+"===");return JSON.parse(dec.decode(Uint8Array.from(bin,c=>c.charCodeAt(0))));}catch{return null;}}
export function buildShareUrl(state){return location.href.split("#")[0]+"#catalog="+encodeState(state);}
