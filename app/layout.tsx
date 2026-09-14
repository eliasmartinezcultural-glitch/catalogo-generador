import type { Metadata } from "next";
import "./globals.css";
import "./catalog-pro.css";
import "./catalog-pro-actions.css";
import "./catalog-editor-pro.css";

export const metadata: Metadata = {
  title: "Catálogo Studio",
  description: "Generador profesional de catálogos digitales personalizados.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  );
}
