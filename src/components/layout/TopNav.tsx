import { Search, Bell, ChevronDown } from "lucide-react";
import type { Role } from "../../types";
import { RED } from "../../lib/constants";
import { Avatar } from "../shared/Avatar";

export function TopNav({ title, role }: { title: string; role: Role }) {
  const user =
    role === "admin"
      ? "Admin User"
      : role === "agency"
        ? "Rizza Villanueva"
        : "HR Manager";
  return (
    <header className="h-14 bg-white border-b border-[#E5E7EB] flex items-center justify-between px-6 flex-shrink-0 z-10">
      <h1
        className="text-[15px] font-semibold text-[#222222]"
        style={{
          fontFamily: '"Poppins", sans-serif',
        }}
      >
        {title}
      </h1>
      <div className="flex items-center gap-2.5">
        <div className="relative hidden md:block">
          <Search
            size={13}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
          />
          <input
            placeholder="Search..."
            className="pl-8 pr-4 py-1.5 text-xs bg-[#F8F9FB] border border-[#E5E7EB] rounded-lg w-48 outline-none focus:border-gray-300 transition"
          />
        </div>
        <button className="relative w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-50 transition">
          <Bell size={15} className="text-gray-500" />
          <span
            className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full"
            style={{ backgroundColor: RED }}
          />
        </button>
        <div className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 rounded-lg px-2 py-1.5 transition">
          <Avatar name={user} size="sm" />
          <span className="text-xs font-medium text-[#222222] hidden md:block">
            {user.split(" ")[0]}
          </span>
          <ChevronDown size={12} className="text-gray-400" />
        </div>
      </div>
    </header>
  );
}
