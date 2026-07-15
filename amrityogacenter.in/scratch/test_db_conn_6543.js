const { Client } = require('pg');

const host = "db.kxsovgiapzbpxahtkbuo.supabase.co";
const passwords = ["yogamrit@2026", "Admin123!", "postgres", "yogamrit"];

async function testPassword(password) {
  console.log(`Testing password: ${password} on port 6543...`);
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
