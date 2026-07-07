import { useEffect, useState, type FormEvent } from "react";
import { Loader2, Plus, Wallet } from "lucide-react";
import { Card } from "../../components/shared/Card";
import {
  createTopUpRequest,
  getAgencyWallet,
  getAgencyWalletTransactions,
  getCurrentAgencyProfile,
  type AgencyWallet,
  type AgencyWalletTransaction,
} from "../../services/agencyPortalService";

const packages = [
  { credits: 100, price: "PHP 1,000", label: "Starter" },
  { credits: 300, price: "PHP 2,700", label: "Growth" },
  { credits: 700, price: "PHP 5,950", label: "Premium" },
];

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(value));
}

export function AgencyWalletPage() {
  const [agencyId, setAgencyId] = useState("");
  const [wallet, setWallet] = useState<AgencyWallet | null>(null);
  const [transactions, setTransactions] = useState<AgencyWalletTransaction[]>([]);
  const [selectedCredits, setSelectedCredits] = useState(100);
  const [note, setNote] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    let active = true;

    async function loadWallet() {
      setLoading(true);
      setError("");

      try {
        const agency = await getCurrentAgencyProfile();
        const [walletRow, transactionRows] = await Promise.all([
          getAgencyWallet(agency.id),
          getAgencyWalletTransactions(agency.id),
        ]);

        if (!active) return;
        setAgencyId(agency.id);
        setWallet(walletRow);
        setTransactions(transactionRows);
      } catch {
        if (active) setError("Unable to load wallet.");
      } finally {
        if (active) setLoading(false);
      }
    }

    loadWallet();

    return () => {
      active = false;
    };
  }, []);

  async function submitTopUp(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!agencyId) return;

    setSaving(true);
    setError("");
    setSuccess("");

    try {
      await createTopUpRequest(
        agencyId,
        selectedCredits,
        note || `Top-up request for ${selectedCredits} credits`,
      );
      const [walletRow, transactionRows] = await Promise.all([
        getAgencyWallet(agencyId),
        getAgencyWalletTransactions(agencyId),
      ]);
      setWallet(walletRow);
      setTransactions(transactionRows);
      setSuccess(
        "Credits added to your wallet.",
      );
      setNote("");
    } catch {
      setError("Unable to submit top-up request.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="p-6 space-y-5 max-w-screen-xl">
      <div>
        <h2 className="text-base font-semibold text-[#222222]">Credit Wallet</h2>
        <p className="mt-0.5 text-xs text-gray-500">
          Use credits to request vetted candidates from Step Up PH
        </p>
      </div>

      {(error || success) && (
        <div
          className={`rounded-xl border px-4 py-3 text-xs font-medium ${
            error
              ? "border-red-200 bg-red-50 text-red-700"
              : "border-green-200 bg-green-50 text-green-700"
          }`}
        >
          {error || success}
        </div>
      )}

      {loading ? (
        <div className="flex h-64 items-center justify-center rounded-xl border border-dashed border-gray-200 bg-white">
          <Loader2 className="h-5 w-5 animate-spin text-gray-400" />
        </div>
      ) : (
        <div className="grid gap-4 lg:grid-cols-[360px_1fr]">
          <div className="space-y-4">
            <Card className="overflow-hidden p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">
                    Available Balance
                  </p>
                  <p className="mt-2 text-4xl font-bold text-[#222222]">
                    {wallet?.balance ?? 0}
                  </p>
                  <p className="text-xs text-gray-500">credits</p>
                </div>
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-gray-200 bg-white text-[#A10000] shadow-sm">
                  <Wallet size={25} strokeWidth={1.8} />
                </div>
              </div>
            </Card>

            <Card className="p-5">
              <p className="text-sm font-semibold text-[#222222]">
                Request Top Up
              </p>
              <form onSubmit={submitTopUp} className="mt-4 space-y-4">
                <div className="grid gap-2">
                  {packages.map((item) => (
                    <button
                      key={item.credits}
                      type="button"
                      onClick={() => setSelectedCredits(item.credits)}
                      className={`flex items-center justify-between rounded-xl border px-3 py-3 text-left transition ${
                        selectedCredits === item.credits
                          ? "border-[#A10000] bg-red-50"
                          : "border-gray-200 hover:bg-gray-50"
                      }`}
                    >
                      <span>
                        <span className="block text-sm font-semibold text-[#222222]">
                          {item.label}
                        </span>
                        <span className="text-xs text-gray-400">
                          {item.credits} credits
                        </span>
                      </span>
                      <span className="text-xs font-semibold text-gray-600">
                        {item.price}
                      </span>
                    </button>
                  ))}
                </div>

                <label className="block">
                  <span className="mb-1.5 block text-xs font-semibold text-gray-600">
                    Payment Note / Reference
                  </span>
                  <textarea
                    value={note}
                    onChange={(event) => setNote(event.target.value)}
                    rows={3}
                    placeholder="Paste GCash/bank reference or payment note"
                    className="w-full resize-none rounded-xl border border-gray-200 px-3 py-2 text-xs outline-none focus:border-[#A10000]"
                  />
                </label>

                <button
                  type="submit"
                  disabled={saving}
                  className="inline-flex w-full items-center justify-center gap-1.5 rounded-lg bg-[#A10000] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[#8a0000] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  <Plus size={13} />
                  {saving ? "Adding..." : "Top Up Credits"}
                </button>
              </form>
            </Card>
          </div>

          <Card className="overflow-hidden">
            <div className="border-b border-gray-100 bg-gray-50 px-4 py-3">
              <p className="text-sm font-semibold text-[#222222]">
                Wallet Activity
              </p>
            </div>
            {transactions.map((transaction) => (
              <div
                key={transaction.id}
                className="grid grid-cols-[1fr_120px_120px] items-center border-b border-gray-100 px-4 py-3 last:border-b-0"
              >
                <div>
                  <p className="text-sm font-semibold text-[#222222]">
                    {transaction.description ?? transaction.type}
                  </p>
                  <p className="text-xs text-gray-400">
                    {formatDate(transaction.created_at)} · {transaction.type}
                  </p>
                </div>
                <div
                  className={`text-sm font-bold ${
                    transaction.amount >= 0 ? "text-green-600" : "text-red-600"
                  }`}
                >
                  {transaction.amount >= 0 ? "+" : ""}
                  {transaction.amount}
                </div>
                <div className="text-xs text-gray-400">credits</div>
              </div>
            ))}
            {transactions.length === 0 && (
              <div className="px-4 py-12 text-center text-sm text-gray-400">
                Wallet activity will appear here.
              </div>
            )}
          </Card>
        </div>
      )}
    </div>
  );
}
