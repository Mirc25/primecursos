const fs = require('fs');
const path = require('path');
const p = path.join(__dirname, '..', 'admin.fixed2.html');
const s = fs.readFileSync(p, 'utf8');
const m = s.match(/<script[^>]*>([\s\S]*?)<\/script>/i);
const code = m[1];
const lines = code.split('\n');
const start = Math.max(0, 540);
const end = Math.min(lines.length, 620);
for(let i=start;i<end;i++){
  const ln = (i+1).toString().padStart(4,' ');
  console.log(ln+': '+lines[i]);
}
