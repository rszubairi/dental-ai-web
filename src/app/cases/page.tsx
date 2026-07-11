"use client";

import { FileText } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DashboardShell } from "@/components/layout/DashboardShell";
import { FadeSlide } from "@/components/motion/FadeSlide";
import { CasesTable } from "@/features/cases/components/CasesTable";

export default function CasesPage() {
  return (
    <DashboardShell>
      <div className="w-full space-y-6">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <FileText className="size-5" />
          </div>
          <div>
            <h1 className="text-2xl font-semibold">Cases</h1>
            <p className="text-sm text-muted-foreground">
              Every diagnostic case across your clinics.
            </p>
          </div>
        </div>
        <FadeSlide>
          <Card className="border-border/60">
            <CardHeader>
              <CardTitle>All cases</CardTitle>
            </CardHeader>
            <CardContent>
              <CasesTable />
            </CardContent>
          </Card>
        </FadeSlide>
      </div>
    </DashboardShell>
  );
}
