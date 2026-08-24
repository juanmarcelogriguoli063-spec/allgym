import { Dumbbell } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import Reveal from "./reveal";

// Preparado para sumar casos de éxito reales a medida que existan.
// Deliberadamente no incluye testimonios ni métricas inventadas.
const CASOS = [
  {
    nombre: "Griguoli Gym",
    detalle: "Primer gimnasio en producción con All Gym — gestión completa desde el día uno.",
    activo: true,
  },
  { nombre: "Tu gimnasio podría estar acá", detalle: "Sumate como uno de los primeros casos de éxito.", activo: false },
  { nombre: "Tu gimnasio podría estar acá", detalle: "Sumate como uno de los primeros casos de éxito.", activo: false },
];

export default function PruebaSocial() {
  return (
    <section className="mx-auto max-w-5xl px-4 py-20">
      <Reveal>
        <h2 className="text-center text-3xl font-bold">Quién ya confía en All Gym</h2>
        <p className="mx-auto mt-3 max-w-lg text-center text-muted-foreground">
          Somos honestos: estamos empezando. Preferimos eso a inventar testimonios.
        </p>
      </Reveal>

      <div className="mt-12 grid gap-4 sm:grid-cols-3">
        {CASOS.map((c, i) => (
          <Reveal key={i} delay={i * 0.08}>
            <Card className={c.activo ? "h-full border-primary/30" : "h-full border-dashed opacity-60"}>
              <CardContent className="flex h-full flex-col items-center gap-3 py-10 text-center">
                <Dumbbell className={c.activo ? "size-7 text-primary" : "size-7 text-muted-foreground"} />
                <p className="font-heading font-semibold">{c.nombre}</p>
                <p className="text-sm text-muted-foreground">{c.detalle}</p>
              </CardContent>
            </Card>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
