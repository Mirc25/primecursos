
// --- script block ---

    function loadCourses(){
      var stored = localStorage.getItem('prime_courses');
      if(stored){ try{ return JSON.parse(stored); }catch(e){ return courses.slice(); } }
      return courses.slice();
    }
    function saveCourses(list){ localStorage.setItem('prime_courses', JSON.stringify(list)); }

    var adminList = loadCourses();

    function renderAdminList(){
      var el = document.getElementById('adminCourses'); el.innerHTML='';
      adminList.forEach(function(c){
        var d = document.createElement('div'); d.className='card';
        var html = '<img class="thumb" src="'+(c.img||'')+'" alt="'+(c.title||'')+'">';
        html += '<h4 class="title">'+(c.title||'')+'</h4>';
        html += '<p class="desc">'+(c.desc||'')+'</p>';
        html += '<div class="meta"><div class="price">$'+(Number(c.price).toFixed(2))+'</div><div><button data-id="'+c.id+'" class="editBtn">Editar</button> <button data-id="'+c.id+'" class="delBtn">Eliminar</button></div></div>';
        d.innerHTML = html;
        el.appendChild(d);
      });
      el.querySelectorAll('.delBtn').forEach(function(b){ b.addEventListener('click', function(e){ var id=Number(e.currentTarget.dataset.id); adminList = adminList.filter(function(x){ return x.id!==id; }); saveCourses(adminList); renderAdminList(); alert('Curso eliminado'); }); });
      el.querySelectorAll('.editBtn').forEach(function(b){ b.addEventListener('click', function(e){ var id=Number(e.currentTarget.dataset.id); openEditor(id); }); });
    }

    document.getElementById('courseForm').addEventListener('submit', function(e){
      e.preventDefault();
      var title = document.getElementById('title').value.trim();
      var price = parseFloat(document.getElementById('price').value) || 0;
      var category = document.getElementById('category').value.trim() || 'General';
      var desc = document.getElementById('desc').value.trim();
      var img = document.getElementById('img').value.trim() || 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=1200&q=80';
      var featured = document.getElementById('featured').checked;
      var nextId = adminList.reduce(function(m,i){ return Math.max(m,i.id); },0)+1;
      var item = {id: nextId, title: title, price: price, desc: desc, img: img, category: category, featured: featured};
      adminList.push(item); saveCourses(adminList); renderAdminList(); alert('Curso creado');
      e.target.reset();
    });

    document.getElementById('clearBtn').addEventListener('click', function(){ document.getElementById('courseForm').reset(); });

    renderAdminList();

    // Editor functions
    var editingId = null;
    function openEditor(id){
      var course = adminList.find(function(x){ return x.id===id; });
      if(!course) return alert('Curso no encontrado');
      editingId = id;
      document.getElementById('courseEditor').style.display='flex';
      document.getElementById('editorTitle').innerText = 'Editar — ' + (course.title||'');
      document.getElementById('edit_title').value = course.title||'';
      document.getElementById('edit_price').value = course.price||0;
      document.getElementById('edit_category').value = course.category||'';
      document.getElementById('edit_img').value = course.img||'';
      document.getElementById('edit_featured').checked = !!course.featured;
      document.getElementById('edit_description').value = course.description||course.desc||'';
      renderEditorModules(course);
      renderEditorEvaluation(course);
      // show General tab by default
      showEditorTab('general');
    }

    document.getElementById('closeEditor').addEventListener('click', function(){ document.getElementById('courseEditor').style.display='none'; editingId = null; });
    document.getElementById('saveEditor').addEventListener('click', function(){ saveEditor(); });

    function renderEditorModules(course){
      var wrap = document.getElementById('editorModules'); wrap.innerHTML='';
      (course.modules||[]).forEach(function(m, mi){
        var card = document.createElement('div'); card.style.border='1px solid rgba(255,255,255,0.04)'; card.style.padding='8px'; card.style.marginBottom='8px';
        var html = '<label>Módulo '+(m.module_number|| (mi+1))+' — Título<br><input data-mi="'+mi+'" class="modTitle" value="'+(m.module_title||'')+'" style="width:100%;padding:6px;border-radius:6px"></label>';
        html += '<div style="margin-top:6px">Submódulos:</div>';
        html += '<div class="subList">';
        (m.submodules||[]).forEach(function(s, si){ html += '<div style="margin-top:6px;border-top:1px dashed rgba(255,255,255,0.03);padding-top:6px"><label>Sub '+(s.submodule_number|| (mi+'.'+(si+1)))+' Título<br><input data-mi="'+mi+'" data-si="'+si+'" class="subTitle" value="'+(s.title||'')+'" style="width:100%;padding:6px;border-radius:6px"></label><label style="display:block;margin-top:6px">Contenido<br><textarea data-mi="'+mi+'" data-si="'+si+'" class="subContent" rows="3" style="width:100%;padding:6px;border-radius:6px">'+(s.content||'')+'</textarea></label><label style="display:block;margin-top:6px">Imagen (URL)<br><input data-mi="'+mi+'" data-si="'+si+'" class="subImage" value="'+(s.image||'')+'" style="width:100%;padding:6px;border-radius:6px"></label><button data-mi="'+mi+'" data-si="'+si+'" class="delSubBtn">Eliminar sub</button></div>'; });
        html += '</div>';
        html += '<div style="margin-top:6px"><button data-mi="'+mi+'" class="addSubBtn">+ Añadir submódulo</button></div>';
        // button to manage module evaluation and container where editor will render
        html += '<div style="margin-top:8px"><button data-mi="'+mi+'" class="manageEvalBtn">Gestionar evaluación del módulo</button><div class="moduleEval" data-mi="'+mi+'" style="margin-top:8px"></div></div>';
        card.innerHTML = html;
        wrap.appendChild(card);
      });
      // wire events
      wrap.querySelectorAll('.modTitle').forEach(function(inp){ inp.addEventListener('input', function(e){ var mid = Number(e.currentTarget.dataset.mi); course.modules[mid].module_title = e.currentTarget.value; }); });
      wrap.querySelectorAll('.subTitle').forEach(function(inp){ inp.addEventListener('input', function(e){ var mid = Number(e.currentTarget.dataset.mi); var si = Number(e.currentTarget.dataset.si); course.modules[mid].submodules[si].title = e.currentTarget.value; }); });
      wrap.querySelectorAll('.subContent').forEach(function(inp){ inp.addEventListener('input', function(e){ var mid = Number(e.currentTarget.dataset.mi); var si = Number(e.currentTarget.dataset.si); course.modules[mid].submodules[si].content = e.currentTarget.value; }); });
      wrap.querySelectorAll('.subImage').forEach(function(inp){ inp.addEventListener('input', function(e){ var mid = Number(e.currentTarget.dataset.mi); var si = Number(e.currentTarget.dataset.si); course.modules[mid].submodules[si].image = e.currentTarget.value; }); });
      wrap.querySelectorAll('.delSubBtn').forEach(function(b){ b.addEventListener('click', function(e){ var mid = Number(e.currentTarget.dataset.mi); var si = Number(e.currentTarget.dataset.si); course.modules[mid].submodules.splice(si,1); renderEditorModules(course); }); });
      wrap.querySelectorAll('.addSubBtn').forEach(function(b){ b.addEventListener('click', function(e){ var mid = Number(e.currentTarget.dataset.mi); var newSub = { submodule_number: '', title: 'Nuevo submódulo', content: '' }; course.modules[mid].submodules.push(newSub); renderEditorModules(course); }); });
      // manage evaluation button wiring
      wrap.querySelectorAll('.manageEvalBtn').forEach(function(b){ b.addEventListener('click', function(e){ var mid = Number(e.currentTarget.dataset.mi); renderModuleEvaluationEditor(course, mid); }); });
    }

    function renderEditorEvaluation(course){
      var wrap = document.getElementById('editorEvaluation'); wrap.innerHTML='';
      (course.evaluation||[]).forEach(function(q, qi){
        var box = document.createElement('div'); box.style.border='1px solid rgba(255,255,255,0.04)'; box.style.padding='8px'; box.style.marginBottom='8px';
        var html = '<label>Pregunta<br><input data-qi="'+qi+'" class="qText" value="'+(q.question||'')+'" style="width:100%;padding:6px;border-radius:6px"></label>';
        (q.options||[]).forEach(function(opt, oi){ html += '<div style="margin-top:6px"><input data-qi="'+qi+'" data-oi="'+oi+'" class="optText" value="'+(opt.text||'')+'" style="width:86%;padding:6px;border-radius:6px"> <label style="margin-left:6px"><input type="radio" name="correct_'+qi+'" data-qi="'+qi+'" data-oi="'+oi+'" class="optCorrect" '+(q.answer===opt.key? 'checked' : '')+'> correcto</label></div>'; });
        html += '<div style="margin-top:6px"><button data-qi="'+qi+'" class="addOptionBtn">+ Añadir opción</button> <button data-qi="'+qi+'" class="delQBtn">Eliminar pregunta</button></div>';
        box.innerHTML = html; wrap.appendChild(box);
      });
      // wire events
      wrap.querySelectorAll('.qText').forEach(function(inp){ inp.addEventListener('input', function(e){ var qi = Number(e.currentTarget.dataset.qi); course.evaluation[qi].question = e.currentTarget.value; }); });
      wrap.querySelectorAll('.optText').forEach(function(inp){ inp.addEventListener('input', function(e){ var qi = Number(e.currentTarget.dataset.qi); var oi = Number(e.currentTarget.dataset.oi); course.evaluation[qi].options[oi].text = e.currentTarget.value; }); });
      wrap.querySelectorAll('.optCorrect').forEach(function(r){ r.addEventListener('change', function(e){ var qi = Number(e.currentTarget.dataset.qi); var oi = Number(e.currentTarget.dataset.oi); var key = course.evaluation[qi].options[oi].key; course.evaluation[qi].answer = key; }); });
      wrap.querySelectorAll('.addOptionBtn').forEach(function(b){ b.addEventListener('click', function(e){ var qi = Number(e.currentTarget.dataset.qi); var nextKey = String.fromCharCode(65 + (course.evaluation[qi].options.length)); course.evaluation[qi].options.push({key: nextKey, text: 'Nueva opción'}); renderEditorEvaluation(course); }); });
      wrap.querySelectorAll('.delQBtn').forEach(function(b){ b.addEventListener('click', function(e){ var qi = Number(e.currentTarget.dataset.qi); course.evaluation.splice(qi,1); renderEditorEvaluation(course); }); });
    }

    // Module-level evaluation editor
    function renderModuleEvaluationEditor(course, mid){
      var container = document.querySelector('#editorModules .moduleEval[data-mi="'+mid+'"]');
      if(!container){
        // fallback: find module card and its .moduleEval
        var all = document.querySelectorAll('#editorModules .moduleEval');
        for(var i=0;i<all.length;i++){ if(Number(all[i].dataset.mi)===mid){ container = all[i]; break; } }
      }
      if(!container) return;
      var mod = course.modules[mid]; mod.evaluation = mod.evaluation || [];
      container.innerHTML = '';
      mod.evaluation.forEach(function(q, qi){
        var box = document.createElement('div'); box.style.border='1px solid rgba(255,255,255,0.04)'; box.style.padding='8px'; box.style.marginBottom='8px';
        var html = '<label>Pregunta<br><input data-mi="'+mid+'" data-qi="'+qi+'" class="m_qText" value="'+(q.question||'')+'" style="width:100%;padding:6px;border-radius:6px"></label>';
        (q.options||[]).forEach(function(opt, oi){ html += '<div style="margin-top:6px"><input data-mi="'+mid+'" data-qi="'+qi+'" data-oi="'+oi+'" class="m_optText" value="'+(opt.text||'')+'" style="width:78%;padding:6px;border-radius:6px"> <label style="margin-left:6px"><input type="radio" name="m_correct_'+mid+'_'+qi+'" data-mi="'+mid+'" data-qi="'+qi+'" data-oi="'+oi+'" class="m_optCorrect" '+(q.answer===opt.key? 'checked' : '')+'> correcto</label></div>'; });
        html += '<div style="margin-top:6px"><button data-mi="'+mid+'" data-qi="'+qi+'" class="m_addOptionBtn">+ Añadir opción</button> <button data-mi="'+mid+'" data-qi="'+qi+'" class="m_delQBtn">Eliminar pregunta</button></div>';
        box.innerHTML = html; container.appendChild(box);
      });
      var addBtn = document.createElement('div'); addBtn.style.marginTop='8px'; addBtn.innerHTML = '<button class="m_addQBtn">+ Añadir pregunta al módulo</button>';
      container.appendChild(addBtn);

      // wire events
      container.querySelectorAll('.m_qText').forEach(function(inp){ inp.addEventListener('input', function(e){ var qi = Number(e.currentTarget.dataset.qi); course.modules[mid].evaluation[qi].question = e.currentTarget.value; }); });
      container.querySelectorAll('.m_optText').forEach(function(inp){ inp.addEventListener('input', function(e){ var qi = Number(e.currentTarget.dataset.qi); var oi = Number(e.currentTarget.dataset.oi); course.modules[mid].evaluation[qi].options[oi].text = e.currentTarget.value; }); });
      container.querySelectorAll('.m_optCorrect').forEach(function(r){ r.addEventListener('change', function(e){ var qi = Number(e.currentTarget.dataset.qi); var oi = Number(e.currentTarget.dataset.oi); var key = course.modules[mid].evaluation[qi].options[oi].key; course.modules[mid].evaluation[qi].answer = key; }); });
      container.querySelectorAll('.m_addOptionBtn').forEach(function(b){ b.addEventListener('click', function(e){ var qi = Number(e.currentTarget.dataset.qi); var nextKey = String.fromCharCode(65 + (course.modules[mid].evaluation[qi].options.length)); course.modules[mid].evaluation[qi].options.push({key: nextKey, text: 'Nueva opción'}); renderModuleEvaluationEditor(course, mid); }); });
      container.querySelectorAll('.m_delQBtn').forEach(function(b){ b.addEventListener('click', function(e){ var qi = Number(e.currentTarget.dataset.qi); course.modules[mid].evaluation.splice(qi,1); renderModuleEvaluationEditor(course, mid); }); });
      var addQ = container.querySelector('.m_addQBtn'); if(addQ){ addQ.addEventListener('click', function(){ var nextQ = { question: 'Nueva pregunta', options: [{key:'A',text:'Opción A'},{key:'B',text:'Opción B'}], answer: 'A' }; course.modules[mid].evaluation.push(nextQ); renderModuleEvaluationEditor(course, mid); }); }
    }

    document.getElementById('addModuleBtn').addEventListener('click', function(){ if(editingId===null) return; var c = adminList.find(function(x){ return x.id===editingId; }); var newM = { module_number: (c.modules.length+1), module_title: 'Nuevo módulo', submodules: [] }; c.modules.push(newM); renderEditorModules(c); });
    document.getElementById('addQuestionBtn').addEventListener('click', function(){ if(editingId===null) return; var c = adminList.find(function(x){ return x.id===editingId; }); c.evaluation = c.evaluation || []; c.evaluation.push({question:'Nueva pregunta', options:[{key:'A',text:'Opción A'},{key:'B',text:'Opción B'}], answer:'A'}); renderEditorEvaluation(c); });

    function saveEditor(){
      if(editingId===null) return;
      var c = adminList.find(function(x){ return x.id===editingId; });
      c.title = document.getElementById('edit_title').value.trim();
      c.price = parseFloat(document.getElementById('edit_price').value) || 0;
      c.category = document.getElementById('edit_category').value.trim();
      c.img = document.getElementById('edit_img').value.trim();
      c.featured = document.getElementById('edit_featured').checked;
      c.description = document.getElementById('edit_description').value.trim();
      // modules and evaluation mutated live
      saveCourses(adminList); renderAdminList(); document.getElementById('courseEditor').style.display='none'; editingId = null; alert('Cambios guardados');
    }

    // Tab control for editor
    function showEditorTab(name){
      var tg = { general: 'editorGeneral', modules: 'editorModules', eval: 'editorEvaluation' };
      // remove active class
      document.querySelectorAll('.tabBtn').forEach(function(b){ b.classList.remove('active'); });
      // hide all
      document.getElementById('editorGeneral').style.display = 'none';
      document.getElementById('editorModules').style.display = 'none';
      document.getElementById('editorEvaluation').style.display = 'none';
      // set selected
      if(name === 'general'){
        document.getElementById('tabGeneral').classList.add('active');
        document.getElementById('editorGeneral').style.display = 'block';
      } else if(name === 'modules'){
        document.getElementById('tabModules').classList.add('active');
        document.getElementById('editorModules').style.display = 'block';
      } else if(name === 'eval' || name === 'evaluation'){
        document.getElementById('tabEval').classList.add('active');
        document.getElementById('editorEvaluation').style.display = 'block';
      }
    }

    // wire tab buttons
    document.getElementById('tabGeneral').addEventListener('click', function(){ showEditorTab('general'); });
    document.getElementById('tabModules').addEventListener('click', function(){ showEditorTab('modules'); });
    document.getElementById('tabEval').addEventListener('click', function(){ showEditorTab('eval'); });

    // Parser: convierte texto plano en estructura de curso
    function parseCoursePlain(text){
      var lines = text.split(/\r?\n/).map(function(l){ return l.trim(); });
      var course = { id: (Date.now()%1000000), title:'', category:'', short_description:'', description:'', price:0, image:null, modules:[], evaluation:[] };
      var currentModule = null;
      var currentSub = null;
      var mode = '';
      for(var i=0;i<lines.length;i++){
        var L = lines[i]; if(!L) continue;
        // KEY: VALUE patterns
        if(/^TITULO:\s*/i.test(L)) { course.title = L.replace(/^TITULO:\s*/i,'').trim(); continue; }
        if(/^CATEGORIA:\s*/i.test(L)) { course.category = L.replace(/^CATEGORIA:\s*/i,'').trim(); continue; }
        if(/^DESCRIPCION_CORTA:\s*/i.test(L)) { course.short_description = L.replace(/^DESCRIPCION_CORTA:\s*/i,'').trim(); continue; }
        if(/^DESCRIPCION:\s*/i.test(L)) { course.description = L.replace(/^DESCRIPCION:\s*/i,'').trim(); mode='description'; continue; }
        if(/^PRECIO:\s*/i.test(L)) { var p = L.replace(/^PRECIO:\s*/i,'').trim(); course.price = parseFloat(p)||0; continue; }
        if(/^MODULO:\s*/i.test(L)) { // new module (e.g. MODULO: 1. Title)
          var val = L.replace(/^MODULO:\s*/i,'').trim();
          // try split number and title
          var mnum = ''; var mtitle = val;
          var m = val.match(/^([0-9]+)\.?\s*-?\s*(.*)$/);
          if(m){ mnum = m[1]; if(m[2]) mtitle = m[2]; }
          currentModule = { module_number: mnum || (course.modules.length+1), module_title: mtitle || val, submodules: [] };
          course.modules.push(currentModule); currentSub = null; mode='modules'; continue;
        }
        if(/^SUBMODULO:\s*/i.test(L)) {
          var sval = L.replace(/^SUBMODULO:\s*/i,'').trim();
          var subnum=''; var subtitle=sval;
          var sm = sval.match(/^([0-9]+(\.[0-9]+)?)\s*-?\s*(.*)$/);
          if(sm){ subnum = sm[1]; if(sm[3]) subtitle = sm[3]; }
          currentSub = { submodule_number: subnum || '', title: subtitle || sval, content: '', image: null };
          if(!currentModule){ currentModule = { module_number: course.modules.length+1, module_title:'Módulo '+(course.modules.length+1), submodules:[] }; course.modules.push(currentModule); }
          currentModule.submodules.push(currentSub); mode='submodule'; continue;
        }
        if(/^(IMAGEN|IMAGE):\s*/i.test(L)) { // image for current submodule
          var v = L.replace(/^(IMAGEN|IMAGE):\s*/i,'').trim();
          if(currentSub){ currentSub.image = v || currentSub.image; }
          continue;
        }
        if(/^CONTENIDO:\s*/i.test(L)) { // explicit content marker for submodule
          var v = L.replace(/^CONTENIDO:\s*/i,'').trim();
          if(currentSub){ currentSub.content = (currentSub.content? currentSub.content + '\n' : '') + v; }
          mode = 'submodule';
          continue;
        }
        if(/^(\+EVALUACION\+|\+EVALUACION)/i.test(L) || /^EVALUACION\+?/i.test(L)) { 
          // start evaluation section: if there's a current module, attach evaluation to it, otherwise to course.evaluation
          mode='evaluation';
          // ensure containers
          if(currentModule){ currentModule.evaluation = currentModule.evaluation || []; }
          else { course.evaluation = course.evaluation || []; }
          continue; }
        // evaluation questions (P: ... answers / mark *)
        if(mode==='evaluation' && /^P:\s*/i.test(L)){
          var q = L.replace(/^P:\s*/i,'').trim();
          var opts = [];
          var answer = null;
          var j=i+1;
          for(;j<lines.length;j++){
            var nx = lines[j]; if(!nx) break;
            var mo = nx.match(/^[A-D]\)\s*(.*)$/) || nx.match(/^([A-D]):\s*(.*)$/);
            if(mo){ var label = mo[1]; var textopt = mo[2] || ''; var isCorrect = textopt.indexOf('*')!==-1; if(isCorrect) textopt = textopt.replace(/\*/g,'').trim(); opts.push({key:label, text:textopt}); if(isCorrect) answer=label; }
            else break;
          }
          i = j-1;
          var qobj = {question: q, options: opts, answer: answer};
          if(currentModule){ currentModule.evaluation = currentModule.evaluation || []; currentModule.evaluation.push(qobj); }
          else { course.evaluation = course.evaluation || []; course.evaluation.push(qobj); }
          continue;
        }
        // content lines appended
        if(mode==='description'){ course.description += (course.description? '\n' : '') + L; continue; }
        if(mode==='submodule' && currentSub){ currentSub.content += (currentSub.content? '\n' : '') + L; continue; }
        // fallback: try detect evaluation questions that start with 'P:' anywhere
      }
      return course;
    }

    // import button behavior
    document.getElementById('importBtn').addEventListener('click', function(){
      var raw = document.getElementById('rawCourse').value || '';
      if(!raw.trim()){ alert('Pega el texto del curso antes de importar'); return; }
      var parsed = parseCoursePlain(raw);
      // add to adminList and save
      adminList.push(parsed); saveCourses(adminList); renderAdminList();
      // open editor immediately for the imported course
      document.getElementById('rawCourse').value = '';
      document.getElementById('importPreview').style.display='none';
      openEditor(parsed.id);
    });

    function renderImportPreview(parsed){
      var preview = document.getElementById('importPreview'); preview.style.display='block'; preview.innerHTML='';
      var wrap = document.createElement('div');
      var h = document.createElement('div'); h.style.marginBottom='8px';
      // Mostrar categoría y precio, no mostrar título en la previsualización según solicitud
      h.innerHTML = '<strong>Categoría:</strong> ' + (parsed.category||'-') + ' <strong style="margin-left:12px">Precio:</strong> $' + (Number(parsed.price||0).toFixed(2)) + '<br>';
      if(parsed.short_description) h.innerHTML += '<strong>Descripción corta:</strong> ' + parsed.short_description + '<br>';
      if(parsed.description) h.innerHTML += '<strong>Descripción larga:</strong> <div style="margin-top:6px;padding:8px;background:rgba(255,255,255,0.02);border-radius:6px;white-space:pre-wrap">' + parsed.description + '</div>';
      wrap.appendChild(h);

      var mods = document.createElement('div');
      mods.innerHTML = '<h4 style="margin-top:12px">Módulos (' + ((parsed.modules&&parsed.modules.length)||0) + ')</h4>';
      if(parsed.modules && parsed.modules.length){
        parsed.modules.forEach(function(m, mi){
          var md = document.createElement('div'); md.style.padding='8px'; md.style.border='1px solid rgba(255,255,255,0.03)'; md.style.marginBottom='8px';
          var title = '<div style="display:flex;justify-content:space-between;align-items:center"><div><strong>Módulo ' + (m.module_number || (mi+1)) + ':</strong> <input class="pv-mod-title" data-mi="'+mi+'" style="padding:6px;border-radius:6px;width:60%" value="'+(m.module_title||'')+'"></div>';
          title += '<em>Submódulos: ' + ((m.submodules&&m.submodules.length)||0) + '</em></div>';
          md.innerHTML = title;
          if(m.submodules && m.submodules.length){
            var ul = document.createElement('div'); ul.style.marginTop='6px';
            (m.submodules||[]).forEach(function(s, si){ var sdiv = document.createElement('div'); sdiv.style.marginTop='6px'; sdiv.textContent = s.title || ('Sub '+(si+1)); ul.appendChild(sdiv); });
            md.appendChild(ul);
          }
        });
        // NOTE: removed the inline string-built student view here because it contained complex embedded script strings
        // that caused syntax/escaping issues. A DOM-based `openStudentView2` is defined later (safer).
      // replace import buttons behavior to use preview._parsed current state
      var importEditBtn = preview.querySelector('button.primary');
      if(importEditBtn){ importEditBtn.addEventListener('click', function(){ var cur = preview._parsed; if(!cur) return; adminList.push(cur); saveCourses(adminList); renderAdminList(); openEditor(cur.id, 'modules'); document.getElementById('rawCourse').value=''; preview.style.display='none'; }); }
      var importOnlyBtn = (function(){ var btns = preview.querySelectorAll('button'); for(var i=0;i<btns.length;i++){ if(btns[i].textContent && btns[i].textContent.indexOf('Importar sin abrir')!==-1) return btns[i]; } return null; })();
      if(importOnlyBtn){ importOnlyBtn.addEventListener('click', function(){ var cur = preview._parsed; if(!cur) return; adminList.push(cur); saveCourses(adminList); renderAdminList(); document.getElementById('rawCourse').value=''; preview.style.display='none'; alert('Curso importado'); }); }

      // add explicit 'Guardar cambios' button (ediciones ya actualizan preview._parsed)
      var savePreviewBtn = document.createElement('button'); savePreviewBtn.textContent = 'Guardar cambios en previsualización'; savePreviewBtn.style.marginRight='8px';
      savePreviewBtn.addEventListener('click', function(){ alert('Cambios guardados en la previsualización. Cuando pulses Importar se guardarán definitivamente.'); });
      actions.insertBefore(savePreviewBtn, actions.firstChild);
    }

    document.getElementById('previewBtn').addEventListener('click', function(){
      var raw = document.getElementById('rawCourse').value || '';
      if(!raw.trim()){ alert('Pega el texto del curso para previsualizar'); return; }
      var parsed = parseCoursePlain(raw);
          function openStudentView2(parsed){
            // Safer DOM-based popup rendering (avoids large inline script strings)
            try{
              var w = window.open('','student_view','width=900,height=700');
              if(!w) return alert('No se pudo abrir la ventana del alumno (popup bloqueado).');
              var doc = w.document;
              doc.open();
              doc.write('<!doctype html><html><head><meta charset="utf-8"><title>'+ (parsed.title||'Curso') +'</title></head><body></body></html>');
              doc.close();
              var body = doc.body;
              var style = doc.createElement('style');
              style.textContent = `body{font-family:Arial,Helvetica,sans-serif;margin:12px} .module{border:1px solid #ddd;padding:8px;margin:8px 0;border-radius:4px} .module h3{margin:0 0 6px 0} .btn{display:inline-block;padding:6px 10px;margin-right:6px;background:#0b79d0;color:#fff;border-radius:4px;text-decoration:none}`;
              doc.head.appendChild(style);
              var h1 = doc.createElement('h1'); h1.textContent = parsed.title || 'Curso sin título'; body.appendChild(h1);
              // Nota: la descripción larga se omite intencionadamente en la vista de alumno
              var modulesRoot = doc.createElement('div'); modulesRoot.id = 'modules'; body.appendChild(modulesRoot);
              (parsed.modules||[]).forEach(function(m, mi){
                var mdiv = doc.createElement('div'); mdiv.className = 'module'; mdiv.dataset.mi = mi;
                var mh = doc.createElement('h3'); mh.textContent = m.module_title || ('Módulo '+(mi+1)); mdiv.appendChild(mh);
                var ms = doc.createElement('div'); ms.innerHTML = m.summary || ''; mdiv.appendChild(ms);
                var btn = doc.createElement('a'); btn.href='#'; btn.className='btn start-module'; btn.dataset.mi = mi; btn.textContent = 'Abrir módulo';
                btn.addEventListener('click', function(ev){ ev.preventDefault(); openModule(mi); });
                mdiv.appendChild(btn);
                modulesRoot.appendChild(mdiv);
              });
              var content = doc.createElement('div'); content.id = 'content'; content.style.marginTop = '18px'; body.appendChild(content);

              function openModule(mi){
                content.innerHTML = '';
                var title = (parsed.modules && parsed.modules[mi] && (parsed.modules[mi].module_title || ('Módulo '+(mi+1)))) || ('Módulo '+(mi+1));
                var th = doc.createElement('h2'); th.textContent = title; content.appendChild(th);
                var sublist = doc.createElement('div'); sublist.id = 'sublist'; content.appendChild(sublist);
                // Try to request richer data from opener safely
                if(window.opener && typeof window.opener.getParsedCourse === 'function'){
                  try{
                    var course = window.opener.getParsedCourse();
                    var m = course.modules && course.modules[mi];
                    if(m && m.submodules && m.submodules.length){
                      m.submodules.forEach(function(s, si){
                        var sbox = doc.createElement('div'); sbox.style.margin = '8px 0'; sbox.style.padding = '8px'; sbox.style.border = '1px dashed #eee';
                        var st = doc.createElement('strong'); st.textContent = s.title || ('Sub '+(si+1)); sbox.appendChild(st);
                        var sc = doc.createElement('div'); sc.style.marginTop = '6px'; sc.innerHTML = s.content || ''; sbox.appendChild(sc);
                        sublist.appendChild(sbox);
                      });
                      return;
                    }
                  }catch(e){ /* ignore, fallback below */ }
                }
                var no = doc.createElement('p'); no.textContent = 'Contenido de los submódulos no disponible.'; sublist.appendChild(no);
              }
                }catch(err){ console.error('openStudentView2 error', err); alert('Error al abrir vista alumno: '+(err && err.message)); }
                });
              
