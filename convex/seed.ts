import { createAccount } from "@convex-dev/auth/server";
import { v } from "convex/values";
import { internal } from "./_generated/api";
import { internalAction, internalMutation, internalQuery } from "./_generated/server";
import { Id } from "./_generated/dataModel";
import { currentBillingMonth } from "./lib/tenant";

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
      onboardedMonth: currentBillingMonth(),
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

function lastNMonths(n: number): string[] {
  const months: string[] = [];
  const now = new Date();
  for (let i = n - 1; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    months.push(d.toISOString().slice(0, 7));
  }
  return months;
}

const FINDING_LABELS = ["caries", "periapical_lesion", "missing_tooth", "impacted_tooth", "root_fragment"];
const FDI_NUMBERS = ["11", "16", "24", "36", "37", "46", "47"];

/** Deterministic-enough pseudo-randomness is fine here — Convex mutations replay safely with Math.random. */
function randomFindings() {
  const count = 2 + Math.floor(Math.random() * 3);
  return Array.from({ length: count }, () => ({
    fdiNumber: FDI_NUMBERS[Math.floor(Math.random() * FDI_NUMBERS.length)],
    label: FINDING_LABELS[Math.floor(Math.random() * FINDING_LABELS.length)],
    bbox: [Math.random() * 0.6, Math.random() * 0.6, 0.1 + Math.random() * 0.2, 0.1 + Math.random() * 0.2],
    confidence: 0.75 + Math.random() * 0.23,
  }));
}

export const ensureDemoTenant = internalMutation({
  args: { name: v.string(), slug: v.string(), currency: v.string(), country: v.string(), onboardedMonth: v.string() },
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
      onboardedMonth: args.onboardedMonth,
    });
  },
});

export const findUserByEmail = internalQuery({
  args: { email: v.string() },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query("users")
      .withIndex("email", (q) => q.eq("email", args.email))
      .unique();
    return user?._id ?? null;
  },
});

/**
 * Populates one tenant's clinic, patients, license, and monthly scan volume
 * (cases -> images -> aiJobs -> reports, billed via the same chargeForScan
 * path production traffic uses) so admin analytics reflect real aggregation
 * rather than hardcoded numbers. Idempotent: skips tenants already seeded.
 */
export const seedTenantUsage = internalMutation({
  args: {
    tenantId: v.id("tenants"),
    adminUserId: v.id("users"),
    storageId: v.id("_storage"),
    scanPrice: v.number(),
    currency: v.string(),
    monthlyScanCounts: v.array(v.object({ month: v.string(), count: v.number() })),
  },
  handler: async (ctx, args) => {
    const alreadySeeded = await ctx.db
      .query("clinics")
      .withIndex("by_tenant", (q) => q.eq("tenantId", args.tenantId))
      .first();
    if (alreadySeeded) return { skipped: true };

    const clinicId = await ctx.db.insert("clinics", { tenantId: args.tenantId, name: "Main Clinic" });

    await ctx.db.insert("tenantLicenses", {
      tenantId: args.tenantId,
      scanPrice: args.scanPrice,
      currency: args.currency,
      status: "active",
      updatedByUserId: args.adminUserId,
    });

    const patientIds: Id<"patients">[] = [];
    for (let i = 0; i < 8; i++) {
      patientIds.push(
        await ctx.db.insert("patients", { tenantId: args.tenantId, clinicId, name: `Demo Patient ${i + 1}` }),
      );
    }

    const invoiceByMonth = new Map<string, Id<"invoices">>();
    let scanIndex = 0;

    for (const { month, count } of args.monthlyScanCounts) {
      if (count === 0) continue;

      let invoiceId = invoiceByMonth.get(month);
      if (!invoiceId) {
        invoiceId = await ctx.db.insert("invoices", {
          tenantId: args.tenantId,
          billingMonth: month,
          scanCount: 0,
          amount: 0,
          currency: args.currency,
          // Older months are settled; only the current month is still outstanding.
          status: month === args.monthlyScanCounts.at(-1)?.month ? "outstanding" : "paid",
          paidAt: month === args.monthlyScanCounts.at(-1)?.month ? undefined : Date.now(),
        });
        invoiceByMonth.set(month, invoiceId);
      }

      for (let i = 0; i < count; i++) {
        scanIndex += 1;
        const patientId = patientIds[scanIndex % patientIds.length];

        const caseId = await ctx.db.insert("cases", {
          tenantId: args.tenantId,
          clinicId,
          patientId,
          createdByUserId: args.adminUserId,
          status: "review_pending",
          version: 1,
        });

        const imageId = await ctx.db.insert("images", {
          tenantId: args.tenantId,
          caseId,
          storageId: args.storageId,
          imageType: "panoramic",
        });

        const jobId = await ctx.db.insert("aiJobs", {
          tenantId: args.tenantId,
          caseId,
          imageId,
          model: "tooth-detector-v1",
          status: "succeeded",
          completedMonth: month,
        });

        await ctx.db.insert("reports", {
          tenantId: args.tenantId,
          caseId,
          aiJobId: jobId,
          model: "tooth-detector-v1",
          modelVersion: "1.0.0",
          findings: randomFindings(),
        });

        await ctx.db.patch(invoiceId, {
          scanCount: (await ctx.db.get(invoiceId))!.scanCount + 1,
          amount: (await ctx.db.get(invoiceId))!.amount + args.scanPrice,
        });

        await ctx.db.insert("scanCharges", {
          tenantId: args.tenantId,
          aiJobId: jobId,
          caseId,
          unitPrice: args.scanPrice,
          currency: args.currency,
          billingMonth: month,
          invoiceId,
        });
      }
    }

    return { skipped: false, scansCreated: scanIndex };
  },
});

