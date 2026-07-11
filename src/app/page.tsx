"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useAuthActions } from "@convex-dev/auth/react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ToothMark } from "@/components/brand/ToothMark";
import { AuthHeroPanel } from "@/components/brand/AuthHeroPanel";
import { FadeSlide } from "@/components/motion/FadeSlide";
import { AppShell } from "@/components/layout/AppShell";
import { CasesTable } from "@/features/cases/components/CasesTable";
import { SignInForm } from "@/features/authentication/components/SignInForm";
import { OnboardingForm } from "@/features/tenants/components/OnboardingForm";
import { useCurrentUser } from "@/features/authentication/hooks/useCurrentUser";
import { AdminAnalyticsDashboard } from "@/features/stats/components/AdminAnalyticsDashboard";
import { ClinicDashboard } from "@/features/stats/components/ClinicDashboard";

export default function DashboardPage() {
  const { isAuthenticated, isLoading, needsOnboarding, user } = useCurrentUser();
  const { signOut } = useAuthActions();

  const view = isLoading
    ? "loading"
    : !isAuthenticated
      ? "signin"
      : needsOnboarding
        ? "onboarding"
        : "dashboard";

  if (view !== "dashboard") {
    return (
      <main className="flex min-h-screen flex-1">
        <AuthHeroPanel />
        <div className="relative flex flex-1 items-center justify-center overflow-hidden bg-background p-6">
          <AnimatePresence mode="wait">
            {view === "loading" && (
              <FadeSlide key="loading" className="relative z-10">
                <motion.div
                  animate={{ opacity: [0.4, 1, 0.4] }}
                  transition={{ duration: 1.4, repeat: Infinity, ease: "easeInOut" }}
                  className="text-primary"
                >
                  <ToothMark size={40} animate={false} />
                </motion.div>
              </FadeSlide>
            )}
            {view === "signin" && (
              <FadeSlide key="signin" className="relative z-10">
                <SignInForm />
              </FadeSlide>
            )}
            {view === "onboarding" && (
              <FadeSlide key="onboarding" className="relative z-10">
                <OnboardingForm />
              </FadeSlide>
            )}
          </AnimatePresence>
        </div>
      </main>
    );
  }

  const isSuperAdmin = user?.role === "super_admin";

  return (
    <AppShell userName={user?.name} userEmail={user?.email} role={user?.role} onSignOut={() => void signOut()}>
      <div className="w-full space-y-6">
        <motion.div
          className="flex items-center justify-between"
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <ToothMark size={22} animate={false} />
            </div>
            <div>
              <h1 className="text-2xl font-semibold">{isSuperAdmin ? "Platform overview" : "Dashboard"}</h1>
              <p className="text-sm text-muted-foreground">
                {isSuperAdmin
                  ? "Usage, accuracy, growth, and revenue across every licensed clinic."
                  : "Your clinic's scan volume, accuracy, and billing."}
              </p>
            </div>
          </div>
        </motion.div>

        {isSuperAdmin ? (
          <AdminAnalyticsDashboard />
        ) : (
          <>
            <ClinicDashboard />
            <FadeSlide>
              <Card className="border-border/60">
                <CardHeader>
                  <CardTitle>Recent cases</CardTitle>
                </CardHeader>
                <CardContent>
                  <CasesTable />
                </CardContent>
              </Card>
            </FadeSlide>
          </>
        )}
      </div>
    </AppShell>
  );
}
