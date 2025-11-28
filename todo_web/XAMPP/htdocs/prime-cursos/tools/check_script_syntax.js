const fs = require('fs');
const path = require('path');
const p = path.join(__dirname, '..', 'admin.fixed2.html');
const s = fs.readFileSync(p, 'utf8');
const m = s.match(/<script[^>]*>([\s\S]*?)<\/script>/i);
if(!m){ console.error('no <script> found'); process.exit(2); }
const code = m[1];
try{
  new Function(code);
  console.log('SYNTAX_OK');
}catch(e){
  console.error(e && e.stack || e);
  process.exit(1);
}
