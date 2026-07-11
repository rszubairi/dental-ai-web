"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Bell,
  ChevronsLeft,
  ChevronsRight,
  CreditCard,
  FileText,
  LayoutGrid,
  Menu,
  Receipt,
  Settings,
  ShieldCheck,
  Users,
} from "lucide-react";

import { cn } from "@/lib/utils";
import { ToothMark } from "@/components/brand/ToothMark";

const NAV_ITEMS = [
  { name: "Dashboard", href: "/", icon: LayoutGrid },
  { name: "Cases", href: "/cases", icon: FileText },
  { name: "Patients", href: "/patients", icon: Users },
  { name: "Quotations", href: "/quotations", icon: Receipt },
  { name: "Billing", href: "/billing", icon: CreditCard },
  { name: "Settings", href: "/settings", icon: Settings },
];

const ADMIN_NAV_ITEMS = [{ name: "Licensing", href: "/admin/licensing", icon: ShieldCheck }];

export function AppShell({
  children,
  userName,
  userEmail,
  role,
  onSignOut,
}: {
  children: React.ReactNode;
  userName?: string | null;
  userEmail?: string | null;
  role?: string | null;
  onSignOut: () => void;
}) {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname();
  const navItems = role === "super_admin" ? [...NAV_ITEMS, ...ADMIN_NAV_ITEMS] : NAV_ITEMS;

  const initials = (userName ?? userEmail ?? "?")
    .split(/[\s@.]+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((s) => s[0]?.toUpperCase())
    .join("");

  return (
    <div className="flex min-h-screen bg-background">
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm md:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex w-72 flex-col border-r border-sidebar-border bg-sidebar text-sidebar-foreground shadow-2xl transition-all duration-300 ease-in-out",
          mobileOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0",
          collapsed && "md:w-20",
        )}
      >
        <div className={cn("border-b border-sidebar-border transition-all duration-300", collapsed ? "p-3" : "p-6")}>
          <div className={cn("flex items-center", collapsed ? "justify-center" : "gap-3")}>
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-sidebar-primary/15 text-sidebar-primary">
              <ToothMark size={20} animate={false} />
            </div>
            {!collapsed && <span className="text-sm font-bold tracking-tight">Dental AI</span>}
          </div>
          {!collapsed && (
            <div className="mt-3 flex items-center gap-2">
              <span className="inline-flex items-center rounded-md border border-sidebar-primary/30 bg-sidebar-primary/15 px-2 py-0.5">
                <span className="mr-1.5 h-1.5 w-1.5 animate-pulse rounded-full bg-sidebar-primary" />
                <span className="text-[9px] font-bold uppercase tracking-widest text-sidebar-primary">
                  AI Engine Online
                </span>
              </span>
            </div>
          )}
        </div>

        <nav className={cn("flex-1 space-y-1 overflow-y-auto py-6 transition-all duration-300", collapsed ? "px-2" : "px-3")}>
          {navItems.map((item) => {
            const active = item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
            return (
              <Link
                key={item.name}
                href={item.href}
                title={collapsed ? item.name : undefined}
                onClick={() => setMobileOpen(false)}
                className={cn(
                  "group flex w-full items-center rounded-xl text-sm font-semibold transition-all duration-200 hover:bg-sidebar-accent",
                  collapsed ? "justify-center px-2 py-3" : "px-4 py-3",
                  active && "bg-sidebar-accent",
                )}
              >
                <item.icon
                  className={cn(
                    "size-5 text-sidebar-foreground/60 transition-all group-hover:scale-110 group-hover:text-sidebar-primary",
                    !collapsed && "mr-3",
                    active && "text-sidebar-primary",
                  )}
                />
                {!collapsed && (
                  <span className="text-sidebar-foreground/80 group-hover:text-sidebar-foreground">{item.name}</span>
                )}
              </Link>
            );
          })}
        </nav>

        <div className="hidden justify-center px-3 pb-2 md:flex">
          <button
            type="button"
            onClick={() => setCollapsed(!collapsed)}
            className="flex w-full items-center justify-center rounded-xl p-2 text-sidebar-foreground/40 transition-all hover:bg-sidebar-accent hover:text-sidebar-primary"
          >
            {collapsed ? <ChevronsRight className="size-4" /> : <ChevronsLeft className="size-4" />}
            {!collapsed && <span className="ml-2 text-xs font-bold">Collapse</span>}
          </button>
        </div>

        <div className={cn("border-t border-sidebar-border bg-black/20 transition-all duration-300", collapsed ? "p-2" : "p-4")}>
          <div className={cn("mb-3 flex items-center", collapsed ? "justify-center p-1" : "gap-3 p-2")}>
            <div
              className={cn(
                "flex shrink-0 items-center justify-center rounded-full border-2 border-sidebar-primary/30 bg-sidebar-primary font-bold text-sidebar-primary-foreground shadow-sm transition-all duration-300",
                collapsed ? "size-9 text-xs" : "size-10 text-sm",
              )}
            >
              {initials || "?"}
            </div>
            {!collapsed && (
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-bold">{userName ?? userEmail}</p>
                <p className="text-[10px] font-bold uppercase tracking-wider text-sidebar-primary">Clinician</p>
              </div>
            )}
          </div>
          {!collapsed && (
            <button
              type="button"
              onClick={onSignOut}
              className="block w-full rounded-lg border border-white/5 bg-white/5 py-2 text-center text-xs font-bold transition-colors hover:border-white/10 hover:bg-white/10"
            >
              Sign out
            </button>
          )}
        </div>
      </aside>

      <div className={cn("flex flex-1 flex-col transition-all duration-300", collapsed ? "md:pl-20" : "md:pl-72")}>
        <header className="sticky top-0 z-30 w-full border-b border-border bg-background/70 backdrop-blur-xl">
          <div className="flex h-16 items-center justify-between px-6">
            <div className="flex items-center">
              <button
                onClick={() => setMobileOpen(true)}
                className="-ml-2 mr-4 p-2 text-muted-foreground transition-colors hover:text-primary md:hidden"
              >
                <Menu className="size-6" />
              </button>
              <button
                onClick={() => setCollapsed(!collapsed)}
                className="-ml-2 mr-4 hidden p-2 text-muted-foreground transition-colors hover:text-primary md:flex"
              >
                <Menu className="size-5" />
              </button>
              <h2 className="hidden text-lg font-bold text-foreground md:block">
                <span className="mr-2 font-black text-accent-foreground">{"//"}</span>
                Dental AI
              </h2>
            </div>

            <div className="flex items-center gap-6">
              <div className="hidden items-center gap-2 rounded-full border border-accent-foreground/20 bg-accent px-4 py-1.5 lg:flex">
                <span className="h-2 w-2 animate-pulse rounded-full bg-accent-foreground" />
                <span className="text-[10px] font-bold uppercase tracking-widest text-accent-foreground">
                  Diagnostics Ready
                </span>
              </div>
              <button className="relative p-2 text-muted-foreground transition-colors hover:text-primary">
                <Bell className="size-5" />
              </button>
              <div className="h-8 w-px bg-border" />
              <div className="hidden text-right sm:block">
                <p className="text-xs font-black leading-none text-foreground">{userName ?? userEmail}</p>
                <p className="mt-1 text-[10px] font-bold text-muted-foreground">Signed in</p>
              </div>
            </div>
          </div>
        </header>

        <main className="flex-1 p-8">
          <div className="mx-auto min-h-screen max-w-7xl">{children}</div>
        </main>
      </div>
    </div>
  );
}
