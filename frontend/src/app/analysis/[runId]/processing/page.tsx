"use client";

import { useState, useEffect, Suspense } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  CheckCircle2,
  Clock,
  Sparkles,
  ArrowRight,
  Database,
  Layers,
  Cpu,
  TrendingUp,
  ShieldCheck,
  CheckCircle,
} from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/Card";
import { Progress } from "@/components/ui/Progress";
import { Badge } from "@/components/ui/Badge";
import { useAnalysis } from "@/hooks/useAnalysis";

interface Step {
  id: string;
  name: string;
  desc: string;
}

const PIPELINE_STEPS: Step[] = [
  { id: "s1", name: "Dataset Ingestion", desc: "Loading raw transaction records" },
  { id: "s2", name: "Schema Validation", desc: "Verifying column data types & identifiers" },
  { id: "s3", name: "Data Cleaning", desc: "Filtering cancellations & missing Customer IDs" },
  { id: "s4", name: "TotalPrice Calculation", desc: "Computing line item monetary totals (Qty × UnitPrice)" },
  { id: "s5", name: "RFM Calculation", desc: "Aggregating customer Recency, Frequency, and Monetary" },
  { id: "s6", name: "Preprocessing", desc: "Log1p transformation & StandardScaler normalization" },
  { id: "s7", name: "K-Means Clustering", desc: "Optimizing silhouette score at k=3 centroids" },
  { id: "s8", name: "DBSCAN Clustering", desc: "Analyzing spatial density & isolating whale noise" },
  { id: "s9", name: "PCA Visualization", desc: "Projecting 3D scaled features into 2D (93.7% variance)" },
  { id: "s10", name: "Business Labeling & Recommendations", desc: "Synthesizing plain-English personas & action playbooks" },
];

function ProcessingContent() {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();

  const runId = (params?.runId as string) || "run-demo-001";
  const datasetName = searchParams.get("name") || "UCI Online Retail (Demo)";

  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [isDone, setIsDone] = useState(false);

  useEffect(() => {
    // Smooth step-by-step progression visualizer
    const interval = setInterval(() => {
      setCurrentStepIndex((prev) => {
        if (prev >= PIPELINE_STEPS.length - 1) {
          clearInterval(interval);
          setIsDone(true);
          return PIPELINE_STEPS.length - 1;
        }
        return prev + 1;
      });
    }, 700);

    return () => clearInterval(interval);
  }, []);

  const progress = isDone ? 100 : Math.round(((currentStepIndex + 1) / PIPELINE_STEPS.length) * 100);

  return (
    <AppShell>
      <div className="max-w-3xl mx-auto space-y-6">
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-semibold uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5" /> Pipeline Execution
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
            {isDone ? "Analysis Complete!" : "Analyzing Your Customer Data"}
          </h1>
          <p className="text-xs text-muted-foreground max-w-md mx-auto">
            Dataset: <strong className="text-foreground">{datasetName}</strong> • Run ID: <span className="font-mono">{runId}</span>
          </p>
        </div>

        {/* Progress Card */}
        <Card className="border-border/80 shadow-lg">
          <CardContent className="p-6 space-y-6">
            {/* Top Progress Indicator */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-foreground">
                  {isDone ? "All 10 stages completed successfully" : PIPELINE_STEPS[currentStepIndex].name}
                </span>
                <span className="font-bold text-primary">{progress}%</span>
              </div>
              <Progress value={progress} />
            </div>

            {/* Step Checklist */}
            <div className="space-y-2.5 pt-2 border-t border-border/40">
              {PIPELINE_STEPS.map((step, idx) => {
                const isCompleted = idx < currentStepIndex || isDone;
                const isCurrent = idx === currentStepIndex && !isDone;
                const isPending = idx > currentStepIndex && !isDone;

                return (
                  <div
                    key={step.id}
                    className={`flex items-start justify-between p-3 rounded-lg border text-xs transition-all ${
                      isCompleted
                        ? "bg-emerald-500/5 border-emerald-500/20 text-foreground"
                        : isCurrent
                        ? "bg-primary/10 border-primary/30 text-foreground font-semibold shadow-xs"
                        : "bg-muted/10 border-border/40 text-muted-foreground opacity-60"
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className="mt-0.5 flex-shrink-0">
                        {isCompleted ? (
                          <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                        ) : isCurrent ? (
                          <div className="w-4 h-4 rounded-full border-2 border-primary border-t-transparent animate-spin" />
                        ) : (
                          <div className="w-4 h-4 rounded-full border border-muted-foreground/40" />
                        )}
                      </div>
                      <div>
                        <p className="font-semibold text-foreground">{step.name}</p>
                        <p className="text-[11px] text-muted-foreground">{step.desc}</p>
                      </div>
                    </div>

                    <div>
                      {isCompleted && <Badge variant="success" className="text-[10px]">Complete</Badge>}
                      {isCurrent && <Badge variant="purple" className="text-[10px]">Running...</Badge>}
                      {isPending && <span className="text-[10px] text-muted-foreground">Pending</span>}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Post-Completion Summary Box */}
            {isDone && (
              <div className="p-5 rounded-2xl bg-primary/10 border border-primary/30 space-y-4 text-center animate-in fade-in-50">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-left text-xs">
                  <div className="p-3 rounded-xl bg-card border border-border/40">
                    <span className="text-[10px] text-muted-foreground uppercase font-bold block">Customers</span>
                    <span className="text-base font-extrabold text-foreground">4,338</span>
                  </div>
                  <div className="p-3 rounded-xl bg-card border border-border/40">
                    <span className="text-[10px] text-muted-foreground uppercase font-bold block">Segments</span>
                    <span className="text-base font-extrabold text-purple-400">3 Personas</span>
                  </div>
                  <div className="p-3 rounded-xl bg-card border border-border/40">
                    <span className="text-[10px] text-muted-foreground uppercase font-bold block">Silhouette</span>
                    <span className="text-base font-extrabold text-emerald-400">0.4199</span>
                  </div>
                  <div className="p-3 rounded-xl bg-card border border-border/40">
                    <span className="text-[10px] text-muted-foreground uppercase font-bold block">PCA Variance</span>
                    <span className="text-base font-extrabold text-blue-400">93.7%</span>
                  </div>
                </div>

                <div className="pt-2">
                  <Link href="/dashboard">
                    <Button size="lg" variant="primary" className="text-sm font-semibold h-11 px-8 shadow-md">
                      View Customer Intelligence Dashboard <ArrowRight className="w-4 h-4 ml-1.5" />
                    </Button>
                  </Link>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AppShell>
  );
}

export default function ProcessingPage() {
  return (
    <Suspense fallback={<div className="p-8 text-xs text-muted-foreground">Loading analysis pipeline...</div>}>
      <ProcessingContent />
    </Suspense>
  );
}
