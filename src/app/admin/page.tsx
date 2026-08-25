import Link from "next/link";
import { AlertTriangle, TrendingUp, TrendingDown } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getCuotaAlertLevel } from "@/lib/cuotas";
import { requireDuenoPage } from "@/lib/require-dueno";
import IngresosEgresosChart from "@/components/charts/ingresos-egresos-chart";
import CuotasDonutChart from "@/components/charts/cuotas-donut-chart";

const DIAS_RIESGO = 7;

const MESES = ["enero", "febrero", "marzo", "abril", "mayo", "junio", "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre"];
const MESES_CORTO = ["ene", "feb", "mar", "abr", "may", "jun", "jul", "ago", "sep", "oct", "nov", "dic"];

export default async function AdminHomePage() {
  const { supabase } = await requireDuenoPage();

  const desde = new Date();
  desde.setMonth(desde.getMonth() - 5, 1);
  const desdeStr = desde.toISOString().slice(0, 10);

  const [{ data: movimientos }, { data: socios }] = await Promise.all([
    supabase.from("finanzas_movimientos").select("tipo, monto, fecha").gte("fecha", desdeStr),
    supabase.from("socios").select("id, nombre, telefono, estado, cuotas(estado, fecha_vencimiento)"),
  ]);

  // --- Ingresos/egresos por mes (ultimos 6 meses) ---
  const buckets = new Map<string, { ingreso: number; egreso: number }>();
  for (let i = 5; i >= 0; i--) {
    const d = new Date();
    d.setMonth(d.getMonth() - i, 1);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    buckets.set(key, { ingreso: 0, egreso: 0 });
  }
  for (const m of movimientos ?? []) {
    const key = m.fecha.slice(0, 7);
    const b = buckets.get(key);
    if (!b) continue;
    if (m.tipo === "ingreso") b.ingreso += Number(m.monto);
    else b.egreso += Number(m.monto);
  }
  const chartData = Array.from(buckets.entries()).map(([key, v]) => {
    const [, mes] = key.split("-");
    return { mes: key, label: MESES_CORTO[Number(mes) - 1], ...v };
  });

  const actual = chartData[chartData.length - 1];
  const anterior = chartData[chartData.length - 2];
  const balanceActual = (actual?.ingreso ?? 0) - (actual?.egreso ?? 0);
  const balanceAnterior = anterior ? anterior.ingreso - anterior.egreso : null;
  const deltaPct =
    balanceAnterior && balanceAnterior !== 0 ? Math.round(((balanceActual - balanceAnterior) / Math.abs(balanceAnterior)) * 100) : null;

  const nombreMesActual = MESES[new Date().getMonth()];

  // --- Distribucion de socios por estado de cuota + socios en riesgo ---
  const nivelCount: Record<string, number> = { pagado: 0, por_vencer: 0, vencida: 0, pendiente: 0 };
  let activos = 0;
  const hoy = new Date();
  hoy.setHours(0, 0, 0, 0);
  const enRiesgo: { id: string; nombre: string; diasVencida: number }[] = [];

  for (const s of socios ?? []) {
    if (s.estado === "activo") activos++;
    const cuotas = (s.cuotas ?? []) as { estado: string; fecha_vencimiento: string | null }[];
    const ultima = [...cuotas].sort((a, b) => (b.fecha_vencimiento ?? "").localeCompare(a.fecha_vencimiento ?? ""))[0];
    const nivel = getCuotaAlertLevel(ultima?.estado ?? "pendiente", ultima?.fecha_vencimiento ?? null);
    nivelCount[nivel]++;

    if (s.estado === "activo" && nivel === "vencida" && ultima?.fecha_vencimiento) {
      const diasVencida = Math.floor((hoy.getTime() - new Date(ultima.fecha_vencimiento).getTime()) / 86400000);
      if (diasVencida >= DIAS_RIESGO) enRiesgo.push({ id: s.id, nombre: s.nombre, diasVencida });
    }
  }
  enRiesgo.sort((a, b) => b.diasVencida - a.diasVencida);

  const donutSlices = [
    { key: "pagado", label: "Al día", value: nivelCount.pagado, color: "#0ca30c" },
    { key: "por_vencer", label: "Por vencer", value: nivelCount.por_vencer, color: "#fab219" },
    { key: "vencida", label: "Vencida", value: nivelCount.vencida, color: "#d03b3b" },
    { key: "pendiente", label: "Pendiente", value: nivelCount.pendiente, color: "#6b7280" },
  ].filter((s) => s.value > 0);

  const fmt = (v: number) => `$${v.toLocaleString("es-AR")}`;

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Resumen</h1>
        <p className="text-sm text-muted-foreground">Griguoli Gym</p>
      </div>

      {/* Numero protagonista: el balance es el resultado que de verdad
          le importa al dueño de un vistazo. El resto son cifras de apoyo. */}
      <Card className="border-primary/25">
        <CardContent className="flex flex-col gap-1 pt-6">
          <p className="text-xs uppercase tracking-wide text-muted-foreground">
            Balance de {nombreMesActual}
          </p>
          <div className="flex items-baseline gap-3">
            <p className="text-5xl font-bold text-primary">{fmt(balanceActual)}</p>
            {deltaPct !== null && (
              <span
                className={
                  deltaPct >= 0
                    ? "flex items-center gap-1 text-sm font-medium text-emerald-400"
                    : "flex items-center gap-1 text-sm font-medium text-destructive"
                }
              >
                {deltaPct >= 0 ? <TrendingUp className="size-4" /> : <TrendingDown className="size-4" />}
                {Math.abs(deltaPct)}% vs. mes anterior
              </span>
            )}
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardContent className="pt-5">
            <p className="text-xs uppercase tracking-wide text-muted-foreground">Ingresos del mes</p>
            <p className="mt-1 text-xl font-semibold text-foreground">{fmt(actual?.ingreso ?? 0)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-5">
            <p className="text-xs uppercase tracking-wide text-muted-foreground">Egresos del mes</p>
            <p className="mt-1 text-xl font-semibold text-foreground">{fmt(actual?.egreso ?? 0)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-5">
            <p className="text-xs uppercase tracking-wide text-muted-foreground">Socios activos</p>
            <p className="mt-1 text-xl font-semibold text-foreground">{activos}</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-5">
        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle className="text-base">Ingresos vs egresos — últimos 6 meses</CardTitle>
          </CardHeader>
          <CardContent>
            <IngresosEgresosChart data={chartData} />
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-base">Estado de cuotas de los socios</CardTitle>
          </CardHeader>
          <CardContent>
            <CuotasDonutChart slices={donutSlices} />
          </CardContent>
        </Card>
      </div>

      {enRiesgo.length > 0 && (
        <Card className="border-destructive/30">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <AlertTriangle className="size-4 text-destructive" />
              Socios en riesgo de baja ({enRiesgo.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="mb-3 text-sm text-muted-foreground">
              Cuota vencida hace más de {DIAS_RIESGO} días — probablemente dejaron de venir.
            </p>
            <ul className="flex flex-col divide-y divide-border">
              {enRiesgo.slice(0, 8).map((s) => (
                <li key={s.id} className="flex items-center justify-between py-2 text-sm">
                  <Link href={`/admin/socios/${s.id}`} className="font-medium hover:text-primary hover:underline">
                    {s.nombre}
                  </Link>
                  <span className="text-muted-foreground">vencida hace {s.diasVencida} días</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
