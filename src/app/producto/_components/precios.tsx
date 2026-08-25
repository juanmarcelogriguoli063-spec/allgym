import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { PLAN } from "../_data";
import Reveal from "./reveal";

export default function Precios() {
  return (
    <section id="planes" className="mx-auto max-w-2xl px-4 py-20">
      <Reveal>
        <h2 className="text-center text-3xl font-bold">Un solo plan, sin letra chica</h2>
        <p className="mx-auto mt-3 max-w-lg text-center text-muted-foreground">
          Nada de escalones ni funciones &ldquo;premium&rdquo; escondidas. El precio se confirma en
          la primera charla — sin sorpresas después.
        </p>
      </Reveal>

      <Reveal delay={0.1}>
        <Card className="mt-12 border-primary shadow-lg shadow-primary/10">
          <CardContent className="flex flex-col items-center pt-8 text-center">
            <p className="font-heading text-2xl font-bold uppercase tracking-wide">{PLAN.nombre}</p>
            <p className="mt-1 text-sm text-muted-foreground">{PLAN.para}</p>
            <p className="mt-6 font-heading text-lg font-bold text-primary">Consultanos el precio</p>

            <ul className="mt-8 grid w-full gap-2.5 text-left text-sm sm:grid-cols-2">
              {PLAN.features.map((f) => (
                <li key={f} className="flex items-start gap-2">
                  <Check className="mt-0.5 size-4 shrink-0 text-primary" />
                  <span className="text-muted-foreground">{f}</span>
                </li>
              ))}
            </ul>

            <Button asChild size="lg" className="mt-8 font-heading uppercase tracking-wide">
              <a href="#contacto">Solicitar presupuesto</a>
            </Button>
          </CardContent>
        </Card>
      </Reveal>
    </section>
  );
}
