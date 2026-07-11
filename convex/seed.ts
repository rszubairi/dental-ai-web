import { createAccount } from "@convex-dev/auth/server";
import { v } from "convex/values";
import { internal } from "./_generated/api";
import { internalAction, internalMutation } from "./_generated/server";
import { Id } from "./_generated/dataModel";

export const ensureTenant = internalMutation({
  args: { name: v.string(), slug: v.string(), currency: v.string(), country: v.string() },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("tenants")
      .withIndex("by_slug", (q) => q.eq("slug", args.slug))
      .unique();
    if (existing) return existing._id;

    return await ctx.db.insert("tenants", {
      name: args.name,
      slug: args.slug,
      status: "active",
      settings: { currency: args.currency, country: args.country },
    });
  },
});

/**
 * One-off seed for a super_admin account. Run with:
 *   npx convex run seed:seedAdmin '{"email":"...","password":"..."}'
 */
export const seedAdmin = internalAction({
  args: { email: v.string(), password: v.string() },
  handler: async (ctx, args) => {
    const tenantId: Id<"tenants"> = await ctx.runMutation(internal.seed.ensureTenant, {
      name: "Dental AI Platform",
      slug: "dental-ai-platform",
      currency: "USD",
      country: "US",
    });

    await createAccount(ctx, {
      provider: "password",
      account: { id: args.email, secret: args.password },
      profile: {
        email: args.email,
        name: "Admin",
        tenantId,
        role: "super_admin",
        status: "active",
      },
    });

    return { tenantId };
  },
});
