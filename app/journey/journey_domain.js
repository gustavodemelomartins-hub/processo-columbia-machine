// Journey domain: pure rules for the part's route through the process (no DOM).
// It interprets data/process.json (receiving, journey) and the operator's local records.
const JourneyDomain=(()=>{
 const finite=v=>typeof v==='number'&&Number.isFinite(v);
 function toNumber(v){if(v===null||v===undefined)return null;if(typeof v==='number')return Number.isFinite(v)?v:null;const s=String(v).trim().replace(',','.');if(!s)return null;const n=Number(s);return Number.isFinite(n)?n:null;}
 function resolvePath(obj,path){return String(path).split('.').reduce((o,k)=>o==null?undefined:o[k],obj);}
 const round=(v,d=3)=>finite(v)?Math.round(v*10**d)/10**d:null;

 // Single operational target for this part (95,75 mm before heat treatment).
 function target(config){const t=config.receiving.target;return {...t,valueMm:toNumber(resolvePath(config,t.value_from))};}
 function defaultFaceA(config){return toNumber(config.receiving?.stock_rule?.face_a?.default_removal_mm)??0;}
 // Default strategy: Face A only cleans (editable removal); Face B closes the thickness.
 function stockFor(receivedMm,targetMm,faceAMm=null){
  const received=toNumber(receivedMm),tgt=toNumber(targetMm),a=toNumber(faceAMm);
  if(!finite(received)||!finite(tgt)||received<=0||tgt<=0)return {valid:false,reason:'Informe a espessura recebida.'};
  const total=round(received-tgt);
  if(total<0)return {valid:false,reason:'Espessura recebida menor que o objetivo.',received,target:tgt,totalMm:total};
  const faceA=finite(a)?round(a):0;
  if(faceA<0||faceA>total)return {valid:false,reason:'A remoção da Face A deve ficar entre 0 e '+String(total).replace('.',',')+' mm.',received,target:tgt,totalMm:total,faceAMm:faceA};
  return {valid:true,received,target:tgt,totalMm:total,faceAMm:faceA,faceBMm:round(total-faceA),symmetricMm:round(total/2)};
 }
 function stockPlan(config,journey){
  const r=journey?.receiving||{};
  return stockFor(r.receivedMm,target(config).valueMm,r.faceAMm??defaultFaceA(config));
 }

 function phaseDone(records,id){return records?.[String(id)]?.completed===true;}
 function phaseRunning(records,id){const r=records?.[String(id)];return r?.started===true&&r?.completed!==true;}
 function receivingDone(journey){return finite(toNumber(journey?.receiving?.receivedMm))&&!!journey?.receiving?.recordedAt;}

 // Ordered counted items (receiving, then every program stage in order). Drives "x de N".
 function countedItems(config){
  const ops=config.runtime.operations,items=[];
  for(const n of config.journey.nodes){
   if(!n.counts)continue;
   if(n.kind==='operation'){for(const id of ops[n.operation].phases)items.push({type:'phase',id,node:n.id,operation:n.operation});}
   else items.push({type:n.kind,id:n.id,node:n.id});
  }
  return items;
 }
 function itemDone(item,journey,records){return item.type==='phase'?phaseDone(records,item.id):item.type==='receiving'?receivingDone(journey):false;}
 function progress(config,journey,records){
  const items=countedItems(config),done=items.filter(i=>itemDone(i,journey,records)).length;
  const current=items.find(i=>!itemDone(i,journey,records))||null;
  return {done,total:items.length,current,items};
 }
 // Node status: done | running | active | waiting | later (not yet surveyed, never a pending alert).
 function nodeStates(config,journey,records){
  const p=progress(config,journey,records),ops=config.runtime.operations;
  return config.journey.nodes.map(n=>{
   if(n.kind==='operation'){
    const op=ops[n.operation];
    if(n.defined===false||op.status==='pending')return {...n,status:'later',done:0,total:0};
    const done=op.phases.filter(id=>phaseDone(records,id)).length,running=op.phases.some(id=>phaseRunning(records,id));
    const status=done===op.phases.length?'done':running?'running':p.current?.node===n.id?'active':'waiting';
    return {...n,status,done,total:op.phases.length};
   }
   if(n.kind==='receiving'){const done=receivingDone(journey);return {...n,status:done?'done':p.current?.node===n.id?'active':'waiting',done:done?1:0,total:1};}
   return {...n,status:'later',done:0,total:0};
  });
 }
 function nextPhase(config,phaseId){
  const all=config.runtime.operations.filter(o=>o.status!=='pending').flatMap(o=>o.phases),i=all.indexOf(Number(phaseId));
  return i>=0&&i<all.length-1?all[i+1]:null;
 }

 // Time helpers. Elapsed time is a local manual record; machining time is an estimate from the TAP.
 function elapsedMs(startIso,endIso=null,now=Date.now()){const s=Date.parse(startIso);if(!Number.isFinite(s))return null;const e=endIso?Date.parse(endIso):now;return Number.isFinite(e)&&e>=s?e-s:null;}
 function formatDuration(ms){if(!finite(ms))return null;const totalMin=Math.floor(ms/60000),h=Math.floor(totalMin/60),m=totalMin%60;if(totalMin<1)return 'menos de 1 min';return (h?h+' h ':'')+(h?String(m).padStart(2,'0'):m)+' min';}
 function formatClock(iso){const d=new Date(iso);if(!Number.isFinite(d.getTime()))return null;return String(d.getHours()).padStart(2,'0')+':'+String(d.getMinutes()).padStart(2,'0');}
 function formatMm(v,{min=2,max=3}={}){const n=toNumber(v);return n===null?null:n.toLocaleString('pt-BR',{minimumFractionDigits:min,maximumFractionDigits:max});}

 // Part record assembled from local records only.
 function passport(config,journey,records,data){
  const stock=stockPlan(config,journey),t=target(config);
  const phases=config.runtime.operations.filter(o=>o.status!=='pending').flatMap(o=>o.phases.map(id=>({id,operation:o.id})));
  return {
   schema:'columbia-passport/2',order:config.part.order_display,part:config.part.name,machine:config.machine_id,
   receiving:{receivedMm:toNumber(journey?.receiving?.receivedMm),recordedAt:journey?.receiving?.recordedAt||null,note:journey?.receiving?.note||''},
   target:{label:t.label,valueMm:t.valueMm},
   stock:stock.valid?{totalMm:stock.totalMm,faceAMm:stock.faceAMm,faceBMm:stock.faceBMm}:null,
   stages:phases.map(({id,operation})=>{const r=records?.[String(id)]||{},p=data.programs[config.runtime.phases[id].program];return {phase:id,operation:operation+1,program:p?.file||null,title:config.runtime.phases[id].title,started:!!r.started||!!r.completed,completed:!!r.completed,startedAt:r.startedAt||null,completedAt:r.completedAt||null,elapsedMs:r.startedAt&&r.completedAt?elapsedMs(r.startedAt,r.completedAt):null,note:r.note||''};}),
   notes:(journey?.notes||[]).slice()
  };
 }
 function emptyJourney(){return {view:null,receiving:{receivedMm:null,recordedAt:null,faceAMm:null,note:''},notes:[]};}
 function normalize(saved){
  const base=emptyJourney();if(!saved||typeof saved!=='object')return base;
  const r=saved.receiving&&typeof saved.receiving==='object'?saved.receiving:{};
  return {view:typeof saved.view==='string'&&!saved.view.startsWith('control')?saved.view:null,
   receiving:{receivedMm:toNumber(r.receivedMm),recordedAt:typeof r.recordedAt==='string'?r.recordedAt:null,faceAMm:toNumber(r.faceAMm),note:String(r.note||'')},
   notes:Array.isArray(saved.notes)?saved.notes.filter(n=>n&&typeof n.text==='string'):[]};
 }
 return {toNumber,resolvePath,target,defaultFaceA,stockFor,stockPlan,countedItems,progress,nodeStates,nextPhase,elapsedMs,formatDuration,formatClock,formatMm,passport,emptyJourney,normalize,receivingDone};
})();
if(typeof module!=='undefined'&&module.exports)module.exports=JourneyDomain;
