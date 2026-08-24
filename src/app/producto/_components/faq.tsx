import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { FAQ } from "../_data";
import Reveal from "./reveal";

export default function Faq() {
  return (
    <section id="faq" className="mx-auto max-w-3xl px-4 py-20">
      <Reveal>
        <h2 className="text-center text-3xl font-bold">Preguntas frecuentes</h2>
      </Reveal>
      <Reveal delay={0.1}>
        <Accordion type="single" collapsible className="mt-10">
          {FAQ.map((f, i) => (
            <AccordionItem key={i} value={`item-${i}`}>
              <AccordionTrigger className="text-left font-heading font-semibold uppercase tracking-wide">
                {f.pregunta}
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground">{f.respuesta}</AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </Reveal>
    </section>
  );
}
