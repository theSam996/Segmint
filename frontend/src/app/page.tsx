"use client";

import Link from "next/link";
import {
  ArrowRight,
  Database,
  BarChart3,
  PieChart,
  Layers,
  Sparkles,
  ShieldCheck,
  Zap,
  TrendingUp,
  Cpu,
  CheckCircle2,
  Users,
  Compass,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Card, CardContent } from "@/components/ui/Card";

import { useAuth } from "@/hooks/useAuth";

export default function LandingPage() {
  const { user, isAuthenticated } = useAuth();

  const scrollTo = (id: string) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div className="min-h-screen bg-background text-foreground selection:bg-primary/20 selection:text-primary">
      {/* Sticky Top Navbar */}
      <header className="sticky top-0 z-50 w-full border-b border-border/60 bg-background/80 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-8">
            <Link href="/" className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-primary to-purple-400 flex items-center justify-center text-primary-foreground font-black text-sm shadow-sm">
                S
              </div>
              <span className="font-extrabold text-base tracking-tight text-foreground">
                SegmentIQ
              </span>
            </Link>

            <nav className="hidden md:flex items-center gap-6 text-xs font-medium text-muted-foreground">
              <button
                onClick={() => scrollTo("how-it-works")}
                className="hover:text-foreground transition-colors"
              >
                How It Works
              </button>
              <button
                onClick={() => scrollTo("methodology")}
                className="hover:text-foreground transition-colors"
              >
                Methodology
              </button>
              <button
                onClick={() => scrollTo("segments")}
                className="hover:text-foreground transition-colors"
              >
                Segments
              </button>
              <button
                onClick={() => scrollTo("algorithms")}
                className="hover:text-foreground transition-colors"
              >
                K-Means & DBSCAN
              </button>
            </nav>
          </div>

          <div className="flex items-center gap-3">
            {isAuthenticated && user ? (
              <div className="flex items-center gap-3">
                <Link
                  href="/settings"
                  className="flex items-center gap-2.5 px-3 py-1.5 rounded-full bg-card border border-border/80 hover:border-primary/50 transition-all text-left group"
                >
                  <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-primary to-purple-400 text-primary-foreground font-black text-[11px] flex items-center justify-center shadow-xs">
                    {user.fullName?.charAt(0).toUpperCase() || "U"}
                  </div>
                  <div className="hidden sm:block text-left">
                    <span className="text-xs font-bold text-foreground block group-hover:text-primary transition-colors leading-none">
                      {user.fullName}
                    </span>
                    <span className="text-[10px] text-muted-foreground block leading-tight truncate max-w-[140px]">
                      {user.email}
                    </span>
                  </div>
                </Link>
                <Link href="/dashboard">
                  <Button size="sm" variant="primary" className="text-xs font-semibold h-8 shadow-sm">
                    Go to Dashboard <ArrowRight className="w-3.5 h-3.5 ml-1" />
                  </Button>
                </Link>
              </div>
            ) : (
              <>
                <Link href="/login">
                  <Button variant="ghost" size="sm" className="text-xs">
                    Login
                  </Button>
                </Link>
                <Link href="/signup">
                  <Button size="sm" variant="primary" className="text-xs">
                    Start Free <ArrowRight className="w-3.5 h-3.5 ml-1" />
                  </Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative pt-20 pb-24 md:pt-28 md:pb-32 overflow-hidden">
        {/* Glow ambient background */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-primary/15 blur-[120px] rounded-full pointer-events-none" />

        <div className="max-w-5xl mx-auto px-6 text-center space-y-6 relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-primary/30 bg-primary/10 text-primary text-xs font-semibold uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5" />
            Unsupervised ML Customer Intelligence
          </div>

          <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight text-foreground leading-[1.12]">
            Turn Transaction Data Into <br className="hidden sm:inline" />
            <span className="bg-gradient-to-r from-primary via-purple-300 to-blue-400 bg-clip-text text-transparent">
              Customer Intelligence
            </span>
          </h1>

          <p className="max-w-2xl mx-auto text-base sm:text-lg text-muted-foreground leading-relaxed font-normal">
            Understand who your customers are, how they behave, and what action to take next.
            Powered by RFM scoring, K-Means & DBSCAN clustering, and 2D PCA visualization.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-4">
            {isAuthenticated ? (
              <Link href="/dashboard">
                <Button size="lg" variant="primary" className="w-full sm:w-auto text-sm font-semibold h-11 px-7 shadow-md">
                  Go to Dashboard <ArrowRight className="w-4 h-4 ml-1.5" />
                </Button>
              </Link>
            ) : (
              <>
                <Link href="/signup">
                  <Button size="lg" variant="primary" className="w-full sm:w-auto text-sm font-semibold h-11 px-7 shadow-md">
                    Start Free <ArrowRight className="w-4 h-4 ml-1.5" />
                  </Button>
                </Link>
                <Link href="/onboarding/setup">
                  <Button size="lg" variant="secondary" className="w-full sm:w-auto text-sm h-11 px-7">
                    Explore Demo Dataset (UCI Retail)
                  </Button>
                </Link>
              </>
            )}
          </div>

          {/* Product Dashboard Preview */}
          <div className="pt-12 relative max-w-5xl mx-auto">
            <div className="rounded-2xl border border-border/80 bg-card/90 backdrop-blur-xl p-3 shadow-2xl overflow-hidden text-left">
              {/* Mock Browser Header */}
              <div className="flex items-center justify-between px-3 py-2 border-b border-border/40 mb-3 text-xs text-muted-foreground">
                <div className="flex items-center gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-rose-500/80" />
                  <div className="w-2.5 h-2.5 rounded-full bg-amber-500/80" />
                  <div className="w-2.5 h-2.5 rounded-full bg-emerald-500/80" />
                  <span className="ml-2 font-mono text-[11px] text-foreground font-medium">
                    segmentiq.io/dashboard
                  </span>
                </div>
                <Badge variant="success" className="text-[10px]">
                  ● Connected: 4,338 Customers
                </Badge>
              </div>

              {/* Preview Dashboard Content */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
                <div className="p-3.5 rounded-xl bg-muted/30 border border-border/40">
                  <span className="text-[10px] uppercase font-bold text-muted-foreground">Total Customers</span>
                  <p className="text-xl font-extrabold text-foreground mt-0.5">4,338</p>
                  <span className="text-[10px] text-emerald-500 font-medium">100% database coverage</span>
                </div>
                <div className="p-3.5 rounded-xl bg-muted/30 border border-border/40">
                  <span className="text-[10px] uppercase font-bold text-muted-foreground">Total Revenue</span>
                  <p className="text-xl font-extrabold text-foreground mt-0.5">$8,912,000</p>
                  <span className="text-[10px] text-purple-400 font-medium">Avg $2,054 / customer</span>
                </div>
                <div className="p-3.5 rounded-xl bg-muted/30 border border-border/40">
                  <span className="text-[10px] uppercase font-bold text-muted-foreground">Loyal Spenders</span>
                  <p className="text-xl font-extrabold text-blue-400 mt-0.5">30.9%</p>
                  <span className="text-[10px] text-muted-foreground">Generates 81% revenue</span>
                </div>
                <div className="p-3.5 rounded-xl bg-muted/30 border border-border/40">
                  <span className="text-[10px] uppercase font-bold text-muted-foreground">At-Risk Segment</span>
                  <p className="text-xl font-extrabold text-amber-400 mt-0.5">1,986 accounts</p>
                  <span className="text-[10px] text-amber-500 font-medium">Action: Win-Back Drip</span>
                </div>
              </div>

              {/* Scatter Thumbnail Preview */}
              <div className="p-4 rounded-xl bg-muted/20 border border-border/40 flex flex-col md:flex-row items-center justify-between gap-4">
                <div className="space-y-1 text-left">
                  <div className="flex items-center gap-2">
                    <Layers className="w-4 h-4 text-primary" />
                    <span className="text-xs font-bold text-foreground">2D PCA Customer Projection Map</span>
                  </div>
                  <p className="text-[11px] text-muted-foreground">
                    Preserving 93.7% total explained variance across 3D scaled RFM feature dimensions.
                  </p>
                </div>
                <div className="flex items-center gap-2 text-xs">
                  <span className="inline-flex items-center gap-1 text-[11px] text-blue-400 font-medium">
                    ● Loyal Spenders (1,342)
                  </span>
                  <span className="inline-flex items-center gap-1 text-[11px] text-amber-400 font-medium">
                    ● At-Risk (1,986)
                  </span>
                  <span className="inline-flex items-center gap-1 text-[11px] text-gray-400 font-medium">
                    ● Hibernating (1,010)
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="py-20 border-t border-border/60 bg-muted/10">
        <div className="max-w-6xl mx-auto px-6 space-y-12 text-center">
          <div className="space-y-3">
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
              How SegmentIQ Works
            </h2>
            <p className="text-sm text-muted-foreground max-w-xl mx-auto">
              From raw e-commerce transaction lines to automated marketing playbooks in 4 seamless stages.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 text-left">
            <div className="p-5 rounded-xl bg-card border border-border/70 space-y-3">
              <div className="w-10 h-10 rounded-lg bg-primary/10 border border-primary/20 text-primary flex items-center justify-center font-bold text-sm">
                1
              </div>
              <h3 className="text-sm font-bold text-foreground">1. Connect Your Data</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Upload raw CSV or Excel transaction files. Our schema auditor automatically validates Customer ID, Date, Quantity, and Unit Price columns.
              </p>
            </div>

            <div className="p-5 rounded-xl bg-card border border-border/70 space-y-3">
              <div className="w-10 h-10 rounded-lg bg-blue-500/10 border border-blue-500/20 text-blue-400 flex items-center justify-center font-bold text-sm">
                2
              </div>
              <h3 className="text-sm font-bold text-foreground">2. Analyze Behavior</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Calculates customer-level Recency, Frequency, and Monetary metrics. Applies log1p transformation and StandardScaler to correct feature skewness.
              </p>
            </div>

            <div className="p-5 rounded-xl bg-card border border-border/70 space-y-3">
              <div className="w-10 h-10 rounded-lg bg-purple-500/10 border border-purple-500/20 text-purple-400 flex items-center justify-center font-bold text-sm">
                3
              </div>
              <h3 className="text-sm font-bold text-foreground">3. Discover Segments</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Runs K-Means clustering with automated silhouette & elbow score optimization alongside DBSCAN to isolate density clusters and outlier noise.
              </p>
            </div>

            <div className="p-5 rounded-xl bg-card border border-border/70 space-y-3">
              <div className="w-10 h-10 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-sm">
                4
              </div>
              <h3 className="text-sm font-bold text-foreground">4. Take Action</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Converts mathematical clusters into plain-English personas with tailored retention, loyalty, win-back, and upsell business playbooks.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Methodology Section: RFM + K-Means + DBSCAN + PCA */}
      <section id="methodology" className="py-20 border-t border-border/60">
        <div className="max-w-6xl mx-auto px-6 space-y-14">
          <div className="text-center space-y-3 max-w-2xl mx-auto">
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
              Built on Solid Machine Learning Foundations
            </h2>
            <p className="text-sm text-muted-foreground">
              Mathematical rigor meets business utility. No black-box hype — every customer assignment is explainable.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardContent className="p-6 space-y-3">
                <div className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
                  <BarChart3 className="w-4 h-4" />
                </div>
                <h3 className="text-base font-bold text-foreground">RFM Feature Engineering</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Collapses thousands of transaction lines per customer into 3 core behavioral dimensions:
                </p>
                <ul className="text-xs text-muted-foreground space-y-1.5 pt-1">
                  <li><strong className="text-foreground">Recency:</strong> Days since last purchase (lower = active)</li>
                  <li><strong className="text-foreground">Frequency:</strong> Count of unique purchase events</li>
                  <li><strong className="text-foreground">Monetary:</strong> Cumulative spend across orders</li>
                </ul>
              </CardContent>
            </Card>

            <Card id="algorithms">
              <CardContent className="p-6 space-y-3">
                <div className="w-8 h-8 rounded-lg bg-blue-500/10 text-blue-400 flex items-center justify-center">
                  <Cpu className="w-4 h-4" />
                </div>
                <h3 className="text-base font-bold text-foreground">Parallel Clustering</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Evaluates both centroid-based and density-based clustering models:
                </p>
                <ul className="text-xs text-muted-foreground space-y-1.5 pt-1">
                  <li><strong className="text-foreground">K-Means:</strong> 100% audience coverage optimized via Silhouette score.</li>
                  <li><strong className="text-foreground">DBSCAN:</strong> Discovers arbitrary density and flags outlier whale accounts.</li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6 space-y-3">
                <div className="w-8 h-8 rounded-lg bg-purple-500/10 text-purple-400 flex items-center justify-center">
                  <Compass className="w-4 h-4" />
                </div>
                <h3 className="text-base font-bold text-foreground">PCA Visualization</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Projects the 3-dimensional scaled RFM space onto 2 principal orthogonal axes for visual inspection:
                </p>
                <ul className="text-xs text-muted-foreground space-y-1.5 pt-1">
                  <li><strong className="text-foreground">PC1 (72.5%):</strong> Overall engagement and spending volume.</li>
                  <li><strong className="text-foreground">PC2 (21.2%):</strong> Recency versus dormancy orientation.</li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Customer Segments Showcase */}
      <section id="segments" className="py-20 border-t border-border/60 bg-muted/10">
        <div className="max-w-6xl mx-auto px-6 space-y-12">
          <div className="text-center space-y-3 max-w-2xl mx-auto">
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
              From Clusters to Business Personas
            </h2>
            <p className="text-sm text-muted-foreground">
              A retailer doesn't want "Cluster 2" — they want to know who needs a win-back discount and who deserves early VIP access.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-6 rounded-2xl bg-card border border-border/70 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">💎</span>
                  <h3 className="text-base font-bold text-blue-400">Loyal High Spenders</h3>
                </div>
                <Badge variant="success">81% Revenue</Badge>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Frequent repeat customers with substantial basket spend ($5,377 average). They are your business foundation.
              </p>
              <div className="p-3 rounded-lg bg-blue-500/10 border border-blue-500/20 text-xs text-blue-400 font-medium">
                💡 Action: Provide VIP tier enrollment, 24-hr early drop window, and dedicated concierge.
              </div>
            </div>

            <div className="p-6 rounded-2xl bg-card border border-border/70 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">⚠️</span>
                  <h3 className="text-base font-bold text-amber-400">At-Risk Customers</h3>
                </div>
                <Badge variant="warning">45.8% of Base</Badge>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Previously active buyers who have not purchased in over 50 days. Churn risk spikes significantly past day 60.
              </p>
              <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/20 text-xs text-amber-400 font-medium">
                💡 Action: Trigger automated 3-touch win-back drip with personalized 15% discount code.
              </div>
            </div>

            <div className="p-6 rounded-2xl bg-card border border-border/70 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">❄️</span>
                  <h3 className="text-base font-bold text-gray-400">Hibernating Accounts</h3>
                </div>
                <Badge variant="outline">23.3% of Base</Badge>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Dormant for over 240 days with single historical purchases. Continuous high-frequency emails harm deliverability.
              </p>
              <div className="p-3 rounded-lg bg-gray-500/10 border border-gray-500/20 text-xs text-gray-300 font-medium">
                💡 Action: Send final clearance reactivation incentive; automatically sunset unengaged accounts.
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Final Call to Action */}
      <section className="py-24 border-t border-border/60 text-center relative overflow-hidden">
        <div className="max-w-4xl mx-auto px-6 space-y-6 relative z-10">
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-foreground">
            Ready to Segment Your Customer Base?
          </h2>
          <p className="text-sm text-muted-foreground max-w-xl mx-auto">
            Upload your transaction table or test with our pre-loaded online retail demo in under 60 seconds.
          </p>
          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link href="/signup">
              <Button size="lg" variant="primary" className="text-sm font-semibold h-11 px-8">
                Get Started Free <ArrowRight className="w-4 h-4 ml-1.5" />
              </Button>
            </Link>
            <Link href="/onboarding/setup">
              <Button size="lg" variant="outline" className="text-sm h-11 px-8">
                Explore Demo
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/60 py-12 bg-muted/20 text-xs text-muted-foreground">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded bg-primary flex items-center justify-center text-primary-foreground font-black text-xs">
              S
            </div>
            <span className="font-bold text-foreground">SegmentIQ</span>
            <span>— Intelligent Customer Intelligence SaaS</span>
          </div>

          <div className="flex items-center gap-6">
            <Link href="/dashboard" className="hover:text-foreground transition-colors">
              Dashboard
            </Link>
            <Link href="/datasets" className="hover:text-foreground transition-colors">
              Datasets
            </Link>
            <Link href="/models" className="hover:text-foreground transition-colors">
              Models
            </Link>
            <Link href="https://github.com" target="_blank" className="hover:text-foreground transition-colors">
              GitHub
            </Link>
          </div>

          <p>© {new Date().getFullYear()} SegmentIQ. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
