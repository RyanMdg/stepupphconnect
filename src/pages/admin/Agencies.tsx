import { useEffect, useState } from "react";
import { Plus } from "lucide-react";
import { Card } from "../../components/shared/Card";
import { Btn } from "../../components/shared/Btn";
import { StatusChip } from "../../components/shared/Chip";
import { RED } from "../../lib/constants";
import { getAgencies, type Agency } from "../../services/agencyService";

function agencyLogo(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();
}

function contactName(agency: Agency) {
  return agency.contact_person || agency.contact || "No contact";
}

export function AgenciesPage({
  onSelect,
}: {
  onSelect: (id: string) => void;
}) {
  const [agencies, setAgencies] = useState<Agency[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    getAgencies()
      .then((data) => {
        if (active) setAgencies(data);
      })
      .catch((err) => {
        console.error(err);
        if (active) setError("Unable to load agencies from Supabase.");
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  return (
    <div className="p-6 space-y-4 max-w-screen-xl">
      <div className="flex items-center justify-between">
        <div>
          <h2
            className="text-base font-semibold text-[#222222]"
            style={{
              fontFamily: '"Plus Jakarta Sans", sans-serif',
            }}
          >
            Partner Agencies
          </h2>
          <p className="text-xs text-gray-500 mt-0.5">
            {agencies.length} agencies registered
          </p>
        </div>
        <Btn>
          <Plus size={13} />
          Invite Agency
        </Btn>
      </div>

      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[#E5E7EB] bg-[#F8F9FB]">
                {[
                  "Agency",
                  "Industry",
                  "Open Slots",
                  "Endorsements",
                  "Status",
                  "Contact Person",
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
              {loading && (
                <tr>
                  <td
                    colSpan={7}
                    className="px-4 py-12 text-center text-sm text-gray-400"
                  >
                    Loading agencies...
                  </td>
                </tr>
              )}
              {!loading && error && (
                <tr>
                  <td
                    colSpan={7}
                    className="px-4 py-12 text-center text-sm text-red-500"
                  >
                    {error}
                  </td>
                </tr>
              )}
              {!loading && !error && agencies.map((a, i) => (
                <tr
                  key={a.id}
                  onClick={() => onSelect(a.id)}
                  className={`border-b border-[#E5E7EB] hover:bg-[#F8F9FB] cursor-pointer transition-colors ${i === agencies.length - 1 ? "border-b-0" : ""}`}
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
                  <td className="px-4 py-3">
                    <span
                      className={`text-sm font-semibold ${a.available_slots > 0 ? "text-green-600" : "text-gray-400"}`}
                    >
                      {a.available_slots}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-[#222222] font-medium">
                    {a.active_endorsements}
                  </td>
                  <td className="px-4 py-3">
                    <StatusChip status={a.status} />
                  </td>
                  <td className="px-4 py-3">
                    <div className="text-xs font-medium text-[#222222]">
                      {contactName(a)}
                    </div>
                    <div className="text-[10px] text-gray-400">{a.email}</div>
                  </td>
                  <td className="px-4 py-3">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelect(a.id);
                      }}
                      className="text-xs text-[#A10000] font-medium hover:underline"
                    >
                      View Profile
                    </button>
                  </td>
                </tr>
              ))}
              {!loading && !error && agencies.length === 0 && (
                <tr>
                  <td
                    colSpan={7}
                    className="px-4 py-12 text-center text-sm text-gray-400"
                  >
                    No agencies registered yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
