import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { requireCurrentUser, requireRole } from "./lib/tenant";

export const getCurrentTenant = query({
  args: {},
  handler: async (ctx) => {
    const user = await requireCurrentUser(ctx);
    return await ctx.db.get(user.tenantId);
  },
});

export const createTenant = mutation({
  args: {
    name: v.string(),
    slug: v.string(),
    currency: v.string(),
    country: v.string(),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("tenants")
      .withIndex("by_slug", (q) => q.eq("slug", args.slug))
      .unique();
    if (existing) {
      throw new Error(`Tenant slug "${args.slug}" already in use`);
    }

    return await ctx.db.insert("tenants", {
      name: args.name,
      slug: args.slug,
      status: "active",
      settings: { currency: args.currency, country: args.country },
    });
  },
});

export const updateTenantSettings = mutation({
  args: {
    currency: v.optional(v.string()),
    country: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const user = await requireCurrentUser(ctx);
    requireRole(user.role, "tenant_admin");

    const tenant = await ctx.db.get(user.tenantId);
    if (!tenant) throw new Error("Tenant not found");

    await ctx.db.patch(user.tenantId, {
      settings: {
        currency: args.currency ?? tenant.settings.currency,
        country: args.country ?? tenant.settings.country,
      },
    });
  },
});
