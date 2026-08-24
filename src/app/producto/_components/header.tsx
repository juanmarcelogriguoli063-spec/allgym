import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function ProductoHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-border/60 bg-background/80 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
        <Link href="/producto" className="font-heading text-xl font-bold uppercase tracking-widest">
          All <span className="text-primary">Gym</span>
        </Link>
        <nav className="hidden items-center gap-6 text-sm text-muted-foreground sm:flex">
          <a href="#beneficios" className="hover:text-foreground">Beneficios</a>
          <a href="#planes" className="hover:text-foreground">Planes</a>
          <a href="#faq" className="hover:text-foreground">FAQ</a>
        </nav>
        <Button asChild size="sm" className="font-heading uppercase tracking-wide">
          <a href="#contacto">Solicitar demo</a>
        </Button>
      </div>
    </header>
  );
}
