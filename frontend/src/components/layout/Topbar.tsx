"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Database,
  Layers,
  Bell,
  HelpCircle,
  Sun,
  Moon,
  ChevronDown,
  Plus,
  Check,
} from "lucide-react";
import { useDatasets } from "@/hooks/useDatasets";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";

export function Topbar() {
  const { datasets, selectedDataset, setSelectedDataset } = useDatasets();
  const [showDatasetMenu, setShowDatasetMenu] = useState(false);
  const [isDark, setIsDark] = useState(true);

  const toggleTheme = () => {
    setIsDark(!isDark);
    if (typeof document !== "undefined") {
      if (!isDark) {
        document.documentElement.classList.add("dark");
      } else {
        document.documentElement.classList.remove("dark");
      }
    }
  };

  return (
    <header className="h-14 w-full border-b border-border/80 bg-card/80 backdrop-blur-md px-5 flex items-center justify-between z-20 select-none">
      {/* Left: Dataset & Analysis Selectors */}
      <div className="flex items-center gap-3">
        {/* Dataset Selector */}
        <div className="relative">
          <button
            onClick={() => setShowDatasetMenu(!showDatasetMenu)}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-secondary/70 hover:bg-secondary border border-border/60 text-xs font-medium text-foreground transition-colors shadow-2xs"
          >
            <Database className="w-3.5 h-3.5 text-primary" />
            <span className="truncate max-w-[160px]">
              {selectedDataset?.name || "UCI Online Retail (Demo)"}
            </span>
            <ChevronDown className="w-3 h-3 text-muted-foreground ml-0.5" />
          </button>

          {/* Dataset Dropdown */}
          {showDatasetMenu && (
            <div className="absolute left-0 mt-1.5 w-64 rounded-xl border border-border/80 bg-card p-1.5 shadow-lg z-50 animate-in fade-in-50 zoom-in-95">
              <div className="px-2 py-1 text-[10px] font-bold text-muted-foreground uppercase">
                Switch Dataset
              </div>
              <div className="space-y-0.5 max-h-56 overflow-y-auto">
                {datasets.map((d) => (
                  <button
                    key={d.id}
                    onClick={() => {
                      setSelectedDataset(d);
                      setShowDatasetMenu(false);
                    }}
                    className={cn(
                      "w-full flex items-center justify-between px-2.5 py-1.5 rounded-md text-xs text-left transition-colors",
                      selectedDataset?.id === d.id
                        ? "bg-primary/10 text-primary font-semibold"
                        : "text-foreground hover:bg-accent"
                    )}
                  >
                    <div className="truncate">
                      <p className="truncate font-medium">{d.name}</p>
                      <p className="text-[10px] text-muted-foreground">
                        {d.customerCount?.toLocaleString() || d.rowCount?.toLocaleString()} rows
                      </p>
                    </div>
                    {selectedDataset?.id === d.id && (
                      <Check className="w-3.5 h-3.5 text-primary ml-2 flex-shrink-0" />
                    )}
                  </button>
                ))}
              </div>
              <div className="border-t border-border/60 mt-1.5 pt-1.5">
                <Link
                  href="/datasets/new"
                  onClick={() => setShowDatasetMenu(false)}
                  className="flex items-center gap-2 px-2.5 py-1.5 rounded-md text-xs font-semibold text-primary hover:bg-primary/10 transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Upload New Dataset</span>
                </Link>
              </div>
            </div>
          )}
        </div>

        {/* Current Analysis Indicator */}
        <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-muted/40 border border-border/40 text-xs text-muted-foreground">
          <Layers className="w-3.5 h-3.5 text-purple-400" />
          <span className="font-mono text-[11px] text-foreground font-semibold">
            Run #001
          </span>
          <span className="text-[11px] text-muted-foreground">
            (K-Means k=3, Silhouette 0.42)
          </span>
        </div>
      </div>

      {/* Right: Actions, Theme & Help */}
      <div className="flex items-center gap-2">
        <Link href="/datasets/new">
          <Button size="sm" variant="primary" className="text-xs h-8">
            <Plus className="w-3.5 h-3.5 mr-1" />
            <span>New Analysis</span>
          </Button>
        </Link>

        {/* Theme Toggle */}
        <button
          onClick={toggleTheme}
          title={isDark ? "Switch to light mode" : "Switch to dark mode"}
          className="p-2 rounded-lg hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors"
        >
          {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
        </button>

        {/* Notifications */}
        <button
          title="Notifications"
          className="p-2 rounded-lg hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors relative"
        >
          <Bell className="w-4 h-4" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-primary" />
        </button>

        {/* Documentation / Help */}
        <Link
          href="https://github.com"
          target="_blank"
          title="Documentation"
          className="p-2 rounded-lg hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors"
        >
          <HelpCircle className="w-4 h-4" />
        </Link>
      </div>
    </header>
  );
}
