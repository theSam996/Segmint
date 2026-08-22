"use client";

import React, { useState } from "react";
import {
  ResponsiveContainer,
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  ZAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";
import { PCAPoint } from "@/types/analytics";
import { formatCurrency, formatDays, formatNumber } from "@/lib/utils";
import { MOCK_PCA_DATA } from "@/lib/mock-data/analytics";

interface PCAChartProps {
  points?: PCAPoint[];
  explainedVarianceRatio?: [number, number];
  totalExplainedVariance?: number;
}

export function PCAChart({
  points,
  explainedVarianceRatio = [0.725, 0.212],
  totalExplainedVariance = 0.937,
}: PCAChartProps) {
  const [algorithm, setAlgorithm] = useState<"kmeans" | "dbscan">("kmeans");

  const safePoints = points && points.length > 0 ? points : MOCK_PCA_DATA.points;

  // Group data by cluster for color-coded rendering
  const kMeansGroup1 = safePoints.filter((p) => p.kmeansCluster === 1);
  const kMeansGroup0 = safePoints.filter((p) => p.kmeansCluster === 0);
  const kMeansGroup2 = safePoints.filter((p) => p.kmeansCluster === 2);

  const dbscanCore = safePoints.filter((p) => p.dbscanCluster !== -1);
  const dbscanNoise = safePoints.filter((p) => p.dbscanCluster === -1);

  return (
    <div className="space-y-4">
      {/* Top Controls & Variance Notice */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-muted-foreground">Cluster View:</span>
          <div className="inline-flex rounded-lg border border-border bg-muted/40 p-0.5 text-xs">
            <button
              onClick={() => setAlgorithm("kmeans")}
              className={`px-2.5 py-1 rounded-md font-medium transition-all ${
                algorithm === "kmeans"
                  ? "bg-card text-foreground font-semibold shadow-xs"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              K-Means (k=3)
            </button>
            <button
              onClick={() => setAlgorithm("dbscan")}
              className={`px-2.5 py-1 rounded-md font-medium transition-all ${
                algorithm === "dbscan"
                  ? "bg-card text-foreground font-semibold shadow-xs"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              DBSCAN (Density & Noise)
            </button>
          </div>
        </div>

        <div className="text-[11px] text-muted-foreground font-medium">
          Explained Variance:{" "}
          <strong className="text-foreground">
            {(totalExplainedVariance * 100).toFixed(1)}%
          </strong>{" "}
          (PC1: {(explainedVarianceRatio[0] * 100).toFixed(1)}%, PC2:{" "}
          {(explainedVarianceRatio[1] * 100).toFixed(1)}%)
        </div>
      </div>

      {/* Recharts 2D Scatter Map */}
      <div className="h-72 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <ScatterChart margin={{ top: 10, right: 10, bottom: 20, left: 10 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(150, 150, 150, 0.1)" />
            <XAxis
              type="number"
              dataKey="pc1"
              name="PC1 (Volume & Spend)"
              stroke="#888888"
              fontSize={11}
              tickLine={false}
              axisLine={{ stroke: "rgba(150,150,150,0.2)" }}
            />
            <YAxis
              type="number"
              dataKey="pc2"
              name="PC2 (Recency vs Dormancy)"
              stroke="#888888"
              fontSize={11}
              tickLine={false}
              axisLine={{ stroke: "rgba(150,150,150,0.2)" }}
            />
            <ZAxis range={[50, 50]} />
            <Tooltip
              cursor={{ strokeDasharray: "3 3" }}
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  const data: PCAPoint = payload[0].payload;
                  return (
                    <div className="rounded-xl border border-border bg-card p-3 shadow-lg text-xs space-y-1.5 min-w-[200px]">
                      <div className="flex items-center justify-between border-b border-border/40 pb-1">
                        <span className="font-bold text-foreground font-mono">
                          Customer #{data.customerId}
                        </span>
                        <span
                          className="px-1.5 py-0.5 rounded text-[10px] font-bold"
                          style={{
                            backgroundColor: `${data.segmentColor}20`,
                            color: data.segmentColor,
                          }}
                        >
                          {data.segmentName}
                        </span>
                      </div>
                      <div className="grid grid-cols-3 gap-2 text-[10px] pt-1">
                        <div>
                          <span className="text-muted-foreground block">Recency</span>
                          <span className="font-semibold text-foreground">
                            {formatDays(data.recency)}
                          </span>
                        </div>
                        <div>
                          <span className="text-muted-foreground block">Orders</span>
                          <span className="font-semibold text-foreground">
                            {formatNumber(data.frequency)}
                          </span>
                        </div>
                        <div>
                          <span className="text-muted-foreground block">Spend</span>
                          <span className="font-semibold text-emerald-500">
                            {formatCurrency(data.monetary)}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                }
                return null;
              }}
            />

            {algorithm === "kmeans" && (
              <Scatter name="Loyal High Spenders" data={kMeansGroup1} fill="#3b82f6" />
            )}
            {algorithm === "kmeans" && (
              <Scatter name="At-Risk Customers" data={kMeansGroup0} fill="#f59e0b" />
            )}
            {algorithm === "kmeans" && (
              <Scatter name="Hibernating Accounts" data={kMeansGroup2} fill="#9ca3af" />
            )}

            {algorithm === "dbscan" && (
              <Scatter name="Core Density Clusters" data={dbscanCore} fill="#8b5cf6" />
            )}
            {algorithm === "dbscan" && (
              <Scatter name="Noise / Outliers (-1)" data={dbscanNoise} fill="#ef4444" shape="cross" />
            )}
          </ScatterChart>
        </ResponsiveContainer>
      </div>

      {/* Legend Note */}
      <div className="flex flex-wrap items-center justify-between text-xs text-muted-foreground pt-1 border-t border-border/40">
        <div className="flex items-center gap-4">
          {algorithm === "kmeans" ? (
            <>
              <span className="inline-flex items-center gap-1.5 text-blue-400">
                <span className="w-2 h-2 rounded-full bg-blue-500" /> Loyal High Spenders
              </span>
              <span className="inline-flex items-center gap-1.5 text-amber-400">
                <span className="w-2 h-2 rounded-full bg-amber-500" /> At-Risk
              </span>
              <span className="inline-flex items-center gap-1.5 text-gray-400">
                <span className="w-2 h-2 rounded-full bg-gray-500" /> Hibernating
              </span>
            </>
          ) : (
            <>
              <span className="inline-flex items-center gap-1.5 text-purple-400">
                <span className="w-2 h-2 rounded-full bg-purple-500" /> Core Clusters (Dense)
              </span>
              <span className="inline-flex items-center gap-1.5 text-rose-400">
                <span className="w-2 h-2 rounded-full bg-rose-500" /> Noise Outliers (-1)
              </span>
            </>
          )}
        </div>
        <span className="text-[11px]">Click or hover points to inspect accounts</span>
      </div>
    </div>
  );
}
