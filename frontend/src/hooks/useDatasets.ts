"use client";

import { useState, useEffect, useCallback } from "react";
import { Dataset } from "@/types/dataset";
import { api } from "@/lib/api";

export function useDatasets() {
  const [datasets, setDatasets] = useState<Dataset[]>([]);
  const [selectedDataset, setSelectedDataset] = useState<Dataset | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDatasets = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await api.getDatasets();
      setDatasets(data);
      if (data.length > 0 && !selectedDataset) {
        setSelectedDataset(data[0]);
      }
    } catch (err: any) {
      setError(err.message || "Failed to load datasets");
    } finally {
      setIsLoading(false);
    }
  }, [selectedDataset]);

  useEffect(() => {
    fetchDatasets();
  }, [fetchDatasets]);

  return {
    datasets,
    selectedDataset,
    setSelectedDataset,
    isLoading,
    error,
    refresh: fetchDatasets,
  };
}
