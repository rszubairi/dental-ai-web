import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { requireCurrentUser, requireSuperAdmin } from "./lib/tenant";

/** System admin view: every tenant alongside its current license, if any. */
export const listTenantLicenses = query({
  args: {},
  handler: async (ctx) => {
    await requireSuperAdmin(ctx);
    const tenants = await ctx.db.query("tenants").collect();

    return await Promise.all(
      tenants.map(async (tenant) => {
        const license = await ctx.db
          .query("tenantLicenses")
          .withIndex("by_tenant", (q) => q.eq("tenantId", tenant._id))
          .unique();
        return { tenant, license };
      }),
    );
  },
});

/** Create or update a tenant's per-scan license price. System admin only. */
export const upsertTenantLicense = mutation({
  args: {
    tenantId: v.id("tenants"),
    scanPrice: v.number(),
    currency: v.string(),
    status: v.union(v.literal("active"), v.literal("suspended")),
  },
  handler: async (ctx, args) => {
    const admin = await requireSuperAdmin(ctx);

    const existing = await ctx.db
      .query("tenantLicenses")
      .withIndex("by_tenant", (q) => q.eq("tenantId", args.tenantId))
      .unique();

    if (existing) {
      await ctx.db.patch(existing._id, {
        scanPrice: args.scanPrice,
        currency: args.currency,
        status: args.status,
        updatedByUserId: admin._id,
      });
      return existing._id;
    }

    return await ctx.db.insert("tenantLicenses", {
      tenantId: args.tenantId,
      scanPrice: args.scanPrice,
      currency: args.currency,
      status: args.status,
      updatedByUserId: admin._id,
    });
  },
});

/** A tenant admin's read-only view of their own license terms. */
export const getMyLicense = query({
  args: {},
  handler: async (ctx) => {
    const user = await requireCurrentUser(ctx);
    return await ctx.db
      .query("tenantLicenses")
      .withIndex("by_tenant", (q) => q.eq("tenantId", user.tenantId))
      .unique();
  },
});
