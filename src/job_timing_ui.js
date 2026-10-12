function jobTiming(){
 const groups=processOperations.map(o=>({id:o.id,title:o.title,stages:o.phases.map(id=>({id,file:phases[id].program===null?null:DATA.programs[phases[id].program].file}))}));
 return JobTimingDomain.summarize(JobTimingDomain.plan(groups,STRATEGY_DATA,OPERATOR_CONFIG.process_timing.allowance_percent),state.operator);
}
function plannedDuration(seconds){if(seconds===null)return 'A confirmar';const minutes=Math.ceil(seconds/60),h=Math.floor(minutes/60),m=minutes%60;return (h?h+' h ':'')+(h?String(m).padStart(2,'0'):m)+' min';}
function stageTimeMarkup(id){const s=jobTiming().groups.flatMap(g=>g.stages).find(s=>s.id===id);return '<span class="stage-time">Previsto: '+plannedDuration(s?.plannedSeconds??null)+'</span>';}
function renderJobTiming(){
 const host=$('jobTiming');if(!host)return;const data=jobTiming(),percent=data.percent===null?null:Math.floor(data.percent);
 host.innerHTML='<div class="job-time-total"><span>Peça · usinagem prevista</span><strong id="jobPlannedTime">'+plannedDuration(data.totalSeconds)+'</strong></div><div class="job-time-remaining"><span>Restante previsto</span><strong id="jobRemainingTime">'+plannedDuration(data.remainingSeconds)+'</strong></div><div class="job-time-progress"><span id="jobProgressText">'+(percent===null?'Progresso a confirmar':percent+'% por etapas concluídas')+'</span><progress id="jobTimeProgress" max="100" value="'+(percent??0)+'" aria-label="Progresso da peça por etapas concluídas">'+(percent??0)+'%</progress></div>';
 for(const group of data.groups){const node=document.querySelector('[data-operation-timing="'+group.id+'"]');if(!node)continue;const p=group.percent===null?null:Math.floor(group.percent);node.innerHTML=group.totalStages?'<span>Previsto '+plannedDuration(group.totalSeconds)+' · '+group.completedStages+'/'+group.totalStages+' etapas</span><progress max="100" value="'+(p??0)+'" aria-label="'+esc(group.title)+': progresso por etapas concluídas">'+(p??0)+'%</progress>':'<span>Tempo a definir</span>';}
}
