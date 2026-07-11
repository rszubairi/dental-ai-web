import { query } from "./_generated/server";
import { requireCurrentUser } from "./lib/tenant";

export const listPatients = query({
  args: {},
  handler: async (ctx) => {
    const user = await requireCurrentUser(ctx);
    return await ctx.db
      .query("patients")
      .withIndex("by_tenant", (q) => q.eq("tenantId", user.tenantId))
      .collect();
  },
});
