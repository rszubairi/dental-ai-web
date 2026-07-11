"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthActions } from "@convex-dev/auth/react";

import { ToothMark } from "@/components/brand/ToothMark";
import { useCurrentUser } from "@/features/authentication/hooks/useCurrentUser";
import { AppShell } from "./AppShell";

export function DashboardShell({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading, needsOnboarding, user } = useCurrentUser();
  const { signOut } = useAuthActions();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && (!isAuthenticated || needsOnboarding)) {
      router.replace("/");
    }
  }, [isLoading, isAuthenticated, needsOnboarding, router]);

  if (isLoading || !isAuthenticated || needsOnboarding) {
    return (
      <main className="flex min-h-screen flex-1 items-center justify-center">
        <div className="animate-pulse text-primary">
          <ToothMark size={40} animate={false} />
        </div>
      </main>
    );
  }

  return (
    <AppShell userName={user?.name} userEmail={user?.email} role={user?.role} onSignOut={() => void signOut()}>
      {children}
    </AppShell>
  );
}
