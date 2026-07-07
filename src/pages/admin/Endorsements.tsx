import { useEffect, useMemo, useState, type FormEvent } from "react";
import { Loader2, Plus, Trash2, X } from "lucide-react";
import { Avatar } from "../../components/shared/Avatar";
import { Btn } from "../../components/shared/Btn";
import { ReadinessBar } from "../../components/shared/ReadinessBar";
import { SUCCESS, WARNING } from "../../lib/constants";
import {
  createEndorsement,
  deleteEndorsement,
  getEndorsements,
  updateEndorsementStage,
  type EndorsementRecord,
  type EndorsementStage,
} from "../../services/endorsementService";
import { getCandidates, type CandidateRecord } from "../../services/candidateService";
import { getAgencies, type Agency } from "../../services/agencyService";

type PipelineStage = Exclude<EndorsementStage, "interviewed" | "endorsed">;

const pipelineColumns: { id: PipelineStage; label: string; color: string }[] = [
  { id: "available", label: "Available", color: "#9CA3AF" },
  { id: "requested", label: "Requested", color: WARNING },
  { id: "shortlisted", label: "Shortlisted", color: "#3B82F6" },
  { id: "interview", label: "Interview", color: "#8B5CF6" },
  { id: "offered", label: "Offered", color: "#F97316" },
  { id: "hired", label: "Hired", color: SUCCESS },
  { id: "rejected", label: "Rejected", color: "#DC2626" },
];

const emptyForm = {
  candidateId: "",
  agencyId: "",
  stage: "requested" as PipelineStage,
  notes: "",
};

const adminReviewStages = [
  { id: "requested" as const, label: "Requested" },
  { id: "shortlisted" as const, label: "Shortlisted" },
  { id: "rejected" as const, label: "Rejected" },
];

function isAgencyManagedStage(stage: PipelineStage) {
  return ["interview", "offered", "hired"].includes(stage);
}

function normalizeStage(stage: EndorsementStage): PipelineStage {
  if (stage === "interviewed") return "interview";
  if (stage === "endorsed") return "requested";
  return stage;
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(value));
}

