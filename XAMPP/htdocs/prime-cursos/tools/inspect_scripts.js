const fs = require('fs');
const p = 'c:\\Users\\stefa\\Desktop\\CARPETA WORDPRES\\XAMPP\\htdocs\\prime-cursos\\admin.html';
const s = fs.readFileSync(p, 'utf8');
const re = /<script[^>]*>([\s\S]*?)<\/script>/gi;
let m, code='';
while((m=re.exec(s))){ code += m[1] + '\n\n'; }
console.log('len', code.length);
const slice = code.slice(0,200);
console.log('slice=', JSON.stringify(slice));
const arr = slice.split('').map(c=>c.charCodeAt(0));
console.log('codes=', arr.join(','));
try{ new Function(code); console.log('COMPILE_OK'); } catch(e){ console.error('COMPILE_ERR:', e && e.message); if(e && e.stack) console.error(e.stack); }
