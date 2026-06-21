// src/components/ui/StatusBadge.tsx
import { cn } from "@/lib/utils";
import type { StatusValue } from "@/types";
import { i18n } from "@/lib/i18n";

interface StatusBadgeProps {
  status: StatusValue | string;
  className?: string;
}

const CONFIG: Record<string, { label: string; classes: string }> = {
  active: {
    label: i18n.status.active,
    classes: "bg-success/12 text-success border-success/25",
  },
  validated: {
    label: i18n.status.validated,
    classes: "bg-success/12 text-success border-success/25",
  },
  pending: {
    label: i18n.status.pending,
    classes: "bg-warning/15 text-warning-foreground border-warning/30",
  },
  en_cours: {
    label: "En cours",
    classes: "bg-success/12 text-success border-success/25",
  },
  admis: {
    label: "Admis",
    classes: "bg-success/12 text-success border-success/25",
  },
  redoublant: {
    label: "Redoublant",
    classes: "bg-warning/15 text-warning-foreground border-warning/30",
  },
  important: {
    label: i18n.status.important,
    classes: "bg-warning/15 text-warning-foreground border-warning/30",
  },
  suspended: {
    label: i18n.status.suspended,
    classes: "bg-destructive/12 text-destructive border-destructive/25",
  },
  rejected: {
    label: i18n.status.rejected,
    classes: "bg-destructive/12 text-destructive border-destructive/25",
  },
  urgent: {
    label: i18n.status.urgent,
    classes: "bg-destructive/12 text-destructive border-destructive/25",
  },
  info: {
    label: i18n.status.info,
    classes: "bg-primary/10 text-primary border-primary/25",
  },
};

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const config = CONFIG[status] ?? {
    label: status,
    classes: "bg-muted text-muted-foreground border-border",
  };
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
  );
}
