"use client";

import { Receipt } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DashboardShell } from "@/components/layout/DashboardShell";
import { FadeSlide } from "@/components/motion/FadeSlide";
import { QuotationsTable } from "@/features/quotations/components/QuotationsTable";

export default function QuotationsPage() {
  return (
    <DashboardShell>
      <div className="w-full space-y-6">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <Receipt className="size-5" />
          </div>
          <div>
            <h1 className="text-2xl font-semibold">Quotations</h1>
            <p className="text-sm text-muted-foreground">
              Treatment quotations generated from AI-reviewed cases.
            </p>
          </div>
        </div>
        <FadeSlide>
          <Card className="border-border/60">
            <CardHeader>
              <CardTitle>All quotations</CardTitle>
            </CardHeader>
            <CardContent>
              <QuotationsTable />
            </CardContent>
          </Card>
        </FadeSlide>
      </div>
    </DashboardShell>
  );
}
