"use client";

import { ShieldCheck } from "lucide-react";

import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { EmptyState } from "@/components/ui/empty-state";
import { useTenantLicenses } from "../hooks/useTenantLicenses";
import { TenantLicenseRow } from "./TenantLicenseRow";

export function TenantLicensesTable() {
  const entries = useTenantLicenses();

  if (entries === undefined) {
    return (
      <div className="space-y-2">
        {[0, 1, 2].map((i) => (
          <div key={i} className="h-9 animate-pulse rounded-md bg-muted" style={{ animationDelay: `${i * 80}ms` }} />
        ))}
      </div>
    );
  }

  if (entries.length === 0) {
    return (
      <EmptyState
        icon={ShieldCheck}
        title="No tenants yet"
        description="Once clinics onboard, their licensing terms are configured here."
      />
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Tenant</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Per-scan price</TableHead>
          <TableHead>Currency</TableHead>
          <TableHead>Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {entries.map(({ tenant, license }) => (
          <TenantLicenseRow key={tenant._id} tenant={tenant} license={license} />
        ))}
      </TableBody>
    </Table>
  );
}
