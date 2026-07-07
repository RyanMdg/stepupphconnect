import type { ReactNode } from "react";
import { CheckCircle, Clock, Award } from "lucide-react";

export function Chip({
  children,
  variant = "default",
}: {
  children: ReactNode;
  variant?: string;
}) {
  const styles: Record<string, string> = {
    default: "bg-gray-100 text-gray-600",
    success: "bg-green-50 text-green-700 border border-green-200",
    warning: "bg-amber-50 text-amber-700 border border-amber-200",
    danger: "bg-red-50 text-red-700 border border-red-200",
    primary: "bg-red-50 text-[#A10000] border border-red-100",
    info: "bg-blue-50 text-blue-700 border border-blue-200",
    purple: "bg-purple-50 text-purple-700 border border-purple-200",
    gray: "bg-gray-100 text-gray-500",
  };
  return (
    <span
      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-medium ${styles[variant] ?? styles.default}`}
    >
      {children}
    </span>
  );
}

export function StatusChip({ status }: { status: string }) {
  if (status === "job_ready")
    return (
      <Chip variant="success">
        <CheckCircle size={10} />
        Job Ready
      </Chip>
    );
  if (status === "in_training")
    return (
      <Chip variant="info">
        <Clock size={10} />
        In Training
      </Chip>
    );
  if (status === "placed")
    return (
      <Chip variant="purple">
        <Award size={10} />
        Placed
      </Chip>
    );
  if (status === "pending")
    return (
      <Chip variant="warning">
        <Clock size={10} />
        Pending
      </Chip>
    );
  if (status === "active")
    return (
      <Chip variant="success">
        <CheckCircle size={10} />
        Active
      </Chip>
    );
  if (status === "inactive") return <Chip variant="gray">Inactive</Chip>;
  return <Chip>{status}</Chip>;
}
