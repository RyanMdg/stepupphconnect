import { WARNING, SUCCESS } from "../lib/constants";

export const monthlyGrowthData = [
  { month: "Aug", candidates: 45 },
  { month: "Sep", candidates: 62 },
  { month: "Oct", candidates: 58 },
  { month: "Nov", candidates: 78 },
  { month: "Dec", candidates: 91 },
  { month: "Jan", candidates: 104 },
];

export const endorsementsData = [
  { month: "Aug", endorsements: 12 },
  { month: "Sep", endorsements: 18 },
  { month: "Oct", endorsements: 15 },
  { month: "Nov", endorsements: 24 },
  { month: "Dec", endorsements: 28 },
  { month: "Jan", endorsements: 32 },
];

export const conversionData = [
  { stage: "Endorsed", count: 64 },
  { stage: "Shortlisted", count: 48 },
  { stage: "Interviewed", count: 36 },
  { stage: "Offered", count: 28 },
  { stage: "Hired", count: 22 },
];

export const skillsData = [
  { skill: "Customer Service", count: 54 },
  { skill: "Communication", count: 49 },
  { skill: "Google Workspace", count: 38 },
  { skill: "Excel", count: 36 },
  { skill: "CRM", count: 28 },
  { skill: "Zendesk", count: 22 },
  { skill: "English C1", count: 19 },
  { skill: "HubSpot", count: 14 },
];

export const completionDonut = [
  { name: "Completed", value: 87 },
  { name: "Remaining", value: 13 },
];

export const activityFeed = [
  {
    type: "endorsed",
    text: "Maria Santos endorsed to TalentFirst Asia",
    time: "2 hours ago",
  },
  {
    type: "hired",
    text: "Jose Bautista confirmed hired at GlobalHire PH",
    time: "4 hours ago",
  },
  {
    type: "registered",
    text: "New candidate Patricia Gomez registered",
    time: "6 hours ago",
  },
  {
    type: "request",
    text: "PrimePlacements Inc. submitted agency request",
    time: "1 day ago",
  },
  {
    type: "completed",
    text: "BPO Career Ready — Batch 7 completed training",
    time: "1 day ago",
  },
];

export const kanbanColumns = [
  { id: "available", label: "Available", color: "#9CA3AF" },
  { id: "requested", label: "Requested", color: WARNING },
  { id: "shortlisted", label: "Shortlisted", color: "#3B82F6" },
  { id: "interview", label: "Interview", color: "#8B5CF6" },
  { id: "offered", label: "Offered", color: "#F97316" },
  { id: "hired", label: "Hired", color: SUCCESS },
  { id: "rejected", label: "Rejected", color: "#DC2626" },
];

export const kanbanCards = [
  {
    candidateId: 1,
    agency: "TalentFirst Asia",
    date: "Jan 10",
    stage: "shortlisted",
  },
  {
    candidateId: 2,
    agency: "GlobalHire PH",
    date: "Jan 8",
    stage: "interview",
  },
  {
    candidateId: 3,
    agency: "CareerBridge",
    date: "Jan 11",
    stage: "offered",
  },
  {
    candidateId: 5,
    agency: "TalentFirst Asia",
    date: "Jan 9",
    stage: "requested",
  },
  {
    candidateId: 8,
    agency: "CareerBridge",
    date: "Jan 7",
    stage: "available",
  },
  {
    candidateId: 4,
    agency: "GlobalHire PH",
    date: "Jan 5",
    stage: "available",
  },
  {
    candidateId: 6,
    agency: "TalentFirst Asia",
    date: "Dec 20",
    stage: "hired",
  },
  {
    candidateId: 7,
    agency: "CareerBridge",
    date: "Jan 2",
    stage: "rejected",
  },
];
