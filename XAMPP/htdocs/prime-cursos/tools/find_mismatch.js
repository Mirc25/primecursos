const fs = require('fs');
const path = require('path');
const p = path.resolve(__dirname, '..', 'admin.html');
const s = fs.readFileSync(p,'utf8');
const m = s.match(/<script(?![^>]*src)[^>]*>([\s\S]*?)<\/script>/i);
const code = m? m[1] : '';

let stack = [];
let inStr = null;
let esc = false;
let line = 1;
for (let i = 0; i < code.length; i++) {
	const ch = code[i];
	if (ch === '\n') line++;
	if (inStr) { if (esc) { esc = false; } else if (ch === '\\') { esc = true; } else if (ch === inStr) { inStr = null; } continue; }
	if (ch === '"' || ch === "'" || ch === '`') { inStr = ch; continue; }
	// comments
	if (ch === '/' && code[i+1] === '/') { i += 2; while (i < code.length && code[i] !== '\n') i++; continue; }
	if (ch === '/' && code[i+1] === '*') { i += 2; while (i < code.length && !(code[i] === '*' && code[i+1] === '/')) { if (code[i] === '\n') line++; i++; } i++; continue; }
	// naive regex skip
	if (ch === '/' && code[i+1] !== '/' && code[i+1] !== '*'){
		i++; while (i < code.length) { if (code[i] === '\\') { i += 2; continue; } if (code[i] === '/') break; if (code[i] === '\n') line++; i++; }
		continue;
	}
	if (ch === '{' || ch === '(' || ch === '[') stack.push({ch,line,idx:i});
	else if (ch === '}' || ch === ')' || ch === ']'){
		const top = stack.pop();
		if (!top) { console.log('Unmatched closing '+ch+' at script-line '+line); console.log('\nContext:\n' + code.slice(Math.max(0,i-80), i+80)); process.exit(1); }
		const pairs = {'}':'{', ')':'(', ']':'['};
		if (top.ch !== pairs[ch]){
			const startLine = s.slice(0,s.search(/<script(?![^>]*src)[^>]*>/i)).split('\n').length;
			console.log('Mismatched close '+ch+' expected '+pairs[ch]+' but top '+top.ch+' opened at script-line '+top.line+' (file-line '+(startLine+top.line)+')');
			console.log('\nContext around mismatch:\n' + code.slice(Math.max(0,i-120), Math.min(code.length, i+120)).replace(/\n/g,'\n'));
			process.exit(1);
		}
	}
}
if (stack.length) { const t = stack[stack.length-1]; console.log('Unclosed at end. Top is '+t.ch+' opened at script-line '+t.line); process.exit(1); }
console.log('OK');
