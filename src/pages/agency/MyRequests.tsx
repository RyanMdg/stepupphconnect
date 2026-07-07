import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { Avatar } from "../../components/shared/Avatar";
import { Card } from "../../components/shared/Card";
import { StatusChip } from "../../components/shared/Chip";
import {
  getAgencyCandidateRequests,
  getCurrentAgencyProfile,
} from "../../services/agencyPortalService";
import type { EndorsementRecord } from "../../services/endorsementService";

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(value));
}

export function MyRequestsPage() {
  const [requests, setRequests] = useState<EndorsementRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    async function loadRequests() {
      setLoading(true);
      setError("");

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
        <Card className="overflow-hidden">
          <div className="grid grid-cols-[minmax(260px,1.2fr)_1fr_140px_150px] border-b border-gray-100 bg-gray-50 px-4 py-3 text-[10px] font-bold uppercase tracking-widest text-gray-500">
            <div>Candidate</div>
            <div>Role</div>
            <div>Status</div>
            <div>Submitted</div>
          </div>
          {requests.map((request) => (
            <div
              key={request.id}
              className="grid grid-cols-[minmax(260px,1.2fr)_1fr_140px_150px] items-center border-b border-gray-100 px-4 py-3 last:border-b-0"
            >
              <div className="flex items-center gap-3 min-w-0">
                <Avatar
                  name={request.candidate?.name ?? "Candidate"}
                  photo={request.candidate?.photo ?? undefined}
                  size="md"
                />
                <div className="min-w-0">
                  <div className="text-sm font-semibold text-[#222222] truncate">
                    {request.candidate?.name ?? "Candidate"}
                  </div>
                  <div className="text-xs text-gray-400 truncate">
                    {request.candidate?.title ?? "No title"}
                  </div>
                </div>
              </div>
              <div className="text-xs text-gray-600">
                {request.position || request.candidate?.title || "Requested role"}
              </div>
              <StatusChip status={request.stage} />
              <div className="text-xs text-gray-400">
                {formatDate(request.created_at)}
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
    </div>
  );
}
