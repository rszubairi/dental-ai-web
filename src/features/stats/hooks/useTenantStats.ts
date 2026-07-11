"use client";

import { useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { useCurrentUser } from "@/features/authentication/hooks/useCurrentUser";

export function useTenantStats() {
  const { isAuthenticated, needsOnboarding } = useCurrentUser();
  return useQuery(api.stats.getTenantStats, isAuthenticated && !needsOnboarding ? {} : "skip");
}
