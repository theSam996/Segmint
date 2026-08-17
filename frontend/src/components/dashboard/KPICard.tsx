import React from "react";
import { Card, CardContent } from "@/components/ui/Card";
import { cn } from "@/lib/utils";

interface KPICardProps {
  label: string;
  value: string;
  subtext?: string;
  change?: string;
  isPositive?: boolean;
  icon: React.ElementType;
  iconColor?: string;
  className?: string;
}

export function KPICard({
  label,
  value,
  subtext,
  change,
  isPositive = true,
  icon: Icon,
  iconColor = "text-primary",
  className,
}: KPICardProps) {
  return (
    <Card className={cn("relative overflow-hidden transition-all hover:border-border", className)}>
      <CardContent className="p-5">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            {label}
          </span>
          <div className={cn("p-2 rounded-lg bg-muted/40", iconColor)}>
            <Icon className="w-4 h-4" />
          </div>
        </div>

        <div className="mt-2.5">
          <h3 className="text-2xl font-extrabold tracking-tight text-foreground">
            {value}
          </h3>
          <div className="flex items-center gap-1.5 mt-1 text-xs">
            {change && (
              <span
                className={cn(
                  "font-bold text-[11px] px-1.5 py-0.5 rounded",
                  isPositive
                    ? "bg-emerald-500/10 text-emerald-500"
                    : "bg-rose-500/10 text-rose-500"
                )}
              >
                {change}
              </span>
            )}
            {subtext && (
              <span className="text-muted-foreground truncate">{subtext}</span>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
