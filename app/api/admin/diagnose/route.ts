import { NextResponse } from 'next/server';
import { getSupabaseServiceRole } from '@/lib/supabase';

export async function GET() {
  const results: Record<string, any> = {};
  const supabase = getSupabaseServiceRole();

  // Test 1: Query settings
  try {
    const { data, error } = await supabase.from('settings').select('*').limit(1);
    results.settings = error ? { success: false, error } : { success: true, data };
  } catch (err: any) {
    results.settings = { success: false, error: err.message };
  }

  // Test 2: Query knowledge_base
  try {
    const { data, error } = await supabase.from('knowledge_base').select('*').limit(1);
    results.knowledge_base = error ? { success: false, error } : { success: true, data };
  } catch (err: any) {
    results.knowledge_base = { success: false, error: err.message };
  }

  // Test 3: Query trial_bookings (Existing website table)
  try {
    const { data, error } = await supabase.from('trial_bookings').select('*').limit(1);
    results.trial_bookings = error ? { success: false, error } : { success: true, data };
  } catch (err: any) {
    results.trial_bookings = { success: false, error: err.message };
  }

  // Test 4: Query leads
  try {
    const { data, error } = await supabase.from('leads').select('*').limit(1);
    results.leads = error ? { success: false, error } : { success: true, data };
  } catch (err: any) {
    results.leads = { success: false, error: err.message };
  }

  // Obfuscated environment status checks
  results.env = {
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL || 'missing',
    NEXT_PUBLIC_SUPABASE_ANON_KEY_PREFIX: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY 
      ? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY.substring(0, 15) + '...' 
      : 'missing',
    SUPABASE_SERVICE_ROLE_KEY_PREFIX: process.env.SUPABASE_SERVICE_ROLE_KEY 
      ? process.env.SUPABASE_SERVICE_ROLE_KEY.substring(0, 15) + '...' 
      : 'missing',
  };

  return NextResponse.json(results);
}
