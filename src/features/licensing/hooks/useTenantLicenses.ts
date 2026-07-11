"use client";

import { useMutation, useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { useCurrentUser } from "@/features/authentication/hooks/useCurrentUser";

export function useTenantLicenses() {
  const { isAuthenticated, user } = useCurrentUser();
  return useQuery(
    api.licensing.listTenantLicenses,
    isAuthenticated && user?.role === "super_admin" ? {} : "skip",
  );
}

export function useUpsertTenantLicense() {
  return useMutation(api.licensing.upsertTenantLicense);
}
