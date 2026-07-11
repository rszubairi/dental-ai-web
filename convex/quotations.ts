import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { requireCurrentUser } from "./lib/tenant";

export const listQuotations = query({
  args: {},
  handler: async (ctx) => {
    const user = await requireCurrentUser(ctx);
    return await ctx.db
      .query("quotations")
      .withIndex("by_tenant", (q) => q.eq("tenantId", user.tenantId))
      .collect();
  },
});

export const getQuotationsForCase = query({
  args: { caseId: v.id("cases") },
  handler: async (ctx, args) => {
    const user = await requireCurrentUser(ctx);
    const caseDoc = await ctx.db.get(args.caseId);
    if (!caseDoc || caseDoc.tenantId !== user.tenantId) {
      throw new Error("Case not found");
    }

    return await ctx.db
      .query("quotations")
      .withIndex("by_case", (q) => q.eq("caseId", args.caseId))
      .collect();
  },
});

export const createQuotation = mutation({
  args: {
    caseId: v.id("cases"),
    lineItems: v.array(
      v.object({
        treatmentCode: v.string(),
        treatmentName: v.string(),
        quantity: v.number(),
        unitPrice: v.number(),
        total: v.number(),
        mandatory: v.boolean(),
      }),
    ),
    currency: v.string(),
    vatRate: v.number(),
    discount: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const user = await requireCurrentUser(ctx);
    const caseDoc = await ctx.db.get(args.caseId);
    if (!caseDoc || caseDoc.tenantId !== user.tenantId) {
      throw new Error("Case not found");
    }

    const subtotal = args.lineItems.reduce((sum, item) => sum + item.total, 0);
    const discounted = subtotal - (args.discount ?? 0);
    const total = discounted + discounted * args.vatRate;

    return await ctx.db.insert("quotations", {
      tenantId: user.tenantId,
      caseId: args.caseId,
      lineItems: args.lineItems,
      currency: args.currency,
      vatRate: args.vatRate,
      discount: args.discount,
      total,
      status: "draft",
    });
  },
});
