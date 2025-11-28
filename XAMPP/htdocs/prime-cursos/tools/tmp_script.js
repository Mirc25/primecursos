(function(){
    var storageKey = 'prime_courses';
    var courses = [];
    var selectedCourseId = null; // id of course selected in list for the single "Ver alumno" button

    function load(){
      try{
        var s = localStorage.getItem(storageKey);
        courses = s ? JSON.parse(s) : [];
      }catch(e){ courses = []; }
      // dedupe courses by id or by title+price to avoid accidental duplicates
      var seen = {};
      var deduped = [];
      courses.forEach(function(c){
        var key = c.id ? String(c.id) : (String(c.title||'')+'|'+String(c.price||0));
        if(!seen[key]){ seen[key]=true; deduped.push(c); }
      });
      courses = deduped;
      // persist deduped list to avoid repeated duplicates in storage
      try{ localStorage.setItem(storageKey, JSON.stringify(courses)); }catch(e){}
      renderList();
    }

    function save(){ try{ localStorage.setItem(storageKey, JSON.stringify(courses)); }catch(e){} }

    function parseCoursePlain(text){
      var lines = String(text||'').split(/\r?\n/).map(l=>l.trim());
      var course = { id: Date.now(), title:'', category:'', short_description:'', description:'', price:0, image:null, modules:[], evaluation:[] };
      var curMod = null, curSub = null, mode = '';
      for(var i=0;i<lines.length;i++){
        var L = lines[i];
        if(!L) continue;
        if(/A\)/i.test(L) && /B\)/i.test(L)){
          try{
            var aIdx = L.search(/A\)/i);
            var qtxt = (aIdx>=0) ? L.slice(0,aIdx).trim() : '';
            var rest = (aIdx>=0) ? L.slice(aIdx) : L;
            var opts = [];
            var ans = null;
            var re = /([A-D])\)\s*([^A-D]*)/ig;
            var m;
            while((m = re.exec(rest)) !== null){
              var key = (m[1]||'').toUpperCase();
              var txt = (m[2]||'').trim();
              if(/\*/.test(txt)){ txt = txt.replace(/\*/g,'').trim(); ans = key; }
              opts.push({ key: key, text: txt });
            }
            if(qtxt){ var target = curMod || course; target.evaluation = target.evaluation || []; target.evaluation.push({ question: qtxt, options: opts, answer: ans }); continue; }
          }catch(e){}
        }
        if(/^TITULO:\s*/i.test(L)){ course.title = L.replace(/^TITULO:\s*/i,'').trim(); continue; }
        if(/^CATEGORIA:\s*/i.test(L)){ course.category = L.replace(/^CATEGORIA:\s*/i,'').trim(); continue; }
        if(/^DESCRIPCION_CORTA:\s*/i.test(L)){ course.short_description = L.replace(/^DESCRIPCION_CORTA:\s*/i,'').trim(); continue; }
        if(/^DESCRIPCION:\s*/i.test(L)){ course.description += (course.description ? '\n' : '') + L.replace(/^DESCRIPCION:\s*/i,'').trim(); mode = 'description'; continue; }
        if(/^PRECIO:\s*/i.test(L)){ course.price = parseFloat(L.replace(/^PRECIO:\s*/i,'').replace(',','.'))||0; continue; }
        var m = L.match(/^MODULO:\s*(?:[0-9\.]+)?\s*-?\s*(.*)$/i);
        if(m){ curMod = { title:(m[1]||'Módulo'), submodules:[], evaluation:[] }; course.modules.push(curMod); curSub = null; mode = 'modules'; continue; }
        var s = L.match(/^SUBMODULO:\s*(?:[0-9\.]+)?\s*-?\s*(.*)$/i);
        if(s){ curSub = { title:(s[1]||'Sub'), content:'', image:null }; if(!curMod){ curMod = { title:'Módulo 1', submodules:[], evaluation:[] }; course.modules.push(curMod); } curMod.submodules.push(curSub); mode='sub'; continue; }
        if(/^CONTENIDO:\s*/i.test(L)){ var v = L.replace(/^CONTENIDO:\s*/i,'').trim(); if(curSub) curSub.content += (curSub.content ? '\n' : '') + v; else course.description += (course.description ? '\n' : '') + v; continue; }
        if(/^\+EVALUACION\+/i.test(L) || /^EVALUACION/i.test(L)){ mode='eval'; continue; }
        if(mode==='eval' && /^P:\s*/i.test(L)){
          var q = L.replace(/^P:\s*/i,'').trim(); var opts = [], ans = null; var j = i+1;
          for(; j<lines.length; j++){
            var nx = lines[j]; if(!nx) break;
            var mo = nx.match(/^([A-D])[\)\:]\s*(.*)$/i); if(!mo) break;
            var key = mo[1], txt = mo[2]||'';
            if(/\*/.test(txt)){ txt = txt.replace(/\*/g,'').trim(); ans = key; }
            opts.push({ key:key, text: txt });
          }
          var target = curMod || course;
          target.evaluation = target.evaluation || [];
          target.evaluation.push({ question: q, options: opts, answer: ans });
          i = j-1; continue;
        }
        if(mode==='description') course.description += (course.description ? '\n' : '') + L;
        else if(mode==='sub' && curSub) curSub.content += (curSub.content ? '\n' : '') + L;
      }
      if(!course.short_description && course.description) course.short_description = course.description.split('\n').join(' ').slice(0,160);
      return course;
    }

    function escapeHtml(s){
      return String(s||'').replace(/[&<>\"]/g, function(m){
        return ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'})[m];
      });
    }

    // (Truncated rest of script for debug purposes)

})();
