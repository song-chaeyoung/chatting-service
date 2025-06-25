import { createClient } from "@supabase/supabase-js";

// 서버 전용 클라이언트 (Service Role Key 사용)
export const supabaseServer = createClient(
  process.env.NEXT_SUPABASE_URL!,
  // process.env.SUPABASE_SERVICE_ROLE_KEY!, // 서버에서만 사용 가능
  process.env.NEXT_SUPABASE_ANON_KEY!,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  }
);

// 클라이언트용 (제한된 권한)
export const supabaseClient = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);
