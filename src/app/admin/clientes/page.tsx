import { Search, UserRoundPlus } from "lucide-react";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import CuotaBadge from "@/components/cuota-badge";
import ClienteAvatar from "@/components/cliente-avatar";
import ClienteDialog from "./cliente-dialog";
import { requireGestion } from "@/lib/auth";
import { normalizarDni } from "@/lib/datos";

const ESTADO_CLIENTE: Record<string, string> = { activo: "Activo", pausado: "Pausado", baja: "Baja" };

export default async function ClientesPage({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  const { q = "" } = await searchParams;
  const { supabase } = await requireGestion();

  const [{ data: clientes }, { data: planes }] = await Promise.all([
    supabase
      .from("socios")
      .select("id, nombre, telefono, email, dni, estado, plan_id, foto_path, planes(nombre), cuotas(estado, fecha_vencimiento)")
      .order("nombre"),
    supabase.from("planes").select("id, nombre, precio").eq("activo", true).order("precio"),
  ]);

  // Busqueda simple por nombre, DNI o telefono (son pocos cientos de filas: en memoria alcanza).
  const termino = q.trim().toLowerCase();
  const soloDigitos = normalizarDni(q);
  const filtrados = (clientes ?? []).filter((c) => {
    if (!termino) return true;
    return (
      c.nombre.toLowerCase().includes(termino) ||
      (soloDigitos.length >= 3 && (c.dni ?? "").includes(soloDigitos)) ||
      (soloDigitos.length >= 3 && (c.telefono ?? "").replace(/\D/g, "").includes(soloDigitos))
    );
  });

  // Fotos: URLs firmadas en lote (el bucket es privado), validas 1 hora.
  const paths = filtrados.map((c) => c.foto_path).filter((p): p is string => Boolean(p));
  const fotoPorPath = new Map<string, string>();
  if (paths.length) {
    const { data: firmadas } = await supabase.storage.from("fotos-socios").createSignedUrls(paths, 3600);
    for (const f of firmadas ?? []) if (f.path && f.signedUrl) fotoPorPath.set(f.path, f.signedUrl);
  }

  const rows = filtrados.map((c) => {
    const cuotas = (c.cuotas ?? []) as { estado: string; fecha_vencimiento: string | null }[];
    const ultima = [...cuotas].sort((a, b) => (b.fecha_vencimiento ?? "").localeCompare(a.fecha_vencimiento ?? ""))[0];
    return { ...c, ultimaCuota: ultima, fotoUrl: c.foto_path ? (fotoPorPath.get(c.foto_path) ?? null) : null };
  });

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Clientes</h1>
          <p className="text-sm text-muted-foreground">
            {termino ? `${rows.length} de ${clientes?.length ?? 0} clientes` : `${rows.length} clientes registrados`}
          </p>
        </div>
        <ClienteDialog planes={planes ?? []} />
      </div>

      <form className="mb-4 flex gap-2" role="search">
        <Input name="q" defaultValue={q} placeholder="Buscar por nombre, DNI o teléfono" className="max-w-sm" aria-label="Buscar cliente" />
        <Button type="submit" variant="outline" className="gap-1.5">
          <Search className="size-4" /> Buscar
        </Button>
        {termino && (
          <Button asChild variant="ghost">
            <Link href="/admin/clientes">Limpiar</Link>
          </Button>
        )}
      </form>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Cliente</TableHead>
                <TableHead>DNI</TableHead>
                <TableHead>Teléfono</TableHead>
                <TableHead>Plan</TableHead>
                <TableHead>Estado de la cuota</TableHead>
                <TableHead className="text-right">Acción</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((c) => (
                <TableRow key={c.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <ClienteAvatar nombre={c.nombre} fotoUrl={c.fotoUrl} />
                      <div className="flex flex-col">
                        <span className="font-medium">{c.nombre}</span>
                        {c.estado !== "activo" && (
                          <span className="text-xs text-destructive">{ESTADO_CLIENTE[c.estado] ?? c.estado}</span>
                        )}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="text-muted-foreground">{c.dni ?? "—"}</TableCell>
                  <TableCell className="text-muted-foreground">{c.telefono ?? "—"}</TableCell>
                  <TableCell className="text-muted-foreground">
                    {(c.planes as unknown as { nombre: string } | null)?.nombre ?? "—"}
                  </TableCell>
                  <TableCell>
                    <CuotaBadge estado={c.ultimaCuota?.estado} fechaVencimiento={c.ultimaCuota?.fecha_vencimiento} conDias />
                  </TableCell>
                  <TableCell className="text-right">
                    <ClienteDialog planes={planes ?? []} cliente={c} fotoUrl={c.fotoUrl} />
                  </TableCell>
                </TableRow>
              ))}
              {rows.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} className="py-16 text-center">
                    <div className="flex flex-col items-center gap-2 text-muted-foreground">
                      <UserRoundPlus className="size-10 opacity-40" />
                      {termino ? (
                        <p>No hay clientes que coincidan con &quot;{q}&quot;.</p>
                      ) : (
                        <>
                          <p>Todavía no hay clientes cargados.</p>
                          <p className="text-xs">Usá el botón &quot;Nuevo cliente&quot; para registrar el primero.</p>
                        </>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
