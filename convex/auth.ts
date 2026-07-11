import { convexAuth } from "@convex-dev/auth/server";
import { Password } from "@convex-dev/auth/providers/Password";
import { isFreeEmailDomain } from "./lib/email";

/**
 * requirements.md calls for Email OTP, Google, and Microsoft sign-in.
 * Those all need external credentials that don't exist yet
 * (AUTH_GOOGLE_ID/SECRET, AUTH_MICROSOFT_ENTRA_ID_ID/SECRET, AUTH_RESEND_KEY
 * — see apps/web/.env.local.example). Password is wired up now so local dev
 * and RBAC testing aren't blocked; swap/add the others once credentials
 * exist.
 */
export const { auth, signIn, signOut, store, isAuthenticated } = convexAuth({
  providers: [
    Password({
      /**
       * Sign-up captures enterprise lead details (name, company, phone,
       * best time to contact, notes) alongside the account itself — this
       * is a B2B product, so we validate against personal email providers
       * server-side too (the client-side check in
       * features/authentication/schemas is only a first line of defense).
       */
      profile(params) {
        const email = params.email as string;
        if (params.flow !== "signUp") {
          return { email };
        }

        if (isFreeEmailDomain(email)) {
          throw new Error("Please register with your company email address.");
        }

        const fullName = params.fullName as string | undefined;
        const company = params.company as string | undefined;
        const phone = params.phone as string | undefined;
        const preferredContactTime = params.preferredContactTime as string | undefined;
        if (!fullName || !company || !phone || !preferredContactTime) {
          throw new Error("Please complete all required fields.");
        }

        const profile: Record<string, string> = {
          email,
          name: fullName,
          company,
          phone,
          preferredContactTime,
          status: "active",
        };
        const notes = params.notes as string | undefined;
        if (notes) profile.notes = notes;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any -- Password<DataModel> can't infer our schema here.
        return profile as any;
      },
    }),
  ],
});
