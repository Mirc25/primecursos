const fs = require('fs');
const path = require('path');
const fp = path.join(__dirname, '..', 'admin.html');
const out = path.join(__dirname, '..', 'tmp_admin_script.js');
const text = fs.readFileSync(fp,'utf8');
const m = text.match(/<script[^>]*>([\s\S]*?)<\/script>/i);
if(!m){ console.error('No inline <script> found'); process.exit(2); }
fs.writeFileSync(out, m[1], 'utf8');
console.log('Wrote script to', out);
// run node --check
const {execSync} = require('child_process');
try{
  const res = execSync('node --check "' + out.replace(/"/g,'\"') + '"', {stdio:'inherit'});
  console.log('Node check passed');
}catch(e){ console.error('Node reported syntax errors'); process.exit(1); }
