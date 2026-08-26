"use client";

import { useId, useRef, useState, useTransition } from "react";
import { motion, AnimatePresence } from "motion/react";
import { CheckCircle2, XCircle, Clock, Search } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import MarkPaidButton from "@/components/mark-paid-button";
import { buscarSocioPorDni, type IngresoResultado } from "@/lib/actions/socios";
import { cn } from "@/lib/utils";

const NIVEL_UI = {
  pagado: { label: "AL DÍA — puede ingresar", icon: CheckCircle2, className: "text-emerald-400 border-emerald-500/40 bg-emerald-500/10" },
  por_vencer: { label: "POR VENCER", icon: Clock, className: "text-primary border-primary/40 bg-primary/10" },
  vencida: { label: "CUOTA VENCIDA", icon: XCircle, className: "text-destructive border-destructive/40 bg-destructive/10" },
  pendiente: { label: "SIN CUOTA REGISTRADA", icon: Clock, className: "text-muted-foreground border-border bg-muted" },
  // "pendiente" con una fecha de vencimiento real (lejana, más de 3 días) es
  // un socio al día que todavía no llegó a la ventana de "por vencer" — no
  // es lo mismo que un socio sin ninguna cuota cargada. Mostrar el mismo
  // cartel de "SIN CUOTA REGISTRADA" ahí es contradictorio con la fecha de
  // vencimiento que se muestra debajo.
  pendiente_con_fecha: { label: "AL DÍA", icon: CheckCircle2, className: "text-emerald-400 border-emerald-500/40 bg-emerald-500/10" },
};

export default function IngresoPage() {
  const dniId = useId();
  const [dni, setDni] = useState("");
  const [resultado, setResultado] = useState<IngresoResultado | null>(null);
  const [pending, startTransition] = useTransition();
  const [lastDni, setLastDni] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  function buscar(e: React.FormEvent) {
    e.preventDefault();
    if (!dni.trim() || pending) return;
    const buscado = dni;
    startTransition(async () => {
      try {
        const r = await buscarSocioPorDni(buscado);
        setResultado(r);
        setLastDni(buscado);
      } catch {
        toast.error("No se pudo buscar el DNI. Probá de nuevo.");
      } finally {
        // Solo limpiamos el input si el operador no escribió ya el
        // próximo DNI mientras esta búsqueda estaba en vuelo — si no,
        // se le borraba lo que estaba tipeando.
        setDni((current) => (current === buscado ? "" : current));
        inputRef.current?.focus();
      }
    });
  }

  function handleCuotaPagada() {
    setResultado((prev) => {
      if (!prev || "error" in prev) return prev;
      return { ...prev, nivel: "pagado", cuotaId: null, diasRestantes: null };
    });
  }

  return (
    <div className="mx-auto flex max-w-lg flex-col gap-6">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-foreground">Control de ingreso</h1>
        <p className="text-sm text-muted-foreground">Escaneá o tipeá el DNI y presioná Enter.</p>
      </div>

      <form onSubmit={buscar} className="flex gap-2">
        <Label htmlFor={dniId} className="sr-only">
          DNI
        </Label>
        <Input
          id={dniId}
          ref={inputRef}
          autoFocus
          inputMode="numeric"
          placeholder="DNI"
          value={dni}
          onChange={(e) => setDni(e.target.value)}
          className="h-14 text-center text-2xl tracking-widest"
        />
        <Button type="submit" size="lg" className="h-14 px-6" disabled={pending}>
          <Search className="size-5" />
        </Button>
      </form>

      <AnimatePresence mode="wait">
        {resultado && (
          <motion.div
            key={lastDni}
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            {"error" in resultado ? (
              <Card className="border-destructive/40 bg-destructive/5">
                <CardContent className="flex items-center gap-3 py-6">
                  <XCircle className="size-6 shrink-0 text-destructive" />
                  <p className="text-sm">{resultado.error}</p>
                </CardContent>
              </Card>
            ) : (
              (() => {
                const ui =
                  resultado.nivel === "pendiente" && resultado.diasRestantes !== null
                    ? NIVEL_UI.pendiente_con_fecha
                    : NIVEL_UI[resultado.nivel];
                const Icon = ui.icon;
                return (
                  <Card className={cn("border", ui.className)}>
                    <CardContent className="flex flex-col items-center gap-2 py-8 text-center">
                      <Icon className="size-10" />
                      <p className="text-xl font-bold">{resultado.nombre}</p>
                      <p className="font-heading text-sm font-semibold tracking-widest uppercase">{ui.label}</p>
                      {resultado.diasRestantes !== null && (
                        <p className="text-sm text-muted-foreground">
                          {resultado.diasRestantes >= 0
                            ? `Vence en ${resultado.diasRestantes} día(s) (${resultado.fechaVencimiento})`
                            : `Vencida hace ${Math.abs(resultado.diasRestantes)} día(s) (${resultado.fechaVencimiento})`}
                        </p>
                      )}
                      {resultado.nivel !== "pagado" && resultado.cuotaId && (
                        <div className="mt-2">
                          <MarkPaidButton cuotaId={resultado.cuotaId} onSuccess={handleCuotaPagada} />
                        </div>
                      )}
                    </CardContent>
                  </Card>
                );
              })()
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
