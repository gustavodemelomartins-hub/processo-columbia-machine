/* Journey layer — the part's route through the process.
   Interprets data/process.json (receiving, journey, stage_guide, open_questions) on top of the
   existing operator layer. Navigation and section browsing never register execution: only
   "Iniciar etapa", "Concluída" and the explicit buttons of receiving/controls write records. */
__JOURNEY_DOMAIN__
const JOURNEY=OPERATOR_CONFIG.journey,GUIDE=OPERATOR_CONFIG.stage_guide.sections,RECEIVING=OPERATOR_CONFIG.receiving,QUESTIONS=OPERATOR_CONFIG.open_questions||[];
state.journey=JourneyDomain.normalize(saved.journey);
// A brand-new part starts at receiving. Existing local records keep the operation view.
if(!saved.journey&&!Object.values(state.operator).some(r=>r?.started||r?.completed))state.journey.view='receiving';
const journeyUI={section:'preparacao',visited:new Set(['preparacao']),lastPhase:null,completedFlash:null,timer:null};
const J=JourneyDomain;
function jMm(v,unit=true){const n=J.toNumber(v);if(n===null)return '—';return n.toLocaleString('pt-BR',{minimumFractionDigits:n%1?1:1,maximumFractionDigits:3})+(unit?' mm':'');}
function jQuestion(id){return QUESTIONS.find(q=>q.id===id);}
function jTbc(text,ids=[],title='Informação a confirmar'){
 const links=ids.map(jQuestion).filter(Boolean).map(q=>'<a href="#'+q.id+'" data-question-link="'+q.id+'">'+esc(q.question)+'</a>').join('');
 return '<div class="ds-tbc" role="note"><span class="ds-tbc-mark" aria-hidden="true">?</span><div><strong>'+esc(title)+'</strong>'+(text?'<p>'+esc(text)+'</p>':'')+(links?'<div class="ds-tbc-links">'+links+'</div>':'')+'</div></div>';
}
function jStatus(kind,label){return '<span class="ds-status" data-status="'+kind+'"><i aria-hidden="true"></i>'+esc(label)+'</span>';}
function jValue(label,value,{unit='',note='',size='md',kind=''}={}){return '<div class="ds-value" data-size="'+size+'"'+(kind?' data-kind="'+kind+'"':'')+'><span class="ds-value-label">'+esc(label)+'</span><strong class="ds-value-number">'+value+(unit?'<small>'+esc(unit)+'</small>':'')+'</strong>'+(note?'<span class="ds-value-note">'+esc(note)+'</span>':'')+'</div>';}
function jNow(){return new Date().toISOString();}
function jNodeOfPhase(id){const op=processOperations.findIndex(o=>o.phases.includes(Number(id)));return JOURNEY.nodes.find(n=>n.kind==='operation'&&n.operation===op);}
function jStageIndex(id){const op=processOperations.find(o=>o.phases.includes(Number(id)));return op?{index:op.phases.indexOf(Number(id))+1,total:op.phases.length,op}:null;}
function jProgramFile(id){const p=phases[id];return p&&p.program!==null?DATA.programs[p.program].file:null;}
function jStrategies(file){const p=DATA.programs.find(p=>p.file===file);return p?p.operations.map(o=>o.replace(/^_+/,'')):[];}
function jRecordTimes(id){const r=state.operator[String(id)]||{};return {started:!!r.started,completed:!!r.completed,startedAt:r.startedAt||null,completedAt:r.completedAt||null};}
function jPlanned(id){const s=stageTiming(id);return s?s.plannedSeconds:null;}

/* ---------- Records: time stamps follow the existing manual actions ---------- */
function jStampTimes(){
 let changed=false;
 for(const [key,r] of Object.entries(state.operator)){
  if(!r||key==='pending')continue;
  if(r.started&&!r.completed&&!r.startedAt){r.startedAt=jNow();changed=true}
  if(r.completed&&!r.completedAt){r.completedAt=jNow();changed=true;journeyUI.completedFlash=Number(key)}
  if(!r.completed&&r.completedAt){delete r.completedAt;changed=true}
  if(!r.started&&!r.completed&&r.startedAt){delete r.startedAt;changed=true}
 }
 if(changed)persist();
 return changed;
}
// Capture: browsing operations/stages returns to the operation view before the existing handler
// renders. It never records execution.
document.addEventListener('click',e=>{if(e.target.closest('[data-step],[data-operation],#prev,#next')&&state.journey.view!==null){state.journey.view=null;persist();}},true);
document.addEventListener('click',e=>{if(e.target.closest('#startStageExecution'))journeyAfterRecord();});
document.addEventListener('change',e=>{if(e.target.matches('[data-stage-complete]'))journeyAfterRecord();});
function journeyAfterRecord(){jStampTimes();journeyRender();}

/* ---------- OS header (permanent) ---------- */
function jCurrentLabel(cur){
 if(!cur)return {text:'Etapas definidas concluídas',sub:'3ª operação a definir'};
 if(cur.type==='phase'){const s=jStageIndex(cur.id);return {text:(s.op.id+1)+'ª operação · '+stageLabels[cur.id],sub:(jProgramFile(cur.id)||'')+' · etapa '+s.index+' de '+s.total};}
 const n=JOURNEY.nodes.find(n=>n.id===cur.id);return {text:n.title,sub:n.kind==='control'?'Inspeção':'Antes da usinagem'};
}
function renderOsBar(){
 const host=$('osBar');if(!host)return;
 const p=J.progress(OPERATOR_CONFIG,state.journey,state.operator),st=J.overallStatus(OPERATOR_CONFIG,state.journey,state.operator),cur=jCurrentLabel(p.current);
 const timing=jobTiming(),open=QUESTIONS.length;
 const segs=p.items.map(i=>{const done=i.type==='phase'?state.operator[String(i.id)]?.completed===true:i.type==='receiving'?J.receivingDone(state.journey):J.controlDone(state.journey,i.id);const curr=p.current&&p.current.type===i.type&&p.current.id===i.id;return '<i data-done="'+done+'" data-current="'+curr+'"></i>'}).join('');
 host.innerHTML='<div class="osbar-inner">'+
  '<div class="osbar-cell osbar-order"><span class="t-eyebrow">OS</span><strong class="t-display-os">'+esc(OPERATOR_CONFIG.part.order_display)+'</strong><small class="osbar-part-inline">'+esc(OPERATOR_CONFIG.part.name)+'</small></div>'+
  '<div class="osbar-cell osbar-part"><span class="t-eyebrow">Peça</span><strong>'+esc(OPERATOR_CONFIG.part.name)+'</strong></div>'+
  '<div class="osbar-cell osbar-machine"><span class="t-eyebrow">Máquina</span><strong>'+esc(tooling.profile(tooling.jobMachineId).name)+'</strong></div>'+
  '<button type="button" class="osbar-cell osbar-current" id="goCurrentStage" title="Ir para a etapa atual"><span class="t-eyebrow">Etapa atual →</span><strong>'+esc(cur.text)+'</strong><small>'+esc(cur.sub)+'</small></button>'+
  '<div class="osbar-cell osbar-progress"><span class="t-eyebrow">Progresso</span><strong><b id="journeyDone">'+p.done+'</b> de '+p.total+' etapas</strong><div class="ds-segments" role="img" aria-label="'+p.done+' de '+p.total+' etapas concluídas">'+segs+'</div></div>'+
  '<div class="osbar-cell"><span class="t-eyebrow">Tempo restante</span><strong id="journeyRemaining">'+(timing.remainingSeconds===null?'A definir':plannedDuration(timing.remainingSeconds))+'</strong><small>'+(timing.remainingSeconds===null?'faltam dados de sobremetal':'previsto · TAP + '+OPERATOR_CONFIG.process_timing.allowance_percent+'%')+'</small></div>'+
  '<div class="osbar-cell osbar-status"><span class="t-eyebrow">Status geral</span>'+jStatus(st.key,st.label)+'</div>'+
  '<div class="osbar-actions"><button type="button" class="ds-btn" data-variant="ghost" id="openQuestions"><b>'+open+'</b> a confirmar</button></div>'+
 '</div>';
 $('goCurrentStage').onclick=()=>jGoTo(p.current);
 $('openQuestions').onclick=()=>{$('questionsPanel').open=true;$('questionsPanel').scrollIntoView({block:'start'});};
}
function jGoTo(item){
 if(!item){state.journey.view=null;selectOperation(1);return}
 if(item.type==='phase'){state.journey.view=null;persist();selectPhase(item.id);journeyRender();}
 else jOpenView(item.id);
 $('journeyMapAnchor')?.scrollIntoView({block:'nearest'});
}
function jOpenView(id){state.journey.view=id;persist();journeyRender();window.scrollTo({top:0});}

