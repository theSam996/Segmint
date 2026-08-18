"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  PieChart,
  Lightbulb,
  BarChart3,
  GitCompare,
  Database,
  UploadCloud,
  Settings,
  Sparkles,
  ChevronRight,
  LogOut,
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { cn } from "@/lib/utils";

interface NavItem {
  label: string;
  href: string;
  icon: React.ElementType;
  badge?: string;
}

interface NavSection {
  title: string;
  items: NavItem[];
}

const NAV_SECTIONS: NavSection[] = [
  {
    title: "OVERVIEW",
    items: [
      { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    ],
  },
  {
    title: "CUSTOMER INTELLIGENCE",
    items: [
      { label: "Customers", href: "/customers", icon: Users },
      { label: "Segments", href: "/segments", icon: PieChart },
      { label: "Recommendations", href: "/recommendations", icon: Lightbulb, badge: "Action" },
    ],
  },
  {
    title: "ANALYSIS",
    items: [
      { label: "Analytics", href: "/analytics", icon: BarChart3 },
      { label: "Models", href: "/models", icon: GitCompare },
    ],
  },
  {
    title: "DATA",
    items: [
      { label: "Datasets", href: "/datasets", icon: Database },
      { label: "Upload Dataset", href: "/datasets/new", icon: UploadCloud },
    ],
  },
  {
    title: "WORKSPACE",
    items: [
      { label: "Settings", href: "/settings", icon: Settings },
    ],
  },
];

export function Sidebar({ className }: { className?: string }) {
  const pathname = usePathname();
  const { user, workspace, logout } = useAuth();

  return (
    <aside
      className={cn(
        "w-64 flex-shrink-0 flex flex-col justify-between h-screen bg-card/95 backdrop-blur-md border-r border-border/80 text-card-foreground select-none z-30",
        className
      )}
    >
      {/* Brand Header */}
      <div>
        <div className="h-14 px-5 flex items-center justify-between border-b border-border/60">
          <Link href="/dashboard" className="flex items-center gap-2.5 group">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-primary to-purple-400 flex items-center justify-center text-primary-foreground font-black text-sm shadow-sm group-hover:scale-105 transition-transform">
              S
            </div>
            <div>
              <span className="font-bold text-sm tracking-tight text-foreground flex items-center gap-1">
                SegmentIQ
                <span className="text-[10px] uppercase font-mono px-1.5 py-0.2 bg-primary/10 text-primary rounded border border-primary/20">
                  v1.0
                </span>
              </span>
              <p className="text-[11px] text-muted-foreground truncate max-w-[140px]">
                {workspace?.name || "Customer Intelligence"}
              </p>
            </div>
          </Link>
        </div>

        {/* Navigation Items */}
        <nav className="p-3 space-y-5 overflow-y-auto max-h-[calc(100vh-140px)]">
          {NAV_SECTIONS.map((section) => (
            <div key={section.title} className="space-y-1">
              <h4 className="px-3 text-[10px] font-bold tracking-wider text-muted-foreground uppercase">
                {section.title}
              </h4>
              <div className="space-y-0.5 pt-1">
                {section.items.map((item) => {
                  const Icon = item.icon;
                  const isActive =
                    item.href === "/dashboard"
                      ? pathname === "/dashboard"
                      : pathname.startsWith(item.href);

                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={cn(
                        "flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-all group",
                        isActive
                          ? "bg-primary/10 text-primary font-semibold border border-primary/20 shadow-xs"
                          : "text-muted-foreground hover:text-foreground hover:bg-accent/60"
                      )}
                    >
                      <div className="flex items-center gap-2.5">
                        <Icon
                          className={cn(
                            "w-4 h-4 transition-colors",
                            isActive ? "text-primary" : "text-muted-foreground group-hover:text-foreground"
                          )}
                        />
                        <span>{item.label}</span>
                      </div>
                      {item.badge && (
                        <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-primary/15 text-primary font-bold border border-primary/30 uppercase">
                          {item.badge}
                        </span>
                      )}
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>
      </div>

      {/* User Footer Profile */}
      <div className="p-3 border-t border-border/60 bg-muted/20">
        <div className="flex items-center justify-between p-2 rounded-lg hover:bg-accent/50 transition-colors">
          <Link href="/settings" className="flex items-center gap-2.5 overflow-hidden flex-1 group">
            <div className="w-8 h-8 rounded-full bg-primary/20 border border-primary/40 flex items-center justify-center text-xs font-bold text-primary flex-shrink-0 group-hover:border-primary">
              {user?.fullName?.charAt(0) || "U"}
            </div>
            <div className="truncate text-left">
              <p className="text-xs font-semibold text-foreground truncate group-hover:text-primary transition-colors">
                {user?.fullName || "User"}
              </p>
              <p className="text-[10px] text-muted-foreground truncate">
                {user?.email || "user@company.com"}
              </p>
            </div>
          </Link>
          <button
            onClick={logout}
            title="Log out"
            className="p-1.5 rounded-md hover:bg-muted text-muted-foreground hover:text-foreground transition-colors ml-1"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </aside>
  );
}
