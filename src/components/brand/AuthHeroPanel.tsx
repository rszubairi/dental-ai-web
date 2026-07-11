import { Fragment } from "react";
import { Activity, ScanLine, ShieldCheck } from "lucide-react";
import { ToothMark } from "./ToothMark";

const FEATURES = [
  { icon: ScanLine, label: "AI-Assisted X-Ray Analysis" },
  { icon: ShieldCheck, label: "Multi-Tenant, Role-Based Access" },
  { icon: Activity, label: "Real-Time Case Tracking" },
];

const STATS = [
  { value: "6+", label: "Clinics Onboarded" },
  { value: "99.9%", label: "Platform Uptime" },
  { value: "24/7", label: "AI Availability" },
];

export function AuthHeroPanel() {
  return (
    <div className="relative hidden overflow-hidden bg-sidebar lg:flex lg:w-[55%]">
      <div className="absolute inset-0 bg-gradient-to-br from-sidebar via-sidebar to-primary/30" />
      <svg className="absolute inset-0 h-full w-full opacity-[0.05]" aria-hidden="true">
        <pattern id="hero-grid" width="32" height="32" patternUnits="userSpaceOnUse">
          <path d="M 32 0 L 0 0 0 32" fill="none" stroke="white" strokeWidth="1" />
        </pattern>
        <rect width="100%" height="100%" fill="url(#hero-grid)" />
      </svg>

      <div className="absolute top-20 right-20 h-72 w-72 rounded-full bg-sidebar-primary/10 blur-3xl" />
      <div className="absolute bottom-32 left-16 h-56 w-56 rounded-full bg-primary/20 blur-3xl" />

      <div className="relative z-10 flex w-full flex-col justify-between p-12">
        <div>
          <div className="flex items-center gap-3 text-white">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-sidebar-primary/15 text-sidebar-primary">
              <ToothMark size={24} animate={false} />
            </div>
            <span className="text-lg font-bold tracking-tight">Dental AI</span>
          </div>
          <div className="mt-5 h-px w-16 bg-gradient-to-r from-sidebar-primary to-transparent" />
        </div>

        <div className="max-w-lg">
          <h1 className="mb-6 font-heading text-4xl leading-tight font-bold text-white lg:text-5xl">
            AI-Powered Dental
            <span className="text-sidebar-primary"> Diagnostics</span>
            <br />
            &amp; Treatment Planning
          </h1>
          <p className="max-w-md text-base leading-relaxed text-white/50">
            Upload X-rays, get instant AI-assisted findings, and generate accurate treatment
            quotations — all in one workspace built for multi-clinic dental groups.
          </p>

          <div className="mt-8 flex flex-wrap gap-3">
            {FEATURES.map((feature) => (
              <div
                key={feature.label}
                className="flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2"
              >
                <feature.icon className="size-4 text-sidebar-primary" />
                <span className="text-xs font-bold text-white/70">{feature.label}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-8">
          {STATS.map((stat, i) => (
            <Fragment key={stat.label}>
              {i > 0 && <div className="h-8 w-px bg-white/10" />}
              <div>
                <p className="font-heading text-2xl font-black text-white">{stat.value}</p>
                <p className="text-[10px] font-bold tracking-widest text-white/40 uppercase">{stat.label}</p>
              </div>
            </Fragment>
          ))}
        </div>
      </div>
    </div>
  );
}
