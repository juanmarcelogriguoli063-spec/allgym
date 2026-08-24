import { createClient } from "@supabase/supabase-js";

// Cliente con la service role key: bypassa RLS. Solo usar en código de
// servidor de confianza (route handlers, scripts del bot de WhatsApp),
// nunca exponerlo al browser.
export function createAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );
}
