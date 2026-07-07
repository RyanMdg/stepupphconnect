import { useEffect, useState } from "react";
import {
  ArrowLeft,
  Building2,
  Calendar,
  CheckCircle,
  Mail,
  Phone,
  Shield,
  Users,
} from "lucide-react";
import { Card } from "../../components/shared/Card";
import { Chip, StatusChip } from "../../components/shared/Chip";
import { Btn } from "../../components/shared/Btn";
import { RED } from "../../lib/constants";
import { getAgency, type Agency } from "../../services/agencyService";

function agencyLogo(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();
}

function formatDate(value?: string | null) {
  if (!value) return "Not set";

  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(value));
}

function contactName(agency: Agency) {
  return agency.contact_person || agency.contact || "No contact person";
}

export function AgencyProfile({
  agencyId,
  onBack,
}: {
  agencyId: string;
  onBack: () => void;
}) {
  const [agency, setAgency] = useState<Agency | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    setLoading(true);
    setError("");

    getAgency(agencyId)
      .then((data) => {
        if (active) setAgency(data);
      })
      .catch((err) => {
        console.error(err);
        if (active) setError("Unable to load agency profile.");
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [agencyId]);

  if (loading) {
    return (
      <div className="p-6 max-w-screen-xl">
        <Card className="p-6 text-sm text-gray-500">
          Loading agency profile...
        </Card>
      </div>
    );
  }

  if (error || !agency) {
    return (
      <div className="p-6 max-w-screen-xl space-y-4">
        <button
          onClick={onBack}
          className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-[#222222] transition"
        >
          <ArrowLeft size={13} />
          Back to Agencies
        </button>
        <Card className="p-6 text-sm text-gray-500">
          {error || "Agency not found."}
        </Card>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-4 max-w-screen-xl">
      <button
        onClick={onBack}
        className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-[#222222] transition"
      >
        <ArrowLeft size={13} />
        Back to Agencies
      </button>

      <Card className="p-5">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="flex items-start gap-4">
            <div
              className="w-16 h-16 rounded-xl flex items-center justify-center text-white text-xl font-bold flex-shrink-0"
              style={{ backgroundColor: RED }}
            >
              {agencyLogo(agency.name)}
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h2
                  className="text-xl font-bold text-[#222222]"
                  style={{ fontFamily: '"Poppins", sans-serif' }}
                >
                  {agency.name}
                </h2>
                <StatusChip status={agency.status} />
                {agency.auth_id && (
                  <Chip variant="success">
                    <Shield size={9} />
                    Portal Linked
                  </Chip>
                )}
              </div>
              <p className="text-sm text-gray-500 mt-0.5">
                {agency.industry || "No industry"}
              </p>
              <div className="flex flex-wrap items-center gap-3 mt-2 text-xs text-gray-400">
                <span className="flex items-center gap-1">
                  <Mail size={11} />
                  {agency.email || "No email"}
                </span>
                <span className="flex items-center gap-1">
                  <Phone size={11} />
                  {agency.phone || "No phone"}
                </span>
                <span className="flex items-center gap-1">
                  <Calendar size={11} />
                  Registered {formatDate(agency.created_at)}
                </span>
              </div>
            </div>
          </div>
          <Btn variant="outline">
            <Building2 size={13} />
            Edit Agency
          </Btn>
        </div>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-5">
          <div className="flex items-center gap-2 mb-2">
            <Users size={15} className="text-[#A10000]" />
            <p className="text-xs font-semibold text-gray-500 uppercase">
              Open Slots
            </p>
          </div>
          <p className="text-2xl font-bold text-[#222222]">
            {agency.available_slots}
          </p>
        </Card>

        <Card className="p-5">
          <div className="flex items-center gap-2 mb-2">
            <CheckCircle size={15} className="text-[#A10000]" />
            <p className="text-xs font-semibold text-gray-500 uppercase">
              Active Endorsements
            </p>
          </div>
          <p className="text-2xl font-bold text-[#222222]">
            {agency.active_endorsements}
          </p>
        </Card>

        <Card className="p-5">
          <div className="flex items-center gap-2 mb-2">
            <Shield size={15} className="text-[#A10000]" />
            <p className="text-xs font-semibold text-gray-500 uppercase">
              Portal Status
            </p>
          </div>
          <StatusChip status={agency.status} />
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-4">
        <Card className="p-5">
          <h3
            className="text-sm font-semibold text-[#222222] mb-4"
            style={{ fontFamily: '"Poppins", sans-serif' }}
          >
            Specializations
          </h3>
          <div className="flex flex-wrap gap-2">
            {(agency.specializations ?? []).length > 0 ? (
              (agency.specializations ?? []).map((item) => (
                <span
                  key={item}
                  className="px-3 py-1.5 rounded-lg bg-[#F8F9FB] border border-[#E5E7EB] text-xs text-gray-700"
                >
                  {item}
                </span>
              ))
            ) : (
              <p className="text-sm text-gray-400">No specializations yet.</p>
            )}
          </div>
        </Card>

        <Card className="p-5">
          <h3
            className="text-sm font-semibold text-[#222222] mb-4"
            style={{ fontFamily: '"Poppins", sans-serif' }}
          >
            Contact Details
          </h3>
          <div className="space-y-3">
            {[
              ["Contact Person", contactName(agency)],
              ["Email", agency.email || "No email"],
              ["Phone", agency.phone || "No phone"],
              ["Auth ID", agency.auth_id || "Not linked"],
              ["Updated", formatDate(agency.updated_at)],
            ].map(([label, value]) => (
              <div key={label} className="flex justify-between gap-3">
                <span className="text-[11px] text-gray-400 flex-shrink-0">
                  {label}
                </span>
                <span className="text-[11px] font-medium text-[#222222] text-right break-all">
                  {value}
                </span>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