const TREATMENT_CATALOG = [
  { code: "D0150", name: "Comprehensive Exam", price: 85 },
  { code: "D1110", name: "Cleaning", price: 95 },
  { code: "D2391", name: "Composite Filling", price: 165 },
  { code: "D3310", name: "Root Canal (Anterior)", price: 620 },
  { code: "D2740", name: "Crown", price: 980 },
  { code: "D7140", name: "Extraction", price: 190 },
  { code: "D6010", name: "Dental Implant", price: 2100 },
];

/**
 * Backfills a treatment pricing catalog per tenant (if missing) and generates
 * quotations for a realistic subset of existing cases that don't have one
 * yet. Safe to re-run — skips tenants/cases already seeded. Run with:
 *   npx convex run seed:seedQuotations '{}'
 */
export const seedQuotations = internalMutation({
  args: {},
  handler: async (ctx) => {
    const tenants = await ctx.db.query("tenants").collect();
    let quotationsCreated = 0;

    for (const tenant of tenants) {
      const currency = tenant.settings.currency;

      const existingRules = await ctx.db
        .query("pricingRules")
        .withIndex("by_tenant", (q) => q.eq("tenantId", tenant._id))
        .first();
      if (!existingRules) {
        for (const item of TREATMENT_CATALOG) {
          await ctx.db.insert("pricingRules", {
            tenantId: tenant._id,
            treatmentCode: item.code,
            treatmentName: item.name,
            unitPrice: item.price,
            currency,
          });
        }
      }

      const cases = await ctx.db
        .query("cases")
        .withIndex("by_tenant", (q) => q.eq("tenantId", tenant._id))
        .collect();
      const existingQuotations = await ctx.db
        .query("quotations")
        .withIndex("by_tenant", (q) => q.eq("tenantId", tenant._id))
        .collect();
      const quotedCaseIds = new Set(existingQuotations.map((q) => q.caseId));

      for (const caseDoc of cases) {
        if (quotedCaseIds.has(caseDoc._id)) continue;
        if (Math.random() > 0.65) continue; // not every case gets a quotation

        const itemCount = 1 + Math.floor(Math.random() * 3);
        const lineItems = Array.from({ length: itemCount }, (_, i) => {
          const item = TREATMENT_CATALOG[Math.floor(Math.random() * TREATMENT_CATALOG.length)];
          return {
            treatmentCode: item.code,
            treatmentName: item.name,
            quantity: 1,
            unitPrice: item.price,
            total: item.price,
            mandatory: i === 0,
          };
        });

        const subtotal = lineItems.reduce((sum, li) => sum + li.total, 0);
        const vatRate = 0.06;
        const discount = Math.random() < 0.2 ? Math.round(subtotal * 0.1) : undefined;
        const discounted = subtotal - (discount ?? 0);
        const total = discounted + discounted * vatRate;

        const statusRoll = Math.random();
        const status =
          statusRoll < 0.3 ? "draft" : statusRoll < 0.6 ? "sent" : statusRoll < 0.85 ? "accepted" : "rejected";

        await ctx.db.insert("quotations", {
          tenantId: tenant._id,
          caseId: caseDoc._id,
          lineItems,
          currency,
          vatRate,
          discount,
          total,
          status,
        });
        quotationsCreated += 1;
      }
    }

    return { quotationsCreated };
  },
});

