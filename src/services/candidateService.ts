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
  resume_url: string | null;
  created_at: string;
  updated_at: string;
};

export type CandidateInput = {
  name: string;
  photo?: string | null;
  title?: string | null;
  program?: string | null;
  skills?: string[];
  experience?: string | null;
  english_level?: string | null;
  status: CandidateStatus;
  readiness_score: number;
  availability?: string | null;
  province?: string | null;
  email?: string | null;
  phone?: string | null;
  expected_salary?: string | null;
  preferred_work?: string | null;
  resume_url?: string | null;
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
  resume_url,
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
  created_at,
  updated_at
`;

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

function withResumeFallback<T extends Partial<CandidateRecord>>(rows: T[]) {
  return rows.map((row) => ({
    ...row,
    resume_url: row.resume_url ?? null,
  })) as CandidateRecord[];
}

function buildCandidateQuery(columns: string, filters: CandidateFilters = {}) {
  let query = supabase
    .from("candidates")
    .select(columns)
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

  return query;
}

export async function getCandidates(filters: CandidateFilters = {}) {
  const { data, error } = await buildCandidateQuery(candidateColumns, filters);

  if (isMissingResumeColumn(error)) {
    const fallback = await buildCandidateQuery(
      candidateColumnsWithoutResume,
      filters,
    );

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

export async function getCandidate(id: string) {
  const { data, error } = await supabase
    .from("candidates")
    .select(candidateColumns)
    .eq("id", id)
    .maybeSingle<CandidateRecord>();

  if (isMissingResumeColumn(error)) {
    const fallback = await supabase
      .from("candidates")
      .select(candidateColumnsWithoutResume)
      .eq("id", id)
      .maybeSingle<Omit<CandidateRecord, "resume_url">>();

    if (fallback.error) {
      console.error(fallback.error);
      throw fallback.error;
    }

    return fallback.data
      ? ({ ...fallback.data, resume_url: null } as CandidateRecord)
      : null;
  }

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

export async function createCandidate(values: CandidateInput) {
  const { data, error } = await supabase
    .from("candidates")
    .insert(values)
    .select(candidateColumns)
    .single();

  if (isMissingResumeColumn(error)) {
    const { resume_url: _resumeUrl, ...valuesWithoutResume } = values;
    const fallback = await supabase
      .from("candidates")
      .insert(valuesWithoutResume)
      .select(candidateColumnsWithoutResume)
      .single();

    if (fallback.error) {
      console.error(fallback.error);
      throw fallback.error;
    }

    return { ...fallback.data, resume_url: null } as CandidateRecord;
  }

  if (error) {
    console.error(error);
    throw error;
  }

  return data as CandidateRecord;
}

export async function updateCandidate(id: string, values: CandidateInput) {
  const { data, error } = await supabase
    .from("candidates")
    .update({ ...values, updated_at: new Date().toISOString() })
    .eq("id", id)
    .select(candidateColumns)
    .single();

  if (isMissingResumeColumn(error)) {
    const { resume_url: _resumeUrl, ...valuesWithoutResume } = values;
    const fallback = await supabase
      .from("candidates")
      .update({ ...valuesWithoutResume, updated_at: new Date().toISOString() })
      .eq("id", id)
      .select(candidateColumnsWithoutResume)
      .single();

    if (fallback.error) {
      console.error(fallback.error);
      throw fallback.error;
    }

    return { ...fallback.data, resume_url: null } as CandidateRecord;
  }

  if (error) {
    console.error(error);
    throw error;
  }

  return data as CandidateRecord;
}

export async function deleteCandidate(id: string) {
  const { error } = await supabase.from("candidates").delete().eq("id", id);

  if (error) {
    console.error(error);
    throw error;
  }

  return true;
}

export async function uploadCandidateFile(file: File, folder: "photos" | "resumes") {
  const extension = file.name.split(".").pop();
  const safeName = file.name
    .replace(/\.[^/.]+$/, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
  const path = `${folder}/${crypto.randomUUID()}-${safeName}.${extension}`;

  const { error } = await supabase.storage
    .from("candidate-files")
    .upload(path, file, {
      cacheControl: "3600",
      upsert: false,
    });

  if (error) {
    console.error(error);
    throw error;
  }

  const { data } = supabase.storage.from("candidate-files").getPublicUrl(path);
  return data.publicUrl;
}
