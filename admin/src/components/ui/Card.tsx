import React from "react";

interface CardProps {
  children: React.ReactNode;
  className?: string;
  variant?: "default" | "elevated" | "flat" | "gradient";
  hover?: boolean;
}

export function Card({
  children,
  className = "",
  variant = "default",
  hover = false
}: CardProps) {
  const variantStyles = {
    default: "bg-white border border-violet-100/60 shadow-sm shadow-violet-100/50",
    elevated: "bg-white border border-violet-100/60 shadow-lg shadow-violet-100/50",
    flat: "bg-white border border-gray-200",
    gradient: "bg-gradient-to-br from-violet-50 to-indigo-50 border border-violet-100 shadow-sm"
  };

  const hoverStyles = hover
    ? "hover:shadow-md hover:shadow-violet-100 hover:-translate-y-0.5 cursor-pointer"
    : "";

  return (
    <div className={`rounded-2xl transition-all duration-200 ${variantStyles[variant]} ${hoverStyles} ${className}`}>
      {children}
    </div>
  );
}

interface CardHeaderProps {
  children: React.ReactNode;
  className?: string;
}

export function CardHeader({ children, className = "" }: CardHeaderProps) {
  return (
    <div className={`px-6 py-4 border-b border-gray-100 ${className}`}>
      {children}
    </div>
  );
}

interface CardBodyProps {
  children: React.ReactNode;
  className?: string;
}

export function CardBody({ children, className = "" }: CardBodyProps) {
  return (
    <div className={`px-6 py-4 ${className}`}>
      {children}
    </div>
  );
}

interface CardFooterProps {
  children: React.ReactNode;
  className?: string;
}

export function CardFooter({ children, className = "" }: CardFooterProps) {
  return (
    <div className={`px-6 py-4 border-t border-gray-100 ${className}`}>
      {children}
    </div>
  );
}
