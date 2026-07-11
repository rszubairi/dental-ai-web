"use client";

import { useConvexAuth, useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";

export function useCurrentUser() {
  const { isAuthenticated, isLoading: isAuthLoading } = useConvexAuth();
  const user = useQuery(api.users.getCurrentUser, isAuthenticated ? {} : "skip");

  return {
    isAuthenticated,
    isLoading: isAuthLoading || (isAuthenticated && user === undefined),
    user,
    needsOnboarding: isAuthenticated && user !== undefined && user !== null && !user.tenantId,
  };
}
