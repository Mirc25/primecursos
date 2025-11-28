const fs=require('fs');
const s=fs.readFileSync('c:/Users/stefa/Desktop/CARPETA WORDPRES/XAMPP/htdocs/prime-cursos/tmp_all_scripts.js','utf8');
let i=0; const len=s.length;
let stack=[]; let line=1,col=1;
function pushOpen(ch){ stack.push({ch,line,col,i}); }
function popClose(ch){ const map={'}':'{',')':'(',']':'['}; const expected=map[ch]; if(stack.length===0) { console.log('Unmatched close',ch,'at',line,col); process.exit(0);} const last=stack[stack.length-1]; if(last.ch===expected){ stack.pop(); } else { console.log('Mismatched close',ch,'expected',expected,'but top',last.ch,'opened at',last.line+':'+last.col); process.exit(0);} }
// states
let inSingle=false,inDouble=false,inTemplate=false,inLineComment=false,inBlockComment=false;
while(i<len){ const ch=s[i];
 if(inLineComment){ if(ch==='\n'){ inLineComment=false; line++; col=0; } }
 else if(inBlockComment){ if(ch==='*' && s[i+1]==='/'){ inBlockComment=false; i++; col++; } }
 else if(inSingle){ if(ch==='\\' ){ i++; col++; } else if(ch==="'" ){ inSingle=false; } }
 else if(inDouble){ if(ch==='\\'){ i++; col++; } else if(ch==='"'){ inDouble=false; } }
 else if(inTemplate){ if(ch==='`') inTemplate=false; else if(ch==='\\'){ i++; col++; } }
 else {
   if(ch==='/' && s[i+1]=='/'){ inLineComment=true; i++; col++; }
   else if(ch==='/' && s[i+1]=='*'){ inBlockComment=true; i++; col++; }
   else if(ch==="'") inSingle=true;
   else if(ch==='"') inDouble=true;
   else if(ch==='`') inTemplate=true;
   else if(ch==='('||ch==='{'||ch==='[') pushOpen(ch);
   else if(ch===')'||ch==='}'||ch===']') popClose(ch);
 }
 if(ch==='\n'){ line++; col=1; } else col++;
 i++; }
if(stack.length){ console.log('EOF reached. Unmatched opens:', stack.length); stack.slice(0,10).forEach((it,idx)=> console.log(idx+1, it.ch, 'opened at', it.line, it.col)); process.exit(1);} console.log('All balanced (strings/comments-aware)');
