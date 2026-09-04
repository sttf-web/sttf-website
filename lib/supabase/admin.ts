import { createClient } from "@supabase/supabase-js";

const supabaseUrl =
  process.env.NEXT_PUBLIC_SUPABASE_URL;

const supabaseAdminKey =
  process.env.SUPABASE_SECRET_KEY ??
  process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl) {
  throw new Error(
    "NEXT_PUBLIC_SUPABASE_URL is missing."
  );
}

if (!supabaseAdminKey) {
  throw new Error(
    "SUPABASE_SECRET_KEY or SUPABASE_SERVICE_ROLE_KEY is missing."
  );
}

export const supabaseAdmin = createClient(
  supabaseUrl,
  supabaseAdminKey,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  }
);