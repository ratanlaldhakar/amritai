const { Client } = require("pg");
const { createClient } = require("@supabase/supabase-js");
const fs = require("fs");
const path = require("path");
const readline = require("readline");

// Load variables
const SUPABASE_URL = "https://kxsovgiapzbpxahtkbuo.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt4c292Z2lhcHpicHhhaHRrYnVvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODA0MDAzMjcsImV4cCI6MjA5NTk3NjMyN30.cKlyTzjutLCrFsqflsMBVGZa1HtuygD_RqL3ctMorVM";

const getDbHost = () => {
  try {
    const hostname = new URL(SUPABASE_URL).hostname;
    const projectRef = hostname.split(".")[0];
    return `db.${projectRef}.supabase.co`;
  } catch {
    return "";
  }
};

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

const askQuestion = (query) => {
  return new Promise((resolve) => rl.question(query, resolve));
};

async function main() {
  console.log("=================================================");
  console.log("Amrit Integrated Certificate System Setup");
  console.log("=================================================\n");

  const dbPassword = process.env.DB_PASSWORD || (await askQuestion("Enter Supabase Database Password: "));
  const serviceRoleKey = process.env.SERVICE_ROLE_KEY || (await askQuestion("Enter Supabase Service Role Key (secret): "));
  const adminPassword = process.env.ADMIN_PASSWORD || (await askQuestion("Enter Password for admin@yogamrit.com (default: Admin123!): ")) || "Admin123!";

  rl.close();

  const dbHost = getDbHost();
  console.log(`\nConnecting to database host: ${dbHost}...`);

  // 1. Run SQL Migrations
  const client = new Client({
    host: dbHost,
    port: 5432,
    database: "postgres",
    user: "postgres",
    password: dbPassword,
    ssl: { rejectUnauthorized: false },
  });

  try {
    await client.connect();
    console.log("Connected to PostgreSQL database! Reading schema...");

    const migrationPath = path.join(__dirname, "..", "supabase-migration.sql");
    if (!fs.existsSync(migrationPath)) {
      throw new Error(`supabase-migration.sql not found at: ${migrationPath}`);
    }
    const migrationSql = fs.readFileSync(migrationPath, "utf8");

    console.log("Executing SQL migrations (creating tables, triggers, and RLS)...");
    await client.query(migrationSql);
    console.log("Database schema successfully migrated! ✅");
  } catch (err) {
    console.error("❌ SQL Migration failed:", err.message || err);
    process.exit(1);
  } finally {
    await client.end();
  }

  // 2. Seed Default Admin User
  console.log("\nSeeding default admin user...");
  try {
    const adminClient = createClient(SUPABASE_URL, serviceRoleKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });

    const email = "admin@yogamrit.com";

    // List users to check if user exists
    const { data: usersData, error: listError } = await adminClient.auth.admin.listUsers();
    if (listError) {
      throw new Error(`Failed to check existing users: ${listError.message}`);
    }

    let adminUser = usersData.users.find((u) => u.email === email);

    if (!adminUser) {
      console.log(`Creating auth user: ${email}...`);
      const { data: newUserData, error: createError } = await adminClient.auth.admin.createUser({
        email,
        password: adminPassword,
        email_confirm: true,
      });

      if (createError) {
        throw new Error(`Failed to create admin auth: ${createError.message}`);
      }
      adminUser = newUserData.user;
      console.log(`Auth user created successfully with ID: ${adminUser.id} ✅`);
    } else {
      console.log(`Auth user ${email} already exists. ID: ${adminUser.id}`);
    }

    // Link in admin_profiles
    console.log("Linking user to admin_profiles as superadmin...");
    const { error: profileError } = await adminClient
      .from("admin_profiles")
      .upsert({
        id: adminUser.id,
        display_name: "Admin",
        role: "superadmin",
      });

    if (profileError) {
      throw new Error(`Failed to upsert admin profile: ${profileError.message}`);
    }

    console.log("Admin profile successfully linked! ✅");
    console.log("\n=================================================");
    console.log("SETUP SUCCESSFUL! 🎉");
    console.log(`Username/Email: ${email}`);
    console.log(`Password: ${adminPassword}`);
    console.log("=================================================");
  } catch (err) {
    console.error("❌ Auth Seeding failed:", err.message || err);
    process.exit(1);
  }
}

main();
