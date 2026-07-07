export type Role = "admin" | "agency";

export type Candidate = {
  id: number;
  name: string;
  photo: string;
  title: string;
  program: string;
  skills: string[];
  experience: string;
  englishLevel: string;
  status: "job_ready" | "in_training" | "placed" | "pending";
  readinessScore: number;
  availability: string;
  lastUpdated: string;
  province: string;
  email: string;
  phone: string;
  expectedSalary: string;
  preferredWork: string;
};

export type Agency = {
  id: number;
  name: string;
  logo: string;
  industry: string;
  availableSlots: number;
  status: "active" | "pending" | "inactive";
  activeEndorsements: number;
  contact: string;
  email: string;
  specializations: string[];
};
