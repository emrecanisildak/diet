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

export function StatCard({ label, value, icon: Icon, color = "purple", trend }: StatCardProps) {
    const gradients = {
        blue: "from-blue-500 to-cyan-500",
        green: "from-emerald-500 to-teal-500",
        purple: "from-violet-500 to-indigo-500",
        orange: "from-orange-500 to-amber-500",
        red: "from-rose-500 to-pink-500",
    };

    const shadows = {
        blue: "shadow-blue-500/25",
        green: "shadow-emerald-500/25",
        purple: "shadow-violet-500/25",
        orange: "shadow-orange-500/25",
        red: "shadow-rose-500/25",
    };

    return (
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-all duration-200 group">
            <div className="flex items-start justify-between">
                <div className="flex-1">
                    <div className={`inline-flex p-3 rounded-xl bg-gradient-to-br ${gradients[color]} shadow-lg ${shadows[color]} mb-4 group-hover:scale-105 transition-transform duration-200`}>
                        <Icon size={22} strokeWidth={2} className="text-white" />
                    </div>
                    <p className="text-3xl font-bold text-gray-900 mb-1">{value}</p>
                    <p className="text-sm text-gray-500 font-medium">{label}</p>
                </div>
                {trend && (
                    <div className={`flex items-center gap-1 text-sm font-semibold px-2 py-1 rounded-lg ${trend.isPositive ? "text-emerald-700 bg-emerald-50" : "text-rose-700 bg-rose-50"}`}>
                        <span>{trend.isPositive ? "↑" : "↓"}</span>
                        <span>{Math.abs(trend.value)}%</span>
                    </div>
                )}
            </div>
        </div>
    );
}
