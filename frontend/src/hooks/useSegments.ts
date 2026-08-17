"use client";

import { useState, useEffect } from "react";
import { Segment } from "@/types/segment";
import { api } from "@/lib/api";

export function useSegments() {
  const [segments, setSegments] = useState<Segment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setIsLoading(true);
    api
      .getSegments()
      .then((data) => setSegments(data))
      .catch((err) => setError(err.message || "Failed to load segments"))
      .finally(() => setIsLoading(false));
  }, []);

  return { segments, isLoading, error };
}

export function useSegment(segmentId: string) {
  const [segment, setSegment] = useState<Segment | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!segmentId) return;
    setIsLoading(true);
    api
      .getSegmentById(segmentId)
      .then((data) => setSegment(data))
      .catch((err) => setError(err.message || "Segment not found"))
      .finally(() => setIsLoading(false));
  }, [segmentId]);

  return { segment, isLoading, error };
}
