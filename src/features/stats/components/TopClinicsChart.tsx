"use client";

import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { ChartTooltip } from "./ChartTooltip";
import { EmptyState } from "@/components/ui/empty-state";
import { Trophy } from "lucide-react";

export function TopClinicsChart({
  data,
}: {
  data: { tenantName: string; revenue: number; scans: number; currency: string }[];
}) {
  if (data.length === 0) {
    return (
      <EmptyState
        icon={Trophy}
        title="No billed clinics yet"
        description="Once tenants are licensed and scans are billed, top performers appear here."
      />
    );
  }

  const currency = data[0]?.currency ?? "USD";

  return (
    <ResponsiveContainer width="100%" height={Math.max(220, data.length * 44)}>
      <BarChart
        data={data}
        layout="vertical"
        margin={{ top: 8, right: 24, left: 8, bottom: 0 }}
      >
        <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="var(--color-border)" />
        <XAxis type="number" tickLine={false} axisLine={false} fontSize={12} stroke="var(--color-muted-foreground)" />
        <YAxis
          type="category"
          dataKey="tenantName"
          tickLine={false}
          axisLine={false}
          fontSize={12}
          width={140}
          stroke="var(--color-muted-foreground)"
        />
        <Tooltip
          content={({ active, payload, label }) => (
            <ChartTooltip
              active={active}
              payload={payload}
              label={label}
              formatter={(v) => v.toLocaleString(undefined, { style: "currency", currency })}
            />
          )}
        />
        <Bar dataKey="revenue" fill="var(--color-chart-1)" radius={[0, 4, 4, 0]} maxBarSize={24} />
      </BarChart>
    </ResponsiveContainer>
  );
}
