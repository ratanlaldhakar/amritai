const fs = require('fs');
const path = require('path');

const ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt4c292Z2lhcHpicHhhaHRrYnVvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODA0MDAzMjcsImV4cCI6MjA5NTk3NjMyN30.cKlyTzjutLCrFsqflsMBVGZa1HtuygD_RqL3ctMorVM";

function scanDir(dir) {
  try {
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        scanDir(fullPath);
      } else {
        const ext = path.extname(entry.name).toLowerCase();
        if (ext === '.jsonl' || ext === '.md' || ext === '.txt' || ext === '.log') {
          try {
            const content = fs.readFileSync(fullPath, 'utf8');
            const matches = content.match(/eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9\.[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+/g);
            if (matches) {
              for (const m of matches) {
                if (m !== ANON_KEY) {
                  // Decode payload to verify if it contains service_role
                  const parts = m.split('.');
                  if (parts.length > 1) {
                    try {
                      const payload = Buffer.from(parts[1], 'base64').toString('utf8');
                      if (payload.includes('service_role')) {
                        console.log(`FOUND SERVICE ROLE KEY in ${fullPath}:`);
                        console.log(m);
                        console.log("Payload:", payload);
                      }
                    } catch {}
                  }
                }
              }
            }
          } catch {}
        }
      }
    }
  } catch {}
}

console.log("Scanning brain directory for service_role keys...");
scanDir("C:\\Users\\pc\\AppData\\Local\\Temp");
scanDir("C:\\Users\\pc\\.gemini\\antigravity\\brain");
console.log("Scan complete.");
