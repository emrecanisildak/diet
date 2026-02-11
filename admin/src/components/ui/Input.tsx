import React from "react";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    label?: string;
    error?: string;
    icon?: React.ReactNode;
    iconPosition?: "left" | "right";
}

export function Input({
    label,
    error,
    icon,
    iconPosition = "left",
    className = "",
    ...props
}: InputProps) {
    return (
        <div className="w-full">
            {label && (
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    {label}
                </label>
            )}
            <div className="relative">
                {icon && iconPosition === "left" && (
                    <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400">
                        {icon}
                    </div>
                )}
                <input
                    className={`
            w-full px-4 py-2.5 
            bg-gray-50 border border-gray-200 rounded-xl 
            text-gray-900 placeholder-gray-400
            focus:bg-white focus:border-green-500 focus:ring-2 focus:ring-green-500/20
            disabled:opacity-60 disabled:cursor-not-allowed
            transition-all duration-200
            ${icon && iconPosition === "left" ? "pl-11" : ""}
            ${icon && iconPosition === "right" ? "pr-11" : ""}
            ${error ? "border-red-300 focus:border-red-500 focus:ring-red-500/20" : ""}
            ${className}
          `}
                    {...props}
                />
                {icon && iconPosition === "right" && (
                    <div className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400">
                        {icon}
                    </div>
                )}
            </div>
            {error && (
                <p className="mt-1.5 text-sm text-red-600">{error}</p>
            )}
        </div>
    );
}

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
    label?: string;
    error?: string;
}

export function Textarea({
    label,
    error,
    className = "",
    ...props
}: TextareaProps) {
    return (
        <div className="w-full">
            {label && (
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    {label}
                </label>
            )}
            <textarea
                className={`
          w-full px-4 py-2.5 
          bg-gray-50 border border-gray-200 rounded-xl 
          text-gray-900 placeholder-gray-400
          focus:bg-white focus:border-green-500 focus:ring-2 focus:ring-green-500/20
          disabled:opacity-60 disabled:cursor-not-allowed
          transition-all duration-200
          ${error ? "border-red-300 focus:border-red-500 focus:ring-red-500/20" : ""}
          ${className}
        `}
                {...props}
            />
            {error && (
                <p className="mt-1.5 text-sm text-red-600">{error}</p>
            )}
        </div>
    );
}

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
    label?: string;
    error?: string;
}

export function Select({
    label,
    error,
    className = "",
    children,
    ...props
}: SelectProps) {
    return (
        <div className="w-full">
            {label && (
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    {label}
                </label>
            )}
            <select
                className={`
          w-full px-4 py-2.5 
          bg-gray-50 border border-gray-200 rounded-xl 
          text-gray-900
          focus:bg-white focus:border-green-500 focus:ring-2 focus:ring-green-500/20
          disabled:opacity-60 disabled:cursor-not-allowed
          transition-all duration-200
          ${error ? "border-red-300 focus:border-red-500 focus:ring-red-500/20" : ""}
          ${className}
        `}
                {...props}
            >
                {children}
            </select>
            {error && (
                <p className="mt-1.5 text-sm text-red-600">{error}</p>
            )}
        </div>
    );
}
