export const SCHEMA_VERSION=4;

export const LIMITS={
  products:40,name:80,tag:120,address:120,phone:30,price:20,
  description:180,image:180000,logo:120000,
  hours:120,payment:160,delivery:160,instagram:80,facebook:80
};

export const DEFAULT_STATE={
  schemaVersion:SCHEMA_VERSION,presetId:"almacen",
  business:{
    logo:"",name:"Almacén La Esquina",tag:"Productos ricos, atención cercana.",
    phone:"2995551234",address:"San Patricio del Chañar",color:"#1f6b52",
    hours:"Lun a sáb · 9 a 20 hs",payment:"Efectivo · Transferencia",
    delivery:"Retiro en el local · Consultar envío",instagram:"",facebook:""
  },
  appearance:{theme:"clean",layout:"cards",showPrices:true,showDescriptions:true,showLocation:true,showInfo:true,buttonText:"Pedir por WhatsApp"},
  products:[
    {name:"Pan casero",price:"3500",description:"Recién elaborado.",emoji:"🥖",image:"",featured:true},
    {name:"Docena de huevos",price:"5000",description:"Producto fresco.",emoji:"🥚",image:"",featured:false},
    {name:"Mermelada artesanal",price:"4500",description:"Sabor casero.",emoji:"🍓",image:"",featured:false},
    {name:"Caja de productos",price:"12000",description:"Una selección para regalar.",emoji:"🎁",image:"",featured:true}
  ]
};

export function normalize(input={}){
  const b=input.business||{}, a=input.appearance||{};
  const products=Array.isArray(input.products)?input.products.slice(0,LIMITS.products):[];
  const cleanUrl=v=>String(v??"").trim().slice(0,120);
  return {
    schemaVersion:SCHEMA_VERSION,presetId:String(input.presetId||"almacen"),
    business:{
      logo:String(b.logo??"").slice(0,LIMITS.logo),
      name:String(b.name??DEFAULT_STATE.business.name).trim().slice(0,LIMITS.name),
      tag:String(b.tag??DEFAULT_STATE.business.tag).trim().slice(0,LIMITS.tag),
      phone:String(b.phone??"").trim().slice(0,LIMITS.phone),
      address:String(b.address??"").trim().slice(0,LIMITS.address),
      color:/^#[0-9a-f]{6}$/i.test(b.color)?b.color:"#1f6b52",
      hours:String(b.hours??"").trim().slice(0,LIMITS.hours),
      payment:String(b.payment??"").trim().slice(0,LIMITS.payment),
      delivery:String(b.delivery??"").trim().slice(0,LIMITS.delivery),
      instagram:cleanUrl(b.instagram).slice(0,LIMITS.instagram),
      facebook:cleanUrl(b.facebook).slice(0,LIMITS.facebook)
    },
    appearance:{
      theme:["clean","soft","bold"].includes(a.theme)?a.theme:"clean",
      layout:["cards","list","featured"].includes(a.layout)?a.layout:"cards",
      showPrices:a.showPrices!==false,showDescriptions:a.showDescriptions!==false,
      showLocation:a.showLocation!==false,showInfo:a.showInfo!==false,
      buttonText:String(a.buttonText||"Pedir por WhatsApp").trim().slice(0,40)
    },
    products:products.map((p,i)=>({
      name:String(p?.name??"Producto "+(i+1)).trim().slice(0,LIMITS.name),
      image:String(p?.image??"").slice(0,LIMITS.image),
      price:String(p?.price??"").trim().slice(0,LIMITS.price),
      description:String(p?.description??"").trim().slice(0,LIMITS.description),
      emoji:String(p?.emoji??["🥖","🥚","🍓","🎁","🧁","☕"][i%6]).slice(0,4),
      featured:Boolean(p?.featured)
    })).filter(p=>p.name)
  };
}
export function isMeaningful(state){return Boolean(state.business.name&&state.products.length);}
