"use client";

import { motion } from "framer-motion";
import { Users } from "lucide-react";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { EmptyState } from "@/components/ui/empty-state";
import { usePatients } from "../hooks/usePatients";

export function PatientsTable() {
  const patients = usePatients();

  if (patients === undefined) {
    return (
      <div className="space-y-2">
        {[0, 1, 2].map((i) => (
          <div key={i} className="h-9 animate-pulse rounded-md bg-muted" style={{ animationDelay: `${i * 80}ms` }} />
        ))}
      </div>
    );
  }

  if (patients.length === 0) {
    return (
      <EmptyState
        icon={Users}
        title="No patients yet"
        description="Patients created by your clinic will appear here."
      />
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Name</TableHead>
          <TableHead>Date of birth</TableHead>
          <TableHead>External ref</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {patients.map((p, i) => (
          <motion.tr
            key={p._id}
            className="border-b transition-colors hover:bg-muted/40"
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25, delay: i * 0.04 }}
          >
            <TableCell className="font-medium">{p.name}</TableCell>
            <TableCell className="text-muted-foreground">{p.dateOfBirth ?? "—"}</TableCell>
            <TableCell className="font-mono text-xs text-muted-foreground">{p.externalRef ?? "—"}</TableCell>
          </motion.tr>
        ))}
      </TableBody>
    </Table>
  );
}
