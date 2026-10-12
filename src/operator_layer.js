__TOOL_LENGTH_DOMAIN__
__TOOL_VISUAL_DOMAIN__
__JOB_TIMING_DOMAIN__
__TOOL_WORK_DOMAIN__
// Operator layer reuses the CNC kernel, trajectories, fixture geometry and process phases.
const OPERATOR_CONFIG=__OPERATOR_CONFIG__;
const STRATEGY_DATA=__STRATEGY_DATA__;
__STRATEGY_UI__
const DRAWING_PAGES=__DRAWING_PAGES__;
state.operator=saved.operator&&typeof saved.operator==="object"?saved.operator:{};
state.visualMode=saved.visualMode==="drawing"?"drawing":"3d";
state.cuttingLengths=saved.cuttingLengths||{};
state.operationCheckins=saved.operationCheckins||{};state.toolMargins=saved.toolMargins||{};
// Stable phase 1 records remain archived; face 2 is a distinct, unapproved operation.
if(state.phase===1){state.phase=2;state.operationPhases[0]=2}
if(state.operationPhases[0]===1)state.operationPhases[0]=2;
if(saved.toolMountPolicy!==OPERATOR_CONFIG.tool_mounting.policy){
 state.margin=OPERATOR_CONFIG.tool_mounting.recommended_margin_mm;state.toolMargins={};state.operationCheckins={};
 for(const c of Object.values(state.checks))c.length=false;
 for(const r of Object.values(state.operator)){r.started=false;r.completed=false;r.finalConfirmed=false}
}
if(saved.margin===undefined)state.margin=OPERATOR_CONFIG.tool_mounting.recommended_margin_mm;
state.toolMountPolicy=OPERATOR_CONFIG.tool_mounting.policy;
function adoptedMargin(t){const n=number(Object.hasOwn(state.toolMargins,t.id)?state.toolMargins[t.id]:state.margin);return n!==null&&Number.isFinite(n)&&n>=0?n:null}
const lengthEvidenceCache=new Map();
function displayedProgramFile(){
 if(state.operation===2)return null;const p=phases[state.phase];
 const preview=p.program!==null?p:phases.find((v,i)=>i>state.phase&&selectedOperation().phases.includes(i)&&v.program!==null);
 return preview?DATA.programs[preview.program].file:null;
}
function workLengthEvidence(id,file){
 const d=cncData?.[file];if(!d)return {resolved:false,zMin:null,reason:'Análise a confirmar'};
 let stats=lengthEvidenceCache.get(file);
 if(!stats){stats=new Map();for(const r of d.segments){const tid=r[7];if(!tid)continue;let e=stats.get(tid);if(!e){e={zMin:Infinity,wcs:new Set(),valid:true};stats.set(tid,e)};if(!Number.isFinite(r[2])||!Number.isFinite(r[5]))e.valid=false;else e.zMin=Math.min(e.zMin,r[2],r[5]);e.wcs.add('G'+r[13])}lengthEvidenceCache.set(file,stats)}
 const e=stats.get(Number(id)),m=d.meta;
 // Only resolved work-coordinate trajectories; G53/unanchored transfers are excluded upstream.
 const blocking=(m.diagnostics||[]).filter(v=>v.code!=='UNVERIFIED_CUTTER_COMPENSATION');
 const resolved=!!e?.valid&&Number.isFinite(e.zMin)&&m.engine_ok===true&&m.engine_complete===true&&!blocking.length&&e.wcs.size===1;
 return {resolved,zMin:e?.zMin??null,file,wcs:e?[...e.wcs]:[],reason:resolved?'extraído do programa':'Z / estado modal / WCS a confirmar'};
}
function mountingRule(t,file=null){
 const top=file?engineeringReferences().z.toLowerCase().includes('topo'):t.programs.every(f=>{const ids=phases.map((p,i)=>p.program!==null&&DATA.programs[p.program].file===f?i:null).filter(i=>i!==null);return ids.length>0&&ids.every(i=>engineeringReferences(i).z.toLowerCase().includes('topo'))});
 const evidence=(file?[file]:t.programs).map(f=>workLengthEvidence(t.id,f));
 const resolved=top&&!t.depthIssues.length&&evidence.length>0&&evidence.every(e=>e.resolved);
 const zMin=resolved?Math.min(...evidence.map(e=>e.zMin)):null;
 return {...ToolLengthRule.evaluate({zMin,resolved,topZero:top,margin:adoptedMargin(t)}),evidence,scope:file??'trabalho',conditional:'Z0 no topo; confirmar preset e conjunto real'};
}
reachTarget=function(t,file=null){return mountingRule(t,file).recommended};
if(saved.toolLengthPolicy!=='round-up/v1'){
 for(const c of Object.values(state.checks))c.length=false;
 for(const r of Object.values(state.operator)){r.started=false;r.completed=false;r.finalConfirmed=false}
 state.operationCheckins={};
}
state.toolLengthPolicy='round-up/v1';state.preparationTool=null;
// Archived setup phase keeps its saved records; O002 now includes its mounting instructions.
if(state.phase===3){state.phase=4;state.operationPhases[1]=4}
if(state.operationPhases[1]===3)state.operationPhases[1]=4;
state.stageFlowPolicy=saved.stageFlowPolicy;
// Merge the two historical O004 tool stages without marking a partially done program complete.
if(state.stageFlowPolicy!==OPERATOR_CONFIG.stage_flow_policy){
 const first=state.operator['6'],second=state.operator['7'];
 if(first||second){const merged=state.operator['6']??={};merged.completed=!!first?.completed&&!!second?.completed;merged.started=!merged.completed&&!!(first?.started||second?.started);merged.completionSource='migração das duas etapas O004';}
 state.stageFlowPolicy=OPERATOR_CONFIG.stage_flow_policy;
}
if(state.phase===7){state.phase=6;state.operationPhases[1]=6}
if(state.operationPhases[1]===7)state.operationPhases[1]=6;

