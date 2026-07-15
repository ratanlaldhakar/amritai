const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = "https://kxsovgiapzbpxahtkbuo.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt4c292Z2lhcHpicHhhaHRrYnVvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODA0MDAzMjcsImV4cCI6MjA5NTk3NjMyN30.cKlyTzjutLCrFsqflsMBVGZa1HtuygD_RqL3ctMorVM";

const dbClient = createClient(SUPABASE_URL, SUPABASE_KEY);

async function run() {
  console.log("=== TESTING DUMMY LOGIN ===");
  const { data, error } = await dbClient.auth.signInWithPassword({
    email: 'nonexistent_user_xyz@yogamrit.com',
    password: 'SomePassword123!'
  });
  
  if (error) {
    console.log("Status:", error.status);
    console.log("Code:", error.code);
    console.log("Message:", error.message);
  } else {
    console.log("Success:", data);
  }
}

run().catch(console.error);
