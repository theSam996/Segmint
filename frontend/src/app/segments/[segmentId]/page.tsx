"use client";

import { useParams } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Users,
  Calendar,
  ShoppingBag,
  DollarSign,
  TrendingUp,
  Lightbulb,
  CheckCircle2,
  Download,
  Share2,
  Compass,
} from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/Card";
import { useSegment } from "@/hooks/useSegments";
import { useCustomers } from "@/hooks/useCustomers";
import { formatCurrency, formatDays, formatNumber, formatPercent } from "@/lib/utils";

export default function SegmentDetailPage() {
  const params = useParams();
  const segmentId = (params?.segmentId as string) || "loyal-high-spenders";
  const { segment, isLoading } = useSegment(segmentId);
  const { customers } = useCustomers({ segmentId, pageSize: 8 });

  if (isLoading || !segment) {
    return (
      <AppShell>
        <div className="text-center py-24 text-xs text-muted-foreground">
          Loading segment intelligence profile...
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell>
      {/* Back Link & Header */}
      <div className="space-y-4">
        <Link
          href="/segments"
          className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors font-medium"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Back to Segments
        </Link>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-border/40">
          <div className="flex items-center gap-3.5">
            <span className="text-3xl p-2.5 rounded-2xl bg-muted/40 border border-border/60">
              {segment.icon}
            </span>
            <div>
              <div className="flex items-center gap-2.5">
                <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight text-foreground">
                  {segment.name}
                </h1>
                <Badge
                  variant={
                    segment.priority === "critical"
                      ? "danger"
                      : segment.priority === "high"
                      ? "warning"
                      : "secondary"
                  }
                >
                  {segment.priority} Priority
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground mt-0.5">
                <strong className="text-foreground">{formatNumber(segment.customerCount)}</strong> customers •{" "}
                <strong className="text-foreground">{formatPercent(segment.pctOfBase)}</strong> of total base •{" "}
                Generates <strong className="text-emerald-400">{formatCurrency(segment.totalRevenue)}</strong> ({formatPercent(segment.pctOfRevenue)} revenue)
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Link href="/recommendations">
              <Button size="sm" variant="outline" className="text-xs h-8">
                <Lightbulb className="w-3.5 h-3.5 mr-1.5" />
                View Recommendations
              </Button>
            </Link>
            <Link href={`/customers?segment=${segment.id}`}>
              <Button size="sm" variant="primary" className="text-xs h-8 shadow-sm">
                <Users className="w-3.5 h-3.5 mr-1.5" />
                Filter {formatNumber(segment.customerCount)} Customers
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* RFM Profile Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-muted-foreground uppercase">
              Average Recency
            </span>
            <Calendar className="w-4 h-4 text-amber-500" />
          </div>
          <div className="mt-2">
            <h3 className="text-2xl font-extrabold text-foreground">
              {formatDays(segment.avgRecency)}
            </h3>
            <p className="text-xs text-muted-foreground mt-0.5">
              Days elapsed since last transaction
            </p>
          </div>
        </Card>

        <Card className="p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-muted-foreground uppercase">
              Average Frequency
            </span>
            <ShoppingBag className="w-4 h-4 text-purple-400" />
          </div>
          <div className="mt-2">
            <h3 className="text-2xl font-extrabold text-foreground">
              {segment.avgFrequency.toFixed(1)} orders
            </h3>
            <p className="text-xs text-muted-foreground mt-0.5">
              Unique completed checkout events
            </p>
          </div>
        </Card>

        <Card className="p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-muted-foreground uppercase">
              Average Monetary Value
            </span>
            <DollarSign className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="mt-2">
            <h3 className="text-2xl font-extrabold text-emerald-400">
              {formatCurrency(segment.avgMonetary)}
            </h3>
            <p className="text-xs text-muted-foreground mt-0.5">
              Cumulative lifetime order spend
            </p>
          </div>
        </Card>
      </div>

      {/* Section 1 & 3: Behavior & Recommended Strategy Playbook */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Section 1: Behavior */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-bold flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-primary" />
              Section 1 — Behavioral Analysis
            </CardTitle>
            <CardDescription className="text-xs">
              Observed purchasing dynamics and engagement patterns for this segment.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3.5 text-xs text-muted-foreground leading-relaxed">
            <p className="p-3.5 rounded-xl bg-muted/20 border border-border/40 text-foreground">
              {segment.behavior}
            </p>

            <div className="space-y-2">
              <h4 className="font-bold text-foreground">Cohort Characteristics:</h4>
              <ul className="space-y-1.5">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                  <strong>Cohort Size:</strong> {formatNumber(segment.customerCount)} active accounts ({formatPercent(segment.pctOfBase)} of customer base)
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                  <strong>Revenue Concentration:</strong> {formatPercent(segment.pctOfRevenue)} of gross revenue ({formatCurrency(segment.totalRevenue)})
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                  <strong>Channel Focus:</strong> {segment.channelRecommendation || "Automated Email Drips + In-App Promos"}
                </li>
              </ul>
            </div>
          </CardContent>
        </Card>

        {/* Section 3: Recommended Strategy */}
        <Card className="border-primary/40 bg-gradient-to-b from-primary/5 to-transparent">
          <CardHeader>
            <CardTitle className="text-sm font-bold flex items-center gap-2">
              <Compass className="w-4 h-4 text-primary" />
              Section 3 — Recommended Business Strategy
            </CardTitle>
            <CardDescription className="text-xs">
              Tactical retention, growth, and messaging recommendations for this audience.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 text-xs">
            <div className="p-3.5 rounded-xl bg-card border border-border/70 space-y-1.5">
              <span className="font-bold text-foreground block">Core Action Directive:</span>
              <p className="text-muted-foreground leading-relaxed">
                {segment.recommendedAction}
              </p>
            </div>

            <div className="space-y-2">
              <span className="font-bold text-foreground block">Key Marketing Tactics:</span>
              <div className="space-y-1.5">
                {segment.keyTactics?.map((tactic, i) => (
                  <div
                    key={i}
                    className="p-2.5 rounded-lg bg-muted/30 border border-border/40 flex items-start gap-2"
                  >
                    <span className="w-4 h-4 rounded-full bg-primary/20 text-primary flex items-center justify-center text-[10px] font-bold mt-0.5 flex-shrink-0">
                      {i + 1}
                    </span>
                    <span className="text-foreground">{tactic}</span>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Section 4: Customer Members Table Preview */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-bold flex items-center gap-2">
              <Users className="w-4 h-4 text-primary" />
              Section 4 — Member Customers ({formatNumber(segment.customerCount)})
            </CardTitle>
            <Link href={`/customers?segment=${segment.id}`} className="text-xs text-primary hover:underline font-semibold">
              Explore All {formatNumber(segment.customerCount)} in Customer Table →
            </Link>
          </div>
          <CardDescription className="text-xs">
            Sample accounts belonging to the {segment.name} cohort.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-border/60 text-muted-foreground font-semibold">
                  <th className="p-2.5">Customer ID</th>
                  <th className="p-2.5">Recency</th>
                  <th className="p-2.5">Frequency</th>
                  <th className="p-2.5">Monetary Spend</th>
                  <th className="p-2.5">Action Plan</th>
                  <th className="p-2.5 text-right">Profile</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/40">
                {customers.map((c) => (
                  <tr key={c.id} className="hover:bg-muted/20 transition-colors">
                    <td className="p-2.5 font-mono font-bold text-foreground">
                      #{c.id}
                    </td>
                    <td className="p-2.5 text-foreground">{formatDays(c.recency)}</td>
                    <td className="p-2.5 text-foreground">{formatNumber(c.frequency)} orders</td>
                    <td className="p-2.5 font-bold text-emerald-400">{formatCurrency(c.monetary)}</td>
                    <td className="p-2.5 text-muted-foreground truncate max-w-xs">{c.recommendedAction}</td>
                    <td className="p-2.5 text-right">
                      <Link href={`/customers/${c.id}`} className="text-primary hover:underline font-medium">
                        Inspect →
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </AppShell>
  );
}
