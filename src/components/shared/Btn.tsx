import type { ReactNode } from "react";

export function Btn({
  children,
  variant = "primary",
  onClick,
  className = "",
  size = "md",
}: {
  children: ReactNode;
  variant?: "primary" | "ghost" | "outline";
  onClick?: () => void;
  className?: string;
  size?: "sm" | "md";
}) {
  const base =
    "inline-flex items-center gap-1.5 font-medium rounded-lg transition-colors cursor-pointer";
  const sizes = {
    sm: "text-xs px-3 py-1.5",
    md: "text-sm px-4 py-2",
  };
  const variants = {
    primary: "bg-[#A10000] text-white hover:bg-[#8a0000]",
    ghost: "text-gray-600 hover:bg-gray-50",
    outline: "border border-[#E5E7EB] text-gray-600 hover:bg-gray-50",
  };
  return (
    <button
      onClick={onClick}
      className={`${base} ${sizes[size]} ${variants[variant]} ${className}`}
    >
      {children}
    </button>
  );
}
