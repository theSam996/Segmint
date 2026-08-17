"use client";

import { useState } from "react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ScatterChart,
  Scatter,
  ZAxis,
} from "recharts";
import {
  BarChart3,
  TrendingUp,
  Cpu,
  Layers,
  Sparkles,
  Info,
  Calendar,
  ShoppingBag,
  DollarSign,
} from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/Tabs";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { PCAChart } from "@/components/dashboard/PCAChart";
import { useAnalytics } from "@/hooks/useAnalytics";
import { formatCurrency, formatDays, formatNumber } from "@/lib/utils";

export default function AnalyticsPage() {
  const { rfmData, kmeansData, pcaData, isLoading } = useAnalytics();

  const elbowChartData = kmeansData?.kValues.map((k, idx) => ({
    k: `K=${k}`,
    inertia: kmeansData.inertias[idx],
    silhouette: kmeansData.silhouetteScores[idx],
    isOptimal: k === kmeansData.optimalK,
  })) || [];

  return (
    <AppShell>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-border/40">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight text-foreground">
            Analytics & Statistical Modeling
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Deep-dive into RFM feature distributions, K-Means elbow/silhouette diagnostics, and 2D PCA projections.
          </p>
        </div>
      </div>

      {/* Analytics Tabs: RFM | K-Means | PCA */}
      <Tabs defaultValue="rfm" className="space-y-6">
        <TabsList className="grid grid-cols-3 w-full sm:w-80">
          <TabsTrigger value="rfm">1. RFM Distributions</TabsTrigger>
          <TabsTrigger value="kmeans">2. K-Means Diagnostics</TabsTrigger>
          <TabsTrigger value="pca">3. PCA Visualization</TabsTrigger>
        </TabsList>

        {/* TAB 1: RFM Analytics */}
        <TabsContent value="rfm" className="space-y-6">
          {/* Explanatory Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="p-5 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-amber-500 uppercase">Recency (R)</span>
                <Calendar className="w-4 h-4 text-amber-500" />
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Days elapsed since last purchase. <strong className="text-foreground">Lower is better</strong> as it signals recent engagement and high checkout propensity.
              </p>
              <div className="pt-2 text-xs">
                <span className="text-muted-foreground block text-[10px] uppercase">Dataset Average:</span>
                <span className="text-base font-extrabold text-foreground">
                  {rfmData ? `${rfmData.summary.avgRecency.toFixed(1)} days` : "—"}
                </span>
              </div>
            </Card>

            <Card className="p-5 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-purple-400 uppercase">Frequency (F)</span>
                <ShoppingBag className="w-4 h-4 text-purple-400" />
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Total number of distinct purchase events. <strong className="text-foreground">Higher is better</strong>, distinguishing one-time buyers from brand loyalists.
              </p>
              <div className="pt-2 text-xs">
                <span className="text-muted-foreground block text-[10px] uppercase">Dataset Average:</span>
                <span className="text-base font-extrabold text-foreground">
                  {rfmData ? `${rfmData.summary.avgFrequency.toFixed(1)} orders` : "—"}
                </span>
              </div>
            </Card>

            <Card className="p-5 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-emerald-400 uppercase">Monetary (M)</span>
                <DollarSign className="w-4 h-4 text-emerald-400" />
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Cumulative gross amount spent across all transactions. <strong className="text-foreground">Higher is better</strong>, identifying VIP revenue pillars.
              </p>
              <div className="pt-2 text-xs">
                <span className="text-muted-foreground block text-[10px] uppercase">Dataset Average:</span>
                <span className="text-base font-extrabold text-emerald-400">
                  {rfmData ? formatCurrency(rfmData.summary.avgMonetary) : "—"}
                </span>
              </div>
            </Card>
          </div>

          {/* Distribution Histograms Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-xs font-bold text-amber-500">Recency Distribution</CardTitle>
                <CardDescription className="text-[11px]">Customer count per days-since-last-order bucket.</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-48 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={rfmData?.recencyBins || []}>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(150,150,150,0.1)" />
                      <XAxis dataKey="range" stroke="#888888" fontSize={10} />
                      <YAxis stroke="#888888" fontSize={10} />
                      <Tooltip />
                      <Bar dataKey="count" fill="#f59e0b" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-xs font-bold text-purple-400">Frequency Distribution</CardTitle>
                <CardDescription className="text-[11px]">Customer count per order frequency tier.</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-48 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={rfmData?.frequencyBins || []}>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(150,150,150,0.1)" />
                      <XAxis dataKey="range" stroke="#888888" fontSize={10} />
                      <YAxis stroke="#888888" fontSize={10} />
                      <Tooltip />
                      <Bar dataKey="count" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-xs font-bold text-emerald-400">Monetary Distribution</CardTitle>
                <CardDescription className="text-[11px]">Customer count per monetary spend bracket.</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-48 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={rfmData?.monetaryBins || []}>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(150,150,150,0.1)" />
                      <XAxis dataKey="range" stroke="#888888" fontSize={10} />
                      <YAxis stroke="#888888" fontSize={10} />
                      <Tooltip />
                      <Bar dataKey="count" fill="#10b981" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* TAB 2: K-Means Diagnostics */}
        <TabsContent value="kmeans" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Elbow Method Chart */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-bold flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-primary" />
                    Elbow Method (Inertia vs K)
                  </CardTitle>
                  <Badge variant="purple" className="text-[10px]">Optimal K = 3</Badge>
                </div>
                <CardDescription className="text-xs">
                  Measures within-cluster sum of squares (WCSS). The inflection point occurs at K=3.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-56 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={elbowChartData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(150,150,150,0.1)" />
                      <XAxis dataKey="k" stroke="#888888" fontSize={11} />
                      <YAxis stroke="#888888" fontSize={11} />
                      <Tooltip />
                      <Line
                        type="monotone"
                        dataKey="inertia"
                        stroke="#8b5cf6"
                        strokeWidth={2.5}
                        dot={{ r: 4, fill: "#8b5cf6" }}
                        activeDot={{ r: 6 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* Silhouette Score Chart */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-bold flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-emerald-400" />
                    Silhouette Coefficient vs K
                  </CardTitle>
                  <Badge variant="success" className="text-[10px]">Max Score: 0.4199</Badge>
                </div>
                <CardDescription className="text-xs">
                  Measures cluster cohesion vs separation. K=3 achieves the global maximum.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-56 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={elbowChartData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(150,150,150,0.1)" />
                      <XAxis dataKey="k" stroke="#888888" fontSize={11} />
                      <YAxis stroke="#888888" fontSize={11} domain={[0.2, 0.45]} />
                      <Tooltip />
                      <Bar
                        dataKey="silhouette"
                        fill="#10b981"
                        radius={[4, 4, 0, 0]}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* TAB 3: PCA Analytics */}
        <TabsContent value="pca" className="space-y-6">
          <div className="p-4 rounded-xl bg-muted/20 border border-border/40 text-xs text-muted-foreground flex items-start gap-3">
            <Info className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
            <div>
              <strong className="text-foreground">Methodology Clarification: </strong>
              PCA (Principal Component Analysis) is used strictly as a 2D dimensionality reduction and visualization technique to inspect high-dimensional scaled RFM clusters. Clustering was performed directly on the 3D scaled features.
            </div>
          </div>

          {/* PCA Scatter Chart */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-bold">2D PCA Customer Projection Map</CardTitle>
              <CardDescription className="text-xs">
                PC1 (72.5% variance) aligns with spend and frequency volume; PC2 (21.2% variance) aligns with recency.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {pcaData && (
                <PCAChart
                  points={pcaData.points}
                  explainedVarianceRatio={pcaData.explainedVarianceRatio}
                  totalExplainedVariance={pcaData.totalExplainedVariance}
                />
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </AppShell>
  );
}
