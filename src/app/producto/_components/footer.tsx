import Link from "next/link";

export default function ProductoFooter() {
  return (
    <footer className="border-t border-border px-4 py-12">
      <div className="mx-auto flex max-w-6xl flex-col items-center gap-6 text-center sm:flex-row sm:items-start sm:justify-between sm:text-left">
        <div>
          <p className="font-heading text-lg font-bold uppercase tracking-widest">
            All <span className="text-primary">Gym</span>
          </p>
          <p className="mt-1 max-w-xs text-sm text-muted-foreground">
            Software de gestión para gimnasios. Simple, directo, sin contrato atado.
          </p>
        </div>

        <div className="flex flex-col gap-2 text-sm text-muted-foreground">
          <p className="font-heading text-xs font-semibold uppercase tracking-widest text-foreground">Navegación</p>
          <a href="#beneficios" className="hover:text-foreground">Beneficios</a>
          <a href="#planes" className="hover:text-foreground">Planes</a>
          <a href="#faq" className="hover:text-foreground">FAQ</a>
        </div>

        <div className="flex flex-col gap-2 text-sm text-muted-foreground">
          <p className="font-heading text-xs font-semibold uppercase tracking-widest text-foreground">Legal</p>
          <Link href="/producto/terminos" className="hover:text-foreground">Términos y condiciones</Link>
          <Link href="/producto/privacidad" className="hover:text-foreground">Política de privacidad</Link>
        </div>
      </div>

      <p className="mt-10 text-center text-xs text-muted-foreground">
        © {new Date().getFullYear()} All Gym. Todos los derechos reservados.
      </p>
    </footer>
  );
}