/* ---------- Journey map (process overview) built around the existing operation buttons ---------- */
function decorateJourneyMap(){
 const nav=$('operations');if(!nav)return;
 nav.classList.add('ds-journey');nav.setAttribute('aria-label','Visão geral do processo');
 nav.querySelectorAll('[data-journey-node]').forEach(n=>n.remove());
 const states=J.nodeStates(OPERATOR_CONFIG,state.journey,state.operator),items=[...nav.querySelectorAll('.operation-item')];
 let number=0;
 for(const n of states){
  number++;
  const selected=state.journey.view===n.id||(state.journey.view===null&&n.kind==='operation'&&n.operation===state.operation);
  if(n.kind==='operation'){
   const item=items[n.operation];if(!item)continue;
   item.dataset.journeyStatus=n.status;item.dataset.selected=String(selected);nav.append(item);
   const button=item.querySelector('button');button.setAttribute('aria-current',String(selected));
   let badge=button.querySelector('.journey-meta');if(!badge){badge=document.createElement('span');badge.className='journey-meta';button.prepend(badge);}
   badge.innerHTML='<b class="journey-num">'+String(number).padStart(2,'0')+'</b>'+jStatus(n.status,n.status==='undefined'?'Não definida':n.label+(n.total?' · '+n.done+'/'+n.total:''));
   if(n.status==='undefined'){const s=button.querySelector('span:not(.journey-meta):not(.ds-status)');if(s)s.textContent='Processo ainda não definido';}
   continue;
  }
  const el=document.createElement('div');el.className='operation-item journey-checkpoint';el.dataset.journeyNode=n.id;el.dataset.journeyStatus=n.status;el.dataset.selected=String(selected);el.dataset.kind=n.kind;
  el.innerHTML='<button type="button" data-journey-open="'+n.id+'" aria-current="'+selected+'"><span class="journey-meta"><b class="journey-num">'+String(number).padStart(2,'0')+'</b>'+jStatus(n.status,n.label)+'</span><strong>'+esc(n.short)+'</strong><span>'+esc(n.kind==='external'?'Posição na sequência a confirmar':n.title)+'</span></button>';
  nav.append(el);
 }
 nav.querySelectorAll('[data-journey-open]').forEach(b=>b.onclick=()=>jOpenView(b.dataset.journeyOpen));
}

