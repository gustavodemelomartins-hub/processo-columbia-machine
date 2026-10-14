/* Journey layer — the part's route: Recebimento → 1ª → 2ª → 3ª operação → Tratamento térmico → Retorno pós-TT.
   Interprets data/process.json (receiving, journey) on top of the operator layer. Each screen has ONE
   main action for its state; browsing operations, stages or the 3D never registers execution. */
__JOURNEY_DOMAIN__
const JOURNEY=OPERATOR_CONFIG.journey,RECEIVING=OPERATOR_CONFIG.receiving,J=JourneyDomain;
const FACE_IDS=OPERATOR_CONFIG.process_timing.face_milling.stage_ids,SETUP_MIN=OPERATOR_CONFIG.process_timing.setup_estimate_minutes;
state.journey=J.normalize(saved.journey);
// A brand-new part starts at receiving. Existing local records keep the operation view.
if(!saved.journey&&!Object.values(state.operator).some(r=>r?.started||r?.completed))state.journey.view='receiving';
const journeyUI={timer:null};
function jMm(v,unit=true){const n=J.toNumber(v);if(n===null)return '—';return n.toLocaleString('pt-BR',{minimumFractionDigits:2,maximumFractionDigits:3})+(unit?' mm':'');}
function jNow(){return new Date().toISOString();}
function jStageIndex(id){const op=processOperations.find(o=>o.phases.includes(Number(id)));return op?{index:op.phases.indexOf(Number(id))+1,total:op.phases.length,op}:null;}
function jProgramFile(id){const p=phases[id];return p&&p.program!==null?DATA.programs[p.program].file:null;}
function jRecordTimes(id){const r=state.operator[String(id)]||{};return {started:!!r.started,completed:!!r.completed,startedAt:r.startedAt||null,completedAt:r.completedAt||null};}
function jOrdinal(op){return (op+1)+'ª operação';}
// Keep focus and caret when a block is re-rendered under the operator's hands.
function jKeepFocus(host,render){
 const a=document.activeElement,id=host.contains(a)&&a.id?a.id:null,sel=id&&typeof a.selectionStart==='number'?[a.selectionStart,a.selectionEnd]:null;
 render();
 if(id){const el=$(id);if(el){el.focus({preventScroll:true});if(sel)try{el.setSelectionRange(...sel)}catch{}}}
}

// Replace markup only when it changed, so a click in progress never lands on a discarded button.
function jSetHTML(el,html){if(el._jHtml===html)return false;el.innerHTML=html;el._jHtml=html;return true;}
function jSetValue(input,value){if(input&&document.activeElement!==input&&J.toNumber(input.value)!==J.toNumber(value))input.value=value??'';}

/* ---------- Records: time stamps follow the manual actions ---------- */
function jStampTimes(){
 let changed=false;
 for(const [key,r] of Object.entries(state.operator)){
  if(!r||key==='pending')continue;
  if(r.started&&!r.completed&&!r.startedAt){r.startedAt=jNow();changed=true}
  if(r.completed&&!r.completedAt){r.completedAt=jNow();changed=true}
  if(!r.completed&&r.completedAt){delete r.completedAt;changed=true}
  if(!r.started&&!r.completed&&r.startedAt){delete r.startedAt;changed=true}
 }
 if(changed)persist();
 return changed;
}
// Capture: browsing operations/stages returns to the operation view before the existing handler renders.
document.addEventListener('click',e=>{if(e.target.closest('[data-step],[data-operation]')&&state.journey.view!==null){state.journey.view=null;persist();}},true);
document.addEventListener('click',e=>{if(e.target.closest('#startStageExecution'))journeyRender();});
document.addEventListener('change',e=>{if(e.target.matches('[data-stage-complete]'))journeyRender();});

/* ---------- Stock: received thickness → total → Face A (cleans, editable) / Face B (closes) ---------- */
function jStock(){return J.stockPlan(OPERATOR_CONFIG,state.journey);}
function jFaceA(){return state.journey.receiving.faceAMm??J.defaultFaceA(OPERATOR_CONFIG);}
// The facing estimate follows the receiving plan automatically.
function jSyncFaceStock(){
 const s=jStock();if(!s.valid)return false;
 const st=state.faceTiming.stockByStage,[a,b]=FACE_IDS;
 if(st[a]===s.faceAMm&&st[b]===s.faceBMm)return false;
 st[a]=s.faceAMm;st[b]=s.faceBMm;return true;
}
if(jSyncFaceStock())persist();
function jSetFaceA(v){
 state.journey.receiving.faceAMm=v;jSyncFaceStock();persist();renderJobTiming();
}

