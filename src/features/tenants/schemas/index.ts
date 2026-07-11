import { z } from "zod";

export const onboardingSchema = z.object({
  tenantName: z.string().min(2, "Organization name is too short"),
  tenantSlug: z
    .string()
    .min(2)
    .regex(/^[a-z0-9-]+$/, "Lowercase letters, numbers, and hyphens only"),
  currency: z.string().length(3, "Use a 3-letter currency code, e.g. USD"),
  country: z.string().min(2, "Use a country code or name"),
});

export type OnboardingInput = z.infer<typeof onboardingSchema>;

export const tenantSettingsSchema = z.object({
  currency: z.string().length(3, "Use a 3-letter currency code, e.g. USD"),
  country: z.string().min(2, "Use a country code or name"),
});

export type TenantSettingsInput = z.infer<typeof tenantSettingsSchema>;
