const { Client } = require('pg');

const host = "db.kxsovgiapzbpxahtkbuo.supabase.co";
const passwords = [
  "yogamrit2026",
  "amrityoga",
  "amrityoga2026",
  "amrityoga@2026",
  "amrit@2026",
  "Suresh@2026",
  "suresh@2026",
  "Admin@2026",
  "admin@2026",
  "Yogamrit@2026"
];

async function testPassword(password) {
  console.log(`Testing password: ${password}...`);
  const client = new Client({
    host,
    port: 6543,
    database: "postgres",
    user: "postgres",
    password,
    ssl: { rejectUnauthorized: false },
    connectionTimeoutMillis: 5000
  });
  
  try {
    await client.connect();
    console.log(`SUCCESS! Connected with password: ${password}`);
    await client.end();
    return true;
  } catch (err) {
    console.log(`Failed for password ${password}:`, err.message);
    return false;
  }
}

async function run() {
  for (const pw of passwords) {
    const ok = await testPassword(pw);
    if (ok) {
      process.exit(0);
    }
  }
  console.log("None of the tested passwords worked.");
}

run().catch(console.error);
