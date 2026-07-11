"use client";

import { DollarSign, ScanLine, Target, Users } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FadeSlide } from "@/components/motion/FadeSlide";
import { useSystemStats } from "../hooks/useSystemStats";
import { StatTile } from "./StatTile";
import { ScansByMonthChart } from "./ScansByMonthChart";
import { TenantGrowthChart } from "./TenantGrowthChart";
import { TopClinicsChart } from "./TopClinicsChart";

/** Platform-wide analytics across every tenant. Super_admin only — the caller must enforce that. */
export function AdminAnalyticsDashboard() {
  const stats = useSystemStats();

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
            icon={Users}
            label="Licensed tenants"
            value={stats.tenantCount.toLocaleString()}
            delta={stats.tenantGrowthMoMPercent}
            deltaLabel="MoM growth"
          />
          <StatTile
            icon={DollarSign}
            label="Revenue (last quarter)"
            value={stats.revenueLastQuarter.toLocaleString(undefined, {
              style: "currency",
              currency: stats.revenueCurrency,
            })}
          />
        </div>
      </FadeSlide>

      <div className="grid gap-4 lg:grid-cols-2">
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

        <FadeSlide>
          <Card className="border-border/60">
            <CardHeader>
              <CardTitle>Tenant growth, month over month</CardTitle>
            </CardHeader>
            <CardContent>
              <TenantGrowthChart data={stats.tenantGrowthByMonth} />
            </CardContent>
          </Card>
        </FadeSlide>
      </div>

      <FadeSlide>
        <Card className="border-border/60">
          <CardHeader>
            <CardTitle>Top performing clinics</CardTitle>
          </CardHeader>
          <CardContent>
            <TopClinicsChart data={stats.topClinics} />
          </CardContent>
        </Card>
      </FadeSlide>
    </>
  );
}
