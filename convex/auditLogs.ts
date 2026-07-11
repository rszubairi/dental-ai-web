import { internalMutation, query } from "./_generated/server";
import { v } from "convex/values";
import { requireCurrentUser, requireRole } from "./lib/tenant";

export const record = internalMutation({
  args: {
    tenantId: v.id("tenants"),
    userId: v.optional(v.id("users")),
    action: v.string(),
    entityType: v.string(),
    entityId: v.string(),
    metadata: v.optional(v.any()),
  },
  handler: async (ctx, args) => {
    await ctx.db.insert("auditLogs", args);
  },
});

export const listForTenant = query({
  args: {},
  handler: async (ctx) => {
    const user = await requireCurrentUser(ctx);
    requireRole(user.role, "auditor");

    return await ctx.db
      .query("auditLogs")
      .withIndex("by_tenant", (q) => q.eq("tenantId", user.tenantId))
      .order("desc")
      .take(200);
  },
});
