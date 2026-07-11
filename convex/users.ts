import { getAuthUserId } from "@convex-dev/auth/server";
import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { requireCurrentUser, requireRole } from "./lib/tenant";
import { roles } from "./schema";

/** Returns the authenticated user's app-level record, or null pre-onboarding (no tenant yet). */
export const getCurrentUser = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return null;
    return await ctx.db.get(userId);
  },
});

/**
 * A freshly signed-up user has no tenantId/role. This creates their tenant
 * and makes them its tenant_admin — the only self-serve path into a tenant
 * right now. Joining an *existing* tenant happens via inviteUser instead.
 */
export const completeOnboarding = mutation({
  args: {
    tenantName: v.string(),
    tenantSlug: v.string(),
    currency: v.string(),
    country: v.string(),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const user = await ctx.db.get(userId);
    if (!user) throw new Error("No user record for authenticated identity");
    if (user.tenantId) throw new Error("User already belongs to a tenant");

    const existingSlug = await ctx.db
      .query("tenants")
      .withIndex("by_slug", (q) => q.eq("slug", args.tenantSlug))
      .unique();
    if (existingSlug) throw new Error(`Tenant slug "${args.tenantSlug}" already in use`);

    const tenantId = await ctx.db.insert("tenants", {
      name: args.tenantName,
      slug: args.tenantSlug,
      status: "active",
      settings: { currency: args.currency, country: args.country },
    });

    await ctx.db.patch(userId, { tenantId, role: "tenant_admin", status: "active" });

    return tenantId;
  },
});

export const listTenantUsers = query({
  args: {},
  handler: async (ctx) => {
    const caller = await requireCurrentUser(ctx);
    return await ctx.db
      .query("users")
      .withIndex("by_tenant", (q) => q.eq("tenantId", caller.tenantId))
      .collect();
  },
});

export const inviteUser = mutation({
  args: {
    email: v.string(),
    name: v.string(),
    role: roles,
    clinicId: v.optional(v.id("clinics")),
  },
  handler: async (ctx, args) => {
    const caller = await requireCurrentUser(ctx);
    requireRole(caller.role, "clinic_manager");

    // NOTE: this pre-provisions a users row before sign-up. Whether Convex
    // Auth's Password provider links a later sign-up to this row depends on
    // matching email during account creation — verify this behaves as
    // expected once real invite flows are tested end-to-end.
    return await ctx.db.insert("users", {
      tenantId: caller.tenantId,
      clinicId: args.clinicId,
      email: args.email,
      name: args.name,
      role: args.role,
      status: "invited",
    });
  },
});

export const updateUserRole = mutation({
  args: {
    userId: v.id("users"),
    role: roles,
  },
  handler: async (ctx, args) => {
    const caller = await requireCurrentUser(ctx);
    requireRole(caller.role, "tenant_admin");

    const target = await ctx.db.get(args.userId);
    if (!target || target.tenantId !== caller.tenantId) {
      throw new Error("User not found in tenant");
    }

    await ctx.db.patch(args.userId, { role: args.role });
  },
});
