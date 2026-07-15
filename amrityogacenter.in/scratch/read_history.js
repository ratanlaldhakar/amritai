const fs = require('fs');
const path = require('path');

const historyPath = path.join(
  process.env.APPDATA,
  'Microsoft',
  'Windows',
  'PowerShell',
  'PSReadLine',
  'ConsoleHost_history.txt'
);

console.log("Checking history file at:", historyPath);

if (fs.existsSync(historyPath)) {
  try {
    const history = fs.readFileSync(historyPath, 'utf8');
    const lines = history.split('\n');
    console.log(`Found history file with ${lines.length} lines.`);
    
    // Find lines containing password, key, supabase, postgres, or setup
    const keywords = ['password', 'key', 'supabase', 'postgres', 'setup', 'service_role'];
    const matches = lines.filter(line => 
      keywords.some(keyword => line.toLowerCase().includes(keyword))
    );
    
    console.log(`Found ${matches.length} matching lines:`);
    matches.slice(-50).forEach((line, index) => {
      console.log(`${index + 1}: ${line.trim()}`);
    });
  } catch (err) {
    console.error("Error reading history file:", err);
  }
} else {
  console.log("PowerShell history file does not exist.");
}
