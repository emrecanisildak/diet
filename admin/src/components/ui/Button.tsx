import React from "react";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    children: React.ReactNode;
    variant?: "primary" | "secondary" | "outline" | "ghost" | "danger";
    size?: "sm" | "md" | "lg";
    isLoading?: boolean;
    icon?: React.ReactNode;
}

export function Button({
    children,
    variant = "primary",
    size = "md",
    isLoading = false,
    icon,
    className = "",
    disabled,
    ...props
}: ButtonProps) {
    const baseStyles = "inline-flex items-center justify-center gap-2 font-medium rounded-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed";

    const variantStyles = {
        primary: "bg-gradient-to-r from-green-600 to-emerald-600 text-white shadow-md shadow-green-600/25 hover:shadow-lg hover:shadow-green-600/40 hover:from-green-700 hover:to-emerald-700 active:scale-95",
        secondary: "bg-gray-100 text-gray-900 hover:bg-gray-200 active:scale-95",
        outline: "border-2 border-green-600 text-green-700 hover:bg-green-50 active:scale-95",
        ghost: "text-gray-700 hover:bg-gray-100 active:scale-95",
        danger: "bg-red-600 text-white hover:bg-red-700 shadow-md shadow-red-600/25 hover:shadow-lg hover:shadow-red-600/40 active:scale-95"
    };

    const sizeStyles = {
        sm: "px-3 py-1.5 text-sm",
        md: "px-4 py-2.5 text-sm",
        lg: "px-6 py-3 text-base"
    };

    return (
        <button
            className={`${baseStyles} ${variantStyles[variant]} ${sizeStyles[size]} ${className}`}
            disabled={disabled || isLoading}
            {...props}
        >
            {isLoading ? (
                <>
                    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    Loading...
                </>
            ) : (
                <>
                    {icon}
                    {children}
                </>
            )}
        </button>
    );
}
