import React from "react";
import { cn } from "@/lib/utils";

export function Select({ value, onValueChange, children }) {
  return React.Children.map(children, (child) => {
    if (child?.type?.displayName === "SelectTrigger") {
      return React.cloneElement(child, { value, onValueChange });
    }
    return child;
  });
}

export function SelectTrigger({ className, value, onValueChange, children }) {
  const childArray = React.Children.toArray(children);
  const valueComp = childArray.find(c => c?.type === SelectValue);
  const contentComp = childArray.find(c => c?.type === SelectContent);
  const options = contentComp ? React.Children.toArray(contentComp.props.children).filter(Boolean) : [];
  return (
    <select className={cn("h-10 w-full rounded-md border border-slate-200 bg-white px-3 text-sm", className)} value={value} onChange={(e) => onValueChange?.(e.target.value)}>
      {valueComp?.props?.placeholder && <option value="">{valueComp.props.placeholder}</option>}
      {options.map((item) => <option key={item.props.value} value={item.props.value}>{item.props.children}</option>)}
    </select>
  );
}
SelectTrigger.displayName = "SelectTrigger";

export function SelectValue() { return null; }
export function SelectContent({ children }) { return <>{children}</>; }
export function SelectItem() { return null; }
