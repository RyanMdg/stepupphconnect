import { useEffect, useState } from "react";
import {
  Download,
  Edit,
  Filter,
  Plus,
  Search,
  Trash2,
  XCircle,
} from "lucide-react";
import { Card } from "../../components/shared/Card";
import { Btn } from "../../components/shared/Btn";
import { Avatar } from "../../components/shared/Avatar";
import { StatusChip } from "../../components/shared/Chip";
import { ReadinessBar } from "../../components/shared/ReadinessBar";
import {
  createCandidate,
  deleteCandidate,
  getCandidatePrograms,
  getCandidates,
  updateCandidate,
  uploadCandidateFile,
  type CandidateInput,
  type CandidateRecord,
} from "../../services/candidateService";
import { RED } from "../../lib/constants";

type CandidateFormState = {
  name: string;
  title: string;
  program: string;
  skills: string;
  experience: string;
  english_level: string;
  status: "job_ready" | "in_training" | "placed" | "pending";
  readiness_score: string;
  availability: string;
  province: string;
  email: string;
  phone: string;
  expected_salary: string;
  preferred_work: string;
  photo: string;
  resume_url: string;
};

const emptyForm: CandidateFormState = {
  name: "",
  title: "",
  program: "",
  skills: "",
  experience: "",
  english_level: "",
  status: "pending",
  readiness_score: "0",
  availability: "",
  province: "",
  email: "",
  phone: "",
  expected_salary: "",
  preferred_work: "",
  photo: "",
  resume_url: "",
};

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(value));
}

function formFromCandidate(candidate: CandidateRecord): CandidateFormState {
  return {
    name: candidate.name,
    title: candidate.title ?? "",
    program: candidate.program ?? "",
    skills: candidate.skills.join(", "),
    experience: candidate.experience ?? "",
    english_level: candidate.english_level ?? "",
    status: candidate.status,
    readiness_score: String(candidate.readiness_score),
    availability: candidate.availability ?? "",
    province: candidate.province ?? "",
    email: candidate.email ?? "",
    phone: candidate.phone ?? "",
    expected_salary: candidate.expected_salary ?? "",
    preferred_work: candidate.preferred_work ?? "",
    photo: candidate.photo ?? "",
    resume_url: candidate.resume_url ?? "",
  };
}

function toCandidateInput(form: CandidateFormState): CandidateInput {
  return {
    name: form.name.trim(),
    title: form.title.trim() || null,
    program: form.program.trim() || null,
    skills: form.skills
      .split(",")
      .map((skill) => skill.trim())
      .filter(Boolean),
    experience: form.experience.trim() || null,
    english_level: form.english_level.trim() || null,
    status: form.status,
    readiness_score: Math.min(
      Math.max(Number(form.readiness_score || 0), 0),
      100,
    ),
    availability: form.availability.trim() || null,
    province: form.province.trim() || null,
    email: form.email.trim() || null,
    phone: form.phone.trim() || null,
    expected_salary: form.expected_salary.trim() || null,
    preferred_work: form.preferred_work.trim() || null,
    photo: form.photo || null,
    resume_url: form.resume_url || null,
  };
}

