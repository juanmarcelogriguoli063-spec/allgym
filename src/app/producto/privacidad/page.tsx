import type { Metadata } from "next";

export const metadata: Metadata = { title: "Política de privacidad — All Gym" };

export default function PrivacidadPage() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-20">
      <h1 className="text-3xl font-bold">Política de privacidad</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Versión preliminar — se ajusta al momento de formalizar cada contratación.
      </p>
      <div className="prose prose-invert mt-8 flex flex-col gap-4 text-sm text-muted-foreground">
        <p>
          Los datos que dejás en este sitio (nombre, teléfono, email, mensaje) se usan
          únicamente para contactarte respecto de tu consulta sobre All Gym. No se
          venden ni se comparten con terceros.
        </p>
        <p>
          Si contratás el servicio, los datos de tus socios (nombre, teléfono, email,
          DNI) se almacenan de forma segura (con seguridad a nivel de fila, RLS) y son
          accesibles únicamente por tu staff autorizado. Nunca se comparten entre
          gimnasios distintos.
        </p>
        <p>
          Podés pedir la eliminación de tus datos o los de tu gimnasio en cualquier
          momento contactándonos directamente.
        </p>
      </div>
    </div>
  );
}