/* ---------- OS header (permanent) ---------- */
function jCurrentLabel(cur){
 if(!cur)return {text:'1ª e 2ª operações concluídas',sub:'Seguir para a 3ª operação'};
 if(cur.type==='phase'){const s=jStageIndex(cur.id);return {text:jOrdinal(s.op.id)+' · '+stageLabels[cur.id],sub:(jProgramFile(cur.id)||'')+' · etapa '+s.index+' de '+s.total};}
 return {text:'Recebimento',sub:'Medir a peça recebida'};
}
function renderOsBar(){
 const host=$('osBar');if(!host)return;
 const p=J.progress(OPERATOR_CONFIG,state.journey,state.operator),cur=jCurrentLabel(p.current),timing=jobTiming();
 const segs=p.items.map(i=>{const done=i.type==='phase'?state.operator[String(i.id)]?.completed===true:J.receivingDone(state.journey);const curr=!!p.current&&p.current.type===i.type&&p.current.id===i.id;return '<i data-done="'+done+'" data-current="'+curr+'"></i>'}).join('');
 host.innerHTML='<div class="osbar-inner">'+
  '<div class="osbar-cell osbar-order"><span class="osbar-label">OS</span><strong>'+esc(OPERATOR_CONFIG.part.order_display.replace(/^OS\s*/,''))+'</strong></div>'+
  '<div class="osbar-cell osbar-part"><span class="osbar-label">Peça</span><strong>'+esc(OPERATOR_CONFIG.part.name)+'</strong></div>'+
  '<div class="osbar-cell osbar-machine"><span class="osbar-label">Máquina</span><strong>'+esc(tooling.profile(tooling.jobMachineId).name)+'</strong></div>'+
  '<button type="button" class="osbar-cell osbar-current" id="goCurrentStage" title="Ir para a etapa atual"><span class="osbar-label">Etapa atual</span><strong>'+esc(cur.text)+'</strong><small>'+esc(cur.sub)+'</small></button>'+
  '<div class="osbar-cell osbar-progress"><span class="osbar-label">Progresso</span><strong><b id="journeyDone">'+p.done+'</b> de '+p.total+' etapas</strong><div class="ds-segments" role="img" aria-label="'+p.done+' de '+p.total+' etapas concluídas">'+segs+'</div></div>'+
  '<div class="osbar-cell osbar-remaining"><span class="osbar-label">Usinagem restante</span><strong id="journeyRemaining">'+(timing.remainingSeconds===null?'A definir':'~'+plannedDuration(timing.remainingSeconds))+'</strong><small>estimativa · TAP + '+OPERATOR_CONFIG.process_timing.allowance_percent+'%</small></div>'+
 '</div>';
 $('goCurrentStage').onclick=()=>jGoTo(p.current);
}
function jGoTo(item){
 if(!item){if(PENDING_OPERATION<0){jOpenView('heat');return}state.journey.view=null;persist();selectOperation(PENDING_OPERATION);journeyRender();return}
 if(item.type==='phase'){state.journey.view=null;persist();selectPhase(item.id);journeyRender();}
 else jOpenView(item.id);
}
function jOpenView(id){state.journey.view=id;persist();journeyRender();window.scrollTo({top:0});}

/* ---------- Journey map: the macro sequence, built around the existing operation buttons ---------- */
const NODE_LABEL={done:'Concluída',running:'Em andamento',active:'Atual',waiting:''};
function jNodeLabel(n){return NODE_LABEL[n.status]||'';}
function decorateJourneyMap(){
 const nav=$('operations');if(!nav)return;
 nav.classList.add('ds-journey');nav.setAttribute('aria-label','Sequência do processo');
 nav.querySelectorAll('[data-journey-node]').forEach(n=>n.remove());
 const states=J.nodeStates(OPERATOR_CONFIG,state.journey,state.operator),items=[...nav.querySelectorAll('.operation-item')];
 let number=0;
 for(const n of states){
  number++;
  const selected=state.journey.view===n.id||(state.journey.view===null&&n.kind==='operation'&&n.operation===state.operation);
  const label=jNodeLabel(n),meta='<span class="journey-meta"><b class="journey-num"'+(label?' title="'+label+'"':'')+'>'+(n.status==='done'?'✓':number)+'</b>'+(label?'<span class="visually-hidden">'+esc(label)+'</span>':'')+'</span>';
  if(n.kind==='operation'){
   const item=items[n.operation];if(!item)continue;
   item.dataset.journeyStatus=n.status;item.dataset.selected=String(selected);nav.append(item);
   const button=item.querySelector('button');button.setAttribute('aria-current',String(selected));
   button.querySelector('.journey-meta')?.remove();button.insertAdjacentHTML('afterbegin',meta);
   const strong=button.querySelector('strong');if(strong)strong.textContent=n.short;
   const sub=button.querySelector('span:not(.journey-meta):not(.journey-state)');if(sub)sub.textContent=n.status==='later'?'Processo em levantamento':processOperations[n.operation].name;
   continue;
  }
  const el=document.createElement('div');el.className='operation-item journey-checkpoint';el.dataset.journeyNode=n.id;el.dataset.journeyStatus=n.status;el.dataset.selected=String(selected);el.dataset.kind=n.kind;
  const sub=n.kind==='receiving'?'Medir e calcular o sobremetal':n.kind==='external'?'Depois da 3ª operação':'Processo em levantamento';
  el.innerHTML='<button type="button" data-journey-open="'+n.id+'" aria-current="'+selected+'">'+meta+'<strong>'+esc(n.short)+'</strong><span>'+esc(sub)+'</span></button>';
  nav.append(el);
 }
 nav.querySelectorAll('[data-journey-open]').forEach(b=>b.onclick=()=>jOpenView(b.dataset.journeyOpen));
}
function decorateStageCards(){
 document.querySelectorAll('#steps .stage-box').forEach(box=>{
  const id=Number(box.dataset.stage),t=jRecordTimes(id),num=box.querySelector('.stage-number');if(!num)return;
  num.dataset.n??=num.textContent;num.textContent=t.completed?'✓':num.dataset.n;
  let note=box.querySelector('.stage-badge');if(!note){note=document.createElement('span');note.className='visually-hidden stage-badge';num.after(note);}
  note.textContent=t.completed?'Concluída':t.started?'Em andamento':'';
 });
}

