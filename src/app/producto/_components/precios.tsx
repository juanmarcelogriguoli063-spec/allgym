import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { PLANES } from "../_data";
import Reveal from "./reveal";

export default function Precios() {
  return (
    <section id="planes" className="mx-auto max-w-6xl px-4 py-20">
      <Reveal>
        <h2 className="text-center text-3xl font-bold">Planes a la medida de tu gimnasio</h2>
        <p className="mx-auto mt-3 max-w-lg text-center text-muted-foreground">
          El precio se ajusta a la cantidad de socios y a qué módulos necesitás.
          Sin sorpresas ni letra chica — te lo confirmamos en la primera charla.
        </p>
      </Reveal>

      <div className="mt-12 grid gap-6 lg:grid-cols-3">
        {PLANES.map((p, i) => (
          <Reveal key={p.nombre} delay={i * 0.1}>
            <Card
              className={cn(
                "flex h-full flex-col",
                p.destacado ? "border-primary shadow-lg shadow-primary/10" : "border-border"
              )}
            >
              <CardContent className="flex h-full flex-col pt-6">
                {p.destacado && (
                  <span className="mb-3 w-fit rounded-full bg-primary px-3 py-1 font-heading text-xs font-bold uppercase tracking-widest text-primary-foreground">
                    Recomendado
                  </span>
                )}
                <p className="font-heading text-xl font-bold uppercase tracking-wide">{p.nombre}</p>
                <p className="mt-1 text-sm text-muted-foreground">{p.para}</p>
                <p className="mt-6 font-heading text-2xl font-bold text-primary">Consultanos</p>
                <ul className="mt-6 flex flex-1 flex-col gap-2.5 text-sm">
                  {p.features.map((f) => (
                    <li key={f} className="flex items-start gap-2">
                      <Check className="mt-0.5 size-4 shrink-0 text-primary" />
                      <span className="text-muted-foreground">{f}</span>
                    </li>
                  ))}
                </ul>
                <Button
                  asChild
                  className="mt-8 font-heading uppercase tracking-wide"
                  variant={p.destacado ? "default" : "outline"}
                >
                  <a href="#contacto">Solicitar presupuesto</a>
                </Button>
              </CardContent>
            </Card>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
