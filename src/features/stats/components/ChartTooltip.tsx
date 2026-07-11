type ChartTooltipEntry = { value?: number | string | readonly (number | string)[] };

export function ChartTooltip({
  active,
  payload,
  label,
  formatter,
}: {
  active?: boolean;
  payload?: readonly ChartTooltipEntry[];
  label?: string | number;
  formatter?: (value: number) => string;
}) {
  if (!active || !payload?.length) return null;

  return (
    <div className="rounded-lg border border-border bg-popover px-3 py-2 text-xs shadow-md">
      <p className="mb-1 font-medium text-popover-foreground">{label}</p>
      {payload.map((entry, i) => (
        <p key={i} className="text-muted-foreground">
          {formatter && typeof entry.value === "number" ? formatter(entry.value) : entry.value}
        </p>
      ))}
    </div>
  );
}
