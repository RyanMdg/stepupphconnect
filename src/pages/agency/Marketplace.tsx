import { useState } from "react";
import { Search, MapPin, Bookmark, XCircle } from "lucide-react";
import { Card } from "../../components/shared/Card";
import { Btn } from "../../components/shared/Btn";
import { Avatar } from "../../components/shared/Avatar";
import { ReadinessBar } from "../../components/shared/ReadinessBar";
import { candidates } from "../../data/candidates";
import { programs } from "../../data/programs";

export function CandidateMarketplace() {
  const [search, setSearch] = useState("");
  const [skillFilter, setSkillFilter] = useState("all");
  const [showModal, setShowModal] = useState<number | null>(null);
  const [savedIds, setSavedIds] = useState<number[]>([]);

  const available = candidates.filter((c) => c.status === "job_ready");
  const allSkills = Array.from(new Set(available.flatMap((c) => c.skills)));

  const filtered = available.filter((c) => {
    const matchSearch =
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.title.toLowerCase().includes(search.toLowerCase());
    const matchSkill = skillFilter === "all" || c.skills.includes(skillFilter);
    return matchSearch && matchSkill;
  });

  const toggle = (id: number) =>
    setSavedIds((ids) =>
      ids.includes(id) ? ids.filter((i) => i !== id) : [...ids, id],
    );
  const modal = candidates.find((c) => c.id === showModal);

  return (
    <div className="p-6 space-y-4 max-w-screen-xl">
      <div>
        <h2
          className="text-base font-semibold text-[#222222]"
          style={{
            fontFamily: '"Plus Jakarta Sans", sans-serif',
          }}
        >
          Candidate Marketplace
        </h2>
        <p className="text-xs text-gray-500 mt-0.5">
          {filtered.length} job-ready candidates available from Step Up PH
        </p>
      </div>

      <Card className="p-3.5">
        <div className="flex flex-wrap gap-2.5">
          <div className="relative flex-1 min-w-48">
            <Search
              size={13}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search candidates..."
              className="pl-8 pr-4 py-1.5 text-xs w-full bg-[#F8F9FB] border border-[#E5E7EB] rounded-lg outline-none focus:border-gray-300 transition"
            />
          </div>
          <select
            value={skillFilter}
            onChange={(e) => setSkillFilter(e.target.value)}
            className="px-3 py-1.5 text-xs border border-[#E5E7EB] rounded-lg bg-white text-gray-600 outline-none cursor-pointer"
          >
            <option value="all">All Skills</option>
            {allSkills.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
          <select className="px-3 py-1.5 text-xs border border-[#E5E7EB] rounded-lg bg-white text-gray-600 outline-none cursor-pointer">
            <option>Any Location</option>
            <option>Metro Manila</option>
            <option>Cebu</option>
            <option>Davao</option>
          </select>
          <select className="px-3 py-1.5 text-xs border border-[#E5E7EB] rounded-lg bg-white text-gray-600 outline-none cursor-pointer">
            <option>Any Availability</option>
            <option>Immediate</option>
            <option>Within 2 weeks</option>
          </select>
          <select className="px-3 py-1.5 text-xs border border-[#E5E7EB] rounded-lg bg-white text-gray-600 outline-none cursor-pointer">
            <option>All Programs</option>
            {programs.map((p) => (
              <option key={p.id}>{p.name}</option>
            ))}
          </select>
        </div>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {filtered.map((c) => (
          <Card key={c.id} className="p-5 hover:shadow-md transition-shadow">
            <div className="flex items-start gap-3 mb-3">
              <Avatar name={c.name} photo={c.photo} size="lg" />
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-1">
                  <div className="min-w-0">
                    <div
                      className="text-sm font-semibold text-[#222222] truncate"
                      style={{
                        fontFamily: '"Plus Jakarta Sans", sans-serif',
                      }}
                    >
                      {c.name}
                    </div>
                    <div className="text-xs text-gray-500">{c.title}</div>
                  </div>
                  <button
                    onClick={() => toggle(c.id)}
                    className="p-1 rounded-md hover:bg-gray-100 transition flex-shrink-0"
                  >
                    <Bookmark
                      size={14}
                      className={
                        savedIds.includes(c.id)
                          ? "text-[#A10000]"
                          : "text-gray-300"
                      }
                      fill={savedIds.includes(c.id) ? "#A10000" : "none"}
                    />
                  </button>
                </div>
                <div className="flex items-center gap-1 mt-1 text-[10px] text-gray-400">
                  <MapPin size={10} />
                  {c.province}
                </div>
              </div>
            </div>

            <div className="flex flex-wrap gap-1 mb-3">
              {c.skills.slice(0, 3).map((s) => (
                <span
                  key={s}
                  className="text-[10px] bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded-md"
                >
                  {s}
                </span>
              ))}
            </div>

            <div className="grid grid-cols-3 gap-2 mb-3">
              {[
                ["Readiness", `${c.readinessScore}%`],
                ["Experience", c.experience],
                ["Available", c.availability],
              ].map(([label, val]) => (
                <div
                  key={label}
                  className="text-center p-2 rounded-lg bg-[#F8F9FB]"
                >
                  <div className="text-xs font-semibold text-[#222222] truncate">
                    {val}
                  </div>
                  <div className="text-[10px] text-gray-400">{label}</div>
                </div>
              ))}
            </div>

            <div className="mb-3">
              <ReadinessBar score={c.readinessScore} />
            </div>

            <div className="flex gap-2">
              <Btn
                variant="outline"
                size="sm"
                className="flex-1 justify-center"
              >
                View Profile
              </Btn>
              <Btn
                size="sm"
                className="flex-1 justify-center"
                onClick={() => setShowModal(c.id)}
              >
                Request
              </Btn>
            </div>
          </Card>
        ))}
        {filtered.length === 0 && (
          <div className="col-span-3 py-12 text-center text-sm text-gray-400">
            No candidates match your filters.
          </div>
        )}
      </div>

      {showModal !== null && modal && (
        <div
          className="fixed inset-0 bg-black/30 flex items-center justify-center z-50 p-4"
          onClick={() => setShowModal(null)}
        >
          <Card
            className="w-full max-w-md p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h3
                className="font-semibold text-[#222222]"
                style={{
                  fontFamily: '"Plus Jakarta Sans", sans-serif',
                }}
              >
                Request Candidate
              </h3>
              <button
                onClick={() => setShowModal(null)}
                className="p-1.5 hover:bg-gray-100 rounded-lg transition"
              >
                <XCircle size={16} className="text-gray-400" />
              </button>
            </div>
            <div className="space-y-4">
              <div className="flex items-center gap-3 p-3 rounded-xl bg-[#F8F9FB] border border-[#E5E7EB]">
                <Avatar name={modal.name} photo={modal.photo} size="md" />
                <div>
                  <div className="text-sm font-semibold text-[#222222]">
                    {modal.name}
                  </div>
                  <div className="text-xs text-gray-500">{modal.title}</div>
                </div>
              </div>
              <div className="space-y-3">
                <div>
                  <label className="text-xs font-medium text-gray-600 block mb-1.5">
                    Position / Role
                  </label>
                  <input
                    placeholder="e.g. Customer Service Representative"
                    className="w-full px-3 py-2 text-xs border border-[#E5E7EB] rounded-lg outline-none focus:border-gray-400 transition bg-white"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-600 block mb-1.5">
                    Reason for Request
                  </label>
                  <textarea
                    placeholder="Describe why you are requesting this candidate..."
                    rows={3}
                    className="w-full px-3 py-2 text-xs border border-[#E5E7EB] rounded-lg outline-none focus:border-gray-400 transition resize-none bg-white"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-medium text-gray-600 block mb-1.5">
                      Offered Salary
                    </label>
                    <input
                      placeholder="₱ Amount / Range"
                      className="w-full px-3 py-2 text-xs border border-[#E5E7EB] rounded-lg outline-none focus:border-gray-400 transition bg-white"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-gray-600 block mb-1.5">
                      Urgency
                    </label>
                    <select className="w-full px-3 py-2 text-xs border border-[#E5E7EB] rounded-lg outline-none bg-white cursor-pointer">
                      <option>Normal</option>
                      <option>Urgent</option>
                      <option>Immediate Fill</option>
                    </select>
                  </div>
                </div>
              </div>
              <div className="flex gap-2 pt-1">
                <Btn
                  variant="outline"
                  className="flex-1 justify-center"
                  onClick={() => setShowModal(null)}
                >
                  Cancel
                </Btn>
                <Btn
                  className="flex-1 justify-center"
                  onClick={() => setShowModal(null)}
                >
                  Submit Request
                </Btn>
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
