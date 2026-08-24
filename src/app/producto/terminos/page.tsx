import type { Metadata } from "next";

export const metadata: Metadata = { title: "Términos y condiciones — All Gym" };

export default function TerminosPage() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-20">
      <h1 className="text-3xl font-bold">Términos y condiciones</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Versión preliminar — se ajusta al momento de formalizar cada contratación.
      </p>
      <div className="prose prose-invert mt-8 flex flex-col gap-4 text-sm text-muted-foreground">
        <p>
          All Gym es un servicio de software de gestión para gimnasios. Al contratarlo,
          el cliente accede a un panel de administración configurado a su medida
          (gestión de socios, cuotas, finanzas y funciones relacionadas).
        </p>
        <p>
          <strong className="text-foreground">Sin contrato atado:</strong> el cliente
          puede dar de baja el servicio en cualquier momento, sin penalidad.
        </p>
        <p>
          <strong className="text-foreground">Datos:</strong> toda la información
          cargada por el cliente (socios, cuotas, movimientos) le pertenece y es
          exportable en cualquier momento, sin costo adicional.
        </p>
        <p>
          <strong className="text-foreground">Disponibilidad:</strong> se realizan
          esfuerzos razonables para mantener el servicio disponible, sin garantía de
          disponibilidad del 100%.
        </p>
        <p>Para consultas puntuales sobre estos términos, contactanos directamente.</p>
      </div>
    </div>
  );
}
