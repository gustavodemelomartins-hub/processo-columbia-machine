// Planning only. Stage records, not elapsed wall time or playback, determine progress.
const JobTimingDomain=(()=>{
 function programTime(data){
  if(!data)return {seconds:null,source:'a confirmar'};
  const valid=v=>typeof v==='number'&&Number.isFinite(v)&&v>=0;
  if(valid(data.time_header_seconds))return {seconds:data.time_header_seconds,source:'arquivo CNC'};
  if(valid(data.time_work_trajectory_seconds))return {seconds:data.time_work_trajectory_seconds,source:'trajetória calculada'};
  return {seconds:null,source:'a confirmar'};
 }
 function plan(groups,strategies,allowancePercent=20){
  if(!Number.isFinite(allowancePercent)||allowancePercent<0)throw Error('Margem de tempo inválida');
  return groups.map(g=>({...g,stages:g.stages.map(s=>{const t=programTime(strategies[s.file]);return {...s,baseSeconds:t.seconds,plannedSeconds:t.seconds===null?null:Math.ceil(t.seconds*(1+allowancePercent/100)),source:t.source};})}));
 }
 function summarize(plan,records={}){
  const summary=stages=>{
   const known=stages.filter(s=>s.plannedSeconds!==null),completed=known.filter(s=>records[String(s.id)]?.completed===true),total=known.reduce((a,s)=>a+s.plannedSeconds,0),done=completed.reduce((a,s)=>a+s.plannedSeconds,0),unknown=stages.length-known.length;
   return {totalSeconds:known.length?total:null,completedSeconds:done,remainingSeconds:known.length?total-done:null,percent:unknown?null:total>0?done*100/total:stages.length?stages.filter(s=>records[String(s.id)]?.completed).length/stages.length*100:null,completedStages:stages.filter(s=>records[String(s.id)]?.completed===true).length,totalStages:stages.length,unknownStages:unknown};
  };
  return {groups:plan.map(g=>({...g,...summary(g.stages)})),...summary(plan.flatMap(g=>g.stages))};
 }
 return {programTime,plan,summarize};
})();
if(typeof module!=='undefined'&&module.exports)module.exports=JobTimingDomain;
