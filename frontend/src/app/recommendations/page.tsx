"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Lightbulb,
  ArrowRight,
  Download,
  Users,
  ShieldAlert,
  Sparkles,
  TrendingUp,
  RotateCcw,
  Tag,
  CheckCircle2,
} from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Card, CardContent } from "@/components/ui/Card";
import { MOCK_RECOMMENDATIONS } from "@/lib/mock-data/recommendations";
import { formatCurrency, formatNumber } from "@/lib/utils";

export default function RecommendationsPage() {
  const [selectedCategory, setSelectedCategory] = useState<string>("all");

  const categories = [
    { id: "all", label: "All Playbooks", count: MOCK_RECOMMENDATIONS.length },
    { id: "reactivation", label: "Reactivation & Win-Back", count: 1 },
    { id: "loyalty", label: "VIP Loyalty & Retention", count: 1 },
    { id: "upsell", label: "Upsell & Bundling", count: 1 },
    { id: "retention", label: "List Hygiene & Clearance", count: 1 },
  ];

  const filtered =
    selectedCategory === "all"
      ? MOCK_RECOMMENDATIONS
      : MOCK_RECOMMENDATIONS.filter((r) => r.category === selectedCategory);

  const priorityVariant = {
    urgent: "danger" as const,
    high: "warning" as const,
    medium: "purple" as const,
    low: "secondary" as const,
  };

  return (
    <AppShell>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-border/40">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight text-foreground">
              Business Action Center
            </h1>
            <span className="px-2 py-0.5 rounded-full bg-primary/10 text-primary text-[11px] font-bold border border-primary/20">
              {MOCK_RECOMMENDATIONS.length} Active Playbooks
            </span>
          </div>
          <p className="text-xs text-muted-foreground mt-0.5">
            Turn behavioral RFM segment findings into concrete revenue-retention and cross-sell marketing campaigns.
          </p>
        </div>
      </div>

      {/* Category Filter Pills */}
      <div className="flex flex-wrap items-center gap-2">
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setSelectedCategory(cat.id)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all border ${
              selectedCategory === cat.id
                ? "bg-primary text-primary-foreground border-primary shadow-xs"
                : "bg-card text-muted-foreground hover:text-foreground border-border/60 hover:bg-muted/40"
            }`}
          >
            {cat.label} ({cat.count})
          </button>
        ))}
      </div>

      {/* Recommendation Playbook Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filtered.map((rec) => (
          <Card
            key={rec.id}
            className="hover:border-primary/50 transition-all flex flex-col justify-between p-6 bg-card/90"
          >
            <div className="space-y-4">
              {/* Header */}
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-3xl p-2 rounded-xl bg-muted/40 border border-border/60">
                    {rec.segmentIcon}
                  </span>
                  <div>
                    <h3 className="text-base font-bold text-foreground">{rec.title}</h3>
                    <p className="text-xs text-muted-foreground">
                      Targeting <strong className="text-foreground">{rec.segmentName}</strong> ({formatNumber(rec.customerCount)} accounts)
                    </p>
                  </div>
                </div>
                <Badge variant={priorityVariant[rec.priority]} className="text-[10px] uppercase">
                  {rec.priority}
                </Badge>
              </div>

              {/* Reason / Context */}
              <div className="p-3.5 rounded-xl bg-muted/20 border border-border/40 text-xs space-y-1">
                <span className="font-bold text-foreground block">Why This Matters:</span>
                <p className="text-muted-foreground leading-relaxed">
                  {rec.reason}
                </p>
              </div>

              {/* Recommended Action Playbook */}
              <div className="p-4 rounded-xl bg-primary/10 border border-primary/20 text-xs space-y-1.5">
                <span className="font-bold text-primary flex items-center gap-1.5">
                  <Lightbulb className="w-3.5 h-3.5" /> Recommended Execution
                </span>
                <p className="text-muted-foreground leading-relaxed">
                  {rec.recommendedAction}
                </p>
              </div>

              {/* Suggested Offer */}
              {rec.suggestedOffer && (
                <div className="p-3 rounded-lg bg-muted/30 border border-border/40 text-xs flex items-center gap-2">
                  <Tag className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                  <span className="text-muted-foreground">
                    <strong className="text-foreground">Suggested Offer: </strong>
                    {rec.suggestedOffer}
                  </span>
                </div>
              )}
            </div>

            {/* Actions Footer */}
            <div className="flex items-center justify-between pt-6 border-t border-border/40 mt-4 text-xs">
              <Link
                href={`/segments/${rec.segmentId}`}
                className="text-primary hover:underline font-semibold flex items-center gap-1"
              >
                View Segment Strategy <ArrowRight className="w-3.5 h-3.5" />
              </Link>
              <Link href={`/customers?segment=${rec.segmentId}`}>
                <Button size="sm" variant="outline" className="text-xs h-8">
                  <Users className="w-3.5 h-3.5 mr-1" />
                  Filter {formatNumber(rec.customerCount)} Customers
                </Button>
              </Link>
            </div>
          </Card>
        ))}
      </div>
    </AppShell>
  );
}
