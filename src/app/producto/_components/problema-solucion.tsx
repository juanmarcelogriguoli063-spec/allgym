import { Check, X } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import Reveal from "./reveal";

const PROBLEMAS = [
  "Cobrás las cuotas de memoria, o mirando un cuaderno",
  "No sabés cuánto facturaste este mes sin armar una planilla",
  "Perseguís socios por WhatsApp uno por uno para que paguen",
  "Cualquiera con el nombre de otro puede entrar sin que te enteres",
  "Pagás de más por un software genérico que no entiende tu negocio",
];

const SOLUCIONES = [
  "El sistema te dice al instante quién debe y desde cuándo",
  "Dashboard financiero: ingresos, egresos y balance en tiempo real",
  "Recordatorio de WhatsApp armado automáticamente, un clic y listo",
  "Control de acceso por DNI: sabés quién puede entrar, sin adivinar",
  "Hecho a tu medida, con precio fijo y soporte directo",
];

export default function ProblemaSolucion() {
  return (
    <section className="mx-auto max-w-5xl px-4 py-20">
      <Reveal>
        <h2 className="text-center text-3xl font-bold">¿Te suena familiar?</h2>
        <p className="mx-auto mt-3 max-w-lg text-center text-muted-foreground">
          Así gestionan la mayoría de los gimnasios chicos y medianos — y así es como
          termina costándoles plata sin que se den cuenta.
        </p>
      </Reveal>

      <div className="mt-12 grid gap-6 md:grid-cols-2">
        <Reveal delay={0.1}>
          <Card className="h-full border-destructive/25">
            <CardContent className="flex flex-col gap-4 pt-6">
              <p className="font-heading text-sm font-semibold uppercase tracking-widest text-destructive">
                Hoy, sin All Gym
              </p>
              <ul className="flex flex-col gap-3 text-sm">
                {PROBLEMAS.map((p) => (
                  <li key={p} className="flex items-start gap-2.5 text-muted-foreground">
                    <X className="mt-0.5 size-4 shrink-0 text-destructive" />
                    {p}
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </Reveal>

        <Reveal delay={0.2}>
          <Card className="h-full border-primary/30">
            <CardContent className="flex flex-col gap-4 pt-6">
              <p className="font-heading text-sm font-semibold uppercase tracking-widest text-primary">
                Con All Gym
              </p>
              <ul className="flex flex-col gap-3 text-sm">
                {SOLUCIONES.map((s) => (
                  <li key={s} className="flex items-start gap-2.5 text-foreground">
                    <Check className="mt-0.5 size-4 shrink-0 text-primary" />
                    {s}
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </Reveal>
      </div>
    </section>
  );
}
