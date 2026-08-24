import Link from "next/link";

export default function HomePage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-zinc-50 px-4 text-center dark:bg-zinc-950">
      <h1 className="text-3xl font-bold text-zinc-900 dark:text-zinc-50">Griguoli Gym</h1>
      <p className="max-w-md text-sm text-zinc-500 dark:text-zinc-400">
        Página pública en construcción — llega en el Paso 5. Por ahora, entrá al panel.
      </p>
      <Link
        href="/login"
        className="mt-2 rounded-lg bg-zinc-900 px-5 py-2.5 text-sm font-bold text-white hover:bg-zinc-700 dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-200"
      >
        Ingresar
      </Link>
    </div>
  );
}
