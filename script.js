(()=>{
'use strict';
const $=s=>document.querySelector(s),$$=s=>[...document.querySelectorAll(s)];
const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const fmt=x=>String(x).replace(/\B(?=(\d{3})+(?!\d))/g,',')+' m';
const sub=v=>v.replace(/\d/g,d=>'₀₁₂₃₄₅₆₇₈₉'[d]);

/* ===== DATOS DEL PROYECTO (edítalos aquí) ===== */
const TIPOS={
  carnes:  {n:'Carnes y parrilla',         c:'#E4572E'},
  italiana:{n:'Comida italiana',           c:'#7BC96F'},
  mariscos:{n:'Mariscos',                  c:'#3FA7D6'},
  cafe:    {n:'Café y repostería',         c:'#B889F0'},
  rapida:  {n:'Hamburguesas y sándwiches', c:'#F4B942'}
};

const N=[
  {id:'R1',name:'Ristorante Italiano Il Pomodoro',s:'Il Pomodoro',dir:'4ª Calle 8-40, Zona 1',t:'italiana',x:320,y:80},
  {id:'R2',name:'Monte Alto Restaurante',s:'Monte Alto',dir:'5ª Avenida 6-46, Zona 1',t:'cafe',x:220,y:260},
  {id:'R3',name:'Casa Brava',s:'Casa Brava',dir:'8ª Calle A 11-70, Zona 1',t:'carnes',x:440,y:350},
  {id:'R4',name:'Coffee 8',s:'Coffee 8',dir:'1 calle 6-73, Zona 8',t:'cafe',x:360,y:230},
  {id:'R5',name:'Casa de Asados',s:'Casa de Asados',dir:'4ª Calle 5-20, Zona 1',t:'carnes',x:570,y:280},
  {id:'R6',name:'Restaurante Puerto Escondido',s:'Puerto Escondido',dir:'Sector 6, Cambote, Zona 11',t:'mariscos',x:70,y:400},
  {id:'R7',name:'Café La Tinaja',s:'La Tinaja',dir:'4ª Calle 6-51, Zona 1',t:'cafe',x:460,y:70},
  {id:'R8',name:'Restaurante Lekaf',s:'Lekaf',dir:'6ª Calle 6-40, Zona 1',t:'rapida',x:560,y:140}
].sort((a,b)=>a.id<b.id?-1:1);

const E=[ 
  ['R1','R2',900],['R1','R4',850],['R1','R8',400],['R2','R3',1400],['R2','R7',700],['R3','R4',1000],
  ['R3','R5',1000],['R4','R5',350],['R5','R6',3100],['R6','R7',3800],['R7','R8',650]
];
const EJEMPLO=['R6','R5','R3','R2','R7','R8','R1','R4'];

/* ===== MODELO ===== */
const ids=N.map(o=>o.id), n=ids.length, pos=Object.fromEntries(N.map(o=>[o.id,o]));
const col=v=>TIPOS[pos[v].t].c;
const key=(a,b)=>a<b?a+'|'+b:b+'|'+a;
const W=new Map(E.map(([a,b,d])=>[key(a,b),d]));
const adj=Object.fromEntries(ids.map(v=>[v,[]]));
E.forEach(([a,b,d])=>{adj[a].push([b,d]);adj[b].push([a,d])});
ids.forEach(v=>adj[v].sort((x,y)=>x[0]<y[0]?-1:1));
const deg=v=>adj[v].length;

/* ===== BACKTRACKING ===== */
function search(start,cyc){
  const res=[],path=[start],seen=new Set(path);let calls=0;
  (function dfs(u){
    calls++;
    if(path.length===n){
      if(!cyc)res.push(path.slice());
      else if(W.has(key(u,start)))res.push([...path,start]);
      return;
    }
    for(const [v] of adj[u])if(!seen.has(v)){seen.add(v);path.push(v);dfs(v);path.pop();seen.delete(v)}
  })(start);
  return {res,calls};
}
const legs=r=>r.slice(1).map((v,i)=>({a:r[i],b:v,d:W.get(key(r[i],v))}));
const total=r=>legs(r).reduce((s,l)=>s+l.d,0);
const valid=(r,cyc)=>{
  const b=cyc?r.slice(0,-1):r;
  return b.length===n&&new Set(b).size===n&&r.slice(1).every((v,i)=>W.has(key(r[i],v)))&&(!cyc||r[0]===r[r.length-1]);
};
const expr=r=>legs(r).map(l=>l.d).join(' + ');

/* ===== SECCIONES ESTÁTICAS ===== */
const sd=ids.reduce((s,v)=>s+deg(v),0), md=Math.min(...ids.map(deg));
const fact=k=>k<2?1:k*fact(k-1);
const conn=(()=>{const s=new Set([ids[0]]),q=[ids[0]];while(q.length){const u=q.pop();adj[u].forEach(([v])=>{if(!s.has(v)){s.add(v);q.push(v)}})}return s.size===n})();
let ore=true;
for(let i=0;i<n;i++)for(let j=i+1;j<n;j++)if(!W.has(key(ids[i],ids[j]))&&deg(ids[i])+deg(ids[j])<n)ore=false;
const stats=ids.map(v=>({v,p:search(v,false).res.length,c:search(v,true).res.length}));
const nCyc=stats[0].c/2;
const dot=c=>`<span class="dot" style="background:${c}"></span>`;

$('#gn').textContent=n; $('#gm').textContent=E.length;
$('#tv').innerHTML='<tr><th>Vértice</th><th>Restaurante</th><th>Dirección</th><th>Tipo</th><th>Grado</th></tr>'+N.map(o=>`<tr><td>${sub(o.id)}</td><td>${esc(o.name)}</td><td>${esc(o.dir)}</td><td>${dot(col(o.id))}${TIPOS[o.t].n}</td><td class="num">${deg(o.id)}</td></tr>`).join('');
$('#te').innerHTML='<tr><th>#</th><th>Arista</th><th>Metros</th></tr>'+E.map(([a,b,d],k)=>`<tr><td>${k+1}</td><td>{${sub(a)}, ${sub(b)}}</td><td class="num">${d}</td></tr>`).join('');
const mat=f=>'<tr><th></th>'+ids.map(v=>`<th>${sub(v)}</th>`).join('')+'</tr>'+ids.map(r=>`<tr><th>${sub(r)}</th>${ids.map(c=>f(r,c)).join('')}</tr>`).join('');
$('#tm').innerHTML=mat((r,c)=>W.has(key(r,c))?`<td class="u">${W.get(key(r,c))}</td>`:'<td class="z">·</td>');
$('#a01').innerHTML='<tr><th>Vértices</th>'+ids.map(v=>`<th>${sub(v)}</th>`).join('')+'<th>Grado deg(v)</th></tr>'+ids.map(r=>`<tr><th>${sub(r)}</th>${ids.map(c=>{const u=W.has(key(r,c));return `<td class="${u?'u':'z'}">${+u}</td>`}).join('')}<td><b>${deg(r)}</b></td></tr>`).join('');

$('#dif').innerHTML=`<tr><th></th><th>Camino hamiltoniano</th><th>Ciclo hamiltoniano</th></tr>
<tr><td>Vértices</td><td>${n}, todos distintos</td><td>${n}, todos distintos</td></tr>
<tr><td>Aristas usadas</td><td>${n-1}</td><td>${n} (incluye la arista de cierre)</td></tr>
<tr><td>Extremos</td><td>Inicio y final distintos; no tienen que ser adyacentes</td><td>El final es adyacente al inicio y la ruta regresa a él (se lista el inicio otra vez al cerrar)</td></tr>
<tr><td>Relación</td><td colspan="2">Si hay un ciclo hamiltoniano, quitando una arista queda un camino hamiltoniano. El recíproco es falso: puede haber camino y no haber ciclo.</td></tr>`;

$('#adj').innerHTML='<thead><tr><th>Vértice</th><th>Vecinos (Metros)</th><th>Grado</th></tr></thead><tbody>'+ids.map(v=>`<tr><td>${sub(v)}</td><td>${adj[v].map(([u,d])=>`${sub(u)} (${d})`).join(', ')}</td><td class="num">${deg(v)}</td></tr>`).join('')+`</tbody><tfoot><tr><th colspan="2">Suma de grados</th><th class="num">${sd}</th></tr></tfoot>`;
$('#hand').innerHTML=`Σ deg(v) = ${ids.map(deg).join(' + ')} = <b>${sd}</b> · |E| = <b>${E.length}</b> · 2|E| = <b>${2*E.length}</b> → ${sd===2*E.length?'coinciden ✓':'NO coinciden ✗'}`;
$('#cond').innerHTML=[
  `<b>Conexo</b> (necesario): ${conn?'sí, hay trayecto entre cualquier par de restaurantes.':'no; sin conexión no puede haber camino hamiltoniano.'}`,
  `<b>Grado mínimo δ ≥ 2</b> (necesario para un ciclo): δ = ${md} → ${md>=2?'se cumple.':'no se cumple; no hay ciclo.'}`,
  `<b>Teorema de Dirac</b> (suficiente): si δ ≥ n/2 existe ciclo hamiltoniano. Aquí δ = ${md} y n/2 = ${n/2}: ${md>=n/2?'se cumple, luego existe un ciclo.':'no se cumple, así que el teorema no concluye nada (no es condición necesaria).'}`,
  `<b>Teorema de Ore</b> (suficiente): si deg(u)+deg(v) ≥ n para todo par no adyacente, hay ciclo. ${ore?'Se cumple.':'No se cumple, tampoco concluye nada.'}`,
  `<b>Cantidad posible</b>: el grafo completo K<sub>${n}</sub> tendría (n−1)!/2 = ${fact(n-1)/2} ciclos distintos; este grafo, con solo ${E.length} de ${n*(n-1)/2} aristas posibles, tiene <b>${nCyc}</b>.`,
  `Como la búsqueda por backtracking es exhaustiva, el resultado es definitivo: ${nCyc?'<b>sí existe</b> ciclo hamiltoniano.':'<b>no existe</b> ciclo hamiltoniano.'}`
].map(t=>`<li>${t}</li>`).join('');

$('#res').innerHTML='<thead><tr><th>Inicio</th><th>Caminos hamiltonianos</th><th>Ciclos (contando sentido)</th><th>Ciclos distintos</th></tr></thead><tbody>'+stats.map(s=>`<tr><td>${sub(s.v)}</td><td class="num">${s.p}</td><td class="num">${s.c}</td><td class="num">${s.c/2}</td></tr>`).join('')+'</tbody>';
$('#resnote').textContent=`Cada ciclo pasa por todos los vértices, así que su cantidad es la misma desde cualquier inicio, y aparece dos veces (una por sentido). Cada camino se cuenta desde ambos extremos: caminos distintos sin importar el sentido = ${stats.reduce((s,x)=>s+x.p,0)/2}.`;

const best=cyc=>ids.flatMap(v=>search(v,cyc).res).map(p=>({p,d:total(p)})).sort((a,b)=>a.d-b.d)[0];
const goBtn=(s,m,p='')=>`<button type="button" data-go="${s}:${m}:${p}">Ver en el grafo</button>`;
const bestCyc=best(true);
$('#best').innerHTML=[[bestCyc,'Ciclo más corto','c'],[best(false),'Camino más corto','p']].map(([b,t,m])=>
  b?`<p><b>${t}:</b> ${b.p.join(' → ')}<br>${expr(b.p)} = <b>${fmt(b.d)}</b> ${goBtn(b.p[0],m,b.p.join())}</p>`:`<p><b>${t}:</b> no existe.</p>`
).join('')+(valid(EJEMPLO,false)
  ?`<p><b>Camino propuesto en el modelo del grupo:</b> ${EJEMPLO.join(' → ')}<br>Verificación: 8 vértices distintos y 7 aristas existentes ✓ · ${expr(EJEMPLO)} = <b>${fmt(total(EJEMPLO))}</b> ${goBtn(EJEMPLO[0],'p',EJEMPLO.join())}</p>`
  :`<p><b>Camino propuesto en el modelo del grupo:</b> ${EJEMPLO.join(' → ')} no es válido con las aristas actuales ✗</p>`);

/* ===== DIBUJO DEL GRAFO (SVG) ===== */
const pill=(k,d,x,y)=>{const w=String(d).length*7+14;return `<g class="lab" data-k="${k}" transform="translate(${x} ${y})"><rect x="${-w/2}" y="-9" width="${w}" height="18" rx="9"/><text>${d}</text></g>`};
function graphMarkup(mini,cycle){
  const gid='grid'+(mini?'m':'b');
  const cy=new Map();
  if(mini&&cycle)legs(cycle).forEach((l,i)=>cy.set(key(l.a,l.b),i));
  const edges=E.map(([a,b,d])=>{
    const p=pos[a],q=pos[b],k=key(a,b),c=cy.has(k);
    return `<g class="edge${c?' cy':''}" data-k="${k}"${c?` style="--d:${(.6+cy.get(k)*.55).toFixed(2)}s"`:''}><title>${a}–${b}: ${d} m (verificado)</title><line class="base" x1="${p.x}" y1="${p.y}" x2="${q.x}" y2="${q.y}"/><line class="hl" pathLength="1" x1="${p.x}" y1="${p.y}" x2="${q.x}" y2="${q.y}"/></g>`;
  }).join('');
  const labs=mini?'':E.map(([a,b,d])=>pill(key(a,b),d,(pos[a].x+pos[b].x)/2,(pos[a].y+pos[b].y)/2)).join('');
  const nodes=N.map(o=>`<g class="node" data-v="${o.id}" ${mini?'':`tabindex="0" role="button" aria-label="${esc(o.name)}"`} transform="translate(${o.x} ${o.y})" style="--c:${col(o.id)}"><title>${esc(o.name)}</title><circle class="halo" r="27"/><circle class="ring" r="31"/><circle class="c" r="20"/><text class="lt">${o.id}</text><text class="nm" y="-30">${esc(o.s)}</text>${mini?'':'<text class="tag" x="30" y="4">inicio</text>'}</g>`).join('');
  const brujula=mini?'':`<g transform="translate(606 418)" fill="#fff" fill-opacity=".75"><path d="M0-17 6 6 0 2-6 6Z"/><text y="22" font-family="system-ui,sans-serif" font-size="11" font-weight="700" text-anchor="middle">N</text></g>`;
  
  // Título movido a la esquina superior izquierda (x=140, y=40) para que no tape a R1
  const titulo = mini ? '' : `<g transform="translate(140 40)"><rect x="-70" y="-15" width="140" height="30" rx="15" fill="#fff" filter="drop-shadow(0 2px 4px rgba(0,0,0,0.15))"/><text font-family="system-ui,sans-serif" font-size="14" font-weight="700" fill="#14262C" text-anchor="middle" dominant-baseline="central">Huehuetenango</text></g>`;
  
  return `<defs><pattern id="${gid}" width="40" height="40" patternUnits="userSpaceOnUse"><path d="M40 0H0V40" fill="none" stroke="#fff" stroke-opacity=".06"/></pattern></defs><rect width="640" height="460" fill="url(#${gid})"/>${edges}${labs}${nodes}${brujula}${titulo}`;
}

/* ===== PORTADA ===== */
$('#hechos').innerHTML=`<b>${n}</b> restaurantes, <b>${E.length}</b> conexiones y <b>${nCyc}</b> ciclo${nCyc===1?'':'s'} hamiltoniano${nCyc===1?'':'s'} distinto${nCyc===1?'':'s'}${nCyc?'':' (ninguno)'}.`;
$('#hero').innerHTML=graphMarkup(true,bestCyc&&bestCyc.p);
$('#heroCap').textContent=bestCyc?`Ciclo hamiltoniano más corto: ${bestCyc.p.join(' → ')}, ${fmt(bestCyc.d)} (verificado). Posiciones esquemáticas.`:'No existe ciclo hamiltoniano con las aristas actuales.';

/* ===== VISUALIZACIÓN ===== */
$('#svg').innerHTML=graphMarkup(false);
$('#ini').innerHTML=ids.map(v=>`<option>${v}</option>`).join('');
$('#leyenda').innerHTML=Object.values(TIPOS).map(t=>`<span>${dot(t.c)}${t.n}</span>`).join('');
const EL={}; $$('#svg .edge').forEach(e=>EL[e.dataset.k]=e);

const S={start:ids[0],cyc:true,sols:[],i:0,step:0,sel:ids[0],timer:null,calls:0};
const route=()=>S.sols[S.i]?S.sols[S.i].p:[S.start];
const maxStep=()=>route().length-1;

function stop(){clearInterval(S.timer);S.timer=null;$('#play').textContent='Reproducir'}
function run(){
  stop();
  const r=search(S.start,S.cyc);S.calls=r.calls;
  S.sols=r.res.map(p=>({p,d:total(p)})).sort((a,b)=>a.d-b.d||a.p.join('').localeCompare(b.p.join('')));
  S.i=0;S.step=0;renderSols();draw();
}
function setup(start,cyc){S.start=start;S.sel=start;S.cyc=cyc;$('#ini').value=start;$('#modo').value=cyc?'c':'p';run()}
function info(){
  const v=S.sel,o=pos[v],t=TIPOS[o.t],r=route(),k=r.indexOf(v);
  $('#info').style.setProperty('--c',t.c);
  $('#info').innerHTML=`<h4>${esc(o.name)}</h4><span class="chip" style="--c:${t.c}">${t.n}</span><p style="margin:8px 0 0">Vértice ${sub(v)} · ${esc(o.dir)}<br>Grado <b>${deg(v)}</b>${S.sols.length&&k>=0?` · en la ruta actual: ${k===0?'inicio':'paso '+k}`:''}</p><ul>${adj[v].map(([u,d])=>`<li>${sub(v)}–${sub(u)} (${esc(pos[u].s)}):${d} m</li>`).join('')}</ul><button type="button" id="fijar" ${v===S.start?'disabled':''}>Fijar como inicio</button>`;
}
function renderSols(){
  $('#sols').innerHTML=S.sols.map((s,i)=>`<li><button type="button" data-i="${i}" class="${i===S.i?'sel':''}"><span>${i+1}. ${s.p.join('→')}</span><span>${fmt(s.d)}</span></button></li>`).join('')||'<li style="padding:8px;font:14px var(--sans)">Sin soluciones.</li>';
  $('#nsol').textContent=S.sols.length?`${S.sols.length} encontradas, ordenadas por distancia · llamadas recursivas: ${S.calls}${S.cyc?` · equivalen a ${S.sols.length/2} ciclos distintos (cada uno en dos sentidos)`:''}`:`Sin soluciones · llamadas recursivas: ${S.calls}`;
}
function draw(){
  const sol=S.sols[S.i], r=route(), max=maxStep(), cur=r[S.step];
  const used=new Set();
  for(let i=0;i<S.step;i++){
    const a=pos[r[i]],b=pos[r[i+1]],k=key(r[i],r[i+1]),hl=EL[k].querySelector('.hl');
    used.add(k);hl.setAttribute('x1',a.x);hl.setAttribute('y1',a.y);hl.setAttribute('x2',b.x);hl.setAttribute('y2',b.y);
  }
  const vis=new Set(r.slice(0,S.step+1)), last=S.step>0?key(r[S.step-1],r[S.step]):'';
  $$('#svg .edge').forEach(e=>{e.classList.toggle('on',used.has(e.dataset.k));e.classList.toggle('cur',e.dataset.k===last)});
  $$('#svg .lab').forEach(e=>e.classList.toggle('on',used.has(e.dataset.k))); $$
('#svg .node').forEach(e=>{const v=e.dataset.v;e.classList.toggle('vis',vis.has(v));e.classList.toggle('cur',v===cur);e.classList.toggle('start',v===S.start);e.classList.toggle('sel',v===S.sel)});
  $('#ant').disabled=S.step===0; $('#sig').disabled=S.step>=max; $('#play').disabled=!sol;
  const L=legs(r);let acc=0;
  const rows=L.slice(0,S.step).map((l,i)=>{acc+=l.d;return `<tr><td>${i+1}</td><td>${l.a} → ${l.b}</td><td class="num">${l.d}</td><td class="num">${acc}</td></tr>`}).join('');
  $('#estado').innerHTML=sol?`<b>${S.cyc?'Ciclo':'Camino'} hamiltoniano</b> desde ${S.start} · solución ${S.i+1} de ${S.sols.length} · paso ${S.step} de ${max} · vértice actual <b>${cur}</b> · acumulado <b>${fmt(acc)}</b>`:`No existe ${S.cyc?'ciclo':'camino'} hamiltoniano desde ${S.start}.`;
  $('#ruta').innerHTML=sol?'Ruta: '+r.map((v,i)=>`<span style="${i<=S.step?'font-weight:700;border-bottom:3px solid '+col(v):'color:var(--mut)'}">${v}</span>`).join(' → '):'';
  $('#barfill').style.width=sol&&max?(S.step/max*100)+'%':'0';
  $('#prog').innerHTML=sol?r.map((v,i)=>`<button type="button" data-s="${i}" class="${i<S.step?'done':''}${i===S.step?' cur':''}" style="--c:${col(v)}" aria-label="Ir al paso ${i}">${v}</button>`).join(''):'';
  $('#calc').innerHTML=`<div class="scroll"><table><thead><tr><th>Paso</th><th>Arista</th><th>Metros</th><th>Acumulado (m)</th></tr></thead><tbody>${rows||'<tr><td colspan="4">Pulsa «Siguiente» para empezar el recorrido.</td></tr>'}</tbody></table></div>`+
    (sol?`<p>Recorrido completo: ${expr(r)} = <b>${fmt(sol.d)}</b></p><p>Vértices distintos: ${new Set(S.cyc?r.slice(0,-1):r).size} de ${n} · Aristas usadas: ${L.length} · Verificación: ${valid(r,S.cyc)?'correcta (no se repiten vértices y todas las aristas existen) ✓':'ERROR ✗'}</p>`:'');
  info();
}
function play(){
  if(S.timer)return stop();
  if(!S.sols.length)return;
  if(S.step>=maxStep())S.step=0;
  draw();$('#play').textContent='Pausar';
  S.timer=setInterval(()=>{S.step++;draw();if(S.step>=maxStep())stop()},1000);
}

$('#ini').onchange=e=>setup(e.target.value,S.cyc);
$('#modo').onchange=e=>setup(S.start,e.target.value==='c');
$('#buscar').onclick=run;
$('#reset').onclick=()=>{stop();S.step=0;draw()};
$('#ant').onclick=()=>{stop();if(S.step>0)S.step--;draw()};
$('#sig').onclick=()=>{stop();if(S.step<maxStep())S.step++;draw()};
$('#play').onclick=play;
$('#info').onclick=e=>{if(e.target.id==='fijar')setup(S.sel,S.cyc)};
$('#prog').onclick=e=>{const b=e.target.closest('[data-s]');if(!b)return;stop();S.step=+b.dataset.s;draw()};
$('#sols').onclick=e=>{const b=e.target.closest('[data-i]');if(!b)return;stop();S.i=+b.dataset.i;S.step=0;renderSols();draw()};

/* Lógica del Tooltip Flotante */
const tooltip = $('#nodo-tooltip');
const pick = e => {
  const g = e.target.closest('.node');
  if (g) {
    S.sel = g.dataset.v;
    draw();
    mostrarTooltip(g);
  } else {
    tooltip.classList.remove('visible');
  }
};

function mostrarTooltip(g) {
  const v = g.dataset.v; // R1, R2, etc.
  const o = pos[v];
  $('#tt-img').src = `Img/${v.toLowerCase()}.jpg`;
  $('#tt-nombre').textContent = o.s;
  
  const svgRect = $('#svg').getBoundingClientRect();
  const nodeRect = g.getBoundingClientRect();
  
  const top = nodeRect.top - svgRect.top - 120;
  const left = nodeRect.left - svgRect.left + (nodeRect.width / 2) - 70;
  
  tooltip.style.top = `${top}px`;
  tooltip.style.left = `${left}px`;
  tooltip.classList.add('visible');
}

$('#svg').addEventListener('click', pick);
$('#svg').addEventListener('mouseover', e => {
  const g = e.target.closest('.node');
  if (g) mostrarTooltip(g);
});
$('#svg').addEventListener('mouseout', e => {
  if (e.target.closest('.node') && !('ontouchstart' in window)) {
    tooltip.classList.remove('visible');
  }
});
$('#svg').addEventListener('keydown', e => {
  if(e.key === 'Enter' || e.key === ' '){ e.preventDefault(); pick(e); }
});

document.addEventListener('click',e=>{
  const g=e.target.closest('[data-go]');if(!g)return;
  const [s,m,p]=g.dataset.go.split(':');setup(s,m==='c');
  const i=S.sols.findIndex(x=>x.p.join()===p);
  if(i>=0){S.i=i;renderSols();draw()}
  $('#visualizacion').scrollIntoView(); });  /* ===== ÍNDICE LATERAL ===== */ if('IntersectionObserver' in window){ const links=$$('#nav a'),secs=links.map(a=>$(a.getAttribute('href')));
  const io=new IntersectionObserver(es=>es.forEach(en=>{
    if(en.isIntersecting)links.forEach(a=>a.classList.toggle('on',a.getAttribute('href')==='#'+en.target.id));
  }),{rootMargin:'-25% 0px -65% 0px'});
  secs.forEach(s=>io.observe(s));
}

/* ===== ANIMACIÓN DEL GRAFO INICIAL CON OBSERVER ===== */
if ('IntersectionObserver' in window) {
  const heroObserver = new IntersectionObserver((entries, obs) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('play-anim');
        obs.unobserve(entry.target); 
      }
    });
  }, { threshold: 0.3 }); 
  
  if ($('#hero')) heroObserver.observe($('#hero'));
}

/* ===== INICIO ===== */
run();
})();