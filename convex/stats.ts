import { query } from "./_generated/server";
import type { Id } from "./_generated/dataModel";
import { requireCurrentUser, requireSuperAdmin } from "./lib/tenant";

function lastNMonths(n: number): string[] {
  const months: string[] = [];
  const now = new Date();
  for (let i = n - 1; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    months.push(d.toISOString().slice(0, 7));
  }
  return months;
}

/**
 * System-wide analytics for the platform admin dashboard: scan volume,
 * model accuracy, tenant growth, and billing, all derived from live data
 * rather than hardcoded — see convex/seed.ts:seedDemoData for realistic
 * historical data across the last 6 months.
 */
export const getSystemStats = query({
  args: {},
  handler: async (ctx) => {
    await requireSuperAdmin(ctx);

    const [tenants, aiJobs, reports, invoices] = await Promise.all([
      ctx.db.query("tenants").collect(),
      ctx.db.query("aiJobs").collect(),
      ctx.db.query("reports").collect(),
      ctx.db.query("invoices").collect(),
    ]);

    const months = lastNMonths(6);
    const currentMonth = months[months.length - 1];
    const succeededJobs = aiJobs.filter((j) => j.status === "succeeded");

    const scansByMonth = months.map((month) => ({
      month,
      count: succeededJobs.filter((j) => (j.completedMonth ?? currentMonth) === month).length,
    }));

    let cumulativeTenants = 0;
    const tenantGrowthByMonth = months.map((month) => {
      const newTenants = tenants.filter((t) => (t.onboardedMonth ?? currentMonth) === month).length;
      cumulativeTenants += newTenants;
      return { month, newTenants, cumulativeTenants };
    });

    const priorCumulative = tenantGrowthByMonth.at(-2)?.cumulativeTenants ?? 0;
    const latestCumulative = tenantGrowthByMonth.at(-1)?.cumulativeTenants ?? 0;
    const tenantGrowthMoMPercent =
      priorCumulative > 0 ? ((latestCumulative - priorCumulative) / priorCumulative) * 100 : null;

    const allConfidences = reports.flatMap((r) => r.findings.map((f) => f.confidence));
    const avgAccuracyPercent = allConfidences.length
      ? (allConfidences.reduce((sum, c) => sum + c, 0) / allConfidences.length) * 100
      : 0;

    const lastQuarterMonths = months.slice(-3);
    const revenueLastQuarter = invoices
      .filter((inv) => lastQuarterMonths.includes(inv.billingMonth))
      .reduce((sum, inv) => sum + inv.amount, 0);

    const revenueByMonth = months.map((month) => ({
      month,
      amount: invoices.filter((inv) => inv.billingMonth === month).reduce((sum, inv) => sum + inv.amount, 0),
    }));

    const byTenant = new Map<Id<"tenants">, { scans: number; revenue: number; currency: string }>();
    for (const inv of invoices) {
      const prev = byTenant.get(inv.tenantId) ?? { scans: 0, revenue: 0, currency: inv.currency };
      byTenant.set(inv.tenantId, {
        scans: prev.scans + inv.scanCount,
        revenue: prev.revenue + inv.amount,
        currency: inv.currency,
      });
    }

    const topClinics = await Promise.all(
      [...byTenant.entries()]
        .sort((a, b) => b[1].revenue - a[1].revenue)
        .slice(0, 5)
        .map(async ([tenantId, data]) => {
          const tenant = await ctx.db.get(tenantId);
          return { tenantId, tenantName: tenant?.name ?? "Unknown clinic", ...data };
        }),
    );

    return {
      totalScansProcessed: succeededJobs.length,
      scansThisMonth: scansByMonth.at(-1)?.count ?? 0,
      scansByMonth,
      tenantCount: tenants.length,
      tenantGrowthByMonth,
      tenantGrowthMoMPercent,
      avgAccuracyPercent,
      revenueLastQuarter,
      revenueByMonth,
      revenueCurrency: invoices[0]?.currency ?? "USD",
      topClinics,
    };
  },
});

/**
 * A single clinic's own analytics: scan volume, model accuracy, and
 * billing, scoped to the caller's tenant only.
 */
export const getTenantStats = query({
  args: {},
  handler: async (ctx) => {
    const user = await requireCurrentUser(ctx);

    const [aiJobs, reports, invoices] = await Promise.all([
      ctx.db
        .query("aiJobs")
        .withIndex("by_tenant", (q) => q.eq("tenantId", user.tenantId))
        .collect(),
      ctx.db
        .query("reports")
        .withIndex("by_tenant", (q) => q.eq("tenantId", user.tenantId))
        .collect(),
      ctx.db
        .query("invoices")
        .withIndex("by_tenant", (q) => q.eq("tenantId", user.tenantId))
        .collect(),
    ]);

    const months = lastNMonths(6);
    const currentMonth = months[months.length - 1];
    const succeededJobs = aiJobs.filter((j) => j.status === "succeeded");

    const scansByMonth = months.map((month) => ({
      month,
      count: succeededJobs.filter((j) => (j.completedMonth ?? currentMonth) === month).length,
    }));

    const allConfidences = reports.flatMap((r) => r.findings.map((f) => f.confidence));
    const avgAccuracyPercent = allConfidences.length
      ? (allConfidences.reduce((sum, c) => sum + c, 0) / allConfidences.length) * 100
      : 0;

    const lastQuarterMonths = months.slice(-3);
    const revenueLastQuarter = invoices
      .filter((inv) => lastQuarterMonths.includes(inv.billingMonth))
      .reduce((sum, inv) => sum + inv.amount, 0);

    const outstandingBalance = invoices
      .filter((inv) => inv.status === "outstanding")
      .reduce((sum, inv) => sum + inv.amount, 0);

    return {
      totalScansProcessed: succeededJobs.length,
      scansThisMonth: scansByMonth.at(-1)?.count ?? 0,
      scansByMonth,
      avgAccuracyPercent,
      revenueLastQuarter,
      outstandingBalance,
      currency: invoices[0]?.currency ?? "USD",
    };
  },
});
