import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function HomePage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-background px-4 text-center">
      <h1 className="text-3xl font-bold uppercase tracking-widest">
        Griguoli <span className="text-primary">Gym</span>
      </h1>
      <Button asChild size="lg" className="font-bold uppercase tracking-wide">
        <Link href="/login">Ingresar</Link>
      </Button>
    </div>
  );
}
