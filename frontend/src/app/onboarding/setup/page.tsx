"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { UploadCloud, Zap, ArrowRight, Sparkles, CheckCircle2, FileSpreadsheet, Database } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/Button";
import { Card, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { api } from "@/lib/api";

export default function OnboardingSetupPage() {
  const router = useRouter();
  const { completeOnboarding, workspace } = useAuth();
  const [loadingDemo, setLoadingDemo] = useState(false);

  const handleUploadDataset = () => {
    completeOnboarding();
    router.push("/datasets/new");
  };

  const handleUseDemo = async () => {
    setLoadingDemo(true);
    completeOnboarding();
    try {
      await api.runAnalysis("demo-uci-retail", "demo");
      router.push("/dashboard");
    } catch {
      router.push("/dashboard");
    } finally {
      setLoadingDemo(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4 py-12 relative overflow-hidden">
      {/* Ambient background glows */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[34rem] h-[34rem] bg-primary/10 blur-[130px] rounded-full pointer-events-none" />
      <div className="absolute bottom-10 left-1/4 w-80 h-80 bg-purple-500/10 blur-[110px] rounded-full pointer-events-none" />

      <div className="w-full max-w-2xl space-y-8 relative z-10 text-center">
        {/* Header & Step Indicator */}
        <div className="space-y-3">
          <Link href="/" className="inline-flex items-center gap-2.5 mx-auto">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-primary to-purple-400 flex items-center justify-center text-primary-foreground font-black text-lg shadow-md">
              S
            </div>
            <span className="font-extrabold text-2xl tracking-tight text-foreground">
              SegmentIQ
            </span>
          </Link>

          <div className="pt-1">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-bold uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5" /> Getting Started • Step 2 of 2
            </div>
          </div>

          <div className="space-y-1 pt-1">
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-foreground">
              How would you like to start?
            </h1>
            <p className="text-xs sm:text-sm text-muted-foreground max-w-md mx-auto">
              Initialize <strong className="text-foreground">{workspace?.name || "your workspace"}</strong> with your own customer records or test-drive with pre-loaded demo data.
            </p>
          </div>
        </div>

        {/* 2 Options Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 text-left">
          {/* Card 1: Upload your dataset */}
          <Card className="hover:border-primary/50 transition-all duration-200 cursor-pointer group flex flex-col justify-between p-6 bg-card/95 backdrop-blur-md shadow-xl border-border/80 relative">
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-xl bg-primary/10 border border-primary/20 text-primary flex items-center justify-center group-hover:scale-105 transition-transform shadow-xs">
                <UploadCloud className="w-6 h-6" />
              </div>

              <div className="space-y-1">
                <h3 className="text-base font-bold text-foreground">
                  Upload your dataset
                </h3>
                <p className="text-xs text-muted-foreground font-medium">
                  Analyze your own customers
                </p>
              </div>

              <p className="text-[11px] text-muted-foreground leading-relaxed pt-1">
                Upload raw transaction-level CSV or Excel tables. Automatic column mapping and schema validation included.
              </p>

              <ul className="text-xs text-muted-foreground space-y-2 pt-2 border-t border-border/40">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
                  <span>Supports CSV & XLSX exports</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
                  <span>Smart schema & column auto-detection</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
                  <span>Full RFM, K-Means & DBSCAN pipeline</span>
                </li>
              </ul>
            </div>

            <div className="pt-6">
              <Button
                variant="outline"
                onClick={handleUploadDataset}
                className="w-full text-xs font-bold h-10 border-border/80 hover:bg-secondary flex items-center justify-center gap-1.5 shadow-xs"
              >
                <FileSpreadsheet className="w-3.5 h-3.5" /> Upload Dataset
              </Button>
            </div>
          </Card>

          {/* Card 2: Explore demo */}
          <Card className="border-primary/50 bg-gradient-to-b from-primary/10 via-card/95 to-card/95 hover:border-primary/70 transition-all duration-200 cursor-pointer group flex flex-col justify-between p-6 shadow-xl relative">
            <div className="absolute top-4 right-4">
              <Badge variant="purple" className="text-[10px] shadow-xs">
                Recommended
              </Badge>
            </div>

            <div className="space-y-4">
              <div className="w-12 h-12 rounded-xl bg-purple-500/20 border border-purple-500/30 text-purple-400 flex items-center justify-center group-hover:scale-105 transition-transform shadow-xs">
                <Zap className="w-6 h-6" />
              </div>

              <div className="space-y-1">
                <h3 className="text-base font-bold text-foreground">
                  Explore demo
                </h3>
                <p className="text-xs text-muted-foreground font-medium">
                  Try the platform with demo data
                </p>
              </div>

              <p className="text-[11px] text-muted-foreground leading-relaxed pt-1">
                Instant full-scale access with 540k+ transactions and 4,338 customers from the UCI Online Retail dataset.
              </p>

              <ul className="text-xs text-muted-foreground space-y-2 pt-2 border-t border-border/40">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
                  <span>540,000+ transaction lines pre-loaded</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
                  <span>Pre-computed RFM & 2D PCA charts</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
                  <span>Ready-to-use retention playbooks</span>
                </li>
              </ul>
            </div>

            <div className="pt-6">
              <Button
                variant="primary"
                onClick={handleUseDemo}
                isLoading={loadingDemo}
                className="w-full text-xs font-bold h-10 shadow-md flex items-center justify-center gap-1.5"
              >
                <Database className="w-3.5 h-3.5" /> Use Demo <ArrowRight className="w-3.5 h-3.5 ml-0.5" />
              </Button>
            </div>
          </Card>
        </div>

        <p className="text-[11px] text-muted-foreground">
          You can always upload new datasets or switch between workspaces later from the top navigation bar.
        </p>
      </div>
    </div>
  );
}