/* ---------- Checkpoint views: receiving, controls, heat treatment ---------- */
function stockSvg(stock,{label='',method='symmetric'}={}){
 // Schematic section, not to scale: material to remove is exaggerated so it can be read.
 const W=560,H=200,x0=40,x1=W-40,top=40,bottom=150;
 const a=stock?.valid?(method==='symmetric'?stock.symmetric.faceAMm:stock.method.faceAMm):null,b=stock?.valid?(method==='symmetric'?stock.symmetric.faceBMm:stock.method.faceBMm):null;
 const t=stock?.valid?stock.totalMm:null,remA=28,remB=28;
 const fmt=v=>v===null||v===undefined?'?':jMm(v,false);
 return '<svg class="ds-stock-svg" viewBox="0 0 '+W+' '+H+'" role="img" aria-label="Seção da peça: Face A retira '+fmt(a)+' mm, Face B retira '+fmt(b)+' mm, objetivo '+fmt(stock?.target)+' mm">'+
 '<defs><pattern id="hatch'+label+'" width="8" height="8" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><rect width="8" height="8" class="stock-tint"/><line x1="0" y1="0" x2="0" y2="8" class="stock-hatch"/></pattern></defs>'+
 '<rect x="'+x0+'" y="'+top+'" width="'+(x1-x0)+'" height="'+(bottom-top)+'" class="stock-raw"/>'+
 '<rect x="'+x0+'" y="'+top+'" width="'+(x1-x0)+'" height="'+remA+'" fill="url(#hatch'+label+')" class="stock-remove-area"/>'+
 '<rect x="'+x0+'" y="'+(bottom-remB)+'" width="'+(x1-x0)+'" height="'+remB+'" fill="url(#hatch'+label+')" class="stock-remove-area"/>'+
 '<rect x="'+x0+'" y="'+(top+remA)+'" width="'+(x1-x0)+'" height="'+(bottom-top-remA-remB)+'" class="stock-final"/>'+
 '<text x="'+(x0+12)+'" y="'+(top+remA/2+5)+'" class="stock-text">Face A · retirar '+fmt(a)+' mm</text>'+
 '<text x="'+(x0+12)+'" y="'+(bottom-remB/2+5)+'" class="stock-text">Face B · retirar '+fmt(b)+' mm</text>'+
 '<text x="'+((x0+x1)/2)+'" y="'+((top+bottom)/2+6)+'" text-anchor="middle" class="stock-text-inverse">Peça final · '+fmt(stock?.target)+' mm</text>'+
 '<line x1="'+(x1+14)+'" y1="'+top+'" x2="'+(x1+14)+'" y2="'+bottom+'" class="stock-dim"/><line x1="'+(x1+8)+'" y1="'+top+'" x2="'+(x1+20)+'" y2="'+top+'" class="stock-dim"/><line x1="'+(x1+8)+'" y1="'+bottom+'" x2="'+(x1+20)+'" y2="'+bottom+'" class="stock-dim"/>'+
 '<text x="'+(x0)+'" y="'+(top-12)+'" class="stock-caption">Bruto recebido '+fmt(stock?.received)+' mm · sobremetal total '+fmt(t)+' mm</text>'+
 '<text x="'+x0+'" y="'+(H-12)+'" class="stock-caption">Esquema fora de escala · orientação operacional</text></svg>';
}
function renderReceiving(host){
 const r=state.journey.receiving,plan=J.stockPlan(OPERATOR_CONFIG,state.journey),target=J.confirmedTarget(OPERATOR_CONFIG,state.journey),done=J.receivingDone(state.journey);
 const method=journeyUI.stockMethod||'symmetric';
 const shown=target?plan.filter(c=>c.id===target.id):plan;
 host.innerHTML='<header class="checkpoint-head"><div><span class="t-eyebrow">01 · Antes da usinagem</span><h2 class="t-title-stage">'+esc(RECEIVING.title)+'</h2><p class="checkpoint-objective">'+esc(RECEIVING.objective)+'</p></div>'+jStatus(done?'done':'active',done?'Concluída':'Atual')+'</header>'+
 '<div class="checkpoint-grid">'+
  '<section class="ds-panel" aria-labelledby="rxMeasureTitle"><h3 id="rxMeasureTitle" class="t-title-card">1. Medir a peça recebida</h3>'+
   '<label class="ds-field" data-size="xl"><span class="ds-field-label">'+esc(RECEIVING.measure.label)+'</span><span class="ds-field-control"><input id="receivedThickness" type="number" inputmode="decimal" step="0.01" min="0" placeholder="Medir" value="'+(r.receivedMm??'')+'" aria-describedby="rxSource"><span class="ds-field-unit">mm</span></span></label>'+
   '<p id="rxSource" class="t-caption muted">'+esc(RECEIVING.measure.source)+'</p>'+
   '<div class="checkpoint-actions"><button type="button" class="ds-btn" data-variant="primary" id="recordReceiving" '+(J.toNumber(r.receivedMm)>0?'':'disabled')+'>'+(done?'Atualizar registro':'Registrar recebimento')+'</button>'+(done?'<span class="t-caption">Registrado às '+esc(J.formatClock(r.recordedAt))+'</span>':'')+'</div>'+
  '</section>'+
  '<section class="ds-panel" aria-labelledby="rxTargetTitle"><h3 id="rxTargetTitle" class="t-title-card">2. Espessura objetivo</h3>'+
   '<div class="ds-alert" data-kind="confirm" role="note"><strong>Divergência de engenharia</strong><p>'+esc(OPERATOR_CONFIG.engineering_review.message)+'</p></div>'+
   '<div class="target-options" role="group" aria-label="Valores candidatos de espessura objetivo">'+plan.map(c=>'<div class="target-option" data-selected="'+(target?.id===c.id)+'"><div>'+jValue(c.label,jMm(c.valueMm,false),{unit:'mm',note:c.detail})+'</div><div class="target-stock">'+(c.stock.valid?jValue('Sobremetal total',jMm(c.stock.totalMm,false),{unit:'mm',kind:'remove'}):'<span class="t-caption">'+esc(c.stock.reason||'')+'</span>')+'</div><button type="button" class="ds-btn" data-variant="'+(target?.id===c.id?'primary':'secondary')+'" data-target-choice="'+c.id+'">'+(target?.id===c.id?'Confirmado':'Confirmar '+jMm(c.valueMm))+'</button></div>').join('')+'</div>'+
   (target?'<p class="t-caption">Confirmado por '+esc(r.targetChoice.by||'—')+' às '+esc(J.formatClock(r.targetChoice.at))+' para esta peça. A pendência da engenharia continua aberta. <button type="button" class="ds-link" id="clearTarget">Desfazer</button></p>':'<label class="ds-field"><span class="ds-field-label">Responsável pela confirmação</span><span class="ds-field-control"><input id="targetConfirmer" maxlength="60" placeholder="Nome" value="'+esc(journeyUI.confirmer||'')+'"></span></label><p class="t-caption">'+esc(RECEIVING.target_confirmation.rule)+'</p>')+
  '</section>'+
  '<section class="ds-panel checkpoint-wide" aria-labelledby="rxStockTitle"><div class="panel-head"><h3 id="rxStockTitle" class="t-title-card">3. Sobremetal por face</h3><div class="ds-segmented" role="group" aria-label="Distribuição"><button type="button" data-stock-method="symmetric" aria-pressed="'+(method==='symmetric')+'">Referência simétrica</button><button type="button" data-stock-method="process" aria-pressed="'+(method==='process')+'">Método do processo</button></div></div>'+
   '<p class="t-caption formula">'+esc(RECEIVING.stock_rule.formula)+'</p>'+
   '<div class="stock-views">'+shown.map(c=>'<figure class="ds-stock"><figcaption><span class="t-eyebrow">Objetivo '+esc(c.label)+'</span>'+(target?'':'<span class="ds-status" data-status="confirm"><i aria-hidden="true"></i>não confirmado</span>')+'</figcaption>'+stockSvg(c.stock,{label:c.id,method})+'<div class="stock-values">'+jValue('Bruto recebido',jMm(c.stock.received??r.receivedMm,false),{unit:'mm'})+jValue('Sobremetal total',c.stock.valid?jMm(c.stock.totalMm,false):'—',{unit:'mm',kind:'remove'})+jValue('Face A',c.stock.valid?(method==='symmetric'?jMm(c.stock.symmetric.faceAMm,false):c.stock.method.faceAMm===null?'até limpar':jMm(c.stock.method.faceAMm,false)):'—',{unit:c.stock.valid&&(method==='symmetric'||c.stock.method.faceAMm!==null)?'mm':'',kind:'remove'})+jValue('Face B',c.stock.valid?(method==='symmetric'?jMm(c.stock.symmetric.faceBMm,false):c.stock.method.faceBMm===null?'fecha a medida':jMm(c.stock.method.faceBMm,false)):'—',{unit:c.stock.valid&&(method==='symmetric'||c.stock.method.faceBMm!==null)?'mm':'',kind:'remove'})+jValue('Dimensão final',jMm(c.valueMm,false),{unit:'mm',kind:'final'})+'</div></figure>').join('')+'</div>'+
   (method==='symmetric'?jTbc(RECEIVING.stock_rule.symmetric_reference.description,[RECEIVING.stock_rule.symmetric_reference.question],'Divisão simétrica a confirmar'):'<p class="t-body method-text"><b>Face A:</b> '+esc(RECEIVING.stock_rule.process_method.face_a)+'<br><b>Face B:</b> '+esc(RECEIVING.stock_rule.process_method.face_b)+'</p><p class="t-caption">A retirada real da Face A é calculada quando a espessura após a Face A for registrada no Controle.</p>')+
   '<div class="checkpoint-actions"><button type="button" class="ds-btn" data-variant="secondary" id="applyStockTiming" '+(shown.length===1&&shown[0].stock.valid?'':'disabled')+'>Usar referência simétrica no tempo previsto</button><span class="t-caption">'+(shown.length===1?'Ação explícita · somente planejamento; editável nas etapas de faceamento.':'Confirme um objetivo para usar no planejamento.')+'</span></div>'+
  '</section>'+
 '</div>'+
 '<footer class="checkpoint-foot"><button type="button" class="ds-btn" data-variant="'+(done?'primary':'secondary')+'" data-journey-next="op1">Ir para a 1ª operação →</button></footer>';
 const input=$('receivedThickness');
 input.onchange=()=>{const v=J.toNumber(input.value);state.journey.receiving.receivedMm=v!==null&&v>0?v:null;if(state.journey.receiving.recordedAt)state.journey.receiving.recordedAt=v?jNow():null;persist();journeyRender();};
 input.oninput=()=>{$('recordReceiving').disabled=!(J.toNumber(input.value)>0)};
 $('recordReceiving').onclick=()=>{const v=J.toNumber(input.value);if(!(v>0))return;state.journey.receiving.receivedMm=v;state.journey.receiving.recordedAt=jNow();persist();journeyRender();};
 host.querySelectorAll('[data-target-choice]').forEach(b=>b.onclick=()=>{
  if(target?.id===b.dataset.targetChoice)return;
  const by=($('targetConfirmer')?.value||'').trim();if(!by){$('targetConfirmer')?.focus();$('targetConfirmer')?.setAttribute('aria-invalid','true');return}
  journeyUI.confirmer=by;state.journey.receiving.targetChoice={id:b.dataset.targetChoice,by,at:jNow()};persist();journeyRender();
 });
 $('targetConfirmer')?.addEventListener('input',e=>{journeyUI.confirmer=e.target.value;e.target.removeAttribute('aria-invalid')});
 if($('clearTarget'))$('clearTarget').onclick=()=>{state.journey.receiving.targetChoice=null;persist();journeyRender();};
 host.querySelectorAll('[data-stock-method]').forEach(b=>b.onclick=()=>{journeyUI.stockMethod=b.dataset.stockMethod;journeyRender();});
 $('applyStockTiming').onclick=()=>{const c=shown[0];if(!c?.stock.valid)return;const ids=OPERATOR_CONFIG.process_timing.face_milling.stage_ids;state.faceTiming.stockByStage[ids[0]]=c.stock.symmetric.faceAMm;state.faceTiming.stockByStage[ids[1]]=c.stock.symmetric.faceBMm;persist();renderStageFlow();renderJobTiming();journeyRender();$('applyStockTiming').textContent='Aplicado ao tempo previsto';};
}
function controlRecord(id){return state.journey.controls[id]??={measuredMm:null,note:'',releasedAt:null};}
function renderControl(host,node){
 const c=controlRecord(node.id),done=!!c.releasedAt,plan=J.stockPlan(OPERATOR_CONFIG,state.journey),target=J.confirmedTarget(OPERATOR_CONFIG,state.journey),op=processOperations[node.id==='control-op1'?0:1];
 const opDone=op.phases.every(id=>state.operator[String(id)]?.completed===true),measured=J.toNumber(c.measuredMm);
 const compare=node.measure?plan.filter(t=>!target||t.id===target.id).map(t=>jValue('Δ vs '+t.label+' ('+jMm(t.valueMm)+')',measured===null?'—':(measured-t.valueMm>=0?'+':'')+jMm(Math.round((measured-t.valueMm)*1000)/1000,false),{unit:measured===null?'':'mm',note:'tolerância a confirmar'})).join(''):'';
 host.innerHTML='<header class="checkpoint-head"><div><span class="t-eyebrow">Controle · após a '+(op.id+1)+'ª operação</span><h2 class="t-title-stage">'+esc(node.title)+'</h2><p class="checkpoint-objective">'+(opDone?'Operação concluída. Registrar a inspeção antes de seguir.':'A '+(op.id+1)+'ª operação ainda tem etapas abertas; o controle pode ser preparado, mas a liberação acontece depois.')+'</p></div>'+jStatus(done?'done':'active',done?'Liberado (registro local)':'Aguardando inspeção')+'</header>'+
 '<div class="checkpoint-grid">'+
  (node.id==='control-op1'?'<section class="ds-panel"><h3 class="t-title-card">Espessura após a Face A <small>(opcional)</small></h3><label class="ds-field"><span class="ds-field-label">Medida após limpar a Face A</span><span class="ds-field-control"><input id="afterFaceA" type="number" step="0.01" min="0" inputmode="decimal" placeholder="Medir" value="'+(state.journey.controls.afterFaceAMm??'')+'"><span class="ds-field-unit">mm</span></span></label><p class="t-caption">Permite calcular a retirada real da Face A e o restante para a Face B (método do processo).</p>'+plan.filter(t=>!target||t.id===target.id).map(t=>t.stock.valid&&t.stock.method.faceAMm!==null?'<div class="stock-values">'+jValue('Retirado na Face A',jMm(t.stock.method.faceAMm,false),{unit:'mm',kind:'remove'})+jValue('Restante Face B · '+t.label,jMm(t.stock.method.faceBMm,false),{unit:'mm',kind:'remove'})+'</div>':'').join('')+'</section>':'')+
  '<section class="ds-panel"><h3 class="t-title-card">'+(node.measure?esc(node.measure.label):'Medição e observação')+'</h3>'+
   (node.measure?'<label class="ds-field" data-size="xl"><span class="ds-field-label">Espessura medida</span><span class="ds-field-control"><input id="controlMeasure" type="number" step="0.01" min="0" inputmode="decimal" placeholder="Medir" value="'+(c.measuredMm??'')+'"><span class="ds-field-unit">mm</span></span></label><div class="stock-values">'+compare+'</div>':'')+
   '<label class="ds-field"><span class="ds-field-label">Observação da inspeção</span><textarea id="controlNote" rows="3" maxlength="1000" placeholder="Instrumento, pontos medidos, ocorrência">'+esc(c.note||'')+'</textarea></label>'+
  '</section>'+
  '<section class="ds-panel"><h3 class="t-title-card">Critério de liberação</h3>'+(node.criteria?'<p>'+esc(node.criteria)+'</p>':jTbc('Nenhum critério de liberação cadastrado. O registro abaixo é local e não substitui a inspeção oficial.',node.questions,'Critério a confirmar'))+
   '<div class="checkpoint-actions"><button type="button" class="ds-btn" data-variant="primary" id="releaseControl" '+((node.measure?measured>0:String(c.note||'').trim())?'':'disabled')+'>'+(done?'Liberação registrada · desfazer':'Registrar inspeção e liberar')+'</button>'+(done?'<span class="t-caption">Registrado às '+esc(J.formatClock(c.releasedAt))+'</span>':'')+'</div>'+
  '</section>'+
 '</div>'+
 '<footer class="checkpoint-foot"><button type="button" class="ds-btn" data-variant="secondary" data-journey-back="'+op.id+'">← Voltar à '+(op.id+1)+'ª operação</button>'+(node.id==='control-op1'?'<button type="button" class="ds-btn" data-variant="'+(done?'primary':'secondary')+'" data-journey-next="op2">Ir para a 2ª operação →</button>':'')+'</footer>';
 if($('afterFaceA'))$('afterFaceA').onchange=e=>{const v=J.toNumber(e.target.value);state.journey.controls.afterFaceAMm=v>0?v:null;persist();journeyRender();};
 if($('controlMeasure')){$('controlMeasure').onchange=e=>{const v=J.toNumber(e.target.value);c.measuredMm=v>0?v:null;c.releasedAt=null;persist();journeyRender();};$('controlMeasure').oninput=e=>{$('releaseControl').disabled=!(J.toNumber(e.target.value)>0)};}
 $('controlNote').onchange=e=>{c.note=e.target.value;persist();if(!node.measure)journeyRender();};
 if(!node.measure)$('controlNote').oninput=e=>{$('releaseControl').disabled=!e.target.value.trim()};
 $('releaseControl').onclick=()=>{c.releasedAt=done?null:jNow();persist();journeyRender();};
}
function renderHeat(host,node){
 const d=OPERATOR_CONFIG.drawing.thickness_mm,f=OPERATOR_CONFIG.fixture.face_method;
 host.innerHTML='<header class="checkpoint-head"><div><span class="t-eyebrow">Fase externa · posição a confirmar</span><h2 class="t-title-stage">'+esc(node.title)+'</h2><p class="checkpoint-objective">'+esc(node.evidence)+'</p></div>'+jStatus('confirm','Sequência a confirmar')+'</header>'+
 '<div class="checkpoint-grid"><section class="ds-panel"><h3 class="t-title-card">O que os arquivos informam</h3><div class="stock-values">'+jValue('Desenho · antes do T.T.',jMm(d.before_heat_treatment,false),{unit:'mm',note:'página 1'})+jValue('Desenho · depois do T.T.',jMm(d.after_heat_treatment,false),{unit:'mm',note:'página 1'})+jValue('Processo · meta antes do T.T.',jMm(f.pre_heat_target_mm,false),{unit:'mm',note:'informado pelo processo'})+jValue('Reserva para após o T.T.',jMm(f.allowance_for_after_heat_mm,false),{unit:'mm',note:'processo'})+'</div></section>'+
 '<section class="ds-panel"><h3 class="t-title-card">O que falta definir</h3>'+jTbc('A posição do tratamento térmico na sequência, o fornecedor e quem libera o retorno não foram informados. A 2ª operação não é bloqueada por esta fase no protótipo.',node.questions,'Tratamento térmico a confirmar')+'</section></div>';
}
function renderOp3(host){
 const node=JOURNEY.nodes.find(n=>n.id==='op3');
 host.innerHTML='<header class="checkpoint-head"><div><span class="t-eyebrow">3ª operação</span><h2 class="t-title-stage">Processo ainda não definido</h2><p class="checkpoint-objective">Nenhum programa, montagem ou ferramenta foi recebido. Nada foi presumido.</p></div>'+jStatus('undefined','Não definida')+'</header>'+jTbc('',node.questions,'Definição da 3ª operação');
}
function renderJourneyView(){
 const host=$('journeyStage');if(!host)return;
 const view=state.journey.view,node=JOURNEY.nodes.find(n=>n.id===view);
 document.body.dataset.journeyView=view||(state.operation===2?'op3':'operation');
 if(!node&&state.operation!==2){host.innerHTML='';host.hidden=true;return}
 host.hidden=false;
 if(!node)renderOp3(host);else if(node.kind==='receiving')renderReceiving(host);else if(node.kind==='control')renderControl(host,node);else if(node.kind==='external')renderHeat(host,node);
 host.querySelectorAll('[data-journey-next]').forEach(b=>b.onclick=()=>{const n=JOURNEY.nodes.find(n=>n.id===b.dataset.journeyNext);state.journey.view=null;persist();const op=processOperations[n.operation];const first=op.phases.find(id=>!state.operator[String(id)]?.completed)??op.phases[0];selectPhase(first);journeyRender();window.scrollTo({top:0});});
 host.querySelectorAll('[data-journey-back]').forEach(b=>b.onclick=()=>{state.journey.view=null;persist();selectOperation(Number(b.dataset.journeyBack));journeyRender();});
 host.querySelectorAll('[data-question-link]').forEach(a=>a.onclick=()=>{$('questionsPanel').open=true;});
}