/* ---------- Receiving ---------- */
function stockSvg(s){
 // Schematic section, not to scale: band heights follow each face's share of the total, with a minimum to stay visible.
 const W=640,H=212,x0=24,x1=404,top=40,bottom=172,avail=64,ok=!!s?.valid;
 const share=v=>ok&&s.totalMm>0?Math.max(6,avail*v/s.totalMm):ok?6:22;
 const ha=share(ok?s.faceAMm:0),hb=share(ok?s.faceBMm:0),f=v=>ok?jMm(v):'—';
 const ya=top+ha/2,yb=bottom-hb/2,lx=x1+20;
 return '<svg class="ds-stock-svg" viewBox="0 0 '+W+' '+H+'" role="img" aria-label="Bruto '+f(s?.received)+': Face A retira '+f(s?.faceAMm)+', Face B retira '+f(s?.faceBMm)+', peça final '+jMm(J.target(OPERATOR_CONFIG).valueMm)+'">'+
 '<defs><pattern id="stockHatch" width="8" height="8" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><rect width="8" height="8" class="stock-tint"/><line x1="0" y1="0" x2="0" y2="8" class="stock-hatch"/></pattern></defs>'+
 '<text x="'+x0+'" y="'+(top-14)+'" class="stock-caption">Bruto recebido · '+f(s?.received)+'</text>'+
 '<rect x="'+x0+'" y="'+top+'" width="'+(x1-x0)+'" height="'+(bottom-top)+'" class="stock-raw"/>'+
 '<rect x="'+x0+'" y="'+top+'" width="'+(x1-x0)+'" height="'+ha+'" fill="url(#stockHatch)" class="stock-remove-area"/>'+
 '<rect x="'+x0+'" y="'+(bottom-hb)+'" width="'+(x1-x0)+'" height="'+hb+'" fill="url(#stockHatch)" class="stock-remove-area"/>'+
 '<rect x="'+x0+'" y="'+(top+ha)+'" width="'+(x1-x0)+'" height="'+(bottom-top-ha-hb)+'" class="stock-final"/>'+
 '<text x="'+((x0+x1)/2)+'" y="'+((top+ha+bottom-hb)/2+6)+'" text-anchor="middle" class="stock-text-inverse">Peça final · '+jMm(J.target(OPERATOR_CONFIG).valueMm)+'</text>'+
 '<line x1="'+x1+'" y1="'+ya+'" x2="'+(lx-4)+'" y2="'+ya+'" class="stock-dim"/><text x="'+lx+'" y="'+(ya+5)+'" class="stock-text">Face A · '+f(s?.faceAMm)+'</text>'+
 '<line x1="'+x1+'" y1="'+yb+'" x2="'+(lx-4)+'" y2="'+yb+'" class="stock-dim"/><text x="'+lx+'" y="'+(yb+5)+'" class="stock-text">Face B · '+f(s?.faceBMm)+'</text>'+
 '<text x="'+x0+'" y="'+(H-10)+'" class="stock-caption">Esquema fora de escala</text></svg>';
}
function receivingComputed(){
 const s=jStock(),t=J.target(OPERATOR_CONFIG),r=state.journey.receiving;
 $('rxFacts').innerHTML='<div><dt>'+esc(t.label)+'</dt><dd>'+jMm(t.valueMm)+'</dd></div><div><dt>Sobremetal total</dt><dd class="is-remove">'+(s.totalMm!==undefined&&s.totalMm!==null&&s.totalMm>=0?jMm(s.totalMm):'—')+'</dd></div>';
 $('rxSvg').innerHTML=stockSvg(s.valid?s:{valid:false,received:J.toNumber(r.receivedMm)});
 $('rxFaceB').textContent=s.valid?jMm(s.faceBMm):'—';
 $('rxMessage').textContent=s.valid||J.toNumber(r.receivedMm)===null?'':s.reason;
 $('rxSplit').textContent='Dividir igualmente'+(s.valid?' ('+jMm(s.symmetricMm)+' por face)':'');$('rxSplit').disabled=!s.valid;
 const action=$('receivingAction');if(action&&action.dataset.action==='record')action.disabled=!s.valid;
}
function renderReceiving(host){
 const r=state.journey.receiving,done=J.receivingDone(state.journey);
 const fresh=jSetHTML(host,'<div class="view-panel rx">'+
  '<header class="view-head"><div><h2 class="view-title">Recebimento</h2><p class="view-lead">'+esc(RECEIVING.objective)+'</p></div>'+
   '<div class="view-action">'+(done?'<span class="sp-status" data-status="done">Registrado às '+esc(J.formatClock(r.recordedAt)||'—')+'</span><button type="button" class="ds-btn" data-variant="primary" id="receivingAction" data-action="next">Ir para próxima etapa</button>':'<button type="button" class="ds-btn" data-variant="primary" id="receivingAction" data-action="record">Concluir recebimento</button>')+'</div></header>'+
  '<div class="rx-grid">'+
   '<section class="rx-measure" aria-label="Medição">'+
    '<label class="ds-field" data-size="xl"><span class="ds-field-label">'+esc(RECEIVING.measure.label)+'</span><span class="ds-field-control"><input id="receivedThickness" type="number" inputmode="decimal" step="0.01" min="0" placeholder="Medir" value=""><span class="ds-field-unit">mm</span></span></label>'+
    '<dl class="rx-facts" id="rxFacts"></dl>'+
   '</section>'+
   '<section class="rx-split" aria-labelledby="rxSplitTitle"><h3 id="rxSplitTitle">Remoção por face</h3><div id="rxSvg" class="rx-svg"></div>'+
    '<div class="rx-faces">'+
     '<label class="ds-field"><span class="ds-field-label">Face A · apenas limpa</span><span class="ds-field-control"><input id="faceARemoval" type="number" inputmode="decimal" step="0.05" min="0" value="" aria-describedby="rxFaceNote"><span class="ds-field-unit">mm</span></span></label>'+
     '<div class="rx-faceb"><span class="ds-field-label">Face B · fecha a espessura</span><strong id="rxFaceB">—</strong></div>'+
    '</div>'+
    '<p class="rx-note" id="rxFaceNote">Valor inicial da Face A: '+jMm(J.defaultFaceA(OPERATOR_CONFIG))+'. Altere se precisar; a Face B é recalculada. <button type="button" class="ds-link" id="rxSplit">Dividir igualmente</button></p>'+
    '<p class="rx-message" id="rxMessage" role="status"></p>'+
   '</section>'+
  '</div></div>');
 jSetValue($('receivedThickness'),r.receivedMm);jSetValue($('faceARemoval'),jFaceA());
 receivingComputed();
 if(!fresh)return;
 const input=$('receivedThickness'),faceA=$('faceARemoval');
 const setReceived=()=>{const v=J.toNumber(input.value);r.receivedMm=v!==null&&v>0?v:null;if(r.recordedAt)r.recordedAt=r.receivedMm?jNow():null;jSyncFaceStock();persist();renderJobTiming();receivingComputed();};
 input.oninput=setReceived;input.onchange=()=>{setReceived();journeyRender();};
 const setA=()=>{const v=J.toNumber(faceA.value);jSetFaceA(v===null?null:v);receivingComputed();};
 faceA.oninput=setA;faceA.onchange=()=>{setA();journeyRender();};
 $('rxSplit').onclick=()=>{const s=jStock();if(!s.valid)return;jSetFaceA(s.symmetricMm);journeyRender();};
 $('receivingAction').onclick=()=>{
  if($('receivingAction').dataset.action==='next'){jGoNextFrom('receiving');return}
  const s=jStock();if(!s.valid)return;r.recordedAt=jNow();jSyncFaceStock();persist();renderJobTiming();journeyRender();
 };
}

