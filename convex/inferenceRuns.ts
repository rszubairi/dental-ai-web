import { httpAction, internalMutation, internalQuery } from "./_generated/server";
import { internal } from "./_generated/api";
import { v } from "convex/values";
import type { Doc } from "./_generated/dataModel";

/**
 * Log of inference runs made from the Streamlit QA viewer
 * (services/inference/inference_runs.py writes and reads it), so runs can be
 * compared by model version.
 *
 * The viewer isn't a signed-in app user, so these are HTTP routes (registered
 * in http.ts) authenticated with a shared secret: set INFERENCE_LOG_SECRET on
 * the deployment (`npx convex env set INFERENCE_LOG_SECRET ...`) and the same
 * value in the viewer's environment.
 */

const MAX_RUNS_PER_LIST = 1000;
const MAX_VERSIONS = 500;

const runFields = {
  runId: v.string(),
  ranAt: v.number(),
  mode: v.string(),
  source: v.string(),
  filename: v.string(),
  sampleSha256: v.string(),
  modelVersion: v.string(),
  modelVersionComponents: v.any(),
  settings: v.any(),
  durationS: v.number(),
  teethCount: v.number(),
  missingCount: v.number(),
  uncertainCount: v.number(),
  outputs: v.optional(v.any()),
  error: v.optional(v.string()),
};

export const hasSample = internalQuery({
  args: { sha256: v.string() },
  handler: async (ctx, args) => {
    const sample = await ctx.db
      .query("inferenceSamples")
      .withIndex("by_sha256", (q) => q.eq("sha256", args.sha256))
      .unique();
    return sample !== null;
  },
});

/** Returns false if the sample was already stored (by a concurrent upload), so the caller can delete its copy. */
export const addSample = internalMutation({
  args: { sha256: v.string(), storageId: v.id("_storage"), filename: v.string() },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("inferenceSamples")
      .withIndex("by_sha256", (q) => q.eq("sha256", args.sha256))
      .unique();
    if (existing) return false;
    await ctx.db.insert("inferenceSamples", args);
    return true;
  },
});

export const record = internalMutation({
  args: runFields,
  handler: async (ctx, args) => {
    const newSample =
      (await ctx.db
        .query("inferenceRuns")
        .withIndex("by_modelVersion_and_sampleSha256", (q) =>
          q.eq("modelVersion", args.modelVersion).eq("sampleSha256", args.sampleSha256),
        )
        .first()) === null;
    const id = await ctx.db.insert("inferenceRuns", args);

    const succeeded = args.error === undefined;
    const totals = await ctx.db
      .query("inferenceVersions")
      .withIndex("by_modelVersion", (q) => q.eq("modelVersion", args.modelVersion))
      .unique();
    if (totals === null) {
      await ctx.db.insert("inferenceVersions", {
        modelVersion: args.modelVersion,
        runs: 1,
        failed: succeeded ? 0 : 1,
        samples: 1,
        modes: [args.mode],
        firstRanAt: args.ranAt,
        lastRanAt: args.ranAt,
        totalDurationS: succeeded ? args.durationS : 0,
        totalTeeth: succeeded ? args.teethCount : 0,
        modelVersionComponents: args.modelVersionComponents,
      });
    } else {
      await ctx.db.patch("inferenceVersions", totals._id, {
        runs: totals.runs + 1,
        failed: totals.failed + (succeeded ? 0 : 1),
        samples: totals.samples + (newSample ? 1 : 0),
        modes: totals.modes.includes(args.mode) ? totals.modes : [...totals.modes, args.mode].sort(),
        firstRanAt: Math.min(totals.firstRanAt, args.ranAt),
        lastRanAt: Math.max(totals.lastRanAt, args.ranAt),
        totalDurationS: totals.totalDurationS + (succeeded ? args.durationS : 0),
        totalTeeth: totals.totalTeeth + (succeeded ? args.teethCount : 0),
      });
    }
    return id;
  },
});

export const listVersions = internalQuery({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("inferenceVersions").withIndex("by_lastRanAt").order("desc").take(MAX_VERSIONS);
  },
});

/** Run without its outputs, for list views. */
type RunSummary = Omit<Doc<"inferenceRuns">, "outputs">;

export const listRuns = internalQuery({
  args: { modelVersion: v.optional(v.string()), sampleSha256: v.optional(v.string()), limit: v.number() },
  handler: async (ctx, args): Promise<RunSummary[]> => {
    const { modelVersion, sampleSha256 } = args;
    const limit = Math.min(args.limit, MAX_RUNS_PER_LIST);
    let runs: Doc<"inferenceRuns">[];
    if (modelVersion !== undefined) {
      runs = await ctx.db
        .query("inferenceRuns")
        .withIndex("by_modelVersion_and_ranAt", (q) => q.eq("modelVersion", modelVersion))
        .order("desc")
        .take(limit);
    } else if (sampleSha256 !== undefined) {
      runs = await ctx.db
        .query("inferenceRuns")
        .withIndex("by_sampleSha256", (q) => q.eq("sampleSha256", sampleSha256))
        .order("desc")
        .take(limit);
    } else {
      runs = await ctx.db.query("inferenceRuns").order("desc").take(limit);
    }
    return runs.map(({ outputs: _outputs, ...run }) => run);
  },
});

