function isFacingStage(id){return OPERATOR_CONFIG.process_timing.face_milling.stage_ids.includes(Number(id));}
function jobTiming(){
 const groups=processOperations.map(o=>({id:o.id,title:o.title,stages:o.phases.map(id=>({id,file:phases[id].program===null?null:DATA.programs[phases[id].program].file,repeatable:isFacingStage(id),stockMm:state.faceTiming.stockByStage[id]??null,reductionPerPassMm:state.faceTiming.reductionPerPassMm}))}));
 return JobTimingDomain.summarize(JobTimingDomain.plan(groups,STRATEGY_DATA,OPERATOR_CONFIG.process_timing.allowance_percent),state.operator);
}
function plannedDuration(seconds){if(seconds===null)return 'A definir';const minutes=Math.ceil(seconds/60),h=Math.floor(minutes/60),m=minutes%60;return (h?h+' h ':'')+(h?String(m).padStart(2,'0'):m)+' min';}
function stageTiming(id){return jobTiming().groups.flatMap(g=>g.stages).find(s=>s.id===Number(id));}
function stageTimeContent(id){const s=stageTiming(id);if(s?.plannedSeconds===null||!s)return 'Tempo a definir';return (s.repeatable?s.passCount+' '+(s.passCount===1?'passe':'passes')+' · ':'')+'~'+plannedDuration(s.plannedSeconds);}
function stageTimeMarkup(id){return '<span class="stage-time" data-stage-time="'+id+'">'+stageTimeContent(id)+'</span>';}
// Face stock is edited in the stage panel (journey layer); stage cards only show the estimate.
function faceStockInputMarkup(id){return '';}
function legacyFaceStockInputMarkup(id){if(!isFacingStage(id))return '';return '<label class="face-stock-field">Sobremetal desta face (mm)<input type="number" min="0" step="any" inputmode="decimal" data-face-stock="'+id+'" value="'+esc(state.faceTiming.stockByStage[id]??'')+'" placeholder="Informar" aria-label="Sobremetal a retirar da '+(Number(id)===0?'primeira':'segunda')+' face em milímetros"></label>';}
function saveFaceTiming(input,id=null){
 const raw=input.value.trim(),value=raw===''?null:Number(raw.replace(',','.'));
 const target=id===null?state.faceTiming:state.faceTiming.stockByStage,key=id===null?'reductionPerPassMm':id,old=target[key];target[key]=Number.isFinite(value)?value:null;
 if(!persist()){target[key]=old;input.value=old??'';}
 renderJobTiming();
}
function renderFaceTimingControls(){
 const host=$('faceTimingSetup');host.hidden=true;host.innerHTML='';return;
 const pass=stageTiming(OPERATOR_CONFIG.process_timing.face_milling.stage_ids[0]);
 host.innerHTML='<label class="face-pass-setting">Redução por passe <input id="faceReduction" type="number" min="0.001" step="any" inputmode="decimal" value="'+esc(state.faceTiming.reductionPerPassMm??'')+'" aria-label="Redução de faceamento por passe em milímetros"> mm</label><span class="face-pass-time">Um passe · '+(pass?.perPassSeconds===null?'tempo a definir':strategyTime(pass.perPassSeconds))+' previstos</span>';
 $('faceReduction').onchange=e=>saveFaceTiming(e.target);
 $('steps').querySelectorAll('[data-face-stock]').forEach(input=>input.onchange=()=>saveFaceTiming(input,Number(input.dataset.faceStock)));
}
function timingProgress(data){return data.percent===null?(data.totalStages?Math.floor(data.completedStages*100/data.totalStages):0):Math.floor(data.percent);}
function renderJobTiming(){
 const host=$('jobTiming');if(!host)return;const data=jobTiming(),percent=timingProgress(data);
 const progressLabel=data.percent===null?data.completedStages+' de '+data.totalStages+' etapas concluídas':percent+'% por etapas concluídas';
 host.innerHTML='<div class="job-time-total"><span>Peça · usinagem prevista</span><strong id="jobPlannedTime">'+plannedDuration(data.totalSeconds)+'</strong></div><div class="job-time-remaining"><span>Restante previsto</span><strong id="jobRemainingTime">'+plannedDuration(data.remainingSeconds)+'</strong></div><div class="job-time-progress"><span id="jobProgressText">'+progressLabel+'</span><progress id="jobTimeProgress" max="100" value="'+percent+'" aria-label="'+(data.percent===null?'Progresso por quantidade de etapas; tempo a definir':'Progresso da peça por tempo das etapas concluídas')+'">'+percent+'%</progress></div>';
 for(const group of data.groups){const node=document.querySelector('[data-operation-timing="'+group.id+'"]');if(!node)continue;const p=timingProgress(group);node.innerHTML=group.totalStages?'<span>'+group.completedStages+' de '+group.totalStages+' etapas · ~'+plannedDuration(group.totalSeconds)+'</span><progress max="100" value="'+p+'" aria-label="'+esc(group.title)+': '+(group.percent===null?'progresso por quantidade de etapas':'progresso por tempo')+'">'+p+'%</progress>':'<span>Tempo a definir</span>';}
 document.querySelectorAll('[data-stage-time]').forEach(el=>el.innerHTML=stageTimeContent(el.dataset.stageTime));
}
