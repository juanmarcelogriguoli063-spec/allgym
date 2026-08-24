"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Plus, Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { crearSocio, actualizarSocio } from "@/lib/actions/socios";

type Plan = { id: string; nombre: string; precio: number };
type Socio = {
  id: string;
  nombre: string;
  telefono: string | null;
  email: string | null;
  dni: string | null;
  plan_id: string | null;
  estado: string;
};

export default function SocioDialog({ planes, socio }: { planes: Plan[]; socio?: Socio }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const isEdit = Boolean(socio);

  async function handleSubmit(formData: FormData) {
    setLoading(true);
    const result = isEdit
      ? await actualizarSocio(socio!.id, formData)
      : await crearSocio(formData);
    setLoading(false);

    if ("error" in result) {
      toast.error(result.error);
      return;
    }

    toast.success(isEdit ? "Socio actualizado" : "Socio creado");
    setOpen(false);
    router.refresh();
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {isEdit ? (
          <Button variant="outline" size="sm" className="gap-1.5">
            <Pencil className="size-3.5" /> Editar
          </Button>
        ) : (
          <Button className="gap-1.5 font-heading uppercase tracking-wide">
            <Plus className="size-4" /> Nuevo socio
          </Button>
        )}
      </DialogTrigger>
      <DialogContent>
        <form action={handleSubmit}>
          <DialogHeader>
            <DialogTitle>{isEdit ? "Editar socio" : "Nuevo socio"}</DialogTitle>
            <DialogDescription>
              {isEdit ? "Actualizá los datos del socio." : "Se crea el socio y su primera cuota (pendiente de pago)."}
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid gap-1.5">
              <Label htmlFor="nombre">Nombre y apellido</Label>
              <Input id="nombre" name="nombre" required defaultValue={socio?.nombre} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-1.5">
                <Label htmlFor="dni">DNI</Label>
                <Input id="dni" name="dni" defaultValue={socio?.dni ?? ""} />
              </div>
              <div className="grid gap-1.5">
                <Label htmlFor="telefono">Teléfono</Label>
                <Input id="telefono" name="telefono" defaultValue={socio?.telefono ?? ""} />
              </div>
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="email">Email</Label>
              <Input id="email" name="email" type="email" defaultValue={socio?.email ?? ""} />
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="plan_id">Plan</Label>
              <Select name="plan_id" defaultValue={socio?.plan_id ?? undefined}>
                <SelectTrigger id="plan_id" className="w-full">
                  <SelectValue placeholder="Elegir plan" />
                </SelectTrigger>
                <SelectContent>
                  {planes.map((p) => (
                    <SelectItem key={p.id} value={p.id}>
                      {p.nombre} — ${p.precio.toLocaleString("es-AR")}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {isEdit && (
              <div className="grid gap-1.5">
                <Label htmlFor="estado">Estado</Label>
                <Select name="estado" defaultValue={socio?.estado ?? "activo"}>
                  <SelectTrigger id="estado" className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="activo">Activo</SelectItem>
                    <SelectItem value="pausado">Pausado</SelectItem>
                    <SelectItem value="baja">Baja</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button type="submit" disabled={loading} className="font-heading uppercase tracking-wide">
              {loading ? "Guardando..." : "Guardar"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
