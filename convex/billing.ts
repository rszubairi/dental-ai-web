import { mutation, query } from "./_generated/server";
import type { MutationCtx } from "./_generated/server";
import type { Id } from "./_generated/dataModel";
import { v } from "convex/values";
import { requireCurrentUser, requireSuperAdmin, currentBillingMonth } from "./lib/tenant";

/**
 * Bills one scan against the tenant's active license and rolls it into that
 * month's invoice, creating the invoice if this is the first scan of the
 * month. Called from aiJobs.markSucceeded within the same transaction —
 * never invoked directly by users. A tenant with no active license is not
 * billed.
 */
export async function chargeForScan(
  ctx: MutationCtx,
  args: { tenantId: Id<"tenants">; aiJobId: Id<"aiJobs">; caseId: Id<"cases"> },
) {
  const license = await ctx.db
    .query("tenantLicenses")
    .withIndex("by_tenant", (q) => q.eq("tenantId", args.tenantId))
    .unique();
  if (!license || license.status !== "active") return null;

  const billingMonth = currentBillingMonth();

  let invoice = await ctx.db
    .query("invoices")
    .withIndex("by_tenant_month", (q) => q.eq("tenantId", args.tenantId).eq("billingMonth", billingMonth))
    .unique();

  if (!invoice) {
    const invoiceId = await ctx.db.insert("invoices", {
      tenantId: args.tenantId,
      billingMonth,
      scanCount: 0,
      amount: 0,
      currency: license.currency,
      status: "outstanding",
    });
    invoice = await ctx.db.get(invoiceId);
  }
  if (!invoice) throw new Error("Failed to create invoice");

  await ctx.db.patch(invoice._id, {
    scanCount: invoice.scanCount + 1,
    amount: invoice.amount + license.scanPrice,
  });

  return await ctx.db.insert("scanCharges", {
    tenantId: args.tenantId,
    aiJobId: args.aiJobId,
    caseId: args.caseId,
    unitPrice: license.scanPrice,
    currency: license.currency,
    billingMonth,
    invoiceId: invoice._id,
  });
}

/** Scan usage history for the current tenant, most recent first. */
export const listScanHistory = query({
  args: {},
  handler: async (ctx) => {
    const user = await requireCurrentUser(ctx);
    const charges = await ctx.db
      .query("scanCharges")
      .withIndex("by_tenant", (q) => q.eq("tenantId", user.tenantId))
      .order("desc")
      .collect();
    return charges;
  },
});

/** This tenant's invoices, most recent month first. */
export const listInvoices = query({
  args: {},
  handler: async (ctx) => {
    const user = await requireCurrentUser(ctx);
    const invoices = await ctx.db
      .query("invoices")
      .withIndex("by_tenant", (q) => q.eq("tenantId", user.tenantId))
      .collect();
    return invoices.sort((a, b) => b.billingMonth.localeCompare(a.billingMonth));
  },
});

/** Outstanding balance across all months for the current tenant. */
export const getOutstandingBalance = query({
  args: {},
  handler: async (ctx) => {
    const user = await requireCurrentUser(ctx);
    const invoices = await ctx.db
      .query("invoices")
      .withIndex("by_tenant", (q) => q.eq("tenantId", user.tenantId))
      .filter((q) => q.eq(q.field("status"), "outstanding"))
      .collect();

    return invoices.reduce(
      (acc, inv) => ({ amount: acc.amount + inv.amount, currency: inv.currency }),
      { amount: 0, currency: invoices[0]?.currency ?? "USD" },
    );
  },
});

/** System admin: every tenant's invoices, for cross-tenant billing oversight. */
export const listAllInvoices = query({
  args: {},
  handler: async (ctx) => {
    await requireSuperAdmin(ctx);
    const invoices = await ctx.db.query("invoices").collect();
    return await Promise.all(
      invoices
        .sort((a, b) => b.billingMonth.localeCompare(a.billingMonth))
        .map(async (invoice) => ({ invoice, tenant: await ctx.db.get(invoice.tenantId) })),
    );
  },
});

/** System admin: mark a tenant's invoice as paid. */
export const markInvoicePaid = mutation({
  args: { invoiceId: v.id("invoices") },
  handler: async (ctx, args) => {
    await requireSuperAdmin(ctx);
    await ctx.db.patch(args.invoiceId, { status: "paid", paidAt: Date.now() });
  },
});