/* ---------- Nodes still being surveyed: 3ª operação, tratamento térmico, retorno pós-TT ---------- */
const LATER={
 ...(PENDING_OPERATION<0?{}:{op3:{title:'3ª operação',lead:'Processo em levantamento. Programas, montagem e ferramentas desta operação ainda serão coletados.',next:'heat'}}),
 heat:{title:'Tratamento térmico',lead:'Processo externo, depois da 3ª operação.',next:'post-heat'},
 'post-heat':{title:'Retorno pós-TT',lead:'Processo em levantamento. Depois do tratamento existe outro setup; os programas ainda serão coletados.',next:null}
};
function renderLater(host,id){
 const v=LATER[id],d=OPERATOR_CONFIG.drawing.thickness_mm;
 jSetHTML(host,'<div class="view-panel later">'+
  '<header class="view-head"><div><h2 class="view-title">'+esc(v.title)+'</h2><p class="view-lead">'+esc(v.lead)+'</p></div>'+(v.next?'<div class="view-action"><button type="button" class="ds-btn" data-variant="primary" id="laterNext">Ir para próxima etapa</button></div>':'')+'</header>'+
  (id==='heat'?'<dl class="rx-facts later-facts"><div><dt>Espessura antes do T.T.</dt><dd>'+jMm(d.before_heat_treatment)+'</dd></div><div><dt>Espessura depois do T.T.</dt><dd>'+jMm(d.after_heat_treatment)+'</dd></div></dl>':'')+
 '</div>');
 if($('laterNext'))$('laterNext').onclick=()=>jOpenView(v.next);
}
function jMode(){const v=state.journey.view;return v&&(v==='receiving'||LATER[v])?v:state.operation===PENDING_OPERATION?'op3':'operation';}
function renderJourneyView(){
 const host=$('journeyStage');if(!host)return;
 const mode=jMode();document.body.dataset.journeyView=mode;
 if(mode==='operation'){jSetHTML(host,'');host.hidden=true;return}
 host.hidden=false;
 mode==='receiving'?renderReceiving(host):renderLater(host,mode);
}