/* ---------- Stage header: where am I, what now, time ---------- */
function renderStageHeader(){
 const pending=state.operation===2,id=state.phase,s=pending?null:jStageIndex(id),cfg=stageConfig(),t=jRecordTimes(id),planned=pending?null:jPlanned(id);
 let eyebrow=$('stageEyebrow');if(!eyebrow){eyebrow=document.createElement('span');eyebrow.id='stageEyebrow';eyebrow.className='t-eyebrow';$('phaseTitle').before(eyebrow);}
 eyebrow.textContent=pending?'3ª operação':(s.op.id+1)+'ª operação · etapa '+s.index+' de '+s.total+(cfg?.intent?' · '+cfg.intent.type:'');
 let intent=$('stageIntent');if(!intent){intent=document.createElement('p');intent.id='stageIntent';intent.className='stage-intent';$('phaseTitle').after(intent);}
 intent.textContent=pending?'':cfg?.intent?.objective||'';intent.hidden=pending||!cfg?.intent;
 let complete=$('completeStage');if(!complete){complete=document.createElement('button');complete.id='completeStage';complete.type='button';$('startStageExecution').after(complete);complete.onclick=()=>{const box=document.querySelector('[data-stage-complete="'+state.phase+'"]');if(box&&!box.checked)box.click();};}
 complete.hidden=pending||!t.started||t.completed;complete.textContent='Concluir etapa';complete.className='ds-btn';complete.dataset.variant='primary';
 $('startStageExecution').className='ds-btn';$('startStageExecution').dataset.variant=t.started||t.completed?'secondary':'primary';
 let time=$('stageTime');if(!time){time=document.createElement('div');time.id='stageTime';time.className='ds-time';$('currentProgram').closest('.current-work').append(time);}
 if(pending){time.innerHTML='';time.hidden=true}else{
  time.hidden=false;const elapsed=t.startedAt?J.elapsedMs(t.startedAt,t.completedAt):null;
  time.innerHTML=jValue('Usinagem estimada',planned===null?'A definir':esc(plannedDuration(planned)),{note:planned===null?'informar sobremetal da face':'TAP + '+OPERATOR_CONFIG.process_timing.allowance_percent+'%'})+
   jValue('Preparação','Não informado',{note:'tempo de setup a confirmar',kind:'confirm'})+
   jValue(t.completed?'Concluída às':'Iniciada às',t.completed?esc(J.formatClock(t.completedAt)||'—'):t.startedAt?esc(J.formatClock(t.startedAt)):'—',{note:t.startedAt&&t.completed?'início '+J.formatClock(t.startedAt):t.started?'registro local':'aguardando início'})+
   jValue(t.completed?'Tempo real':'Decorrido',elapsed===null?'—':esc(J.formatDuration(elapsed)),{note:t.completed&&elapsed!==null&&planned?'previsto '+plannedDuration(planned):t.started?'atualiza a cada 30 s':'sem registro',kind:t.started&&!t.completed?'live':''});
 }
 // Next stage highlight after completion.
 let banner=$('nextStageBanner');if(!banner){banner=document.createElement('div');banner.id='nextStageBanner';banner.className='ds-alert';banner.dataset.kind='done';banner.setAttribute('role','status');$('stageGuide').before(banner);}
 const next=pending?null:J.nextPhase(OPERATOR_CONFIG,id),nextOpen=next!==null&&!state.operator[String(next)]?.completed;
 const ctl=!pending&&s.index===s.total?JOURNEY.nodes.find(n=>n.kind==='control'&&n.after===jNodeOfPhase(id)?.id):null;
 banner.hidden=pending||!t.completed;
 banner.innerHTML=t.completed?'<div><strong>✓ Etapa concluída'+(t.completedAt?' às '+esc(J.formatClock(t.completedAt)):'')+'</strong><p>'+(ctl&&!J.controlDone(state.journey,ctl.id)?'Próximo: '+esc(ctl.title)+' antes de seguir.':nextOpen?'Próxima etapa: '+esc(jProgramFile(next))+' · '+esc(stageLabels[next]):'Sem etapa definida em seguida.')+'</p></div>'+(ctl&&!J.controlDone(state.journey,ctl.id)?'<button type="button" class="ds-btn" data-variant="primary" data-open-control="'+ctl.id+'">Abrir '+esc(ctl.title.toLowerCase())+' →</button>':nextOpen?'<button type="button" class="ds-btn" data-variant="primary" id="openNextStage">Abrir próxima etapa →</button>':''):'';
 if($('openNextStage'))$('openNextStage').onclick=()=>{selectPhase(next);journeyUI.section='preparacao';journeyRender();$('stageGuide').scrollIntoView({block:'nearest'});};
 banner.querySelectorAll('[data-open-control]').forEach(b=>b.onclick=()=>jOpenView(b.dataset.openControl));
 document.querySelectorAll('#steps .stage-box').forEach(box=>box.dataset.next=String(!pending&&t.completed&&nextOpen&&Number(box.dataset.stage)===next));
}

