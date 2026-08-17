"use client";

import { useParams } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  ArrowRight,
  Calendar,
  ShoppingBag,
  DollarSign,
  Layers,
  Sparkles,
  Download,
  Share2,
  CheckCircle2,
  Compass,
  Lightbulb,
} from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/Card";
import { useCustomer } from "@/hooks/useCustomers";
import { formatCurrency, formatDays, formatNumber, formatDate } from "@/lib/utils";

export default function CustomerDetailPage() {
  const params = useParams();
  const customerId = (params?.customerId as string) || "17850";
  const { customer, isLoading } = useCustomer(customerId);

  if (isLoading || !customer) {
    return (
      <AppShell>
        <div className="text-center py-24 text-xs text-muted-foreground">
          Loading customer account profile #{customerId}...
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell>
      {/* Back Link & Header */}
      <div className="space-y-4">
        <Link
          href="/customers"
          className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors font-medium"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Back to Customers
        </Link>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-border/40">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center font-mono font-black text-primary text-base">
              #{customer.id}
            </div>
            <div>
              <div className="flex items-center gap-2.5">
                <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight text-foreground">
                  Customer #{customer.id}
                </h1>
                <span
                  className="px-2.5 py-0.5 rounded-full text-xs font-semibold"
                  style={{
                    backgroundColor: `${customer.segmentColor || "#3b82f6"}20`,
                    color: customer.segmentColor || "#3b82f6",
                  }}
                >
                  {customer.segmentIcon} {customer.segmentName}
                </span>
              </div>
              <p className="text-xs text-muted-foreground mt-0.5">
                Last active {formatDays(customer.recency)} ago • RFM Rating:{" "}
                <span className="font-mono font-bold text-foreground">
                  {customer.rfmScore || "444"}
                </span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Link href={`/segments/${customer.segmentId}`}>
              <Button size="sm" variant="outline" className="text-xs h-8">
                <Compass className="w-3.5 h-3.5 mr-1.5" />
                View Segment Strategy
              </Button>
            </Link>
            <Button size="sm" variant="primary" className="text-xs h-8 shadow-sm">
              <Download className="w-3.5 h-3.5 mr-1.5" />
              Export Dossier
            </Button>
          </div>
        </div>
      </div>

      {/* Primary RFM Metric Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-muted-foreground uppercase">
              Recency
            </span>
            <div className="p-2 rounded-lg bg-amber-500/10 text-amber-500">
              <Calendar className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2">
            <h3 className="text-2xl font-extrabold text-foreground">
              {formatDays(customer.recency)}
            </h3>
            <p className="text-xs text-muted-foreground mt-0.5">
              {customer.recency <= 30
                ? "Highly Active (Recent purchaser)"
                : customer.recency <= 60
                ? "At Risk of Churn (>45 days)"
                : "Dormant / Hibernating"}
            </p>
          </div>
        </Card>

        <Card className="p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-muted-foreground uppercase">
              Frequency
            </span>
            <div className="p-2 rounded-lg bg-purple-500/10 text-purple-400">
              <ShoppingBag className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2">
            <h3 className="text-2xl font-extrabold text-foreground">
              {formatNumber(customer.frequency)} orders
            </h3>
            <p className="text-xs text-muted-foreground mt-0.5">
              Avg basket: {formatCurrency(customer.averageOrderValue || 0)}
            </p>
          </div>
        </Card>

        <Card className="p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-muted-foreground uppercase">
              Monetary Spend
            </span>
            <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2">
            <h3 className="text-2xl font-extrabold text-emerald-400">
              {formatCurrency(customer.monetary)}
            </h3>
            <p className="text-xs text-muted-foreground mt-0.5">
              Lifetime gross contribution
            </p>
          </div>
        </Card>
      </div>

      {/* Cluster & Segment Intelligence */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* RFM Interpretation & Cluster Breakdown */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-bold flex items-center gap-2">
              <Layers className="w-4 h-4 text-primary" />
              Machine Learning Clustering Profile
            </CardTitle>
            <CardDescription className="text-xs">
              Algorithmic grouping in normalized StandardScaler 3D feature space.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 text-xs">
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3.5 rounded-xl bg-muted/30 border border-border/40 space-y-1">
                <span className="text-[10px] text-muted-foreground uppercase font-bold">K-Means Assignment</span>
                <p className="text-base font-extrabold text-foreground">Cluster #{customer.kmeansCluster}</p>
                <span className="text-[10px] text-primary font-medium">Spherical Partition</span>
              </div>
              <div className="p-3.5 rounded-xl bg-muted/30 border border-border/40 space-y-1">
                <span className="text-[10px] text-muted-foreground uppercase font-bold">DBSCAN Density</span>
                <p className="text-base font-extrabold text-purple-400">
                  {customer.dbscanCluster === -1 ? "Noise (-1)" : `Core #${customer.dbscanCluster}`}
                </p>
                <span className="text-[10px] text-muted-foreground">
                  {customer.dbscanCluster === -1 ? "Outlier Density" : "High-Density Core"}
                </span>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-muted/20 border border-border/40 space-y-2">
              <h4 className="font-bold text-foreground">Behavioral RFM Interpretation:</h4>
              <ul className="space-y-1.5 text-muted-foreground">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                  <strong>Recency:</strong> {customer.recency <= 30 ? "High activity within last 30 days" : "Approaching dormancy threshold"}
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                  <strong>Frequency:</strong> Completed {customer.frequency} discrete checkout transactions
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                  <strong>Monetary Value:</strong> Lifetime total {formatCurrency(customer.monetary)}
                </li>
              </ul>
            </div>
          </CardContent>
        </Card>

        {/* Next Best Action Playbook */}
        <Card className="border-primary/40 bg-gradient-to-b from-primary/5 to-transparent">
          <CardHeader>
            <CardTitle className="text-sm font-bold flex items-center gap-2">
              <Lightbulb className="w-4 h-4 text-primary" />
              Recommended Business Action
            </CardTitle>
            <CardDescription className="text-xs">
              Synthesized marketing playbook tailored for Customer #{customer.id}.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-4 rounded-xl bg-card border border-border/70 space-y-2">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold text-foreground">Recommended Next Step</h4>
                <Badge variant="warning" className="text-[10px] uppercase">
                  High Priority
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">
                {customer.recommendedAction ||
                  "Trigger automated win-back promotional email before customer crosses churn threshold."}
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-muted/20 border border-border/40 text-xs space-y-1.5">
              <span className="font-bold text-foreground block">Suggested Channel:</span>
              <p className="text-muted-foreground">
                Automated 1-to-1 Email Drip Sequence + Retargeting Audience Sync
              </p>
            </div>

            <div className="pt-2 flex items-center gap-2">
              <Link href={`/segments/${customer.segmentId}`} className="w-full">
                <Button variant="primary" size="sm" className="w-full text-xs font-semibold h-9 shadow-sm">
                  View Full {customer.segmentName} Playbook <ArrowRight className="w-3.5 h-3.5 ml-1" />
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </AppShell>
  );
}