/* ---------- Stage panel: what, program, tool, stock, passes, time, one action ---------- */
function jGoNextFrom(from){
 state.journey.view=null;persist();
 if(from==='receiving'){selectPhase(processOperations[0].phases[0]);journeyRender();window.scrollTo({top:0});return}
 const next=J.nextPhase(OPERATOR_CONFIG,state.phase);
 if(next!==null)selectPhase(next);else if(PENDING_OPERATION<0){jOpenView('heat');return}else selectOperation(PENDING_OPERATION);
 journeyRender();window.scrollTo({top:0});
}
function jStatusText(t){
 if(t.completed)return 'Concluída'+(t.completedAt?' às '+J.formatClock(t.completedAt):'');
 if(t.started){const e=t.startedAt?J.elapsedMs(t.startedAt):null;return 'Em andamento'+(t.startedAt?' desde '+J.formatClock(t.startedAt):'')+(e!==null?' · '+J.formatDuration(e):'');}
 return 'Não iniciada';
}
function jMetric(label,value,note=''){return '<div class="sp-metric"><dt>'+esc(label)+'</dt><dd>'+value+(note?'<small>'+esc(note)+'</small>':'')+'</dd></div>';}
function renderStagePanel(){
 const host=$('stagePanel');if(!host)return;
 if(jMode()!=='operation'){host.hidden=true;return}
 host.hidden=false;
 const id=state.phase,s=jStageIndex(id),cfg=stageConfig(),t=jRecordTimes(id),file=displayedProgramFile(),timing=stageTiming(id),face=isFacingStage(id);
 const tools=(DATA.programs.find(p=>p.file===file)?.tools||[]).map(tid=>'T'+tid+' · '+esc(toolNames[tid]||'')).join('<br>');
 const stock=jStock(),faceB=face&&id===FACE_IDS[1],stockValue=state.faceTiming.stockByStage[id];
 // Programs run in the fixed order 1 → 8: a later stage only starts after the earlier ones are concluded.
 const order=processOperations.filter(o=>o.status!=='pending').flatMap(o=>o.phases);
 const blockedBy=t.started||t.completed?undefined:order.slice(0,order.indexOf(id)).find(pid=>!state.operator[String(pid)]?.completed);
 const action=t.completed?['next','Ir para próxima etapa']:t.started?['complete','Concluir operação']:blockedBy!==undefined?['pending','Ir para a etapa pendente']:['start','Iniciar operação'];
 let metrics=jMetric('Programa','<b class="sp-program">'+esc(file||'—')+'</b>')+jMetric(tools.includes('<br>')?'Ferramentas':'Ferramenta',tools||'—');
 if(face){
  const stockField=faceB&&stock.valid?'<span class="sp-value">'+jMm(stockValue)+'</span>':'<span class="sp-input"><input type="number" min="0" step="0.05" inputmode="decimal" data-face-stock="'+id+'" value="'+esc(stockValue??'')+'" placeholder="Informar" aria-label="Sobremetal desta face em milímetros"><span>mm</span></span>';
  metrics+=jMetric('Sobremetal desta face',stockField,faceB&&stock.valid?'fecha '+jMm(stock.target):'apenas limpa')+
   jMetric('Redução por passe','<span class="sp-input"><input id="faceReduction" type="number" min="0.001" step="0.05" inputmode="decimal" value="'+esc(state.faceTiming.reductionPerPassMm??'')+'" aria-label="Redução por passe em milímetros"><span>mm</span></span>')+
   jMetric('Passes estimados','<span class="sp-value">'+(timing?.passCount===null||timing?.passCount===undefined?'—':'~'+timing.passCount)+'</span>',timing?.perPassSeconds?'~'+strategyTime(timing.perPassSeconds)+' por passe':'');
 }
 metrics+=jMetric('Usinagem estimada','<span class="sp-value">'+(timing?.plannedSeconds===null||!timing?'A definir':'~'+esc(plannedDuration(timing.plannedSeconds)))+'</span>','TAP + '+OPERATOR_CONFIG.process_timing.allowance_percent+'%')+
  jMetric('Preparação estimada','<span class="sp-value">~'+SETUP_MIN+' min</span>','ainda será medida');
 if(!host.querySelector('.sp-head'))host.innerHTML='<div class="sp-head"></div><dl class="sp-metrics"></dl>';
 const head=host.querySelector('.sp-head'),dl=host.querySelector('.sp-metrics');dl.dataset.face=face;
 jSetHTML(head,'<div class="sp-title"><span class="sp-eyebrow">'+jOrdinal(s.op.id)+' · etapa '+s.index+' de '+s.total+'</span><h2>'+esc(phases[id].title)+'</h2>'+(cfg?.intent?.objective?'<p>'+esc(cfg.intent.objective)+'</p>':'')+'</div>'+
   '<div class="sp-action"><span class="sp-status-line"><span class="sp-status" id="stageStatus" data-status="'+(t.completed?'done':t.started?'running':'idle')+'">'+esc(jStatusText(t))+'</span>'+(t.completed?' · <button type="button" class="ds-link" id="stageReopen">Reabrir</button>':'')+'</span><button type="button" class="ds-btn" data-variant="primary" id="stageAction" data-action="'+action[0]+'">'+action[1]+'</button></div>');
 jKeepFocus(dl,()=>jSetHTML(dl,metrics));
 renderQuickInsert(host);
 $('stageAction').onclick=()=>{
  const a=$('stageAction').dataset.action;
  if(a==='start')$('startStageExecution').click();
  else if(a==='complete')jSetComplete(id,true);
  else if(a==='pending'){selectPhase(blockedBy);journeyRender();}
  else jGoNextFrom('stage');
 };
 if($('stageReopen'))$('stageReopen').onclick=()=>jSetComplete(id,false);
 host.querySelectorAll('[data-face-stock]').forEach(input=>input.onchange=()=>{
  const v=J.toNumber(input.value),sid=Number(input.dataset.faceStock);
  // With a received thickness, Face A drives the plan and Face B follows; otherwise the value is kept per face.
  if(sid===FACE_IDS[0]&&J.toNumber(state.journey.receiving.receivedMm)!==null){jSetFaceA(v);journeyRender();return}
  saveFaceTiming(input,sid);journeyRender();
 });
 if($('faceReduction'))$('faceReduction').onchange=e=>{saveFaceTiming(e.target);journeyRender();};
}
// Insert life, one click at the machine: optional, never blocks start/complete.
function renderQuickInsert(host){
 let row=host.querySelector('.sp-insert');if(!row){row=document.createElement('div');row.className='sp-insert';host.append(row);}
 const st=typeof currentInsertStudy==='function'?currentInsertStudy():null;row.hidden=!st;if(!st){jSetHTML(row,'');return}
 const u=insertUsage(st.tool_id),pass=st.unit==='pass',last=u.cycles.at(-1),red=number(state.faceTiming.reductionPerPassMm);
 jSetHTML(row,'<span class="sp-insert-title">Vida do insert · T'+st.tool_id+'</span>'+
  '<button type="button" class="sp-quick" data-quick-insert="add">'+(pass?'+ Registrar passe':'+ Registrar cavidade')+'</button>'+
  '<span class="sp-insert-count">'+(pass?'Passes nesta aresta':'Cavidades nesta aresta')+': <b id="quickInsertCount">'+u.count+'</b>'+(pass&&red>0&&u.count?' · '+jMm(u.count*red):'')+'</span>'+
  '<span class="sp-insert-more"><button type="button" class="ds-link" data-quick-insert="turn"'+(u.count?'':' disabled')+'>Virar insert</button><button type="button" class="ds-link" data-quick-insert="replace"'+(u.count?'':' disabled')+'>Trocar insert</button>'+(u.events.length?'<button type="button" class="ds-link" data-quick-insert="undo">Desfazer</button>':'')+'</span>'+
  (last?'<span class="sp-insert-last">Última: '+esc(insertCycleLine(st,last))+' · '+insertKindLabel(last.kind).toLowerCase()+'</span>':''));
 row.querySelectorAll('[data-quick-insert]').forEach(b=>b.onclick=()=>{if(recordInsert(st,b.dataset.quickInsert)){insertStudyUI.message='';renderQuickInsert(host);renderInsertStudy();}});
}
function jSetComplete(id,done){
 const box=document.querySelector('[data-stage-complete="'+id+'"]');
 if(box){box.checked=done;box.dispatchEvent(new Event('change',{bubbles:true}));return}
 // Same record as the stage card checkbox when the stage belongs to another operation.
 const r=operatorRecord(String(id));r.completed=done;r.started=false;r.completionSource='registro manual da etapa';persist();renderOperational();
}
function jTick(){const el=$('stageStatus'),t=jRecordTimes(state.phase);if(el&&jMode()==='operation'&&t.started&&!t.completed)el.textContent=jStatusText(t);}

