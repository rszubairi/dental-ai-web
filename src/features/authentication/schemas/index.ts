import { z } from "zod";

// Consumer/free email providers are not accepted for enterprise sign-up —
// keep this in sync with convex/lib/email.ts.
const FREE_EMAIL_DOMAINS = new Set([
  "gmail.com",
  "googlemail.com",
  "yahoo.com",
  "yahoo.co.uk",
  "hotmail.com",
  "hotmail.co.uk",
  "outlook.com",
  "live.com",
  "msn.com",
  "aol.com",
  "icloud.com",
  "me.com",
  "mac.com",
  "protonmail.com",
  "proton.me",
  "gmx.com",
  "gmx.net",
  "mail.com",
  "zoho.com",
  "yandex.com",
  "qq.com",
  "163.com",
  "126.com",
  "rediffmail.com",
]);

const businessEmail = z
  .string()
  .email()
  .refine((email) => !FREE_EMAIL_DOMAINS.has(email.split("@")[1]?.toLowerCase() ?? ""), {
    message: "Please use your company email address, not a personal one (Gmail, Hotmail, etc.)",
  });

export const signInSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

export const signUpSchema = z.object({
  fullName: z.string().min(2, "Enter your full name"),
  company: z.string().min(2, "Enter your company name"),
  email: businessEmail,
  phone: z.string().min(7, "Enter a valid phone number"),
  preferredContactTime: z.enum(["morning", "afternoon", "evening", "anytime"]),
  notes: z.string().max(2000).optional().or(z.literal("")),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

export type SignInInput = z.infer<typeof signInSchema>;
export type SignUpInput = z.infer<typeof signUpSchema>;
