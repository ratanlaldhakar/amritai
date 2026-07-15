const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = "https://kxsovgiapzbpxahtkbuo.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt4c292Z2lhcHpicHhhaHRrYnVvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODA0MDAzMjcsImV4cCI6MjA5NTk3NjMyN30.cKlyTzjutLCrFsqflsMBVGZa1HtuygD_RqL3ctMorVM";

const dbClient = createClient(SUPABASE_URL, SUPABASE_KEY);

async function run() {
  console.log("=== DIAGNOSING DATABASE FOR CERTIFICATE YM-2026-0013 ===");
  
  // 1. Fetch certificate
  console.log("1. Querying 'certificates' table...");
  const { data: certs, error: certError } = await dbClient
    .from('certificates')
    .select('*')
    .eq('certificate_id', 'YM-2026-0013');
    
  if (certError) {
    console.error("Error fetching certificate:", certError);
  } else {
    console.log("Certificates found:", certs);
  }
  
  if (certs && certs.length > 0) {
    const cert = certs[0];
    const uuid = cert.id;
    
    // 2. Fetch revoked certificate log
    console.log(`2. Querying 'revoked_certificates' table for certificate UUID: ${uuid}...`);
    const { data: revoked, error: revokedError } = await dbClient
      .from('revoked_certificates')
      .select('*')
      .eq('id', uuid);
      
    if (revokedError) {
      console.error("Error fetching revoked log:", revokedError);
    } else {
      console.log("Revocation logs found:", revoked);
    }
  } else {
    console.log("No certificate with ID 'YM-2026-0013' found in certificates table.");
  }
}

run().catch(console.error);
