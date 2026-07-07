import { supabase } from "../lib/supabase";
import type { CandidateRecord } from "./candidateService";
import type { Agency } from "./agencyService";
import type { EndorsementRecord, EndorsementStage } from "./endorsementService";

const candidateColumns = `
  id,
  name,
  photo,
  title,
  program,
  skills,
  experience,
  english_level,
  status,
  readiness_score,
  availability,
  province,
  email,
  phone,
  expected_salary,
  preferred_work,
  resume_url,
  credit_cost,
  created_at,
  updated_at
`;

const candidateColumnsWithoutResume = `
  id,
  name,
  photo,
  title,
  program,
  skills,
  experience,
  english_level,
  status,
  readiness_score,
  availability,
  province,
  email,
  phone,
  expected_salary,
  preferred_work,
  credit_cost,
  created_at,
  updated_at
`;

const requestColumns = `
  id,
  candidate_id,
  agency_id,
  stage,
  position,
  offered_salary,
  urgency,
  notes,
  created_at,
  updated_at,
  candidate:candidates (
    id,
    name,
    photo,
    title,
    readiness_score,
    status
  ),
  agency:agencies (
    id,
    name
  )
`;

type RawRequest = Omit<EndorsementRecord, "candidate" | "agency"> & {
  candidate: EndorsementRecord["candidate"] | EndorsementRecord["candidate"][];
  agency: EndorsementRecord["agency"] | EndorsementRecord["agency"][];
};

export type AgencyRequestInput = {
  candidateId: string;
  position: string;
  reason: string;
  offeredSalary: string;
  urgency: string;
};

export type AgencyWallet = {
  agency_id: string;
  balance: number;
  created_at: string;
  updated_at: string;
};

export type AgencyWalletTransaction = {
  id: string;
  agency_id: string;
  amount: number;
  type: "topup" | "request_debit" | "refund" | "adjustment";
  description: string | null;
  endorsement_id: string | null;
  candidate_id: string | null;
  created_at: string;
};

export type AgencyRequestStageUpdate = {
  stage: Extract<EndorsementStage, "interview" | "offered" | "hired" | "rejected">;
  note?: string;
};

function isMissingResumeColumn(error: unknown) {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    "message" in error &&
    (error as { code?: string; message?: string }).code === "42703" &&
    Boolean(
      (error as { message?: string }).message?.includes(
        "candidates.resume_url",
      ),
    )
  );
}

function withResumeFallback(rows: Partial<CandidateRecord>[]) {
  return rows.map((row) => ({
    ...row,
    resume_url: row.resume_url ?? null,
  })) as CandidateRecord[];
}

function firstOrNull<T>(value: T | T[] | null | undefined) {
  if (Array.isArray(value)) return value[0] ?? null;
  return value ?? null;
}

function normalizeRequest(row: RawRequest): EndorsementRecord {
  return {
    ...row,
    candidate: firstOrNull(row.candidate),
    agency: firstOrNull(row.agency),
  };
}

export async function getCurrentAgencyProfile() {
  const { data: sessionData, error: sessionError } =
    await supabase.auth.getSession();

  if (sessionError) throw sessionError;

  const user = sessionData.session?.user;
  if (!user?.email) throw new Error("No agency session found.");

  const { data, error } = await supabase
    .from("agencies")
    .select("*")
    .or(`auth_id.eq.${user.id},email.eq.${user.email}`)
    .maybeSingle();

  if (error) {
    console.error(error);
    throw error;
  }

  if (!data) throw new Error("No agency profile is linked to this login.");

  return data as Agency;
}

export async function getMarketplaceCandidates() {
  const { data, error } = await supabase
    .from("candidates")
    .select(candidateColumns)
    .eq("status", "job_ready")
    .order("readiness_score", { ascending: false });

  if (isMissingResumeColumn(error)) {
    const fallback = await supabase
      .from("candidates")
      .select(candidateColumnsWithoutResume)
      .eq("status", "job_ready")
      .order("readiness_score", { ascending: false });

    if (fallback.error) {
      console.error(fallback.error);
      throw fallback.error;
    }

    return withResumeFallback(
      ((fallback.data ?? []) as unknown) as Partial<CandidateRecord>[],
    );
  }

  if (error) {
    console.error(error);
    throw error;
  }

  return ((data ?? []) as unknown) as CandidateRecord[];
}

