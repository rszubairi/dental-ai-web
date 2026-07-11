import { query } from "./_generated/server";
import { v } from "convex/values";
import { requireCurrentUser } from "./lib/tenant";

export const getReportsForCase = query({
  args: { caseId: v.id("cases") },
  handler: async (ctx, args) => {
    const user = await requireCurrentUser(ctx);
    const caseDoc = await ctx.db.get(args.caseId);
    if (!caseDoc || caseDoc.tenantId !== user.tenantId) {
      throw new Error("Case not found");
    }

    return await ctx.db
      .query("reports")
      .withIndex("by_case", (q) => q.eq("caseId", args.caseId))
      .collect();
  },
});
