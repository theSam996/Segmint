"use client";

import { useState, useEffect, useCallback } from "react";
import { AnalysisRun } from "@/types/analysis";
import { api } from "@/lib/api";

export function useAnalysis(runId?: string) {
  const [analysisRun, setAnalysisRun] = useState<AnalysisRun | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchStatus = useCallback(async () => {
    if (!runId) return;
    try {
      const data = await api.getAnalysisStatus(runId);
      setAnalysisRun(data);
    } catch (err: any) {
      setError(err.message || "Failed to fetch analysis status");
    }
  }, [runId]);

  useEffect(() => {
    if (!runId) return;
    fetchStatus();
    const interval = setInterval(fetchStatus, 2000);
    return () => clearInterval(interval);
  }, [runId, fetchStatus]);

  const triggerRun = async (datasetId: string, source: "demo" | "custom" = "demo") => {
    setIsLoading(true);
    setError(null);
    try {
      const run = await api.runAnalysis(datasetId, source);
      setAnalysisRun(run);
      return run;
    } catch (err: any) {
      setError(err.message || "Failed to trigger analysis run");
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    analysisRun,
    isLoading,
    error,
    triggerRun,
    refresh: fetchStatus,
  };
}
