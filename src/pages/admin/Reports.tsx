import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { Card } from "../../components/shared/Card";
import { skillsData, monthlyGrowthData } from "../../data/chartData";
import { RED } from "../../lib/constants";

export function ReportsPage() {
  return (
    <div className="p-6 space-y-4 max-w-screen-xl">
      <div>
        <h2
          className="text-base font-semibold text-[#222222]"
          style={{
            fontFamily: '"Plus Jakarta Sans", sans-serif',
          }}
        >
          Reports & Analytics
        </h2>
        <p className="text-xs text-gray-500 mt-0.5">
          Platform-wide performance overview
        </p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          {
            label: "Placement Rate",
            value: "34.4%",
            trend: "+8% vs last quarter",
          },
          {
            label: "Avg. Hiring Time",
            value: "19.6d",
            trend: "Endorsement to hire",
          },
          {
            label: "Total Endorsements",
            value: "64",
            trend: "This quarter",
          },
          {
            label: "Program Completion",
            value: "87%",
            trend: "Across all programs",
          },
        ].map((s, i) => (
          <Card key={i} className="p-4">
            <div
              className="text-xl font-bold text-[#A10000] tabular-nums"
              style={{
                fontFamily: '"Plus Jakarta Sans", sans-serif',
              }}
            >
              {s.value}
            </div>
            <div className="text-xs font-semibold text-[#222222] mt-0.5">
              {s.label}
            </div>
            <div className="text-[10px] text-gray-400 mt-0.5">{s.trend}</div>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card className="p-5">
          <p
            className="text-sm font-semibold text-[#222222] mb-1"
            style={{
              fontFamily: '"Plus Jakarta Sans", sans-serif',
            }}
          >
            Top Candidate Skills
          </p>
          <p className="text-xs text-gray-400 mb-4">
            Most common skills across all 247 candidates
          </p>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart
              data={skillsData}
              layout="vertical"
              margin={{ left: 8, right: 8 }}
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
                dataKey="skill"
                tick={{ fontSize: 11, fill: "#6B7280" }}
                axisLine={false}
                tickLine={false}
                width={105}
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
                maxBarSize={16}
              />
            </BarChart>
          </ResponsiveContainer>
        </Card>

        <Card className="p-5">
          <p
            className="text-sm font-semibold text-[#222222] mb-1"
            style={{
              fontFamily: '"Plus Jakarta Sans", sans-serif',
            }}
          >
            Placement Rate Trend
          </p>
          <p className="text-xs text-gray-400 mb-4">
            Monthly successful placements over 6 months
          </p>
          <ResponsiveContainer width="100%" height={220}>
            <LineChart
              data={monthlyGrowthData}
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
                }}
              />
              <Line
                type="monotone"
                dataKey="candidates"
                stroke={RED}
                strokeWidth={2}
                dot={{ fill: RED, r: 3, strokeWidth: 0 }}
                activeDot={{ r: 5 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </Card>

        <Card className="p-5">
          <p
            className="text-sm font-semibold text-[#222222] mb-1"
            style={{
              fontFamily: '"Plus Jakarta Sans", sans-serif',
            }}
          >
            Top Agencies by Placements
          </p>
          <p className="text-xs text-gray-400 mb-4">
            Partner agencies ranked by successful hires
          </p>
          <div className="space-y-3">
            {[
              { name: "TalentFirst Asia", placements: 18 },
              {
                name: "GlobalHire Philippines",
                placements: 12,
              },
              { name: "CareerBridge Solutions", placements: 9 },
              { name: "PrimePlacements Inc.", placements: 2 },
            ].map((a, i) => (
              <div key={i}>
                <div className="flex justify-between mb-1.5">
                  <span className="text-xs text-gray-600">{a.name}</span>
                  <span className="text-xs font-semibold text-[#222222]">
                    {a.placements} hires
                  </span>
                </div>
                <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full"
                    style={{
                      width: `${(a.placements / 18) * 100}%`,
                      backgroundColor: RED,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card className="p-5">
          <p
            className="text-sm font-semibold text-[#222222] mb-1"
            style={{
              fontFamily: '"Plus Jakarta Sans", sans-serif',
            }}
          >
            Average Hiring Timeline
          </p>
          <p className="text-xs text-gray-400 mb-4">
            Average days per stage in the pipeline
          </p>
          <div className="grid grid-cols-2 gap-3 mb-4">
            {[
              { label: "Endorsement → Shortlist", days: 4.2 },
              { label: "Shortlist → Interview", days: 6.8 },
              { label: "Interview → Offer", days: 3.5 },
              { label: "Offer → Hire", days: 5.1 },
            ].map((item, i) => (
              <div
                key={i}
                className="text-center p-3 rounded-xl bg-[#F8F9FB] border border-[#E5E7EB]"
              >
                <div
                  className="text-2xl font-bold text-[#A10000]"
                  style={{
                    fontFamily: '"Plus Jakarta Sans", sans-serif',
                  }}
                >
                  {item.days}d
                </div>
                <div className="text-[10px] text-gray-500 mt-1 leading-snug">
                  {item.label}
                </div>
              </div>
            ))}
          </div>
          <div className="flex items-center justify-between p-3 rounded-xl border border-[#E5E7EB] bg-[#F8F9FB]">
            <span className="text-sm text-gray-600 font-medium">
              Total Average
            </span>
            <span
              className="text-lg font-bold text-[#222222]"
              style={{
                fontFamily: '"Plus Jakarta Sans", sans-serif',
              }}
            >
              19.6 days
            </span>
          </div>
        </Card>
      </div>
    </div>
  );
}
