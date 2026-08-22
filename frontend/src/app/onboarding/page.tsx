"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowRight, Building2, Sparkles, Briefcase } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/Card";
import { INDUSTRIES } from "@/lib/constants";

export default function OnboardingPage() {
  const router = useRouter();
  const { createWorkspace, workspace } = useAuth();

  const [workspaceName, setWorkspaceName] = useState(workspace?.name && workspace.name !== "RetailCo Analytics" ? workspace.name : "My Company");
  const [industry, setIndustry] = useState(workspace?.industry || "ecommerce");

  const handleContinue = (e: React.FormEvent) => {
    e.preventDefault();
    if (!workspaceName.trim()) return;
    createWorkspace(workspaceName.trim(), industry);
    router.push("/onboarding/setup");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4 py-12 relative overflow-hidden">
      {/* Background ambient glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[32rem] h-[32rem] bg-primary/10 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-10 right-1/4 w-72 h-72 bg-purple-500/10 blur-[100px] rounded-full pointer-events-none" />

      <div className="w-full max-w-lg space-y-6 relative z-10">
        {/* Brand Logo & Progress Pill */}
        <div className="text-center space-y-3">
          <Link href="/" className="inline-flex items-center gap-2.5 mx-auto">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-primary to-purple-400 flex items-center justify-center text-primary-foreground font-black text-lg shadow-md">
              S
            </div>
            <span className="font-extrabold text-2xl tracking-tight text-foreground">
              SegmentIQ
            </span>
          </Link>

          <div className="pt-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-bold uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5" /> Workspace Setup • Step 1 of 2
            </div>
          </div>

          <div className="space-y-1 pt-1">
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-foreground uppercase">
              WELCOME TO SEGMENTIQ
            </h1>
            <p className="text-sm text-muted-foreground font-medium">
              Let&apos;s set up your workspace.
            </p>
          </div>
        </div>

        {/* Configuration Card */}
        <Card className="border-border/80 shadow-2xl bg-card/95 backdrop-blur-md">
          <CardHeader className="text-left pb-4 border-b border-border/40">
            <CardTitle className="text-base font-bold flex items-center gap-2">
              <Building2 className="w-4 h-4 text-primary" /> Workspace Details
            </CardTitle>
            <CardDescription className="text-xs">
              Configure your organization profile to customize behavioral thresholds and cohort definitions.
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-5">
            <form onSubmit={handleContinue} className="space-y-4">
              <div className="space-y-1.5 text-left">
                <label className="text-xs font-bold text-foreground flex items-center justify-between">
                  <span>Workspace name</span>
                  <span className="text-[10px] text-muted-foreground font-normal">Required</span>
                </label>
                <Input
                  type="text"
                  value={workspaceName}
                  onChange={(e) => setWorkspaceName(e.target.value)}
                  placeholder="My Company"
                  icon={<Building2 className="w-4 h-4 text-muted-foreground" />}
                  className="h-10 text-sm font-medium"
                  required
                  autoFocus
                />
              </div>

              <div className="space-y-1.5 text-left">
                <label className="text-xs font-bold text-foreground flex items-center justify-between">
                  <span>Industry</span>
                  <span className="text-[10px] text-muted-foreground font-normal">Select primary vertical</span>
                </label>
                <Select
                  value={industry}
                  onChange={(e) => setIndustry(e.target.value)}
                  options={INDUSTRIES}
                  className="h-10 text-sm font-medium"
                />
              </div>

              <div className="pt-3">
                <Button
                  type="submit"
                  variant="primary"
                  className="w-full h-11 text-sm font-bold shadow-md flex items-center justify-center gap-2"
                >
                  Continue <ArrowRight className="w-4 h-4" />
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Help text */}
        <p className="text-center text-[11px] text-muted-foreground">
          You can change these workspace settings or invite team members anytime from Settings.
        </p>
      </div>
    </div>
  );
}
