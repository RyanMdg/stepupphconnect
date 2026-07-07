import { supabase } from "../lib/supabase";

export type CandidateStatus = "job_ready" | "in_training" | "placed" | "pending";

export type CandidateRecord = {
  id: string;
  name: string;
  photo: string | null;
  title: string | null;
  program: string | null;
  skills: string[];
  experience: string | null;
  english_level: string | null;
  status: CandidateStatus;
  readiness_score: number;
  availability: string | null;
  province: string | null;
  email: string | null;
  phone: string | null;
  expected_salary: string | null;
  preferred_work: string | null;
  created_at: string;
  updated_at: string;
};

export type CandidateFilters = {
  search?: string;
  status?: string;
  program?: string;
};

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
  created_at,
  updated_at
`;

export async function getCandidates(filters: CandidateFilters = {}) {
  let query = supabase
    .from("candidates")
    .select(candidateColumns)
    .order("updated_at", { ascending: false });

  if (filters.status && filters.status !== "all") {
    query = query.eq("status", filters.status);
  }

  if (filters.program && filters.program !== "all") {
    query = query.eq("program", filters.program);
  }

  if (filters.search?.trim()) {
    const search = filters.search.trim().replaceAll("%", "\\%");
    query = query.or(`name.ilike.%${search}%,title.ilike.%${search}%`);
  }

  const { data, error } = await query;

  if (error) {
    console.error(error);
    throw error;
  }

  return (data ?? []) as CandidateRecord[];
}

export async function getCandidate(id: string) {
  const { data, error } = await supabase
    .from("candidates")
    .select(candidateColumns)
    .eq("id", id)
    .maybeSingle<CandidateRecord>();

  if (error) {
    console.error(error);
    throw error;
  }

  return data;
}

export async function getCandidatePrograms() {
  const { data, error } = await supabase
    .from("programs")
    .select("name")
    .order("name", { ascending: true });

  if (error) {
    console.error(error);
    throw error;
  }

  return [...new Set((data ?? []).map((program) => program.name).filter(Boolean))];
}