__TOOLING_DOMAIN__
const MACHINE_PROFILES=__MACHINE_PROFILES__;
const tooling=ToolingDomain.create({tools:DATA.tools,jobId:OPERATOR_CONFIG.part.order,profiles:MACHINE_PROFILES,machineId:OPERATOR_CONFIG.machine_id,legacy:state,saved:saved.tooling});
state.tooling=tooling.store;state.checks=tooling.checks;state.stickouts=tooling.stickouts;state.cuttingLengths=tooling.cuttingLengths;
for(const t of DATA.tools){const as=tooling.assembly(tooling.jobMachineId,t.id);if(!as.cuttingLength&&OPERATOR_CONFIG.tool_mounting.tools[t.id]?.cutting_length_mm)as.cuttingLength=OPERATOR_CONFIG.tool_mounting.tools[t.id].cutting_length_mm;}


function renderOperationCheckins(){document.querySelectorAll('[data-operation-check]').forEach(el=>{const id=Number(el.dataset.operationCheck);el.checked=!!state.operationCheckins[id];const text=el.closest('label').querySelector('span');text.textContent=id===2?'A confirmar':el.checked?'✓ OK':'OK';el.closest('.operation-item').dataset.complete=String(el.checked);})}

persist=function(){try{localStorage.setItem("columbia-os10713-demo-v2",JSON.stringify(Object.fromEntries(Object.entries({...state,stopped:false}).filter(([k])=>!["checks","stickouts","cuttingLengths"].includes(k)))));if($("storageNotice"))$("storageNotice").textContent="Registros salvos neste navegador.";return true}catch{if($("storageNotice"))$("storageNotice").textContent="Não foi possível salvar neste navegador. Confira o espaço disponível.";return false}};
function engineeringReferences(phase=state.operation===2?null:state.phase){
 if(phase===null)return{x:"",y:"",z:"",center:false};
 const cfg=OPERATOR_CONFIG.steps.find(s=>s.phase===Number(phase)),defaults=OPERATOR_CONFIG.reference_defaults||{};
 const value=axis=>{const entry=cfg?.references?.[axis]??defaults[axis];return typeof entry==="string"?entry:entry?.value??""};
 const x=value("x0"),y=value("y0"),z=value("z0");
 return{x,y,z,center:x.toLowerCase()==="centro da peça"&&y.toLowerCase()==="centro da peça"};
}
function operatorRecord(key=state.operation===2?"pending":String(state.phase)){
 const isNew=!Object.hasOwn(state.operator,key),r=state.operator[key]??={};r.checks??={};r.refs??={x:"",y:""};r.note??="";
 if(key!=="pending"){
  const orientation=OPERATOR_CONFIG.steps.find(s=>s.phase===Number(key))?.orientation?.rotation_x_degrees??0;
  if(r.orientationSignature!==orientation){r.orientationSignature=orientation;r.checks.position=false;r.checks.fixation=false;if(!isNew)invalidateRecord(r)}
  const refs=engineeringReferences(Number(key)),signature=JSON.stringify([refs.x,refs.y,refs.z]);
  if(r.referenceSignature!==signature){r.refs={x:refs.x,y:refs.y};r.referenceSignature=signature;r.checks.xy=false;r.checks.z=false;if(!isNew)invalidateRecord(r)}
 }
 return r;
}
function stageConfig(){return OPERATOR_CONFIG.steps.find(p=>p.phase===state.phase)}
function requiredTools(){
 if(state.operation===2||phases[state.phase].kind==="setup")return[];
 return DATA.programs[phases[state.phase].program]?.tools||[];
}
function measuredLength(id){const n=number(state.stickouts[id]);return Number.isFinite(n)&&n>0?n:null}
function toolConfirmed(id,file=displayedProgramFile()){
 const t=DATA.tools.find(t=>t.id===id),actual=measuredLength(id),r=reachTarget(t,file);
 return flags.every(([f])=>(state.checks[id]||{})[f])&&actual!==null&&(t.depthMm>0?r!==null&&actual>=r:r===null||actual>=r);
}
function releaseItems(phase=state.phase){
 const manual=phases[phase].kind==="setup";
 return [{key:"position",label:"Peça posicionada",group:"Montagem"},
 {key:"supports",label:phase<3?"Assentamento conferido":"Quatro calços conferidos",group:"Montagem"},
 {key:"fixation",label:"Fixação conferida",group:"Montagem"},
 {key:"xy",label:"X/Y conferidos",group:"Referência"},
 {key:"z",label:"Z no topo conferido",group:"Referência"},
 ...(!manual?[{key:"program",label:"Programa correto: "+DATA.programs[phases[phase].program].file,group:"Programa"}]:[])];
}
function thicknessPlanConfirmed(){return facePlan().valid&&(Number.isFinite(number(state.face.first))||Number.isFinite(number(state.face.afterFirst)))}
function operatorReady(){
 if(state.operation===2)return false;
 const r=operatorRecord();return releaseItems().every(i=>r.checks[i.key])&&!!r.refs.x.trim()&&!!r.refs.y.trim()&&requiredTools().every(id=>toolConfirmed(id));
}
function operatorStatus(){
 if(state.operation===2)return "A confirmar";
 const r=operatorRecord();return r.completed?"Concluída":r.started?"Em execução":"Não iniciada";
}
function invalidateRecord(r){r.started=false;r.completed=false;r.finalConfirmed=false;const key=Object.keys(state.operator).find(k=>state.operator[k]===r);if(key!==undefined&&key!=="pending")state.operationCheckins[Number(key)<3?0:1]=false}
function invalidateTools(id){
 for(const [key,r] of Object.entries(state.operator)){
  const phase=Number(key);if(!Number.isInteger(phase)||!phases[phase])continue;
  const ids=DATA.programs[phases[phase].program]?.tools||[];
  if(ids.includes(Number(id))){invalidateRecord(r);if(state.inspections[phase])state.inspections[phase].approved=false}
 }
}
// Stage progress is a manual local record, independent of tooling or machine authorization.
// Browsing a stage or playing its path never completes it.
function stageProgressState(id){
 const r=state.operator[String(id)];
 return r?.completed?{label:"✓ Concluída",kind:"completed",completed:true}:r?.started?{label:"Em execução",kind:"running",completed:false}:{label:"Não iniciada",kind:"idle",completed:false};
}
function renderStageFlow(){
 const op=selectedOperation();
 $("stageFlowTitle").textContent="Etapas da "+op.title.toLowerCase();
 $("steps").dataset.stageOperation=op.id;
 $("steps").innerHTML=op.phases.map((id,index)=>{
  const p=phases[id],program=p.kind==="setup"?"Montagem manual":DATA.programs[p.program].file;
  return '<div class="stage-box" data-stage="'+id+'"><button class="stage-open" data-step="'+id+'"><span class="stage-box-top"><span class="stage-number">'+String(index+1).padStart(2,"0")+'</span><strong>'+esc(program)+'</strong><span class="stage-current" hidden>Atual</span></span><span class="stage-name">'+esc(stageLabels[id])+'</span>'+stageTimeMarkup(id)+'</button><label class="stage-completion"><input type="checkbox" data-stage-complete="'+id+'" aria-label="Etapa '+(index+1)+' concluída"><span class="stage-state">Concluída</span></label></div>';
 }).join("");
 $("steps").querySelectorAll('[data-step]').forEach(b=>b.onclick=()=>{
  const id=Number(b.dataset.step);selectPhase(id);
  // Preserve keyboard focus when the existing navigation rerenders.
  $("steps").querySelector('[data-step="'+id+'"]')?.focus({preventScroll:true});
 });
 $("steps").querySelectorAll('[data-stage-complete]').forEach(input=>input.onchange=()=>{
  const id=Number(input.dataset.stageComplete),record=operatorRecord(String(id));
  record.completed=input.checked;record.started=false;record.completionSource='registro manual da etapa';persist();renderOperational();
 });
 renderStageProgress();
}
function renderStageProgress(){
 if(!$("stageProgress"))return;
 const op=selectedOperation();let completed=0;
 $("steps").querySelectorAll('[data-step]').forEach(b=>{
  const id=Number(b.dataset.step),progress=stageProgressState(id),current=id===state.phase&&state.operation!==2;
  const card=b.closest("[data-stage]");completed+=Number(progress.completed);card.dataset.status=progress.kind;card.dataset.current=current;
  b.setAttribute('aria-current',current?'step':'false');
  b.querySelector('.stage-current').hidden=!current;card.querySelector('[data-stage-complete]').checked=progress.completed;card.querySelector('.stage-state').textContent=progress.completed?'✓ Concluída':'Concluída';
  b.setAttribute('aria-label','Etapa '+(op.phases.indexOf(id)+1)+': '+stageLabels[id]+'. '+b.querySelector('strong').textContent+'. '+progress.label);
 });
 $("stageProgress").textContent=op.phases.length?completed+' de '+op.phases.length+' etapas concluídas':'Etapas e programas a confirmar';
 $("stageProgress").dataset.complete=op.phases.length>0&&completed===op.phases.length;
 renderJobTiming();
 if(typeof renderToolWorkStatus==='function')renderToolWorkStatus();
}
renderOperationNavigation=function(){
 const op=selectedOperation();
 $("operations").innerHTML=processOperations.map(o=>'<div class="operation-item"><button data-operation="'+o.id+'" aria-current="'+(o.id===state.operation)+'" aria-label="'+esc(o.title)+'"><strong>'+esc(o.title)+'</strong><span>'+esc(o.id===2?'Aguardando definição':o.name)+'</span></button><div class="operation-estimate" data-operation-timing="'+o.id+'"></div><label class="operation-checkin" title="Registro manual de conclusão da operação"><input type="checkbox" data-operation-check="'+o.id+'" aria-label="Conclusão manual da '+esc(o.title)+'" '+(o.id===2?'disabled':'')+'><span>Operação OK</span></label></div>').join("");
 $("operations").querySelectorAll("button[data-operation]").forEach(b=>b.onclick=()=>selectOperation(Number(b.dataset.operation)));
 $("operations").querySelectorAll("[data-operation-check]").forEach(el=>el.onchange=()=>{state.operationCheckins[el.dataset.operationCheck]=el.checked;persist();renderOperationCheckins()});renderOperationCheckins();
 renderStageFlow();
};
renderOperationToolLine=function(){};
tab=function(name){
 if(name==='setup')name='tools';
 if(name==='inspection'){$('operationChecks').open=true;name='tools'}
 if(name==='files'){$('technicalDetails').open=true;$('filesPanel').hidden=false;return}
 document.querySelectorAll('[data-tab]').forEach(b=>b.setAttribute('aria-selected',b.dataset.tab===name));
 $('toolsPanel').hidden=name!=='tools';$('detailsPanel').hidden=name!=='details';
 $('inspectionPanel').hidden=state.operation===2;$('operationChecks').hidden=state.operation===2;
 $('pendingPanel').hidden=true;$('setupPanel').hidden=false;$('filesPanel').hidden=false;
};
function exactLength(n){return n===null?'A confirmar':Number(n).toLocaleString('pt-BR',{maximumFractionDigits:6})+' mm'}
function mountingLabel(t,rule){return OPERATOR_CONFIG.tool_mounting.tools[t.id]?.mounting_mode==='standard'?'Montagem padrão':exactLength(rule.recommended)}
function programTools(){const file=displayedProgramFile();return file?DATA.programs.find(p=>p.file===file)?.tools||[]:[]}
function toolRow(id,file){
 const t=DATA.tools.find(t=>t.id===Number(id)),check=state.checks[id]||{},rule=mountingRule(t,file),actual=measuredLength(id);
 const cutting=Object.hasOwn(state.cuttingLengths,id)?number(state.cuttingLengths[id]):OPERATOR_CONFIG.tool_mounting.tools[id]?.cutting_length_mm;
 const meta=file?cncData?.[file]?.meta.tools.find(v=>v.t_number===Number(id)):null;
 const parameters=meta?'<div class="tool-parameters"><span><b>S</b> '+technicalNumber(meta.rpm)+' <small>rpm</small></span><span><b>F</b> '+technicalNumber(meta.feeds_mm_min)+' <small>mm/min</small></span><span>'+esc(cncData[file].meta.wcs.join(' / '))+'</span></div>':'';
 const nominalZ=rule.evidence.reduce((v,e)=>Number.isFinite(e.zMin)?Math.min(v??e.zMin,e.zMin):v,null);
 const nominalOnly=OPERATOR_CONFIG.tool_mounting.tools[t.id]?.mounting_mode==='standard'&&rule.maximumDescent===null&&nominalZ===0;
 const ok=actual!==null&&check.length&&(rule.maximumDescent===0||rule.recommended!==null&&actual>=rule.recommended);
 return '<article class="tool active" data-tool-card="'+id+'"><div class="tool-identity"><b class="tool-id">T'+id+'</b><h4 class="toolname">'+esc(toolNames[id])+'</h4>'+parameters+'</div>'+
 '<div class="length-pair"><div><span>'+(nominalOnly?'Z no programa (nominal)':'Descida máxima')+'</span><strong>'+exactLength(nominalOnly?nominalZ:rule.maximumDescent)+'</strong></div><div class="recommended"><span>Montagem recomendada</span><strong>'+mountingLabel(t,rule)+'</strong></div></div>'+
 '<p class="length-origin">'+(nominalOnly?'Z nominal extraído do TAP · montagem padrão do processo':rule.resolved?'Extraído do programa · Z0 no topo':'Z ou referência a confirmar')+'</p>'+
 '<p class="tool-margin-note">Margem: +'+exactLength(adoptedMargin(t))+'</p><div class="tool-measure"><label>Medido fora da pinça (mm)<input type="number" min="0" step="0.01" data-stickout="'+id+'" aria-label="Operador confirma comprimento T'+id+'" value="'+esc(state.stickouts[id]??'')+'" placeholder="Medir"></label></div>'+
 '<div class="checks">'+flags.map(([f,l])=>'<label><input type="checkbox" data-tool="'+id+'" data-flag="'+f+'" '+(check[f]?'checked':'')+'>'+esc(f==='length'?'Comprimento conferido':f==='offset'?'Corretor conferido':l)+'</label>').join('')+'</div>'+
 '<p class="result" data-ok="'+!!ok+'">'+(ok?'✓ Comprimento conferido':actual!==null&&rule.recommended!==null&&actual<rule.recommended?'⚠ Abaixo da montagem recomendada':'Comprimento a conferir')+'</p>'+
 '<details class="tool-dimensions"><summary>Rastreabilidade e ajustes</summary><label>Margem de exceção (mm)<input type="number" min="0" step="0.5" data-tool-margin="'+id+'" aria-label="Margem adotada T'+id+'" value="'+esc(Object.hasOwn(state.toolMargins,id)?state.toolMargins[id]:state.margin??'')+'"></label>'+
 (cutting!==null&&cutting!==undefined&&Number(cutting)>0?'<label>Corte útil cadastrado (mm)<input type="number" min="0" step="0.01" data-cutting-length="'+id+'" aria-label="Corte útil medido T'+id+'" value="'+esc(cutting)+'"></label><p>Medida física cadastrada; não extraída da descida Z.</p>':'')+
 '<p>Z mínimo nominal na trajetória: '+exactLength(rule.evidence.reduce((v,e)=>Number.isFinite(e.zMin)?Math.min(v??e.zMin,e.zMin):v,null))+' · mínimo + margem exatos: '+exactLength(rule.exactRequired)+'</p><p>Porta-ferramenta ilustrativo. A descida não é o comprimento total da ferramenta.</p></details></article>';

}
renderTools=function(){
 const openDimensions=new Set([...document.querySelectorAll("#toolList .tool-dimensions[open],#workToolEditor .tool-dimensions[open]")].map(e=>e.closest("[data-tool-card]").dataset.toolCard));
 const ids=programTools(),file=displayedProgramFile(),required=requiredTools();
 if(document.activeElement!==$("reachMargin"))$("reachMargin").value=state.margin??"";
 $("toolsTitle").textContent=ids.length===1?'Ferramenta atual':'Ferramentas deste programa';
 $("toolsIntro").hidden=state.operation!==2&&phases[state.phase].kind!=="setup";$("toolsIntro").textContent=state.operation===2?'Programa a confirmar':phases[state.phase].kind==='setup'?'Prévia durante montagem manual':'Extraído do programa';
 $("readyCount").textContent=ids.length?ids.filter(id=>toolConfirmed(id,file)).length+' de '+ids.length+' conferida(s)':'';
 $("toolList").innerHTML=ids.length?ids.map(id=>toolRow(id,file)).join(''):'<p>Ferramentas a confirmar.</p>';
 $("toolIdentityNote").hidden=!ids.includes(12);
 for(const root of [$("toolList"),$("workToolEditor")]){
 root.querySelectorAll('[data-tool]').forEach(i=>i.onchange=()=>{state.checks[i.dataset.tool]??={};state.checks[i.dataset.tool][i.dataset.flag]=i.checked;invalidateTools(i.dataset.tool);persist();renderTools();renderInspection();renderSetup()});
 root.querySelectorAll('[data-tool-margin],[data-stickout],[data-cutting-length]').forEach(i=>i.onchange=()=>{const id=i.dataset.toolMargin??i.dataset.stickout??i.dataset.cuttingLength;
  if(i.dataset.toolMargin)state.toolMargins[id]=i.value;else if(i.dataset.stickout)state.stickouts[id]=i.value;else state.cuttingLengths[id]=i.value;
  state.checks[id]??={};state.checks[id].length=false;invalidateTools(id);persist();renderTools();renderInspection();renderSetup();
 });
 }
 for(const d of document.querySelectorAll("#toolList .tool-dimensions,#workToolEditor .tool-dimensions"))d.open=openDimensions.has(d.closest("[data-tool-card]").dataset.toolCard);
 refreshToolVisual();if($("operationStatus"))renderOperational();
};

