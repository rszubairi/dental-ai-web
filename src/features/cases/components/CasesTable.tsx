"use client";

import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useCases } from "../hooks/useCases";
import type { CaseStatus } from "../types";
import { EmptyCasesState } from "./EmptyCasesState";

const STATUS_VARIANT: Record<CaseStatus, "default" | "secondary" | "destructive" | "outline"> = {
  uploaded: "outline",
  queued: "secondary",
  processing: "secondary",
  review_pending: "default",
  approved: "default",
  rejected: "destructive",
};

export function CasesTable() {
  const cases = useCases();

  if (cases === undefined) {
    return (
      <div className="space-y-2">
        {[0, 1, 2].map((i) => (
          <div key={i} className="h-9 animate-pulse rounded-md bg-muted" style={{ animationDelay: `${i * 80}ms` }} />
        ))}
      </div>
    );
  }

  if (cases.length === 0) {
    return <EmptyCasesState />;
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Case ID</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Version</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {cases.map((c, i) => (
          <motion.tr
            key={c._id}
            className="border-b transition-colors hover:bg-muted/40"
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25, delay: i * 0.04 }}
          >
            <TableCell className="font-mono text-xs">{c._id}</TableCell>
            <TableCell>
              <Badge variant={STATUS_VARIANT[c.status]}>{c.status}</Badge>
            </TableCell>
            <TableCell>{c.version}</TableCell>
          </motion.tr>
        ))}
      </TableBody>
    </Table>
  );
}
