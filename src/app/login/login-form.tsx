"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "motion/react";
import { createClient } from "@/lib/supabase/client";
import GymLogo from "@/components/gym-logo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = searchParams.get("next");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const supabase = createClient();
      const { error, data: session } = await supabase.auth.signInWithPassword({ email, password });

      if (error) {
        setError("Email o contraseña incorrectos");
        return;
      }

      const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", session.user.id)
        .single();

      const role = profile?.role;
      const areaDest =
        role === "dueno" ? "/admin" :
        role === "recepcionista" ? "/admin/ingreso" :
        role === "socio" ? "/socio" :
        null;

      // Solo respetamos "next" si es una ruta a la que este rol tiene
      // acceso. Si no, ignorarlo evita el loop de redirects: por ej. un
      // socio que intentó entrar a /admin sin sesión queda con
      // next=/admin; si lo mandáramos ahí igual, el layout de /admin lo
      // rebota de nuevo a /login?next=/admin en cuanto valide el rol.
      // (areaDest === null cuando el rol no tiene sección propia: en ese
      // caso "next" tampoco se respeta, se manda siempre a "/".)
      const dest = areaDest && next && next.startsWith(areaDest) ? next : (areaDest ?? "/");

      router.refresh();
      router.push(dest);
    } catch {
      setError("No se pudo iniciar sesión. Probá de nuevo.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-background px-4">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,color-mix(in_oklch,var(--primary)_10%,transparent),transparent_60%)]" />

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        className="relative w-full max-w-sm"
      >
        <Card className="border-border/60 shadow-2xl shadow-black/40">
          <CardHeader className="items-center text-center">
            <GymLogo size="md" className="mb-2" />
            <CardTitle className="text-base font-normal text-muted-foreground normal-case tracking-normal">
              Panel de administración
            </CardTitle>
            <CardDescription className="sr-only">Ingresá con tu email y contraseña</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  required
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="password">Contraseña</Label>
                <Input
                  id="password"
                  type="password"
                  required
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>

              {error && <p className="text-sm text-destructive">{error}</p>}

              <Button type="submit" disabled={loading} className="mt-2 font-heading tracking-wide uppercase">
                {loading ? "Ingresando..." : "Ingresar"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
