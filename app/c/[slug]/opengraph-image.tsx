import { ImageResponse } from "next/og";
import { readCatalog } from "../../../lib/catalog-store";

export const runtime = "nodejs";
export const alt = "Catálogo digital";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const c = await readCatalog(slug);
  const primary = c?.primary || "#172033";
  const secondary = c?.secondary || "#f5f3ee";
  const business = c?.business || "Catálogo digital";
  const subtitle = c?.subtitle || "Productos y servicios";
  const description = c?.description || "Conocé la propuesta, los precios y cómo consultar.";
  const firstImage = c?.items?.find(item => item.image)?.image;

  return new ImageResponse(
    <div style={{ width: "100%", height: "100%", display: "flex", background: secondary, color: "#171a1f", fontFamily: "sans-serif" }}>
      <div style={{ width: "70%", height: "100%", display: "flex", flexDirection: "column", justifyContent: "center", padding: "65px 70px", background: primary, color: "white" }}>
        <div style={{ display: "flex", fontSize: 22, fontWeight: 800, opacity: 0.82, marginBottom: 35 }}>{subtitle}</div>
        <div style={{ display: "flex", fontSize: 64, lineHeight: 1.02, fontWeight: 900, letterSpacing: -2, marginBottom: 22 }}>{business}</div>
        <div style={{ display: "flex", fontSize: 24, lineHeight: 1.35, opacity: 0.88, maxWidth: 700 }}>{description.slice(0, 150)}</div>
        <div style={{ display: "flex", marginTop: 38, fontSize: 20, fontWeight: 800, opacity: 0.72 }}>CATÁLOGO DIGITAL · PRODUCTOS · SERVICIOS</div>
      </div>
      <div style={{ width: "30%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", padding: 34, background: secondary }}>
        {firstImage ? <img src={firstImage} width="300" height="300" style={{ objectFit: "cover", borderRadius: 18 }} /> : <div style={{ width: 300, height: 300, borderRadius: 18, background: "#ffffff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 100, fontWeight: 900 }}>{business.slice(0, 1).toUpperCase()}</div>}
      </div>
    </div>,
    { ...size },
  );
}
