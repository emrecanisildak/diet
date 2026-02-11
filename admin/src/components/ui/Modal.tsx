"use client";

import React, { useEffect } from "react";
import { X } from "lucide-react";

interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    children: React.ReactNode;
    title?: string;
    size?: "sm" | "md" | "lg";
}

export function Modal({ isOpen, onClose, children, title, size = "md" }: ModalProps) {
    useEffect(() => {
        const handleEscape = (e: KeyboardEvent) => {
            if (e.key === "Escape") onClose();
        };

        if (isOpen) {
            document.addEventListener("keydown", handleEscape);
            document.body.style.overflow = "hidden";
        }

        return () => {
            document.removeEventListener("keydown", handleEscape);
            document.body.style.overflow = "unset";
        };
    }, [isOpen, onClose]);

    if (!isOpen) return null;

    const sizeStyles = {
        sm: "max-w-md",
        md: "max-w-lg",
        lg: "max-w-2xl"
    };

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in"
            onClick={onClose}
        >
            {/* Backdrop with blur */}
            <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />

            {/* Modal content */}
            <div
                className={`relative bg-white rounded-2xl shadow-2xl w-full ${sizeStyles[size]} animate-slide-up`}
                onClick={(e) => e.stopPropagation()}
            >
                {title && (
                    <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
                        <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
                        <button
                            onClick={onClose}
                            className="p-1 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
                        >
                            <X size={20} />
                        </button>
                    </div>
                )}
                <div className="px-6 py-4">
                    {children}
                </div>
            </div>
        </div>
    );
}
