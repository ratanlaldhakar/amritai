const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = "https://kxsovgiapzbpxahtkbuo.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt4c292Z2lhcHpicHhhaHRrYnVvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODA0MDAzMjcsImV4cCI6MjA5NTk3NjMyN30.cKlyTzjutLCrFsqflsMBVGZa1HtuygD_RqL3ctMorVM";

const dbClient = createClient(SUPABASE_URL, SUPABASE_KEY);

const targetId = '424952c5-b11d-4c7f-8532-cdd7cd02af45'; // YM-2026-0013

async function run() {
  console.log("=== RUNNING ANON UPDATE WITH SELECT ===");
  const updateRes = await dbClient
    .from('certificates')
    .update({ status: 'active' })
    .eq('id', targetId)
    .select();
    
  console.log("Update result:", updateRes);
  
  console.log("=== RUNNING ANON DELETE WITH SELECT ===");
  const deleteRes = await dbClient
    .from('revoked_certificates')
    .delete()
    .eq('id', targetId)
    .select();
    
  console.log("Delete result:", deleteRes);
}

run().catch(console.error);
