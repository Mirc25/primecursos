const fs = require('fs');
const path = require('path');
const p = path.resolve(__dirname, '..', 'admin.html');
const s = fs.readFileSync(p,'utf8');
const m = s.match(/<script(?![^>]*src)[^>]*>([\s\S]*?)<\/script>/i);
const code = (m?m[1] : '');
const lines = code.split('\n');
const from = 240, to = 270;
for(let i=from;i<=to;i++){
  const L = lines[i-1] || '';
  const opens = (L.match(/\(/g)||[]).length;
  const closes = (L.match(/\)/g)||[]).length;
  process.stdout.write('S:'+String(i).padStart(3)+' o:'+String(opens).padStart(2)+' c:'+String(closes).padStart(2)+' | ');
  console.log(L);
}
