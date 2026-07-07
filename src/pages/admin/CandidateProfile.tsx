import { useEffect, useState } from "react";
import {
  ArrowLeft,
  CheckCircle,
  Shield,
  Zap,
  MapPin,
  Mail,
  Phone,
  Download,
  Send,
  FileText,
  MessageSquare,
} from "lucide-react";
import { PieChart, Pie, Cell } from "recharts";
import { Card } from "../../components/shared/Card";
import { Btn } from "../../components/shared/Btn";
import { Avatar } from "../../components/shared/Avatar";
import { Chip } from "../../components/shared/Chip";
import { RED, SUCCESS, WARNING } from "../../lib/constants";
import {
  getCandidate,
  type CandidateRecord,
} from "../../services/candidateService";

export function CandidateProfile({
  candidateId,
  onBack,
}: {
  candidateId: string;
  onBack: () => void;
}) {
  const [activeTab, setActiveTab] = useState("overview");
  const [candidate, setCandidate] = useState<CandidateRecord | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    setLoading(true);
    setError("");

    getCandidate(candidateId)
      .then((data) => {
        if (active) setCandidate(data);
      })
      .catch((err) => {
        console.error(err);
        if (active) setError("Unable to load candidate profile.");
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [candidateId]);

  if (loading) {
    return (
      <div className="p-6 max-w-screen-xl">
        <Card className="p-6 text-sm text-gray-500">
          Loading candidate profile...
        </Card>
      </div>
    );
  }

  if (error || !candidate) {
    return (
      <div className="p-6 max-w-screen-xl space-y-4">
        <button
          onClick={onBack}
          className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-[#222222] transition"
        >
          <ArrowLeft size={13} />
          Back to Candidates
        </button>
        <Card className="p-6 text-sm text-gray-500">
          {error || "Candidate not found."}
        </Card>
      </div>
    );
  }

  const c = candidate;

  const tabs = [
    "Overview",
    "Resume",
    "Skills",
    "Assessment",
    "Training",
    "Certificates",
    "Documents",
  ];

  const scoreDonut = [
    { value: c.readiness_score },
    { value: 100 - c.readiness_score },
  ];
  const scoreColor =
    c.readiness_score >= 85
      ? SUCCESS
      : c.readiness_score >= 65
        ? WARNING
        : "#DC2626";

  return (
    <div className="p-6 space-y-4 max-w-screen-xl">
      <button
        onClick={onBack}
        className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-[#222222] transition"
      >
        <ArrowLeft size={13} />
        Back to Candidates
      </button>

      <Card className="p-5">
        <div className="flex flex-wrap items-start gap-4 justify-between">
          <div className="flex items-start gap-4">
            <div className="relative flex-shrink-0">
              <Avatar name={c.name} photo={c.photo ?? undefined} size="xl" />
              <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-green-500 border-2 border-white flex items-center justify-center">
                <CheckCircle size={10} color="white" fill="white" />
              </div>
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h2
                  className="text-xl font-bold text-[#222222]"
                  style={{
                    fontFamily: '"Plus Jakarta Sans", sans-serif',
                  }}
                >
                  {c.name}
                </h2>
                <Chip variant="success">
                  <Shield size={9} />
                  Verified
                </Chip>
                {c.status === "job_ready" && (
                  <Chip variant="primary">
                    <Zap size={9} />
                    Job Ready
                  </Chip>
                )}
              </div>
              <p className="text-sm text-gray-500 mt-0.5">
                {c.title ?? "No title"} · {c.program ?? "No program"}
              </p>
              <div className="flex flex-wrap items-center gap-3 mt-2 text-xs text-gray-400">
                <span className="flex items-center gap-1">
                  <MapPin size={11} />
                  {c.province ?? "Not set"}
                </span>
                <span className="flex items-center gap-1">
                  <Mail size={11} />
                  {c.email ?? "No email"}
                </span>
                <span className="flex items-center gap-1">
                  <Phone size={11} />
                  {c.phone ?? "No phone"}
                </span>
              </div>
            </div>
          </div>
          <div className="flex gap-2 flex-wrap">
            <Btn variant="outline">
              <Download size={13} />
              Download Resume
            </Btn>
            <Btn>
              <Send size={13} />
              Endorse Candidate
            </Btn>
          </div>
        </div>
        <div className="mt-4 pt-4 border-t border-[#E5E7EB]">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-xs font-medium text-gray-500">
              Profile Completion
            </span>
            <span className="text-xs font-bold text-[#222222]">
              {c.readiness_score}%
            </span>
          </div>
          <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all"
              style={{
                width: `${c.readiness_score}%`,
                backgroundColor: RED,
              }}
            />
          </div>
        </div>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_252px] gap-4">
        <div className="space-y-4">
          <Card className="overflow-hidden">
            <div className="flex border-b border-[#E5E7EB] px-4 overflow-x-auto gap-1">
              {tabs.map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab.toLowerCase())}
                  className={`px-3 py-3 text-xs font-medium whitespace-nowrap border-b-2 -mb-px transition-colors ${
                    activeTab === tab.toLowerCase()
                      ? "border-[#A10000] text-[#A10000]"
                      : "border-transparent text-gray-500 hover:text-[#222222]"
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>
            <div className="p-5">
              {activeTab === "overview" && (
                <div className="space-y-5">
                  <div>
                    <h4
                      className="text-sm font-semibold text-[#222222] mb-2"
                      style={{
                        fontFamily: '"Plus Jakarta Sans", sans-serif',
                      }}
                    >
                      About
                    </h4>
                    <p className="text-sm text-gray-600 leading-relaxed">
                      {c.name} is a motivated {c.title ?? "candidate"} with{" "}
                      {c.experience ?? "relevant"} professional experience.
                      Currently enrolled in the{" "}
                      {c.program ?? "Step Up PH"} program at Step Up PH,
                      demonstrating strong
                      communication skills and exceptional aptitude for
                      professional growth and client-facing roles.
                    </p>
                  </div>
                  <div>
                    <h4
                      className="text-sm font-semibold text-[#222222] mb-2"
                      style={{
                        fontFamily: '"Plus Jakarta Sans", sans-serif',
                      }}
                    >
                      Core Skills
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {c.skills.map((s) => (
                        <span
                          key={s}
                          className="px-3 py-1.5 rounded-lg bg-[#F8F9FB] border border-[#E5E7EB] text-xs text-gray-700"
                        >
                          {s}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div>
                      <h4
                        className="text-sm font-semibold text-[#222222] mb-2"
                        style={{
                          fontFamily: '"Plus Jakarta Sans", sans-serif',
                        }}
                      >
                        Employment History
                      </h4>
                      <div className="border border-[#E5E7EB] rounded-xl p-3">
                        <div className="text-sm font-medium text-[#222222]">
                          Client Support Associate
                        </div>
                        <div className="text-xs text-gray-500 mt-0.5">
                          Local BPO Company · {c.experience ?? "Not set"}
                        </div>
                        <div className="text-xs text-gray-400 mt-0.5">
                          Metro Manila, Philippines
                        </div>
                      </div>
                    </div>
                    <div>
                      <h4
                        className="text-sm font-semibold text-[#222222] mb-2"
                        style={{
                          fontFamily: '"Plus Jakarta Sans", sans-serif',
                        }}
                      >
                        Education
                      </h4>
                      <div className="border border-[#E5E7EB] rounded-xl p-3">
                        <div className="text-sm font-medium text-[#222222]">
                          Bachelor of Arts in Communication
                        </div>
                        <div className="text-xs text-gray-500 mt-0.5">
                          State University · 2022
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
              {activeTab !== "overview" && (
                <div className="flex flex-col items-center justify-center h-32 text-gray-400">
                  <FileText size={24} className="mb-2 opacity-40" />
                  <p className="text-sm">
                    {tabs.find((t) => t.toLowerCase() === activeTab)} content
                  </p>
                  <p className="text-xs mt-1">
                    Section available in production
                  </p>
                </div>
              )}
            </div>
          </Card>
        </div>

        <div className="space-y-4">
          <Card className="p-4">
            <h4
              className="text-sm font-semibold text-[#222222] mb-3"
              style={{
                fontFamily: '"Plus Jakarta Sans", sans-serif',
              }}
            >
              Readiness Score
            </h4>
            <div className="flex justify-center mb-3">
              <div className="relative">
                <PieChart width={100} height={100}>
                  <Pie
                    data={scoreDonut}
                    cx={45}
                    cy={45}
                    innerRadius={32}
                    outerRadius={44}
                    dataKey="value"
                    startAngle={90}
                    endAngle={-270}
                    strokeWidth={0}
                  >
                    {scoreDonut.map((_, idx) => (
                      <Cell
                        key={`score-${idx}`}
                        fill={idx === 0 ? scoreColor : "#F3F4F6"}
                      />
                    ))}
                  </Pie>
                </PieChart>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span
                    className="text-lg font-bold text-[#222222]"
                    style={{
                      fontFamily: '"Plus Jakarta Sans", sans-serif',
                    }}
                  >
                    {c.readiness_score}
                  </span>
                  <span className="text-[9px] text-gray-400">/100</span>
                </div>
              </div>
            </div>
            <div className="space-y-2.5">
              {[
                ["Communication", 88],
                ["Attendance", 95],
                ["Assessment", Math.max(c.readiness_score - 5, 60)],
                ["English", 82],
              ].map(([label, val]) => (
                <div key={label}>
                  <div className="flex justify-between mb-1">
                    <span className="text-[11px] text-gray-500">{label}</span>
                    <span className="text-[11px] font-semibold text-[#222222]">
                      {val}%
                    </span>
                  </div>
                  <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full"
                      style={{
                        width: `${val}%`,
                        backgroundColor: RED,
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </Card>

          <Card className="p-4">
            <h4
              className="text-sm font-semibold text-[#222222] mb-3"
              style={{
                fontFamily: '"Plus Jakarta Sans", sans-serif',
              }}
            >
              Details
            </h4>
            <div className="space-y-2.5">
              {[
                ["Availability", c.availability ?? "Not set"],
                ["Preferred Work", c.preferred_work ?? "Not set"],
                ["Expected Salary", c.expected_salary ?? "Not set"],
                ["Location", c.province ?? "Not set"],
                ["English Level", c.english_level ?? "Not set"],
                ["Experience", c.experience ?? "Not set"],
              ].map(([label, value]) => (
                <div key={label} className="flex justify-between gap-2">
                  <span className="text-[11px] text-gray-400 flex-shrink-0">
                    {label}
                  </span>
                  <span className="text-[11px] font-medium text-[#222222] text-right">
                    {value}
                  </span>
                </div>
              ))}
            </div>
          </Card>

          <Card className="p-4">
            <h4
              className="text-sm font-semibold text-[#222222] mb-3"
              style={{
                fontFamily: '"Plus Jakarta Sans", sans-serif',
              }}
            >
              Quick Actions
            </h4>
            <div className="space-y-2">
              <Btn className="w-full justify-center" size="sm">
                <Send size={12} />
                Endorse to Agency
              </Btn>
              <Btn
                variant="outline"
                className="w-full justify-center"
                size="sm"
              >
                <MessageSquare size={12} />
                Send Message
              </Btn>
              <Btn
                variant="outline"
                className="w-full justify-center"
                size="sm"
              >
                <Download size={12} />
                Export Profile
              </Btn>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
