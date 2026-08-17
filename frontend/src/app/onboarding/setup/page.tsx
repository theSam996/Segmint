"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { UploadCloud, Zap, ArrowRight, Sparkles, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { api } from "@/lib/api";

export default function OnboardingSetupPage() {
  const router = useRouter();
  const [loadingDemo, setLoadingDemo] = useState(false);

  const handleUseDemo = async () => {
    setLoadingDemo(true);
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
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-96 h-96 bg-primary/10 blur-[100px] rounded-full pointer-events-none" />

      <div className="w-full max-w-2xl space-y-8 relative z-10 text-center">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-semibold uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5" /> Step 2 of 2
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
            How would you like to get started?
          </h1>
          <p className="text-xs text-muted-foreground max-w-md mx-auto">
            Choose whether to upload your company's transaction records or explore SegmentIQ with pre-loaded demo data.
          </p>
        </div>

        {/* 2 Major Options Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 text-left">
          {/* Option 1: Upload Your Data */}
          <Card className="hover:border-primary/50 transition-all cursor-pointer group flex flex-col justify-between p-6">
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-xl bg-primary/10 border border-primary/20 text-primary flex items-center justify-center group-hover:scale-105 transition-transform">
                <UploadCloud className="w-6 h-6" />
              </div>
              <div className="space-y-1.5">
                <h3 className="text-base font-bold text-foreground">Upload Your Data</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Analyze your own customer transaction table (CSV or Excel). Automated column mapping & schema validation included.
                </p>
              </div>
              <ul className="text-xs text-muted-foreground space-y-1.5 pt-1">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" /> Supports CSV / XLSX
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" /> Interactive column mapper
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" /> Data quality audit report
                </li>
              </ul>
            </div>

            <div className="pt-6">
              <Button
                variant="outline"
                onClick={() => router.push("/datasets/new")}
                className="w-full text-xs font-semibold h-9"
              >
                Upload Dataset <ArrowRight className="w-3.5 h-3.5 ml-1" />
              </Button>
            </div>
          </Card>

          {/* Option 2: Explore Demo */}
          <Card className="border-primary/40 bg-gradient-to-b from-primary/5 to-transparent hover:border-primary/60 transition-all cursor-pointer group flex flex-col justify-between p-6 relative">
            <div className="absolute top-4 right-4">
              <Badge variant="purple" className="text-[10px]">
                Recommended
              </Badge>
            </div>

            <div className="space-y-4">
              <div className="w-12 h-12 rounded-xl bg-purple-500/15 border border-purple-500/30 text-purple-400 flex items-center justify-center group-hover:scale-105 transition-transform">
                <Zap className="w-6 h-6" />
              </div>
              <div className="space-y-1.5">
                <h3 className="text-base font-bold text-foreground">Explore Demo</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Test-drive SegmentIQ using the standard UCI Online Retail dataset (540,000+ transaction lines across 4,338 customers).
                </p>
              </div>
              <ul className="text-xs text-muted-foreground space-y-1.5 pt-1">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" /> Pre-computed RFM metrics
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" /> K-Means & DBSCAN clusters
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" /> Instant dashboard access
                </li>
              </ul>
            </div>

            <div className="pt-6">
              <Button
                variant="primary"
                onClick={handleUseDemo}
                isLoading={loadingDemo}
                className="w-full text-xs font-semibold h-9 shadow-sm"
              >
                Use Demo Data <ArrowRight className="w-3.5 h-3.5 ml-1" />
              </Button>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
