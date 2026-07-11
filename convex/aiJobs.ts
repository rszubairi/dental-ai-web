import { internalMutation, mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { requireCurrentUser, currentBillingMonth } from "./lib/tenant";
import { chargeForScan } from "./billing";

/**
 * AI Job Queue. Next.js never calls the Python inference service directly:
 * React -> Convex Mutation -> aiJobs row -> (external worker polls/pulls) ->
 * Python inference -> Convex mutation below -> React subscription.
 */

export const enqueue = mutation({
  args: {
    caseId: v.id("cases"),
    imageId: v.id("images"),
    model: v.string(),
  },
  handler: async (ctx, args) => {
    const user = await requireCurrentUser(ctx);
    const caseDoc = await ctx.db.get(args.caseId);
    if (!caseDoc || caseDoc.tenantId !== user.tenantId) {
      throw new Error("Case not found");
    }

    await ctx.db.patch(args.caseId, { status: "processing" });

    return await ctx.db.insert("aiJobs", {
      tenantId: user.tenantId,
      caseId: args.caseId,
      imageId: args.imageId,
      model: args.model,
      status: "pending",
    });
  },
});

export const listPending = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db
      .query("aiJobs")
      .withIndex("by_status", (q) => q.eq("status", "pending"))
      .collect();
  },
});

/** Called by the Python inference service (via an authenticated Convex HTTP action), not by users. */
export const markRunning = internalMutation({
  args: { jobId: v.id("aiJobs") },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.jobId, { status: "running" });
  },
});

export const markSucceeded = internalMutation({
  args: {
    jobId: v.id("aiJobs"),
    modelVersion: v.string(),
    findings: v.array(
      v.object({
        fdiNumber: v.optional(v.string()),
        label: v.string(),
        bbox: v.array(v.number()),
        confidence: v.number(),
      }),
    ),
  },
  handler: async (ctx, args) => {
    const job = await ctx.db.get(args.jobId);
    if (!job) throw new Error("AI job not found");

    await ctx.db.patch(args.jobId, { status: "succeeded", completedMonth: currentBillingMonth() });

    await ctx.db.insert("reports", {
      tenantId: job.tenantId,
      caseId: job.caseId,
      aiJobId: args.jobId,
      model: job.model,
      modelVersion: args.modelVersion,
      findings: args.findings,
    });

    await ctx.db.patch(job.caseId, { status: "review_pending" });

    await chargeForScan(ctx, { tenantId: job.tenantId, aiJobId: args.jobId, caseId: job.caseId });
  },
});

export const markFailed = internalMutation({
  args: { jobId: v.id("aiJobs"), error: v.string() },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.jobId, { status: "failed", error: args.error });
  },
});
