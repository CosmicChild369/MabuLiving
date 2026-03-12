import React from "react";
import { cn } from "@/lib/utils";

export function Tabs({ value, onValueChange, children }) {
  return React.cloneElement(children, { value, onValueChange });
}

export function TabsList({ className, value, onValueChange, children }) {
  return <div className={cn("inline-flex rounded-md p-1", className)}>{React.Children.map(children, (c) => React.cloneElement(c, { value, onValueChange }))}</div>;
}

export function TabsTrigger({ value: tabValue, onValueChange, value, className, children }) {
  const active = value === tabValue;
  return (
    <button
      type="button"
      onClick={() => onValueChange?.(tabValue)}
      className={cn("px-3 py-1.5 text-sm rounded", active ? "bg-white shadow" : "text-slate-500", className)}
    >
      {children}
    </button>
  );
}