export function CandidateList({
  onSelect,
}: {
  onSelect: (id: string) => void;
}) {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [programFilter, setProgramFilter] = useState("all");
  const [candidates, setCandidates] = useState<CandidateRecord[]>([]);
  const [programs, setPrograms] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingCandidate, setEditingCandidate] =
    useState<CandidateRecord | null>(null);
  const [form, setForm] = useState<CandidateFormState>(emptyForm);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState("");

  const loadPrograms = () => {
    let active = true;

    getCandidatePrograms()
      .then((data) => {
        if (active) setPrograms(data);
      })
      .catch((err) => {
        console.error(err);
      });

    return () => {
      active = false;
    };
  };

  const loadCandidates = () => {
    let active = true;

    setLoading(true);
    setError("");

    getCandidates({
      search,
      status: statusFilter,
      program: programFilter,
    })
      .then((data) => {
        if (active) setCandidates(data);
      })
      .catch((err) => {
        console.error(err);
        if (active) setError("Unable to load candidates from Supabase.");
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  };

  useEffect(() => loadPrograms(), []);

  useEffect(() => loadCandidates(), [search, statusFilter, programFilter]);

  const openCreateForm = () => {
    setEditingCandidate(null);
    setForm(emptyForm);
    setPhotoFile(null);
    setResumeFile(null);
    setFormError("");
    setShowForm(true);
  };

  const openEditForm = (candidate: CandidateRecord) => {
    setEditingCandidate(candidate);
    setForm(formFromCandidate(candidate));
    setPhotoFile(null);
    setResumeFile(null);
    setFormError("");
    setShowForm(true);
  };

  const closeForm = () => {
    if (submitting) return;
    setShowForm(false);
    setEditingCandidate(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!form.name.trim()) {
      setFormError("Candidate name is required.");
      return;
    }

    try {
      setSubmitting(true);
      setFormError("");

      let nextForm = { ...form };
      if (photoFile) {
        nextForm.photo = await uploadCandidateFile(photoFile, "photos");
      }
      if (resumeFile) {
        nextForm.resume_url = await uploadCandidateFile(resumeFile, "resumes");
      }

      const payload = toCandidateInput(nextForm);

      if (editingCandidate) {
        await updateCandidate(editingCandidate.id, payload);
      } else {
        await createCandidate(payload);
      }

      setShowForm(false);
      setEditingCandidate(null);
      loadCandidates();
      loadPrograms();
    } catch (err) {
      console.error(err);
      setFormError(
        err instanceof Error
          ? err.message
          : "Unable to save candidate. Check Supabase policies and storage.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (candidate: CandidateRecord) => {
    const confirmed = window.confirm(`Delete ${candidate.name}?`);
    if (!confirmed) return;

    try {
      await deleteCandidate(candidate.id);
      loadCandidates();
    } catch (err) {
      console.error(err);
      setError("Unable to delete candidate.");
    }
  };

  return (
    <div className="p-6 space-y-4 max-w-screen-xl">
      <div className="flex items-center justify-between">
        <div>
          <h2
            className="text-base font-semibold text-[#222222]"
            style={{
              fontFamily: '"Poppins", sans-serif',
            }}
          >
            Candidates
          </h2>
          <p className="text-xs text-gray-500 mt-0.5">
            {candidates.length} total candidates
          </p>
        </div>
        <Btn onClick={openCreateForm}>
          <Plus size={13} />
          Add Candidate
        </Btn>
      </div>

      <Card className="p-3.5">
        <div className="flex flex-wrap gap-2.5">
          <div className="relative flex-1 min-w-48">
            <Search
              size={13}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search candidates..."
              className="pl-8 pr-4 py-1.5 text-xs w-full bg-[#F8F9FB] border border-[#E5E7EB] rounded-lg outline-none focus:border-gray-300 transition"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-1.5 text-xs border border-[#E5E7EB] rounded-lg bg-white text-gray-600 outline-none cursor-pointer"
          >
            <option value="all">All Statuses</option>
            <option value="job_ready">Job Ready</option>
            <option value="in_training">In Training</option>
            <option value="placed">Placed</option>
          </select>
          <select
            value={programFilter}
            onChange={(e) => setProgramFilter(e.target.value)}
            className="px-3 py-1.5 text-xs border border-[#E5E7EB] rounded-lg bg-white text-gray-600 outline-none cursor-pointer"
          >
            <option value="all">All Programs</option>
            {programs.map((program) => (
              <option key={program} value={program}>
                {program}
              </option>
            ))}
          </select>
          <Btn variant="outline" size="sm">
            <Filter size={12} />
            Filters
          </Btn>
          <Btn variant="outline" size="sm" className="ml-auto">
            <Download size={12} />
            Export
          </Btn>
        </div>
      </Card>

      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[#E5E7EB] bg-[#F8F9FB]">
                {[
                  "Candidate",
                  "Program",
                  "Skills",
                  "English Level",
                  "Status",
                  "Readiness",
                  "Availability",
                  "Updated",
                  "",
                ].map((h, i) => (
                  <th
                    key={i}
                    className={`text-left px-4 py-2.5 text-[10px] font-semibold text-gray-500 uppercase tracking-wider ${
                      i === 2 || i === 3
                        ? "hidden lg:table-cell"
                        : i === 6 || i === 7
                          ? "hidden xl:table-cell"
                          : ""
                    }`}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading && (
                <tr>
                  <td
                    colSpan={9}
                    className="px-4 py-12 text-center text-sm text-gray-400"
                  >
                    Loading candidates...
                  </td>
                </tr>
              )}
              {!loading && error && (
                <tr>
                  <td
                    colSpan={9}
                    className="px-4 py-12 text-center text-sm text-red-500"
                  >
                    {error}
                  </td>
                </tr>
              )}
              {!loading && !error && candidates.map((c, idx) => (
                <tr
                  key={c.id}
                  onClick={() => onSelect(c.id)}
                  className={`border-b border-[#E5E7EB] hover:bg-[#F8F9FB] cursor-pointer transition-colors ${idx === candidates.length - 1 ? "border-b-0" : ""}`}
                >
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2.5">
                      <Avatar name={c.name} photo={c.photo ?? undefined} size="sm" />
                      <div>
                        <div className="text-sm font-medium text-[#222222]">
                          {c.name}
                        </div>
                        <div className="text-[11px] text-gray-400">
                          {c.title ?? "No title"}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-xs text-gray-500 max-w-[140px]">
                    <span className="truncate block">{c.program ?? "No program"}</span>
                  </td>
                  <td className="px-4 py-3 hidden lg:table-cell">
                    <div className="flex flex-wrap gap-1">
                      {c.skills.slice(0, 2).map((s) => (
                        <span
                          key={s}
                          className="text-[10px] bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded-md"
                        >
                          {s}
                        </span>
                      ))}
                      {c.skills.length > 2 && (
                        <span className="text-[10px] text-gray-400">
                          +{c.skills.length - 2}
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-xs text-gray-600 hidden lg:table-cell">
                    {c.english_level ?? "Not set"}
                  </td>
                  <td className="px-4 py-3">
                    <StatusChip status={c.status} />
                  </td>
                  <td className="px-4 py-3 w-28">
                    <ReadinessBar score={c.readiness_score} />
                  </td>
                  <td className="px-4 py-3 text-xs text-gray-600 hidden xl:table-cell">
                    {c.availability ?? "Not set"}
                  </td>
                  <td className="px-4 py-3 text-xs text-gray-400 hidden xl:table-cell">
                    {formatDate(c.updated_at)}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1">
                      <button
                        className="p-1.5 hover:bg-gray-100 rounded-md transition"
                        title="Edit candidate"
                        onClick={(e) => {
                          e.stopPropagation();
                          openEditForm(c);
                        }}
                      >
                        <Edit size={13} className="text-gray-500" />
                      </button>
                      <button
                        className="p-1.5 hover:bg-red-50 rounded-md transition"
                        title="Delete candidate"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDelete(c);
                        }}
                      >
                        <Trash2 size={13} className="text-red-500" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {!loading && !error && candidates.length === 0 && (
                <tr>
                  <td
                    colSpan={9}
                    className="px-4 py-12 text-center text-sm text-gray-400"
                  >
                    No candidates match your filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {showForm && (
        <div
          className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4"
          onClick={closeForm}
        >
          <div
            className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl flex flex-col overflow-hidden max-h-[92vh]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-6 py-4 border-b border-[#E5E7EB] flex-shrink-0">
              <div>
                <h3
                  className="font-bold text-[#222222]"
                  style={{ fontFamily: '"Poppins", sans-serif' }}
                >
                  {editingCandidate ? "Edit Candidate" : "Add Candidate"}
                </h3>
                <p className="text-xs text-gray-400 mt-0.5">
                  Save profile details, photo, resume, and placement readiness
                </p>
              </div>
              <button
                onClick={closeForm}
                className="p-1.5 hover:bg-gray-100 rounded-lg transition"
              >
                <XCircle size={16} className="text-gray-400" />
              </button>
            </div>

            <form
              onSubmit={handleSubmit}
              className="p-6 space-y-5 overflow-y-auto"
            >
              {formError && (
                <div className="rounded-xl border border-red-100 bg-red-50 px-3 py-2 text-xs text-red-700">
                  {formError}
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div className="md:col-span-2">
                  <label className="text-xs font-medium text-gray-600 block mb-1.5">
                    Full Name <span className="text-[#A10000]">*</span>
                  </label>
                  <input
                    required
                    value={form.name}
                    onChange={(e) =>
                      setForm((prev) => ({ ...prev, name: e.target.value }))
                    }
                    className="w-full px-3 py-2.5 text-sm border border-[#E5E7EB] rounded-xl outline-none focus:border-[#A10000]"
                    placeholder="e.g. Maria Santos"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-600 block mb-1.5">
                    Status
                  </label>
                  <select
                    value={form.status}
                    onChange={(e) =>
                      setForm((prev) => ({
                        ...prev,
                        status: e.target.value as CandidateFormState["status"],
                      }))
                    }
                    className="w-full px-3 py-2.5 text-sm border border-[#E5E7EB] rounded-xl outline-none bg-white"
                  >
                    <option value="pending">Pending</option>
                    <option value="in_training">In Training</option>
                    <option value="job_ready">Job Ready</option>
                    <option value="placed">Placed</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-600 block mb-1.5">
                    Job Title
                  </label>
                  <input
                    value={form.title}
                    onChange={(e) =>
                      setForm((prev) => ({ ...prev, title: e.target.value }))
                    }
                    className="w-full px-3 py-2.5 text-sm border border-[#E5E7EB] rounded-xl outline-none focus:border-[#A10000]"
                    placeholder="Virtual Assistant"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-600 block mb-1.5">
                    Program
                  </label>
                  <input
                    value={form.program}
                    onChange={(e) =>
                      setForm((prev) => ({ ...prev, program: e.target.value }))
                    }
                    className="w-full px-3 py-2.5 text-sm border border-[#E5E7EB] rounded-xl outline-none focus:border-[#A10000]"
                    placeholder="BPO Career Ready"
                    list="candidate-programs"
                  />
                  <datalist id="candidate-programs">
                    {programs.map((program) => (
                      <option key={program} value={program} />
                    ))}
                  </datalist>
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-600 block mb-1.5">
                    Readiness Score
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={form.readiness_score}
                    onChange={(e) =>
                      setForm((prev) => ({
                        ...prev,
                        readiness_score: e.target.value,
                      }))
                    }
                    className="w-full px-3 py-2.5 text-sm border border-[#E5E7EB] rounded-xl outline-none focus:border-[#A10000]"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-600 block mb-1.5">
                    Experience
                  </label>
                  <input
                    value={form.experience}
                    onChange={(e) =>
                      setForm((prev) => ({
                        ...prev,
                        experience: e.target.value,
                      }))
                    }
                    className="w-full px-3 py-2.5 text-sm border border-[#E5E7EB] rounded-xl outline-none focus:border-[#A10000]"
                    placeholder="2 years"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-600 block mb-1.5">
                    English Level
                  </label>
                  <input
                    value={form.english_level}
                    onChange={(e) =>
                      setForm((prev) => ({
                        ...prev,
                        english_level: e.target.value,
                      }))
                    }
                    className="w-full px-3 py-2.5 text-sm border border-[#E5E7EB] rounded-xl outline-none focus:border-[#A10000]"
                    placeholder="C1 Advanced"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-600 block mb-1.5">
                    Availability
                  </label>
                  <input
                    value={form.availability}
                    onChange={(e) =>
                      setForm((prev) => ({
                        ...prev,
                        availability: e.target.value,
                      }))
                    }
                    className="w-full px-3 py-2.5 text-sm border border-[#E5E7EB] rounded-xl outline-none focus:border-[#A10000]"
                    placeholder="Immediate"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-600 block mb-1.5">
                    Province / City
                  </label>
                  <input
                    value={form.province}
                    onChange={(e) =>
                      setForm((prev) => ({ ...prev, province: e.target.value }))
                    }
                    className="w-full px-3 py-2.5 text-sm border border-[#E5E7EB] rounded-xl outline-none focus:border-[#A10000]"
                    placeholder="Quezon City"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-600 block mb-1.5">
                    Email
                  </label>
                  <input
                    type="email"
                    value={form.email}
                    onChange={(e) =>
                      setForm((prev) => ({ ...prev, email: e.target.value }))
                    }
                    className="w-full px-3 py-2.5 text-sm border border-[#E5E7EB] rounded-xl outline-none focus:border-[#A10000]"
                    placeholder="candidate@email.com"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-600 block mb-1.5">
                    Phone
                  </label>
                  <input
                    value={form.phone}
                    onChange={(e) =>
                      setForm((prev) => ({ ...prev, phone: e.target.value }))
                    }
                    className="w-full px-3 py-2.5 text-sm border border-[#E5E7EB] rounded-xl outline-none focus:border-[#A10000]"
                    placeholder="+63 900 000 0000"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-600 block mb-1.5">
                    Expected Salary
                  </label>
                  <input
                    value={form.expected_salary}
                    onChange={(e) =>
                      setForm((prev) => ({
                        ...prev,
                        expected_salary: e.target.value,
                      }))
                    }
                    className="w-full px-3 py-2.5 text-sm border border-[#E5E7EB] rounded-xl outline-none focus:border-[#A10000]"
                    placeholder="PHP 25,000-30,000"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-600 block mb-1.5">
                    Preferred Work
                  </label>
                  <input
                    value={form.preferred_work}
                    onChange={(e) =>
                      setForm((prev) => ({
                        ...prev,
                        preferred_work: e.target.value,
                      }))
                    }
                    className="w-full px-3 py-2.5 text-sm border border-[#E5E7EB] rounded-xl outline-none focus:border-[#A10000]"
                    placeholder="Remote"
                  />
                </div>
                <div className="md:col-span-3">
                  <label className="text-xs font-medium text-gray-600 block mb-1.5">
                    Skills <span className="text-gray-400">(comma-separated)</span>
                  </label>
                  <input
                    value={form.skills}
                    onChange={(e) =>
                      setForm((prev) => ({ ...prev, skills: e.target.value }))
                    }
                    className="w-full px-3 py-2.5 text-sm border border-[#E5E7EB] rounded-xl outline-none focus:border-[#A10000]"
                    placeholder="Customer Service, Zendesk, Communication"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-600 block mb-1.5">
                    Candidate Photo
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => setPhotoFile(e.target.files?.[0] ?? null)}
                    className="w-full text-xs border border-[#E5E7EB] rounded-xl px-3 py-2 bg-white"
                  />
                  {form.photo && !photoFile && (
                    <p className="text-[10px] text-gray-400 mt-1 truncate">
                      Existing photo will be kept.
                    </p>
                  )}
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-600 block mb-1.5">
                    Resume
                  </label>
                  <input
                    type="file"
                    accept=".pdf,.doc,.docx"
                    onChange={(e) => setResumeFile(e.target.files?.[0] ?? null)}
                    className="w-full text-xs border border-[#E5E7EB] rounded-xl px-3 py-2 bg-white"
                  />
                  {form.resume_url && !resumeFile && (
                    <a
                      href={form.resume_url}
                      target="_blank"
                      rel="noreferrer"
                      className="text-[10px] text-[#A10000] mt-1 inline-block hover:underline"
                    >
                      Existing resume
                    </a>
                  )}
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={closeForm}
                  className="flex-1 py-2.5 text-sm font-medium border border-[#E5E7EB] rounded-xl text-gray-600 hover:bg-gray-50 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 py-2.5 text-sm font-semibold text-white rounded-xl transition disabled:opacity-70"
                  style={{ backgroundColor: RED }}
                >
                  {submitting
                    ? "Saving..."
                    : editingCandidate
                      ? "Save Changes"
                      : "Add Candidate"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
