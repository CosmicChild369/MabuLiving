import React from "react";
import { cn } from "@/lib/utils";

export function Button({ className, variant = "default", size = "default", ...props }) {
  const variants = {
    default: "bg-slate-900 text-white hover:opacity-90",
    outline: "border border-slate-200 bg-white text-slate-800 hover:bg-slate-50",
    ghost: "bg-transparent hover:bg-slate-100",
  };
  const sizes = {
    default: "h-10 px-4 py-2",
    sm: "h-9 px-3",
    lg: "h-11 px-6",
    icon: "h-10 w-10",
  };
  return <button className={cn("inline-flex items-center justify-center rounded-md text-sm font-medium", variants[variant], sizes[size], className)} {...props} />;
}
