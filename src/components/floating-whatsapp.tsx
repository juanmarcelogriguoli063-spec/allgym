import { MessageCircle } from "lucide-react";

export default function FloatingWhatsapp({ telefono }: { telefono: string | null }) {
  if (!telefono) return null;
  const tel = telefono.replace(/\D/g, "");
  const telNorm = tel.startsWith("549") ? tel : tel.startsWith("54") ? `549${tel.slice(2)}` : `549${tel}`;

  return (
    <a
      href={`https://wa.me/${telNorm}`}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Escribinos por WhatsApp"
      className="fixed bottom-5 right-5 z-50 flex size-14 items-center justify-center rounded-full bg-emerald-500 text-white shadow-lg shadow-black/30 transition hover:scale-105 hover:bg-emerald-400"
    >
      <MessageCircle className="size-7" />
    </a>
  );
}
