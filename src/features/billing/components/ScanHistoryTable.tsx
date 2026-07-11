"use client";

import { motion } from "framer-motion";
import { ScanLine } from "lucide-react";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { EmptyState } from "@/components/ui/empty-state";
import { useScanHistory } from "../hooks/useBilling";

export function ScanHistoryTable() {
  const scans = useScanHistory();

  if (scans === undefined) {
    return (
      <div className="space-y-2">
        {[0, 1, 2].map((i) => (
          <div key={i} className="h-9 animate-pulse rounded-md bg-muted" style={{ animationDelay: `${i * 80}ms` }} />
        ))}
      </div>
    );
  }

  if (scans.length === 0) {
    return (
      <EmptyState
        icon={ScanLine}
        title="No scans billed yet"
        description="Every AI scan processed under your license is logged here."
      />
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Scan (AI job)</TableHead>
          <TableHead>Billing month</TableHead>
          <TableHead>Charge</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {scans.map((charge, i) => (
          <motion.tr
            key={charge._id}
            className="border-b transition-colors hover:bg-muted/40"
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2, delay: Math.min(i * 0.03, 0.6) }}
          >
            <TableCell className="font-mono text-xs">{charge.aiJobId}</TableCell>
            <TableCell className="text-muted-foreground">{charge.billingMonth}</TableCell>
            <TableCell className="font-medium">
              {charge.unitPrice.toLocaleString(undefined, { style: "currency", currency: charge.currency })}
            </TableCell>
          </motion.tr>
        ))}
      </TableBody>
    </Table>
  );
}
