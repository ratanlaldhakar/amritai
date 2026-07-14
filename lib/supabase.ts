import { createClient } from '@supabase/supabase-js';
import { env } from './env';

// Public anon client (isomorphic - safe for client and server)
export const supabase = createClient(
  env.NEXT_PUBLIC_SUPABASE_URL,
  env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

// Server-only client with service role (for database actions that bypass RLS)
export const getSupabaseServiceRole = () => {
  if (typeof window !== 'undefined') {
    throw new Error('CRITICAL: getSupabaseServiceRole can only be called on the server side!');
  }

  return createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
};
