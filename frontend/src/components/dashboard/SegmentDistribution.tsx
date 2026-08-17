"use client";

import React from "react";
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
} from "recharts";
import { Segment } from "@/types/segment";
import { formatNumber, formatPercent } from "@/lib/utils";

export function SegmentDistribution({ segments }: { segments: Segment[] }) {
  const data = segments.map((s) => ({
    name: s.name,
    value: s.customerCount,
    color: s.color,
    pct: s.pctOfBase,
  }));

  return (
    <div className="space-y-4">
      <div className="h-56 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              innerRadius={55}
              outerRadius={80}
              paddingAngle={3}
              dataKey="value"
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} stroke="transparent" />
              ))}
            </Pie>
            <Tooltip
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  const item = payload[0].payload;
                  return (
                    <div className="rounded-lg border border-border bg-card p-2.5 shadow-md text-xs">
                      <p className="font-bold text-foreground">{item.name}</p>
                      <p className="text-muted-foreground mt-0.5">
                        {formatNumber(item.value)} customers ({formatPercent(item.pct)})
                      </p>
                    </div>
                  );
                }
                return null;
              }}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>

      {/* Segment Legend List */}
      <div className="space-y-2 border-t border-border/40 pt-3">
        {segments.map((s) => (
          <div key={s.id} className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <span
                className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                style={{ backgroundColor: s.color }}
              />
              <span className="font-medium text-foreground truncate max-w-[150px]">
                {s.name}
              </span>
            </div>
            <div className="flex items-center gap-3 text-muted-foreground">
              <span>{formatNumber(s.customerCount)}</span>
              <span className="font-semibold text-foreground w-10 text-right">
                {formatPercent(s.pctOfBase)}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
