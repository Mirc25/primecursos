// Debug script to run parseCoursePlain against the user's sample
function parseCoursePlain(text){
  var lines = String(text||'').split(/\r?\n/).map(function(l){ return l.replace(/\t/g,' ').trim(); });
  var course = { id: Date.now()%1000000, title:'', category:'', short_description:'', description:'', price:0, image:null, modules:[], evaluation:[] };
  var curMod = null, curSub = null, mode='';
  for(var i=0;i<lines.length;i++){
    var L = lines[i]; if(L===undefined) continue; var raw = L;
    if(L === '') { continue; }
    // Headers
    if(/^TITULO:\s*/i.test(L)){ course.title = L.replace(/^TITULO:\s*/i,'').trim(); continue; }
    if(/^CATEGORIA:\s*/i.test(L)){ course.category = L.replace(/^CATEGORIA:\s*/i,'').trim(); continue; }
    if(/^DESCRIPCION_CORTA:\s*/i.test(L)){ course.short_description = L.replace(/^DESCRIPCION_CORTA:\s*/i,'').trim(); continue; }
    if(/^DESCRIPCION:\s*/i.test(L)){ course.description += (course.description? '\n' : '') + L.replace(/^DESCRIPCION:\s*/i,'').trim(); mode='description'; continue; }
    if(/^PRECIO:\s*/i.test(L)){ course.price = parseFloat(L.replace(/^PRECIO:\s*/i,'').trim())||0; continue; }

    // Module
    var mMatch = L.match(/^MODULO:\s*([0-9]+(?:\.[0-9]+)?)?\.?\s*-?\s*(.*)$/i);
    if(mMatch){ var mnum = mMatch[1] || (course.modules.length+1); var mtitle = (mMatch[2]||'').trim() || ('Módulo '+mnum); curMod = { module_number: mnum, module_title: mtitle, submodules: [], evaluation: [] }; course.modules.push(curMod); curSub = null; mode='modules'; continue; }

    // Submodule
    var sMatch = L.match(/^SUBMODULO:\s*([0-9]+(?:\.[0-9]+)?)?\.?\s*-?\s*(.*)$/i);
    if(sMatch){ var snum = sMatch[1] || ((curMod? (curMod.submodules.length+1) : (course.modules.length+1))+'' ); var stitle = (sMatch[2]||'').trim() || ('Sub '+snum); curSub = { submodule_number: snum, title: stitle, content:'', image: null }; if(!curMod){ curMod = { module_number: course.modules.length+1, module_title:'Módulo '+(course.modules.length+1), submodules: [] }; course.modules.push(curMod); } curMod.submodules.push(curSub); mode='submodule'; continue; }

    // Image marker
    if(/^(IMAGEN|IMAGE):\s*/i.test(L)){
      var v = L.replace(/^(IMAGEN|IMAGE):\s*/i,'').trim(); if(v==='<>') v = ''; if(curSub){ curSub.image = v||null; } else { course.image = v||null; } continue;
    }

    // Content
    if(/^CONTENIDO:\s*/i.test(L)){ var v = L.replace(/^CONTENIDO:\s*/i,'').trim(); if(curSub){ curSub.content += (curSub.content? '\n' : '') + v; } else { course.description += (course.description? '\n' : '') + v; } mode='submodule'; continue; }

    // Evaluation section
    if(/^\+EVALUACION\+/i.test(L) || /^EVALUACION/i.test(L)){ mode='evaluation'; continue; }
    if(mode==='evaluation' && /^P:\s*/i.test(L)){
      var q = L.replace(/^P:\s*/i,'').trim(); var opts = []; var ans=null; var j=i+1;
      for(;j<lines.length;j++){ var nx = lines[j]; if(!nx) break; var mo = nx.match(/^([A-D])[\)\:]\s*(.*)$/); if(!mo) break; var key=mo[1], txt=mo[2]||''; var isCorrect = /\*/.test(txt); if(isCorrect) txt = txt.replace(/\*/g,'').trim(); opts.push({key:key,text:txt}); if(isCorrect) ans=key; }
      i = j-1; var qobj = { question:q, options:opts, answer:ans }; if(curMod){ curMod.evaluation = curMod.evaluation || []; curMod.evaluation.push(qobj); } else { course.evaluation.push(qobj); } continue;
    }

    // fallback lines appended to description or submodule content
    if(mode==='description'){ course.description += (course.description? '\n' : '') + raw; }
    else if(mode==='submodule' && curSub){ curSub.content += (curSub.content? '\n' : '') + raw; }
  }
    // Heuristic: if title contains description text (long title line), try to split and extract embedded price
    try{
      if(!course.description && course.title && course.title.length > 80){
        var pMatchT = course.title.match(/\bPRECIO:\s*([0-9]+(?:[\.,][0-9]+)?)/i);
        if(pMatchT && pMatchT[1]){ course.price = parseFloat(pMatchT[1].replace(',','.'))||course.price; course.title = course.title.replace(pMatchT[0],'').trim(); }
        var splitPosT = course.title.indexOf('. ', 40);
        if(splitPosT > 0){ var tpart = course.title.slice(0, splitPosT+1).trim(); var dpart = course.title.slice(splitPosT+2).trim(); if(dpart){ course.title = tpart; course.description = dpart; } }
      }
    }catch(e){}
  return course;
}

