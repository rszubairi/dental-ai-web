"use client";

import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { ChartTooltip } from "./ChartTooltip";

function formatMonthLabel(month: string) {
  const [year, m] = month.split("-").map(Number);
  return new Date(year, m - 1, 1).toLocaleDateString(undefined, { month: "short" });
}

export function TenantGrowthChart({
  data,
}: {
  data: { month: string; newTenants: number; cumulativeTenants: number }[];
}) {
  const chartData = data.map((d) => ({ ...d, label: formatMonthLabel(d.month) }));

  return (
    <ResponsiveContainer width="100%" height={220}>
      <BarChart data={chartData} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--color-border)" />
        <XAxis
          dataKey="label"
          tickLine={false}
          axisLine={false}
          fontSize={12}
          stroke="var(--color-muted-foreground)"
        />
        <YAxis tickLine={false} axisLine={false} fontSize={12} stroke="var(--color-muted-foreground)" width={32} />
        <Tooltip
          content={({ active, payload, label }) => (
            <ChartTooltip active={active} payload={payload} label={label} formatter={(v) => `${v} new tenants`} />
          )}
        />
        <Bar dataKey="newTenants" fill="var(--color-chart-2)" radius={[4, 4, 0, 0]} maxBarSize={40} />
      </BarChart>
    </ResponsiveContainer>
  );
}
