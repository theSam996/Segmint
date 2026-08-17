"use client";

import React from "react";
import Link from "next/link";
import {
  Users,
  DollarSign,
  PieChart as PieIcon,
  TrendingUp,
  AlertTriangle,
  Layers,
  ArrowRight,
  Database,
  Sparkles,
} from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { KPICard } from "@/components/dashboard/KPICard";
import { SegmentDistribution } from "@/components/dashboard/SegmentDistribution";
import { PCAChart } from "@/components/dashboard/PCAChart";
import { RFMOverview } from "@/components/dashboard/RFMOverview";
import { InsightCard } from "@/components/dashboard/InsightCard";
import { RecommendationCard } from "@/components/dashboard/RecommendationCard";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { useDatasets } from "@/hooks/useDatasets";
import { useSegments } from "@/hooks/useSegments";
import { useAnalytics } from "@/hooks/useAnalytics";
import { MOCK_RECOMMENDATIONS } from "@/lib/mock-data/recommendations";

export default function DashboardPage() {
  const { selectedDataset } = useDatasets();
  const { segments } = useSegments();
  const { rfmData, pcaData } = useAnalytics();

  return (
    <AppShell>
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-border/40">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight text-foreground">
              Customer Intelligence
            </h1>
            <span className="px-2 py-0.5 rounded-full bg-primary/10 text-primary text-[11px] font-bold border border-primary/20">
              Active Run
            </span>
          </div>
          <p className="text-xs text-muted-foreground mt-0.5">
            Dataset: <strong className="text-foreground">{selectedDataset?.name || "UCI Online Retail (Demo)"}</strong> • Model: K-Means (k=3) + DBSCAN
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Link href="/datasets">
            <Button size="sm" variant="outline" className="text-xs h-8">
              <Database className="w-3.5 h-3.5 mr-1.5" />
              Change Dataset
            </Button>
          </Link>
          <Link href="/datasets/new">
            <Button size="sm" variant="primary" className="text-xs h-8 shadow-sm">
              <Sparkles className="w-3.5 h-3.5 mr-1.5" />
              New Analysis
            </Button>
          </Link>
        </div>
      </div>

      {/* 5 Primary KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        <KPICard
          label="Total Customers"
          value="4,338"
          subtext="100% categorized"
          change="+12.4%"
          isPositive={true}
          icon={Users}
          iconColor="text-blue-400"
        />
        <KPICard
          label="Total Revenue"
          value="$8,912,000"
          subtext="Gross monetary spend"
          change="+8.1%"
          isPositive={true}
          icon={DollarSign}
          iconColor="text-emerald-400"
        />
        <KPICard
          label="Customer Segments"
          value="3 Cohorts"
          subtext="Optimized via Silhouette"
          icon={PieIcon}
          iconColor="text-purple-400"
        />
        <KPICard
          label="Avg Monetary Value"
          value="$2,054"
          subtext="Median: $674"
          icon={TrendingUp}
          iconColor="text-cyan-400"
        />
        <KPICard
          label="At-Risk Customers"
          value="1,986"
          subtext="45.8% of customer base"
          change="Action Required"
          isPositive={false}
          icon={AlertTriangle}
          iconColor="text-amber-400"
        />
      </div>

      {/* Section 4: Key Insights */}
      <InsightCard />

      {/* Section 1 & 2: Segment Distribution + PCA Customer Map */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Section 1: Segment Distribution */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm">Segment Distribution</CardTitle>
              <Link href="/segments" className="text-[11px] text-primary hover:underline">
                View All
              </Link>
            </div>
            <CardDescription className="text-xs">
              Customer volume & percentage share per behavioral cohort.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <SegmentDistribution segments={segments} />
          </CardContent>
        </Card>

        {/* Section 2: PCA Customer Map */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm flex items-center gap-2">
                <Layers className="w-4 h-4 text-primary" />
                2D PCA Customer Projection Map
              </CardTitle>
              <Link href="/analytics" className="text-[11px] text-primary hover:underline">
                Deep Analytics
              </Link>
            </div>
            <CardDescription className="text-xs">
              Unsupervised clustering projected onto principal axes with 93.7% preserved variance.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {pcaData ? (
              <PCAChart
                points={pcaData.points}
                explainedVarianceRatio={pcaData.explainedVarianceRatio}
                totalExplainedVariance={pcaData.totalExplainedVariance}
              />
            ) : (
              <div className="h-64 flex items-center justify-center text-xs text-muted-foreground">
                Loading PCA map...
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Section 3 & 5: RFM Overview + Recommended Priority Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Section 3: RFM Overview */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm">RFM Feature Distributions</CardTitle>
              <Link href="/analytics" className="text-[11px] text-primary hover:underline">
                Explore RFM
              </Link>
            </div>
            <CardDescription className="text-xs">
              Recency (days), Frequency (orders), and Monetary ($) histograms.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {rfmData ? (
              <RFMOverview data={rfmData} />
            ) : (
              <div className="h-48 flex items-center justify-center text-xs text-muted-foreground">
                Loading distributions...
              </div>
            )}
          </CardContent>
        </Card>

        {/* Section 5: Recommended Actions */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm">Priority Business Actions</CardTitle>
              <Link href="/recommendations" className="text-[11px] text-primary hover:underline">
                Action Center ({MOCK_RECOMMENDATIONS.length})
              </Link>
            </div>
            <CardDescription className="text-xs">
              Highest-impact retention and growth actions derived from segment profiles.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {MOCK_RECOMMENDATIONS.slice(0, 2).map((rec) => (
              <RecommendationCard key={rec.id} rec={rec} />
            ))}
          </CardContent>
        </Card>
      </div>
    </AppShell>
  );
}
