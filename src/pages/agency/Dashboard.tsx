import { Users, Bookmark, FileText, Calendar, Award } from "lucide-react";
import { Card } from "../../components/shared/Card";
import { StatusChip } from "../../components/shared/Chip";

export function AgencyDashboard() {
  return (
    <div className="p-6 space-y-5 max-w-screen-xl">
      <div className="flex items-center justify-between">
        <div>
          <h2
            className="text-base font-semibold text-[#222222]"
            style={{
              fontFamily: '"Plus Jakarta Sans", sans-serif',
            }}
          >
            Welcome back, Rizza
          </h2>
          <p className="text-xs text-gray-500 mt-0.5">
            TalentFirst Asia — Recruitment Dashboard
          </p>
        </div>
        <span className="text-xs text-gray-400">Jan 11, 2025 · Saturday</span>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
        {[
          {
            label: "Available Candidates",
            value: 118,
            icon: <Users size={16} />,
            trend: 8,
          },
          {
            label: "Saved Candidates",
            value: 12,
            icon: <Bookmark size={16} />,
          },
          {
            label: "Pending Requests",
            value: 7,
            icon: <FileText size={16} />,
          },
          {
            label: "Interviews Scheduled",
            value: 3,
            icon: <Calendar size={16} />,
          },
          {
            label: "Successful Placements",
            value: 18,
            icon: <Award size={16} />,
            trend: 22,
          },
        ].map((s, i) => (
          <Card key={i} className="p-4">
            <div className="flex items-center justify-between mb-2.5">
              <div className="w-8 h-8 rounded-xl bg-red-50 flex items-center justify-center text-[#A10000]">
                {s.icon}
              </div>
              {s.trend && (
                <span className="text-[11px] text-green-600 font-medium">
                  +{s.trend}%
                </span>
              )}
            </div>
            <div
              className="text-xl font-bold text-[#222222] tabular-nums"
              style={{
                fontFamily: '"Plus Jakarta Sans", sans-serif',
              }}
            >
              {s.value}
            </div>
            <div className="text-xs text-gray-500 mt-0.5">{s.label}</div>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card className="p-5">
          <p
            className="text-sm font-semibold text-[#222222] mb-3"
            style={{
              fontFamily: '"Plus Jakarta Sans", sans-serif',
            }}
          >
            Recent Activity
          </p>
          <div className="space-y-3">
            {[
              {
                text: "Maria Santos request approved by Step Up PH",
                time: "2 hours ago",
                dot: "bg-green-400",
              },
              {
                text: "Angela Reyes shortlisted for Healthcare Lead role",
                time: "5 hours ago",
                dot: "bg-blue-400",
              },
              {
                text: "12 new job-ready candidates available",
                time: "1 day ago",
                dot: "bg-gray-300",
              },
              {
                text: "John Dela Cruz interview scheduled for Jan 15",
                time: "1 day ago",
                dot: "bg-gray-300",
              },
              {
                text: "Carlo Mendoza request submitted — awaiting approval",
                time: "2 days ago",
                dot: "bg-amber-400",
              },
            ].map((item, i) => (
              <div key={i} className="flex items-start gap-2.5">
                <div
                  className={`w-1.5 h-1.5 rounded-full mt-1.5 flex-shrink-0 ${item.dot}`}
                />
                <div>
                  <p className="text-xs text-[#222222] leading-snug">
                    {item.text}
                  </p>
                  <p className="text-[10px] text-gray-400 mt-0.5">
                    {item.time}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card className="p-5">
          <p
            className="text-sm font-semibold text-[#222222] mb-3"
            style={{
              fontFamily: '"Plus Jakarta Sans", sans-serif',
            }}
          >
            My Candidate Requests
          </p>
          <div className="space-y-2">
            {[
              {
                candidate: "Maria Santos",
                position: "Virtual Assistant Lead",
                status: "active",
                date: "Jan 10",
              },
              {
                candidate: "Angela Reyes",
                position: "Healthcare Coordinator",
                status: "active",
                date: "Jan 11",
              },
              {
                candidate: "John Dela Cruz",
                position: "CSR Agent",
                status: "pending",
                date: "Jan 8",
              },
              {
                candidate: "Carlo Mendoza",
                position: "Admin Staff",
                status: "pending",
                date: "Jan 5",
              },
            ].map((req, i) => (
              <div
                key={i}
                className="flex items-center justify-between p-3 rounded-xl border border-[#E5E7EB] hover:bg-[#F8F9FB] transition cursor-pointer"
              >
                <div>
                  <div className="text-xs font-semibold text-[#222222]">
                    {req.candidate}
                  </div>
                  <div className="text-[10px] text-gray-400">
                    {req.position} · {req.date}
                  </div>
                </div>
                <StatusChip status={req.status} />
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
