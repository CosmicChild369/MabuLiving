import React from "react";
import { cn } from "@/lib/utils";

export function Card({ className, ...props }) {
  return <div className={cn("rounded-lg border bg-white", className)} {...props} />;
}

export function CardHeader({ className, ...props }) {
  return <div className={cn("p-4", className)} {...props} />;
}

export function CardTitle({ className, ...props }) {
  return <h3 className={cn("font-semibold", className)} {...props} />;
}

export function CardContent({ className, ...props }) {
  return <div className={cn("p-4 pt-0", className)} {...props} />;
}