var sample = `TITULO: SEO Técnico Avanzado: Auditoría, Core Web Vitals y Arquitectura Crítica
CATEGORIA: SEO de Alto Nivel
DESCRIPCION_CORTA: Dominio de la velocidad, rastreo, indexación, y datos estructurados para resolver problemas críticos que impactan la visibilidad de grandes sitios web.
DESCRIPCION: Este curso lo equipará con las habilidades de un Consultor SEO Técnico de alto nivel, yendo mucho más allá del SEO On-Page tradicional. Aprenderá a diagnosticar y solucionar problemas de rendimiento (Core Web Vitals), optimizar la eficiencia del rastreo (Crawl Budget), asegurar la correcta indexación de contenido dinámico (JavaScript) e implementar un esquema de datos estructurados avanzado (Schema Markup). Las agencias y grandes empresas valoran profundamente esta experiencia para escalar su tráfico orgánico y asegurar que la arquitectura del sitio no obstaculice el crecimiento. El foco está en la optimización del código, el servidor y la experiencia de usuario (UX) para complacer a los motores de búsqueda modernos. PRECIO: 399.99

MODULO: 1. Fundamentos Técnicos, Core Web Vitals y Herramientas

SUBMODULO: 1.1 El Papel Crítico del SEO Técnico en la Estrategia Moderna

CONTENIDO:

El SEO Técnico es la columna vertebral de cualquier estrategia de crecimiento orgánico a escala, asegurando que los motores de búsqueda puedan rastrear, indexar e interpretar el contenido de manera eficiente. Su importancia ha crecido exponencialmente con la migración de sitios web a frameworks basados en JavaScript y el enfoque de Google en la Experiencia de Usuario (UX) a través de los Core Web Vitals (CWV). Si la base técnica es defectuosa, todo el esfuerzo de contenido y link building será inútil o tendrá un impacto limitado, ya que Google simplemente no podrá acceder o clasificar correctamente las páginas. Dominar el SEO Técnico implica interactuar con desarrolladores y entender la infraestructura del servidor, los sistemas de gestión de contenido (CMS) y las redes de entrega de contenido (CDN). Es la disciplina que transforma un sitio web funcional en un sitio web optimizado para el rendimiento en la búsqueda.

IMAGEN:

<>

SUBMODULO: 1.2 Introducción a los Core Web Vitals (CWV) como Factor de Ranking

CONTENIDO:

Los Core Web Vitals (CWV) son un conjunto de métricas estandarizadas por Google que miden la experiencia de usuario en términos de velocidad, estabilidad y capacidad de respuesta de la página web. Desde 2021, son un factor de clasificación crucial (Page Experience Signal) para el posicionamiento en los resultados de búsqueda. El objetivo de Google es promover sitios que ofrezcan una experiencia de carga y navegación fluida a sus usuarios. Las tres métricas principales son: LCP (Largest Contentful Paint), que mide la velocidad de carga; INP (Interaction to Next Paint), que mide la interactividad y capacidad de respuesta; y CLS (Cumulative Layout Shift), que mide la estabilidad visual durante la carga. Monitorear y optimizar estas métricas es esencial para mantener y mejorar el ranking orgánico.

IMAGEN:

<>

SUBMODULO: 1.3 LCP (Largest Contentful Paint): Medición y Umbrales

CONTENIDO:

El LCP (Largest Contentful Paint) mide el tiempo que tarda en cargarse el elemento de contenido más grande visible dentro de la ventana del navegador (viewport). Este elemento suele ser una imagen principal, un bloque de texto grande o un video de héroe, y es una proxy para la velocidad de carga percibida por el usuario. El umbral considerado "Bueno" por Google es de 2.5 segundos o menos. Un LCP lento a menudo es causado por tiempos de respuesta lentos del servidor (TTFB), recursos que bloquean el renderizado (CSS y JavaScript) o imágenes no optimizadas de gran tamaño. La optimización del LCP debe ser la primera prioridad de velocidad, ya que impacta directamente en la percepción de velocidad del usuario.

IMAGEN:

<>

SUBMODULO: 1.4 INP (Interaction to Next Paint): La Métrica de Interactividad

CONTENIDO:

El INP (Interaction to Next Paint) es la métrica de interactividad y capacidad de respuesta que reemplazó a FID (First Input Delay). INP mide el tiempo que transcurre desde que un usuario inicia una interacción (ej: clic en un botón, tap en un elemento) hasta que el navegador dibuja el siguiente frame visual. Un INP lento indica que el navegador está demasiado ocupado ejecutando scripts o procesando tareas para responder de manera eficiente a la acción del usuario, resultando en una experiencia lenta y frustrante. El umbral "Bueno" es de 200 milisegundos o menos. Esta métrica se ve directamente afectada por la ejecución ineficiente de JavaScript y la sobrecarga de la Main Thread del navegador.

IMAGEN:

<>

SUBMODULO: 1.5 CLS (Cumulative Layout Shift): Estabilidad Visual

CONTENIDO:

El CLS (Cumulative Layout Shift) mide la estabilidad visual de una página web, cuantificando los cambios inesperados en el diseño que ocurren durante la carga. Un CLS alto se manifiesta cuando elementos de la página (ej: imágenes, anuncios, botones) se mueven repentinamente después de que el usuario ha comenzado a interactuar, causando que haga clic en el lugar equivocado. El umbral "Bueno" es una puntuación de 0.1 o menos. Las causas más comunes incluyen imágenes sin dimensiones (ancho y alto definidos), anuncios que se cargan tarde y que empujan el contenido principal, y la inyección dinámica de contenido con JavaScript después de que la página inicial se ha renderizado. Corregir el CLS es crucial para mejorar la usabilidad.

IMAGEN:

<>

SUBMODULO: 1.6 Herramientas de Medición: Lab Data (Lighthouse) vs. Field Data (CrUX)

CONTENIDO:

Existen dos tipos principales de datos para CWV. 1. Lab Data: Recopilados en un entorno controlado (simulado) utilizando herramientas como Lighthouse (integrado en Chrome DevTools) o PageSpeed Insights (PSI). Es útil para el diagnóstico y la depuración, ya que proporciona informes detallados del código fuente. 2. Field Data (Datos de Campo): Recopilados de usuarios reales en el campo a través del Chrome User Experience Report (CrUX), que se alimenta a Google Search Console (GSC) y PSI. Los Field Data reflejan la experiencia real del usuario (dispositivos, ubicaciones, velocidades de red) y son los que Google utiliza para la clasificación. Es crucial que los datos de Lab coincidan con los de Field para asegurar que las correcciones sean efectivas.

IMAGEN:

<>

SUBMODULO: 1.7 Google Search Console (GSC) y el Informe de Core Web Vitals

CONTENIDO:

Google Search Console (GSC) es la herramienta de diagnóstico más importante para el SEO Técnico, ya que reporta los Field Data (CrUX) de tu sitio web que utiliza Google para clasificar. El Informe de Core Web Vitals en GSC clasifica tus URLs en tres categorías: "Deficiente", "Necesita Mejora" y "Bueno", basándose en el cumplimiento de los tres umbrales de CWV. Es crucial priorizar la solución de los problemas de las URLs que caen en la categoría "Deficiente" o "Necesita Mejora", ya que son las que están penalizando la experiencia de usuario. GSC también permite validar las correcciones después de la optimización del código.

IMAGEN:

<>

+EVALUACION+

P: ¿Cuál es el umbral considerado "Bueno" por Google para la métrica LCP (Largest Contentful Paint)? A) 4.0 segundos o menos. B) 2.5 segundos o menos. * C) 0.1 o menos. D) 200 milisegundos o menos.

P: ¿Qué tipo de datos de Core Web Vitals son utilizados por Google para la clasificación orgánica? A) Lab Data (Lighthouse). B) Datos de Campo (Field Data / CrUX). * C) PageSpeed Insights simulado. D) Velocidad de conexión del desarrollador.

P: ¿Qué mide la métrica CLS (Cumulative Layout Shift)? A) La velocidad de carga inicial. B) La interactividad y capacidad de respuesta. C) La estabilidad visual de la página durante la carga. * D) El tiempo de respuesta del servidor (TTFB).

P: ¿Cuál es la causa más común de un LCP lento? A) Un CLS muy bajo. B) Imágenes no optimizadas de gran tamaño y recursos que bloquean el renderizado. * C) La inyección dinámica de contenido después de la carga. D) Un INP rápido.

P: ¿Qué herramienta proporciona los Field Data (Datos de Campo) de CWV a GSC? A) Chrome DevTools. B) Lighthouse. C) Chrome User Experience Report (CrUX). * D) PageSpeed Insights.

P: La métrica INP (Interaction to Next Paint) reemplazó a: A) CLS. B) LCP. C) FID (First Input Delay). * D) TTFB.

P: El SEO Técnico ha crecido en importancia debido a: A) La disminución del tráfico orgánico. B) La migración a JavaScript y el enfoque de Google en la Experiencia de Usuario (CWV). * C) El fin del link building. D) La simplificación de los CMS.

MODULO: 2. Rastreo e Indexación Avanzada (Crawling & Indexation)

SUBMODULO: 2.1 El Modelo de Rastreo de Google y el Crawl Budget

... (truncated)
`;

var parsed = parseCoursePlain(sample);
console.log(JSON.stringify(parsed, null, 2));