/* ---------- Guided sections of the current stage ---------- */
function jToolsFor(){const file=displayedProgramFile();return file?(DATA.programs.find(p=>p.file===file)?.tools||[]).map(id=>({t:DATA.tools.find(t=>t.id===id),file})):[];}
function jToolMount(t,file){
 const rule=mountingRule(t,file),shown=operationalToolDescent(t,rule),phys=physicalToolData(t.id),rec=rule.recommended,standard=OPERATOR_CONFIG.tool_mounting.tools[t.id]?.mounting_mode==='standard';
 const ok=phys.mount!==null&&(standard||rec===null||phys.mount>=rec);
 return {rule,shown,phys,rec,ok,standard,low:phys.mount!==null&&rec!==null&&!standard&&phys.mount<rec,label:mountingLabel(t,rule)};
}
function toolDiagram(m){
 // Descent (from Z0 down) and recommended stick-out are drawn as two different dimensions.
 const d=m.shown.value,rec=m.rec;if(d===null||!(d>0)||rec===null)return '';
 const scale=110/Math.max(rec,d),dh=d*scale,rh=rec*scale,z0=40,tip=z0+dh,topTool=tip-rh;
 return '<svg class="tool-diagram" viewBox="0 '+Math.min(0,topTool-34)+' 150 '+(tip+30-Math.min(0,topTool-34))+'" role="img" aria-label="Descida máxima '+jMm(d)+' a partir de Z0; montagem recomendada '+jMm(rec)+'">'+
  '<rect x="36" y="'+(topTool-30)+'" width="38" height="30" class="td-holder"/>'+
  '<rect x="48" y="'+topTool+'" width="14" height="'+rh+'" class="td-tool"/>'+
'<line x1="10" y1="'+z0+'" x2="100" y2="'+z0+'" class="td-z0"/><text x="102" y="'+(z0+4)+'" class="td-text">Z0 topo</text>'+
  '<line x1="22" y1="'+z0+'" x2="22" y2="'+(z0+dh)+'" class="td-descent"/><text x="2" y="'+(z0+dh+14)+'" class="td-text td-descent-text">descida</text>'+
  '<line x1="86" y1="'+(z0+dh-rh)+'" x2="86" y2="'+(z0+dh)+'" class="td-rec"/><text x="90" y="'+(z0+dh-rh/2)+'" class="td-text td-rec-text">montagem</text></svg>';
}
function guideContent(id){
 const pending=state.operation===2,cfg=stageConfig(),p=phases[state.phase],file=displayedProgramFile(),refs=engineeringReferences(),fx=OPERATOR_CONFIG.fixture,onSupports=(cfg?.setup||'').includes('calços');
 const drawingRef=cfg?.drawing_reference||{};
 switch(id){
 case 'preparacao':return {
  html:'<div class="guide-grid">'+jValue('Objetivo',esc(cfg?.intent?.objective||'Objetivo a confirmar'),{size:'text'})+jValue('Posição da peça',esc((cfg?.orientation?.rotation_x_degrees===180?'Invertida — ':'')+(state.phase===0?fx.orientation_sequence.first_face:fx.orientation_sequence.after_tumble)),{size:'text',note:'orientação definida pelo processo'})+'</div>'+
   '<div class="guide-drawing"><div>'+jValue('Desenho relacionado',esc(OPERATOR_CONFIG.drawing.file),{size:'text',note:drawingRef.page?'folha '+drawingRef.page:'folha/região da etapa a confirmar'})+'</div><button type="button" class="ds-btn" data-variant="secondary" data-guide-drawing>Abrir desenho</button></div>'+(drawingRef.page?'':jTbc('Página e região do desenho para esta etapa não cadastradas.',['q-drawing-regions'])),
  check:['Ler o objetivo e as instruções numeradas','Conferir lado e posição pelo 3D e pelas cavidades',p.kind==='face'?'Face desta etapa: '+(state.phase===0?'Face A':'Face B'):'Programa desta etapa: '+(file||'a confirmar')]};
 case 'fixacao':return {
  html:'<div class="guide-grid">'+jValue('Montagem',esc(cfg?.setup==='mesa'?'Sobre a mesa':cfg?.setup||'A confirmar'),{size:'text'})+jValue('Alinhamento',esc(fx.alignment.value),{size:'text',note:fx.alignment.provenance})+(onSupports?jValue('Apoios',esc(fx.supports),{size:'text'})+jValue('Garras',esc(fx.top_clamps),{size:'text'}):jValue('Fixação',esc((cfg?.instructions||[])[0]||'A confirmar'),{size:'text'}))+'</div>'+
   jTbc('Montagem ilustrativa: posição, altura e folga de calços e garras não validadas fisicamente.',['q-fixture'],'Validação física a confirmar'),
  check:[fx.alignment.value,onSupports?'Quatro calços sob os pontos de aperto':'Peça assentada na mesa','Garras apertadas sobre os apoios','Sem interferência com o percurso (verificar na máquina)']};
 case 'referencia':return {
  html:'<div class="ds-origin" role="group" aria-label="Referência da peça">'+
   [['X0',refs.x,'x'],['Y0',refs.y,'y'],['Z0',refs.z,'z']].map(([k,v,a])=>'<div class="ds-origin-cell" data-axis="'+a+'"><span class="ds-origin-axis">'+k+'</span><strong>'+esc(v||'A confirmar')+'</strong><small>'+(a==='z'?'preset da ferramenta':'origem da peça')+'</small></div>').join('')+'</div>'+
   '<div class="origin-views">'+originSvg(refs)+'</div><p class="t-caption">'+esc(OPERATOR_CONFIG.reference_defaults.exceptions)+'</p>',
  check:['X0: '+(refs.x||'a confirmar'),'Y0: '+(refs.y||'a confirmar'),'Z0: '+(refs.z||'a confirmar')+' · presetar a ferramenta','WCS do programa: '+(cncData?.[file]?.meta.wcs.join(' / ')||'a confirmar')]};
 case 'ferramentas':{
  const tools=jToolsFor();
  return {html:tools.length?'<div class="guide-tools">'+tools.map(({t,file})=>{const m=jToolMount(t,file);return '<article class="ds-toolcard" data-ok="'+m.ok+'" data-low="'+m.low+'"><header><b class="t-code-lg">T'+t.id+'</b><div><strong>'+esc(toolNames[t.id]||t.name)+'</strong><small>Ø'+jMm(t.diameter,false)+' nominal</small></div></header><div class="ds-toolcard-pair"><div class="pair-descent"><span>'+esc(m.shown.label)+'</span><strong>'+exactLength(m.shown.value)+'</strong><small>quanto o programa desce a partir de Z0</small></div><div class="pair-mount"><span>Montagem recomendada</span><strong>'+esc(m.label)+'</strong><small>comprimento para fora da pinça com margem</small></div></div>'+toolDiagram(m)+'<p class="ds-toolcard-measure">'+(m.phys.mount===null?jStatus('waiting','Montagem medida: não informada'):m.low?jStatus('blocked','Medida '+exactLength(m.phys.mount)+' abaixo da recomendada'):jStatus('done','Medida '+exactLength(m.phys.mount)))+'</p></article>';}).join('')+'</div><p class="t-caption">Os dois valores não são a mesma coisa: a descida vem do TAP; a montagem recomendada soma a margem de '+exactLength(state.margin)+' e arredonda para cima. Edite as medidas na tabela Ferramentas do trabalho.</p>':'<p>Etapa de montagem manual · sem ferramenta.</p>',
   check:tools.map(({t,file})=>{const m=jToolMount(t,file);return 'T'+t.id+': montagem medida '+(m.standard?'':'≥ ')+m.label+(m.ok?' ✓':'')}).concat(['Diâmetro real e corretor conferidos'])};}
 case 'programa':{
  const prog=DATA.programs.find(p=>p.file===file),meta=cncData?.[file]?.meta,st=jStrategies(file);
  return {html:'<div class="ds-titleblock">'+
   '<div class="tb-cell tb-wide"><span>Programa</span><strong class="t-code-lg">'+esc(file||'A confirmar')+'</strong></div>'+
   '<div class="tb-cell"><span>Ferramentas</span><strong class="t-code">'+esc((prog?.tools||[]).map(t=>'T'+t).join(' · ')||'—')+'</strong></div>'+
   '<div class="tb-cell"><span>Origem</span><strong class="t-code">'+esc(meta?.wcs?.join(' / ')||'—')+'</strong></div>'+
   '<div class="tb-cell tb-wide"><span>Estratégias no TAP</span><strong>'+esc(st.join(' · ')||'—')+'</strong></div>'+
   '<div class="tb-cell"><span>Tempo no cabeçalho</span><strong>'+esc(prog?strategyTime(prog.seconds):'—')+'</strong></div>'+
   '<div class="tb-cell"><span>Previsto com margem</span><strong>'+esc(plannedDuration(jPlanned(state.phase)))+'</strong></div>'+
   '<div class="tb-cell tb-full"><span>Movimentos calculados</span><strong>'+esc(meta?meta.motion_count.toLocaleString('pt-BR'):'—')+'</strong></div>'+
   '</div><div class="checkpoint-actions"><button type="button" class="ds-btn" data-variant="secondary" data-guide-details>Ver estratégias, linhas L/N e in-process</button></div>',
   check:['Carregar '+(file||'programa a confirmar'),'Conferir revisão do programa: '+(cfg?.program_revision||'não informada'),'Play percurso é só visualização; não registra execução']};}
 case 'usinagem':{
  const t=jRecordTimes(state.phase),planned=jPlanned(state.phase),elapsed=t.startedAt?J.elapsedMs(t.startedAt,t.completedAt):null;
  return {html:'<div class="guide-grid">'+jValue('Status',esc(operatorStatus()),{size:'text'})+jValue('Estimado',planned===null?'A definir':esc(plannedDuration(planned)),{note:'cabeçalho do TAP + margem'})+jValue('Iniciado às',t.startedAt?esc(J.formatClock(t.startedAt)):'—')+jValue(t.completed?'Tempo real':'Decorrido',elapsed===null?'—':esc(J.formatDuration(elapsed)))+'</div>'+
   '<div class="checkpoint-actions">'+(t.completed?'<span>'+jStatus('done','Etapa concluída')+'</span>':t.started?'<button type="button" class="ds-btn" data-variant="primary" data-guide-action="complete">Concluir etapa</button>':'<button type="button" class="ds-btn" data-variant="primary" data-guide-action="start">Iniciar etapa</button>')+'</div><p class="t-caption">Tempo real é registro manual deste navegador (início e conclusão). Não há coleta automática da máquina.</p>',
   check:['Iniciar etapa somente com a máquina pronta','Acompanhar o tempo decorrido','Registrar a conclusão ao fim do programa']};}
 case 'inspecao':{
  const ins=cfg?.inspection||{},proposal=OPERATOR_CONFIG.inprocess_proposals?.[file];
  let html='';
  if(state.phase===2)html='<p>Medir a espessura final após a Face B e registrar no <b>Controle de espessura</b>.</p><div class="stock-values">'+J.targetCandidates(OPERATOR_CONFIG).map(c=>jValue('Objetivo '+c.label,jMm(c.valueMm,false),{unit:'mm',note:c.detail})).join('')+'</div>'+jTbc('Objetivo divergente e tolerância não cadastrada.',['q-target-thickness','q-thickness-tolerance'])+'<div class="checkpoint-actions"><button type="button" class="ds-btn" data-variant="secondary" data-open-control="control-op1">Abrir controle de espessura →</button></div>';
  else if(proposal)html='<p><b>'+esc(proposal.title)+'</b> — '+esc(proposal.objective)+'</p><p class="t-caption">Proposta in-process do operador; TAP atual preservado.</p>'+jTbc('Critério de aceitação da proposta não aprovado.',['q-inprocess','q-stage-inspection'])+'<div class="checkpoint-actions"><button type="button" class="ds-btn" data-variant="secondary" data-guide-details>Ver proposta in-process</button></div>';
  else if(ins.registered&&ins.criteria)html='<p>'+esc(ins.criteria)+'</p>';
  else html=(state.phase===0?'<p>Após limpar a Face A, a espessura pode ser registrada no Controle de espessura (opcional) para calcular o restante da Face B.</p>':'')+jTbc('Nenhum critério de inspeção cadastrado para esta etapa.',['q-stage-inspection']);
  return {html,check:ins.registered?[ins.kind||'Medição registrada']:['Critério de inspeção a confirmar']};}
 case 'conclusao':{
  const t=jRecordTimes(state.phase),r=state.operator[String(state.phase)]||{},next=J.nextPhase(OPERATOR_CONFIG,state.phase);
  return {html:'<label class="ds-field"><span class="ds-field-label">Observação da etapa (vai para o passaporte)</span><textarea id="guideNote" rows="3" maxlength="2000" placeholder="Ocorrência, ajuste de corretor, medida">'+esc(r.note||'')+'</textarea></label>'+
   '<div class="checkpoint-actions">'+(t.completed?jStatus('done','Etapa concluída'+(t.completedAt?' às '+J.formatClock(t.completedAt):'')):'<button type="button" class="ds-btn" data-variant="primary" data-guide-action="complete">Concluir etapa</button>')+'<span class="t-caption">Próxima: '+esc(next!==null?jProgramFile(next)+' · '+stageLabels[next]:'controle / etapa a definir')+'</span></div>',
   check:['Etapa registrada como concluída','Observações anotadas','Próxima etapa destacada automaticamente']};}
 }
 return {html:'',check:[]};
}
function originSvg(refs){
 const w=OPERATOR_CONFIG.simulation.part_mm.width,d=OPERATOR_CONFIG.simulation.part_mm.depth,center=refs.center;
 return '<figure class="origin-fig"><figcaption class="t-eyebrow">Vista de cima</figcaption><svg viewBox="0 0 320 180" role="img" aria-label="Vista superior: X0 e Y0 no '+(center?'centro':'ponto indicado')+' da peça"><rect x="20" y="20" width="280" height="'+(280*d/w)+'" class="og-part"/>'+(center?'<line x1="160" y1="'+(20+140*d/w)+'" x2="250" y2="'+(20+140*d/w)+'" class="og-x"/><line x1="160" y1="'+(20+140*d/w)+'" x2="160" y2="'+(20+140*d/w-60)+'" class="og-y"/><circle cx="160" cy="'+(20+140*d/w)+'" r="6" class="og-zero"/><text x="254" y="'+(24+140*d/w)+'" class="og-label og-x-text">X+</text><text x="150" y="'+(20+140*d/w-64)+'" class="og-label og-y-text">Y+</text><text x="168" y="'+(36+140*d/w)+'" class="og-label">X0 Y0 · centro</text>':'<text x="160" y="90" text-anchor="middle" class="og-label">X0/Y0 a confirmar</text>')+'<text x="20" y="'+(36+280*d/w)+'" class="og-dim">'+jMm(w)+' × '+jMm(d)+' (contorno do desenho)</text></svg></figure>'+
 '<figure class="origin-fig"><figcaption class="t-eyebrow">Vista lateral</figcaption><svg viewBox="0 0 320 180" role="img" aria-label="Vista lateral: Z0 no topo da peça"><rect x="20" y="70" width="280" height="60" class="og-part"/><line x1="10" y1="70" x2="310" y2="70" class="og-z"/><circle cx="160" cy="70" r="6" class="og-zero"/><line x1="160" y1="70" x2="160" y2="20" class="og-z"/><text x="166" y="28" class="og-label og-z-text">Z+</text><text x="168" y="62" class="og-label">Z0 · '+esc(refs.z||'a confirmar')+'</text><text x="20" y="152" class="og-dim">Preset no topo · descidas negativas</text></svg></figure>';
}
function renderGuide(){
 const host=$('stageGuide');if(!host)return;
 const pending=state.operation===2;host.hidden=pending||state.journey.view!==null;if(host.hidden)return;
 if(journeyUI.lastPhase!==state.phase){journeyUI.lastPhase=state.phase;journeyUI.section='preparacao';journeyUI.visited=new Set(['preparacao']);}
 const t=jRecordTimes(state.phase);
 const tbcSections=new Set(['fixacao']);const cfg=stageConfig();if(!cfg?.drawing_reference?.page)tbcSections.add('preparacao');if(!(cfg?.inspection?.registered&&cfg.inspection.criteria))tbcSections.add('inspecao');
 $('guideNav').innerHTML=GUIDE.map((s,i)=>{const cur=s.id===journeyUI.section,done=s.id==='usinagem'?t.started||t.completed:s.id==='conclusao'?t.completed:journeyUI.visited.has(s.id)&&!cur;
  return '<button type="button" role="tab" data-guide="'+s.id+'" aria-selected="'+cur+'" data-state="'+(cur?'current':done?'done':'todo')+'"><b>'+(done&&!cur?'✓':i+1)+'</b><span>'+esc(s.title)+'</span>'+(tbcSections.has(s.id)?'<i class="guide-tbc" title="Contém informação a confirmar">?</i>':'')+'</button>';}).join('');
 $('guideNav').querySelectorAll('[data-guide]').forEach(b=>b.onclick=()=>jSection(b.dataset.guide));
 const sec=GUIDE.find(s=>s.id===journeyUI.section),content=guideContent(sec.id);
 document.querySelectorAll('[data-guide-panel]').forEach(p=>p.hidden=p.dataset.guidePanel!==sec.id);
 const target=document.querySelector('[data-guide-panel="'+sec.id+'"] .guide-dynamic');if(target)target.innerHTML=content.html;
 $('guideNow').innerHTML='<span class="t-eyebrow">Agora · '+(GUIDE.indexOf(sec)+1)+' de '+GUIDE.length+'</span><strong>'+esc(sec.prompt)+'</strong>';
 $('guideCheck').innerHTML='<h4 class="t-eyebrow">Conferir antes de continuar</h4><ul>'+content.check.map(c=>'<li>'+esc(c)+'</li>').join('')+'</ul>';
 const i=GUIDE.indexOf(sec);$('guidePrev').disabled=i===0;$('guideNext').disabled=i===GUIDE.length-1;$('guideNext').textContent=i<GUIDE.length-1?GUIDE[i+1].title+' →':'Fim do roteiro';
 host.querySelectorAll('[data-guide-drawing]').forEach(b=>b.onclick=()=>{state.visualMode='drawing';persist();applyVisualMode();$('view3DPanel').closest('.viewer').scrollIntoView({block:'nearest'});});
 host.querySelectorAll('[data-guide-details]').forEach(b=>b.onclick=()=>{tab('details');document.querySelector('.sidebar').scrollIntoView({block:'nearest'});});
 host.querySelectorAll('[data-guide-action="start"]').forEach(b=>b.onclick=()=>$('startStageExecution').click());
 host.querySelectorAll('[data-guide-action="complete"]').forEach(b=>b.onclick=()=>$('completeStage').click());
 host.querySelectorAll('[data-open-control]').forEach(b=>b.onclick=()=>jOpenView(b.dataset.openControl));
 host.querySelectorAll('[data-question-link]').forEach(a=>a.onclick=()=>{$('questionsPanel').open=true;});
 if($('guideNote'))$('guideNote').onchange=e=>{operatorRecord().note=e.target.value;persist();renderPassport();};
}
function jSection(id){journeyUI.section=id;journeyUI.visited.add(id);renderGuide();journey3D();}
$('guidePrev').onclick=()=>{const i=GUIDE.findIndex(s=>s.id===journeyUI.section);if(i>0)jSection(GUIDE[i-1].id)};
$('guideNext').onclick=()=>{const i=GUIDE.findIndex(s=>s.id===journeyUI.section);if(i<GUIDE.length-1)jSection(GUIDE[i+1].id)};

