import { supabase } from "../lib/supabase";

export type EndorsementStage =
  | "available"
  | "requested"
  | "shortlisted"
  | "interview"
  | "interviewed"
  | "offered"
  | "hired"
  | "rejected"
  | "endorsed";

export type EndorsementCandidate = {
  id: string;
  name: string;
  photo: string | null;
  title: string | null;
  readiness_score: number;
  status: string | null;
};

export type EndorsementAgency = {
  id: string;
  name: string;
};

export type EndorsementRecord = {
  id: string;
  candidate_id: string | null;
  agency_id: string | null;
  stage: EndorsementStage;
  position: string | null;
  offered_salary: string | null;
  urgency: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
  candidate: EndorsementCandidate | null;
  agency: EndorsementAgency | null;
};

export type EndorsementInput = {
  candidate_id: string;
  agency_id: string;
  stage: Exclude<EndorsementStage, "interviewed" | "endorsed">;
  position?: string | null;
  offered_salary?: string | null;
  urgency?: string | null;
  notes?: string | null;
};

type RawEndorsementRecord = Omit<EndorsementRecord, "candidate" | "agency"> & {
  candidate: EndorsementCandidate | EndorsementCandidate[] | null;
  agency: EndorsementAgency | EndorsementAgency[] | null;
};

function firstOrNull<T>(value: T | T[] | null | undefined) {
  if (Array.isArray(value)) return value[0] ?? null;
  return value ?? null;
}

function normalizeRow(row: RawEndorsementRecord): EndorsementRecord {
  return {
    ...row,
    candidate: firstOrNull(row.candidate),
    agency: firstOrNull(row.agency),
  };
}

const endorsementColumns = `
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

export async function getEndorsements() {
  const { data, error } = await supabase
    .from("endorsements")
    .select(endorsementColumns)
    .order("updated_at", { ascending: false });

  if (error) {
    console.error(error);
    throw error;
  }

  return (((data ?? []) as unknown) as RawEndorsementRecord[]).map(normalizeRow);
}

export async function createEndorsement(values: EndorsementInput) {
  const { data, error } = await supabase
    .from("endorsements")
    .insert(values)
    .select(endorsementColumns)
    .single();

  if (error) {
    console.error(error);
    throw error;
  }

  return normalizeRow((data as unknown) as RawEndorsementRecord);
}

export async function updateEndorsementStage(
  id: string,
  stage: Exclude<EndorsementStage, "interviewed" | "endorsed">,
) {
  const { data, error } = await supabase
    .from("endorsements")
    .update({ stage, updated_at: new Date().toISOString() })
    .eq("id", id)
    .select(endorsementColumns)
    .single();

  if (error) {
    console.error(error);
    throw error;
  }

  return normalizeRow((data as unknown) as RawEndorsementRecord);
}

export async function deleteEndorsement(id: string) {
  const { error } = await supabase.from("endorsements").delete().eq("id", id);

  if (error) {
    console.error(error);
    throw error;
  }

  return true;
}
