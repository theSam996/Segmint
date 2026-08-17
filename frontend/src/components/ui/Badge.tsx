import * as React from "react";
import { cn } from "@/lib/utils";

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "secondary" | "outline" | "success" | "warning" | "danger" | "purple";
}

export function Badge({
  className,
  variant = "default",
  ...props
}: BadgeProps) {
  const variantStyles = {
    default: "border-transparent bg-primary text-primary-foreground",
    secondary: "border-transparent bg-secondary text-secondary-foreground",
    outline: "border-border text-foreground",
    success: "border-emerald-500/20 bg-emerald-500/10 text-emerald-500 dark:text-emerald-400",
    warning: "border-amber-500/20 bg-amber-500/10 text-amber-500 dark:text-amber-400",
    danger: "border-rose-500/20 bg-rose-500/10 text-rose-500 dark:text-rose-400",
    purple: "border-purple-500/20 bg-purple-500/10 text-purple-500 dark:text-purple-400",
  };

  return (
    <div
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
        variantStyles[variant],
        className
      )}
      {...props}
    />
  );
}
