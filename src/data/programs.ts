export type Program = {
  id: number;
  name: string;
  duration: string;
  instructor: string;
  students: number;
  completionRate: number;
  status: "active" | "enrolling";
};

export const programs: Program[] = [
  {
    id: 1,
    name: "Virtual Assistant Bootcamp",
    duration: "8 weeks",
    instructor: "Gemma Villanueva",
    students: 24,
    completionRate: 87,
    status: "active",
  },
  {
    id: 2,
    name: "BPO Career Ready",
    duration: "6 weeks",
    instructor: "Raymond Tan",
    students: 38,
    completionRate: 91,
    status: "active",
  },
  {
    id: 3,
    name: "Customer Service Excellence",
    duration: "4 weeks",
    instructor: "Sheila Castillo",
    students: 19,
    completionRate: 84,
    status: "active",
  },
  {
    id: 4,
    name: "Healthcare Support Training",
    duration: "10 weeks",
    instructor: "Dr. Ana Domingo",
    students: 15,
    completionRate: 93,
    status: "active",
  },
  {
    id: 5,
    name: "Administrative Professional",
    duration: "5 weeks",
    instructor: "Luz Macaraeg",
    students: 22,
    completionRate: 79,
    status: "enrolling",
  },
];
