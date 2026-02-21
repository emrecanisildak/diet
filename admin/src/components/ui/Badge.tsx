import React from "react";

interface BadgeProps {
  children: React.ReactNode;
  variant?: "success" | "warning" | "danger" | "info" | "neutral" | "purple";
  dot?: boolean;
  className?: string;
}

export function Badge({
  children,
  variant = "neutral",
  dot = false,
  className = ""
}: BadgeProps) {
  const variantStyles = {
    success: "bg-emerald-50 text-emerald-700 border-emerald-200 ring-1 ring-emerald-200/50",
    warning: "bg-amber-50 text-amber-700 border-amber-200 ring-1 ring-amber-200/50",
    danger: "bg-rose-50 text-rose-700 border-rose-200 ring-1 ring-rose-200/50",
    info: "bg-sky-50 text-sky-700 border-sky-200 ring-1 ring-sky-200/50",
    neutral: "bg-gray-100 text-gray-600 border-gray-200 ring-1 ring-gray-200/50",
    purple: "bg-violet-50 text-violet-700 border-violet-200 ring-1 ring-violet-200/50",
  };

  const dotColors = {
    success: "bg-emerald-500",
    warning: "bg-amber-500",
    danger: "bg-rose-500",
    info: "bg-sky-500",
    neutral: "bg-gray-400",
    purple: "bg-violet-500",
  };

  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 text-xs font-semibold rounded-full border ${variantStyles[variant]} ${className}`}>
      {dot && <span className={`w-1.5 h-1.5 rounded-full ${dotColors[variant]}`} />}
      {children}
    </span>
  );
}
