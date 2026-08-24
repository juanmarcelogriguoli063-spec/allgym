import LeadForm from "./lead-form";
import Reveal from "./reveal";

export default function CtaFinal() {
  return (
    <section id="contacto" className="relative overflow-hidden px-4 py-20">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,color-mix(in_oklch,var(--primary)_12%,transparent),transparent_55%)]" />
      <div className="relative mx-auto max-w-lg">
        <Reveal>
          <h2 className="text-center text-3xl font-bold">Empecemos</h2>
          <p className="mx-auto mt-3 max-w-sm text-center text-muted-foreground">
            15 minutos de charla para entender tu gimnasio y contarte cómo All Gym se
            adapta a tu operación.
          </p>
        </Reveal>
        <Reveal delay={0.15} className="mt-10">
          <LeadForm />
        </Reveal>
      </div>
    </section>
  );
}
