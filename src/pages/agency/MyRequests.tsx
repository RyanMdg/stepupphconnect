import { useEffect, useState, type FormEvent } from "react";
import { Loader2, Send, XCircle } from "lucide-react";
import { Avatar } from "../../components/shared/Avatar";
import { Card } from "../../components/shared/Card";
import { StatusChip } from "../../components/shared/Chip";
import {
  getAgencyCandidateRequests,
  getCurrentAgencyProfile,
  updateAgencyCandidateRequest,
} from "../../services/agencyPortalService";
import type {
  EndorsementRecord,
  EndorsementStage,
} from "../../services/endorsementService";

const pipelineSteps = [
  { id: "requested", label: "Requested" },
  { id: "shortlisted", label: "Shortlisted" },
  { id: "interview", label: "Interview" },
  { id: "offered", label: "Offered" },
  { id: "hired", label: "Hired" },
];

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(value));
}

function normalizeStage(stage: string) {
  if (stage === "interviewed") return "interview";
  if (stage === "endorsed") return "requested";
  return stage;
}

function nextStep(stage: string) {
  const normalized = normalizeStage(stage);

  if (normalized === "requested") {
    return "Waiting for Step Up PH to review and approve this candidate request.";
  }

  if (normalized === "shortlisted") {
    return "Step Up PH approved the match. You can now contact the candidate for interview.";
  }

  if (normalized === "interview") {
    return "Agency interview is in progress. Update this request after interview feedback.";
  }

  if (normalized === "offered") {
    return "Offer sent. Mark as hired when placement is confirmed.";
  }

  if (normalized === "hired") {
    return "Placement completed. Step Up PH may coordinate onboarding and billing.";
  }

  if (normalized === "rejected") {
    return "Request closed. You can request another candidate from the marketplace.";
  }

  return "Step Up PH will update this request as it moves forward.";
}

function agencyActions(stage: EndorsementStage) {
  const normalized = normalizeStage(stage);

  if (normalized === "shortlisted") {
    return [
      {
        stage: "interview" as const,
        label: "Contact for Interview",
        noteLabel: "Interview Message",
        placeholder:
          "Example: Hi, we would like to invite you for an interview on Friday at 2 PM.",
      },
      {
        stage: "rejected" as const,
        label: "Close Request",
        noteLabel: "Reason",
        placeholder: "Reason for closing this request",
      },
    ];
  }

  if (normalized === "interview") {
    return [
      {
        stage: "offered" as const,
        label: "Mark Offered",
        noteLabel: "Offer Note",
        placeholder: "Offer details, salary, start date, or next instruction",
      },
      {
        stage: "rejected" as const,
        label: "Close Request",
        noteLabel: "Reason",
        placeholder: "Interview result or reason for closing",
      },
    ];
  }

  if (normalized === "offered") {
    return [
      {
        stage: "hired" as const,
        label: "Mark Hired",
        noteLabel: "Hiring Note",
        placeholder: "Confirmed start date, accepted salary, or onboarding note",
      },
      {
        stage: "rejected" as const,
        label: "Close Request",
        noteLabel: "Reason",
        placeholder: "Reason offer did not proceed",
      },
    ];
  }

  return [];
}

function stepState(stepId: string, currentStage: string) {
  const normalized = normalizeStage(currentStage);
  const currentIndex = pipelineSteps.findIndex((step) => step.id === normalized);
  const stepIndex = pipelineSteps.findIndex((step) => step.id === stepId);

  if (normalized === "rejected") return "inactive";
  if (stepIndex < currentIndex) return "done";
  if (stepIndex === currentIndex) return "current";
  return "upcoming";
}

