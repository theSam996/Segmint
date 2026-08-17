"use client";

import { useState } from "react";
import Link from "next/link";
import {
  PieChart,
  Search,
  ArrowRight,
  TrendingUp,
  Calendar,
  ShoppingBag,
  DollarSign,
  Compass,
  Lightbulb,
  CheckCircle2,
} from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Badge } from "@/components/ui/Badge";
import { Card, CardContent } from "@/components/ui/Card";
import { useSegments } from "@/hooks/useSegments";
import { formatCurrency, formatDays, formatNumber, formatPercent } from "@/lib/utils";

export default function SegmentsPage() {
  const { segments, isLoading } = useSegments();
  const [search, setSearch] = useState("");

  const filtered = segments.filter(
    (s) =>
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      s.description.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <AppShell>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-border/40">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight text-foreground">
              Customer Segments
            </h1>
            <span className="px-2 py-0.5 rounded-full bg-primary/10 text-primary text-[11px] font-bold border border-primary/20">
              {segments.length} Personas Discovered
            </span>
          </div>
          <p className="text-xs text-muted-foreground mt-0.5">
            Behavioral cohorts mapped from unsupervised K-Means centroids and RFM dimensions.
          </p>
        </div>

        <Link href="/recommendations">
          <Button size="sm" variant="primary" className="text-xs h-8 shadow-sm">
            <Lightbulb className="w-3.5 h-3.5 mr-1.5" />
            Action Center
          </Button>
        </Link>
      </div>

      {/* Search Filter */}
      <div className="max-w-xs">
        <Input
          placeholder="Filter segments by name..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          icon={<Search className="w-4 h-4" />}
        />
      </div>

      {/* Segment Cards Gallery */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {filtered.map((seg) => (
          <Card
            key={seg.id}
            className="hover:border-primary/50 transition-all flex flex-col justify-between p-6 bg-card/90"
          >
            <div className="space-y-5">
              {/* Header */}
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-3xl p-2 rounded-xl bg-muted/40 border border-border/60">
                    {seg.icon}
                  </span>
                  <div>
                    <h3 className="text-base font-bold text-foreground">{seg.name}</h3>
                    <span className="text-[11px] text-muted-foreground font-mono">
                      Cluster #{seg.clusterId}
                    </span>
                  </div>
                </div>
                <Badge
                  variant={
                    seg.priority === "critical"
                      ? "danger"
                      : seg.priority === "high"
                      ? "warning"
                      : "secondary"
                  }
                  className="text-[10px] uppercase"
                >
                  {seg.priority} Priority
                </Badge>
              </div>

              <p className="text-xs text-muted-foreground leading-relaxed">
                {seg.description}
              </p>

              {/* Volume & Revenue Stats */}
              <div className="grid grid-cols-2 gap-3 p-3 rounded-xl bg-muted/20 border border-border/40 text-center">
                <div>
                  <span className="text-[10px] uppercase font-bold text-muted-foreground block">Customers</span>
                  <span className="text-base font-extrabold text-foreground">
                    {formatNumber(seg.customerCount)}
                  </span>
                  <span className="text-[10px] text-muted-foreground block">
                    ({formatPercent(seg.pctOfBase)} of base)
                  </span>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-muted-foreground block">Revenue Share</span>
                  <span className="text-base font-extrabold text-emerald-400">
                    {formatPercent(seg.pctOfRevenue)}
                  </span>
                  <span className="text-[10px] text-muted-foreground block">
                    {formatCurrency(seg.totalRevenue)}
                  </span>
                </div>
              </div>

              {/* RFM Averages */}
              <div className="space-y-2 text-xs">
                <span className="font-semibold text-muted-foreground uppercase text-[10px]">
                  Cohort RFM Averages:
                </span>
                <div className="grid grid-cols-3 gap-2 text-center text-xs">
                  <div className="p-2 rounded-lg bg-muted/30">
                    <span className="text-[10px] text-muted-foreground block">Recency</span>
                    <span className="font-bold text-foreground">{formatDays(seg.avgRecency)}</span>
                  </div>
                  <div className="p-2 rounded-lg bg-muted/30">
                    <span className="text-[10px] text-muted-foreground block">Orders</span>
                    <span className="font-bold text-foreground">{seg.avgFrequency.toFixed(1)}</span>
                  </div>
                  <div className="p-2 rounded-lg bg-muted/30">
                    <span className="text-[10px] text-muted-foreground block">Avg Spend</span>
                    <span className="font-bold text-emerald-400">{formatCurrency(seg.avgMonetary)}</span>
                  </div>
                </div>
              </div>

              {/* Recommended Action Preview */}
              <div className="p-3 rounded-xl bg-primary/10 border border-primary/20 text-xs space-y-1">
                <span className="font-bold text-primary flex items-center gap-1.5 text-[11px]">
                  <Lightbulb className="w-3.5 h-3.5" /> Recommended Action
                </span>
                <p className="text-[11px] text-muted-foreground leading-relaxed line-clamp-2">
                  {seg.recommendedAction}
                </p>
              </div>
            </div>

            {/* Footer Link */}
            <div className="pt-6 border-t border-border/40 mt-4">
              <Link href={`/segments/${seg.id}`}>
                <Button variant="outline" size="sm" className="w-full text-xs font-semibold h-9">
                  Explore Full Strategy Playbook <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
                </Button>
              </Link>
            </div>
          </Card>
        ))}
      </div>
    </AppShell>
  );
}
