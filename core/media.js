export function compressImage(file,{max=720,quality=.76,type="image/jpeg"}={}){
  return new Promise((resolve,reject)=>{
    if(!file)return resolve("");
    if(!file.type.startsWith("image/"))return reject(new Error("Archivo no válido"));
    const reader=new FileReader();
    reader.onerror=()=>reject(new Error("No se pudo leer la imagen"));
    reader.onload=()=>{
      const img=new Image();
      img.onerror=()=>reject(new Error("Imagen no válida"));
      img.onload=()=>{
        const scale=Math.min(1,max/Math.max(img.width,img.height));
        const canvas=document.createElement("canvas");
        canvas.width=Math.max(1,Math.round(img.width*scale));
        canvas.height=Math.max(1,Math.round(img.height*scale));
        const ctx=canvas.getContext("2d");
        ctx.drawImage(img,0,0,canvas.width,canvas.height);
        resolve(canvas.toDataURL(type,quality));
      };
      img.src=reader.result;
    };
    reader.readAsDataURL(file);
  });
}
