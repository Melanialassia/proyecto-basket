import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

type StatusVariant = "success" | "warning" | "error" | "info" | "default";

interface StatusBadgeProps {
  status: string;
  variant?: StatusVariant;
  className?: string;
}

const variantStyles: Record<StatusVariant, string> = {
  success: "bg-emerald-50 text-emerald-700 border-emerald-200",
  warning: "bg-amber-50 text-amber-700 border-amber-200",
  error: "bg-red-50 text-red-700 border-red-200",
  info: "bg-blue-50 text-blue-700 border-blue-200",
  default: "bg-slate-50 text-slate-700 border-slate-200",
};

const statusToVariant: Record<string, StatusVariant> = {
  completado: "success",
  éxito: "success",
  activo: "success",
  en_progreso: "warning",
  procesando: "warning",
  subiendo: "info",
  programado: "info",
  inactivo: "default",
  fallido: "error",
};

export function StatusBadge({ status, variant, className }: StatusBadgeProps) {
  const resolvedVariant =
    variant || statusToVariant[status.toLowerCase()] || "default";
  const displayStatus = status.replace(/_/g, " ");

  return (
    <Badge
      variant="outline"
      className={cn(
        "rounded-full border px-2.5 py-0.5 text-xs font-medium capitalize",
        variantStyles[resolvedVariant],
        className
      )}
    >
      <span
        className={cn(
          "mr-1.5 inline-block h-1.5 w-1.5 rounded-full",
          resolvedVariant === "success" && "bg-emerald-500",
          resolvedVariant === "warning" && "bg-amber-500",
          resolvedVariant === "error" && "bg-red-500",
          resolvedVariant === "info" && "bg-blue-500",
          resolvedVariant === "default" && "bg-slate-400"
        )}
      />
      {displayStatus}
    </Badge>
  );
}
