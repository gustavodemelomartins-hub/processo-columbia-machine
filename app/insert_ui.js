__INSERT_DOMAIN__
const CAVITY_DATA=__CAVITY_DATA__;
const cavitySelection={id:null};let cavityMeshes=[];
// Insert life studies (passes on facing, cavities on O003) share one edge-cycle domain.
const INSERT_STUDIES=OPERATOR_CONFIG.insert_usage.studies||[];
const insertUsage=(toolId=3)=>InsertUsageDomain.get(tooling.store,tooling.jobMachineId,toolId);
function currentInsertStudy(){if(state.operation===2)return null;const file=displayedProgramFile();return INSERT_STUDIES.find(st=>st.program===file)||null;}
function insertUnitWord(st,n){const u=InsertUsageDomain.UNITS[st.unit];return n===1?u.one:u.many;}
function insertContext(st){return {unit:st.unit,context:{operation:state.operation+1,program:st.program,stage:state.phase,reductionPerPassMm:st.unit==='pass'?number(state.faceTiming.reductionPerPassMm):null},jobId:tooling.jobId,cavityId:cavitySelection.id};}
// One-click record shared by the stage panel and the insert life tab. Never blocks the operation.
function recordInsert(st,action){
 const opts=insertContext(st);
 const ok=action==='undo'?InsertUsageDomain.undo(tooling.store,tooling.jobMachineId,st.tool_id):InsertUsageDomain.record(tooling.store,tooling.jobMachineId,st.tool_id,action==='replace'||action==='turn'?'change':action,{...opts,kind:action==='replace'?'replace':'turn'});
 if(ok)persist();return ok;
}
function insertCycleLine(st,c){const n=InsertUsageDomain.cycleCount(c);return 'Aresta '+c.cycle+' · '+n+' '+insertUnitWord(st,n)+(Number.isFinite(c.removedMm)?' · '+fmt(c.removedMm)+' mm removidos':'');}
const cavityEntry=id=>CAVITY_DATA.sha256===cncData?.['O003.TAP']?.meta.sha256?CAVITY_DATA.entries.find(e=>e.cavityId===Number(id)&&e.geometricMatch&&e.firstG1&&e.wcs.length===1&&e.wcs[0]==='G54'&&[e.z10Before,e.positionXY,e.firstG1,e.z10After].filter(Boolean).every(r=>cncData['O003.TAP'].source_lines[r.line-1]===r.code)):null;
function selectCavity(id){if(cncFile!=='O003.TAP'||!cavityEntry(id))return;stopAnimation();cavitySelection.id=Number(id);updateCavityHighlight();renderCavityConsultation();tab('details');const panel=$('detailsPanel'),node=$('selectedCavityLines');if(node&&node.getBoundingClientRect().bottom>panel.getBoundingClientRect().bottom)panel.scrollTop+=node.getBoundingClientRect().top-panel.getBoundingClientRect().top-12;}
function updateCavityHighlight(){for(const mesh of cavityMeshes){mesh.visible=cncFile==='O003.TAP'&&state.operation===1;mesh.material.opacity=mesh.userData.cavityId===cavitySelection.id?0.22:0;}draw();}
const insertStudyUI={draft:null,draftCycle:null,message:'',error:false};
function insertKindLabel(kind){return kind==='turn'?'Virada':kind==='replace'?'Troca':'Virada/troca (legado)';}
function insertStudyMarkup(st){
 const u=insertUsage(st.tool_id),stats=InsertUsageDomain.statistics(tooling.store,tooling.jobMachineId,st.tool_id),total=insertStudyUI.draftCycle===u.cycle&&insertStudyUI.draft!==null?insertStudyUI.draft:u.count;
 const many=InsertUsageDomain.UNITS[st.unit].many,pass=st.unit==='pass',last=u.cycles.at(-1),pips=Math.min(12,u.count),threshold=st.review_after;
 const reduction=number(state.faceTiming.reductionPerPassMm);
 return '<section class="insert-counter" aria-label="Vida do insert T'+st.tool_id+'"><div class="insert-study-heading"><span>Aresta '+u.cycle+' · T'+st.tool_id+' '+esc(toolNames[st.tool_id]||'')+'</span><strong id="insertCount" aria-live="polite">'+u.count+'</strong></div>'+
  '<p class="insert-count-label">'+(pass?'Passes nesta aresta':'Cavidades nesta aresta')+(pass&&reduction>0?' · '+fmt(u.count*reduction)+' mm removidos até agora':'')+'</p>'+
  '<div class="insert-count-marks" aria-hidden="true">'+Array.from({length:pips||1},(_,i)=>'<span class="'+(i<pips?'recorded':'')+'">'+(i<pips?'✓':'·')+'</span>').join('')+(u.count>12?'<b>+'+(u.count-12)+'</b>':'')+'</div>'+
  (threshold?'<p class="small">'+(u.count>=threshold?'Verificar desgaste dos insertos.':'Referência do processo: cerca de '+threshold+' '+many+'; conferir desgaste.')+'</p>':'')+
  '<div class="insert-actions"><button data-insert-action="add">'+(pass?'+ Registrar passe':'+1 cavidade feita')+'</button><button data-insert-action="undo" '+(!u.events.length?'disabled':'')+'>Desfazer registro</button></div>'+
  '<div class="insert-batch"><label>Total desta aresta<input id="insertCycleTotal" type="number" min="0" max="1000" step="1" inputmode="numeric" value="'+esc(total)+'" aria-describedby="insertStudyMessage"></label><button data-insert-action="set">Registrar quantidade</button></div>'+
  '<div class="insert-close-actions"><button data-insert-action="change">Virar insert</button><button data-insert-action="replace">Trocar insert</button></div>'+
  '<p id="insertStudyMessage" class="insert-study-message '+(insertStudyUI.error?'invalid':'')+'" role="status">'+esc(insertStudyUI.message||(last?'Última: '+insertCycleLine(st,last)+' · '+insertKindLabel(last.kind):'Ao virar ou trocar o insert, a aresta é fechada e o contador volta a zero.'))+'</p>'+
  '<div class="insert-study-summary"><span><b>'+stats.cycles+'</b> arestas registradas</span><span>Média <b>'+(stats.average===null?'—':fmt(stats.average))+'</b> '+many+'/aresta</span>'+(pass&&stats.removedMm?'<span><b>'+fmt(stats.removedMm)+'</b> mm removidos no total</span>':'')+'</div>'+
  '<details class="insert-study-history" open><summary>Histórico ('+stats.cycles+')</summary><div class="insert-history-scroll">'+(stats.cycles?'<table><thead><tr><th>Aresta</th><th>'+(pass?'Passes':'Cavidades')+'</th>'+(pass?'<th>Removido</th>':'')+'<th>Evento</th><th>Data</th></tr></thead><tbody>'+u.cycles.slice(-12).reverse().map(c=>'<tr><td>'+c.cycle+'</td><td>'+InsertUsageDomain.cycleCount(c)+'</td>'+(pass?'<td>'+(Number.isFinite(c.removedMm)?fmt(c.removedMm)+' mm':'—')+'</td>':'')+'<td>'+insertKindLabel(c.kind)+'</td><td>'+esc(new Date(c.at).toLocaleString('pt-BR',{timeZone:'America/Sao_Paulo',dateStyle:'short',timeStyle:'short'}))+'</td></tr>').join('')+'</tbody></table>':'<p>Nenhuma aresta fechada ainda.</p>')+'</div><button id="exportInsertStudy" '+(!stats.cycles?'disabled':'')+'>Exportar estudo CSV</button><p class="small">Registro opcional · salvo neste navegador · não bloqueia a operação.</p></details></section>';
}
function exportInsertStudy(st){
 const rows=[['Máquina','Ferramenta','Trabalho','Operação','Programa','Tipo','Aresta','Quantidade','Redução por passe (mm)','Removido (mm)','Evento','Data ISO','Origem'],...insertUsage(st.tool_id).cycles.map(c=>[tooling.jobMachineId,'T'+st.tool_id,c.jobId??'',c.operation??'',c.program??st.program,c.unit??st.unit,c.cycle,InsertUsageDomain.cycleCount(c),c.reductionPerPassMm??'',c.removedMm??'',insertKindLabel(c.kind),c.at,c.source])];
 const csv='﻿'+rows.map(row=>row.map(v=>'"'+String(v).replaceAll('"','""')+'"').join(';')).join('\r\n'),url=URL.createObjectURL(new Blob([csv],{type:'text/csv;charset=utf-8'})),link=document.createElement('a');link.href=url;link.download='Estudo_Insertos_T'+st.tool_id+'.csv';link.click();setTimeout(()=>URL.revokeObjectURL(url),1000);
}
function renderInsertStudy(){
 const host=$('insertStudy');if(!host)return;const st=currentInsertStudy();
 if(!st){host._html=null;host.innerHTML='<p class="insert-none">A vida do insert é registrada no faceamento (O001 · passes por aresta) e no desbaste das cavidades (O003 · cavidades por aresta).</p>'+INSERT_STUDIES.map(s=>{const stats=InsertUsageDomain.statistics(tooling.store,tooling.jobMachineId,s.tool_id);return '<p class="small">'+esc(s.program)+' · T'+s.tool_id+': '+stats.cycles+' arestas registradas'+(stats.average===null?'':' · média '+fmt(stats.average)+' '+InsertUsageDomain.UNITS[s.unit].many)+'</p>';}).join('');return}
 const u=insertUsage(st.tool_id),html=insertStudyMarkup(st);if(host._html===html&&host.firstChild)return;host.innerHTML=html;host._html=html;
 const input=$('insertCycleTotal');input.oninput=()=>{insertStudyUI.draft=input.value;insertStudyUI.draftCycle=u.cycle;};
 $('exportInsertStudy').onclick=()=>exportInsertStudy(st);
 host.querySelectorAll('[data-insert-action]').forEach(b=>b.onclick=()=>{
  const action=b.dataset.insertAction,total=input.value.trim()===''?null:Number(input.value),beforeCycle=u.cycle,closing=['change','replace'].includes(action);
  const opts=insertContext(st);
  const result=['set','change','replace'].includes(action)&&total===null?false:action==='undo'?InsertUsageDomain.undo(tooling.store,tooling.jobMachineId,st.tool_id):InsertUsageDomain.record(tooling.store,tooling.jobMachineId,st.tool_id,action==='replace'?'change':action,{...opts,total:['set','change','replace'].includes(action)?total:null,kind:action==='replace'?'replace':'turn'});
  if(!result){insertStudyUI.error=true;insertStudyUI.message='Informe uma quantidade inteira válida'+(closing?', de 1 a 1000, para fechar a aresta.':', de 0 a 1000.');$('insertStudyMessage').textContent=insertStudyUI.message;$('insertStudyMessage').classList.add('invalid');input.setAttribute('aria-invalid','true');input.focus();return;}
  insertStudyUI.error=false;insertStudyUI.draft=null;insertStudyUI.draftCycle=null;
  insertStudyUI.message=closing?'Aresta '+beforeCycle+' registrada · '+insertCycleLine(st,u.cycles.at(-1)).replace(/^Aresta \d+ · /,'')+' · '+(action==='replace'?'troca':'virada')+'.':action==='undo'?'Último registro desfeito.':'Quantidade registrada: '+u.count+' '+insertUnitWord(st,u.count)+'.';
  persist();renderInsertStudy();if(typeof journeyRender==='function')journeyRender();host.querySelector('[data-insert-action="'+action+'"]')?.focus({preventScroll:true});
 });
}
function renderCavityConsultation(){
 const host=$('cavityConsultation');if(!host)return;const selected=cavityEntry(cavitySelection.id);
 host.innerHTML='<section class="cavity-reference"><h3>Consultar cavidade no TAP</h3><p class="small">Toque na cavidade no 3D ou escolha abaixo.</p><div class="cavity-buttons">'+CAVITY_DATA.entries.map(e=>'<button data-cavity="'+e.cavityId+'" aria-pressed="'+(e.cavityId===cavitySelection.id)+'" '+(!cavityEntry(e.cavityId)?'disabled':'')+' aria-label="Consultar cavidade '+e.cavityId+'">'+String(e.cavityId).padStart(2,'0')+'</button>').join('')+'</div>'+(selected?'<div id="selectedCavityLines" role="status"><h4>Cavidade '+String(selected.cavityId).padStart(2,'0')+'</h4>'+[['Z10 antes da cavidade',selected.z10Before],['Posição XY',selected.positionXY],['Primeiro G1',selected.firstG1],['Z10 ao concluir',selected.z10After]].filter(([,r])=>r).sort(([,a],[,b])=>a.line-b.line).map(([label,ref])=>'<div class="cavity-source">'+sourceReference(ref,cncFile,label)+'<code>'+esc(ref.code)+'</code></div>').join('')+'<p class="small">Avanço no início: '+technicalNumber(selected.feedAtEntry===null?[]:[selected.feedAtEntry])+' mm/min · modal</p></div>':'')+'<p class="small cavity-provenance">Localização no modelo ilustrativo. Linhas de consulta; retomada requer conferência na máquina.</p></section>';
 host.querySelectorAll('[data-cavity]').forEach(b=>b.onclick=()=>{selectCavity(b.dataset.cavity);host.querySelector('[data-cavity="'+b.dataset.cavity+'"]')?.focus({preventScroll:true});});
 host.querySelectorAll('[data-source-line]').forEach(b=>b.onclick=()=>showSourceReference(b.dataset.sourceFile,Number(b.dataset.sourceLine)));
}
function installCavityPicking(){
 for(let i=0;i<DATA.contours.length;i++){
  const shape=new THREE.Shape();DATA.contours[i].forEach((p,n)=>n?shape.lineTo(...p):shape.moveTo(...p));shape.closePath();
  const mesh=new THREE.Mesh(new THREE.ShapeGeometry(shape),new THREE.MeshBasicMaterial({color:0x0078c8,transparent:true,opacity:0,depthWrite:false,side:THREE.DoubleSide}));mesh.rotation.x=-Math.PI/2;mesh.position.y=97;mesh.userData.cavityId=i+1;mesh.name='cavity-pick-'+(i+1);part.add(mesh);cavityMeshes.push(mesh);
 }
 const canvas=renderer.domElement,points=new Map();let multi=false;canvas.setAttribute('aria-label',canvas.getAttribute('aria-label')+' O003: toque numa cavidade para consultar suas linhas; seleção também disponível em Detalhes técnicos.');
 canvas.addEventListener('pointerdown',e=>{if(e.button>0||e.shiftKey)return;points.set(e.pointerId,{x:e.clientX,y:e.clientY,moved:false});if(points.size>1)multi=true;});
 canvas.addEventListener('pointermove',e=>{const p=points.get(e.pointerId);if(p&&Math.hypot(e.clientX-p.x,e.clientY-p.y)>7)p.moved=true;});
 canvas.addEventListener('pointerup',e=>{const start=points.get(e.pointerId),cancelled=multi;points.delete(e.pointerId);if(!points.size)multi=false;if(!start||start.moved||cancelled||cncFile!=='O003.TAP')return;
  const box=canvas.getBoundingClientRect(),pointer=new THREE.Vector2((e.clientX-box.left)/box.width*2-1,-(e.clientY-box.top)/box.height*2+1),ray=new THREE.Raycaster();scene.updateMatrixWorld(true);ray.setFromCamera(pointer,camera);const hit=ray.intersectObjects(cavityMeshes.filter(m=>m.visible))[0];if(hit)selectCavity(hit.object.userData.cavityId);
 });
 const cancel=e=>{points.delete(e.pointerId);if(!points.size)multi=false;};canvas.addEventListener('pointercancel',cancel);canvas.addEventListener('lostpointercapture',cancel);window.addEventListener('blur',()=>{points.clear();multi=false});updateCavityHighlight();
}
const baseInsertInit=init3d;init3d=function(){baseInsertInit();installCavityPicking();};
const baseInsertAssembly=updateAssembly;updateAssembly=function(){baseInsertAssembly();updateCavityHighlight();};
