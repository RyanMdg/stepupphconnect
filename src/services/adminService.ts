import { supabase } from "../lib/supabase";

export interface Admin {
  id: string;
  auth_id: string;
  name: string;
  email: string;
  status: "active" | "inactive";
  last_active: string | null;
  created_at: string;
  updated_at?: string;
}

export interface RegisterAdminData {
  name: string;
  email: string;
  password: string;
}

export interface UpdateAdminData {
  name: string;
  email: string;
  status: "active" | "inactive";
}

/* ===========================
   GET ADMINS
=========================== */

export async function getAdmins(): Promise<Admin[]> {
  const { data, error } = await supabase
    .from("admins")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    console.error(error);
    throw error;
  }

  return (data ?? []) as Admin[];
}

/* ===========================
   REGISTER ADMIN
=========================== */

export async function registerAdmin({
  name,
  email,
  password,
}: RegisterAdminData) {
  const { data, error } = await supabase.functions.invoke("create-admin", {
    body: {
      name,
      email,
      password,
    },
  });

  if (error) {
    console.error("Edge Function Error:", error);

    if (error.context) {
      const body = await error.context.text();
      console.error(body);
    }

    throw error;
  }

  return data;
}

/* ===========================
   UPDATE ADMIN
=========================== */

export async function updateAdmin(
  id: string,
  values: UpdateAdminData
) {
  const { data, error } = await supabase
    .from("admins")
    .update(values)
    .eq("id", id)
    .select()
    .single();

  if (error) {
    console.error(error);
    throw error;
  }

  return data;
}

/* ===========================
   DELETE ADMIN
=========================== */

export async function deleteAdmin(id: string) {
  const { error } = await supabase
    .from("admins")
    .delete()
    .eq("id", id);

  if (error) {
    console.error(error);
    throw error;
  }

  return true;
}