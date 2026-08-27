import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { MapPin, Phone, Dumbbell, TrendingUp, Users } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import GymLogo from "@/components/gym-logo";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import SolicitudForm from "@/components/solicitud-form";
import FloatingWhatsapp from "@/components/floating-whatsapp";
import Reveal from "@/app/producto/_components/reveal";

const TITLE = "Griguoli Gym — Entrená tu cuerpo, transformá tu vida";
const DESCRIPTION =
  "Gimnasio con instalaciones modernas: 36 máquinas de fuerza, zona de cardio, funcional y peso libre. Sumate a Griguoli Gym.";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  openGraph: { title: TITLE, description: DESCRIPTION, type: "website", locale: "es_AR" },
  twitter: { card: "summary_large_image", title: TITLE, description: DESCRIPTION },
};

export default async function HomePage() {
  const supabase = await createClient();

  const [{ data: gym }, { data: planes }] = await Promise.all([
    supabase.from("gym_info").select("*").single(),
    supabase.from("planes").select("*").eq("activo", true).order("precio"),
  ]);

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-40 border-b border-border/60 bg-background/80 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
          <GymLogo size="sm" />
          <nav className="hidden items-center gap-6 text-sm text-muted-foreground sm:flex">
            <a href="#planes" className="hover:text-foreground">Planes</a>
            <a href="#gym" className="hover:text-foreground">El gym</a>
            <a href="#contacto" className="hover:text-foreground">Sumate</a>
          </nav>
          <Button asChild variant="outline" size="sm">
            <Link href="/login">Ingresar</Link>
          </Button>
        </div>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden px-4 py-24 text-center">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,color-mix(in_oklch,var(--primary)_14%,transparent),transparent_60%)]" />
        <div className="relative mx-auto max-w-2xl">
          <Reveal>
            <GymLogo size="lg" className="mx-auto" />
          </Reveal>
          <Reveal delay={0.1}>
            <p className="mt-4 text-lg text-muted-foreground">
              {gym?.nombre ?? "Griguoli Gym"} — entrená tu cuerpo, transformá tu vida.
            </p>
            <p className="mt-2 text-sm text-muted-foreground">
              Instalaciones modernas, 36 máquinas de fuerza, zona de cardio, funcional y peso libre.
            </p>
          </Reveal>
          <Reveal delay={0.2}>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
              <Button asChild size="lg" className="font-heading uppercase tracking-wide">
                <a href="#contacto">Quiero ser socio</a>
              </Button>
              <Button asChild size="lg" variant="outline" className="font-heading uppercase tracking-wide">
                <a href="#planes">Ver planes</a>
              </Button>
            </div>
          </Reveal>
        </div>
      </section>

      {/* Highlights */}
      <section className="mx-auto grid max-w-5xl gap-4 px-4 pb-8 sm:grid-cols-3">
        {[
          { icon: Dumbbell, label: "36 máquinas premium", desc: "6 por grupo muscular" },
          { icon: TrendingUp, label: "1250 m²", desc: "cardio, funcional y peso libre" },
          { icon: Users, label: "Vestuarios y lockers", desc: "para socios y socias" },
        ].map((f, i) => (
          <Reveal key={f.label} delay={i * 0.08}>
            <Card>
              <CardContent className="flex flex-col items-center gap-2 py-8 text-center">
                <f.icon className="size-8 text-primary" />
                <p className="font-heading font-semibold uppercase tracking-wide">{f.label}</p>
                <p className="text-sm text-muted-foreground">{f.desc}</p>
              </CardContent>
            </Card>
          </Reveal>
        ))}
      </section>

      {/* Planes */}
      <section id="planes" className="mx-auto max-w-5xl px-4 py-16">
        <Reveal>
          <h2 className="text-center text-2xl font-bold">Planes</h2>
        </Reveal>
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {(planes ?? []).map((p, i) => (
            <Reveal key={p.id} delay={i * 0.08}>
              <Card className="h-full border-border/60">
                <CardContent className="flex flex-col items-center gap-2 py-10 text-center">
                  <p className="font-heading text-sm font-semibold uppercase tracking-widest text-muted-foreground">
                    {p.nombre}
                  </p>
                  <p className="text-3xl font-bold text-primary">${Number(p.precio).toLocaleString("es-AR")}</p>
                  <p className="text-xs text-muted-foreground">cada {p.duracion_dias} días</p>
                </CardContent>
              </Card>
            </Reveal>
          ))}
          {(planes ?? []).length === 0 && (
            <p className="col-span-full text-center text-sm text-muted-foreground">
              Consultanos por los planes disponibles.
            </p>
          )}
        </div>
      </section>

      {/* El gym */}
      <section id="gym" className="mx-auto max-w-5xl px-4 py-16">
        <Reveal>
          <h2 className="text-center text-2xl font-bold">Conocé el gym</h2>
          <p className="mx-auto mt-2 max-w-md text-center text-sm text-muted-foreground">
            Así está distribuido nuestro espacio, zona por zona.
          </p>
        </Reveal>
        <Reveal delay={0.1}>
          <div className="mx-auto mt-8 max-w-3xl overflow-hidden rounded-xl border border-border">
            <Image
              src="/branding/ChatGPT Image May 21, 2026, 01_40_41 PM.png"
              alt="Distribución de Griguoli Gym — 1250 m², zona cardio, pecho, espalda, hombros, brazos, piernas, peso libre y funcional"
              width={1024}
              height={1536}
              className="w-full"
              sizes="(min-width: 768px) 768px, 100vw"
            />
          </div>
        </Reveal>
      </section>

      {/* Contacto / alta */}
      <section id="contacto" className="mx-auto max-w-md px-4 py-16">
        <Reveal>
          <h2 className="text-center text-2xl font-bold">Sumate</h2>
          <p className="mt-2 text-center text-sm text-muted-foreground">
            Dejanos tus datos y te contactamos para arrancar.
          </p>
        </Reveal>
        <Reveal delay={0.1}>
          <div className="mt-8">
            <SolicitudForm />
          </div>
        </Reveal>
      </section>

      <footer className="border-t border-border px-4 py-10 text-center text-sm text-muted-foreground">
        <GymLogo size="sm" className="mx-auto mb-3" />
        <div className="flex flex-col items-center gap-1">
          {gym?.direccion && (
            <span className="flex items-center gap-1.5">
              <MapPin className="size-3.5" /> {gym.direccion}
            </span>
          )}
          {gym?.telefono && (
            <span className="flex items-center gap-1.5">
              <Phone className="size-3.5" /> {gym.telefono}
            </span>
          )}
        </div>
        <p className="mt-4 text-xs">© {new Date().getFullYear()} {gym?.nombre ?? "Griguoli Gym"}</p>
      </footer>

      <FloatingWhatsapp telefono={gym?.telefono ?? null} />
    </div>
  );
}
