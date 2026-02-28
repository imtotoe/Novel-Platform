import { createClient, SupabaseClient } from "@supabase/supabase-js";

let _supabaseServer: SupabaseClient | null = null;
let _supabaseClient: SupabaseClient | null = null;

/** Server-side Supabase client with service role key (bypasses RLS) */
export function getSupabaseServer() {
  if (!_supabaseServer) {
    _supabaseServer = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );
  }
  return _supabaseServer;
}

/** Client-side Supabase client with anon key (subject to RLS) */
export function getSupabaseClient() {
  if (!_supabaseClient) {
    _supabaseClient = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
  }
  return _supabaseClient;
}

const MAX_FILE_SIZE = 2 * 1024 * 1024; // 2MB

export async function uploadCover(
  file: File,
  userId: string,
  novelId: string
): Promise<string> {
  if (file.size > MAX_FILE_SIZE) throw new Error("File too large (max 2MB)");

  const ext = file.name.split(".").pop();
  const path = `covers/${userId}/${novelId}.${ext}`;

  const supabase = getSupabaseClient();
  const { error } = await supabase.storage
    .from("novel-assets")
    .upload(path, file, { upsert: true });

  if (error) throw error;

  const { data } = supabase.storage.from("novel-assets").getPublicUrl(path);
  return data.publicUrl;
}

export async function uploadAvatar(
  file: File,
  userId: string
): Promise<string> {
  if (file.size > MAX_FILE_SIZE) throw new Error("File too large (max 2MB)");

  const ext = file.name.split(".").pop() || "webp";
  const path = `avatars/${userId}.${ext}`;
  const supabase = getSupabaseClient();
  const { error } = await supabase.storage
    .from("novel-assets")
    .upload(path, file, { upsert: true });

  if (error) throw error;
  const { data } = supabase.storage.from("novel-assets").getPublicUrl(path);
  return data.publicUrl;
}
