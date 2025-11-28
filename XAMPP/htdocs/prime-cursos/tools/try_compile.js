const fs = require('fs');
const path = require('path');
const p = path.resolve(__dirname, '..', 'admin.html');
const s = fs.readFileSync(p,'utf8');
// match the first inline <script> (skip scripts with src=)
const m = s.match(/<script(?![^>]*src)[^>]*>([\s\S]*?)<\/script>/i);
const code = (m? m[1] : '');
try {
	new Function(code);
	console.log('Compiled OK');
} catch (e) {
	console.error('Compile error:', e && e.message);
	if (e && e.stack) console.error(e.stack);
	process.exit(1);
}