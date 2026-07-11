import { getAuthUserId } from "@convex-dev/auth/server";
import { QueryCtx, MutationCtx } from "../_generated/server";
import { Id } from "../_generated/dataModel";

/**
 * Every Convex query/mutation must resolve the caller's tenant via this
 * helper rather than trusting a tenantId passed from the client. Cross-tenant
 * access is prohibited per requirements.md.
 *
 * A freshly signed-up user has no tenantId/role yet (see users.completeOnboarding) —
 * this throws until onboarding assigns them to a tenant.
 */
export async function requireCurrentUser(ctx: QueryCtx | MutationCtx) {
  const userId = await getAuthUserId(ctx);
  if (!userId) {
    throw new Error("Not authenticated");
  }

  const user = await ctx.db.get(userId);
  if (!user) {
    throw new Error("No user record for authenticated identity");
  }
  if (!user.tenantId || !user.role) {
    throw new Error("User has not completed tenant onboarding");
  }

  return user as typeof user & { tenantId: Id<"tenants">; role: NonNullable<typeof user.role> };
}

export function assertTenantMatch(userTenantId: Id<"tenants">, resourceTenantId: Id<"tenants">) {
  if (userTenantId !== resourceTenantId) {
    throw new Error("Cross-tenant access denied");
  }
}

const ROLE_RANK: Record<string, number> = {
  viewer: 0,
  auditor: 1,
  receptionist: 2,
  call_centre_agent: 2,
  dentist: 3,
  clinic_manager: 4,
  tenant_admin: 5,
  super_admin: 6,
};

export function requireRole(role: string, minimumRole: string) {
  if ((ROLE_RANK[role] ?? -1) < (ROLE_RANK[minimumRole] ?? Infinity)) {
    throw new Error(`Requires role >= ${minimumRole}, caller has ${role}`);
  }
}

/**
 * System-wide administration (licensing, cross-tenant billing) is
 * super_admin only and is NOT scoped to the caller's own tenant.
 */
export async function requireSuperAdmin(ctx: QueryCtx | MutationCtx) {
  const user = await requireCurrentUser(ctx);
  requireRole(user.role, "super_admin");
  return user;
}

export function currentBillingMonth(): string {
  return new Date().toISOString().slice(0, 7); // "YYYY-MM"
}
