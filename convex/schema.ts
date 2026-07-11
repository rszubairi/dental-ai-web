import { defineSchema, defineTable } from "convex/server";
import { authTables } from "@convex-dev/auth/server";
import { v } from "convex/values";

export const roles = v.union(
  v.literal("super_admin"),
  v.literal("tenant_admin"),
  v.literal("clinic_manager"),
  v.literal("dentist"),
  v.literal("call_centre_agent"),
  v.literal("receptionist"),
  v.literal("auditor"),
  v.literal("viewer"),
);

export default defineSchema({
  ...authTables,

  tenants: defineTable({
    name: v.string(),
    slug: v.string(),
    status: v.union(v.literal("active"), v.literal("suspended")),
    settings: v.object({
      currency: v.string(),
      country: v.string(),
    }),
  }).index("by_slug", ["slug"]),

  clinics: defineTable({
    tenantId: v.id("tenants"),
    name: v.string(),
    address: v.optional(v.string()),
  }).index("by_tenant", ["tenantId"]),

  // Extends the authTables.users table (name/email/image/etc. come from
  // Convex Auth) with the app-level fields RBAC and multi-tenancy need.
  users: defineTable({
    name: v.optional(v.string()),
    email: v.optional(v.string()),
    phone: v.optional(v.string()),
    image: v.optional(v.string()),
    emailVerificationTime: v.optional(v.number()),
    phoneVerificationTime: v.optional(v.number()),
    isAnonymous: v.optional(v.boolean()),

    tenantId: v.optional(v.id("tenants")),
    clinicId: v.optional(v.id("clinics")),
    role: v.optional(roles),
    status: v.optional(v.union(v.literal("active"), v.literal("invited"), v.literal("disabled"))),
  })
    .index("email", ["email"])
    .index("phone", ["phone"])
    .index("by_tenant", ["tenantId"]),

  patients: defineTable({
    tenantId: v.id("tenants"),
    clinicId: v.id("clinics"),
    name: v.string(),
    dateOfBirth: v.optional(v.string()),
    externalRef: v.optional(v.string()),
  })
    .index("by_tenant", ["tenantId"])
    .index("by_clinic", ["clinicId"]),

  cases: defineTable({
    tenantId: v.id("tenants"),
    clinicId: v.id("clinics"),
    patientId: v.id("patients"),
    createdByUserId: v.id("users"),
    status: v.union(
      v.literal("uploaded"),
      v.literal("queued"),
      v.literal("processing"),
      v.literal("review_pending"),
      v.literal("approved"),
      v.literal("rejected"),
    ),
    version: v.number(),
  })
    .index("by_tenant", ["tenantId"])
    .index("by_clinic", ["clinicId"])
    .index("by_patient", ["patientId"]),

  images: defineTable({
    tenantId: v.id("tenants"),
    caseId: v.id("cases"),
    storageId: v.id("_storage"),
    imageType: v.union(v.literal("panoramic"), v.literal("periapical"), v.literal("bitewing")),
  })
    .index("by_tenant", ["tenantId"])
    .index("by_case", ["caseId"]),

  aiJobs: defineTable({
    tenantId: v.id("tenants"),
    caseId: v.id("cases"),
    imageId: v.id("images"),
    model: v.string(),
    status: v.union(
      v.literal("pending"),
      v.literal("running"),
      v.literal("succeeded"),
      v.literal("failed"),
    ),
    error: v.optional(v.string()),
  })
    .index("by_tenant", ["tenantId"])
    .index("by_case", ["caseId"])
    .index("by_status", ["status"]),

  reports: defineTable({
    tenantId: v.id("tenants"),
    caseId: v.id("cases"),
    aiJobId: v.id("aiJobs"),
    model: v.string(),
    modelVersion: v.string(),
    findings: v.array(
      v.object({
        fdiNumber: v.optional(v.string()),
        label: v.string(),
        bbox: v.array(v.number()),
        confidence: v.number(),
      }),
    ),
  })
    .index("by_tenant", ["tenantId"])
    .index("by_case", ["caseId"]),

  pricingRules: defineTable({
    tenantId: v.id("tenants"),
    treatmentCode: v.string(),
    treatmentName: v.string(),
    unitPrice: v.number(),
    currency: v.string(),
  })
    .index("by_tenant", ["tenantId"])
    .index("by_treatment", ["tenantId", "treatmentCode"]),

  quotations: defineTable({
    tenantId: v.id("tenants"),
    caseId: v.id("cases"),
    lineItems: v.array(
      v.object({
        treatmentCode: v.string(),
        treatmentName: v.string(),
        quantity: v.number(),
        unitPrice: v.number(),
        total: v.number(),
        mandatory: v.boolean(),
      }),
    ),
    currency: v.string(),
    vatRate: v.number(),
    discount: v.optional(v.number()),
    total: v.number(),
    pdfStorageId: v.optional(v.id("_storage")),
    status: v.union(v.literal("draft"), v.literal("sent"), v.literal("accepted"), v.literal("rejected")),
  })
    .index("by_tenant", ["tenantId"])
    .index("by_case", ["caseId"]),

  auditLogs: defineTable({
    tenantId: v.id("tenants"),
    userId: v.optional(v.id("users")),
    action: v.string(),
    entityType: v.string(),
    entityId: v.string(),
    metadata: v.optional(v.any()),
  })
    .index("by_tenant", ["tenantId"])
    .index("by_entity", ["entityType", "entityId"]),
});
