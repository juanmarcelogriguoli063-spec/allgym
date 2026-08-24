import Link from "next/link";
import { ArrowRight } from "lucide-react";
import GymLogo from "@/components/gym-logo";
import { Button } from "@/components/ui/button";
import Reveal from "./reveal";

export default function Hero() {
  return (
    <section className="relative overflow-hidden px-4 pb-20 pt-28 text-center sm:pt-36">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,color-mix(in_oklch,var(--primary)_16%,transparent),transparent_55%)]" />
      <div className="relative mx-auto max-w-3xl">
        <Reveal>
          <span className="inline-block rounded-full border border-primary/30 bg-primary/10 px-3 py-1 font-heading text-xs font-semibold uppercase tracking-widest text-primary">
            All Gym — software de gestión
          </span>
        </Reveal>
        <Reveal delay={0.1}>
          <h1 className="mt-6 text-4xl font-bold leading-tight tracking-tight sm:text-6xl">
            El sistema que hace crecer tu gimnasio, no otra planilla que llenar
          </h1>
        </Reveal>
        <Reveal delay={0.2}>
          <p className="mx-auto mt-6 max-w-xl text-lg text-muted-foreground">
            Cuotas, finanzas, control de acceso y recordatorios de WhatsApp — todo en un
            solo panel, hecho a medida para gimnasios como el tuyo. Sin contrato atado.
          </p>
        </Reveal>
        <Reveal delay={0.3}>
          <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
            <Button asChild size="lg" className="gap-2 font-heading uppercase tracking-wide">
              <a href="#contacto">
                Solicitar una demo <ArrowRight className="size-4" />
              </a>
            </Button>
            <Button asChild size="lg" variant="outline" className="font-heading uppercase tracking-wide">
              <a href="#planes">Ver planes</a>
            </Button>
          </div>
        </Reveal>
        <Reveal delay={0.4}>
          <div className="mt-16 flex items-center justify-center gap-2 text-xs text-muted-foreground">
            <GymLogo size="sm" className="opacity-70" />
            <span>ya está en uso en producción</span>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
