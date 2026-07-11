import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { requireCurrentUser, requireRole } from "./lib/tenant";

export const listPricingRules = query({
  args: {},
  handler: async (ctx) => {
    const user = await requireCurrentUser(ctx);
    return await ctx.db
      .query("pricingRules")
      .withIndex("by_tenant", (q) => q.eq("tenantId", user.tenantId))
      .collect();
  },
});

export const upsertPricingRule = mutation({
  args: {
    treatmentCode: v.string(),
    treatmentName: v.string(),
    unitPrice: v.number(),
    currency: v.string(),
  },
  handler: async (ctx, args) => {
    const user = await requireCurrentUser(ctx);
    requireRole(user.role, "tenant_admin");

    const existing = await ctx.db
      .query("pricingRules")
      .withIndex("by_treatment", (q) => q.eq("tenantId", user.tenantId).eq("treatmentCode", args.treatmentCode))
      .unique();

    if (existing) {
      await ctx.db.patch(existing._id, {
        treatmentName: args.treatmentName,
        unitPrice: args.unitPrice,
        currency: args.currency,
      });
      return existing._id;
    }

    return await ctx.db.insert("pricingRules", {
      tenantId: user.tenantId,
      treatmentCode: args.treatmentCode,
      treatmentName: args.treatmentName,
      unitPrice: args.unitPrice,
      currency: args.currency,
    });
  },
});
