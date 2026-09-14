export type Template = "elegante" | "comercial" | "minimal";

export type Item = {
  id: string;
  name: string;
  description: string;
  price: string;
  category: string;
  image: string;
  tag: string;
};

export type Catalog = {
  business: string;
  subtitle: string;
  description: string;
  logo: string;
  phone: string;
  whatsapp: string;
  instagram: string;
  website: string;
  location: string;
  primary: string;
  secondary: string;
  template: Template;
  items: Item[];
};

export const MAX_ITEMS = 100;

export function cleanPhone(value = "") {
  return value.replace(/[^\d]/g, "");
}

/** Normaliza teléfonos argentinos para enlaces wa.me. */
export function whatsappPhone(value = "") {
  let digits = cleanPhone(value);
  if (!digits) return "";
  if (digits.startsWith("00")) digits = digits.slice(2);
  if (digits.startsWith("+")) digits = cleanPhone(digits);
  if (digits.startsWith("54")) {
    if (digits.startsWith("549")) return digits;
    return `549${digits.slice(2)}`;
  }
  // Formato local frecuente: 10 dígitos (ej. 299 + número).
  if (digits.length === 10) return `549${digits}`;
  return digits;
}

export function instagramUsername(value = "") {
  return value.trim().replace(/^@+/, "").replace(/[^a-zA-Z0-9._]/g, "");
}

export function safeExternalUrl(value = "") {
  const raw = value.trim();
  if (!raw) return "";
  try {
    const url = new URL(/^https?:\/\//i.test(raw) ? raw : `https://${raw}`);
    return url.protocol === "http:" || url.protocol === "https:" ? url.toString() : "";
  } catch {
    return "";
  }
}

export function normalizeCatalog(input: unknown): Catalog | null {
  if (!input || typeof input !== "object") return null;
  const x = input as Partial<Catalog> & { items?: unknown };
  if (typeof x.business !== "string" || !Array.isArray(x.items)) return null;

  const items = x.items.slice(0, MAX_ITEMS).filter(Boolean).map((raw, index) => {
    const i = (raw && typeof raw === "object" ? raw : {}) as Partial<Item>;
    return {
      id: String(i.id || `item-${index + 1}`),
      name: String(i.name || "Producto o servicio"),
      description: String(i.description || ""),
      price: String(i.price || "Consultar"),
      category: String(i.category || "General"),
      image: String(i.image || ""),
      tag: String(i.tag || ""),
    };
  });

  return {
    business: x.business.trim(),
    subtitle: String(x.subtitle || "Catálogo digital"),
    description: String(x.description || ""),
    logo: String(x.logo || ""),
    phone: String(x.phone || ""),
    whatsapp: String(x.whatsapp || ""),
    instagram: String(x.instagram || ""),
    website: String(x.website || ""),
    location: String(x.location || ""),
    primary: /^#[0-9a-f]{6}$/i.test(String(x.primary || "")) ? String(x.primary) : "#172033",
    secondary: /^#[0-9a-f]{6}$/i.test(String(x.secondary || "")) ? String(x.secondary) : "#f5f3ee",
    template: x.template === "comercial" || x.template === "minimal" ? x.template : "elegante",
    items,
  };
}

export function slugify(value: string) {
  return value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 48) || "catalogo";
}
