import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { requireCurrentUser } from "./lib/tenant";

export const listCases = query({
  args: { clinicId: v.optional(v.id("clinics")) },
  handler: async (ctx, args) => {
    const user = await requireCurrentUser(ctx);
    const cases = await ctx.db
      .query("cases")
      .withIndex("by_tenant", (q) => q.eq("tenantId", user.tenantId))
      .collect();

    return args.clinicId ? cases.filter((c) => c.clinicId === args.clinicId) : cases;
  },
});

export const getCase = query({
  args: { caseId: v.id("cases") },
  handler: async (ctx, args) => {
    const user = await requireCurrentUser(ctx);
    const caseDoc = await ctx.db.get(args.caseId);
    if (!caseDoc || caseDoc.tenantId !== user.tenantId) {
      throw new Error("Case not found");
    }
    return caseDoc;
  },
});

export const createCase = mutation({
  args: {
    clinicId: v.id("clinics"),
    patientId: v.id("patients"),
  },
  handler: async (ctx, args) => {
    const user = await requireCurrentUser(ctx);

    return await ctx.db.insert("cases", {
      tenantId: user.tenantId,
      clinicId: args.clinicId,
      patientId: args.patientId,
      createdByUserId: user._id,
      status: "uploaded",
      version: 1,
    });
  },
});

export const attachImage = mutation({
  args: {
    caseId: v.id("cases"),
    storageId: v.id("_storage"),
    imageType: v.union(v.literal("panoramic"), v.literal("periapical"), v.literal("bitewing")),
  },
  handler: async (ctx, args) => {
    const user = await requireCurrentUser(ctx);
    const caseDoc = await ctx.db.get(args.caseId);
    if (!caseDoc || caseDoc.tenantId !== user.tenantId) {
      throw new Error("Case not found");
    }

    const imageId = await ctx.db.insert("images", {
      tenantId: user.tenantId,
      caseId: args.caseId,
      storageId: args.storageId,
      imageType: args.imageType,
    });

    await ctx.db.patch(args.caseId, { status: "queued" });

    // NOTE: actual AI job enqueue happens in aiJobs.enqueue once the Python
    // inference service has a trained checkpoint (see services/inference/).
    return imageId;
  },
});
