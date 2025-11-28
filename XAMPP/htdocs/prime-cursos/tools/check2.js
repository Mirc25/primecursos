const fs = require('fs');
const path = require('path');
const vm = require('vm');
const p = path.join(__dirname, '..', 'admin.fixed2.html');
const s = fs.readFileSync(p, 'utf8');
const m = s.match(/<script[^>]*>([\s\S]*?)<\/script>/i);
if(!m){ console.error('no <script> found'); process.exit(2); }
const code = m[1];
try{
  new vm.Script(code, {filename:'admin.fixed2_script.js'});
  console.log('PARSE_OK');
}catch(e){
  console.error('PARSE_ERROR:', e && e.stack || e);
  process.exit(1);
}
