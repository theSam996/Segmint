"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, Building, Sparkles } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/Card";
import { INDUSTRIES } from "@/lib/constants";

export default function OnboardingPage() {
  const router = useRouter();
  const { createWorkspace } = useAuth();

  const [workspaceName, setWorkspaceName] = useState("Acme Analytics");
  const [industry, setIndustry] = useState("ecommerce");

  const handleContinue = (e: React.FormEvent) => {
    e.preventDefault();
    if (!workspaceName) return;
    createWorkspace(workspaceName, industry);
    router.push("/onboarding/setup");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4 py-12 relative overflow-hidden">
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-96 h-96 bg-primary/10 blur-[100px] rounded-full pointer-events-none" />

      <div className="w-full max-w-lg space-y-6 relative z-10">
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-semibold uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5" /> Step 1 of 2
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
            Welcome to SegmentIQ
          </h1>
          <p className="text-xs text-muted-foreground max-w-md mx-auto">
            Set up your organization workspace to begin ingesting transaction data and generating behavioral customer cohorts.
          </p>
        </div>

        <Card className="border-border/80 shadow-xl bg-card/95 backdrop-blur-md">
          <CardHeader className="text-left pb-4">
            <CardTitle className="text-base font-bold">Workspace Configuration</CardTitle>
            <CardDescription className="text-xs">
              This will be your central hub for datasets, segment models, and team access.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleContinue} className="space-y-4">
              <div className="space-y-1.5 text-left">
                <label className="text-xs font-semibold text-foreground">
                  Workspace Name
                </label>
                <Input
                  type="text"
                  value={workspaceName}
                  onChange={(e) => setWorkspaceName(e.target.value)}
                  placeholder="e.g. Acme Commerce"
                  icon={<Building className="w-4 h-4" />}
                  required
                />
              </div>

              <div className="space-y-1.5 text-left">
                <label className="text-xs font-semibold text-foreground">
                  Primary Industry
                </label>
                <Select
                  value={industry}
                  onChange={(e) => setIndustry(e.target.value)}
                  options={INDUSTRIES}
                />
              </div>

              <Button
                type="submit"
                variant="primary"
                className="w-full h-10 text-sm font-semibold mt-4 shadow-sm"
              >
                Continue to Ingestion Setup <ArrowRight className="w-4 h-4 ml-1.5" />
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
