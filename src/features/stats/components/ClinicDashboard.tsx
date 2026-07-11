"use client";

import { DollarSign, ScanLine, Target, Wallet } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FadeSlide } from "@/components/motion/FadeSlide";
import { useTenantStats } from "../hooks/useTenantStats";
import { StatTile } from "./StatTile";
import { ScansByMonthChart } from "./ScansByMonthChart";

/** A single clinic's own scan volume, model accuracy, and billing — scoped to the caller's tenant. */
export function ClinicDashboard() {
  const stats = useTenantStats();

  if (stats === undefined) {
    return (
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className="h-28 animate-pulse rounded-2xl bg-muted" style={{ animationDelay: `${i * 80}ms` }} />
        ))}
      </div>
    );
  }

  return (
    <>
      <FadeSlide>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatTile
            icon={ScanLine}
            label="Scans processed"
            value={stats.totalScansProcessed.toLocaleString()}
            delta={
              stats.scansByMonth.length >= 2 && stats.scansByMonth.at(-2)!.count > 0
                ? ((stats.scansByMonth.at(-1)!.count - stats.scansByMonth.at(-2)!.count) /
                    stats.scansByMonth.at(-2)!.count) *
                  100
                : null
            }
            deltaLabel="vs last month"
          />
          <StatTile icon={Target} label="Model accuracy" value={`${stats.avgAccuracyPercent.toFixed(1)}%`} />
          <StatTile
            icon={DollarSign}
            label="Billed (last quarter)"
            value={stats.revenueLastQuarter.toLocaleString(undefined, { style: "currency", currency: stats.currency })}
          />
          <StatTile
            icon={Wallet}
            label="Outstanding balance"
            value={stats.outstandingBalance.toLocaleString(undefined, {
              style: "currency",
              currency: stats.currency,
            })}
          />
        </div>
      </FadeSlide>

      <FadeSlide>
        <Card className="border-border/60">
          <CardHeader>
            <CardTitle>Scans processed by month</CardTitle>
          </CardHeader>
          <CardContent>
            <ScansByMonthChart data={stats.scansByMonth} />
          </CardContent>
        </Card>
      </FadeSlide>
    </>
  );
}
