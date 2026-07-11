"use client";

import { useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { useCurrentUser } from "@/features/authentication/hooks/useCurrentUser";

export function useScanHistory() {
  const { isAuthenticated, needsOnboarding } = useCurrentUser();
  return useQuery(api.billing.listScanHistory, isAuthenticated && !needsOnboarding ? {} : "skip");
}

export function useInvoices() {
  const { isAuthenticated, needsOnboarding } = useCurrentUser();
  return useQuery(api.billing.listInvoices, isAuthenticated && !needsOnboarding ? {} : "skip");
}

export function useOutstandingBalance() {
  const { isAuthenticated, needsOnboarding } = useCurrentUser();
  return useQuery(api.billing.getOutstandingBalance, isAuthenticated && !needsOnboarding ? {} : "skip");
}

export function useMyLicense() {
  const { isAuthenticated, needsOnboarding } = useCurrentUser();
  return useQuery(api.licensing.getMyLicense, isAuthenticated && !needsOnboarding ? {} : "skip");
}