const engineeringSetup=renderSetup;
renderSetup=function(){engineeringSetup();$("setupPanel").hidden=false;renderOperational()};
const engineeringInspection=renderInspection;
renderInspection=function(){
 engineeringInspection();const has=[8,10].includes(state.phase)&&state.operation!==2;
 $("legacyInspection").hidden=!has;
 $("release").disabled=!has||!["dimension","offset","resume"].every(f=>inspectRecord()[f])||!String(inspectRecord().measured||"").trim();
 renderOperational();
};
function stepsNow(){
 if(state.operation===2)return ["Montagem e programas a confirmar"];
 const tools=requiredTools().map(id=>'T'+id).join(' / ');
 const reference=engineeringReferences().center?'Conferir X/Y no centro; presetar a ferramenta no topo da peça':'Conferir X/Y conforme engenharia; presetar a ferramenta no topo da peça';
 if(state.phase===2)return ['Tombar uma vez; realinhar por fora e prender as mesmas garras','Conferir lado e posição conforme desenho 3D','Ajustar o corretor e fechar 96,0 mm; manter posição para elevar aos calços'];
 if(state.phase===0)return ['Começar invertida; alinhar por fora e prender as garras','Conferir lado e posição conforme desenho 3D',reference,'Montar e presetar T1','Carregar '+displayedProgramFile(),'Ajustar o corretor e facear até limpar'];
 return stageConfig()?.instructions||['Usar '+tools+' e carregar '+displayedProgramFile()];
}
function renderOperational(){
 if(!$("operationStatus"))return;
 const pending=state.operation===2,r=operatorRecord(),cfg=stageConfig();
 $("workOrder").textContent=OPERATOR_CONFIG.part.order_display;renderOperationCheckins();
 $("currentOperationNumber").textContent=(state.operation+1)+"ª operação";
 $("currentProgram").textContent=pending?'A confirmar':displayedProgramFile();$("currentToolHint").hidden=true;
 const status=operatorStatus();$("operationStatus").textContent=status;$("operationStatus").dataset.status=status;
 const start=$("startStageExecution");start.hidden=pending;start.disabled=pending||r.started||r.completed;start.textContent=r.completed?"Etapa concluída":r.started?"Etapa iniciada":"Iniciar etapa";
 $("doNow").innerHTML=stepsNow().map(s=>'<li>'+esc(s)+'</li>').join('');
 for(const axis of ['X','Y']){
  const input=$("reference"+axis);input.value=pending?'':r.refs[axis.toLowerCase()]||'';input.disabled=pending;input.readOnly=true;
  $("reference"+axis+"State").textContent=pending?'A confirmar':'Origem da peça';$("reference"+axis+"State").dataset.confirmed=false;
 }
 $("referenceZ").textContent=pending?'A confirmar':engineeringReferences().z;$("referenceZState").textContent=pending?'A confirmar':'Preset da ferramenta';$("referenceZState").dataset.confirmed=false;
 $("referenceHint").textContent=pending?'Referência a confirmar':'X/Y definidos pela engenharia. Preset da ferramenta no topo da peça.';
 $("operationChecks").hidden=true;$("measurementPreparation").hidden=true;$("finalThicknessForm").hidden=true;
 $("readyCount").hidden=true;$("toolIdentityNote").hidden=true;
 $("revisionLine").textContent='Processo: '+(OPERATOR_CONFIG.revision??'Revisão não informada')+' · Desenho: '+(OPERATOR_CONFIG.drawing.revision??'Revisão não informada')+' · Programa: '+(cfg?.program_revision??'Revisão não informada');
 const m=cncData?.[cncFile]?.meta;$("pathNotice").hidden=pending||!m?.compensation_states.includes('UNVERIFIED');$("pathNotice").textContent='Compensação real da ferramenta: conferir antes de usar.';
 renderProgramOverview();renderStrategyDetails();renderStageProgress();
}
$("startStageExecution").onclick=()=>{if(state.operation===2)return;const r=operatorRecord();if(r.started||r.completed)return;r.started=true;r.executionSource="registro manual da etapa";persist();renderOperational()};
$("operationNote").oninput=e=>{operatorRecord().note=e.target.value;persist();renderOperational()};
$("startOperation").onclick=()=>{if(!operatorReady())return;operatorRecord().started=true;operatorRecord().completed=false;persist();renderOperational()};
$("completeOperation").onclick=()=>{if($("completeOperation").disabled)return;operatorRecord().completed=true;persist();renderOperational()};
const originalSelectPhase=selectPhase;
selectPhase=function(i,options){
 if(i===1)i=2;if(i===3)i=4;if(i===7)i=6;const previous=state.phase;$("toolList").querySelector("details")?.removeAttribute("open");originalSelectPhase(i,options);renderOperational();
 const page=stageConfig()?.drawing_reference?.page;if(page)drawingViewer.setPage(page-1);
 if(!options?.progress||state.phase!==previous){tab("tools");$("measurementPreparation").open=false}
 applyVisualMode(false);
};
// Visible process order skips archived phase 1 without changing IDs of machining phases.
const visiblePhaseIds=()=>processOperations.slice(0,2).flatMap(o=>o.phases);
$('prev').onclick=()=>{if(state.operation===2){selectOperation(1);return}const ids=visiblePhaseIds(),i=ids.indexOf(state.phase);selectPhase(ids[Math.max(0,i-1)])};
$('next').onclick=()=>{if(state.operation===2)return;const ids=visiblePhaseIds(),i=ids.indexOf(state.phase);if(i<ids.length-1)selectPhase(ids[i+1])};
const originalSelectOperation=selectOperation;
selectOperation=function(id){originalSelectOperation(id);renderOperational();applyVisualMode(false)};
const originalRelease=$("release").onclick;
$("release").onclick=()=>{if($("release").disabled)return;originalRelease();renderOperational()};
for(const id of ["stockThickness","targetThickness","firstRemoval","afterFirst","finalThickness","faceClosed","measured","adjustment"]){
 const el=$(id),event=el.type==="checkbox"?"onchange":"oninput",handler=el[event];
 el[event]=e=>{
  if(["finalThickness","faceClosed","measured","adjustment"].includes(id))operatorRecord().completed=false;
  else for(const key of ["0","1","2"])if(state.operator[key])invalidateRecord(state.operator[key]);
  handler?.(e);renderInspection();renderOperational()
 };
}
$("reachMargin").oninput=e=>{
 const n=number(e.target.value);state.margin=n!==null&&Number.isFinite(n)&&n>=0?n:null;
 for(const t of DATA.tools)if(t.depthMm>0&&!Object.hasOwn(state.toolMargins,t.id)){state.checks[t.id]??={};state.checks[t.id].length=false}
 for(const r of Object.values(state.operator))invalidateRecord(r);
 persist();renderTools();renderInspection();
};
$("references").onclick=()=>modal("Referências arquivadas",'<p>Fotos e desenho originais preservados no projeto. A consulta ao desenho está na aba Desenho da referência visual.</p>');
function makeDrawingViewer(host,page=0,expanded=false){
 host.innerHTML='<div class="drawing-toolbar"><label>Página <select data-draw="page" aria-label="Página do desenho">'+DRAWING_PAGES.map((p,i)=>'<option value="'+i+'"> '+p.page+' / '+DRAWING_PAGES.length+'</option>').join("")+'</select></label><div class="drawing-buttons"><button data-draw="minus" aria-label="Reduzir desenho">−</button><button data-draw="plus" aria-label="Ampliar zoom do desenho">+</button><button data-draw="fit">Ajustar à tela</button>'+(!expanded?'<button data-draw="expand">Ampliar</button>':'')+'</div></div><div class="drawing-viewport" tabindex="0" aria-label="Desenho: arraste para mover, roda para zoom"><img draggable="false" alt=""></div><div class="drawing-footer">Arraste para mover · roda para zoom · <a href="Desenhos/'+encodeURIComponent(OPERATOR_CONFIG.drawing.file)+'" target="_blank">PDF original</a></div>';
 const viewport=host.querySelector(".drawing-viewport"),img=viewport.querySelector("img"),select=host.querySelector("select");
 let index=page,scale=1,fitScale=1,x=0,y=0,drag=null,lastWidth=0,lastHeight=0;
 function paint(){img.style.transform="translate("+x+"px,"+y+"px) scale("+scale+")"}
 function fit(){const p=DRAWING_PAGES[index];if(!viewport.clientWidth||!viewport.clientHeight)return;lastWidth=viewport.clientWidth;lastHeight=viewport.clientHeight;scale=fitScale=Math.min((viewport.clientWidth-24)/p.width,(viewport.clientHeight-24)/p.height);x=(viewport.clientWidth-p.width*scale)/2;y=(viewport.clientHeight-p.height*scale)/2;paint()}
 function load(i){index=Math.max(0,Math.min(DRAWING_PAGES.length-1,i));const p=DRAWING_PAGES[index];select.value=String(index);img.src=p.image;img.style.width=p.width+"px";img.style.height=p.height+"px";img.alt="Desenho técnico original, página "+p.page+" de "+DRAWING_PAGES.length;fit()}
 function zoom(f,px=viewport.clientWidth/2,py=viewport.clientHeight/2){const next=Math.max(fitScale*.3,Math.min(fitScale*16,scale*f)),ratio=next/scale;x=px-(px-x)*ratio;y=py-(py-y)*ratio;scale=next;paint()}
 select.onchange=e=>load(Number(e.target.value));
 host.querySelector('[data-draw="minus"]').onclick=()=>zoom(1/1.35);
 host.querySelector('[data-draw="plus"]').onclick=()=>zoom(1.35);
 host.querySelector('[data-draw="fit"]').onclick=fit;
 if(!expanded)host.querySelector('[data-draw="expand"]').onclick=()=>{
  $("modal").classList.add("drawing-expanded");modal("Desenho técnico · "+OPERATOR_CONFIG.drawing.file,'<div id="expandedDrawing"></div>');
  const large=makeDrawingViewer($("expandedDrawing"),index,true);$("modal").addEventListener("close",()=>{large.dispose();$("modal").classList.remove("drawing-expanded")},{once:true});
 };
 viewport.addEventListener("wheel",e=>{e.preventDefault();const b=viewport.getBoundingClientRect();zoom(e.deltaY<0?1.15:1/1.15,e.clientX-b.left,e.clientY-b.top)},{passive:false});
 viewport.onpointerdown=e=>{drag={x:e.clientX,y:e.clientY};viewport.setPointerCapture(e.pointerId)};
 viewport.onpointermove=e=>{if(!drag)return;x+=e.clientX-drag.x;y+=e.clientY-drag.y;drag={x:e.clientX,y:e.clientY};paint()};
 viewport.onpointerup=viewport.onpointercancel=()=>drag=null;
 viewport.onkeydown=e=>{if(["ArrowLeft","ArrowRight","ArrowUp","ArrowDown","+","-"].includes(e.key))e.preventDefault();if(e.key==="ArrowLeft")x-=30;if(e.key==="ArrowRight")x+=30;if(e.key==="ArrowUp")y-=30;if(e.key==="ArrowDown")y+=30;if(e.key==="+")zoom(1.35);if(e.key==="-")zoom(1/1.35);paint()};
 const observer=new ResizeObserver(()=>{if(viewport.clientWidth!==lastWidth||viewport.clientHeight!==lastHeight)fit()});observer.observe(viewport);load(index);
 return {fit,setPage:load,getState:()=>({page:index+1,scale,x,y}),dispose:()=>observer.disconnect()};
}
const drawingViewer=makeDrawingViewer($("drawingHost"));
function applyVisualMode(fit=true){
 const drawing=state.visualMode==="drawing";$("view3DPanel").hidden=drawing;$("drawingPanel").hidden=!drawing;
 $("view3D").setAttribute("aria-selected",!drawing);$("viewDrawing").setAttribute("aria-selected",drawing);
 if(drawing&&fit)drawingViewer.fit();else if(!drawing)requestAnimationFrame(resize);
}
$("view3D").onclick=()=>{state.visualMode="3d";persist();applyVisualMode()};
$("viewDrawing").onclick=()=>{state.visualMode="drawing";stopAnimation();persist();applyVisualMode()};
document.querySelectorAll("[data-inspect]").forEach(el=>{
 const old=el.onchange;el.onchange=e=>{operatorRecord().completed=false;old(e);renderOperational()};
});
const originalLoadCNC=loadCNC;
loadCNC=function(){originalLoadCNC();renderOperational()};
let zeroMarker;
const originalInit3d=init3d;
init3d=function(){
 originalInit3d();zeroMarker=new THREE.Group();zeroMarker.name="engineering-zero";
 zeroMarker.userData={provenance:"referência cadastrada pela engenharia; montagem 3D ilustrativa",configured:true,confirmed:false};
 const m=new THREE.LineBasicMaterial({color:0xe0a74c});
 for(const [a,b] of [[[0,0,0],[75,0,0]],[[0,0,0],[0,0,-75]],[[0,0,0],[0,75,0]]]){
  zeroMarker.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(...a),new THREE.Vector3(...b)]),m));
 }
 scene.add(zeroMarker);updateAssembly();
};
const originalUpdateAssembly=updateAssembly;
updateAssembly=function(){originalUpdateAssembly();if(zeroMarker){zeroMarker.visible=state.operation!==2&&engineeringReferences().center;zeroMarker.position.set(0,plateBottom+96,0);draw()}renderOperational()};


__TOOLING_UI__
__INSERT_UI__

__JOB_TIMING_UI__
