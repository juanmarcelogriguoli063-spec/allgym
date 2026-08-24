import { cn } from "@/lib/utils";

export default function GymLogo({ className, size = "md" }: { className?: string; size?: "sm" | "md" | "lg" }) {
  const sizes = {
    sm: "text-base",
    md: "text-2xl",
    lg: "text-4xl",
  };

  return (
    <span className={cn("font-heading font-bold leading-none tracking-widest", sizes[size], className)}>
      GRIGUOLI <span className="text-primary">GYM</span>
    </span>
  );
}
