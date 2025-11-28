const fs = require('fs');
const path = require('path');
const fp = path.join(__dirname, '..', 'admin.html');
const out = path.join(__dirname, '..', 'tmp_all_scripts.js');
const text = fs.readFileSync(fp,'utf8');
const re = /<script([^>]*)>([\s\S]*?)<\/script>/ig;
let m; let acc='';
while((m=re.exec(text))!==null){
  const attrs = m[1]||'';
  if(/src\s*=/.test(attrs)) continue; // skip external scripts
  acc += '\n// --- script block ---\n' + m[2] + '\n';
}
fs.writeFileSync(out, acc, 'utf8');
console.log('Wrote', out, 'size', acc.length);
const {execSync} = require('child_process');
try{ execSync('node --check "'+out.replace(/"/g,'\"')+'"', {stdio:'inherit'}); console.log('Node check passed'); }catch(e){ console.error('Node check failed'); process.exit(1); }
