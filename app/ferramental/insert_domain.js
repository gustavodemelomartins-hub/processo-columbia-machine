// Manual insert usage belongs to a machine/tool assembly, never to playback.
const InsertUsageDomain=(()=>{
 const key=(machine,id)=>machine+'|'+Number(id),validCount=n=>Number.isInteger(n)&&n>=0&&n<=1000;
 function get(store,machine,id){
  store.insertUsage??={};const u=store.insertUsage[key(machine,id)]??={count:0,cycle:1,events:[]};u.cycles??=[];
  if(u.studyVersion!==1){
   for(const e of u.events){if(e.action!=='change'||!e.before?.count)continue;const entry={id:key(machine,id)+'|'+e.before.cycle+'|'+e.at,cycle:e.before.cycle,cavities:e.before.count,kind:'unspecified',at:e.at,jobId:e.jobId??null,source:'registro manual legado'};if(!u.cycles.some(c=>c.id===entry.id))u.cycles.push(entry);e.closedCycleId=entry.id;}
   u.studyVersion=1;
  }
  return u;
 }
 function record(store,machine,id,action,{cavityId=null,jobId=null,total=null,kind='unspecified',at=new Date().toISOString()}={}){
  const u=get(store,machine,id);let before={count:u.count,cycle:u.cycle},closedCycleId=null;
  if(action==='add'){if(!validCount(u.count+1))return false;u.count++;}
  else if(action==='subtract'){if(!u.count)return false;u.count--;}
  else if(action==='set'){if(!validCount(total))return false;u.count=total;}
  else if(action==='change'){
   const count=total===null?u.count:total;if(!validCount(count)||!['turn','replace','unspecified'].includes(kind)||total!==null&&count===0)return false;
   // Undo reopens the cycle with its declared quantity, including a directly entered batch.
   before={count,cycle:u.cycle};
   if(count>0){const entry={id:key(machine,id)+'|'+u.cycle+'|'+at,cycle:u.cycle,cavities:count,kind,at,jobId,source:'registro manual'};u.cycles.push(entry);closedCycleId=entry.id;}
   u.count=0;u.cycle++;
  }else return false;
  u.events.push({action,before,after:{count:u.count,cycle:u.cycle},closedCycleId,at,cavityId,jobId,source:'registro manual'});if(u.events.length>50)u.events.shift();return true;
 }
 function undo(store,machine,id){const u=get(store,machine,id),last=u.events.pop();if(!last)return false;if(last.closedCycleId)u.cycles=u.cycles.filter(c=>c.id!==last.closedCycleId);Object.assign(u,last.before);return true;}
 function statistics(store,machine,id){const u=get(store,machine,id),n=u.cycles.length,total=u.cycles.reduce((a,c)=>a+c.cavities,0);return {cycles:n,totalCavities:total,average:n?total/n:null,turns:u.cycles.filter(c=>c.kind==='turn').length,replacements:u.cycles.filter(c=>c.kind==='replace').length};}
 return {get,record,undo,statistics};
})();
if(typeof module!=='undefined'&&module.exports)module.exports=InsertUsageDomain;
