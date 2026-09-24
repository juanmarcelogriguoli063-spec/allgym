import { cn } from "@/lib/utils";

function iniciales(nombre: string) {
  return nombre
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase() ?? "")
    .join("");
}

/** Foto redonda del cliente, o sus iniciales si todavia no tiene foto. */
export default function ClienteAvatar({
  nombre,
  fotoUrl,
  className,
}: {
  nombre: string;
  fotoUrl?: string | null;
  className?: string;
}) {
  return fotoUrl ? (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={fotoUrl} alt={nombre} className={cn("size-9 shrink-0 rounded-full object-cover", className)} />
  ) : (
    <span
      aria-hidden="true"
      className={cn(
        "flex size-9 shrink-0 items-center justify-center rounded-full bg-muted text-xs font-bold text-muted-foreground",
        className
      )}
    >
      {iniciales(nombre)}
    </span>
  );
}
