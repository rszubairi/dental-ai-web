"use client";

import { Receipt } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DashboardShell } from "@/components/layout/DashboardShell";
import { FadeSlide } from "@/components/motion/FadeSlide";
import { OutstandingBalanceCard } from "@/features/billing/components/OutstandingBalanceCard";
import { InvoicesTable } from "@/features/billing/components/InvoicesTable";
import { ScanHistoryTable } from "@/features/billing/components/ScanHistoryTable";

export default function BillingPage() {
  return (
    <DashboardShell>
      <div className="w-full space-y-6">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <Receipt className="size-5" />
          </div>
          <div>
            <h1 className="text-2xl font-semibold">Billing</h1>
            <p className="text-sm text-muted-foreground">
              Usage license, monthly invoices, and per-scan charge history.
            </p>
          </div>
        </div>

        <FadeSlide>
          <OutstandingBalanceCard />
        </FadeSlide>

        <FadeSlide>
          <Card className="border-border/60">
            <CardHeader>
              <CardTitle>Invoices by month</CardTitle>
            </CardHeader>
            <CardContent>
              <InvoicesTable />
            </CardContent>
          </Card>
        </FadeSlide>

        <FadeSlide>
          <Card className="border-border/60">
            <CardHeader>
              <CardTitle>Scan history</CardTitle>
            </CardHeader>
            <CardContent>
              <ScanHistoryTable />
            </CardContent>
          </Card>
        </FadeSlide>
      </div>
    </DashboardShell>
  );
}
