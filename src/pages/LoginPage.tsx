import { useState } from "react";
import type { Role } from "../types";
import { RED } from "../lib/constants";
import logoImg from "../assets/stepupconnect.png";
import { signIn, signOut } from "../services/authService";

const BG_PHOTO =
  "https://images.unsplash.com/photo-1497366216548-37526070297c?w=1600&h=1000&fit=crop&auto=format";

export function LoginPage({ onLogin }: { onLogin: (role: Role) => void }) {
  const [selectedRole, setSelectedRole] = useState<Role>("admin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const role = await signIn(email.trim(), password);

      if (role !== selectedRole) {
        await signOut();
        setError(
          role === "admin"
            ? "This login belongs to the admin portal."
            : "This login belongs to the agency portal.",
        );
        return;
      }

      onLogin(role);
    } catch (err) {
      console.error(err);
      setError(
        err instanceof Error
          ? err.message
          : "Unable to sign in. Please check your credentials.",
      );
    } finally {
      setLoading(false);
    }
  };

  const portalOptions = [
    {
      role: "admin" as Role,
      label: "Step Up PH",
    },
    {
      role: "agency" as Role,
      label: "Agency Portal",
    },
  ];

  return (
    <div className="h-screen flex overflow-hidden">
      {/* ── Left hero panel ── */}
      <div className="hidden lg:flex flex-col relative flex-1 overflow-hidden">
        {/* Background photo */}
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${BG_PHOTO})` }}
        />
        {/* Layered dark gradients for depth */}
        <div className="absolute inset-0 bg-linear-to-br from-black/85 via-black/65 to-[#1a0000]/70" />
        <div className="absolute inset-0 bg-linear-to-t from-black/60 via-transparent to-transparent" />

        {/* Content */}
        <div className="relative z-10 flex flex-col h-full p-12 lg:p-14">
          {/* Top — wordmark */}
          <div className="flex items-center gap-3">
            <div className="w-14 h-14 flex items-center justify-center text-white font-bold text-base shrink-0">
              <img src={logoImg} alt="StepupPhLogo" />
            </div>
            <div>
              <div
                className="text-white font-bold text-[15px] leading-tight"
                style={{
                  fontFamily: '"Poppins", sans-serif',
                }}
              >
                StepUpConnect
              </div>
              <div className="text-white/40 text-[10px] leading-tight">
                by Step Up PH
              </div>
            </div>
          </div>

          {/* Middle spacer */}
          <div className="flex-1" />

          {/* Bottom — headline */}
          <div className="max-w-md">
            <h1
              className="text-white text-4xl xl:text-5xl font-bold leading-tight mb-4"
              style={{
                fontFamily: '"Poppins", sans-serif',
              }}
            >
              Quality candidates.
              <br />
              Trusted partnerships.
            </h1>
            <p className="text-white/55 text-sm leading-relaxed max-w-sm">
              Step Up PH&apos;s private multi-tenant platform for organizing,
              verifying, and distributing job-ready talent to partner agencies
              across the Philippines.
            </p>

            {/* Stats row */}
            {/* <div className="flex gap-8 mt-8 pt-8 border-t border-white/10">
              {[
                ["247+", "Candidates"],
                ["14", "Partner Agencies"],
                ["87%", "Completion Rate"],
              ].map(([val, label]) => (
                <div key={label}>
                  <div
                    className="text-white text-xl font-bold tabular-nums"
                    style={{
                      fontFamily: '"Poppins", sans-serif',
                    }}
                  >
                    {val}
                  </div>
                  <div className="text-white/45 text-xs mt-0.5">{label}</div>
                </div>
              ))}
            </div> */}
          </div>
        </div>
      </div>

      {/* ── Right login panel ── */}
      <div className="w-full lg:w-[440px] xl:w-[480px] bg-white flex flex-col overflow-y-auto flex-shrink-0">
        <div className="flex flex-col justify-center min-h-full px-8 py-10 xl:px-12">
          {/* Heading */}
          <div className="mb-7">
            <h2
              className="text-2xl font-bold text-[#222222]"
              style={{
                fontFamily: '"Poppins", sans-serif',
              }}
            >
              Welcome back
            </h2>
            <p className="text-sm text-gray-500 mt-1">
              Sign in to access your portal
            </p>
          </div>
          {/* Role tabs */}
          <div className="flex gap-1 p-1 bg-[#F3F4F6] rounded-xl mb-6">
            {portalOptions.map((acc) => (
              <button
                key={acc.role}
                onClick={() => {
                  setSelectedRole(acc.role);
                  setError("");
                }}
                className={`flex-1 py-2 px-3 rounded-lg text-xs font-semibold transition-all ${
                  selectedRole === acc.role
                    ? "bg-white text-[#222222] shadow-sm"
                    : "text-gray-500 hover:text-gray-700"
                }`}
              >
                {acc.label}
              </button>
            ))}
          </div>
          {/* Demo hint */}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="rounded-xl border border-red-100 bg-red-50 px-3.5 py-2.5 text-xs text-red-700">
                {error}
              </div>
            )}
            <div>
              <label className="text-xs font-semibold text-gray-600 block mb-1.5">
                Email Address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
                className="w-full px-3.5 py-2.5 text-sm border border-[#E5E7EB] rounded-xl outline-none focus:border-[#A10000] focus:ring-2 focus:ring-[#A10000]/10 transition bg-white"
              />
            </div>
            <div>
              <div className="flex justify-between mb-1.5">
                <label className="text-xs font-semibold text-gray-600">
                  Password
                </label>
                <button
                  type="button"
                  className="text-[11px] text-[#A10000] hover:underline"
                >
                  Forgot password?
                </button>
              </div>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="w-full px-3.5 py-2.5 text-sm border border-[#E5E7EB] rounded-xl outline-none focus:border-[#A10000] focus:ring-2 focus:ring-[#A10000]/10 transition bg-white"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl text-sm font-semibold text-white transition-all mt-2 disabled:opacity-70"
              style={{ backgroundColor: RED }}
            >
              {loading ? "Signing in…" : "Sign In"}
            </button>
          </form>
          {/* Footer */}
          <p className="text-center text-[11px] text-gray-400 mt-8">
            Access is restricted to authorized Step Up PH partners.
            <br />
            Contact <span className="text-[#A10000]">
              admin@stepupph.com
            </span>{" "}
            to request access.
          </p>
        </div>
      </div>
    </div>
  );
}
