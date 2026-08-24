import { Wallet, MessageCircle, ScanLine, LayoutDashboard, Globe, TrendingDown } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { BENEFICIOS } from "../_data";
import Reveal from "./reveal";

const ICONOS = [Wallet, MessageCircle, ScanLine, LayoutDashboard, Globe, TrendingDown];

export default function Beneficios() {
  return (
    <section id="beneficios" className="mx-auto max-w-6xl px-4 py-20">
      <Reveal>
        <h2 className="text-center text-3xl font-bold">Lo que realmente cambia en tu día a día</h2>
      </Reveal>
      <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {BENEFICIOS.map((b, i) => {
          const Icon = ICONOS[i % ICONOS.length];
          return (
            <Reveal key={b.titulo} delay={(i % 3) * 0.08}>
              <Card className="h-full">
                <CardContent className="flex h-full flex-col gap-3 pt-6">
                  <Icon className="size-7 text-primary" />
                  <p className="font-heading font-semibold leading-snug">{b.titulo}</p>
                  <p className="text-sm text-muted-foreground">{b.descripcion}</p>
                </CardContent>
              </Card>
            </Reveal>
          );
        })}
      </div>
    </section>
  );
}