/* ---------- 3D in context (orientative; never certifies collisions) ---------- */
let journeyAxes=null,journeyFaceLayer=null;
function jAxisColor(name){return new THREE.Color(getComputedStyle(document.documentElement).getPropertyValue('--'+name).trim()||'#888');}
function jLabelSprite(text,color){const c=document.createElement('canvas');c.width=192;c.height=96;const g=c.getContext('2d');g.fillStyle='rgba(255,255,255,.92)';g.fillRect(0,0,192,96);g.strokeStyle=color;g.lineWidth=6;g.strokeRect(3,3,186,90);g.fillStyle=color;g.font='600 52px "IBM Plex Sans", sans-serif';g.textAlign='center';g.textBaseline='middle';g.fillText(text,96,52);const s=new THREE.Sprite(new THREE.SpriteMaterial({map:new THREE.CanvasTexture(c),depthTest:false}));s.scale.set(150,75,1);s.renderOrder=10;return s;}
function jEnsure3D(){
 if(typeof scene==='undefined'||!scene)return false;
 if(!journeyAxes){
  journeyAxes=new THREE.Group();journeyAxes.name='journey-origin-axes';journeyAxes.userData={role:'reference-axes',provenance:'reference_defaults; ilustrativo'};
  for(const [axis,dir,label] of [['axis-x',[1,0,0],'X0'],['axis-y',[0,0,-1],'Y0'],['axis-z',[0,1,0],'Z0']]){
   const color=jAxisColor(axis),end=new THREE.Vector3(...dir).multiplyScalar(260);
   const line=new THREE.Line(new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(),end]),new THREE.LineBasicMaterial({color,depthTest:false}));line.renderOrder=9;journeyAxes.add(line);
   const cone=new THREE.Mesh(new THREE.ConeGeometry(12,36,16),new THREE.MeshBasicMaterial({color,depthTest:false}));cone.position.copy(end);cone.renderOrder=9;
   if(dir[0])cone.rotation.z=-Math.PI/2;else if(dir[2])cone.rotation.x=-Math.PI/2;journeyAxes.add(cone);
   const sprite=jLabelSprite(label,'#'+color.getHexString());sprite.position.copy(end.clone().multiplyScalar(1.28));journeyAxes.add(sprite);
  }
  const dot=new THREE.Mesh(new THREE.SphereGeometry(14,20,12),new THREE.MeshBasicMaterial({color:0x0a3250,depthTest:false}));dot.renderOrder=9;journeyAxes.add(dot);
  journeyAxes.visible=false;scene.add(journeyAxes);
 }
 if(!journeyFaceLayer){
  const w=OPERATOR_CONFIG.simulation.part_mm.width,d=OPERATOR_CONFIG.simulation.part_mm.depth;
  journeyFaceLayer=new THREE.Mesh(new THREE.BoxGeometry(w+4,10,d+4),new THREE.MeshStandardMaterial({color:jAxisColor('stock-remove'),transparent:true,opacity:.55,depthWrite:false}));
  journeyFaceLayer.name='journey-face-layer';journeyFaceLayer.userData={role:'material-to-remove',scale:'espessura exagerada; ilustrativo'};journeyFaceLayer.visible=false;scene.add(journeyFaceLayer);
 }
 return true;
}
function jHighlight(groups,on){
 for(const g of groups){if(!g)continue;g.traverse(o=>{if(!o.isMesh)return;if(on){if(!o.userData.journeyOriginal){o.userData.journeyOriginal=o.material;o.material=o.material.clone();if(o.material.emissive){o.material.emissive=jAxisColor('stock-remove');o.material.emissiveIntensity=.55;}}}else if(o.userData.journeyOriginal){o.material.dispose();o.material=o.userData.journeyOriginal;delete o.userData.journeyOriginal;}});}
}
function journey3D(){
 if(!jEnsure3D())return;
 const pending=state.operation===2,sec=state.journey.view===null&&!pending?journeyUI.section:null,p=phases[state.phase];
 const top=plateBottom+OPERATOR_CONFIG.simulation.part_mm.thickness;
 journeyAxes.position.set(0,top,0);journeyAxes.visible=sec==='referencia'&&engineeringReferences().center;
 journeyFaceLayer.position.set(0,top+5,0);journeyFaceLayer.visible=(sec==='preparacao'||sec==='usinagem'||sec==='programa')&&p?.kind==='face';
 jHighlight([supports,clamps,strapClamps],sec==='fixacao');
 const caption={preparacao:p?.kind==='face'?'Destaque: face a usinar (camada de sobremetal exagerada)':'Peça e montagem da etapa',fixacao:'Destaque: calços e garras (ilustrativos)',referencia:'Destaque: origem X0 · Y0 · Z0 no topo da peça',ferramentas:'Ferramenta no início do percurso; porta-ferramenta ilustrativo',programa:'Percurso do programa: azul corte · laranja rápido',usinagem:'Use Play percurso para visualizar; não registra execução',inspecao:'Peça na posição da etapa',conclusao:'Peça na posição da etapa'}[sec]||'';
 const el=$('viewerContext');if(el){el.textContent=caption;el.hidden=!caption;}
 if(sec==='ferramentas'&&tool&&cncRows.length){tool.visible=true;placeTool(cncRows[0],0);}
 draw();
}

