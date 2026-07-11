"use client";

import { Users } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DashboardShell } from "@/components/layout/DashboardShell";
import { FadeSlide } from "@/components/motion/FadeSlide";
import { PatientsTable } from "@/features/patients/components/PatientsTable";

export default function PatientsPage() {
  return (
    <DashboardShell>
      <div className="w-full space-y-6">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <Users className="size-5" />
          </div>
          <div>
            <h1 className="text-2xl font-semibold">Patients</h1>
            <p className="text-sm text-muted-foreground">
              Patients registered across your clinics.
            </p>
          </div>
        </div>
        <FadeSlide>
          <Card className="border-border/60">
            <CardHeader>
              <CardTitle>All patients</CardTitle>
            </CardHeader>
            <CardContent>
              <PatientsTable />
            </CardContent>
          </Card>
        </FadeSlide>
      </div>
    </DashboardShell>
  );
}