const DEMO_CLINICS = [
  { name: "Bright Smile Dental", slug: "bright-smile-dental", scanPrice: 8, onboardedIdx: 0, pattern: [4, 6, 9, 12, 15, 18] },
  { name: "Riverside Orthodontics", slug: "riverside-orthodontics", scanPrice: 12, onboardedIdx: 0, pattern: [2, 5, 8, 10, 14, 20] },
  { name: "Sunrise Family Dental", slug: "sunrise-family-dental", scanPrice: 6, onboardedIdx: 0, pattern: [3, 4, 5, 7, 9, 11] },
  { name: "Metro Dental Group", slug: "metro-dental-group", scanPrice: 10, onboardedIdx: 2, pattern: [0, 0, 6, 9, 13, 17] },
  { name: "Coastal Kids Dentistry", slug: "coastal-kids-dentistry", scanPrice: 7, onboardedIdx: 3, pattern: [0, 0, 0, 4, 7, 10] },
  { name: "Downtown Dental Studio", slug: "downtown-dental-studio", scanPrice: 9, onboardedIdx: 4, pattern: [0, 0, 0, 0, 3, 6] },
];

/**
 * One-off seed for realistic multi-tenant demo data (six clinics onboarded
 * across the last 6 months with growing scan volume) so the admin analytics
 * dashboard has real stats to aggregate. Run with:
 *   npx convex run seed:seedDemoData '{}'
 */
export const seedDemoData = internalAction({
  args: {},
  handler: async (ctx) => {
    const months = lastNMonths(6);
    const results: Array<{ tenant: string; skipped: boolean }> = [];

    for (const clinic of DEMO_CLINICS) {
      const tenantId: Id<"tenants"> = await ctx.runMutation(internal.seed.ensureDemoTenant, {
        name: clinic.name,
        slug: clinic.slug,
        currency: "USD",
        country: "US",
        onboardedMonth: months[clinic.onboardedIdx],
      });

      const email = `admin@${clinic.slug}.demo`;
      let adminUserId = await ctx.runQuery(internal.seed.findUserByEmail, { email });
      if (!adminUserId) {
        const { user } = await createAccount(ctx, {
          provider: "password",
          account: { id: email, secret: "DemoPassword123!" },
          profile: {
            email,
            name: `${clinic.name} Admin`,
            tenantId,
            role: "tenant_admin",
            status: "active",
          },
        });
        adminUserId = user._id;
      }

      const storageId = await ctx.storage.store(new Blob(["demo x-ray placeholder"]));

      const result = await ctx.runMutation(internal.seed.seedTenantUsage, {
        tenantId,
        adminUserId,
        storageId,
        scanPrice: clinic.scanPrice,
        currency: "USD",
        monthlyScanCounts: months.map((month, i) => ({ month, count: clinic.pattern[i] })),
      });

      results.push({ tenant: clinic.name, skipped: result.skipped });
    }

    return results;
  },
});
