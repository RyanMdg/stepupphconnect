import { supabase } from "../lib/supabase";

export interface Agency {
  id: string;
  auth_id: string;
  name: string;
  industry: string;
  contact: string;
  contact_person: string | null;
  email: string;
  phone: string | null;
  specializations: string[];
  available_slots: number;
  active_endorsements: number;
  status: "active" | "pending" | "inactive";
  created_at: string;
  updated_at?: string;
}

export interface RegisterAgencyData {
  name: string;
  industry: string;
  contact: string;
  email: string;
  password: string;
  phone?: string;
  specializations?: string[];
  available_slots?: number;
}

export interface UpdateAgencyData {
  name: string;
  industry: string;
  contact: string;
  email: string;
  phone?: string;
  specializations?: string[];
  available_slots?: number;
  status: "active" | "pending" | "inactive";
}

export async function getAgencies(): Promise<Agency[]> {
  const { data, error } = await supabase
    .from("agencies")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    console.error(error);
    throw error;
  }

  return (data ?? []) as Agency[];
}

export async function getAgency(id: string): Promise<Agency | null> {
  const { data, error } = await supabase
    .from("agencies")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (error) {
    console.error(error);
    throw error;
  }

  return data as Agency | null;
}

export async function registerAgency(values: RegisterAgencyData) {
  const { data, error } = await supabase.functions.invoke("create-agency", {
    body: values,
  });

  if (error) {
    console.error("Edge Function Error:", error);

    if (error.context instanceof Response) {
      const body = await error.context.text();
      console.error("Edge Function Response:", body);
    } else if (error.context) {
      console.error("Edge Function Context:", error.context);
    }

    throw error;
  }

  return data;
}

export async function updateAgency(id: string, values: UpdateAgencyData) {
  const { data, error } = await supabase
    .from("agencies")
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

export async function deleteAgency(id: string) {
  const { error } = await supabase.from("agencies").delete().eq("id", id);

  if (error) {
    console.error(error);
    throw error;
  }

  return true;
}
