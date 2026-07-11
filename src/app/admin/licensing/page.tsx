"use client";

import { ShieldCheck } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DashboardShell } from "@/components/layout/DashboardShell";
import { FadeSlide } from "@/components/motion/FadeSlide";
import { useCurrentUser } from "@/features/authentication/hooks/useCurrentUser";
import { TenantLicensesTable } from "@/features/licensing/components/TenantLicensesTable";
import { AllTenantInvoices } from "@/features/licensing/components/AllTenantInvoices";

export default function LicensingAdminPage() {
  const { user } = useCurrentUser();

  return (
    <DashboardShell>
      <div className="w-full space-y-6">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <ShieldCheck className="size-5" />
          </div>
          <div>
            <h1 className="text-2xl font-semibold">Licensing</h1>
            <p className="text-sm text-muted-foreground">
              Configure per-scan pricing for each clinic and manage cross-tenant billing.
            </p>
          </div>
        </div>

        {user && user.role !== "super_admin" ? (
          <Card className="border-border/60">
            <CardContent className="py-10 text-center text-sm text-muted-foreground">
              This area is restricted to system administrators.
            </CardContent>
          </Card>
        ) : (
          <>
            <FadeSlide>
              <Card className="border-border/60">
                <CardHeader>
                  <CardTitle>Tenant licenses</CardTitle>
                </CardHeader>
                <CardContent>
                  <TenantLicensesTable />
                </CardContent>
              </Card>
            </FadeSlide>

            <FadeSlide>
              <Card className="border-border/60">
                <CardHeader>
                  <CardTitle>All invoices</CardTitle>
                </CardHeader>
                <CardContent>
                  <AllTenantInvoices />
                </CardContent>
              </Card>
            </FadeSlide>
          </>
        )}
      </div>
    </DashboardShell>
  );
}
