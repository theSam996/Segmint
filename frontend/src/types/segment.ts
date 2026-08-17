export interface Segment {
  id: string;
  clusterId: number;
  name: string;
  icon: string;
  color: string;
  description: string;
  customerCount: number;
  pctOfBase: number;
  totalRevenue: number;
  pctOfRevenue: number;
  avgRecency: number;
  avgFrequency: number;
  avgMonetary: number;
  rLevel: "low" | "medium" | "high";
  fLevel: "low" | "medium" | "high";
  mLevel: "low" | "medium" | "high";
  behavior: string;
  recommendedStrategy: string;
  recommendedAction: string;
  priority: "critical" | "high" | "medium" | "low";
  channelRecommendation?: string;
  keyTactics?: string[];
}

export interface Recommendation {
  id: string;
  segmentId: string;
  segmentName: string;
  segmentIcon: string;
  segmentColor: string;
  category: "retention" | "loyalty" | "reactivation" | "upsell" | "cross_sell";
  customerCount: number;
  revenueImpactEstimate?: number;
  title: string;
  reason: string;
  recommendedAction: string;
  priority: "urgent" | "high" | "medium" | "low";
  suggestedOffer?: string;
}
