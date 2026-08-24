import Link from "next/link";
import GymLogo from "@/components/gym-logo";
import { Button } from "@/components/ui/button";

export default function HomePage() {
  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center gap-6 overflow-hidden bg-background px-4 text-center">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,color-mix(in_oklch,var(--primary)_12%,transparent),transparent_60%)]" />
      <div className="relative flex flex-col items-center gap-4">
        <GymLogo size="lg" />
        <p className="max-w-md text-sm text-muted-foreground">
          Entrená tu cuerpo, transformá tu vida. Página pública en construcción — por
          ahora, entrá al panel.
        </p>
        <Button asChild size="lg" className="mt-2 font-heading tracking-wide uppercase">
          <Link href="/login">Ingresar</Link>
        </Button>
      </div>
    </div>
  );
}
