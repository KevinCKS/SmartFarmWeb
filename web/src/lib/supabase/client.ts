import { createBrowserClient } from '@supabase/ssr';
import { Database } from '@/types/database';

/**
 * 클라이언트 사이드 Supabase 클라이언트
 * 브라우저 환경에서 사용하는 Supabase 클라이언트
 */
export function createClient() {
  return createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}
