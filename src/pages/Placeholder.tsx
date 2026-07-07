import { Settings } from "lucide-react";
import { Card } from "../components/shared/Card";
import { RED } from "../lib/constants";

export function Placeholder({ title }: { title: string }) {
  return (
    <div className="p-6 max-w-screen-xl">
      <h2
        className="text-base font-semibold text-[#222222] mb-4"
        style={{
          fontFamily: '"Plus Jakarta Sans", sans-serif',
        }}
      >
        {title}
      </h2>
      <Card className="p-16 flex flex-col items-center justify-center text-center">
        <div className="w-12 h-12 rounded-2xl bg-red-50 flex items-center justify-center mx-auto mb-3">
          <Settings size={20} color={RED} />
        </div>
        <p className="text-sm font-medium text-gray-500">{title}</p>
        <p className="text-xs text-gray-400 mt-1">
          This section is available in production
        </p>
      </Card>
    </div>
  );
}
