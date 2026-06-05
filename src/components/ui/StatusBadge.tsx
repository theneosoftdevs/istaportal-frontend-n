// src/components/ui/StatusBadge.tsx
import { cn } from "@/lib/utils"
import type { StatusValue } from "@/types"
import locales from "@/lib/locales.json"

interface StatusBadgeProps {
  status: StatusValue | string
  className?: string
}

const CONFIG: Record<string, { label: string; classes: string }> = {
  active: { label: locales.status.active, classes: "bg-success/12 text-success border-success/25" },
  validated: { label: locales.status.validated, classes: "bg-success/12 text-success border-success/25" },
  pending: { label: locales.status.pending, classes: "bg-warning/15 text-warning-foreground border-warning/30" },
  important: { label: locales.status.important, classes: "bg-warning/15 text-warning-foreground border-warning/30" },
  suspended: { label: locales.status.suspended, classes: "bg-destructive/12 text-destructive border-destructive/25" },
  rejected: { label: locales.status.rejected, classes: "bg-destructive/12 text-destructive border-destructive/25" },
  urgent: { label: locales.status.urgent, classes: "bg-destructive/12 text-destructive border-destructive/25" },
  info: { label: locales.status.info, classes: "bg-primary/10 text-primary border-primary/25" },
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const config = CONFIG[status] ?? {
    label: status,
    classes: "bg-muted text-muted-foreground border-border",
  }
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium",
        config.classes,
        className,
      )}
    >
      <span className="size-1.5 rounded-full bg-current" aria-hidden="true" />
      {config.label}
    </span>
  )
}
