import { supabase } from './supabaseClient';

export async function getSupabaseAuthToken(): Promise<string | null> {
  if (!supabase) {
    return null;
  }

  const { data: { session }, error } = await supabase.auth.getSession();
  if (error || !session) {
    return null;
  }

  return session.access_token || null;
}

export async function getAuthHeaders(extraHeaders: Record<string, string> = {}): Promise<Record<string, string>> {
  const token = await getSupabaseAuthToken();

  return {
    ...extraHeaders,
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}
