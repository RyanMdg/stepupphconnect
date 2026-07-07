import type { Role } from "../types";
import { supabase } from "../lib/supabase";

type PortalProfile = {
  id: string;
  status?: "active" | "inactive" | "pending";
};

function assertActiveProfile(profile: PortalProfile, label: string) {
  if (profile.status && profile.status !== "active") {
    throw new Error(`This ${label} account is not active.`);
  }
}

async function getActiveProfileRole(
  authId: string,
  email?: string,
): Promise<Role> {
  const adminResult = await supabase
    .from("admins")
    .select("id,status")
    .eq("auth_id", authId)
    .maybeSingle<PortalProfile>();

  if (adminResult.error) throw adminResult.error;

  if (adminResult.data) {
    assertActiveProfile(adminResult.data, "admin");
    return "admin";
  }

  if (!email) {
    throw new Error("No portal profile is linked to this login.");
  }

  const agencyResult = await supabase
    .from("agencies")
    .select("id")
    .eq("email", email)
    .maybeSingle<PortalProfile>();

  if (agencyResult.error) throw agencyResult.error;

  if (agencyResult.data) {
    return "agency";
  }

  throw new Error("No portal profile is linked to this login.");
}

export async function signIn(email: string, password: string): Promise<Role> {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) throw error;
  if (!data.user) throw new Error("No user was returned after sign in.");

  try {
    return await getActiveProfileRole(data.user.id, data.user.email);
  } catch (error) {
    await supabase.auth.signOut();
    throw error;
  }
}

export async function getCurrentRole(): Promise<Role | null> {
  const { data, error } = await supabase.auth.getSession();

  if (error) throw error;
  if (!data.session?.user) return null;

  return getActiveProfileRole(data.session.user.id, data.session.user.email);
}

export async function signOut() {
  const { error } = await supabase.auth.signOut();

  if (error) throw error;
}
