"use client";

import { createClient } from "@supabase/supabase-js";

let client: ReturnType<typeof createClient> | null = null;

export function getSupabaseBrowser() {
  if (client) {
    return client;
  }

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) {
    throw new Error("Missing public Supabase browser configuration.");
  }

  client = createClient(url, key);
  return client;
}

export async function getAuthHeaders(): Promise<Record<string, string>> {
  const supabase = getSupabaseBrowser();
  const { data } = await supabase.auth.getSession();
  const token = data.session?.access_token;
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export async function getSignedInUser() {
  const supabase = getSupabaseBrowser();
  const { data } = await supabase.auth.getUser();
  return data.user ?? null;
}
