// Journey domain: pure rules for the part's route through the process (no DOM).
// It interprets data/process.json (receiving, journey, stage_guide, open_questions) and the
// operator's local records. It never chooses an engineering value: unresolved items stay null.
const JourneyDomain=(()=>{
 const finite=v=>typeof v==='number'&&Number.isFinite(v);
 function toNumber(v){if(v===null||v===undefined)return null;if(typeof v==='number')return Number.isFinite(v)?v:null;const s=String(v).trim().replace(',','.');if(!s)return null;const n=Number(s);return Number.isFinite(n)?n:null;}
 function resolvePath(obj,path){return String(path).split('.').reduce((o,k)=>o==null?undefined:o[k],obj);}
 const round=(v,d=3)=>finite(v)?Math.round(v*10**d)/10**d:null;

 // Target candidates come from existing fields (value_from); the domain never picks one.
 function targetCandidates(config){
  return (config.receiving?.target_candidates||[]).map(c=>({...c,valueMm:toNumber(resolvePath(config,c.value_from))}));
 }
 function confirmedTarget(config,journey){
  const choice=journey?.receiving?.targetChoice;if(!choice)return null;
  return targetCandidates(config).find(c=>c.id===choice.id&&finite(c.valueMm))||null;
 }
 // Stock plan for one target. Process method: Face A cleans (measured), Face B closes the target.
 // Symmetric split is returned only as a labelled reference.
 function stockFor(receivedMm,targetMm,afterFaceAMm=null){
  const received=toNumber(receivedMm),target=toNumber(targetMm),afterA=toNumber(afterFaceAMm);
  if(!finite(received)||!finite(target)||received<=0||target<=0)return {valid:false,reason:'Informe a espessura recebida.'};
  if(received<target)return {valid:false,reason:'Espessura recebida menor que o objetivo.',received,target,totalMm:round(received-target)};
  const total=round(received-target);
  const method={faceAMm:null,faceBMm:null,source:'Face A até limpar · Face B fecha a medida'};
  if(finite(afterA)&&afterA<=received&&afterA>=target){method.faceAMm=round(received-afterA);method.faceBMm=round(afterA-target);}
  return {valid:true,received,target,totalMm:total,symmetric:{faceAMm:round(total/2),faceBMm:round(total/2),confirmed:false},method};
 }
 function stockPlan(config,journey){
  const r=journey?.receiving||{};
  return targetCandidates(config).map(c=>({...c,stock:stockFor(r.receivedMm,c.valueMm,journey?.controls?.afterFaceAMm)}));
 }

 // Node status vocabulary shared with the design system.
 const STATUS={done:'Concluída',active:'Atual',running:'Em execução',waiting:'Aguardando',confirm:'A confirmar',undefined:'Não definida'};
 function phaseDone(records,id){return records?.[String(id)]?.completed===true;}
 function phaseRunning(records,id){const r=records?.[String(id)];return r?.started===true&&r?.completed!==true;}
 function receivingDone(journey){return finite(toNumber(journey?.receiving?.receivedMm))&&!!journey?.receiving?.recordedAt;}
 function controlDone(journey,id){return !!journey?.controls?.[id]?.releasedAt;}

 // Ordered list of counted items (receiving, phases, controls). Drives "x de N" and current stage.
 function countedItems(config){
  const ops=config.runtime.operations,items=[];
  for(const n of config.journey.nodes){
   if(!n.counts)continue;
   if(n.kind==='operation'){for(const id of ops[n.operation].phases)items.push({type:'phase',id,node:n.id,operation:n.operation});}
   else items.push({type:n.kind,id:n.id,node:n.id});
  }
  return items;
 }
 function itemDone(item,journey,records){
  if(item.type==='phase')return phaseDone(records,item.id);
  if(item.type==='receiving')return receivingDone(journey);
  if(item.type==='control')return controlDone(journey,item.id);
  return false;
 }
 function progress(config,journey,records){
  const items=countedItems(config),done=items.filter(i=>itemDone(i,journey,records)).length;
  const current=items.find(i=>!itemDone(i,journey,records))||null;
  return {done,total:items.length,current,items};
 }
 function nodeStates(config,journey,records){
  const p=progress(config,journey,records),ops=config.runtime.operations;
  return config.journey.nodes.map(n=>{
   if(n.kind==='operation'){
    const op=ops[n.operation];
    if(n.defined===false||op.status==='pending')return {...n,status:'undefined',label:'Processo ainda não definido',done:0,total:0};
    const done=op.phases.filter(id=>phaseDone(records,id)).length,running=op.phases.some(id=>phaseRunning(records,id));
    const isCurrent=p.current?.node===n.id;
    const status=done===op.phases.length?'done':running?'running':isCurrent?'active':'waiting';
    return {...n,status,label:STATUS[status],done,total:op.phases.length};
   }
   if(n.kind==='external')return {...n,status:'confirm',label:'Sequência a confirmar',done:0,total:0};
   const done=n.kind==='receiving'?receivingDone(journey):controlDone(journey,n.id);
   const status=done?'done':p.current?.node===n.id?'active':'waiting';
   return {...n,status,label:STATUS[status],done:done?1:0,total:1};
  });
 }
 function overallStatus(config,journey,records){
  const p=progress(config,journey,records),ops=config.runtime.operations;
  const running=ops.flatMap(o=>o.phases).some(id=>phaseRunning(records,id));
  if(running)return {key:'running',label:'Em usinagem'};
  if(!p.current)return {key:'done',label:'Etapas definidas concluídas'};
  if(p.current.type==='receiving')return {key:'receiving',label:'Aguardando recebimento'};
  if(p.current.type==='control')return {key:'inspection',label:'Aguardando inspeção'};
  return {key:'preparing',label:'Em preparação'};
 }
 function nextPhase(config,phaseId){
  const all=config.runtime.operations.filter(o=>o.status!=='pending').flatMap(o=>o.phases),i=all.indexOf(Number(phaseId));
  return i>=0&&i<all.length-1?all[i+1]:null;
 }
 // Open questions that apply to a node, a phase's operation node, or everything.
 function questionsFor(config,ids){const set=new Set(ids);return (config.open_questions||[]).filter(q=>q.affects.some(a=>set.has(a)));}

 // Time helpers. Real time is a local manual record; planned time comes from the TAP header.
 function elapsedMs(startIso,endIso=null,now=Date.now()){const s=Date.parse(startIso);if(!Number.isFinite(s))return null;const e=endIso?Date.parse(endIso):now;return Number.isFinite(e)&&e>=s?e-s:null;}
 function formatDuration(ms){if(!finite(ms))return null;const totalMin=Math.floor(ms/60000),h=Math.floor(totalMin/60),m=totalMin%60;if(totalMin<1)return 'menos de 1 min';return (h?h+' h ':'')+(h?String(m).padStart(2,'0'):m)+' min';}
 function formatClock(iso){const d=new Date(iso);if(!Number.isFinite(d.getTime()))return null;return String(d.getHours()).padStart(2,'0')+':'+String(d.getMinutes()).padStart(2,'0');}
 function formatMm(v,{min=2,max=3}={}){const n=toNumber(v);return n===null?null:n.toLocaleString('pt-BR',{minimumFractionDigits:min,maximumFractionDigits:max});}

 // The part passport: one structured record assembled from local records only.
 function passport(config,journey,records,inspections,data){
  const plan=stockPlan(config,journey),target=confirmedTarget(config,journey);
  const phases=config.runtime.operations.filter(o=>o.status!=='pending').flatMap(o=>o.phases.map(id=>({id,operation:o.id})));
  return {
   schema:'columbia-passport/1',order:config.part.order_display,part:config.part.name,machine:config.machine_id,
   receiving:{receivedMm:toNumber(journey?.receiving?.receivedMm),recordedAt:journey?.receiving?.recordedAt||null,note:journey?.receiving?.note||''},
   target:{candidates:plan.map(c=>({id:c.id,label:c.label,valueMm:c.valueMm})),confirmed:target?{id:target.id,valueMm:target.valueMm,by:journey.receiving.targetChoice.by||'',at:journey.receiving.targetChoice.at}:null,engineeringStatus:config.engineering_review?.status||null},
   stock:plan.map(c=>({target:c.id,valid:c.stock.valid,totalMm:c.stock.totalMm??null,symmetricReference:c.stock.symmetric||null,processMethod:c.stock.method||null})),
   stages:phases.map(({id,operation})=>{const r=records?.[String(id)]||{},p=data.programs[config.runtime.phases[id].program];return {phase:id,operation:operation+1,program:p?.file||null,title:config.runtime.phases[id].title,started:!!r.started||!!r.completed,completed:!!r.completed,startedAt:r.startedAt||null,completedAt:r.completedAt||null,realMs:r.startedAt&&r.completedAt?elapsedMs(r.startedAt,r.completedAt):null,note:r.note||'',inspection:inspections?.[id]?{measured:inspections[id].measured||'',adjustment:inspections[id].adjustment||'',approved:!!inspections[id].approved}:null};}),
   controls:Object.fromEntries(config.journey.nodes.filter(n=>n.kind==='control').map(n=>{const c=journey?.controls?.[n.id]||{};return [n.id,{measuredMm:toNumber(c.measuredMm),note:c.note||'',releasedAt:c.releasedAt||null}];})),
   afterFaceAMm:toNumber(journey?.controls?.afterFaceAMm),
   notes:(journey?.notes||[]).slice(),
   pending:(config.open_questions||[]).map(q=>q.id)
  };
 }
 function emptyJourney(){return {view:null,receiving:{receivedMm:null,recordedAt:null,targetChoice:null,note:''},controls:{afterFaceAMm:null},notes:[]};}
 function normalize(saved){
  const base=emptyJourney();if(!saved||typeof saved!=='object')return base;
  const r=saved.receiving&&typeof saved.receiving==='object'?saved.receiving:{};
  return {view:typeof saved.view==='string'?saved.view:null,
   receiving:{receivedMm:toNumber(r.receivedMm),recordedAt:typeof r.recordedAt==='string'?r.recordedAt:null,targetChoice:r.targetChoice&&typeof r.targetChoice.id==='string'?{id:r.targetChoice.id,by:String(r.targetChoice.by||''),at:String(r.targetChoice.at||'')}:null,note:String(r.note||'')},
   controls:saved.controls&&typeof saved.controls==='object'?saved.controls:{afterFaceAMm:null},
   notes:Array.isArray(saved.notes)?saved.notes.filter(n=>n&&typeof n.text==='string'):[]};
 }
 return {toNumber,resolvePath,targetCandidates,confirmedTarget,stockFor,stockPlan,STATUS,countedItems,progress,nodeStates,overallStatus,nextPhase,questionsFor,elapsedMs,formatDuration,formatClock,formatMm,passport,emptyJourney,normalize,receivingDone,controlDone};
})();
if(typeof module!=='undefined'&&module.exports)module.exports=JourneyDomain;
