import { useEffect, useState } from "react";
import {
  Users,
  CheckCircle,
  Building2,
  Briefcase,
  Send,
  Award,
  Zap,
} from "lucide-react";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { StatCard } from "../../components/shared/StatCard";
import { Card } from "../../components/shared/Card";
import { Chip } from "../../components/shared/Chip";
import { Avatar } from "../../components/shared/Avatar";
import { StatusChip } from "../../components/shared/Chip";
import { RED, SUCCESS } from "../../lib/constants";
import {
  getDashboardData,
  type DashboardData,
} from "../../services/dashboardService";

function timeAgo(value: string) {
  const diffMs = Date.now() - new Date(value).getTime();
  const diffHours = Math.max(Math.floor(diffMs / 36e5), 0);

  if (diffHours < 1) return "Just now";
  if (diffHours < 24) return `${diffHours} hour${diffHours === 1 ? "" : "s"} ago`;

  const diffDays = Math.floor(diffHours / 24);
  return `${diffDays} day${diffDays === 1 ? "" : "s"} ago`;
}

function requestLogo(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();
}

export function SuperAdminDashboard() {
  const [dashboard, setDashboard] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    getDashboardData()
      .then((data) => {
        if (active) setDashboard(data);
      })
      .catch((err) => {
        console.error(err);
        if (active) setError("Unable to load dashboard data.");
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  if (!dashboard) {
    return (
      <div className="p-6 max-w-screen-xl">
        <Card className="p-6 text-sm text-gray-500">
          {loading ? "Loading dashboard..." : error || "No dashboard data yet."}
        </Card>
      </div>
    );
  }

  const jobReadyPercent = dashboard.stats.totalCandidates
    ? Math.round(
        (dashboard.stats.jobReady / dashboard.stats.totalCandidates) * 100,
      )
    : 0;
  const placementRate = dashboard.stats.endorsedThisQuarter
    ? Math.round(
        (dashboard.stats.hired / dashboard.stats.endorsedThisQuarter) * 100,
      )
    : 0;
  const completionPercent = dashboard.completionDonut[0]?.value ?? 0;
  const pendingRequest = dashboard.pendingRequests[0];

  return (
    <div className="p-6 space-y-5 max-w-screen-xl">
      {error && (
        <Card className="p-3 text-xs text-red-700 bg-red-50 border-red-100">
          {error}
        </Card>
      )}
      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3">
        <StatCard
          label="Total Candidates"
          value={dashboard.stats.totalCandidates}
          icon={<Users size={17} />}
        />
        <StatCard
          label="Job Ready"
          value={dashboard.stats.jobReady}
          sub={`${jobReadyPercent}% of total`}
          icon={<CheckCircle size={17} />}
        />
        <StatCard
          label="Partner Agencies"
          value={dashboard.stats.partnerAgencies}
          icon={<Building2 size={17} />}
        />
        <StatCard
          label="Active Employers"
          value={dashboard.stats.activeEmployers}
          icon={<Briefcase size={17} />}
        />
        <StatCard
          label="Endorsed"
          value={dashboard.stats.endorsedThisQuarter}
          sub="This quarter"
          icon={<Send size={17} />}
        />
        <StatCard
          label="Hired"
          value={dashboard.stats.hired}
          sub={`${placementRate}% placement rate`}
          icon={<Award size={17} />}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card className="p-5">
          <div className="mb-4">
            <p
              className="text-sm font-semibold text-[#222222]"
              style={{
                fontFamily: '"Poppins", sans-serif',
              }}
            >
              Monthly Candidate Growth
            </p>
            <p className="text-xs text-gray-400 mt-0.5">
              Active candidates enrolled per month
            </p>
          </div>
          <ResponsiveContainer width="100%" height={170}>
            <AreaChart
              data={dashboard.monthlyGrowthData}
              margin={{
                top: 4,
                right: 4,
                bottom: 0,
                left: -20,
              }}
            >
              <defs>
                <linearGradient id="redGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={RED} stopOpacity={0.12} />
                  <stop offset="95%" stopColor={RED} stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="#F3F4F6"
                vertical={false}
              />
              <XAxis
                dataKey="month"
                tick={{ fontSize: 10, fill: "#9CA3AF" }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tick={{ fontSize: 10, fill: "#9CA3AF" }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip
                contentStyle={{
                  fontSize: 11,
                  borderRadius: 8,
                  border: "1px solid #E5E7EB",
                  boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
                }}
                cursor={{ stroke: "#E5E7EB" }}
              />
              <Area
                type="monotone"
                dataKey="candidates"
                stroke={RED}
                strokeWidth={2}
                fill="url(#redGrad)"
                dot={false}
                activeDot={{ r: 4, fill: RED }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </Card>

        <Card className="p-5">
          <div className="mb-4">
            <p
              className="text-sm font-semibold text-[#222222]"
              style={{
                fontFamily: '"Poppins", sans-serif',
              }}
            >
              Endorsements per Month
            </p>
            <p className="text-xs text-gray-400 mt-0.5">
              Candidate endorsements to partner agencies
            </p>
          </div>
          <ResponsiveContainer width="100%" height={170}>
            <BarChart
              data={dashboard.endorsementsData}
              margin={{
                top: 4,
                right: 4,
                bottom: 0,
                left: -20,
              }}
            >
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="#F3F4F6"
                vertical={false}
              />
              <XAxis
                dataKey="month"
                tick={{ fontSize: 10, fill: "#9CA3AF" }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tick={{ fontSize: 10, fill: "#9CA3AF" }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip
                contentStyle={{
                  fontSize: 11,
                  borderRadius: 8,
                  border: "1px solid #E5E7EB",
                  boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
                }}
                cursor={{ fill: "#F8F9FB" }}
              />
              <Bar
                dataKey="endorsements"
                fill={RED}
                radius={[3, 3, 0, 0]}
                maxBarSize={32}
              />
            </BarChart>
          </ResponsiveContainer>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card className="p-5 lg:col-span-2">
          <div className="mb-4">
            <p
              className="text-sm font-semibold text-[#222222]"
              style={{
                fontFamily: '"Poppins", sans-serif',
              }}
            >
              Hiring Conversion Pipeline
            </p>
            <p className="text-xs text-gray-400 mt-0.5">
              Candidates progressing through each stage
            </p>
          </div>
          <ResponsiveContainer width="100%" height={170}>
            <BarChart
              data={dashboard.conversionData}
              layout="vertical"
              margin={{ top: 0, right: 8, bottom: 0, left: 8 }}
            >
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="#F3F4F6"
                horizontal={false}
              />
              <XAxis
                type="number"
                tick={{ fontSize: 10, fill: "#9CA3AF" }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                type="category"
                dataKey="stage"
                tick={{ fontSize: 11, fill: "#6B7280" }}
                axisLine={false}
                tickLine={false}
                width={72}
              />
              <Tooltip
                contentStyle={{
                  fontSize: 11,
                  borderRadius: 8,
                  border: "1px solid #E5E7EB",
                }}
                cursor={{ fill: "#F8F9FB" }}
              />
              <Bar
                dataKey="count"
                fill={RED}
                radius={[0, 3, 3, 0]}
                maxBarSize={20}
              />
            </BarChart>
          </ResponsiveContainer>
        </Card>

        <Card className="p-5">
          <div className="mb-3">
            <p
              className="text-sm font-semibold text-[#222222]"
              style={{
                fontFamily: '"Poppins", sans-serif',
              }}
            >
              Training Completion
            </p>
            <p className="text-xs text-gray-400 mt-0.5">
              Current cohort progress
            </p>
          </div>
          <div className="flex justify-center">
            <div className="relative">
              <PieChart width={120} height={120}>
                <Pie
                  data={dashboard.completionDonut}
                  cx={55}
                  cy={55}
                  innerRadius={38}
                  outerRadius={52}
                  dataKey="value"
                  startAngle={90}
                  endAngle={-270}
                  strokeWidth={0}
                >
                  {dashboard.completionDonut.map((_, idx) => (
                    <Cell
                      key={`completion-${idx}`}
                      fill={idx === 0 ? RED : "#F3F4F6"}
                    />
                  ))}
                </Pie>
              </PieChart>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span
                  className="text-xl font-bold text-[#222222]"
                  style={{
                    fontFamily: '"Poppins", sans-serif',
                  }}
                >
                  {completionPercent}%
                </span>
                <span className="text-[10px] text-gray-400">Complete</span>
              </div>
            </div>
          </div>
          <div className="mt-2 space-y-2">
            {dashboard.programs.length === 0 && (
              <p className="text-xs text-gray-400 py-4">
                No programs yet.
              </p>
            )}
            {dashboard.programs.map((p) => (
              <div key={p.id}>
                <div className="flex justify-between mb-1">
                  <span className="text-[11px] text-gray-500 truncate max-w-[130px]">
                    {p.name.split(" ").slice(0, 2).join(" ")}
                  </span>
                  <span className="text-[11px] font-semibold text-[#222222]">
                    {p.completion_rate}%
                  </span>
                </div>
                <div className="h-1 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full"
                    style={{
                      width: `${p.completion_rate}%`,
                      backgroundColor: RED,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card className="p-5">
          <p
            className="text-sm font-semibold text-[#222222] mb-3"
            style={{
              fontFamily: '"Poppins", sans-serif',
            }}
          >
            Recent Activity
          </p>
          <div className="space-y-3">
            {dashboard.activityFeed.length === 0 && (
              <p className="text-xs text-gray-400 py-4">No recent activity.</p>
            )}
            {dashboard.activityFeed.map((item) => (
              <div key={item.id} className="flex items-start gap-2.5">
                <div
                  className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5"
                  style={{
                    backgroundColor:
                      item.type === "hired"
                        ? "#DCFCE7"
                        : item.type === "endorsed"
                          ? "#FEE2E2"
                          : "#F3F4F6",
                  }}
                >
                  {item.type === "hired" ? (
                    <Award size={10} color={SUCCESS} />
                  ) : item.type === "endorsed" ? (
                    <Send size={10} color={RED} />
                  ) : (
                    <Zap size={10} color="#9CA3AF" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-[#222222] leading-snug">
                    {item.text}
                  </p>
                  <p className="text-[10px] text-gray-400 mt-0.5">
                    {timeAgo(item.created_at)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card className="p-5">
          <div className="flex items-center justify-between mb-3">
            <p
              className="text-sm font-semibold text-[#222222]"
              style={{
                fontFamily: '"Poppins", sans-serif',
              }}
            >
              Latest Candidates
            </p>
            <button className="text-[11px] text-[#A10000] hover:underline">
              View all
            </button>
          </div>
          <div className="space-y-2.5">
            {dashboard.latestCandidates.length === 0 && (
              <p className="text-xs text-gray-400 py-4">No candidates yet.</p>
            )}
            {dashboard.latestCandidates.map((c) => (
              <div key={c.id} className="flex items-center gap-2.5">
                <Avatar name={c.name} photo={c.photo ?? undefined} size="sm" />
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-semibold text-[#222222] truncate">
                    {c.name}
                  </div>
                  <div className="text-[10px] text-gray-400 truncate">
                    {(c.program ?? "No program").split(" ").slice(0, 2).join(" ")}
                  </div>
                </div>
                <StatusChip status={c.status} />
              </div>
            ))}
          </div>
        </Card>

        <Card className="p-5">
          <div className="flex items-center justify-between mb-3">
            <p
              className="text-sm font-semibold text-[#222222]"
              style={{
                fontFamily: '"Poppins", sans-serif',
              }}
            >
              Pending Requests
            </p>
            <Chip variant="warning">
              {dashboard.pendingRequests.length} pending
            </Chip>
          </div>
          <div className="space-y-3">
            {pendingRequest ? (
              <div className="p-3 rounded-xl border border-amber-100 bg-amber-50/60">
                <div className="flex items-center gap-2.5 mb-2.5">
                  <div className="w-8 h-8 rounded-lg bg-amber-100 flex items-center justify-center text-amber-800 text-xs font-bold">
                    {requestLogo(pendingRequest.agency_name)}
                  </div>
                  <div>
                    <div className="text-xs font-semibold text-[#222222]">
                      {pendingRequest.agency_name}
                    </div>
                    <div className="text-[10px] text-gray-500">
                      {pendingRequest.industry ?? "No industry"} •{" "}
                      {new Date(pendingRequest.created_at).toLocaleDateString()}
                    </div>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button className="flex-1 text-xs py-1.5 rounded-lg bg-[#A10000] text-white font-medium hover:bg-[#8a0000] transition">
                    Approve
                  </button>
                  <button className="flex-1 text-xs py-1.5 rounded-lg border border-gray-200 text-gray-600 font-medium hover:bg-gray-50 transition">
                    Decline
                  </button>
                </div>
              </div>
            ) : (
              <p className="text-xs text-center text-gray-400 py-6">
                No pending requests
              </p>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}
