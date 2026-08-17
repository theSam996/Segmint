import React from "react";
import { Sparkles, TrendingUp, AlertTriangle, CheckCircle } from "lucide-react";
import { Card, CardContent } from "@/components/ui/Card";

export function InsightCard() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <div className="p-4 rounded-xl bg-blue-500/10 border border-blue-500/20 space-y-1.5">
        <div className="flex items-center gap-2 text-blue-400 font-bold text-xs">
          <TrendingUp className="w-4 h-4" />
          <span>High Revenue Concentration</span>
        </div>
        <p className="text-xs text-muted-foreground leading-relaxed">
          <strong className="text-foreground">30.9%</strong> of customers generate{" "}
          <strong className="text-blue-400">81.0%</strong> ($7.2M) of your total gross revenue.
        </p>
      </div>

      <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 space-y-1.5">
        <div className="flex items-center gap-2 text-amber-400 font-bold text-xs">
          <AlertTriangle className="w-4 h-4" />
          <span>45.8% In Churn Risk Window</span>
        </div>
        <p className="text-xs text-muted-foreground leading-relaxed">
          <strong className="text-foreground">1,986 accounts</strong> average 53 days inactive. Immediate win-back email drip is recommended.
        </p>
      </div>

      <div className="p-4 rounded-xl bg-purple-500/10 border border-purple-500/20 space-y-1.5">
        <div className="flex items-center gap-2 text-purple-400 font-bold text-xs">
          <Sparkles className="w-4 h-4" />
          <span>Optimal K-Means Silhouette</span>
        </div>
        <p className="text-xs text-muted-foreground leading-relaxed">
          Unsupervised clustering achieved <strong className="text-purple-400">0.4199</strong> silhouette score at k=3 with 93.7% PCA variance.
        </p>
      </div>
    </div>
  );
}
