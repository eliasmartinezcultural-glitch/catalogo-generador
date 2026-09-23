export const PRESETS=[
{id:"almacen",name:"Almacén",desc:"Productos y pedidos",color:"#1f6b52",emojis:["🥖","🥚","🧀","🥫"],tag:"Productos ricos, atención cercana."},
{id:"gastronomia",name:"Gastronomía",desc:"Comida y reservas",color:"#a14b32",emojis:["🍕","🍔","🥗","🍰"],tag:"Hecho para disfrutar."},
{id:"emprendimiento",name:"Emprendimiento",desc:"Productos artesanales",color:"#8b5a3c",emojis:["🎁","🧶","🕯️","🪴"],tag:"Hecho por nosotros."},
{id:"servicios",name:"Servicios",desc:"Turnos y consultas",color:"#315d8c",emojis:["📅","🛠️","📸","💼"],tag:"Consultas y reservas por WhatsApp."},
{id:"profesional",name:"Profesional",desc:"Perfil + servicios",color:"#30343b",emojis:["⭐","📌","🧾","📞"],tag:"Información clara y contacto directo."}
];
export function getPreset(id){return PRESETS.find(p=>p.id===id)||PRESETS[0]}