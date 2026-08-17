"use client";

import { useState, useEffect } from "react";
import {
  RFMDistributionData,
  KMeansEvaluation,
  PCAData,
  ModelComparisonData,
} from "@/types/analytics";
import { api } from "@/lib/api";

export function useAnalytics() {
  const [rfmData, setRfmData] = useState<RFMDistributionData | null>(null);
  const [kmeansData, setKmeansData] = useState<KMeansEvaluation | null>(null);
  const [pcaData, setPcaData] = useState<PCAData | null>(null);
  const [comparisonData, setComparisonData] = useState<ModelComparisonData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setIsLoading(true);
    Promise.all([
      api.getRFMAnalytics(),
      api.getKMeansAnalytics(),
      api.getPCAAnalytics(),
      api.getModelComparison(),
    ])
      .then(([rfm, kmeans, pca, comparison]) => {
        setRfmData(rfm);
        setKmeansData(kmeans);
        setPcaData(pca);
        setComparisonData(comparison);
      })
      .catch((err) => setError(err.message || "Failed to load analytics data"))
      .finally(() => setIsLoading(false));
  }, []);

  return {
    rfmData,
    kmeansData,
    pcaData,
    comparisonData,
    isLoading,
    error,
  };
}
