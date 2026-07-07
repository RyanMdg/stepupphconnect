import { supabase } from "../lib/supabase";

export type DashboardCandidate = {
  id: string;
  name: string;
  photo: string | null;
  program: string | null;
  status: string;
  created_at: string;
};

export type DashboardProgram = {
  id: string;
  name: string;
  completion_rate: number;
};

export type DashboardActivity = {
  id: string;
  type: "endorsed" | "hired" | "registered" | "request" | "completed";
  text: string;
  created_at: string;
};

export type DashboardPendingRequest = {
  id: string;
  agency_name: string;
  industry: string | null;
  created_at: string;
};

export type DashboardData = {
  stats: {
    totalCandidates: number;
    jobReady: number;
    partnerAgencies: number;
    activeEmployers: number;
    endorsedThisQuarter: number;
    hired: number;
  };
  monthlyGrowthData: { month: string; candidates: number }[];
  endorsementsData: { month: string; endorsements: number }[];
  conversionData: { stage: string; count: number }[];
  completionDonut: { name: string; value: number }[];
  programs: DashboardProgram[];
  activityFeed: DashboardActivity[];
  latestCandidates: DashboardCandidate[];
  pendingRequests: DashboardPendingRequest[];
};

const monthFormatter = new Intl.DateTimeFormat("en", { month: "short" });

function monthBuckets() {
  const now = new Date();

  return Array.from({ length: 6 }, (_, index) => {
    const date = new Date(now.getFullYear(), now.getMonth() - (5 - index), 1);

    return {
      key: `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(
        2,
        "0",
      )}`,
      month: monthFormatter.format(date),
    };
  });
}

function countByMonth(rows: { created_at: string }[]) {
  return rows.reduce<Record<string, number>>((acc, row) => {
    const date = new Date(row.created_at);
    const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(
      2,
      "0",
    )}`;

    acc[key] = (acc[key] ?? 0) + 1;
    return acc;
  }, {});
}

function emptyDashboard(): DashboardData {
  return {
    stats: {
      totalCandidates: 0,
      jobReady: 0,
      partnerAgencies: 0,
      activeEmployers: 0,
      endorsedThisQuarter: 0,
      hired: 0,
    },
    monthlyGrowthData: monthBuckets().map(({ month }) => ({
      month,
      candidates: 0,
    })),
    endorsementsData: monthBuckets().map(({ month }) => ({
      month,
      endorsements: 0,
    })),
    conversionData: [
      { stage: "Endorsed", count: 0 },
      { stage: "Shortlisted", count: 0 },
      { stage: "Interviewed", count: 0 },
      { stage: "Offered", count: 0 },
      { stage: "Hired", count: 0 },
    ],
    completionDonut: [
      { name: "Completed", value: 0 },
      { name: "Remaining", value: 100 },
    ],
    programs: [],
    activityFeed: [],
    latestCandidates: [],
    pendingRequests: [],
  };
}

function safeCount(count: number | null) {
  return count ?? 0;
}

function formatDashboardError(error: unknown) {
  console.warn("Dashboard query skipped:", error);
}

async function getCount(table: string, filter?: (query: any) => any) {
  try {
    let query = supabase.from(table).select("*", {
      count: "exact",
      head: true,
    });

    if (filter) query = filter(query);

    const { count, error } = await query;
    if (error) throw error;

    return safeCount(count);
  } catch (error) {
    formatDashboardError(error);
    return 0;
  }
}

async function getRows<T>(
  table: string,
  columns: string,
  limit?: number,
  configure?: (query: any) => any,
) {
  try {
    let query = supabase.from(table).select(columns);

    if (configure) query = configure(query);
    if (limit) query = query.limit(limit);

    const { data, error } = await query;
    if (error) throw error;

    return (data ?? []) as T[];
  } catch (error) {
    formatDashboardError(error);
    return [];
  }
}

export async function getDashboardData(): Promise<DashboardData> {
  const dashboard = emptyDashboard();
  const sixMonthsAgo = new Date();
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 5);
  sixMonthsAgo.setDate(1);
  sixMonthsAgo.setHours(0, 0, 0, 0);

  const quarterStart = new Date();
  quarterStart.setMonth(quarterStart.getMonth() - 3);

  const [
    totalCandidates,
    jobReady,
    partnerAgencies,
    activeEmployers,
    hiredCandidates,
    endorsedThisQuarter,
    candidatesForGrowth,
    endorsementRows,
    conversionRows,
    programs,
    activityFeed,
    latestCandidates,
    pendingRequests,
  ] = await Promise.all([
    getCount("candidates"),
    getCount("candidates", (query) => query.eq("status", "job_ready")),
    getCount("agencies"),
    getCount("employers", (query) => query.eq("status", "active")),
    getCount("candidates", (query) => query.eq("status", "placed")),
    getCount("endorsements", (query) =>
      query.gte("created_at", quarterStart.toISOString()),
    ),
    getRows<{ created_at: string }>(
      "candidates",
      "created_at",
    ).then((rows) =>
      rows.filter((row) => new Date(row.created_at) >= sixMonthsAgo),
    ),
    getRows<{ created_at: string }>(
      "endorsements",
      "created_at",
    ).then((rows) =>
      rows.filter((row) => new Date(row.created_at) >= sixMonthsAgo),
    ),
    getRows<{ stage: string }>("endorsements", "stage"),
    getRows<DashboardProgram>(
      "programs",
      "id,name,completion_rate",
      3,
      (query) => query.order("completion_rate", { ascending: false }),
    ),
    getRows<DashboardActivity>(
      "activity_feed",
      "id,type,text,created_at",
      5,
      (query) => query.order("created_at", { ascending: false }),
    ),
    getRows<DashboardCandidate>(
      "candidates",
      "id,name,photo,program,status,created_at",
      5,
      (query) => query.order("created_at", { ascending: false }),
    ),
    getRows<DashboardPendingRequest>(
      "agency_requests",
      "id,agency_name,industry,created_at",
      1,
      (query) =>
        query.eq("status", "pending").order("created_at", {
          ascending: false,
        }),
    ),
  ]);

  const candidateMonthCounts = countByMonth(candidatesForGrowth);
  const endorsementMonthCounts = countByMonth(endorsementRows);
  const buckets = monthBuckets();
  const totalProgramCompletion = programs.reduce(
    (sum, program) => sum + Number(program.completion_rate ?? 0),
    0,
  );
  const averageCompletion = programs.length
    ? Math.round(totalProgramCompletion / programs.length)
    : 0;
  const stageCounts = conversionRows.reduce<Record<string, number>>(
    (acc, row) => {
      acc[row.stage] = (acc[row.stage] ?? 0) + 1;
      return acc;
    },
    {},
  );

  return {
    stats: {
      totalCandidates,
      jobReady,
      partnerAgencies,
      activeEmployers,
      endorsedThisQuarter,
      hired: hiredCandidates,
    },
    monthlyGrowthData: buckets.map(({ key, month }) => ({
      month,
      candidates: candidateMonthCounts[key] ?? 0,
    })),
    endorsementsData: buckets.map(({ key, month }) => ({
      month,
      endorsements: endorsementMonthCounts[key] ?? 0,
    })),
    conversionData: dashboard.conversionData.map((stage) => ({
      ...stage,
      count:
        stageCounts[stage.stage.toLowerCase()] ??
        stageCounts[stage.stage] ??
        0,
    })),
    completionDonut: [
      { name: "Completed", value: averageCompletion },
      { name: "Remaining", value: Math.max(100 - averageCompletion, 0) },
    ],
    programs,
    activityFeed,
    latestCandidates,
    pendingRequests,
  };
}