/* ---------- How to: short instructions + secondary details ---------- */
function jDetailRow(label,value){return value?'<div><dt>'+esc(label)+'</dt><dd>'+value+'</dd></div>':'';}
function renderStageHow(){
 const host=$('stageHow');if(!host)return;
 if(jMode()!=='operation'){host.hidden=true;host.innerHTML='';return}
 host.hidden=false;
 const cfg=stageConfig(),fx=OPERATOR_CONFIG.fixture,refs=engineeringReferences(),file=displayedProgramFile(),prog=DATA.programs.find(p=>p.file===file),meta=cncData?.[file]?.meta;
 const onSupports=(cfg?.setup||'').includes('calcos')||state.operation===1;
 const proposal=OPERATOR_CONFIG.inprocess_proposals?.[file];
 const wasOpen=!!host.querySelector('details[open]');
 const position=cfg?.orientation?.label||(cfg?.orientation?.rotation_x_degrees===180?'Invertida — '+fx.orientation_sequence.first_face:state.operation===0?'Tombada — '+fx.orientation_sequence.after_tumble:'Sobre calços — '+fx.orientation_sequence.after_tumble);
 const fresh=jSetHTML(host,'<h3>Como fazer</h3><ol class="how-list">'+stepsNow().map(s=>'<li>'+esc(s)+'</li>').join('')+'</ol>'+
  '<details class="op-details"><summary>Ver detalhes da operação</summary><dl class="op-details-list">'+
   jDetailRow('Posição da peça',esc(position))+
   jDetailRow('Montagem',esc(onSupports?fx.supports:'Sobre a mesa'))+
   (fx.inner_clamps.stages.includes(state.phase)?jDetailRow('Garras',esc(fx.inner_clamps.description)):onSupports?jDetailRow('Garras',esc(fx.top_clamps)):'')+
   jDetailRow('Alinhamento',esc(fx.alignment.value))+
   jDetailRow('Referência','X0 '+esc(refs.x||'—')+' · Y0 '+esc(refs.y||'—')+' · Z0 '+esc(refs.z||'—')+(meta?.wcs?.length?' · '+esc(meta.wcs.join(' / ')):''))+
   jDetailRow('Estratégias no programa',esc((prog?.operations||[]).map(o=>o.replace(/^_+/,'')).join(' · ')))+
   jDetailRow('Tempo no cabeçalho do TAP',prog?esc(strategyTime(prog.seconds))+' <small>sem margem</small>':'')+
   (proposal?jDetailRow('Proposta in-process','<b>Proposta</b> · '+esc(proposal.title)+'<br><small>Para avaliação; o TAP não foi alterado.</small>'):'')+
  '</dl><div class="op-details-actions"><button type="button" class="ds-btn" data-variant="secondary" data-how-drawing>Abrir desenho</button><button type="button" class="ds-btn" data-variant="secondary" data-how-details>Detalhes do programa</button></div></details>');
 if(!fresh)return;
 if(wasOpen)host.querySelector('details').open=true;
 host.querySelector('[data-how-drawing]').onclick=()=>{state.visualMode='drawing';persist();applyVisualMode();$('view3DPanel').closest('.viewer').scrollIntoView({block:'nearest'});};
 host.querySelector('[data-how-details]').onclick=()=>{tab('details');document.querySelector('.sidebar').scrollIntoView({block:'nearest'});};
}

