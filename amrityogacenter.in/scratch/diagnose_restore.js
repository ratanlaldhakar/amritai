const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = "https://kxsovgiapzbpxahtkbuo.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt4c292Z2lhcHpicHhhaHRrYnVvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODA0MDAzMjcsImV4cCI6MjA5NTk3NjMyN30.cKlyTzjutLCrFsqflsMBVGZa1HtuygD_RqL3ctMorVM";

const dbClient = createClient(SUPABASE_URL, SUPABASE_KEY);

const targetId = '424952c5-b11d-4c7f-8532-cdd7cd02af45'; // YM-2026-0013

async function run() {
  console.log("=== DIAGNOSING RESTORE FLOW FOR YM-2026-0013 ===");
  
  // 1. Try updating certificates
  console.log("1. Executing update status on 'certificates'...");
  const updateRes = await dbClient
    .from('certificates')
    .update({ status: 'active' })
    .eq('id', targetId);
    
  console.log("Update response:", updateRes);
  
  // 2. Try deleting from revoked_certificates
  console.log("2. Executing delete on 'revoked_certificates'...");
  const deleteRes = await dbClient
    .from('revoked_certificates')
    .delete()
    .eq('id', targetId);
    
  console.log("Delete response:", deleteRes);
}

run().catch(console.error);
