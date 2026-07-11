import { convexAuth } from "@convex-dev/auth/server";
import { Password } from "@convex-dev/auth/providers/Password";

/**
 * requirements.md calls for Email OTP, Google, and Microsoft sign-in.
 * Those all need external credentials that don't exist yet
 * (AUTH_GOOGLE_ID/SECRET, AUTH_MICROSOFT_ENTRA_ID_ID/SECRET, AUTH_RESEND_KEY
 * — see apps/web/.env.local.example). Password is wired up now so local dev
 * and RBAC testing aren't blocked; swap/add the others once credentials
 * exist.
 */
export const { auth, signIn, signOut, store, isAuthenticated } = convexAuth({
  providers: [Password],
});