/* ---------- 3D in context: face being machined, orientation, mounting, origin ---------- */
let journeyAxes=null,journeyFaceLayer=null;
function jAxisColor(name){return new THREE.Color(getComputedStyle(document.documentElement).getPropertyValue('--'+name).trim()||'#888');}
// Small letter without a box, so the origin never covers the part.
function jLabelSprite(text,color){const c=document.createElement('canvas');c.width=64;c.height=64;const g=c.getContext('2d');g.font='600 44px "Segoe UI", sans-serif';g.textAlign='center';g.textBaseline='middle';g.lineWidth=8;g.strokeStyle='rgba(255,255,255,.9)';g.strokeText(text,32,34);g.fillStyle=color;g.fillText(text,32,34);const s=new THREE.Sprite(new THREE.SpriteMaterial({map:new THREE.CanvasTexture(c),depthTest:false}));s.scale.set(44,44,1);s.renderOrder=10;return s;}
function jEnsure3D(){
 if(typeof scene==='undefined'||!scene)return false;
 if(!journeyAxes){
  journeyAxes=new THREE.Group();journeyAxes.name='journey-origin-axes';journeyAxes.userData={role:'reference-axes',provenance:'reference_defaults; ilustrativo'};
  for(const [axis,dir,label] of [['axis-x',[1,0,0],'X'],['axis-y',[0,0,-1],'Y'],['axis-z',[0,1,0],'Z']]){
   const color=jAxisColor(axis),end=new THREE.Vector3(...dir).multiplyScalar(130);
   const line=new THREE.Line(new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(),end]),new THREE.LineBasicMaterial({color,depthTest:false}));line.renderOrder=9;journeyAxes.add(line);
   const cone=new THREE.Mesh(new THREE.ConeGeometry(5,16,12),new THREE.MeshBasicMaterial({color,depthTest:false}));cone.position.copy(end);cone.renderOrder=9;
   if(dir[0])cone.rotation.z=-Math.PI/2;else if(dir[2])cone.rotation.x=-Math.PI/2;journeyAxes.add(cone);
   const sprite=jLabelSprite(label,'#'+color.getHexString());sprite.position.copy(end.clone().multiplyScalar(1.22));journeyAxes.add(sprite);
  }
  const dot=new THREE.Mesh(new THREE.SphereGeometry(6,16,10),new THREE.MeshBasicMaterial({color:0x0a3250,depthTest:false}));dot.renderOrder=9;journeyAxes.add(dot);
  journeyAxes.visible=false;scene.add(journeyAxes);
 }
 if(!journeyFaceLayer){
  const w=OPERATOR_CONFIG.simulation.part_mm.width,d=OPERATOR_CONFIG.simulation.part_mm.depth;
  journeyFaceLayer=new THREE.Mesh(new THREE.BoxGeometry(w+4,10,d+4),new THREE.MeshStandardMaterial({color:jAxisColor('stock-remove'),transparent:true,opacity:.55,depthWrite:false}));
  journeyFaceLayer.name='journey-face-layer';journeyFaceLayer.userData={role:'material-to-remove',scale:'espessura exagerada; ilustrativo'};journeyFaceLayer.visible=false;scene.add(journeyFaceLayer);
 }
 return true;
}
function journey3D(){
 if(!jEnsure3D())return;
 const operation=jMode()==='operation',p=phases[state.phase],top=plateBottom+OPERATOR_CONFIG.simulation.part_mm.thickness;
 journeyAxes.position.set(0,top,0);journeyAxes.visible=operation&&engineeringReferences().center;
 if(typeof zeroMarker!=='undefined'&&zeroMarker)zeroMarker.visible=false;
 journeyFaceLayer.position.set(0,top+5,0);journeyFaceLayer.visible=operation&&p?.kind==='face';
 const caption=!operation?'':state.phase===FACE_IDS[0]?'Face A em laranja · peça invertida, sobre a mesa':state.phase===FACE_IDS[1]?'Face B em laranja · peça tombada, sobre a mesa':(state.operation===2?'Peça tombada, direto na mesa':'Peça sobre 4 calços')+(OPERATOR_CONFIG.fixture.inner_clamps.stages.includes(state.phase)?' · garras por dentro':' · 4 garras')+' · X0 Y0 no centro, Z0 no topo';
 const el=$('viewerContext');if(el){el.textContent=caption;el.hidden=!caption;}
 draw();
}