export function EndorsementKanban() {
  const [endorsements, setEndorsements] = useState<EndorsementRecord[]>([]);
  const [candidates, setCandidates] = useState<CandidateRecord[]>([]);
  const [agencies, setAgencies] = useState<Agency[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState(emptyForm);

  const grouped = useMemo(() => {
    return pipelineColumns.reduce<Record<PipelineStage, EndorsementRecord[]>>(
      (acc, column) => {
        acc[column.id] = endorsements.filter(
          (endorsement) => normalizeStage(endorsement.stage) === column.id,
        );
        return acc;
      },
      {
        available: [],
        requested: [],
        shortlisted: [],
        interview: [],
        offered: [],
        hired: [],
        rejected: [],
      },
    );
  }, [endorsements]);

  async function loadPipeline() {
    setLoading(true);
    setError(null);

    try {
      const [endorsementRows, candidateRows, agencyRows] = await Promise.all([
        getEndorsements(),
        getCandidates(),
        getAgencies(),
      ]);
      setEndorsements(endorsementRows);
      setCandidates(candidateRows);
      setAgencies(agencyRows);
    } catch {
      setError("Unable to load endorsements. Check the Supabase table and RLS policies.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadPipeline();
  }, []);

  function openModal() {
    setForm({
      ...emptyForm,
      candidateId: candidates[0]?.id ?? "",
      agencyId: agencies[0]?.id ?? "",
    });
    setModalOpen(true);
    setError(null);
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!form.candidateId || !form.agencyId) {
      setError("Select a candidate and agency before creating an endorsement.");
      return;
    }

    setSaving(true);
    setError(null);

    try {
      const created = await createEndorsement({
        candidate_id: form.candidateId,
        agency_id: form.agencyId,
        stage: form.stage,
        notes: form.notes.trim() || null,
      });
      setEndorsements((current) => [created, ...current]);
      setModalOpen(false);
      setForm(emptyForm);
    } catch {
      setError("Unable to create endorsement. Run the updated SQL policies, then try again.");
    } finally {
      setSaving(false);
    }
  }

  async function handleStageChange(id: string, stage: PipelineStage) {
    const previous = endorsements;
    setEndorsements((current) =>
      current.map((endorsement) =>
        endorsement.id === id
          ? {
              ...endorsement,
              stage,
              updated_at: new Date().toISOString(),
            }
          : endorsement,
      ),
    );
    setError(null);

    try {
      const updated = await updateEndorsementStage(id, stage);
      setEndorsements((current) =>
        current.map((endorsement) =>
          endorsement.id === id ? updated : endorsement,
        ),
      );
    } catch {
      setEndorsements(previous);
      setError("Unable to update endorsement stage. Check Supabase update policy.");
    }
  }

  async function handleDelete(id: string) {
    const previous = endorsements;
    setEndorsements((current) =>
      current.filter((endorsement) => endorsement.id !== id),
    );
    setError(null);

    try {
      await deleteEndorsement(id);
    } catch {
      setEndorsements(previous);
      setError("Unable to delete endorsement. Check Supabase delete policy.");
    }
  }

  return (
    <div className="p-6 space-y-4 max-w-screen-xl">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h2
            className="text-base font-semibold text-[#222222]"
            style={{
              fontFamily: '"Poppins", sans-serif',
            }}
          >
            Endorsement Pipeline
          </h2>
          <p className="text-xs text-gray-500 mt-0.5">
            Review agency requests, then agencies update interview, offer, and hire stages
          </p>
        </div>
        <Btn onClick={openModal}>
          <Plus size={13} />
          New Endorsement
        </Btn>
      </div>

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-xs font-medium text-red-700">
          {error}
        </div>
      )}

      {loading ? (
        <div className="flex h-64 items-center justify-center rounded-xl border border-dashed border-gray-200 bg-white">
          <Loader2 className="h-5 w-5 animate-spin text-gray-400" />
        </div>
      ) : (
        <div className="flex gap-3 overflow-x-auto pb-3">
          {pipelineColumns.map((col) => {
            const cards = grouped[col.id];
            return (
              <div key={col.id} className="flex-shrink-0 w-56">
                <div className="flex items-center justify-between mb-2 px-0.5">
                  <div className="flex items-center gap-1.5">
                    <div
                      className="w-2 h-2 rounded-full flex-shrink-0"
                      style={{ backgroundColor: col.color }}
                    />
                    <span className="text-xs font-semibold text-gray-600">
                      {col.label}
                    </span>
                  </div>
                  <span className="text-[10px] text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded-md tabular-nums">
                    {cards.length}
                  </span>
                </div>

                <div className="space-y-2">
                  {cards.map((card) => {
                    const candidateName = card.candidate?.name ?? "Deleted candidate";
                    const readiness = card.candidate?.readiness_score ?? 0;

                    return (
                      <div
                        key={card.id}
                        className="bg-white border border-[#E5E7EB] rounded-xl p-3 shadow-sm hover:shadow-md transition-shadow"
                      >
                        <div className="flex items-start justify-between gap-2 mb-2">
                          <div className="flex min-w-0 items-center gap-2">
                            <Avatar
                              name={candidateName}
                              photo={card.candidate?.photo ?? undefined}
                              size="sm"
                            />
                            <div className="min-w-0">
                              <div className="text-xs font-semibold text-[#222222] truncate">
                                {candidateName}
                              </div>
                              <div className="text-[10px] text-gray-400 truncate">
                                {card.candidate?.title ?? "No title"}
                              </div>
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={() => handleDelete(card.id)}
                            className="rounded-md p-1 text-gray-300 hover:bg-red-50 hover:text-red-600"
                            aria-label={`Delete endorsement for ${candidateName}`}
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>

                        <div className="text-[10px] text-gray-500 mb-2 truncate">
                          {card.agency?.name ?? "No agency"}
                        </div>
                        {(card.position || card.offered_salary || card.urgency) && (
                          <div className="mb-2 rounded-lg bg-gray-50 px-2 py-1.5 text-[10px] text-gray-500">
                            {card.position && (
                              <div className="truncate font-medium text-gray-600">
                                {card.position}
                              </div>
                            )}
                            <div className="flex flex-wrap gap-x-2 gap-y-0.5">
                              {card.offered_salary && (
                                <span>{card.offered_salary}</span>
                              )}
                              {card.urgency && <span>{card.urgency}</span>}
                            </div>
                          </div>
                        )}
                        <ReadinessBar score={readiness} />

                        {card.notes && (
                          <div className="mt-2 line-clamp-2 text-[10px] text-gray-500">
                            {card.notes}
                          </div>
                        )}

                        <div className="mt-2 flex items-center justify-between gap-2">
                          <span className="text-[10px] text-gray-400">
                            {formatDate(card.updated_at ?? card.created_at)}
                          </span>
                          {isAgencyManagedStage(normalizeStage(card.stage)) ? (
                            <span className="rounded-md border border-gray-200 bg-gray-50 px-2 py-1 text-[10px] font-medium text-gray-500">
                              Agency updated
                            </span>
                          ) : (
                            <select
                              value={normalizeStage(card.stage)}
                              onChange={(event) =>
                                handleStageChange(
                                  card.id,
                                  event.target.value as PipelineStage,
                                )
                              }
                              className="h-7 max-w-[104px] rounded-md border border-gray-200 bg-white px-1.5 text-[10px] font-medium text-gray-600 outline-none focus:border-[#A10000]"
                              aria-label={`Review request for ${candidateName}`}
                            >
                              {adminReviewStages.map((stage) => (
                                <option key={stage.id} value={stage.id}>
                                  {stage.label}
                                </option>
                              ))}
                            </select>
                          )}
                        </div>
                      </div>
                    );
                  })}

                  {cards.length === 0 && (
                    <div className="border-2 border-dashed border-gray-200 rounded-xl h-16 flex items-center justify-center">
                      <span className="text-[10px] text-gray-300">
                        No candidates
                      </span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {modalOpen && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="w-full max-w-lg rounded-2xl bg-white shadow-2xl">
            <div className="flex items-start justify-between border-b border-gray-100 px-5 py-4">
              <div>
                <h3 className="text-base font-semibold text-[#222222]">
                  New Endorsement
                </h3>
                <p className="mt-0.5 text-xs text-gray-400">
                  Send a candidate to a partner agency pipeline
                </p>
              </div>
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="rounded-full p-1 text-gray-400 hover:bg-gray-50 hover:text-gray-600"
                aria-label="Close new endorsement form"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 px-5 py-5">
              <label className="block">
                <span className="mb-1.5 block text-xs font-semibold text-gray-600">
                  Candidate
                </span>
                <select
                  value={form.candidateId}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      candidateId: event.target.value,
                    }))
                  }
                  className="h-11 w-full rounded-xl border border-gray-200 bg-white px-3 text-sm outline-none focus:border-[#A10000]"
                  required
                >
                  <option value="" disabled>
                    Select candidate
                  </option>
                  {candidates.map((candidate) => (
                    <option key={candidate.id} value={candidate.id}>
                      {candidate.name} - {candidate.title ?? "No title"}
                    </option>
                  ))}
                </select>
              </label>

              <div className="grid gap-4 sm:grid-cols-2">
                <label className="block">
                  <span className="mb-1.5 block text-xs font-semibold text-gray-600">
                    Agency
                  </span>
                  <select
                    value={form.agencyId}
                    onChange={(event) =>
                      setForm((current) => ({
                        ...current,
                        agencyId: event.target.value,
                      }))
                    }
                    className="h-11 w-full rounded-xl border border-gray-200 bg-white px-3 text-sm outline-none focus:border-[#A10000]"
                    required
                  >
                    <option value="" disabled>
                      Select agency
                    </option>
                    {agencies.map((agency) => (
                      <option key={agency.id} value={agency.id}>
                        {agency.name}
                      </option>
                    ))}
                  </select>
                </label>

                <label className="block">
                  <span className="mb-1.5 block text-xs font-semibold text-gray-600">
                    Stage
                  </span>
                  <select
                    value={form.stage}
                    onChange={(event) =>
                      setForm((current) => ({
                        ...current,
                        stage: event.target.value as PipelineStage,
                      }))
                    }
                    className="h-11 w-full rounded-xl border border-gray-200 bg-white px-3 text-sm outline-none focus:border-[#A10000]"
                  >
                    {pipelineColumns.map((stage) => (
                      <option key={stage.id} value={stage.id}>
                        {stage.label}
                      </option>
                    ))}
                  </select>
                </label>
              </div>

              <label className="block">
                <span className="mb-1.5 block text-xs font-semibold text-gray-600">
                  Notes
                </span>
                <textarea
                  value={form.notes}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      notes: event.target.value,
                    }))
                  }
                  rows={3}
                  className="w-full resize-none rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm outline-none focus:border-[#A10000]"
                  placeholder="Optional endorsement notes"
                />
              </label>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="h-11 flex-1 rounded-xl border border-gray-200 text-sm font-semibold text-gray-600 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="h-11 flex-1 rounded-xl bg-[#A10000] text-sm font-semibold text-white hover:bg-[#8a0000] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {saving ? "Creating..." : "Create Endorsement"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
