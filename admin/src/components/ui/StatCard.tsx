import React from "react";
import { LucideIcon } from "lucide-react";

interface StatCardProps {
    label: string;
    value: number | string;
    icon: LucideIcon;
    color?: "blue" | "green" | "purple" | "orange" | "red";
    trend?: {
        value: number;
        isPositive: boolean;
    };
}

export function StatCard({ label, value, icon: Icon, color = "green", trend }: StatCardProps) {
    const colorStyles = {
        blue: "bg-blue-50 text-blue-600",
        green: "bg-green-50 text-green-600",
        purple: "bg-purple-50 text-purple-600",
        orange: "bg-orange-50 text-orange-600",
        red: "bg-red-50 text-red-600"
    };

    return (
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-all duration-200">
            <div className="flex items-start justify-between">
                <div className="flex-1">
                    <div className="flex items-center gap-4 mb-3">
                        <div className={`p-3 rounded-xl ${colorStyles[color]} shadow-sm`}>
                            <Icon size={24} strokeWidth={2} />
                        </div>
                    </div>
                    <p className="text-3xl font-bold text-gray-900 mb-1">{value}</p>
                    <p className="text-sm text-gray-500 font-medium">{label}</p>
                </div>
                {trend && (
                    <div className={`flex items-center gap-1 text-sm font-medium ${trend.isPositive ? "text-green-600" : "text-red-600"}`}>
                        <span>{trend.isPositive ? "↑" : "↓"}</span>
                        <span>{Math.abs(trend.value)}%</span>
                    </div>
                )}
            </div>
        </div>
    );
}
