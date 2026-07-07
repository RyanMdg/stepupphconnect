import { SUCCESS, WARNING } from "../../lib/constants";

export function ReadinessBar({ score }: { score: number }) {
  const color = score >= 85 ? SUCCESS : score >= 65 ? WARNING : "#DC2626";
  return (
    <div className="flex items-center gap-2 min-w-0">
      <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
        <div
          className="h-full rounded-full"
          style={{ width: `${score}%`, backgroundColor: color }}
        />
      </div>
      <span
        className="text-xs font-semibold tabular-nums flex-shrink-0"
        style={{ color }}
      >
        {score}%
      </span>
    </div>
  );
}
