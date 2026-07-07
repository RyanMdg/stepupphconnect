import { useEffect, useState } from "react";
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  useNavigate,
  useParams,
} from "react-router-dom";
import type { Role } from "./types";
import { Sidebar } from "./components/layout/Sidebar";
import { TopNav } from "./components/layout/TopNav";
import { LoginPage } from "./pages/LoginPage";
import { SuperAdminDashboard } from "./pages/admin/Dashboard";
import { CandidateList } from "./pages/admin/CandidateList";
import { CandidateProfile } from "./pages/admin/CandidateProfile";
import { PortalAccessPage } from "./pages/admin/UserManagement";
import { AgenciesPage } from "./pages/admin/Agencies";
import { AgencyProfile } from "./pages/admin/AgencyProfile";
import { EndorsementKanban } from "./pages/admin/Endorsements";
import { ReportsPage } from "./pages/admin/Reports";
import { AgencyDashboard } from "./pages/agency/Dashboard";
import { CandidateMarketplace } from "./pages/agency/Marketplace";
import { Placeholder } from "./pages/Placeholder";
import { getCurrentRole, signOut } from "./services/authService";

// ─── Wrappers that need useNavigate ──────────────────────────────────────────

function CandidateListPage() {
  const navigate = useNavigate();
  return <CandidateList onSelect={(id) => navigate(`/candidates/${id}`)} />;
}

function CandidateProfilePage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  return (
    <CandidateProfile
      candidateId={id ?? ""}
      onBack={() => navigate("/candidates")}
    />
  );
}

function AgenciesListPage() {
  const navigate = useNavigate();
  return <AgenciesPage onSelect={(id) => navigate(`/agencies/${id}`)} />;
}

function AgencyProfilePage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  return (
    <AgencyProfile
      agencyId={id ?? ""}
      onBack={() => navigate("/agencies")}
    />
  );
}

// ─── Shell (rendered when logged in) ─────────────────────────────────────────

function AppShell({
  role,
  onLogout,
}: {
  role: Role;
  onLogout: () => void;
}) {
  const navigate = useNavigate();

  // Derive the current page key from the pathname for Sidebar highlight
  const pathname = window.location.pathname.replace(/^\//, "") || "dashboard";
  const pageKey = pathname.split("/")[0];

  const pageTitle: Record<string, string> = {
    dashboard: "Dashboard",
    candidates: "Candidates",
    portal: "Portal",
    agencies: "Agencies",
    endorsements: "Endorsement Pipeline",
    reports: "Reports & Analytics",
    messages: "Messages",
    settings: "Settings",
    marketplace: "Candidate Marketplace",
    saved: "Saved Candidates",
    requests: "My Requests",
  };

  const currentTitle = pageTitle[pageKey] ?? pageKey;

  return (
    <div className="flex h-screen overflow-hidden bg-[#F8F9FB]">
      <Sidebar
        role={role}
        page={pageKey}
        setPage={(p) => navigate(`/${p}`)}
        onLogout={onLogout}
      />
      <div className="flex-1 flex flex-col overflow-hidden min-w-0">
        <TopNav title={currentTitle} role={role} />
        <main className="flex-1 overflow-y-auto">
          <Routes>
            {role === "admin" ? (
              <>
                <Route path="/dashboard" element={<SuperAdminDashboard />} />
                <Route path="/candidates" element={<CandidateListPage />} />
                <Route
                  path="/candidates/:id"
                  element={<CandidateProfilePage />}
                />
                <Route path="/programs" element={<PortalAccessPage />} />
                <Route path="/agencies" element={<AgenciesListPage />} />
                <Route path="/agencies/:id" element={<AgencyProfilePage />} />
                <Route path="/endorsements" element={<EndorsementKanban />} />
                <Route path="/reports" element={<ReportsPage />} />
                <Route
                  path="*"
                  element={
                    <Placeholder title={pageTitle[pageKey] ?? pageKey} />
                  }
                />
              </>
            ) : (
              <>
                <Route path="/dashboard" element={<AgencyDashboard />} />
                <Route path="/marketplace" element={<CandidateMarketplace />} />
                <Route
                  path="*"
                  element={
                    <Placeholder title={pageTitle[pageKey] ?? pageKey} />
                  }
                />
              </>
            )}
          </Routes>
        </main>
      </div>
    </div>
  );
}

// ─── Root App ─────────────────────────────────────────────────────────────────

export default function App() {
  const [loggedIn, setLoggedIn] = useState(false);
  const [role, setRole] = useState<Role>("admin");
  const [authLoading, setAuthLoading] = useState(true);

  useEffect(() => {
    let active = true;

    getCurrentRole()
      .then((currentRole) => {
        if (!active) return;

        if (currentRole) {
          setRole(currentRole);
          setLoggedIn(true);
        }
      })
      .catch((error) => {
        console.error(error);
      })
      .finally(() => {
        if (active) setAuthLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  const handleLogin = (r: Role) => {
    setRole(r);
    setLoggedIn(true);
  };

  const handleLogout = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error(error);
    }

    setLoggedIn(false);
  };

  if (authLoading) {
    return (
      <div className="h-screen flex items-center justify-center bg-[#F8F9FB] text-sm text-gray-500">
        Loading portal...
      </div>
    );
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/login"
          element={
            loggedIn ? (
              <Navigate to="/dashboard" replace />
            ) : (
              <LoginPage onLogin={handleLogin} />
            )
          }
        />
        <Route
          path="*"
          element={
            loggedIn ? (
              <AppShell role={role} onLogout={handleLogout} />
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />
      </Routes>
    </BrowserRouter>
  );
}
