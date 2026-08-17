import React from "react";
import Link from "next/link";
import { ArrowRight, Lightbulb, CheckCircle2 } from "lucide-react";
import { Recommendation } from "@/types/segment";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { formatNumber } from "@/lib/utils";

export function RecommendationCard({ rec }: { rec: Recommendation }) {
  const priorityVariant = {
    urgent: "danger" as const,
    high: "warning" as const,
    medium: "purple" as const,
    low: "secondary" as const,
  };

  return (
    <div className="p-4 rounded-xl bg-card border border-border/70 hover:border-border transition-all space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-xl">{rec.segmentIcon}</span>
          <div>
            <h4 className="text-xs font-bold text-foreground">{rec.segmentName}</h4>
            <span className="text-[10px] text-muted-foreground">
              {formatNumber(rec.customerCount)} customers targeted
            </span>
          </div>
        </div>
        <Badge variant={priorityVariant[rec.priority]} className="text-[10px] uppercase">
          {rec.priority} Priority
        </Badge>
      </div>

      <div className="space-y-1">
        <p className="text-xs font-semibold text-foreground">{rec.title}</p>
        <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2">
          {rec.recommendedAction}
        </p>
      </div>

      {rec.suggestedOffer && (
        <div className="p-2.5 rounded-lg bg-muted/30 border border-border/40 text-[11px] text-muted-foreground">
          <strong className="text-foreground">Suggested Offer: </strong>
          {rec.suggestedOffer}
        </div>
      )}

      <div className="flex items-center justify-between pt-1 border-t border-border/40 text-xs">
        <Link
          href={`/segments/${rec.segmentId}`}
          className="text-primary hover:underline font-medium text-[11px] flex items-center gap-1"
        >
          View Segment Strategy <ArrowRight className="w-3 h-3" />
        </Link>
        <Link href="/customers">
          <Button size="sm" variant="outline" className="text-[11px] h-7 px-2.5">
            Filter Audience
          </Button>
        </Link>
      </div>
    </div>
  );
}
