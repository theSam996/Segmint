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
  CheckCircle2,
  GitCompare,
  AlertTriangle,
  ArrowRight,
  ShieldCheck,
  Zap,
} from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/Tabs";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { PCAChart } from "@/components/dashboard/PCAChart";
import { useAnalytics } from "@/hooks/useAnalytics";
import { formatCurrency, formatDays, formatNumber, formatPercent } from "@/lib/utils";

export default function AnalyticsPage() {
  const { rfmData, kmeansData, pcaData, comparisonData, isLoading } = useAnalytics();
  const [activeTab, setActiveTab] = useState("rfm");

  const elbowChartData =
    kmeansData?.kValues.map((k, idx) => ({
      k: `K=${k}`,
      inertia: kmeansData.inertias[idx],
      silhouette: kmeansData.silhouetteScores[idx],
      isOptimal: k === kmeansData.optimalK,
    })) || [];

  const pc1Variance = pcaData ? (pcaData.explainedVarianceRatio[0] * 100).toFixed(1) : "72.5";
  const pc2Variance = pcaData ? (pcaData.explainedVarianceRatio[1] * 100).toFixed(1) : "21.2";
  const totalVariance = pcaData ? (pcaData.totalExplainedVariance * 100).toFixed(1) : "93.7";

  return (
    <AppShell>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-border/40">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight text-foreground">
              Analytics & Statistical Modeling
            </h1>
            <Badge variant="purple" className="text-[10px]">
              Pipeline Active
            </Badge>
          </div>
          <p className="text-xs text-muted-foreground mt-0.5">
            End-to-end customer intelligence: RFM Feature Engineering → Dual-Model Clustering → 2D PCA Projections.
          </p>
        </div>
      </div>

      {/* Analytics Process Flow Pipeline Breadcrumb */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 p-1.5 rounded-2xl bg-card/60 border border-border/70 backdrop-blur-sm shadow-xs">
        <button
          onClick={() => setActiveTab("rfm")}
          className={`flex items-start gap-3 p-3 rounded-xl text-left transition-all ${
            activeTab === "rfm"
              ? "bg-primary/10 border border-primary/30 shadow-xs"
              : "hover:bg-accent/40 border border-transparent"
          }`}
        >
          <div className={`p-2 rounded-lg ${activeTab === "rfm" ? "bg-amber-500/20 text-amber-400" : "bg-muted text-muted-foreground"}`}>
            <Layers className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground block">
              Stage 1
            </span>
            <span className="text-xs font-bold text-foreground block truncate">
              RFM Feature Engineering
            </span>
            <span className="text-[11px] text-muted-foreground block truncate">
              Recency, Frequency, Monetary
            </span>
          </div>
        </button>

        <button
          onClick={() => setActiveTab("clustering")}
          className={`flex items-start gap-3 p-3 rounded-xl text-left transition-all ${
            activeTab === "clustering"
              ? "bg-primary/10 border border-primary/30 shadow-xs"
              : "hover:bg-accent/40 border border-transparent"
          }`}
        >
          <div className={`p-2 rounded-lg ${activeTab === "clustering" ? "bg-purple-500/20 text-purple-400" : "bg-muted text-muted-foreground"}`}>
            <Cpu className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground block">
              Stage 2
            </span>
            <span className="text-xs font-bold text-foreground block truncate">
              Dual-Model Clustering
            </span>
            <span className="text-[11px] text-muted-foreground block truncate">
              K-Means & DBSCAN Evaluation
            </span>
          </div>
        </button>

        <button
          onClick={() => setActiveTab("pca")}
          className={`flex items-start gap-3 p-3 rounded-xl text-left transition-all ${
            activeTab === "pca"
              ? "bg-primary/10 border border-primary/30 shadow-xs"
              : "hover:bg-accent/40 border border-transparent"
          }`}
        >
          <div className={`p-2 rounded-lg ${activeTab === "pca" ? "bg-blue-500/20 text-blue-400" : "bg-muted text-muted-foreground"}`}>
            <Sparkles className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground block">
              Stage 3
            </span>
            <span className="text-xs font-bold text-foreground block truncate">
              PCA 2D Visualization
            </span>
            <span className="text-[11px] text-muted-foreground block truncate">
              {totalVariance}% Explained Variance
            </span>
          </div>
        </button>
      </div>

      {/* Main Tabs Container with Fixed Spacious Alignment */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <div className="flex items-center justify-between border-b border-border/40 pb-3">
          <TabsList className="flex flex-wrap sm:flex-nowrap gap-1.5 p-1 bg-card/80 border border-border/80 rounded-xl w-full sm:w-auto h-auto shadow-xs">
            <TabsTrigger
              value="rfm"
              className="flex items-center gap-2 px-3.5 py-2 text-xs font-semibold rounded-lg transition-all"
            >
              <Layers className="w-3.5 h-3.5 text-amber-500" />
              <span>1. RFM Feature Engineering</span>
            </TabsTrigger>
            <TabsTrigger
              value="clustering"
              className="flex items-center gap-2 px-3.5 py-2 text-xs font-semibold rounded-lg transition-all"
            >
              <Cpu className="w-3.5 h-3.5 text-purple-400" />
              <span>2. Dual-Model Clustering</span>
            </TabsTrigger>
            <TabsTrigger
              value="pca"
              className="flex items-center gap-2 px-3.5 py-2 text-xs font-semibold rounded-lg transition-all"
            >
              <Sparkles className="w-3.5 h-3.5 text-blue-400" />
              <span>3. PCA Visualization</span>
            </TabsTrigger>
          </TabsList>
        </div>

        {/* ========================================================================= */}
        {/* TAB 1: RFM FEATURE ENGINEERING */}
        {/* ========================================================================= */}
        <TabsContent value="rfm" className="space-y-6">
          {/* Section Introduction */}
          <div className="p-4 rounded-xl bg-muted/20 border border-border/50 flex items-start gap-3 text-xs">
            <Info className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
            <div>
              <strong className="text-foreground text-sm block font-bold mb-0.5">
                RFM Feature Engineering
              </strong>
              <p className="text-muted-foreground">
                Transform transaction-level data into three interpretable customer behavior dimensions:
                <strong className="text-foreground"> Recency</strong> (days since last purchase),
                <strong className="text-foreground"> Frequency</strong> (number of unique purchases), and
                <strong className="text-foreground"> Monetary</strong> (cumulative customer spend).
              </p>
            </div>
          </div>

          {/* Explanatory 3-Dimension Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="p-5 space-y-3 border-amber-500/30 bg-gradient-to-b from-amber-500/5 to-transparent">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 rounded-md bg-amber-500/20 text-amber-500">
                    <Calendar className="w-4 h-4" />
                  </div>
                  <span className="text-xs font-bold text-amber-500 uppercase tracking-wider">
                    Recency (R)
                  </span>
                </div>
                <Badge variant="warning" className="text-[10px]">
                  Lower is Better
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Days elapsed since the customer&apos;s last confirmed transaction. Low recency signals active buyers with top-of-mind brand recall.
              </p>
              <div className="grid grid-cols-2 gap-2 pt-2 border-t border-border/40 text-xs">
                <div>
                  <span className="text-muted-foreground text-[10px] uppercase block">Average</span>
                  <span className="text-base font-extrabold text-foreground">
                    {rfmData ? `${rfmData.summary.avgRecency.toFixed(1)} days` : "92.5 days"}
                  </span>
                </div>
                <div>
                  <span className="text-muted-foreground text-[10px] uppercase block">Median</span>
                  <span className="text-base font-bold text-foreground">
                    {rfmData ? `${rfmData.summary.medianRecency.toFixed(1)} days` : "51.0 days"}
                  </span>
                </div>
              </div>
            </Card>

            <Card className="p-5 space-y-3 border-purple-500/30 bg-gradient-to-b from-purple-500/5 to-transparent">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 rounded-md bg-purple-500/20 text-purple-400">
                    <ShoppingBag className="w-4 h-4" />
                  </div>
                  <span className="text-xs font-bold text-purple-400 uppercase tracking-wider">
                    Frequency (F)
                  </span>
                </div>
                <Badge variant="purple" className="text-[10px]">
                  Higher is Better
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Total number of distinct completed purchase events. High frequency identifies habitual repeat customers vs. one-off drop-ins.
              </p>
              <div className="grid grid-cols-2 gap-2 pt-2 border-t border-border/40 text-xs">
                <div>
                  <span className="text-muted-foreground text-[10px] uppercase block">Average</span>
                  <span className="text-base font-extrabold text-foreground">
                    {rfmData ? `${rfmData.summary.avgFrequency.toFixed(1)} orders` : "4.3 orders"}
                  </span>
                </div>
                <div>
                  <span className="text-muted-foreground text-[10px] uppercase block">Median</span>
                  <span className="text-base font-bold text-foreground">
                    {rfmData ? `${rfmData.summary.medianFrequency.toFixed(1)} orders` : "2.0 orders"}
                  </span>
                </div>
              </div>
            </Card>

            <Card className="p-5 space-y-3 border-emerald-500/30 bg-gradient-to-b from-emerald-500/5 to-transparent">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 rounded-md bg-emerald-500/20 text-emerald-400">
                    <DollarSign className="w-4 h-4" />
                  </div>
                  <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider">
                    Monetary (M)
                  </span>
                </div>
                <Badge variant="success" className="text-[10px]">
                  Higher is Better
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Cumulative gross revenue generated across all transactions. Isolates high-LTV VIP accounts from price-sensitive bargain buyers.
              </p>
              <div className="grid grid-cols-2 gap-2 pt-2 border-t border-border/40 text-xs">
                <div>
                  <span className="text-muted-foreground text-[10px] uppercase block">Average</span>
                  <span className="text-base font-extrabold text-emerald-400">
                    {rfmData ? formatCurrency(rfmData.summary.avgMonetary) : "$2,054.27"}
                  </span>
                </div>
                <div>
                  <span className="text-muted-foreground text-[10px] uppercase block">Median</span>
                  <span className="text-base font-bold text-foreground">
                    {rfmData ? formatCurrency(rfmData.summary.medianMonetary) : "$674.48"}
                  </span>
                </div>
              </div>
            </Card>
          </div>

          {/* Distribution Histograms Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-xs font-bold text-amber-500 flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5" /> Recency Distribution
                </CardTitle>
                <CardDescription className="text-[11px]">
                  Customer count per days-since-last-order bucket.
                </CardDescription>
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
              <CardHeader className="pb-2">
                <CardTitle className="text-xs font-bold text-purple-400 flex items-center gap-1.5">
                  <ShoppingBag className="w-3.5 h-3.5" /> Frequency Distribution
                </CardTitle>
                <CardDescription className="text-[11px]">
                  Customer count per order frequency tier.
                </CardDescription>
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
              <CardHeader className="pb-2">
                <CardTitle className="text-xs font-bold text-emerald-400 flex items-center gap-1.5">
                  <DollarSign className="w-3.5 h-3.5" /> Monetary Distribution
                </CardTitle>
                <CardDescription className="text-[11px]">
                  Customer count per monetary spend bracket.
                </CardDescription>
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

          {/* Mathematical Preprocessing Pipeline Note */}
          <Card className="p-4 border-border/60 bg-muted/10">
            <div className="flex items-start gap-3 text-xs">
              <Zap className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
              <div className="space-y-1">
                <span className="font-bold text-foreground">Statistical Preprocessing Applied:</span>
                <p className="text-muted-foreground leading-relaxed">
                  1. <strong className="text-foreground">Log Transformation (log1p)</strong>: Frequency and Monetary distributions exhibit extreme right-skewness and are compressed into Gaussian-like distributions.
                  <br />
                  2. <strong className="text-foreground">StandardScaler Normalization</strong>: Features are standardized to zero mean and unit variance (<span className="font-mono">z = (x - μ) / σ</span>), ensuring equal distance weighting in Euclidean clustering space.
                </p>
              </div>
            </div>
          </Card>
        </TabsContent>

        {/* ========================================================================= */}
        {/* TAB 2: DUAL-MODEL CLUSTERING */}
        {/* ========================================================================= */}
        <TabsContent value="clustering" className="space-y-6">
          {/* Section Introduction */}
          <div className="p-4 rounded-xl bg-muted/20 border border-border/50 flex items-start gap-3 text-xs">
            <Info className="w-4 h-4 text-purple-400 flex-shrink-0 mt-0.5" />
            <div>
              <strong className="text-foreground text-sm block font-bold mb-0.5">
                Dual-Model Clustering
              </strong>
              <p className="text-muted-foreground">
                Evaluate customer structure using complementary clustering approaches:
                <strong className="text-foreground"> K-Means</strong> (centroid-based segmentation for 100% customer audience coverage) and
                <strong className="text-foreground"> DBSCAN</strong> (density-based clustering for identifying irregular behavior & high-spend outlier accounts).
              </p>
            </div>
          </div>

          {/* K-Means Diagnostics Grid (Elbow & Silhouette) */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Elbow Method Chart */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-bold flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-primary" />
                    K-Means: Elbow Method (Inertia vs K)
                  </CardTitle>
                  <Badge variant="purple" className="text-[10px]">Optimal K = 3</Badge>
                </div>
                <CardDescription className="text-xs">
                  Measures within-cluster sum of squares (WCSS). The steep inflection point occurs at K=3.
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
                        name="Inertia (WCSS)"
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
                    K-Means: Silhouette Coefficient vs K
                  </CardTitle>
                  <Badge variant="success" className="text-[10px]">Max Score: 0.4199</Badge>
                </div>
                <CardDescription className="text-xs">
                  Measures cluster cohesion vs separation. K=3 achieves the global maximum silhouette score.
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
                        name="Silhouette Score"
                        fill="#10b981"
                        radius={[4, 4, 0, 0]}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Dual-Model Algorithmic Profiles */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* K-Means Profile */}
            <Card className="border-primary/40 p-5 space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-primary flex items-center gap-1.5">
                  <Cpu className="w-4 h-4" /> K-Means (Centroid-Based Segmentation)
                </h3>
                <Badge variant="success" className="text-[10px]">Primary Model</Badge>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Partition-based algorithm that optimizes 3 distinct centroids to minimize within-cluster variance. Guarantees 100% customer assignment for automated marketing journeys.
              </p>
              <div className="space-y-1.5 text-xs pt-1">
                <span className="font-bold text-foreground block">Key Strengths:</span>
                <ul className="space-y-1 text-muted-foreground text-[11px]">
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0 mt-0.5" />
                    <span>Guarantees 100% customer audience coverage with zero unassigned accounts.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0 mt-0.5" />
                    <span>Produces distinct, spherical customer cohorts ideal for executive strategy.</span>
                  </li>
                </ul>
              </div>
            </Card>

            {/* DBSCAN Profile */}
            <Card className="border-purple-500/40 p-5 space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-purple-400 flex items-center gap-1.5">
                  <GitCompare className="w-4 h-4" /> DBSCAN (Density-Based Clustering)
                </h3>
                <Badge variant="purple" className="text-[10px]">Outlier Detection</Badge>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Density-based algorithm discovering continuous spatial density clusters without fixing K. Automatically isolates sparse irregular accounts as Noise (<span className="font-mono font-bold text-rose-400">-1</span>).
              </p>
              <div className="space-y-1.5 text-xs pt-1">
                <span className="font-bold text-foreground block">Key Strengths:</span>
                <ul className="space-y-1 text-muted-foreground text-[11px]">
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-purple-400 flex-shrink-0 mt-0.5" />
                    <span>Discovers arbitrary non-linear cluster geometries naturally.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-purple-400 flex-shrink-0 mt-0.5" />
                    <span>Flags 279 high-spend anomalous accounts (6.4%) for dedicated VIP concierge handling.</span>
                  </li>
                </ul>
              </div>
            </Card>
          </div>

          {/* Model Comparison Table */}
          {comparisonData && (
            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-bold flex items-center gap-2">
                  <GitCompare className="w-4 h-4 text-primary" />
                  Head-to-Head Model Evaluation
                </CardTitle>
                <CardDescription className="text-xs">
                  Summary comparison of clustering properties on the scaled RFM feature space.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-border/60 text-muted-foreground font-semibold bg-muted/20">
                        <th className="p-3 pl-4">Evaluation Dimension</th>
                        <th className="p-3 text-primary font-bold">K-Means (Centroid)</th>
                        <th className="p-3 text-purple-400 font-bold">DBSCAN (Density)</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border/40">
                      <tr>
                        <td className="p-3 pl-4 font-semibold text-foreground">Customer Coverage</td>
                        <td className="p-3 font-bold text-emerald-400">100% Assigned (4,338 Accounts)</td>
                        <td className="p-3 text-rose-400 font-semibold">93.6% Assigned (279 Outliers Flagged)</td>
                      </tr>
                      <tr>
                        <td className="p-3 pl-4 font-semibold text-foreground">Clusters Discovered</td>
                        <td className="p-3 text-foreground font-bold">{comparisonData.kmeans.clusterCount} Primary Segments</td>
                        <td className="p-3 text-foreground">{comparisonData.dbscan.clusterCount} Micro-Clusters</td>
                      </tr>
                      <tr>
                        <td className="p-3 pl-4 font-semibold text-foreground">Silhouette Score</td>
                        <td className="p-3 font-bold text-emerald-400">0.4199 (Global Optimum at K=3)</td>
                        <td className="p-3 text-muted-foreground">N/A (Density Outlier Separation)</td>
                      </tr>
                      <tr>
                        <td className="p-3 pl-4 font-semibold text-foreground">Outlier Handling</td>
                        <td className="p-3 text-foreground">Centroid distance absorption</td>
                        <td className="p-3 text-purple-400 font-bold">Explicit Noise Classification (-1)</td>
                      </tr>
                      <tr>
                        <td className="p-3 pl-4 font-semibold text-foreground">Business Application</td>
                        <td className="p-3 text-foreground">Automated campaign segmentation</td>
                        <td className="p-3 text-foreground">VIP account executive intervention</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* ========================================================================= */}
        {/* TAB 3: PCA VISUALIZATION */}
        {/* ========================================================================= */}
        <TabsContent value="pca" className="space-y-6">
          {/* Section Introduction */}
          <div className="p-4 rounded-xl bg-muted/20 border border-border/50 flex items-start gap-3 text-xs">
            <Info className="w-4 h-4 text-blue-400 flex-shrink-0 mt-0.5" />
            <div>
              <strong className="text-foreground text-sm block font-bold mb-0.5">
                PCA Dimensionality Reduction & 2D Projection
              </strong>
              <p className="text-muted-foreground">
                Project the scaled 3D RFM feature space into two orthogonal dimensions for visual cluster analysis.
                <strong className="text-foreground"> PC1</strong> and <strong className="text-foreground">PC2</strong> preserve
                <strong className="text-foreground"> {totalVariance}%</strong> of total dataset variance from the actual analysis.
              </p>
            </div>
          </div>

          {/* Explained Variance Cards (PC1 & PC2 from actual analysis) */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="p-5 border-blue-500/30 bg-gradient-to-b from-blue-500/5 to-transparent space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-blue-400 uppercase tracking-wider">
                  Principal Component 1 (PC1)
                </span>
                <Badge variant="purple" className="text-[10px]">
                  {pc1Variance}% Variance
                </Badge>
              </div>
              <div className="text-2xl font-black text-foreground">
                {pc1Variance}%
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Primary mathematical axis capturing <strong className="text-foreground">overall transaction volume</strong> and <strong className="text-foreground">cumulative monetary spend</strong>.
              </p>
            </Card>

            <Card className="p-5 border-purple-500/30 bg-gradient-to-b from-purple-500/5 to-transparent space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-purple-400 uppercase tracking-wider">
                  Principal Component 2 (PC2)
                </span>
                <Badge variant="purple" className="text-[10px]">
                  {pc2Variance}% Variance
                </Badge>
              </div>
              <div className="text-2xl font-black text-foreground">
                {pc2Variance}%
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Secondary mathematical axis capturing <strong className="text-foreground">recency dynamics</strong> and <strong className="text-foreground">dormancy signals</strong>.
              </p>
            </Card>

            <Card className="p-5 border-emerald-500/30 bg-gradient-to-b from-emerald-500/5 to-transparent space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider">
                  Total Explained Variance
                </span>
                <Badge variant="success" className="text-[10px]">
                  High Fidelity
                </Badge>
              </div>
              <div className="text-2xl font-black text-emerald-400">
                {totalVariance}%
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Combined 2D projection preserves <strong className="text-foreground">&gt;93%</strong> of total 3D mathematical variance with negligible information loss.
              </p>
            </Card>
          </div>

          {/* Interactive 2D PCA Scatter Chart */}
          <Card>
            <CardHeader>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <CardTitle className="text-sm font-bold">2D PCA Customer Projection Map</CardTitle>
                  <CardDescription className="text-xs">
                    PC1 ({pc1Variance}% variance) aligns with spend and frequency; PC2 ({pc2Variance}% variance) aligns with recency.
                  </CardDescription>
                </div>
                <div className="text-[11px] text-muted-foreground font-mono bg-muted/40 px-2.5 py-1 rounded-lg border border-border/40">
                  Explained Variance: <strong className="text-foreground">{totalVariance}%</strong>
                </div>
              </div>
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
