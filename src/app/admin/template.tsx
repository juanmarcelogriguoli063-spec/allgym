import PageTransition from "@/components/page-transition";

// A diferencia del layout, un template se vuelve a montar en CADA navegacion:
// asi la animacion de entrada corre al cambiar de seccion, no solo al primer ingreso.
export default function AdminTemplate({ children }: { children: React.ReactNode }) {
  return <PageTransition>{children}</PageTransition>;
}
