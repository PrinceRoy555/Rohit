const fs = require('fs');

if (fs.existsSync('.env.production.local')) {
  const content = fs.readFileSync('.env.production.local', 'utf8');
  const lines = content.split('\n');
  for (const line of lines) {
    if (!line || line.startsWith('#')) continue;
    const idx = line.indexOf('=');
    if (idx === -1) continue;
    const key = line.substring(0, idx);
    let val = line.substring(idx + 1).trim();
    if (val.startsWith('"') && val.endsWith('"')) val = val.slice(1, -1);
    
    const isBase64 = val.startsWith('eyJ');
    const hasAIza = val.includes('AIza');
    const isPlaceholder = val === '[SENSITIVE]';
    
    let decodedPrefix = '';
    if (isBase64) {
      try {
        const decoded = Buffer.from(val, 'base64').toString('utf8');
        decodedPrefix = decoded.substring(0, 30);
      } catch (e) {}
    }
    
    console.log(`${key.padEnd(35)} | Length: ${String(val.length).padStart(4)} | Base64: ${isBase64} | StartsWithAIza: ${hasAIza} | Decoded: ${decodedPrefix}`);
  }
} else {
  console.log('.env.production.local not found');
}
