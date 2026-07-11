"use client";

import { motion } from "framer-motion";

/** An animated "scan" illustration for the empty cases list: an X-ray frame with a sweeping scan line. */
export function EmptyCasesState() {
  return (
    <div className="flex flex-col items-center gap-4 py-10 text-center">
      <svg width="120" height="90" viewBox="0 0 120 90" fill="none" aria-hidden="true">
        <rect
          x="4"
          y="4"
          width="112"
          height="82"
          rx="10"
          className="stroke-border"
          strokeWidth="2"
        />
        <motion.path
          d="M30 60C34 40 40 28 50 28C58 28 60 40 60 48C60 40 64 28 72 28C82 28 88 40 90 60"
          className="stroke-muted-foreground/40"
          strokeWidth="2"
          strokeLinecap="round"
          fill="none"
          initial={{ pathLength: 0, opacity: 0 }}
          animate={{ pathLength: 1, opacity: 1 }}
          transition={{ duration: 1.2, ease: "easeInOut", delay: 0.15 }}
        />
        <motion.rect
          x="4"
          y="4"
          width="4"
          height="82"
          className="fill-primary/70"
          initial={{ x: 4 }}
          animate={{ x: 108 }}
          transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut", repeatType: "reverse" }}
        />
      </svg>
      <div>
        <p className="text-sm font-medium">No cases yet</p>
        <p className="text-sm text-muted-foreground">
          Once the tooth detection model is trained, uploaded X-rays will appear here.
        </p>
      </div>
    </div>
  );
}
