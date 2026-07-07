import { useEffect, useState } from "react";
import { BookmarkX, Loader2, MapPin } from "lucide-react";
import { Avatar } from "../../components/shared/Avatar";
import { Btn } from "../../components/shared/Btn";
import { Card } from "../../components/shared/Card";
import { ReadinessBar } from "../../components/shared/ReadinessBar";
import type { CandidateRecord } from "../../services/candidateService";
import {
  getCurrentAgencyProfile,
  getSavedCandidates,
  unsaveCandidate,
} from "../../services/agencyPortalService";

export function SavedCandidatesPage() {
  const [agencyId, setAgencyId] = useState("");
  const [candidates, setCandidates] = useState<CandidateRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    async function loadSaved() {
      setLoading(true);
      setError("");

      try {
        const agency = await getCurrentAgencyProfile();
        const rows = await getSavedCandidates(agency.id);

        if (!active) return;
        setAgencyId(agency.id);
        setCandidates(rows);
      } catch {
        if (active) setError("Unable to load saved candidates.");
      } finally {
        if (active) setLoading(false);
      }
    }

    loadSaved();

    return () => {
      active = false;
    };
  }, []);

  async function removeSaved(candidateId: string) {
    const previous = candidates;
    setCandidates((current) =>
      current.filter((candidate) => candidate.id !== candidateId),
    );

    try {
      await unsaveCandidate(agencyId, candidateId);
    } catch {
      setCandidates(previous);
      setError("Unable to remove saved candidate.");
    }
  }

  return (
    <div className="p-6 space-y-4 max-w-screen-xl">
      <div>
        <h2
          className="text-base font-semibold text-[#222222]"
          style={{ fontFamily: '"Poppins", sans-serif' }}
        >
          Saved Candidates
        </h2>
        <p className="text-xs text-gray-500 mt-0.5">
          {candidates.length} saved candidate profiles
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
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {candidates.map((candidate) => (
            <Card key={candidate.id} className="p-5">
              <div className="flex items-start gap-3 mb-3">
                <Avatar
                  name={candidate.name}
                  photo={candidate.photo ?? undefined}
                  size="lg"
                />
                <div className="min-w-0 flex-1">
                  <div className="text-sm font-semibold text-[#222222] truncate">
                    {candidate.name}
                  </div>
                  <div className="text-xs text-gray-500">
                    {candidate.title ?? "No title"}
                  </div>
                  <div className="flex items-center gap-1 mt-1 text-[10px] text-gray-400">
                    <MapPin size={10} />
                    {candidate.province ?? "No location"}
                  </div>
                </div>
              </div>
              <div className="mb-4">
                <ReadinessBar score={candidate.readiness_score} />
              </div>
              <Btn
                variant="outline"
                size="sm"
                className="w-full justify-center"
                onClick={() => removeSaved(candidate.id)}
              >
                <BookmarkX size={13} />
                Remove Saved
              </Btn>
            </Card>
          ))}
          {candidates.length === 0 && (
            <Card className="col-span-full flex h-64 items-center justify-center p-6 text-sm text-gray-400">
              Saved candidates will appear here.
            </Card>
          )}
        </div>
      )}
    </div>
  );
}
