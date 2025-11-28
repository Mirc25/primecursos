const fs = require('fs');
const path = require('path');
const p = path.join(__dirname, '..', 'admin.fixed2.html');
const s = fs.readFileSync(p, 'utf8');
const m = s.match(/<script[^>]*>([\s\S]*?)<\/script>/i);
if(!m){ console.error('no <script> found'); process.exit(2); }
const code = m[1];
const lines = code.split(/\n/);
let pCount = 0, bCount = 0, cCount = 0;
for(let i=0;i<lines.length;i++){
  const line = lines[i];
  for(let ch of line){
    if(ch==='(') pCount++;
    else if(ch===')') pCount--;
    else if(ch==='[') bCount++;
    else if(ch===']') bCount--;
    else if(ch==='{') cCount++;
    else if(ch==='}') cCount--;
  }
  if(pCount<0 || bCount<0 || cCount<0){
    console.log('Imbalance at line', i+1, 'parens', pCount, 'brackets', bCount, 'braces', cCount);
    console.log('LINE', i+1, ':', line);
    process.exit(0);
  }
}
console.log('No negative imbalance; final counts => parens',pCount,'brackets',bCount,'braces',cCount);
