// --- script block ---

    function loadCourses(){
      var stored = localStorage.getItem('prime_courses');
      if(stored){ try{ return JSON.parse(stored); }catch(e){ return courses.slice(); } }
      return courses.slice();
    }
    function saveCourses(list){ localStorage.setItem('prime_courses', JSON.stringify(list)); }











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
    document.getElementById('closeEditor').addEventListener('click', function(){ document.getElementById('courseEditor').style.display='none'; editingId = null; });
    document.getElementById('saveEditor').addEventListener('click', function(){ saveEditor(); });
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
    renderAdminList();
    document.getElementById('clearBtn').addEventListener('click', function(){ document.getElementById('courseForm').reset(); });
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
    function renderAdminList(){
0      var el = document.getElementById('adminCourses'); el.innerHTML='';
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
    }    var adminList = loadCourses();