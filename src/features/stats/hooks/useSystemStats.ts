"use client";

import { useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { useCurrentUser } from "@/features/authentication/hooks/useCurrentUser";

export function useSystemStats() {
  const { isAuthenticated, user } = useCurrentUser();
  return useQuery(api.stats.getSystemStats, isAuthenticated && user?.role === "super_admin" ? {} : "skip");
}
