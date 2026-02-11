import React from "react";

interface BadgeProps {
    children: React.ReactNode;
    variant?: "success" | "warning" | "danger" | "info" | "neutral";
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
        success: "bg-green-100 text-green-700 border-green-200",
        warning: "bg-yellow-100 text-yellow-700 border-yellow-200",
        danger: "bg-red-100 text-red-700 border-red-200",
        info: "bg-blue-100 text-blue-700 border-blue-200",
        neutral: "bg-gray-100 text-gray-700 border-gray-200"
    };

    const dotColors = {
        success: "bg-green-500",
        warning: "bg-yellow-500",
        danger: "bg-red-500",
        info: "bg-blue-500",
        neutral: "bg-gray-500"
    };

    return (
        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-full border ${variantStyles[variant]} ${className}`}>
            {dot && <span className={`w-1.5 h-1.5 rounded-full ${dotColors[variant]}`} />}
            {children}
        </span>
    );
}
