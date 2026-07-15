const fs = require('fs');
const path = require('path');

function search(dir, depth = 0) {
  if (depth > 2) return;
  try {
    const files = fs.readdirSync(dir);
    for (const file of files) {
      const fullPath = path.join(dir, file);
      let stat;
      try {
        stat = fs.statSync(fullPath);
      } catch {
        continue;
      }
      
      if (stat.isDirectory()) {
        if (file !== 'node_modules' && file !== '.git' && file !== 'AppData' && file !== 'Local' && file !== 'Roaming') {
          search(fullPath, depth + 1);
        }
      } else {
        const nameLower = file.toLowerCase();
        if (nameLower.includes('pass') || nameLower.includes('secret') || nameLower.includes('key') || nameLower.includes('.env')) {
          console.log(`Found file: ${fullPath} (${stat.size} bytes)`);
          try {
            const content = fs.readFileSync(fullPath, 'utf8');
            console.log("Content snippet:", content.slice(0, 200));
          } catch (err) {
            console.log("Could not read content:", err.message);
          }
        }
      }
    }
  } catch (err) {
    // ignore
  }
}

console.log("=== SEARCHING FOR SECRETS IN D:\\ ===");
search("d:\\");

console.log("=== SEARCHING FOR SECRETS IN C:\\Users\\pc ===");
search("C:\\Users\\pc");