export function MyRequestsPage() {
  const [requests, setRequests] = useState<EndorsementRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [stageUpdate, setStageUpdate] = useState<{
    request: EndorsementRecord;
    stage: Extract<EndorsementStage, "interview" | "offered" | "hired" | "rejected">;
    label: string;
    noteLabel: string;
    placeholder: string;
    note: string;
  } | null>(null);

  useEffect(() => {
    let active = true;

    async function loadRequests() {
      setLoading(true);
      setError("");
      setSuccess("");

      try {
        const agency = await getCurrentAgencyProfile();
        const rows = await getAgencyCandidateRequests(agency.id);
        if (active) setRequests(rows);
      } catch {
        if (active) setError("Unable to load candidate requests.");
      } finally {
        if (active) setLoading(false);
      }
    }

    loadRequests();

    return () => {
      active = false;
    };
  }, []);

  async function submitStageUpdate(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!stageUpdate) return;

    setSaving(true);
    setError("");
    setSuccess("");

    try {
      const updated = await updateAgencyCandidateRequest(stageUpdate.request.id, {
        stage: stageUpdate.stage,
        note:
          stageUpdate.request.notes && stageUpdate.note.trim()
            ? `${stageUpdate.request.notes}\n\nAgency update: ${stageUpdate.note.trim()}`
            : stageUpdate.note,
      });

      setRequests((current) =>
        current.map((request) =>
          request.id === updated.id ? updated : request,
        ),
      );
      setSuccess(
        `${updated.candidate?.name ?? "Candidate"} moved to ${normalizeStage(updated.stage)}.`,
      );
      setStageUpdate(null);
    } catch {
      setError(
        "Unable to update request. Make sure Step Up PH has shortlisted it first.",
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="p-6 space-y-4 max-w-screen-xl">
      <div>
        <h2
          className="text-base font-semibold text-[#222222]"
          style={{ fontFamily: '"Poppins", sans-serif' }}
        >
          My Requests
        </h2>
        <p className="text-xs text-gray-500 mt-0.5">
          Track requests submitted to Step Up PH
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

      {loading ? (
        <div className="flex h-64 items-center justify-center rounded-xl border border-dashed border-gray-200 bg-white">
          <Loader2 className="h-5 w-5 animate-spin text-gray-400" />
        </div>
      ) : (
        <Card className="overflow-hidden">
          {requests.map((request) => (
            <div
              key={request.id}
              className="border-b border-gray-100 px-4 py-4 last:border-b-0"
            >
              <div className="grid gap-4 lg:grid-cols-[minmax(260px,1fr)_minmax(360px,1.4fr)]">
                <div className="flex items-start gap-3 min-w-0">
                  <Avatar
                    name={request.candidate?.name ?? "Candidate"}
                    photo={request.candidate?.photo ?? undefined}
                    size="md"
                  />
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <div className="text-sm font-semibold text-[#222222] truncate">
                        {request.candidate?.name ?? "Candidate"}
                      </div>
                      <StatusChip status={request.stage} />
                    </div>
                    <div className="text-xs text-gray-400 truncate">
                      {request.candidate?.title ?? "No title"}
                    </div>
                    <div className="mt-2 text-xs text-gray-600">
                      {request.position ||
                        request.candidate?.title ||
                        "Requested role"}
                    </div>
                    <div className="text-[10px] text-gray-400">
                      Submitted {formatDate(request.created_at)}
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
                    {pipelineSteps.map((step, index) => {
                      const state = stepState(step.id, request.stage);
                      const dotClass =
                        state === "done"
                          ? "bg-green-500 text-white"
                          : state === "current"
                            ? "bg-[#A10000] text-white"
                            : "bg-gray-100 text-gray-400";
                      const lineClass =
                        state === "done" ? "bg-green-300" : "bg-gray-200";

                      return (
                        <div
                          key={step.id}
                          className="flex flex-shrink-0 items-center gap-1.5"
                        >
                          <div className="flex items-center gap-1.5">
                            <span
                              className={`flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-semibold ${dotClass}`}
                            >
                              {index + 1}
                            </span>
                            <span
                              className={`text-[10px] font-semibold ${
                                state === "current"
                                  ? "text-[#A10000]"
                                  : state === "done"
                                    ? "text-green-700"
                                    : "text-gray-400"
                              }`}
                            >
                              {step.label}
                            </span>
                          </div>
                          {index < pipelineSteps.length - 1 && (
                            <span
                              className={`h-px w-5 flex-shrink-0 ${lineClass}`}
                            />
                          )}
                        </div>
                      );
                    })}
                  </div>
                  <div className="rounded-xl border border-gray-100 bg-gray-50 px-3 py-2">
                    <div className="text-[10px] font-semibold uppercase tracking-wider text-gray-400">
                      Next Step
                    </div>
                    <div className="mt-0.5 text-xs font-medium text-gray-700">
                      {nextStep(request.stage)}
                    </div>
                  </div>
                  {request.notes && (
                    <div className="text-xs text-gray-500">
                      <span className="font-semibold text-gray-600">Notes:</span>{" "}
                      {request.notes}
                    </div>
                  )}
                  {agencyActions(request.stage).length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {agencyActions(request.stage).map((action) => (
                        <button
                          key={action.stage}
                          type="button"
                          onClick={() =>
                            setStageUpdate({
                              request,
                              stage: action.stage,
                              label: action.label,
                              noteLabel: action.noteLabel,
                              placeholder: action.placeholder,
                              note: "",
                            })
                          }
                          className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
                            action.stage === "rejected"
                              ? "border border-gray-200 text-gray-600 hover:bg-gray-50"
                              : "bg-[#A10000] text-white hover:bg-[#8a0000]"
                          }`}
                        >
                          {action.stage === "rejected" ? (
                            <XCircle size={13} />
                          ) : (
                            <Send size={13} />
                          )}
                          {action.label}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
          {requests.length === 0 && (
            <div className="px-4 py-12 text-center text-sm text-gray-400">
              Submitted requests will appear here.
            </div>
          )}
        </Card>
      )}

      {stageUpdate && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-4"
          onClick={() => setStageUpdate(null)}
        >
          <Card
            className="w-full max-w-md p-5"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="mb-4 flex items-start justify-between gap-3">
              <div>
                <h3 className="text-base font-semibold text-[#222222]">
                  {stageUpdate.label}
                </h3>
                <p className="mt-0.5 text-xs text-gray-400">
                  {stageUpdate.request.candidate?.name ?? "Candidate"} ·{" "}
                  {stageUpdate.request.position ||
                    stageUpdate.request.candidate?.title ||
                    "Requested role"}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setStageUpdate(null)}
                className="rounded-lg p-1 text-gray-400 hover:bg-gray-50"
                aria-label="Close status update"
              >
                <XCircle size={17} />
              </button>
            </div>

            <form onSubmit={submitStageUpdate} className="space-y-4">
              <label className="block">
                <span className="mb-1.5 block text-xs font-semibold text-gray-600">
                  {stageUpdate.noteLabel}
                </span>
                <textarea
                  value={stageUpdate.note}
                  onChange={(event) =>
                    setStageUpdate((current) =>
                      current
                        ? {
                            ...current,
                            note: event.target.value,
                          }
                        : current,
                    )
                  }
                  rows={4}
                  placeholder={stageUpdate.placeholder}
                  className="w-full resize-none rounded-xl border border-gray-200 px-3 py-2 text-xs outline-none focus:border-[#A10000]"
                />
              </label>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setStageUpdate(null)}
                  className="h-10 flex-1 rounded-xl border border-gray-200 text-sm font-semibold text-gray-600 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="h-10 flex-1 rounded-xl bg-[#A10000] text-sm font-semibold text-white hover:bg-[#8a0000] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {saving ? "Updating..." : "Update Request"}
                </button>
              </div>
            </form>
          </Card>
        </div>
      )}
    </div>
  );
}
