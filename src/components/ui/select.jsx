import React from "react";
import { cn } from "@/lib/utils";

export function Select({ value, onValueChange, children }) {
  const childArray = React.Children.toArray(children);
  const trigger = childArray.find((c) => c?.type?.displayName === "SelectTrigger");
  const content = childArray.find((c) => c?.type === SelectContent);

  const triggerChildren = React.Children.toArray(trigger?.props?.children || []);
  const valueComp = triggerChildren.find((c) => c?.type === SelectValue);
  const placeholder = valueComp?.props?.placeholder;

  const options = React.Children.toArray(content?.props?.children || [])
    .filter((c) => c?.type === SelectItem)
    .map((item) => ({
      value: item.props.value,
      label:
        typeof item.props.children === "string" || typeof item.props.children === "number"
          ? String(item.props.children)
          : String(item.props.value),
      className: item.props.className,
    }));

  if (!trigger) return null;

  return React.cloneElement(trigger, {
    value,
    onValueChange,
    options,
    placeholder,
  });
}

export function SelectTrigger({ className, value, onValueChange, options = [], placeholder }) {
  return (
    <select className={cn("h-10 w-full rounded-md border border-slate-200 bg-white px-3 text-sm", className)} value={value} onChange={(e) => onValueChange?.(e.target.value)}>
      {placeholder ? <option value="">{placeholder}</option> : null}
      {options.map((item) => (
        <option key={item.value} value={item.value} className={item.className}>
          {item.label}
        </option>
      ))}
    </select>
  );
}
SelectTrigger.displayName = "SelectTrigger";

export function SelectValue() { return null; }
export function SelectContent({ children }) { return <>{children}</>; }
export function SelectItem() { return null; }
