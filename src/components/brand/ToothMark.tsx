"use client";

import { motion } from "framer-motion";

/**
 * Brand mark: a single tooth outline that draws itself in on mount, then
 * holds a very slow idle "scan line" sweep. Stroke path is intentionally
 * simple (one continuous outline) so the draw animation reads cleanly.
 */
export function ToothMark({ size = 32, animate = true }: { size?: number; animate?: boolean }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <motion.path
        d="M24 6C18 6 14 9 11 9C8 9 6 11.5 6 15.5C6 21 8.5 27 10.5 33.5C11.8 37.7 12.8 41.5 15 41.5C17.5 41.5 18 34 19.5 29C20.2 26.7 21.5 25 24 25C26.5 25 27.8 26.7 28.5 29C30 34 30.5 41.5 33 41.5C35.2 41.5 36.2 37.7 37.5 33.5C39.5 27 42 21 42 15.5C42 11.5 40 9 37 9C34 9 30 6 24 6Z"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        initial={animate ? { pathLength: 0, opacity: 0 } : undefined}
        animate={animate ? { pathLength: 1, opacity: 1 } : undefined}
        transition={{ pathLength: { duration: 1.1, ease: "easeInOut" }, opacity: { duration: 0.3 } }}
      />
    </svg>
  );
}
