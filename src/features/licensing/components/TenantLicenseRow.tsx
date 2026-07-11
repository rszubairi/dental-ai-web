"use client";

import { useState } from "react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { TableCell, TableRow } from "@/components/ui/table";
import type { Doc } from "../../../../convex/_generated/dataModel";
import { useUpsertTenantLicense } from "../hooks/useTenantLicenses";

export function TenantLicenseRow({
  tenant,
  license,
}: {
  tenant: Doc<"tenants">;
  license: Doc<"tenantLicenses"> | null;
}) {
  const upsertTenantLicense = useUpsertTenantLicense();
  const [scanPrice, setScanPrice] = useState(String(license?.scanPrice ?? ""));
  const [currency, setCurrency] = useState(license?.currency ?? tenant.settings.currency);
  const [saving, setSaving] = useState(false);

  const status = license?.status ?? "suspended";

  const onSave = async (nextStatus: "active" | "suspended") => {
    const price = Number(scanPrice);
    if (!Number.isFinite(price) || price < 0) {
      toast.error("Enter a valid non-negative scan price");
      return;
    }
    setSaving(true);
    try {
      await upsertTenantLicense({
        tenantId: tenant._id,
        scanPrice: price,
        currency,
        status: nextStatus,
      });
      toast.success(`License saved for ${tenant.name}`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not save license");
    } finally {
      setSaving(false);
    }
  };

  return (
    <TableRow className="border-b">
      <TableCell className="font-medium">{tenant.name}</TableCell>
      <TableCell>
        <Badge variant={status === "active" ? "default" : "outline"}>{status}</Badge>
      </TableCell>
      <TableCell>
        <Input
          value={scanPrice}
          onChange={(e) => setScanPrice(e.target.value)}
          className="w-24"
          inputMode="decimal"
        />
      </TableCell>
      <TableCell>
        <Input
          value={currency}
          onChange={(e) => setCurrency(e.target.value.toUpperCase())}
          className="w-20"
          maxLength={3}
        />
      </TableCell>
      <TableCell className="space-x-2">
        <Button size="sm" disabled={saving} onClick={() => onSave("active")}>
          Save & activate
        </Button>
        {status === "active" && (
          <Button size="sm" variant="outline" disabled={saving} onClick={() => onSave("suspended")}>
            Suspend
          </Button>
        )}
      </TableCell>
    </TableRow>
  );
}
