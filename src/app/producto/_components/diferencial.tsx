import { DIFERENCIALES } from "../_data";
import Reveal from "./reveal";

export default function Diferencial() {
  return (
    <section className="border-y border-border bg-card/40 px-4 py-20">
      <div className="mx-auto max-w-5xl">
        <Reveal>
          <h2 className="text-center text-3xl font-bold">Por qué elegirnos</h2>
          <p className="mx-auto mt-3 max-w-lg text-center text-muted-foreground">
            El software de gestión de gimnasios "grande" tiene un problema conocido:
            contratos difíciles de cancelar, soporte que desaparece después de firmar,
            y precios que suben solos.
          </p>
        </Reveal>

        <div className="mt-12 grid gap-6 sm:grid-cols-2">
          {DIFERENCIALES.map((d, i) => (
            <Reveal key={d.titulo} delay={i * 0.08}>
              <div className="border-l-2 border-primary/50 pl-5">
                <p className="font-heading font-semibold uppercase tracking-wide">{d.titulo}</p>
                <p className="mt-1 text-sm text-muted-foreground">{d.descripcion}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
