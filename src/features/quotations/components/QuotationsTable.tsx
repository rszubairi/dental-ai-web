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
import { useQuotations } from "../hooks/useQuotations";

type QuotationStatus = "draft" | "sent" | "accepted" | "rejected";

const STATUS_VARIANT: Record<QuotationStatus, "default" | "secondary" | "destructive" | "outline"> = {
  draft: "outline",
  sent: "secondary",
  accepted: "default",
  rejected: "destructive",
};

export function QuotationsTable() {
  const quotations = useQuotations();

  if (quotations === undefined) {
    return (
      <div className="space-y-2">
        {[0, 1, 2].map((i) => (
          <div key={i} className="h-9 animate-pulse rounded-md bg-muted" style={{ animationDelay: `${i * 80}ms` }} />
        ))}
      </div>
    );
  }

  if (quotations.length === 0) {
    return (
      <EmptyState
        icon={Receipt}
        title="No quotations yet"
        description="Treatment quotations generated from cases will appear here."
      />
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Quotation ID</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Line items</TableHead>
          <TableHead>Total</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {quotations.map((q, i) => (
          <motion.tr
            key={q._id}
            className="border-b transition-colors hover:bg-muted/40"
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25, delay: i * 0.04 }}
          >
            <TableCell className="font-mono text-xs">{q._id}</TableCell>
            <TableCell>
              <Badge variant={STATUS_VARIANT[q.status]}>{q.status}</Badge>
            </TableCell>
            <TableCell>{q.lineItems.length}</TableCell>
            <TableCell className="font-medium">
              {q.total.toLocaleString(undefined, { style: "currency", currency: q.currency })}
            </TableCell>
          </motion.tr>
        ))}
      </TableBody>
    </Table>
  );
}
