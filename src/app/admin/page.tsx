import { createClient } from "@/lib/supabase/server";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getCuotaAlertLevel } from "@/lib/cuotas";
import IngresosEgresosChart from "@/components/charts/ingresos-egresos-chart";
import CuotasDonutChart from "@/components/charts/cuotas-donut-chart";

const MESES = ["ene", "feb", "mar", "abr", "may", "jun", "jul", "ago", "sep", "oct", "nov", "dic"];

export default async function AdminHomePage() {
  const supabase = await createClient();

  const desde = new Date();
  desde.setMonth(desde.getMonth() - 5, 1);
  const desdeStr = desde.toISOString().slice(0, 10);

  const [{ data: movimientos }, { data: socios }] = await Promise.all([
    supabase.from("finanzas_movimientos").select("tipo, monto, fecha").gte("fecha", desdeStr),
    supabase.from("socios").select("id, estado, cuotas(estado, fecha_vencimiento)"),
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
    return { mes: key, label: MESES[Number(mes) - 1], ...v };
  });

  const totalIngresosMes = chartData[chartData.length - 1]?.ingreso ?? 0;
  const totalEgresosMes = chartData[chartData.length - 1]?.egreso ?? 0;

  // --- Distribucion de socios por estado de cuota ---
  const nivelCount: Record<string, number> = { pagado: 0, por_vencer: 0, vencida: 0, pendiente: 0 };
  let activos = 0;
  for (const s of socios ?? []) {
    if (s.estado === "activo") activos++;
    const cuotas = (s.cuotas ?? []) as { estado: string; fecha_vencimiento: string | null }[];
    const ultima = [...cuotas].sort((a, b) => (b.fecha_vencimiento ?? "").localeCompare(a.fecha_vencimiento ?? ""))[0];
    const nivel = getCuotaAlertLevel(ultima?.estado ?? "pendiente", ultima?.fecha_vencimiento ?? null);
    nivelCount[nivel]++;
  }

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
        <p className="text-sm text-muted-foreground">Griguoli Gym — este mes</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="pt-6">
            <p className="text-xs uppercase tracking-wide text-muted-foreground">Ingresos del mes</p>
            <p className="mt-1 text-2xl font-bold text-foreground">{fmt(totalIngresosMes)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-xs uppercase tracking-wide text-muted-foreground">Egresos del mes</p>
            <p className="mt-1 text-2xl font-bold text-foreground">{fmt(totalEgresosMes)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-xs uppercase tracking-wide text-muted-foreground">Balance del mes</p>
            <p className="mt-1 text-2xl font-bold text-primary">{fmt(totalIngresosMes - totalEgresosMes)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-xs uppercase tracking-wide text-muted-foreground">Socios activos</p>
            <p className="mt-1 text-2xl font-bold text-foreground">{activos}</p>
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
    </div>
  );
}
