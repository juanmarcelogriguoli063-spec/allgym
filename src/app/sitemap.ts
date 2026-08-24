import type { MetadataRoute } from "next";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://allgym-azure.vercel.app";

export default function sitemap(): MetadataRoute.Sitemap {
  const rutas = ["", "/producto", "/producto/terminos", "/producto/privacidad"];
  return rutas.map((ruta) => ({
    url: `${SITE_URL}${ruta}`,
    lastModified: new Date(),
  }));
}
