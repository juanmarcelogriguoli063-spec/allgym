"use client";

import { useCallback, useRef, useState, useTransition } from "react";
import { motion, AnimatePresence } from "motion/react";
import { CheckCircle2, XCircle, TriangleAlert, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import MarkPaidButton from "@/components/mark-paid-button";
import ClienteAvatar from "@/components/cliente-avatar";
import { buscarClientePorDni, type IngresoResultado } from "@/lib/actions/clientes";
import { formatFecha } from "@/lib/fechas";

type Ok = Exclude<IngresoResultado, { error: string }>;
type Tono = "ok" | "aviso" | "no";

// Un solo cartel que responde la pregunta del mostrador: ¿lo dejo pasar?
function veredicto(r: Ok): { tono: Tono; titulo: string } {
  if (r.estadoCliente !== "activo") {
    return { tono: "no", titulo: r.estadoCliente === "baja" ? "CLIENTE DE BAJA" : "CLIENTE PAUSADO" };
  }
  switch (r.estadoCuota) {
    case "al_dia":
      return { tono: "ok", titulo: "PUEDE INGRESAR" };
    case "vence_hoy":
      return { tono: "aviso", titulo: "PUEDE INGRESAR — VENCE HOY" };
    case "vence_pronto":
      return { tono: "aviso", titulo: "PUEDE INGRESAR — VENCE PRONTO" };
    case "vencida":
      return { tono: "no", titulo: "CUOTA VENCIDA" };
    default:
      return { tono: "no", titulo: "SIN CUOTA REGISTRADA" };
  }
}

const TONO_UI: Record<Tono, { icon: typeof CheckCircle2; card: string; text: string; ring: string }> = {
  ok: { icon: CheckCircle2, card: "bg-emerald-500/10 border-emerald-500/40", text: "text-emerald-400", ring: "ring-emerald-500/60" },
  aviso: { icon: TriangleAlert, card: "bg-primary/10 border-primary/40", text: "text-primary", ring: "ring-primary/60" },
  no: { icon: XCircle, card: "bg-destructive/10 border-destructive/40", text: "text-destructive", ring: "ring-destructive/60" },
};

// Beep con Web Audio API (sin archivos de audio), distinto segun el resultado,
// para que se note aunque no se mire la pantalla.
function beep(tono: Tono) {
  try {
    const Ctx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    const ctx = new Ctx();
    const patrones: Record<Tono, { freq: number; dur: number }[]> = {
      ok: [{ freq: 880, dur: 0.12 }],
      aviso: [{ freq: 660, dur: 0.15 }, { freq: 660, dur: 0.15 }],
      no: [{ freq: 220, dur: 0.35 }],
    };
    let t = ctx.currentTime;
    for (const { freq, dur } of patrones[tono]) {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.frequency.value = freq;
      osc.type = tono === "no" ? "sawtooth" : "sine";
      gain.gain.setValueAtTime(0.15, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + dur);
      osc.connect(gain).connect(ctx.destination);
      osc.start(t);
      osc.stop(t + dur);
      t += dur + 0.08;
    }
  } catch {
    // Si el navegador bloquea el audio, no pasa nada.
  }
}

function diasGrande(dias: number | null): { numero: string; leyenda: string } {
  if (dias === null) return { numero: "—", leyenda: "sin fecha de vencimiento" };
  if (dias < 0) return { numero: String(Math.abs(dias)), leyenda: Math.abs(dias) === 1 ? "día de atraso" : "días de atraso" };
  if (dias === 0) return { numero: "HOY", leyenda: "vence hoy" };
  return { numero: String(dias), leyenda: dias === 1 ? "día restante" : "días restantes" };
}

export default function ControlDeAccesoPage() {
  const [dni, setDni] = useState("");
  const [resultado, setResultado] = useState<IngresoResultado | null>(null);
  const [consultado, setConsultado] = useState("");
  const [n, setN] = useState(0); // cambia en cada busqueda: re-anima aunque sea el mismo DNI
  const [pending, startTransition] = useTransition();
  const inputRef = useRef<HTMLInputElement>(null);

  const consultar = useCallback((valor: string, conSonido: boolean) => {
    startTransition(async () => {
      const r = await buscarClientePorDni(valor);
      setResultado(r);
      setConsultado(valor);
      setN((x) => x + 1);
      if (conSonido) beep("error" in r ? "no" : veredicto(r).tono);
    });
  }, []);

  function buscar(e: React.FormEvent) {
    e.preventDefault();
    if (!dni.trim() || pending) return;
    consultar(dni, true);
    setDni("");
    inputRef.current?.focus();
  }

  return (
    <div className="mx-auto flex max-w-xl flex-col gap-6">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-foreground">Control de acceso</h1>
        <p className="text-sm text-muted-foreground">Tipeá el DNI y presioná Enter.</p>
      </div>

      <form onSubmit={buscar} className="flex gap-2">
        <Input
          ref={inputRef}
          autoFocus
          inputMode="numeric"
          placeholder="DNI"
          aria-label="DNI del cliente"
          value={dni}
          onChange={(e) => setDni(e.target.value)}
          className="h-14 text-center text-2xl tracking-widest"
        />
        <Button type="submit" size="lg" className="h-14 px-6" disabled={pending} aria-label="Buscar">
          <Search className="size-5" />
        </Button>
      </form>

      <div role="status" aria-live="polite">
        <AnimatePresence mode="wait">
          {resultado && (
            <motion.div
              key={n}
              initial={{ opacity: 0, scale: 0.94 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.18 }}
            >
              {"error" in resultado ? (
                <div className="flex flex-col items-center gap-3 rounded-2xl border-2 border-destructive/40 bg-destructive/10 px-6 py-10 text-center">
                  <XCircle className="size-14 text-destructive" />
                  <p className="text-lg font-bold">{resultado.error}</p>
                  <p className="text-sm text-muted-foreground">Revisá el número o registralo en Clientes.</p>
                </div>
              ) : (
                (() => {
                  const v = veredicto(resultado);
                  const ui = TONO_UI[v.tono];
                  const Icon = ui.icon;
                  const { numero, leyenda } = diasGrande(resultado.dias);
                  const hayQueCobrar = resultado.cuotaId && resultado.estadoCuota !== "al_dia";
                  return (
                    <div className={`flex flex-col items-center gap-4 rounded-2xl border-2 px-6 py-8 text-center ${ui.card}`}>
                      <div className="relative">
                        <ClienteAvatar
                          nombre={resultado.nombre}
                          fotoUrl={resultado.fotoUrl}
                          className={`size-40 rounded-2xl text-4xl ring-4 ${ui.ring}`}
                        />
                        <span className={`absolute -bottom-3 -right-3 rounded-full bg-background p-1 ${ui.text}`}>
                          <Icon className="size-9" />
                        </span>
                      </div>

                      <p className="mt-2 text-3xl font-bold">{resultado.nombre}</p>
                      <p className={`text-xl font-bold tracking-widest ${ui.text}`}>{v.titulo}</p>

                      <div className="flex flex-col items-center leading-none">
                        <span className={`font-heading text-7xl font-bold tabular-nums ${ui.text}`}>{numero}</span>
                        <span className="mt-1 text-sm uppercase tracking-widest text-muted-foreground">{leyenda}</span>
                      </div>

                      {resultado.fechaVencimiento && (
                        <p className="text-base text-muted-foreground">
                          Vencimiento: <strong className="text-foreground">{formatFecha(resultado.fechaVencimiento)}</strong>
                        </p>
                      )}

                      {hayQueCobrar && (
                        <div className="mt-1 flex flex-col items-center gap-2">
                          {resultado.monto !== null && (
                            <p className="text-lg">
                              A cobrar: <strong className="text-foreground">${resultado.monto.toLocaleString("es-AR")}</strong>
                            </p>
                          )}
                          <MarkPaidButton cuotaId={resultado.cuotaId!} size="lg" onDone={() => consultar(consultado, false)} />
                        </div>
                      )}

                      {!resultado.fotoUrl && (
                        <p className="text-xs text-muted-foreground">Sin foto cargada (se agrega desde Clientes → Editar).</p>
                      )}
                    </div>
                  );
                })()
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
