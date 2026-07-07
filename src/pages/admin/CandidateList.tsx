import { useEffect, useState } from "react";
import { Search, Filter, Download, Plus, MoreHorizontal } from "lucide-react";
import { Card } from "../../components/shared/Card";
import { Btn } from "../../components/shared/Btn";
import { Avatar } from "../../components/shared/Avatar";
import { StatusChip } from "../../components/shared/Chip";
import { ReadinessBar } from "../../components/shared/ReadinessBar";
import {
  getCandidatePrograms,
  getCandidates,
  type CandidateRecord,
} from "../../services/candidateService";

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(value));
}

export function CandidateList({
  onSelect,
}: {
  onSelect: (id: string) => void;
}) {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [programFilter, setProgramFilter] = useState("all");
  const [candidates, setCandidates] = useState<CandidateRecord[]>([]);
  const [programs, setPrograms] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    getCandidatePrograms()
      .then((data) => {
        if (active) setPrograms(data);
      })
      .catch((err) => {
        console.error(err);
      });

    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    let active = true;

    setLoading(true);
    setError("");

    getCandidates({
      search,
      status: statusFilter,
      program: programFilter,
    })
      .then((data) => {
        if (active) setCandidates(data);
      })
      .catch((err) => {
        console.error(err);
        if (active) setError("Unable to load candidates from Supabase.");
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [search, statusFilter, programFilter]);

  return (
    <div className="p-6 space-y-4 max-w-screen-xl">
      <div className="flex items-center justify-between">
        <div>
          <h2
            className="text-base font-semibold text-[#222222]"
            style={{
              fontFamily: '"Plus Jakarta Sans", sans-serif',
            }}
          >
            Candidates
          </h2>
          <p className="text-xs text-gray-500 mt-0.5">
            {candidates.length} total candidates
          </p>
        </div>
        <Btn>
          <Plus size={13} />
          Add Candidate
        </Btn>
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
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-1.5 text-xs border border-[#E5E7EB] rounded-lg bg-white text-gray-600 outline-none cursor-pointer"
          >
            <option value="all">All Statuses</option>
            <option value="job_ready">Job Ready</option>
            <option value="in_training">In Training</option>
            <option value="placed">Placed</option>
          </select>
          <select
            value={programFilter}
            onChange={(e) => setProgramFilter(e.target.value)}
            className="px-3 py-1.5 text-xs border border-[#E5E7EB] rounded-lg bg-white text-gray-600 outline-none cursor-pointer"
          >
            <option value="all">All Programs</option>
            {programs.map((program) => (
              <option key={program} value={program}>
                {program}
              </option>
            ))}
          </select>
          <Btn variant="outline" size="sm">
            <Filter size={12} />
            Filters
          </Btn>
          <Btn variant="outline" size="sm" className="ml-auto">
            <Download size={12} />
            Export
          </Btn>
        </div>
      </Card>

      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[#E5E7EB] bg-[#F8F9FB]">
                {[
                  "Candidate",
                  "Program",
                  "Skills",
                  "English Level",
                  "Status",
                  "Readiness",
                  "Availability",
                  "Updated",
                  "",
                ].map((h, i) => (
                  <th
                    key={i}
                    className={`text-left px-4 py-2.5 text-[10px] font-semibold text-gray-500 uppercase tracking-wider ${
                      i === 2 || i === 3
                        ? "hidden lg:table-cell"
                        : i === 6 || i === 7
                          ? "hidden xl:table-cell"
                          : ""
                    }`}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading && (
                <tr>
                  <td
                    colSpan={9}
                    className="px-4 py-12 text-center text-sm text-gray-400"
                  >
                    Loading candidates...
                  </td>
                </tr>
              )}
              {!loading && error && (
                <tr>
                  <td
                    colSpan={9}
                    className="px-4 py-12 text-center text-sm text-red-500"
                  >
                    {error}
                  </td>
                </tr>
              )}
              {!loading && !error && candidates.map((c, idx) => (
                <tr
                  key={c.id}
                  onClick={() => onSelect(c.id)}
                  className={`border-b border-[#E5E7EB] hover:bg-[#F8F9FB] cursor-pointer transition-colors ${idx === candidates.length - 1 ? "border-b-0" : ""}`}
                >
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2.5">
                      <Avatar name={c.name} photo={c.photo ?? undefined} size="sm" />
                      <div>
                        <div className="text-sm font-medium text-[#222222]">
                          {c.name}
                        </div>
                        <div className="text-[11px] text-gray-400">
                          {c.title ?? "No title"}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-xs text-gray-500 max-w-[140px]">
                    <span className="truncate block">{c.program ?? "No program"}</span>
                  </td>
                  <td className="px-4 py-3 hidden lg:table-cell">
                    <div className="flex flex-wrap gap-1">
                      {c.skills.slice(0, 2).map((s) => (
                        <span
                          key={s}
                          className="text-[10px] bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded-md"
                        >
                          {s}
                        </span>
                      ))}
                      {c.skills.length > 2 && (
                        <span className="text-[10px] text-gray-400">
                          +{c.skills.length - 2}
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-xs text-gray-600 hidden lg:table-cell">
                    {c.english_level ?? "Not set"}
                  </td>
                  <td className="px-4 py-3">
                    <StatusChip status={c.status} />
                  </td>
                  <td className="px-4 py-3 w-28">
                    <ReadinessBar score={c.readiness_score} />
                  </td>
                  <td className="px-4 py-3 text-xs text-gray-600 hidden xl:table-cell">
                    {c.availability ?? "Not set"}
                  </td>
                  <td className="px-4 py-3 text-xs text-gray-400 hidden xl:table-cell">
                    {formatDate(c.updated_at)}
                  </td>
                  <td className="px-4 py-3">
                    <button
                      className="p-1 hover:bg-gray-100 rounded-md transition"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <MoreHorizontal size={14} className="text-gray-400" />
                    </button>
                  </td>
                </tr>
              ))}
              {!loading && !error && candidates.length === 0 && (
                <tr>
                  <td
                    colSpan={9}
                    className="px-4 py-12 text-center text-sm text-gray-400"
                  >
                    No candidates match your filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
