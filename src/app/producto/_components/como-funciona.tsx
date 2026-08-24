import { PASOS } from "../_data";
import Reveal from "./reveal";

export default function ComoFunciona() {
  return (
    <section className="mx-auto max-w-4xl px-4 py-20">
      <Reveal>
        <h2 className="text-center text-3xl font-bold">Cómo empezás</h2>
        <p className="mx-auto mt-3 max-w-md text-center text-muted-foreground">
          Sin curso, sin capacitación de semanas. Así de simple.
        </p>
      </Reveal>

      <ol className="relative mt-14 flex flex-col gap-10 sm:gap-12">
        <div className="absolute left-5 top-2 bottom-2 hidden w-px bg-border sm:block" aria-hidden="true" />
        {PASOS.map((p, i) => (
          <Reveal key={p.titulo} delay={i * 0.06}>
            <li className="relative flex items-start gap-5">
              <span className="relative z-10 flex size-10 shrink-0 items-center justify-center rounded-full border border-primary/40 bg-background font-heading text-sm font-bold text-primary">
                {i + 1}
              </span>
              <div>
                <p className="font-heading font-semibold uppercase tracking-wide">{p.titulo}</p>
                <p className="mt-1 text-sm text-muted-foreground">{p.descripcion}</p>
              </div>
            </li>
          </Reveal>
        ))}
      </ol>
    </section>
  );
}
