import { createBrowserClient } from '@supabase/ssr';
import type { Database } from './types';

export function createClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  // Supabase가 설정되지 않은 경우 더미 클라이언트 반환
  if (!supabaseUrl || !supabaseKey ||
      supabaseUrl === 'your_supabase_url' ||
      supabaseKey === 'your_supabase_anon_key') {
    // 더미 URL과 키로 클라이언트 생성 (실제 호출은 실패하지만 에러는 방지)
    return createBrowserClient<Database>(
      'https://placeholder.supabase.co',
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBsYWNlaG9sZGVyIiwicm9sZSI6ImFub24iLCJpYXQiOjE2NDUxOTIwMDAsImV4cCI6MTk2MDc2ODAwMH0.placeholder'
    );
  }

  return createBrowserClient<Database>(supabaseUrl, supabaseKey);
}
