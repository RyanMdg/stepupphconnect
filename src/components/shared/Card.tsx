import type { ReactNode } from "react";

export function Card({
  children,
  className = "",
  onClick,
}: {
  children: ReactNode;
  className?: string;
  onClick?: (e: React.MouseEvent) => void;
}) {
  return (
    <div
      className={`bg-white rounded-xl border border-[#E5E7EB] shadow-sm ${className}`}
      onClick={onClick}
    >
      {children}
    </div>
  );
}
