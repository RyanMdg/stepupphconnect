import type { ReactNode } from "react";
import { TrendingUp } from "lucide-react";
import { Card } from "./Card";

export function StatCard({
  label,
  value,
  sub,
  icon,
  trend,
}: {
  label: string;
  value: string | number;
  sub?: string;
  icon: ReactNode;
  trend?: number;
}) {
  return (
    <Card className="p-5">
      <div className="flex items-start justify-between mb-3">
        <div className="w-9 h-9 rounded-xl flex items-center justify-center bg-red-50 text-[#A10000]">
          {icon}
        </div>
        {trend !== undefined && (
          <span className="text-[11px] font-medium text-green-600 flex items-center gap-0.5">
            <TrendingUp size={10} />+{trend}%
          </span>
        )}
      </div>
      <div
        className="text-2xl font-bold text-[#222222] tabular-nums"
        style={{
          fontFamily: '"Plus Jakarta Sans", sans-serif',
        }}
      >
        {value}
      </div>
      <div className="text-xs text-gray-500 mt-0.5">{label}</div>
      {sub && <div className="text-[10px] text-gray-400 mt-1">{sub}</div>}
    </Card>
  );
}