/* ---------- Passport and open questions ---------- */
function renderPassport(){
 const host=$('passportBody');if(!host)return;
 const pass=J.passport(OPERATOR_CONFIG,state.journey,state.operator,state.inspections,DATA),plan=J.stockPlan(OPERATOR_CONFIG,state.journey);
 const row=(k,v,note='')=>'<tr><th scope="row">'+esc(k)+'</th><td>'+v+(note?'<small>'+esc(note)+'</small>':'')+'</td></tr>';
 host.innerHTML='<table class="ds-table passport-table"><tbody>'+
  row('Espessura recebida',pass.receiving.receivedMm===null?'<span class="muted">Não registrada</span>':'<b>'+jMm(pass.receiving.receivedMm)+'</b>',pass.receiving.recordedAt?'registrada às '+J.formatClock(pass.receiving.recordedAt):'')+
  row('Espessura objetivo',pass.target.confirmed?'<b>'+jMm(pass.target.confirmed.valueMm)+'</b>':'<span class="ds-status" data-status="confirm"><i aria-hidden="true"></i>A confirmar</span> '+plan.map(c=>esc(c.label)+' '+jMm(c.valueMm)).join(' · '),pass.target.confirmed?'confirmado por '+pass.target.confirmed.by+' · engenharia: '+(pass.target.engineeringStatus||'—'):'')+
  row('Sobremetal total',plan.map(c=>c.stock.valid?esc(c.label)+': <b>'+jMm(c.stock.totalMm)+'</b>':esc(c.label)+': —').join(' · '))+
  row('Por face (referência simétrica)',plan.map(c=>c.stock.valid?esc(c.label)+': A '+jMm(c.stock.symmetric.faceAMm)+' / B '+jMm(c.stock.symmetric.faceBMm):'').filter(Boolean).join(' · ')||'—','divisão simétrica a confirmar')+
  row('Após a Face A',pass.afterFaceAMm===null?'—':jMm(pass.afterFaceAMm))+
  Object.entries(pass.controls).map(([id,c])=>row(JOURNEY.nodes.find(n=>n.id===id).title,(c.measuredMm===null?'':jMm(c.measuredMm)+' ')+(c.releasedAt?jStatus('done','liberado às '+J.formatClock(c.releasedAt)):jStatus('waiting','pendente')),c.note)).join('')+
 '</tbody></table>'+
 '<table class="ds-table passport-stages"><thead><tr><th scope="col">Etapa</th><th scope="col">Programa</th><th scope="col">Início</th><th scope="col">Conclusão</th><th scope="col">Tempo real</th><th scope="col">Registro</th></tr></thead><tbody>'+
  pass.stages.map(s=>'<tr data-status="'+(s.completed?'done':s.started?'running':'waiting')+'"><td>'+s.operation+'ª · '+esc(stageLabels[s.phase])+'</td><td class="t-code">'+esc(s.program||'—')+'</td><td>'+esc(s.startedAt?J.formatClock(s.startedAt):'—')+'</td><td>'+esc(s.completedAt?J.formatClock(s.completedAt):'—')+'</td><td>'+esc(s.realMs===null?'Tempo ainda não informado':J.formatDuration(s.realMs))+'</td><td>'+(s.completed?jStatus('done','Concluída'):s.started?jStatus('running','Em execução'):jStatus('waiting','Aguardando'))+(s.inspection&&(s.inspection.measured||s.inspection.adjustment)?'<small>Inspeção: '+esc([s.inspection.measured,s.inspection.adjustment].filter(Boolean).join(' · '))+'</small>':'')+(s.note?'<small>Obs.: '+esc(s.note)+'</small>':'')+'</td></tr>').join('')+
 '</tbody></table>';
 $('exportPassport').onclick=()=>{const blob=new Blob([JSON.stringify(J.passport(OPERATOR_CONFIG,state.journey,state.operator,state.inspections,DATA),null,2)],{type:'application/json'});const a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download='Passaporte_'+OPERATOR_CONFIG.part.order.replaceAll(' ','')+'.json';a.click();setTimeout(()=>URL.revokeObjectURL(a.href),1000);};
}
function renderQuestions(){
 const host=$('questionsBody');if(!host||host.dataset.rendered)return;host.dataset.rendered='1';
 $('questionsCount').textContent=QUESTIONS.length;
 const nodeTitle=id=>{const n=JOURNEY.nodes.find(n=>n.id===id);return n?n.short:id;};
 host.innerHTML='<ol class="questions-list">'+QUESTIONS.map(q=>'<li id="'+q.id+'" class="ds-tbc" data-variant="row"><span class="ds-tbc-mark" aria-hidden="true">?</span><div><strong>'+esc(q.question)+'</strong><p>'+esc(q.context)+'</p><small>Afeta: '+q.affects.map(nodeTitle).map(esc).join(' · ')+' · fonte: <code>'+esc(q.source)+'</code></small></div></li>').join('')+'</ol>';
}

