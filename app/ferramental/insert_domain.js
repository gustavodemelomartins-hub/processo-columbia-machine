// Insert life: one reusable "edge cycle" per machine/tool assembly, never fed by playback.
// A cycle counts work done by one insert edge until it is turned or replaced. The unit depends on
// the operation: facing counts passes (with removed stock), cavity machining counts cavities.
const InsertUsageDomain=(()=>{
 const UNITS={cavity:{one:'cavidade',many:'cavidades'},pass:{one:'passe',many:'passes'}};
 const key=(machine,id)=>machine+'|'+Number(id),validCount=n=>Number.isInteger(n)&&n>=0&&n<=1000;
 const round=v=>Math.round(v*1000)/1000;
 // Legacy cycles stored the quantity as `cavities`; new cycles keep it in `count` too.
 const cycleCount=c=>Number.isFinite(c?.count)?c.count:Number.isFinite(c?.cavities)?c.cavities:0;
 function get(store,machine,id){
  store.insertUsage??={};const u=store.insertUsage[key(machine,id)]??={count:0,cycle:1,events:[]};u.cycles??=[];
  if(u.studyVersion!==1){
   for(const e of u.events){if(e.action!=='change'||!e.before?.count)continue;const entry={id:key(machine,id)+'|'+e.before.cycle+'|'+e.at,cycle:e.before.cycle,cavities:e.before.count,kind:'unspecified',at:e.at,jobId:e.jobId??null,source:'registro manual legado'};if(!u.cycles.some(c=>c.id===entry.id))u.cycles.push(entry);e.closedCycleId=entry.id;}
   u.studyVersion=1;
  }
  return u;
 }
 // context: {unit, operation, program, stage, reductionPerPassMm} — known by the system, never typed by the operator.
 function record(store,machine,id,action,{cavityId=null,jobId=null,total=null,kind='unspecified',at=new Date().toISOString(),unit='cavity',context={}}={}){
  const u=get(store,machine,id);let before={count:u.count,cycle:u.cycle},closedCycleId=null;
  if(!UNITS[unit])return false;
  if(action==='add'){if(!validCount(u.count+1))return false;u.count++;}
  else if(action==='subtract'){if(!u.count)return false;u.count--;}
  else if(action==='set'){if(!validCount(total))return false;u.count=total;}
  else if(action==='change'){
   const count=total===null?u.count:total;if(!validCount(count)||!['turn','replace','unspecified'].includes(kind)||total!==null&&count===0)return false;
   // Undo reopens the cycle with its declared quantity, including a directly entered batch.
   before={count,cycle:u.cycle};
   if(count>0){
    const reduction=unit==='pass'&&Number.isFinite(context.reductionPerPassMm)&&context.reductionPerPassMm>0?context.reductionPerPassMm:null;
    const entry={id:key(machine,id)+'|'+u.cycle+'|'+at,cycle:u.cycle,count,unit,kind,at,jobId,toolId:Number(id),machine,
     operation:context.operation??null,program:context.program??null,stage:context.stage??null,
     reductionPerPassMm:reduction,removedMm:reduction===null?null:round(count*reduction),source:'registro manual'};
    if(unit==='cavity')entry.cavities=count;
    u.cycles.push(entry);closedCycleId=entry.id;
   }
   u.count=0;u.cycle++;
  }else return false;
  u.events.push({action,before,after:{count:u.count,cycle:u.cycle},closedCycleId,at,cavityId,jobId,source:'registro manual'});if(u.events.length>50)u.events.shift();return true;
 }
 function undo(store,machine,id){const u=get(store,machine,id),last=u.events.pop();if(!last)return false;if(last.closedCycleId)u.cycles=u.cycles.filter(c=>c.id!==last.closedCycleId);Object.assign(u,last.before);return true;}
 function statistics(store,machine,id){
  const u=get(store,machine,id),n=u.cycles.length,total=u.cycles.reduce((a,c)=>a+cycleCount(c),0),removed=u.cycles.reduce((a,c)=>a+(Number.isFinite(c.removedMm)?c.removedMm:0),0);
  return {cycles:n,total,totalCavities:total,average:n?total/n:null,removedMm:round(removed),turns:u.cycles.filter(c=>c.kind==='turn').length,replacements:u.cycles.filter(c=>c.kind==='replace').length};
 }
 return {UNITS,cycleCount,get,record,undo,statistics};
})();
if(typeof module!=='undefined'&&module.exports)module.exports=InsertUsageDomain;
