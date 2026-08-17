export type AnalysisStage =
  | "upload"
  | "validation"
  | "cleaning"
  | "total_price"
  | "rfm"
  | "preprocessing"
  | "kmeans"
  | "dbscan"
  | "pca"
  | "labeling"
  | "recommendations"
  | "completed"
  | "failed";

export interface PipelineStep {
  id: string;
  name: string;
  description: string;
  status: "pending" | "running" | "completed" | "failed";
  progress?: number;
  durationSeconds?: number;
}

export interface AnalysisRun {
  id: string;
  datasetId: string;
  datasetName: string;
  status: "running" | "completed" | "failed";
  currentStage: AnalysisStage;
  progressPct: number;
  startTime: string;
  endTime?: string;
  durationSeconds?: number;
  steps: PipelineStep[];
  error?: string;
  summary?: {
    customersAnalyzed: number;
    segmentsDiscovered: number;
    silhouetteScore: number;
    pcaVariance: number;
  };
}