/* ---------- Part record (collapsed) ---------- */
function renderPassport(){
 const host=$('passportBody');if(!host)return;
 const pass=J.passport(OPERATOR_CONFIG,state.journey,state.operator,DATA);
 const row=(k,v)=>'<tr><th scope="row">'+esc(k)+'</th><td>'+v+'</td></tr>';
 host.innerHTML='<table class="ds-table passport-table"><tbody>'+
  row('Espessura recebida',pass.receiving.receivedMm===null?'—':jMm(pass.receiving.receivedMm)+(pass.receiving.recordedAt?' <small>registrada às '+esc(J.formatClock(pass.receiving.recordedAt))+'</small>':''))+
  row(pass.target.label,jMm(pass.target.valueMm))+
  row('Sobremetal',pass.stock?'total '+jMm(pass.stock.totalMm)+' · Face A '+jMm(pass.stock.faceAMm)+' · Face B '+jMm(pass.stock.faceBMm):'—')+
 '</tbody></table>'+
 '<table class="ds-table passport-stages"><thead><tr><th scope="col">Etapa</th><th scope="col">Programa</th><th scope="col">Início</th><th scope="col">Conclusão</th><th scope="col">Duração registrada</th></tr></thead><tbody>'+
  pass.stages.map(s=>'<tr data-status="'+(s.completed?'done':s.started?'running':'waiting')+'"><td>'+s.operation+'ª · '+esc(stageLabels[s.phase])+'</td><td>'+esc(s.program||'—')+'</td><td>'+esc(s.startedAt?J.formatClock(s.startedAt):'—')+'</td><td>'+esc(s.completedAt?J.formatClock(s.completedAt):'—')+'</td><td>'+esc(s.elapsedMs===null?'—':J.formatDuration(s.elapsedMs))+'</td></tr>').join('')+
 '</tbody></table>';
 $('exportPassport').onclick=()=>{const blob=new Blob([JSON.stringify(J.passport(OPERATOR_CONFIG,state.journey,state.operator,DATA),null,2)],{type:'application/json'});const a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download='Registro_'+OPERATOR_CONFIG.part.order.replaceAll(' ','')+'.json';a.click();setTimeout(()=>URL.revokeObjectURL(a.href),1000);};
}

/* ---------- Orchestration ---------- */
let journeyRendering=false;
function journeyRender(){
 if(journeyRendering)return;journeyRendering=true;
 try{jStampTimes();decorateJourneyMap();decorateStageCards();renderOsBar();renderJourneyView();renderStagePanel();renderStageHow();renderPassport();if(typeof renderInsertStudy==='function'&&!$('insertPanel')?.hidden)renderInsertStudy();journey3D();}
 finally{journeyRendering=false;}
}
const journeyOriginalRenderOperational=renderOperational;
renderOperational=function(){journeyOriginalRenderOperational();journeyRender();};
const journeyOriginalNavigation=renderOperationNavigation;
renderOperationNavigation=function(){journeyOriginalNavigation();decorateJourneyMap();decorateStageCards();};
const journeyOriginalJobTiming=renderJobTiming;
renderJobTiming=function(){journeyOriginalJobTiming();if(!journeyRendering){renderOsBar();decorateStageCards();}};
const journeyOriginalInit3d=init3d;
init3d=function(){journeyOriginalInit3d();journey3D();};
journeyUI.timer=setInterval(()=>{if(Object.values(state.operator).some(r=>r?.started&&!r?.completed))jTick();},30000);
window.columbiaJourney={domain:J,render:journeyRender,openView:jOpenView,openOperationView:()=>{state.journey.view=null;persist();journeyRender();},state:()=>state.journey,progress:()=>J.progress(OPERATOR_CONFIG,state.journey,state.operator),passport:()=>J.passport(OPERATOR_CONFIG,state.journey,state.operator,DATA),stock:jStock,setComplete:jSetComplete,get3D:()=>({axes:journeyAxes,faceLayer:journeyFaceLayer})};
