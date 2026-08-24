import { MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { buildRecordatorioWhatsappUrl } from "@/lib/whatsapp";

export default function WhatsappRecordatorioButton({
  telefono,
  nombre,
  estado,
  fechaVencimiento,
  monto,
}: {
  telefono: string | null;
  nombre: string;
  estado: string;
  fechaVencimiento: string | null;
  monto: number;
}) {
  if (!telefono) return null;
  const url = buildRecordatorioWhatsappUrl({ telefono, nombre, estado, fechaVencimiento, monto });
  if (!url) return null;

  return (
    <Button asChild size="sm" variant="outline" className="gap-1.5 border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/10">
      <a href={url} target="_blank" rel="noopener noreferrer">
        <MessageCircle className="size-3.5" />
        WhatsApp
      </a>
    </Button>
  );
}
