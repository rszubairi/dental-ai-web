"use client";

import { motion } from "framer-motion";
import { Receipt } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { EmptyState } from "@/components/ui/empty-state";
import { useInvoices } from "../hooks/useBilling";

const STATUS_VARIANT: Record<"outstanding" | "paid" | "void", "default" | "secondary" | "destructive" | "outline"> = {
  outstanding: "destructive",
  paid: "default",
  void: "outline",
};

function formatMonth(billingMonth: string) {
  const [year, month] = billingMonth.split("-").map(Number);
  return new Date(year, month - 1, 1).toLocaleDateString(undefined, { month: "long", year: "numeric" });
}

export function InvoicesTable() {
  const invoices = useInvoices();

  if (invoices === undefined) {
    return (
      <div className="space-y-2">
        {[0, 1, 2].map((i) => (
          <div key={i} className="h-9 animate-pulse rounded-md bg-muted" style={{ animationDelay: `${i * 80}ms` }} />
        ))}
      </div>
    );
  }

  if (invoices.length === 0) {
    return (
      <EmptyState
        icon={Receipt}
        title="No invoices yet"
        description="Once your license is active, monthly invoices for processed scans will appear here."
      />
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Billing month</TableHead>
          <TableHead>Scans</TableHead>
          <TableHead>Amount</TableHead>
          <TableHead>Status</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {invoices.map((inv, i) => (
          <motion.tr
            key={inv._id}
            className="border-b transition-colors hover:bg-muted/40"
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25, delay: i * 0.04 }}
          >
            <TableCell className="font-medium">{formatMonth(inv.billingMonth)}</TableCell>
            <TableCell>{inv.scanCount}</TableCell>
            <TableCell className="font-medium">
              {inv.amount.toLocaleString(undefined, { style: "currency", currency: inv.currency })}
            </TableCell>
            <TableCell>
              <Badge variant={STATUS_VARIANT[inv.status]}>{inv.status}</Badge>
            </TableCell>
          </motion.tr>
        ))}
      </TableBody>
    </Table>
  );
}
