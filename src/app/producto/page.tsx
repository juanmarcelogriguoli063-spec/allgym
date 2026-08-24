import type { Metadata } from "next";
import ProductoHeader from "./_components/header";
import Hero from "./_components/hero";
import ProblemaSolucion from "./_components/problema-solucion";
import Beneficios from "./_components/beneficios";
import ComoFunciona from "./_components/como-funciona";
import Diferencial from "./_components/diferencial";
import PruebaSocial from "./_components/prueba-social";
import Precios from "./_components/precios";
import Faq from "./_components/faq";
import CtaFinal from "./_components/cta-final";
import ProductoFooter from "./_components/footer";

const TITLE = "All Gym — Software de gestión para gimnasios";
const DESCRIPTION =
  "Sistema de gestión para gimnasios: cuotas, finanzas, control de acceso y recordatorios de WhatsApp en un solo panel. Precio fijo, sin contrato atado.";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  openGraph: {
    title: TITLE,
    description: DESCRIPTION,
    type: "website",
    locale: "es_AR",
  },
  twitter: {
    card: "summary_large_image",
    title: TITLE,
    description: DESCRIPTION,
  },
};

const JSON_LD = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  name: "All Gym",
  applicationCategory: "BusinessApplication",
  operatingSystem: "Web",
  description: DESCRIPTION,
  offers: { "@type": "Offer", availability: "https://schema.org/InStock" },
};

export default function ProductoPage() {
  return (
    <div className="min-h-screen bg-background">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(JSON_LD) }} />
      <ProductoHeader />
      <main>
        <Hero />
        <ProblemaSolucion />
        <Beneficios />
        <ComoFunciona />
        <Diferencial />
        <PruebaSocial />
        <Precios />
        <Faq />
        <CtaFinal />
      </main>
      <ProductoFooter />
    </div>
  );
}
