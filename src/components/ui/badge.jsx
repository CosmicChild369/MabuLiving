import React from "react";
import { cn } from "@/lib/utils";

export function Badge({ className, variant = "default", ...props }) {
  const styles = variant === "outline" ? "border border-slate-200 bg-white" : "bg-slate-900 text-white";
  return <span className={cn("inline-flex items-center rounded-full px-2 py-0.5 text-xs", styles, className)} {...props} />;
}
