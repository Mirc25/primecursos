const fs = require('fs');
const path = require('path');
const p = path.join(__dirname, '..', 'admin.fixed2.html');
const s = fs.readFileSync(p, 'utf8');
const m = s.match(/<script[^>]*>([\s\S]*?)<\/script>/i);
if(!m){ console.error('no <script> found'); process.exit(2); }
const code = m[1];
const lines = code.split(/\r?\n/);
const idx = 19; // zero-based -> line 20
if(idx<0||idx>=lines.length){ console.error('line out of range', lines.length); process.exit(2); }
const L = lines[idx];
console.log('LINE', idx+1, 'len', L.length);
console.log(L);
console.log('chars:');
for(let i=0;i<L.length;i++){
  const ch = L.charAt(i);
  const code = L.charCodeAt(i);
  let printable = ch;
  if(code<32||code>126) printable = '\\u'+code.toString(16).padStart(4,'0');
  process.stdout.write(i.toString().padStart(3,' ')+' '+printable+' '+code+"\n");
}
