import { useEffect, useMemo, useState } from "react";
import { Award, Bookmark, Calendar, FileText, Loader2, Users } from "lucide-react";
import { Card } from "../../components/shared/Card";
import { StatusChip } from "../../components/shared/Chip";
import {
  getAgencyCandidateRequests,
  getCurrentAgencyProfile,
  getMarketplaceCandidates,
  getSavedCandidateIds,
} from "../../services/agencyPortalService";
import type { Agency } from "../../services/agencyService";
import type { CandidateRecord } from "../../services/candidateService";
import type { EndorsementRecord } from "../../services/endorsementService";

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    year: "numeric",
    weekday: "long",
  }).format(new Date(value));
}

function formatShortDate(value: string) {
  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
  }).format(new Date(value));
}

function stageLabel(stage: string) {
  return stage.replaceAll("_", " ").replace(/\b\w/g, (char) => char.toUpperCase());
}

export function AgencyDashboard() {
  const [agency, setAgency] = useState<Agency | null>(null);
  const [candidates, setCandidates] = useState<CandidateRecord[]>([]);
  const [savedCount, setSavedCount] = useState(0);
  const [requests, setRequests] = useState<EndorsementRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    async function loadDashboard() {
      setLoading(true);
      setError("");

      try {
        const agencyProfile = await getCurrentAgencyProfile();
        const [candidateRows, savedIds, requestRows] = await Promise.all([
          getMarketplaceCandidates(),
          getSavedCandidateIds(agencyProfile.id),
          getAgencyCandidateRequests(agencyProfile.id),
        ]);

        if (!active) return;
        setAgency(agencyProfile);
        setCandidates(candidateRows);
        setSavedCount(savedIds.length);
        setRequests(requestRows);
      } catch {
        if (active) {
          setError("Unable to load agency dashboard. Check agency RLS policies.");
        }
      } finally {
        if (active) setLoading(false);
      }
    }

    loadDashboard();

    return () => {
      active = false;
    };
  }, []);

  const stats = useMemo(
    () => [
      {
        label: "Available Candidates",
        value: candidates.length,
        icon: <Users size={16} />,
      },
      {
        label: "Saved Candidates",
        value: savedCount,
        icon: <Bookmark size={16} />,
      },
      {
        label: "Pending Requests",
        value: requests.filter((request) => request.stage === "requested").length,
        icon: <FileText size={16} />,
      },
      {
        label: "Interviews Scheduled",
        value: requests.filter(
          (request) =>
            request.stage === "interview" || request.stage === "interviewed",
        ).length,
        icon: <Calendar size={16} />,
      },
      {
        label: "Successful Placements",
        value: requests.filter((request) => request.stage === "hired").length,
        icon: <Award size={16} />,
      },
    ],
    [candidates.length, requests, savedCount],
  );

  const recentActivity = requests.slice(0, 5);

  return (
    <div className="p-6 space-y-5 max-w-screen-xl">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h2
            className="text-base font-semibold text-[#222222]"
            style={{
              fontFamily: '"Poppins", sans-serif',
            }}
          >
            Welcome back, {agency?.contact_person || agency?.contact || "Partner"}
          </h2>
          <p className="text-xs text-gray-500 mt-0.5">
            {agency?.name ?? "Agency"} - Recruitment Dashboard
          </p>
        </div>
        <span className="text-xs text-gray-400">
          {formatDate(new Date().toISOString())}
        </span>
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
        <>
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
            {stats.map((stat) => (
              <Card key={stat.label} className="p-4">
                <div className="flex items-center justify-between mb-2.5">
                  <div className="w-8 h-8 rounded-xl bg-red-50 flex items-center justify-center text-[#A10000]">
                    {stat.icon}
                  </div>
                </div>
                <div
                  className="text-xl font-bold text-[#222222] tabular-nums"
                  style={{
                    fontFamily: '"Poppins", sans-serif',
                  }}
                >
                  {stat.value}
                </div>
                <div className="text-xs text-gray-500 mt-0.5">{stat.label}</div>
              </Card>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
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
                {recentActivity.map((request) => (
                  <div key={request.id} className="flex items-start gap-2.5">
                    <div className="w-1.5 h-1.5 rounded-full mt-1.5 flex-shrink-0 bg-[#A10000]" />
                    <div>
                      <p className="text-xs text-[#222222] leading-snug">
                        {request.candidate?.name ?? "Candidate"} is now{" "}
                        {stageLabel(request.stage)}
                      </p>
                      <p className="text-[10px] text-gray-400 mt-0.5">
                        {formatShortDate(request.updated_at)}
                      </p>
                    </div>
                  </div>
                ))}
                {recentActivity.length === 0 && (
                  <p className="text-xs text-gray-400">
                    No candidate activity yet.
                  </p>
                )}
              </div>
            </Card>

            <Card className="p-5">
              <p
                className="text-sm font-semibold text-[#222222] mb-3"
                style={{
                  fontFamily: '"Poppins", sans-serif',
                }}
              >
                My Candidate Requests
              </p>
              <div className="space-y-2">
                {requests.slice(0, 5).map((request) => (
                  <div
                    key={request.id}
                    className="flex items-center justify-between p-3 rounded-xl border border-[#E5E7EB] hover:bg-[#F8F9FB] transition"
                  >
                    <div className="min-w-0">
                      <div className="text-xs font-semibold text-[#222222] truncate">
                        {request.candidate?.name ?? "Candidate"}
                      </div>
                      <div className="text-[10px] text-gray-400 truncate">
                        {request.position || request.candidate?.title || "Requested role"} ·{" "}
                        {formatShortDate(request.created_at)}
                      </div>
                    </div>
                    <StatusChip status={request.stage} />
                  </div>
                ))}
                {requests.length === 0 && (
                  <p className="text-xs text-gray-400">
                    Submitted requests will appear here.
                  </p>
                )}
              </div>
            </Card>
          </div>
        </>
      )}
    </div>
  );
}
