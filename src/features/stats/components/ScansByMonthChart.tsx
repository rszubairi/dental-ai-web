"use client";

import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { ChartTooltip } from "./ChartTooltip";

function formatMonthLabel(month: string) {
  const [year, m] = month.split("-").map(Number);
  return new Date(year, m - 1, 1).toLocaleDateString(undefined, { month: "short" });
}

export function ScansByMonthChart({ data }: { data: { month: string; count: number }[] }) {
  const chartData = data.map((d) => ({ ...d, label: formatMonthLabel(d.month) }));

  return (
    <ResponsiveContainer width="100%" height={220}>
      <AreaChart data={chartData} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
        <defs>
          <linearGradient id="scansFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="var(--color-chart-1)" stopOpacity={0.35} />
            <stop offset="100%" stopColor="var(--color-chart-1)" stopOpacity={0} />
          </linearGradient>
        </defs>
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
            <ChartTooltip active={active} payload={payload} label={label} formatter={(v) => `${v} scans`} />
          )}
        />
        <Area
          type="monotone"
          dataKey="count"
          stroke="var(--color-chart-1)"
          strokeWidth={2}
          fill="url(#scansFill)"
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}
