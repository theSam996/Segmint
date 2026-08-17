export interface DistributionBin {
  range: string;
  count: number;
  segmentId?: string;
  segmentName?: string;
}

export interface RFMDistributionData {
  recencyBins: DistributionBin[];
  frequencyBins: DistributionBin[];
  monetaryBins: DistributionBin[];
  summary: {
    avgRecency: number;
    medianRecency: number;
    avgFrequency: number;
    medianFrequency: number;
    avgMonetary: number;
    medianMonetary: number;
    totalMonetary: number;
  };
}

export interface KMeansEvaluation {
  kValues: number[];
  inertias: number[];
  silhouetteScores: number[];
  optimalK: number;
}

export interface PCAPoint {
  customerId: string | number;
  pc1: number;
  pc2: number;
  kmeansCluster: number;
  dbscanCluster: number;
  segmentName: string;
  segmentColor: string;
  monetary: number;
  recency: number;
  frequency: number;
}

export interface PCAData {
  points: PCAPoint[];
  explainedVarianceRatio: [number, number]; // [PC1, PC2]
  totalExplainedVariance: number;
}

export interface AlgorithmMetrics {
  name: string;
  type: string;
  clusterCount: number;
  silhouetteScore?: number;
  inertia?: number;
  noiseCount?: number;
  noisePct?: number;
  outlierHandling: string;
  parameters: Record<string, any>;
  strengths: string[];
  weaknesses: string[];
}

export interface ModelComparisonData {
  kmeans: AlgorithmMetrics;
  dbscan: AlgorithmMetrics;
  contingencyMatrix: Array<{
    kmeansCluster: number;
    dbscanCluster: number;
    count: number;
    segmentName: string;
  }>;
  noiseAnalysis: {
    totalNoiseCustomers: number;
    noisePct: number;
    avgRecency: number;
    avgFrequency: number;
    avgMonetary: number;
    findings: string[];
  };
  recommendation: string;
}
