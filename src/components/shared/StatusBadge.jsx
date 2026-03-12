import React from "react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const statusStyles = {
  pending: "bg-yellow-50 text-yellow-700 border-yellow-200",
  verified: "bg-green-50 text-green-700 border-green-200",
  rejected: "bg-red-50 text-red-700 border-red-200",
  overdue: "bg-red-50 text-red-700 border-red-200",
  received: "bg-blue-50 text-blue-700 border-blue-200",
  in_progress: "bg-amber-50 text-amber-700 border-amber-200",
  resolved: "bg-green-50 text-green-700 border-green-200",
  closed: "bg-slate-100 text-slate-600 border-slate-200",
  submitted: "bg-blue-50 text-blue-700 border-blue-200",
  reviewed: "bg-purple-50 text-purple-700 border-purple-200",
  approved: "bg-green-50 text-green-700 border-green-200",
  denied: "bg-red-50 text-red-700 border-red-200",
  active: "bg-green-50 text-green-700 border-green-200",
  former: "bg-slate-100 text-slate-600 border-slate-200",
};

export default function StatusBadge({ status, className }) {
  const label = (status || "unknown").replace(/_/g, " ");
  return (
    <Badge
      variant="outline"
      className={cn(
        "capitalize text-xs font-medium border",
        statusStyles[status] || "bg-slate-50 text-slate-600",
        className
      )}
    >
      {label}
    </Badge>
  );
}
