"use client";

import { useState } from "react";
import Link from "next/link";
import { Menu, ScanLine, Users, CreditCard } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";

// Los iconos se resuelven ACA (lado cliente) a partir de un nombre simple:
// desde un Server Component no se pueden pasar componentes/funciones como
// props a un Client Component, solo datos serializables (strings, numeros).
const ICONS = {
  acceso: ScanLine,
  clientes: Users,
  cuotas: CreditCard,
} as const;

type NavItem = { href: string; label: string; icon: keyof typeof ICONS; badge?: number };

export default function MobileNav({ items }: { items: NavItem[] }) {
  const [open, setOpen] = useState(false);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="lg:hidden">
          <Menu className="size-5" />
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-64 bg-sidebar p-0">
        <SheetHeader className="border-b border-sidebar-border">
          <SheetTitle className="text-sm font-bold uppercase tracking-widest text-sidebar-foreground">
            Griguoli <span className="text-primary">Gym</span>
          </SheetTitle>
        </SheetHeader>
        <nav className="flex flex-col gap-1 p-4">
          {items.map((item) => {
            const Icon = ICONS[item.icon];
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                className="flex items-center gap-2.5 rounded-md px-3 py-2 text-sm font-medium text-sidebar-foreground/80 transition hover:bg-sidebar-accent hover:text-sidebar-foreground"
              >
                <Icon className="size-4" />
                <span className="flex-1">{item.label}</span>
                {!!item.badge && (
                  <Badge className="h-5 min-w-5 justify-center rounded-full bg-primary px-1.5 text-primary-foreground">
                    {item.badge}
                  </Badge>
                )}
              </Link>
            );
          })}
        </nav>
      </SheetContent>
    </Sheet>
  );
}
