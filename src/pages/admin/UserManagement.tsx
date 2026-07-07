import { useEffect, useState } from "react";
import {
  getAdmins,
  registerAdmin,
  type Admin,
} from "../../services/adminService";
import {
  getAgencies,
  registerAgency,
  type Agency,
} from "../../services/agencyService";
import { Plus, XCircle, CheckCircle, MoreHorizontal } from "lucide-react";
import { Card } from "../../components/shared/Card";
import { Avatar } from "../../components/shared/Avatar";
import { StatusChip } from "../../components/shared/Chip";
import { RED, SUCCESS } from "../../lib/constants";

const emptyAdminForm = {
  name: "",
  email: "",
  password: "",
  confirmPassword: "",
};

const emptyAgencyForm = {
  name: "",
  industry: "",
  contact: "",
  email: "",
  phone: "",
  specializations: "",
  slots: "",
  password: "",
  confirmPassword: "",
};

function formatDate(value: string | null) {
  if (!value) return "Never";

  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(value));
}

function agencyLogo(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();
}

function parseSpecializations(value: string) {
  return value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

export function PortalAccessPage() {
  const [tab, setTab] = useState<"admins" | "agencies">("admins");

  // Admin form
  const [showAdminForm, setShowAdminForm] = useState(false);
  const [admins, setAdmins] = useState<Admin[]>([]);
  const [adminsLoading, setAdminsLoading] = useState(true);

  const [adminForm, setAdminForm] = useState(emptyAdminForm);
  const [adminSubmitting, setAdminSubmitting] = useState(false);
  const [adminError, setAdminError] = useState("");

  const loadAdmins = async () => {
    try {
      setAdminsLoading(true);
      const data = await getAdmins();
      setAdmins(data);
    } catch (error) {
      console.error(error);
      setAdminError("Unable to load admins from Supabase.");
    } finally {
      setAdminsLoading(false);
    }
  };

  useEffect(() => {
    loadAdmins();
  }, []);
  const [adminSuccess, setAdminSuccess] = useState(false);

  // Agency form
  const [showAgencyForm, setShowAgencyForm] = useState(false);
  const [agencies, setAgencies] = useState<Agency[]>([]);
  const [agenciesLoading, setAgenciesLoading] = useState(true);
  const [agencyForm, setAgencyForm] = useState(emptyAgencyForm);
  const [agencySubmitting, setAgencySubmitting] = useState(false);
  const [agencyError, setAgencyError] = useState("");
  const [agencySuccess, setAgencySuccess] = useState(false);

  const loadAgencies = async () => {
    try {
      setAgenciesLoading(true);
      const data = await getAgencies();
      setAgencies(data);
    } catch (error) {
      console.error(error);
      setAgencyError("Unable to load agencies from Supabase.");
    } finally {
      setAgenciesLoading(false);
    }
  };

  useEffect(() => {
    loadAgencies();
  }, []);

  const handleAdminSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (adminForm.password !== adminForm.confirmPassword) {
      setAdminError("Passwords do not match.");
      return;
    }

    try {
      setAdminSubmitting(true);
      setAdminError("");
      await registerAdmin({
        name: adminForm.name.trim(),
        email: adminForm.email.trim(),
        password: adminForm.password,
      });
      await loadAdmins();
      setAdminSuccess(true);
      setTimeout(() => {
        setAdminSuccess(false);
        setShowAdminForm(false);
        setAdminForm(emptyAdminForm);
      }, 900);
    } catch (error) {
      console.error(error);
      setAdminError("Unable to register admin. Check Supabase logs for details.");
    } finally {
      setAdminSubmitting(false);
    }
  };

  const handleAgencySubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (agencyForm.password !== agencyForm.confirmPassword) {
      setAgencyError("Passwords do not match.");
      return;
    }

    try {
      setAgencySubmitting(true);
      setAgencyError("");
      await registerAgency({
        name: agencyForm.name.trim(),
        industry: agencyForm.industry,
        contact: agencyForm.contact.trim(),
        email: agencyForm.email.trim(),
        password: agencyForm.password,
        phone: agencyForm.phone.trim(),
        specializations: parseSpecializations(agencyForm.specializations),
        available_slots: Number(agencyForm.slots || 0),
      });
      await loadAgencies();
      setAgencySuccess(true);
      setTimeout(() => {
        setAgencySuccess(false);
        setShowAgencyForm(false);
        setAgencyForm(emptyAgencyForm);
      }, 900);
    } catch (error) {
      console.error(error);
      setAgencyError(
        "Unable to register agency. Check Supabase logs for details.",
      );
    } finally {
      setAgencySubmitting(false);
    }
  };

  return (
    <div className="p-6 space-y-5 max-w-screen-xl">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h2
            className="text-base font-semibold text-[#222222]"
            style={{ fontFamily: '"Plus Jakarta Sans", sans-serif' }}
          >
            Portal Access
          </h2>
          <p className="text-xs text-gray-500 mt-0.5">
            Register and manage admin accounts and partner agency portals
          </p>
        </div>
        <button
          onClick={() =>
            tab === "admins" ? setShowAdminForm(true) : setShowAgencyForm(true)
          }
          className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-semibold text-white hover:bg-[#8a0000] transition"
          style={{ backgroundColor: RED }}
        >
          <Plus size={13} />
          {tab === "admins" ? "Register Admin" : "Register Agency"}
        </button>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-[#E5E7EB]">
        {(["admins", "agencies"] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-5 py-3 text-sm font-medium border-b-2 -mb-px transition-colors ${
              tab === t
                ? "border-[#A10000] text-[#A10000]"
                : "border-transparent text-gray-500 hover:text-[#222222]"
            }`}
          >
            {t === "admins" ? "Admin Accounts" : "Agency Accounts"}
            <span
              className={`ml-2 px-1.5 py-0.5 rounded-md text-[10px] font-semibold ${
                tab === t
                  ? "bg-red-50 text-[#A10000]"
                  : "bg-gray-100 text-gray-500"
              }`}
            >
              {t === "admins" ? admins.length : agencies.length}
            </span>
          </button>
        ))}
      </div>

      {/* ── Admin Accounts Tab ── */}
      {tab === "admins" && (
        <div className="space-y-4">
          <Card className="overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="border-b border-[#E5E7EB] bg-[#F8F9FB]">
                  {["Admin", "Email", "Role", "Last Active", "Status", ""].map(
                    (h, i) => (
                      <th
                        key={i}
                        className="text-left px-4 py-2.5 text-[10px] font-semibold text-gray-500 uppercase tracking-wider"
                      >
                        {h}
                      </th>
                    ),
                  )}
                </tr>
              </thead>
              <tbody>
                {adminsLoading && (
                  <tr>
                    <td
                      colSpan={6}
                      className="px-4 py-6 text-center text-xs text-gray-400"
                    >
                      Loading admins...
                    </td>
                  </tr>
                )}
                {!adminsLoading && admins.length === 0 && (
                  <tr>
                    <td
                      colSpan={6}
                      className="px-4 py-6 text-center text-xs text-gray-400"
                    >
                      No admins registered yet.
                    </td>
                  </tr>
                )}
                {!adminsLoading && admins.map((a, i) => (
                  <tr
                    key={a.id}
                    className={`border-b border-[#E5E7EB] hover:bg-[#F8F9FB] transition ${i === admins.length - 1 ? "border-b-0" : ""}`}
                  >
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2.5">
                        <Avatar name={a.name} size="sm" />
                        <span className="text-sm font-medium text-[#222222]">
                          {a.name}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-xs text-gray-500">
                      {a.email}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`text-xs font-medium px-2 py-0.5 rounded-md ${
                          "bg-red-50 text-[#A10000] border border-red-100"
                        }`}
                      >
                        Admin
                      </span>
                    </td>
                    <td className="px-4 py-3 text-xs text-gray-400">
                      {formatDate(a.last_active)}
                    </td>
                    <td className="px-4 py-3">
                      <StatusChip status={a.status} />
                    </td>
                    <td className="px-4 py-3">
                      <button className="p-1 hover:bg-gray-100 rounded-md transition">
                        <MoreHorizontal size={14} className="text-gray-400" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Card>

          {/* <div className="p-4 rounded-xl border border-amber-100 bg-amber-50/50 flex items-start gap-3">
            <div className="w-8 h-8 rounded-lg bg-amber-100 flex items-center justify-center flex-shrink-0">
              <Shield size={15} className="text-amber-600" />
            </div>
            <div>
              <p className="text-xs font-semibold text-amber-800">
                Super Admin access is restricted
              </p>
              <p className="text-xs text-amber-700 mt-0.5">
                Only existing Super Admins can promote other users to Super
                Admin. New invites default to Viewer role.
              </p>
            </div>
          </div> */}
        </div>
      )}

      {/* ── Agency Accounts Tab ── */}
      {tab === "agencies" && (
        <div className="space-y-4">
          <Card className="overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="border-b border-[#E5E7EB] bg-[#F8F9FB]">
                  {[
                    "Agency",
                    "Industry",
                    "Contact Person",
                    "Email",
                    "Portal Status",
                    "Slots",
                    "",
                  ].map((h, i) => (
                    <th
                      key={i}
                      className="text-left px-4 py-2.5 text-[10px] font-semibold text-gray-500 uppercase tracking-wider"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {agenciesLoading && (
                  <tr>
                    <td
                      colSpan={7}
                      className="px-4 py-6 text-center text-xs text-gray-400"
                    >
                      Loading agencies...
                    </td>
                  </tr>
                )}
                {!agenciesLoading && agencies.length === 0 && (
                  <tr>
                    <td
                      colSpan={7}
                      className="px-4 py-6 text-center text-xs text-gray-400"
                    >
                      No agencies registered yet.
                    </td>
                  </tr>
                )}
                {!agenciesLoading && agencies.map((a, i) => (
                  <tr
                    key={a.id}
                    className={`border-b border-[#E5E7EB] hover:bg-[#F8F9FB] transition ${i === agencies.length - 1 ? "border-b-0" : ""}`}
                  >
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2.5">
                        <div
                          className="w-8 h-8 rounded-lg flex items-center justify-center text-white text-xs font-bold flex-shrink-0"
                          style={{ backgroundColor: RED }}
                        >
                          {agencyLogo(a.name)}
                        </div>
                        <span className="text-sm font-medium text-[#222222]">
                          {a.name}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-xs text-gray-500">
                      {a.industry}
                    </td>
                    <td className="px-4 py-3 text-xs text-gray-600">
                      {a.contact}
                    </td>
                    <td className="px-4 py-3 text-xs text-gray-500">
                      {a.email}
                    </td>
                    <td className="px-4 py-3">
                      <StatusChip status={a.status} />
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`text-sm font-semibold ${a.available_slots > 0 ? "text-green-600" : "text-gray-400"}`}
                      >
                        {a.available_slots}
                      </span>
                    </td>
                    <td className="px-4 py-3 flex items-center gap-2">
                      <button className="text-xs text-[#A10000] font-medium hover:underline">
                        Edit
                      </button>
                      <button className="p-1 hover:bg-gray-100 rounded-md transition">
                        <MoreHorizontal size={14} className="text-gray-400" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Card>
        </div>
      )}

      {/* ── Invite Admin Modal ── */}
      {showAdminForm && (
        <div
          className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4"
          onClick={() => setShowAdminForm(false)}
        >
          <div
            className="bg-white rounded-2xl shadow-2xl w-full max-w-md flex flex-col overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-6 py-4 border-b border-[#E5E7EB]">
              <div>
                <h3
                  className="font-bold text-[#222222]"
                  style={{ fontFamily: '"Plus Jakarta Sans", sans-serif' }}
                >
                  Register Admin
                </h3>
                <p className="text-xs text-gray-400 mt-0.5">
                  Grant platform access to a Step Up PH team member
                </p>
              </div>
              <button
                onClick={() => setShowAdminForm(false)}
                className="p-1.5 hover:bg-gray-100 rounded-lg transition"
              >
                <XCircle size={16} className="text-gray-400" />
              </button>
            </div>
            <form onSubmit={handleAdminSubmit} className="p-6 space-y-4">
              {adminError && (
                <div className="rounded-xl border border-red-100 bg-red-50 px-3 py-2 text-xs text-red-700">
                  {adminError}
                </div>
              )}
              <div>
                <label className="text-xs font-medium text-gray-600 block mb-1.5">
                  Full Name <span className="text-[#A10000]">*</span>
                </label>
                <input
                  required
                  value={adminForm.name}
                  onChange={(e) =>
                    setAdminForm((f) => ({ ...f, name: e.target.value }))
                  }
                  placeholder="e.g. Juan dela Cruz"
                  className="w-full px-3 py-2.5 text-sm border border-[#E5E7EB] rounded-xl outline-none focus:border-[#A10000] focus:ring-1 focus:ring-[#A10000]/10 transition bg-white"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-gray-600 block mb-1.5">
                  Email Address <span className="text-[#A10000]">*</span>
                </label>
                <input
                  required
                  type="email"
                  value={adminForm.email}
                  onChange={(e) =>
                    setAdminForm((f) => ({ ...f, email: e.target.value }))
                  }
                  placeholder="name@stepupph.com"
                  className="w-full px-3 py-2.5 text-sm border border-[#E5E7EB] rounded-xl outline-none focus:border-[#A10000] focus:ring-1 focus:ring-[#A10000]/10 transition bg-white"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-gray-600 block mb-1.5">
                  Password <span className="text-[#A10000]">*</span>
                </label>
                <input
                  required
                  type="password"
                  minLength={8}
                  value={adminForm.password}
                  onChange={(e) =>
                    setAdminForm((f) => ({ ...f, password: e.target.value }))
                  }
                  placeholder="At least 8 characters"
                  className="w-full px-3 py-2.5 text-sm border border-[#E5E7EB] rounded-xl outline-none focus:border-[#A10000] focus:ring-1 focus:ring-[#A10000]/10 transition bg-white"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-gray-600 block mb-1.5">
                  Confirm Password <span className="text-[#A10000]">*</span>
                </label>
                <input
                  required
                  type="password"
                  minLength={8}
                  value={adminForm.confirmPassword}
                  onChange={(e) =>
                    setAdminForm((f) => ({
                      ...f,
                      confirmPassword: e.target.value,
                    }))
                  }
                  placeholder="Re-enter password"
                  className="w-full px-3 py-2.5 text-sm border border-[#E5E7EB] rounded-xl outline-none focus:border-[#A10000] focus:ring-1 focus:ring-[#A10000]/10 transition bg-white"
                />
                <p className="text-[10px] text-gray-400 mt-1">
                  This creates the Supabase auth user and admin profile.
                </p>
              </div>
              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAdminForm(false)}
                  className="flex-1 py-2.5 text-sm font-medium border border-[#E5E7EB] rounded-xl text-gray-600 hover:bg-gray-50 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={adminSubmitting}
                  className="flex-1 py-2.5 text-sm font-semibold text-white rounded-xl transition flex items-center justify-center gap-1.5"
                  style={{ backgroundColor: adminSuccess ? SUCCESS : RED }}
                >
                  {adminSuccess ? (
                    <>
                      <CheckCircle size={13} />
                      Admin Registered!
                    </>
                  ) : adminSubmitting ? (
                    "Registering..."
                  ) : (
                    "Register Admin"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Register Agency Modal ── */}
      {showAgencyForm && (
        <div
          className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4"
          onClick={() => setShowAgencyForm(false)}
        >
          <div
            className="bg-white rounded-2xl shadow-2xl w-full max-w-lg flex flex-col overflow-hidden max-h-[92vh]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-6 py-4 border-b border-[#E5E7EB] flex-shrink-0">
              <div>
                <h3
                  className="font-bold text-[#222222]"
                  style={{ fontFamily: '"Plus Jakarta Sans", sans-serif' }}
                >
                  Register Agency
                </h3>
                <p className="text-xs text-gray-400 mt-0.5">
                  Create a portal account for a new recruitment partner
                </p>
              </div>
              <button
                onClick={() => setShowAgencyForm(false)}
                className="p-1.5 hover:bg-gray-100 rounded-lg transition"
              >
                <XCircle size={16} className="text-gray-400" />
              </button>
            </div>
            <form
              onSubmit={handleAgencySubmit}
              className="p-6 space-y-4 overflow-y-auto"
            >
              {agencyError && (
                <div className="rounded-xl border border-red-100 bg-red-50 px-3 py-2 text-xs text-red-700">
                  {agencyError}
                </div>
              )}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="sm:col-span-2">
                  <label className="text-xs font-medium text-gray-600 block mb-1.5">
                    Agency Name <span className="text-[#A10000]">*</span>
                  </label>
                  <input
                    required
                    value={agencyForm.name}
                    onChange={(e) =>
                      setAgencyForm((f) => ({ ...f, name: e.target.value }))
                    }
                    placeholder="e.g. TalentFirst Asia"
                    className="w-full px-3 py-2.5 text-sm border border-[#E5E7EB] rounded-xl outline-none focus:border-[#A10000] focus:ring-1 focus:ring-[#A10000]/10 transition bg-white"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-600 block mb-1.5">
                    Industry <span className="text-[#A10000]">*</span>
                  </label>
                  <select
                    required
                    value={agencyForm.industry}
                    onChange={(e) =>
                      setAgencyForm((f) => ({ ...f, industry: e.target.value }))
                    }
                    className="w-full px-3 py-2.5 text-sm border border-[#E5E7EB] rounded-xl outline-none bg-white cursor-pointer focus:border-[#A10000]"
                  >
                    <option value="">Select industry...</option>
                    {[
                      "BPO / Call Center",
                      "Healthcare / Medical",
                      "IT / Administrative",
                      "Finance",
                      "Retail",
                      "Multi-industry",
                    ].map((i) => (
                      <option key={i}>{i}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-600 block mb-1.5">
                    Available Slots
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={agencyForm.slots}
                    onChange={(e) =>
                      setAgencyForm((f) => ({ ...f, slots: e.target.value }))
                    }
                    placeholder="e.g. 10"
                    className="w-full px-3 py-2.5 text-sm border border-[#E5E7EB] rounded-xl outline-none focus:border-[#A10000] focus:ring-1 focus:ring-[#A10000]/10 transition bg-white"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-600 block mb-1.5">
                    Contact Person <span className="text-[#A10000]">*</span>
                  </label>
                  <input
                    required
                    value={agencyForm.contact}
                    onChange={(e) =>
                      setAgencyForm((f) => ({ ...f, contact: e.target.value }))
                    }
                    placeholder="Full name"
                    className="w-full px-3 py-2.5 text-sm border border-[#E5E7EB] rounded-xl outline-none focus:border-[#A10000] focus:ring-1 focus:ring-[#A10000]/10 transition bg-white"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-600 block mb-1.5">
                    Contact Email <span className="text-[#A10000]">*</span>
                  </label>
                  <input
                    required
                    type="email"
                    value={agencyForm.email}
                    onChange={(e) =>
                      setAgencyForm((f) => ({ ...f, email: e.target.value }))
                    }
                    placeholder="contact@agency.com"
                    className="w-full px-3 py-2.5 text-sm border border-[#E5E7EB] rounded-xl outline-none focus:border-[#A10000] focus:ring-1 focus:ring-[#A10000]/10 transition bg-white"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-600 block mb-1.5">
                    Phone
                  </label>
                  <input
                    value={agencyForm.phone}
                    onChange={(e) =>
                      setAgencyForm((f) => ({ ...f, phone: e.target.value }))
                    }
                    placeholder="+63 900 000 0000"
                    className="w-full px-3 py-2.5 text-sm border border-[#E5E7EB] rounded-xl outline-none focus:border-[#A10000] focus:ring-1 focus:ring-[#A10000]/10 transition bg-white"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="text-xs font-medium text-gray-600 block mb-1.5">
                    Specializations{" "}
                    <span className="text-gray-400 font-normal">
                      (comma-separated)
                    </span>
                  </label>
                  <input
                    value={agencyForm.specializations}
                    onChange={(e) =>
                      setAgencyForm((f) => ({
                        ...f,
                        specializations: e.target.value,
                      }))
                    }
                    placeholder="e.g. Customer Service, Technical Support, Sales"
                    className="w-full px-3 py-2.5 text-sm border border-[#E5E7EB] rounded-xl outline-none focus:border-[#A10000] focus:ring-1 focus:ring-[#A10000]/10 transition bg-white"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-600 block mb-1.5">
                    Password <span className="text-[#A10000]">*</span>
                  </label>
                  <input
                    required
                    type="password"
                    minLength={8}
                    value={agencyForm.password}
                    onChange={(e) =>
                      setAgencyForm((f) => ({
                        ...f,
                        password: e.target.value,
                      }))
                    }
                    placeholder="At least 8 characters"
                    className="w-full px-3 py-2.5 text-sm border border-[#E5E7EB] rounded-xl outline-none focus:border-[#A10000] focus:ring-1 focus:ring-[#A10000]/10 transition bg-white"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-600 block mb-1.5">
                    Confirm Password <span className="text-[#A10000]">*</span>
                  </label>
                  <input
                    required
                    type="password"
                    minLength={8}
                    value={agencyForm.confirmPassword}
                    onChange={(e) =>
                      setAgencyForm((f) => ({
                        ...f,
                        confirmPassword: e.target.value,
                      }))
                    }
                    placeholder="Re-enter password"
                    className="w-full px-3 py-2.5 text-sm border border-[#E5E7EB] rounded-xl outline-none focus:border-[#A10000] focus:ring-1 focus:ring-[#A10000]/10 transition bg-white"
                  />
                </div>
              </div>
              <div className="p-3.5 rounded-xl bg-[#F8F9FB] border border-[#E5E7EB]">
                <p className="text-xs font-medium text-gray-600">
                  Portal account details
                </p>
                <p className="text-[11px] text-gray-400 mt-1">
                  A login invite will be sent to the contact email. The agency
                  will use it to access the Candidate Marketplace and submit
                  requests.
                </p>
              </div>
              <div className="flex gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setShowAgencyForm(false)}
                  className="flex-1 py-2.5 text-sm font-medium border border-[#E5E7EB] rounded-xl text-gray-600 hover:bg-gray-50 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={agencySubmitting}
                  className="flex-1 py-2.5 text-sm font-semibold text-white rounded-xl transition flex items-center justify-center gap-1.5"
                  style={{ backgroundColor: agencySuccess ? SUCCESS : RED }}
                >
                  {agencySuccess ? (
                    <>
                      <CheckCircle size={13} />
                      Agency Registered!
                    </>
                  ) : agencySubmitting ? (
                    "Registering..."
                  ) : (
                    "Register Agency"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
