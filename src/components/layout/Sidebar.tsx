import {
  LayoutDashboard,
  Users,
  Building2,
  Briefcase,
  MessageSquare,
  BarChart3,
  Settings,
  ChevronDown,
  Bookmark,
  FileText,
  Layers,
} from "lucide-react";
import type { Role } from "../../types";
import { RED } from "../../lib/constants";

const adminNav = [
  {
    icon: <LayoutDashboard size={15} />,
    label: "Dashboard",
    page: "dashboard",
  },
  {
    icon: <Users size={15} />,
    label: "Candidates",
    page: "candidates",
  },
  {
    icon: <Users size={15} />,
    label: "User Management",
    page: "programs",
  },
  {
    icon: <Building2 size={15} />,
    label: "Agencies",
    page: "agencies",
  },
  {
    icon: <Briefcase size={15} />,
    label: "Employers",
    page: "employers",
  },
  {
    icon: <Layers size={15} />,
    label: "Endorsements",
    page: "endorsements",
  },
  {
    icon: <BarChart3 size={15} />,
    label: "Reports",
    page: "reports",
  },
  {
    icon: <MessageSquare size={15} />,
    label: "Messages",
    page: "messages",
  },
  {
    icon: <Settings size={15} />,
    label: "Settings",
    page: "settings",
  },
];

const agencyNav = [
  {
    icon: <LayoutDashboard size={15} />,
    label: "Dashboard",
    page: "dashboard",
  },
  {
    icon: <Users size={15} />,
    label: "Candidate Marketplace",
    page: "marketplace",
  },
  {
    icon: <Bookmark size={15} />,
    label: "Saved Candidates",
    page: "saved",
  },
  {
    icon: <FileText size={15} />,
    label: "My Requests",
    page: "requests",
  },
  {
    icon: <MessageSquare size={15} />,
    label: "Messages",
    page: "messages",
  },
  {
    icon: <Settings size={15} />,
    label: "Settings",
    page: "settings",
  },
];

export function Sidebar({
  role,
  page,
  setPage,
  onLogout,
}: {
  role: Role;
  page: string;
  setPage: (p: string) => void;
  onLogout: () => void;
}) {
  const nav = role === "admin" ? adminNav : agencyNav;
  const orgName = role === "admin" ? "Step Up PH" : "TalentFirst Asia";
  const roleName = role === "admin" ? "Super Admin" : "Recruitment Agency";

  return (
    <aside className="w-[220px] flex-shrink-0 h-screen sticky top-0 flex flex-col bg-white border-r border-[#E5E7EB]">
      {/* Logo */}
      <div className="px-4 py-3.5 border-b border-[#E5E7EB] flex items-center gap-2.5">
        <div
          className="w-7 h-7 rounded-lg flex items-center justify-center text-white font-bold text-sm flex-shrink-0"
          style={{ backgroundColor: RED }}
        >
          S
        </div>
        <div>
          <div
            className="text-sm font-bold text-[#222222] leading-tight"
            style={{
              fontFamily: '"Poppins", sans-serif',
            }}
          >
            StepUpConnect
          </div>
          <div className="text-[10px] text-gray-400 leading-tight">
            by Step Up PH
          </div>
        </div>
      </div>

      {/* Active Org */}
      <div className="px-3 py-2.5 border-b border-[#E5E7EB]">
        <div className="flex items-center gap-2 px-2 py-2 rounded-lg bg-[#F8F9FB]">
          <div
            className="w-6 h-6 rounded-md flex items-center justify-center text-white text-[10px] font-bold flex-shrink-0"
            style={{ backgroundColor: "#222222" }}
          >
            {orgName[0]}
          </div>
          <div className="min-w-0">
            <div className="text-xs font-semibold text-[#222222] truncate leading-tight">
              {orgName}
            </div>
            <div className="text-[10px] text-gray-400 leading-tight">
              {roleName}
            </div>
          </div>
          <ChevronDown
            size={12}
            className="text-gray-400 flex-shrink-0 ml-auto"
          />
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto p-3 space-y-0.5">
        {nav.map((item) => (
          <button
            key={item.page}
            onClick={() => setPage(item.page)}
            className={`w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-sm transition-colors text-left ${
              page === item.page
                ? "bg-red-50 text-[#A10000] font-semibold"
                : "text-gray-600 hover:bg-gray-50 hover:text-[#222222]"
            }`}
          >
            <span
              className={
                page === item.page
                  ? "text-[#A10000]"
                  : "text-gray-400 group-hover:text-gray-600"
              }
            >
              {item.icon}
            </span>
            <span className="text-xs">{item.label}</span>
          </button>
        ))}
      </nav>

      {/*Logout */}
      <div className="p-3 border-t border-[#E5E7EB] space-y-1">
        <button
          onClick={onLogout}
          className="w-full text-left text-[11px] px-2.5 py-1.5 rounded-md text-gray-400 hover:bg-red-50 hover:text-[#A10000] transition-colors flex items-center gap-1.5 mt-1"
        >
          <svg
            width="11"
            height="11"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
            <polyline points="16 17 21 12 16 7" />
            <line x1="21" y1="12" x2="9" y2="12" />
          </svg>
          Sign Out
        </button>
      </div>
    </aside>
  );
}
