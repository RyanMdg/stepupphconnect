import { useEffect, useMemo, useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { Bookmark, Loader2, MapPin, Search, XCircle } from "lucide-react";
import { Avatar } from "../../components/shared/Avatar";
import { Btn } from "../../components/shared/Btn";
import { Card } from "../../components/shared/Card";
import { ReadinessBar } from "../../components/shared/ReadinessBar";
import type { CandidateRecord } from "../../services/candidateService";
import {
  createCandidateRequest,
  getCurrentAgencyProfile,
  getMarketplaceCandidates,
  getSavedCandidateIds,
  saveCandidate,
  unsaveCandidate,
} from "../../services/agencyPortalService";

const emptyRequest = {
  position: "",
  reason: "",
  offeredSalary: "",
  urgency: "normal",
};

export function CandidateMarketplace() {
  const navigate = useNavigate();
  const [agencyId, setAgencyId] = useState("");
  const [candidates, setCandidates] = useState<CandidateRecord[]>([]);
  const [savedIds, setSavedIds] = useState<string[]>([]);
  const [search, setSearch] = useState("");
  const [skillFilter, setSkillFilter] = useState("all");
  const [locationFilter, setLocationFilter] = useState("all");
  const [availabilityFilter, setAvailabilityFilter] = useState("all");
  const [programFilter, setProgramFilter] = useState("all");
  const [selectedCandidate, setSelectedCandidate] =
    useState<CandidateRecord | null>(null);
  const [requestForm, setRequestForm] = useState(emptyRequest);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    let active = true;

    async function loadMarketplace() {
      setLoading(true);
      setError("");

      try {
        const [agency, candidateRows] = await Promise.all([
          getCurrentAgencyProfile(),
          getMarketplaceCandidates(),
        ]);
        const saved = await getSavedCandidateIds(agency.id);

        if (!active) return;
        setAgencyId(agency.id);
        setCandidates(candidateRows);
        setSavedIds(saved);
      } catch {
        if (active) {
          setError("Unable to load marketplace. Check agency access policies.");
        }
      } finally {
        if (active) setLoading(false);
      }
    }

    loadMarketplace();

    return () => {
      active = false;
    };
  }, []);

  const allSkills = useMemo(
    () => Array.from(new Set(candidates.flatMap((candidate) => candidate.skills))),
    [candidates],
  );

  const allLocations = useMemo(
    () =>
      Array.from(
        new Set(candidates.map((candidate) => candidate.province).filter(Boolean)),
      ) as string[],
    [candidates],
  );

  const allPrograms = useMemo(
    () =>
      Array.from(
        new Set(candidates.map((candidate) => candidate.program).filter(Boolean)),
      ) as string[],
    [candidates],
  );

  const filtered = candidates.filter((candidate) => {
    const query = search.trim().toLowerCase();
    const matchSearch =
      !query ||
      candidate.name.toLowerCase().includes(query) ||
      (candidate.title ?? "").toLowerCase().includes(query) ||
      candidate.skills.some((skill) => skill.toLowerCase().includes(query));
    const matchSkill =
      skillFilter === "all" || candidate.skills.includes(skillFilter);
    const matchLocation =
      locationFilter === "all" || candidate.province === locationFilter;
    const matchAvailability =
      availabilityFilter === "all" ||
      candidate.availability === availabilityFilter;
    const matchProgram =
      programFilter === "all" || candidate.program === programFilter;

    return (
      matchSearch &&
      matchSkill &&
      matchLocation &&
      matchAvailability &&
      matchProgram
    );
  });

  async function toggleSave(candidateId: string) {
    if (!agencyId) return;

    const isSaved = savedIds.includes(candidateId);
    setSavedIds((current) =>
      isSaved
        ? current.filter((id) => id !== candidateId)
        : [...current, candidateId],
    );
    setError("");

    try {
      if (isSaved) {
        await unsaveCandidate(agencyId, candidateId);
      } else {
        await saveCandidate(agencyId, candidateId);
      }
    } catch {
      setSavedIds((current) =>
        isSaved
          ? [...current, candidateId]
          : current.filter((id) => id !== candidateId),
      );
      setError("Unable to update saved candidates.");
    }
  }

  function openRequest(candidate: CandidateRecord) {
    setSelectedCandidate(candidate);
    setRequestForm({
      ...emptyRequest,
      position: candidate.title ?? "",
    });
    setError("");
    setSuccess("");
  }

  async function submitRequest(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!agencyId || !selectedCandidate) return;

    setSaving(true);
    setError("");
    setSuccess("");

    try {
      await createCandidateRequest(agencyId, {
        candidateId: selectedCandidate.id,
        position: requestForm.position.trim(),
        reason: requestForm.reason.trim(),
        offeredSalary: requestForm.offeredSalary.trim(),
        urgency: requestForm.urgency,
      });
      setSuccess(`${selectedCandidate.name} request submitted to Step Up PH.`);
      setSelectedCandidate(null);
      setRequestForm(emptyRequest);
    } catch {
      setError("Unable to submit request. Run the updated Supabase SQL policies.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="p-6 space-y-4 max-w-screen-xl">
      <div>
        <h2
          className="text-base font-semibold text-[#222222]"
          style={{
            fontFamily: '"Poppins", sans-serif',
          }}
        >
          Candidate Marketplace
        </h2>
        <p className="text-xs text-gray-500 mt-0.5">
          {filtered.length} job-ready candidates available from Step Up PH
        </p>
      </div>

      {(error || success) && (
        <div
          className={`rounded-xl border px-4 py-3 text-xs font-medium ${
            error
              ? "border-red-200 bg-red-50 text-red-700"
              : "border-green-200 bg-green-50 text-green-700"
          }`}
        >
          {error || success}
        </div>
      )}

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
            {allSkills.map((skill) => (
              <option key={skill} value={skill}>
                {skill}
              </option>
            ))}
          </select>
          <select
            value={locationFilter}
            onChange={(e) => setLocationFilter(e.target.value)}
            className="px-3 py-1.5 text-xs border border-[#E5E7EB] rounded-lg bg-white text-gray-600 outline-none cursor-pointer"
          >
            <option value="all">Any Location</option>
            {allLocations.map((location) => (
              <option key={location} value={location}>
                {location}
              </option>
            ))}
          </select>
          <select
            value={availabilityFilter}
            onChange={(e) => setAvailabilityFilter(e.target.value)}
            className="px-3 py-1.5 text-xs border border-[#E5E7EB] rounded-lg bg-white text-gray-600 outline-none cursor-pointer"
          >
            <option value="all">Any Availability</option>
            <option value="Immediate">Immediate</option>
            <option value="1 week">1 week</option>
            <option value="2 weeks">2 weeks</option>
            <option value="30 days">30 days</option>
            <option value="45 days">45 days</option>
          </select>
          <select
            value={programFilter}
            onChange={(e) => setProgramFilter(e.target.value)}
            className="px-3 py-1.5 text-xs border border-[#E5E7EB] rounded-lg bg-white text-gray-600 outline-none cursor-pointer"
          >
            <option value="all">All Programs</option>
            {allPrograms.map((program) => (
              <option key={program} value={program}>
                {program}
              </option>
            ))}
          </select>
        </div>
      </Card>

      {loading ? (
        <div className="flex h-64 items-center justify-center rounded-xl border border-dashed border-gray-200 bg-white">
          <Loader2 className="h-5 w-5 animate-spin text-gray-400" />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map((candidate) => {
            const isSaved = savedIds.includes(candidate.id);

            return (
              <Card
                key={candidate.id}
                className="p-5 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start gap-3 mb-3">
                  <Avatar
                    name={candidate.name}
                    photo={candidate.photo ?? undefined}
                    size="lg"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-1">
                      <div className="min-w-0">
                        <div
                          className="text-sm font-semibold text-[#222222] truncate"
                          style={{
                            fontFamily: '"Poppins", sans-serif',
                          }}
                        >
                          {candidate.name}
                        </div>
                        <div className="text-xs text-gray-500">
                          {candidate.title ?? "No title"}
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => toggleSave(candidate.id)}
                        className="p-1 rounded-md hover:bg-gray-100 transition flex-shrink-0"
                        aria-label={
                          isSaved
                            ? `Remove ${candidate.name} from saved candidates`
                            : `Save ${candidate.name}`
                        }
                      >
                        <Bookmark
                          size={14}
                          className={isSaved ? "text-[#A10000]" : "text-gray-300"}
                          fill={isSaved ? "#A10000" : "none"}
                        />
                      </button>
                    </div>
                    <div className="flex items-center gap-1 mt-1 text-[10px] text-gray-400">
                      <MapPin size={10} />
                      {candidate.province ?? "No location"}
                    </div>
                  </div>
                </div>

                <div className="flex flex-wrap gap-1 mb-3">
                  {candidate.skills.slice(0, 3).map((skill) => (
                    <span
                      key={skill}
                      className="text-[10px] bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded-md"
                    >
                      {skill}
                    </span>
                  ))}
                </div>

                <div className="grid grid-cols-3 gap-2 mb-3">
                  {[
                    ["Readiness", `${candidate.readiness_score}%`],
                    ["Experience", candidate.experience ?? "Not set"],
                    ["Available", candidate.availability ?? "Not set"],
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
                  <ReadinessBar score={candidate.readiness_score} />
                </div>

                <div className="flex gap-2">
                  <Btn
                    variant="outline"
                    size="sm"
                    className="flex-1 justify-center"
                    onClick={() => navigate(`/candidates/${candidate.id}`)}
                  >
                    View Profile
                  </Btn>
                  <Btn
                    size="sm"
                    className="flex-1 justify-center"
                    onClick={() => openRequest(candidate)}
                  >
                    Request
                  </Btn>
                </div>
              </Card>
            );
          })}
          {filtered.length === 0 && (
            <div className="col-span-full py-12 text-center text-sm text-gray-400">
              No candidates match your filters.
            </div>
          )}
        </div>
      )}

      {selectedCandidate && (
        <div
          className="fixed inset-0 bg-black/30 flex items-center justify-center z-50 p-4"
          onClick={() => setSelectedCandidate(null)}
        >
          <Card
            className="w-full max-w-md p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h3
                className="font-semibold text-[#222222]"
                style={{
                  fontFamily: '"Poppins", sans-serif',
                }}
              >
                Request Candidate
              </h3>
              <button
                type="button"
                onClick={() => setSelectedCandidate(null)}
                className="p-1.5 hover:bg-gray-100 rounded-lg transition"
              >
                <XCircle size={16} className="text-gray-400" />
              </button>
            </div>

            <form onSubmit={submitRequest} className="space-y-4">
              <div className="flex items-center gap-3 p-3 rounded-xl bg-[#F8F9FB] border border-[#E5E7EB]">
                <Avatar
                  name={selectedCandidate.name}
                  photo={selectedCandidate.photo ?? undefined}
                  size="md"
                />
                <div>
                  <div className="text-sm font-semibold text-[#222222]">
                    {selectedCandidate.name}
                  </div>
                  <div className="text-xs text-gray-500">
                    {selectedCandidate.title ?? "No title"}
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <div>
                  <label className="text-xs font-medium text-gray-600 block mb-1.5">
                    Position / Role
                  </label>
                  <input
                    value={requestForm.position}
                    onChange={(event) =>
                      setRequestForm((current) => ({
                        ...current,
                        position: event.target.value,
                      }))
                    }
                    placeholder="e.g. Customer Service Representative"
                    className="w-full px-3 py-2 text-xs border border-[#E5E7EB] rounded-lg outline-none focus:border-gray-400 transition bg-white"
                    required
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-600 block mb-1.5">
                    Reason for Request
                  </label>
                  <textarea
                    value={requestForm.reason}
                    onChange={(event) =>
                      setRequestForm((current) => ({
                        ...current,
                        reason: event.target.value,
                      }))
                    }
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
                      value={requestForm.offeredSalary}
                      onChange={(event) =>
                        setRequestForm((current) => ({
                          ...current,
                          offeredSalary: event.target.value,
                        }))
                      }
                      placeholder="PHP amount / range"
                      className="w-full px-3 py-2 text-xs border border-[#E5E7EB] rounded-lg outline-none focus:border-gray-400 transition bg-white"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-gray-600 block mb-1.5">
                      Urgency
                    </label>
                    <select
                      value={requestForm.urgency}
                      onChange={(event) =>
                        setRequestForm((current) => ({
                          ...current,
                          urgency: event.target.value,
                        }))
                      }
                      className="w-full px-3 py-2 text-xs border border-[#E5E7EB] rounded-lg outline-none bg-white cursor-pointer"
                    >
                      <option value="normal">Normal</option>
                      <option value="urgent">Urgent</option>
                      <option value="immediate">Immediate Fill</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="flex gap-2 pt-1">
                <Btn
                  variant="outline"
                  className="flex-1 justify-center"
                  onClick={() => setSelectedCandidate(null)}
                >
                  Cancel
                </Btn>
                <button
                  type="submit"
                  disabled={saving}
                  className="inline-flex flex-1 items-center justify-center rounded-lg bg-[#A10000] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[#8a0000] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {saving ? "Submitting..." : "Submit Request"}
                </button>
              </div>
            </form>
          </Card>
        </div>
      )}
    </div>
  );
}
