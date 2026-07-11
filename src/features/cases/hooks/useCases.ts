"use client";

import { useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { useCurrentUser } from "@/features/authentication/hooks/useCurrentUser";

export function useCases() {
  const { isAuthenticated, needsOnboarding } = useCurrentUser();
  return useQuery(api.cases.listCases, isAuthenticated && !needsOnboarding ? {} : "skip");
}
