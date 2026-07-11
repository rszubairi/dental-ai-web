import type { LucideIcon } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export function StatTile({
  icon: Icon,
  label,
  value,
  delta,
  deltaLabel,
}: {
  icon: LucideIcon;
  label: string;
  value: string;
  delta?: number | null;
  deltaLabel?: string;
}) {
  const isPositive = typeof delta === "number" && delta >= 0;

  return (
    <Card className="border-border/60">
      <CardHeader className="flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">{label}</CardTitle>
        <Icon className="size-4 text-primary" />
      </CardHeader>
      <CardContent>
        <p className="text-3xl font-semibold">{value}</p>
        {typeof delta === "number" && (
          <p className={cn("mt-1 text-xs font-medium", isPositive ? "text-[var(--color-chart-2)]" : "text-destructive")}>
            {isPositive ? "+" : ""}
            {delta.toFixed(1)}% {deltaLabel}
          </p>
        )}
      </CardContent>
    </Card>
  );
}