export async function getSavedCandidateIds(agencyId: string) {
  const { data, error } = await supabase
    .from("agency_saved_candidates")
    .select("candidate_id")
    .eq("agency_id", agencyId);

  if (error) {
    console.error(error);
    throw error;
  }

  return (data ?? []).map((row) => row.candidate_id as string);
}

export async function getSavedCandidates(agencyId: string) {
  const { data, error } = await supabase
    .from("agency_saved_candidates")
    .select(`created_at, candidate:candidates (${candidateColumns})`)
    .eq("agency_id", agencyId)
    .order("created_at", { ascending: false });

  if (error) {
    console.error(error);
    throw error;
  }

  return (((data ?? []) as unknown) as { candidate: CandidateRecord | CandidateRecord[] }[])
    .map((row) => firstOrNull(row.candidate))
    .filter(Boolean) as CandidateRecord[];
}

export async function saveCandidate(agencyId: string, candidateId: string) {
  const { error } = await supabase
    .from("agency_saved_candidates")
    .upsert(
      { agency_id: agencyId, candidate_id: candidateId },
      { onConflict: "agency_id,candidate_id" },
    );

  if (error) {
    console.error(error);
    throw error;
  }

  return true;
}

export async function unsaveCandidate(agencyId: string, candidateId: string) {
  const { error } = await supabase
    .from("agency_saved_candidates")
    .delete()
    .eq("agency_id", agencyId)
    .eq("candidate_id", candidateId);

  if (error) {
    console.error(error);
    throw error;
  }

  return true;
}

export async function createCandidateRequest(
  agencyId: string,
  values: AgencyRequestInput,
) {
  const { data: createdRequest, error: requestError } = await supabase.rpc(
    "request_candidate_with_credits",
    {
      target_agency_id: agencyId,
      target_candidate_id: values.candidateId,
      request_position: values.position,
      request_notes: values.reason,
      request_salary: values.offeredSalary,
      request_urgency: values.urgency,
    },
  );

  if (requestError) {
    console.error(requestError);
    throw requestError;
  }

  const requestId = (createdRequest as { id: string }).id;

  const { data, error } = await supabase
    .from("endorsements")
    .select(requestColumns)
    .eq("id", requestId)
    .single();

  if (error) {
    console.error(error);
    throw error;
  }

  return normalizeRequest((data as unknown) as RawRequest);
}

export async function getAgencyCandidateRequests(agencyId: string) {
  const { data, error } = await supabase
    .from("endorsements")
    .select(requestColumns)
    .eq("agency_id", agencyId)
    .order("created_at", { ascending: false });

  if (error) {
    console.error(error);
    throw error;
  }

  return (((data ?? []) as unknown) as RawRequest[]).map(normalizeRequest);
}

export async function updateAgencyCandidateRequest(
  id: string,
  values: AgencyRequestStageUpdate,
) {
  const updates: {
    stage: AgencyRequestStageUpdate["stage"];
    updated_at: string;
    notes?: string;
  } = {
    stage: values.stage,
    updated_at: new Date().toISOString(),
  };

  if (values.note?.trim()) {
    updates.notes = values.note.trim();
  }

  const { data, error } = await supabase
    .from("endorsements")
    .update(updates)
    .eq("id", id)
    .select(requestColumns)
    .single();

  if (error) {
    console.error(error);
    throw error;
  }

  return normalizeRequest((data as unknown) as RawRequest);
}

export async function getAgencyWallet(agencyId: string) {
  const { data, error } = await supabase
    .from("agency_wallets")
    .select("*")
    .eq("agency_id", agencyId)
    .maybeSingle();

  if (error) {
    console.error(error);
    throw error;
  }

  return (data ??
    {
      agency_id: agencyId,
      balance: 0,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }) as AgencyWallet;
}

export async function getAgencyWalletTransactions(agencyId: string) {
  const { data, error } = await supabase
    .from("agency_wallet_transactions")
    .select("*")
    .eq("agency_id", agencyId)
    .order("created_at", { ascending: false });

  if (error) {
    console.error(error);
    throw error;
  }

  return (data ?? []) as AgencyWalletTransaction[];
}

export async function createTopUpRequest(
  agencyId: string,
  amount: number,
  note: string,
) {
  const { error } = await supabase.rpc("top_up_agency_wallet", {
    target_agency_id: agencyId,
    credit_amount: amount,
    topup_description: note || `Agency wallet top-up for ${amount} credits`,
  });

  if (error) {
    console.error(error);
    throw error;
  }

  return true;
}