export const getRun = internalQuery({
  args: { runId: v.string() },
  handler: async (ctx, args) => {
    const run = await ctx.db
      .query("inferenceRuns")
      .withIndex("by_runId", (q) => q.eq("runId", args.runId))
      .unique();
    if (!run) return null;
    const sample = await ctx.db
      .query("inferenceSamples")
      .withIndex("by_sha256", (q) => q.eq("sha256", run.sampleSha256))
      .unique();
    return { ...run, sampleUrl: sample ? await ctx.storage.getUrl(sample.storageId) : null };
  },
});

function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), { status, headers: { "Content-Type": "application/json" } });
}

/** Null if the request carries the shared secret, else the error response to return. */
function rejectUnauthorized(request: Request): Response | null {
  const secret = process.env.INFERENCE_LOG_SECRET;
  if (!secret) return json({ error: "INFERENCE_LOG_SECRET is not set on this deployment" }, 503);
  return request.headers.get("Authorization") === `Bearer ${secret}` ? null : json({ error: "Unauthorized" }, 401);
}

/**
 * Storing a run's X-ray takes two steps, because HTTP action request bodies are
 * size-limited (a large panoramic or DICOM gets a 413) while storage upload URLs
 * are not:
 *
 * 1. POST /inference-log/samples/upload-url?sha256=...: {exists: true} if that
 *    X-ray is already stored, else {uploadUrl}. The client POSTs the bytes to
 *    uploadUrl, which returns {storageId}.
 * 2. POST /inference-log/samples, body {sha256, storageId, filename}: records it.
 */
export const sampleUploadUrl = httpAction(async (ctx, request) => {
  const rejected = rejectUnauthorized(request);
  if (rejected) return rejected;
  const sha256 = new URL(request.url).searchParams.get("sha256");
  if (!sha256) return json({ error: "sha256 is required" }, 400);

  const exists: boolean = await ctx.runQuery(internal.inferenceRuns.hasSample, { sha256 });
  if (exists) return json({ exists: true });
  return json({ exists: false, uploadUrl: await ctx.storage.generateUploadUrl() });
});

export const commitSample = httpAction(async (ctx, request) => {
  const rejected = rejectUnauthorized(request);
  if (rejected) return rejected;
  const { sha256, storageId, filename } = await request.json();
  const created: boolean = await ctx.runMutation(internal.inferenceRuns.addSample, { sha256, storageId, filename });
  // Another upload of the same X-ray got there first: drop this copy.
  if (!created) await ctx.storage.delete(storageId);
  return json({ created });
});

/** POST /inference-log/runs, body: the run (runFields) as JSON. */
export const recordRun = httpAction(async (ctx, request) => {
  const rejected = rejectUnauthorized(request);
  if (rejected) return rejected;
  const id: string = await ctx.runMutation(internal.inferenceRuns.record, await request.json());
  return json({ id });
});

/** GET /inference-log/versions: per-version run totals, most recently run first. */
export const getVersions = httpAction(async (ctx, request) => {
  const rejected = rejectUnauthorized(request);
  if (rejected) return rejected;
  const versions: Doc<"inferenceVersions">[] = await ctx.runQuery(internal.inferenceRuns.listVersions, {});
  return json(versions);
});

/** GET /inference-log/runs?modelVersion=...|sampleSha256=...&limit=...: newest runs first, without outputs. */
export const getRuns = httpAction(async (ctx, request) => {
  const rejected = rejectUnauthorized(request);
  if (rejected) return rejected;
  const params = new URL(request.url).searchParams;
  const runs: RunSummary[] = await ctx.runQuery(internal.inferenceRuns.listRuns, {
    modelVersion: params.get("modelVersion") ?? undefined,
    sampleSha256: params.get("sampleSha256") ?? undefined,
    limit: Number(params.get("limit") ?? 200),
  });
  return json(runs);
});

/** GET /inference-log/run?runId=...: one run with its outputs and a URL for its X-ray. */
export const getRunById = httpAction(async (ctx, request) => {
  const rejected = rejectUnauthorized(request);
  if (rejected) return rejected;
  const runId = new URL(request.url).searchParams.get("runId");
  if (!runId) return json({ error: "runId is required" }, 400);
  const run: (Doc<"inferenceRuns"> & { sampleUrl: string | null }) | null = await ctx.runQuery(
    internal.inferenceRuns.getRun,
    { runId },
  );
  return run ? json(run) : json({ error: "Run not found" }, 404);
});
