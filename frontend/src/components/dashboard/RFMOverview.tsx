"use client";

import React, { useState } from "react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";
import { RFMDistributionData } from "@/types/analytics";
import { formatNumber } from "@/lib/utils";

export function RFMOverview({ data }: { data: RFMDistributionData }) {
  const [metric, setMetric] = useState<"recency" | "frequency" | "monetary">("recency");

  const chartData =
    metric === "recency"
      ? data.recencyBins
      : metric === "frequency"
      ? data.frequencyBins
      : data.monetaryBins;

  const metricColors = {
    recency: "#f59e0b",
    frequency: "#8b5cf6",
    monetary: "#10b981",
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold text-muted-foreground">Select Distribution:</span>
        <div className="inline-flex rounded-lg border border-border bg-muted/40 p-0.5 text-xs">
          <button
            onClick={() => setMetric("recency")}
            className={`px-2.5 py-1 rounded-md font-medium transition-all ${
              metric === "recency"
                ? "bg-card text-amber-500 font-semibold shadow-xs"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Recency
          </button>
          <button
            onClick={() => setMetric("frequency")}
            className={`px-2.5 py-1 rounded-md font-medium transition-all ${
              metric === "frequency"
                ? "bg-card text-purple-400 font-semibold shadow-xs"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Frequency
          </button>
          <button
            onClick={() => setMetric("monetary")}
            className={`px-2.5 py-1 rounded-md font-medium transition-all ${
              metric === "monetary"
                ? "bg-card text-emerald-400 font-semibold shadow-xs"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Monetary
          </button>
        </div>
      </div>

      <div className="h-52 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} margin={{ top: 10, right: 10, bottom: 20, left: -10 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(150, 150, 150, 0.1)" />
            <XAxis
              dataKey="range"
              stroke="#888888"
              fontSize={11}
              tickLine={false}
              axisLine={{ stroke: "rgba(150,150,150,0.2)" }}
            />
            <YAxis
              stroke="#888888"
              fontSize={11}
              tickLine={false}
              axisLine={{ stroke: "rgba(150,150,150,0.2)" }}
            />
            <Tooltip
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  const item = payload[0].payload;
                  return (
                    <div className="rounded-lg border border-border bg-card p-2.5 shadow-md text-xs">
                      <p className="font-bold text-foreground">{item.range}</p>
                      <p className="text-muted-foreground mt-0.5">
                        {formatNumber(item.count)} customers
                      </p>
                    </div>
                  );
                }
                return null;
              }}
            />
            <Bar dataKey="count" fill={metricColors[metric]} radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="grid grid-cols-3 gap-3 pt-2 border-t border-border/40 text-center">
        <div className="p-2 rounded-lg bg-muted/20">
          <span className="text-[10px] text-muted-foreground uppercase block">Avg Recency</span>
          <span className="text-xs font-bold text-foreground">
            {data.summary.avgRecency.toFixed(1)} days
          </span>
        </div>
        <div className="p-2 rounded-lg bg-muted/20">
          <span className="text-[10px] text-muted-foreground uppercase block">Avg Frequency</span>
          <span className="text-xs font-bold text-foreground">
            {data.summary.avgFrequency.toFixed(1)} orders
          </span>
        </div>
        <div className="p-2 rounded-lg bg-muted/20">
          <span className="text-[10px] text-muted-foreground uppercase block">Avg Spend</span>
          <span className="text-xs font-bold text-emerald-400">
            ${data.summary.avgMonetary.toFixed(0)}
          </span>
        </div>
      </div>
    </div>
  );
}
