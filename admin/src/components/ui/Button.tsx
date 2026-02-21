import React from "react";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    children: React.ReactNode;
    variant?: "primary" | "secondary" | "outline" | "ghost" | "danger" | "gradient";
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
        primary: "bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow-md shadow-violet-600/25 hover:shadow-lg hover:shadow-violet-600/40 hover:from-violet-700 hover:to-indigo-700 active:scale-95",
        gradient: "bg-gradient-to-r from-violet-500 via-purple-500 to-indigo-500 text-white shadow-lg shadow-violet-500/30 hover:shadow-xl hover:shadow-violet-500/40 hover:from-violet-600 hover:via-purple-600 hover:to-indigo-600 active:scale-95",
        secondary: "bg-gray-100 text-gray-900 hover:bg-gray-200 active:scale-95",
        outline: "border-2 border-violet-600 text-violet-700 hover:bg-violet-50 active:scale-95",
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
