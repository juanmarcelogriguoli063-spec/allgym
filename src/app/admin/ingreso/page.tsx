"use client";

import { useCallback, useRef, useState, useTransition } from "react";
import { motion, AnimatePresence } from "motion/react";
import { CheckCircle2, XCircle, Clock, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import MarkPaidButton from "@/components/mark-paid-button";
import { buscarClientePorDni, type IngresoResultado } from "@/lib/actions/clientes";

const NIVEL_UI = {
  pagado: {
    label: "AL DÍA — PUEDE INGRESAR",
    icon: CheckCircle2,
    bg: "bg-emerald-500/15",
    text: "text-emerald-400",
    border: "border-emerald-500/40",
    tono: "ok" as const,
  },
  por_vencer: {
    label: "POR VENCER",
    icon: Clock,
    bg: "bg-primary/15",
    text: "text-primary",
    border: "border-primary/40",
    tono: "alerta" as const,
  },
  vencida: {
    label: "CUOTA VENCIDA",
    icon: XCircle,
    bg: "bg-destructive/20",
    text: "text-destructive",
    border: "border-destructive/40",
    tono: "error" as const,
  },
  pendiente: {
    label: "SIN CUOTA REGISTRADA",
    icon: Clock,
    bg: "bg-muted",
    text: "text-muted-foreground",
    border: "border-border",
    tono: "alerta" as const,
  },
  pendiente_con_fecha: {
    label: "AL DÍA",
    icon: CheckCircle2,
    bg: "bg-emerald-500/15",
    text: "text-emerald-400",
    border: "border-emerald-500/40",
    tono: "ok" as const,
  },
};

// Beep simple con Web Audio API — no depende de ningun archivo de audio.
// Tono distinto segun el resultado, para que se note incluso sin mirar
// la pantalla (mostrador con gente en fila, poca luz, etc.)
function beep(tono: "ok" | "alerta" | "error") {
  try {
    const Ctx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    const ctx = new Ctx();
    const patrones: Record<typeof tono, { freq: number; dur: number }[]> = {
      ok: [{ freq: 880, dur: 0.12 }],
      alerta: [{ freq: 660, dur: 0.15 }, { freq: 660, dur: 0.15 }],
      error: [{ freq: 220, dur: 0.35 }],
    };
    let t = ctx.currentTime;
    for (const { freq, dur } of patrones[tono]) {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.frequency.value = freq;
      osc.type = tono === "error" ? "sawtooth" : "sine";
      gain.gain.setValueAtTime(0.15, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + dur);
      osc.connect(gain).connect(ctx.destination);
      osc.start(t);
      osc.stop(t + dur);
      t += dur + 0.08;
    }
  } catch {
    // Si el navegador bloquea audio sin interaccion previa, no rompemos nada.
  }
}

export default function IngresoPage() {
  const [dni, setDni] = useState("");
  const [resultado, setResultado] = useState<IngresoResultado | null>(null);
  const [pending, startTransition] = useTransition();
  const [lastDni, setLastDni] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const buscar = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      if (!dni.trim() || pending) return;
      startTransition(async () => {
        const r = await buscarClientePorDni(dni);
        setResultado(r);
        setLastDni(dni);
        setDni("");
        inputRef.current?.focus();

        if ("error" in r) beep("error");
        else {
          const ui = r.nivel === "pendiente" && r.diasRestantes !== null ? NIVEL_UI.pendiente_con_fecha : NIVEL_UI[r.nivel];
          beep(ui.tono);
        }
      });
    },
    [dni, pending]
  );

  return (
    <div className="mx-auto flex max-w-lg flex-col gap-6">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-foreground">Ingreso</h1>
        <p className="text-sm text-muted-foreground">Escaneá o tipeá el DNI y presioná Enter.</p>
      </div>

      <form onSubmit={buscar} className="flex gap-2">
        <Input
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
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            {"error" in resultado ? (
              <div className="flex flex-col items-center gap-3 rounded-2xl border-2 border-destructive/40 bg-destructive/10 px-6 py-10 text-center">
                <XCircle className="size-14 shrink-0 text-destructive" />
                <p className="text-lg font-bold">{resultado.error}</p>
              </div>
            ) : (
              (() => {
                const ui =
                  resultado.nivel === "pendiente" && resultado.diasRestantes !== null
                    ? NIVEL_UI.pendiente_con_fecha
                    : NIVEL_UI[resultado.nivel];
                const Icon = ui.icon;
                return (
                  <div className={`flex flex-col items-center gap-3 rounded-2xl border-2 px-6 py-12 text-center ${ui.bg} ${ui.border}`}>
                    <Icon className={`size-16 shrink-0 ${ui.text}`} />
                    <p className="text-2xl font-bold">{resultado.nombre}</p>
                    <p className={`text-xl font-bold tracking-widest uppercase ${ui.text}`}>{ui.label}</p>
                    {resultado.diasRestantes !== null && (
                      <p className="text-base text-muted-foreground">
                        {resultado.diasRestantes >= 0
                          ? `Vence en ${resultado.diasRestantes} día(s) (${resultado.fechaVencimiento})`
                          : `Vencida hace ${Math.abs(resultado.diasRestantes)} día(s) (${resultado.fechaVencimiento})`}
                      </p>
                    )}
                    {resultado.nivel !== "pagado" && resultado.cuotaId && (
                      <div className="mt-2">
                        <MarkPaidButton cuotaId={resultado.cuotaId} />
                      </div>
                    )}
                  </div>
                );
              })()
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
