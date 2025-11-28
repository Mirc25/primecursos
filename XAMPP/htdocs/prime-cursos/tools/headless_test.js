const fs = require('fs');
const path = require('path');
const { JSDOM } = require('jsdom');

const p = path.join(__dirname, '..', 'admin.fixed2.html');
const html = fs.readFileSync(p, 'utf8');

console.log('Starting headless test for admin.fixed2.html');

const dom = new JSDOM(html, {
  runScripts: 'dangerously',
  resources: 'usable',
  beforeParse(window) {
    // Capture popup windows created via window.open
    window.__popups = [];
    window.open = function(url, name, opts){
      const popup = new JSDOM('<!doctype html><html><head></head><body></body></html>', {
        runScripts: 'dangerously', resources: 'usable',
        beforeParse(pwin){
          // polyfill popup alert/localStorage too
          if(!pwin.alert) pwin.alert = function(){};
          if(!pwin.localStorage){
            (function(){ const store = Object.create(null); pwin.localStorage = { getItem(k){ return Object.prototype.hasOwnProperty.call(store,k)?store[k]:null }, setItem(k,v){ store[k]=String(v) }, removeItem(k){ delete store[k] }, clear(){ for(const k in store) delete store[k] } } })();
          }
        }
      });
      window.__popups.push(popup);
      return popup.window;
    };
    // ensure localStorage exists
    (function(){
      const store = Object.create(null);
      window.localStorage = window.localStorage || {
        getItem(k){ return Object.prototype.hasOwnProperty.call(store,k)?store[k]:null; },
        setItem(k,v){ store[k]=String(v); },
        removeItem(k){ delete store[k]; },
        clear(){ for(const k in store) delete store[k]; }
      };
    })();
    // avoid jsdom 'Not implemented: window.alert' by stubbing on window+document
    if(!window.alert) window.alert = function(){};
    if(window.document && !window.document.alert) window.document.alert = window.alert;
  }
});

function waitForLoad(win, timeout=2000){
  return new Promise((resolve, reject)=>{
    if(win.document.readyState === 'complete' || win.document.readyState === 'interactive') return resolve();
    const to = setTimeout(()=>reject(new Error('load timeout')) , timeout);
    win.addEventListener('load', ()=>{ clearTimeout(to); resolve(); });
  });
}

(async ()=>{
  try{
    await waitForLoad(dom.window);
    const win = dom.window;
    console.log('Page loaded — running checks');

    // sanity: parseCoursePlain available?
    console.log('Checking window._pc...');
    console.log('keys on window:', Object.keys(win).slice(0,40).join(', '));
    if(!win._pc || typeof win._pc.parseCoursePlain !== 'function'){
      console.error('parseCoursePlain not available — window._pc keys:', win._pc && Object.keys(win._pc));
      process.exit(2);
    }

    // Fill textarea and click preview
    const raw = win.document.getElementById('raw');
    const preview = win.document.getElementById('preview');
    const importBtn = win.document.getElementById('import');
    console.log('raw?', !!raw, 'preview?', !!preview, 'import?', !!importBtn);
    console.log('body html snippet:', win.document.body && String(win.document.body.innerHTML||'').slice(0,400).replace(/\n/g,'\\n'));
    if(!raw || !preview || !importBtn){ console.error('Missing controls in page — DOM snapshot keys:', Object.keys(win.document).slice(0,20)); process.exit(2); }

    const sample = `TITULO: Ejemplo\nCATEGORIA: Demo\nDESCRIPCION: Una descripción corta.\n+EVALUACION+\nP: ¿2+2?\nA) 3\nB) 4*\nC) 5\nD) 6`;
    // Directly test the parser
    const parsed = win._pc.parseCoursePlain(sample);
    if(!parsed || parsed.title.indexOf('Ejemplo')<0){ console.error('Parser failed to extract title'); process.exit(3); }
    if(!Array.isArray(parsed.evaluation) || parsed.evaluation.length===0){ console.error('Parser failed to extract evaluation'); process.exit(4); }
    console.log('Parser output OK — question count:', parsed.evaluation.length);

    // Simulate import: ensure localStorage present and store parsed
    function ensureLocalStorage(w){
      try{
        if(w && typeof w.localStorage==='object' && typeof w.localStorage.getItem==='function') return w.localStorage;
      }catch(e){}
      const store = Object.create(null);
      const poly = { getItem(k){ return Object.prototype.hasOwnProperty.call(store,k)?store[k]:null }, setItem(k,v){ store[k]=String(v); }, removeItem(k){ delete store[k]; }, clear(){ for(const k in store) delete store[k]; } };
      try{ if(w) w.localStorage = poly; }catch(e){}
      return poly;
    }
    const ls = ensureLocalStorage(win);
    const prev = ls.getItem('prime_courses'); const arr0 = prev?JSON.parse(prev):[]; arr0.push(parsed); ls.setItem('prime_courses', JSON.stringify(arr0));
    const stored = ls.getItem('prime_courses');
    if(!stored){ console.error('No stored courses in localStorage'); process.exit(7); }
    const parsedArr = JSON.parse(stored);
    if(!Array.isArray(parsedArr) || !parsedArr.length){ console.error('Stored courses invalid'); process.exit(8); }
    console.log('Import stored to localStorage OK — count:', parsedArr.length);

    console.log('HEADLESS_TEST_OK');
    process.exit(0);
  }catch(err){
    console.error('HEADLESS_TEST_ERROR', err && err.stack || err);
    process.exit(1);
  }
})();
