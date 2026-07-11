"use client";

import { Settings as SettingsIcon } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DashboardShell } from "@/components/layout/DashboardShell";
import { FadeSlide } from "@/components/motion/FadeSlide";
import { TenantSettingsForm } from "@/features/tenants/components/TenantSettingsForm";
import { useCurrentUser } from "@/features/authentication/hooks/useCurrentUser";

export default function SettingsPage() {
  const { user } = useCurrentUser();

  return (
    <DashboardShell>
      <div className="w-full max-w-2xl space-y-6">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <SettingsIcon className="size-5" />
          </div>
          <div>
            <h1 className="text-2xl font-semibold">Settings</h1>
            <p className="text-sm text-muted-foreground">
              Manage your organization and account details.
            </p>
          </div>
        </div>
        <FadeSlide>
          <TenantSettingsForm />
        </FadeSlide>
        <FadeSlide>
          <Card className="border-border/60">
            <CardHeader>
              <CardTitle>Your account</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Name</span>
                <span className="font-medium">{user?.name ?? "—"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Email</span>
                <span className="font-medium">{user?.email ?? "—"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Role</span>
                <span className="font-medium capitalize">{user?.role?.replaceAll("_", " ") ?? "—"}</span>
              </div>
            </CardContent>
          </Card>
        </FadeSlide>
      </div>
    </DashboardShell>
  );
}
