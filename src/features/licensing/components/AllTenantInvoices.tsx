"use client";

import { useMutation, useQuery } from "convex/react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { EmptyState } from "@/components/ui/empty-state";
import { Receipt } from "lucide-react";
import { api } from "../../../../convex/_generated/api";

const STATUS_VARIANT: Record<"outstanding" | "paid" | "void", "default" | "secondary" | "destructive" | "outline"> = {
  outstanding: "destructive",
  paid: "default",
  void: "outline",
};

export function AllTenantInvoices() {
  const entries = useQuery(api.billing.listAllInvoices);
  const markInvoicePaid = useMutation(api.billing.markInvoicePaid);

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
        icon={Receipt}
        title="No invoices yet"
        description="Invoices appear here once a licensed tenant's scans are billed."
      />
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Tenant</TableHead>
          <TableHead>Billing month</TableHead>
          <TableHead>Scans</TableHead>
          <TableHead>Amount</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {entries.map(({ invoice, tenant }) => (
          <TableRow key={invoice._id} className="border-b">
            <TableCell className="font-medium">{tenant?.name ?? "—"}</TableCell>
            <TableCell className="text-muted-foreground">{invoice.billingMonth}</TableCell>
            <TableCell>{invoice.scanCount}</TableCell>
            <TableCell className="font-medium">
              {invoice.amount.toLocaleString(undefined, { style: "currency", currency: invoice.currency })}
            </TableCell>
            <TableCell>
              <Badge variant={STATUS_VARIANT[invoice.status]}>{invoice.status}</Badge>
            </TableCell>
            <TableCell>
              {invoice.status === "outstanding" && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() =>
                    markInvoicePaid({ invoiceId: invoice._id }).catch((err) =>
                      toast.error(err instanceof Error ? err.message : "Could not mark paid"),
                    )
                  }
                >
                  Mark paid
                </Button>
              )}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
