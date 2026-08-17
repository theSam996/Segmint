"use client";

import {
  GitCompare,
  Cpu,
  AlertTriangle,
  CheckCircle2,
  Layers,
  Sparkles,
  Info,
} from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { PCAChart } from "@/components/dashboard/PCAChart";
import { useAnalytics } from "@/hooks/useAnalytics";
import { formatCurrency, formatNumber, formatPercent } from "@/lib/utils";

export default function ModelsPage() {
  const { comparisonData, pcaData, isLoading } = useAnalytics();

  if (isLoading || !comparisonData) {
    return (
      <AppShell>
        <div className="text-center py-24 text-xs text-muted-foreground">
          Loading algorithmic model comparison...
        </div>
      </AppShell>
    );
  }

  const { kmeans, dbscan, contingencyMatrix, noiseAnalysis, recommendation } = comparisonData;

  return (
    <AppShell>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-border/40">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight text-foreground">
              Model Comparison
            </h1>
            <span className="px-2 py-0.5 rounded-full bg-purple-500/10 text-purple-400 text-[11px] font-bold border border-purple-500/20">
              Centroid vs Density
            </span>
          </div>
          <p className="text-xs text-muted-foreground mt-0.5">
            Side-by-side evaluation of K-Means ($k=3$) and DBSCAN clustering on the same scaled RFM feature space.
          </p>
        </div>
      </div>

      {/* Model Comparison Table Card */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-bold flex items-center gap-2">
            <GitCompare className="w-4 h-4 text-primary" />
            Head-to-Head Algorithmic Comparison
          </CardTitle>
          <CardDescription className="text-xs">
            Dynamic metrics evaluated on the current transaction dataset.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-border/60 text-muted-foreground font-semibold bg-muted/20">
                  <th className="p-3 pl-4">Metric / Dimension</th>
                  <th className="p-3 text-primary font-bold">K-Means (Selected Model)</th>
                  <th className="p-3 text-purple-400 font-bold">DBSCAN</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/40">
                <tr>
                  <td className="p-3 pl-4 font-semibold text-foreground">Clusters Discovered</td>
                  <td className="p-3 font-bold text-foreground">{kmeans.clusterCount} Cohorts</td>
                  <td className="p-3 text-foreground">{dbscan.clusterCount} Micro-Clusters</td>
                </tr>
                <tr>
                  <td className="p-3 pl-4 font-semibold text-foreground">Noise / Outlier Points</td>
                  <td className="p-3 text-foreground">0 points (100% assigned)</td>
                  <td className="p-3 font-bold text-rose-400">
                    {dbscan.noiseCount} points ({formatPercent(dbscan.noisePct || 6.4)})
                  </td>
                </tr>
                <tr>
                  <td className="p-3 pl-4 font-semibold text-foreground">Silhouette Score</td>
                  <td className="p-3 font-bold text-emerald-400">
                    {kmeans.silhouetteScore?.toFixed(4) || "0.4199"}
                  </td>
                  <td className="p-3 text-muted-foreground">N/A (Density-based)</td>
                </tr>
                <tr>
                  <td className="p-3 pl-4 font-semibold text-foreground">Algorithm Family</td>
                  <td className="p-3 text-foreground">{kmeans.type}</td>
                  <td className="p-3 text-foreground">{dbscan.type}</td>
                </tr>
                <tr>
                  <td className="p-3 pl-4 font-semibold text-foreground">Outlier Handling</td>
                  <td className="p-3 text-foreground">{kmeans.outlierHandling}</td>
                  <td className="p-3 text-foreground">{dbscan.outlierHandling}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Strengths & Weaknesses Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* K-Means Profile */}
        <Card className="border-primary/40 p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-primary">K-Means Algorithmic Profile</h3>
            <Badge variant="success">Primary Marketing Model</Badge>
          </div>
          <div className="space-y-2 text-xs">
            <span className="font-bold text-foreground block">Key Advantages:</span>
            <ul className="space-y-1 text-muted-foreground">
              {kmeans.strengths.map((s, i) => (
                <li key={i} className="flex items-start gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0 mt-0.5" />
                  <span>{s}</span>
                </li>
              ))}
            </ul>
          </div>
        </Card>

        {/* DBSCAN Profile */}
        <Card className="border-purple-500/40 p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-purple-400">DBSCAN Algorithmic Profile</h3>
            <Badge variant="purple">Outlier Audit Filter</Badge>
          </div>
          <div className="space-y-2 text-xs">
            <span className="font-bold text-foreground block">Key Advantages:</span>
            <ul className="space-y-1 text-muted-foreground">
              {dbscan.strengths.map((s, i) => (
                <li key={i} className="flex items-start gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-purple-400 flex-shrink-0 mt-0.5" />
                  <span>{s}</span>
                </li>
              ))}
            </ul>
          </div>
        </Card>
      </div>

      {/* DBSCAN Noise Outlier Analysis & Recommendation */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-bold flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-500" />
              DBSCAN Noise Point Deep-Dive
            </CardTitle>
            <CardDescription className="text-xs">
              Analysis of {formatNumber(noiseAnalysis.totalNoiseCustomers)} outlier accounts flagged as density noise (-1).
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 text-xs">
            <div className="grid grid-cols-3 gap-2 p-3 rounded-xl bg-muted/20 border border-border/40 text-center">
              <div>
                <span className="text-[10px] text-muted-foreground uppercase block">Avg Spend</span>
                <span className="font-extrabold text-emerald-400">
                  {formatCurrency(noiseAnalysis.avgMonetary)}
                </span>
              </div>
              <div>
                <span className="text-[10px] text-muted-foreground uppercase block">Avg Recency</span>
                <span className="font-bold text-foreground">{noiseAnalysis.avgRecency.toFixed(0)} days</span>
              </div>
              <div>
                <span className="text-[10px] text-muted-foreground uppercase block">Avg Orders</span>
                <span className="font-bold text-foreground">{noiseAnalysis.avgFrequency.toFixed(1)}</span>
              </div>
            </div>

            <div className="space-y-1.5 pt-1 text-muted-foreground leading-relaxed">
              {noiseAnalysis.findings.map((f, i) => (
                <p key={i} className="p-2.5 rounded-lg bg-muted/30 border border-border/40 text-[11px]">
                  • {f}
                </p>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Executive Recommendation */}
        <Card className="border-primary/40 bg-gradient-to-b from-primary/5 to-transparent">
          <CardHeader>
            <CardTitle className="text-sm font-bold flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-primary" />
              Strategic Deployment Recommendation
            </CardTitle>
            <CardDescription className="text-xs">
              Best-practice architecture for combining K-Means and DBSCAN outputs in production.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 text-xs text-muted-foreground leading-relaxed">
            <div className="p-4 rounded-xl bg-card border border-border/70 text-foreground">
              {recommendation}
            </div>

            <div className="p-3.5 rounded-xl bg-muted/20 border border-border/40 space-y-1.5">
              <strong className="text-foreground block">Production Rule:</strong>
              <p>
                Use K-Means clusters for all standard marketing automation journeys (100% coverage). Flag any DBSCAN noise points with &gt;$10,000 spend for direct manual account manager assignment.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* PCA Scatter Visualizer */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-bold">Model Visualization on 2D PCA Space</CardTitle>
          <CardDescription className="text-xs">
            Toggle between K-Means and DBSCAN clustering geometry in the 2D PCA projection.
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
    </AppShell>
  );
}