/* ---------- Orchestration ---------- */
let journeyRendering=false;
function journeyRender(){
 if(journeyRendering)return;journeyRendering=true;
 try{jStampTimes();decorateJourneyMap();renderOsBar();renderJourneyView();renderStageHeader();renderGuide();renderPassport();renderQuestions();journey3D();}
 finally{journeyRendering=false;}
}
const journeyOriginalRenderOperational=renderOperational;
renderOperational=function(){journeyOriginalRenderOperational();journeyRender();};
const journeyOriginalNavigation=renderOperationNavigation;
renderOperationNavigation=function(){journeyOriginalNavigation();decorateJourneyMap();};
const journeyOriginalJobTiming=renderJobTiming;
renderJobTiming=function(){journeyOriginalJobTiming();if(!journeyRendering)renderOsBar();};
const journeyOriginalInit3d=init3d;
init3d=function(){journeyOriginalInit3d();journey3D();};
journeyUI.timer=setInterval(()=>{if(Object.values(state.operator).some(r=>r?.started&&!r?.completed))journeyRender();},30000);
window.columbiaJourney={domain:J,render:journeyRender,openView:jOpenView,openOperationView:()=>{state.journey.view=null;persist();journeyRender();},section:jSection,state:()=>state.journey,progress:()=>J.progress(OPERATOR_CONFIG,state.journey,state.operator),passport:()=>J.passport(OPERATOR_CONFIG,state.journey,state.operator,state.inspections,DATA),get3D:()=>({axes:journeyAxes,faceLayer:journeyFaceLayer})};
