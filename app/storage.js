// Recover malformed browser storage without renumbering or resetting valid records.
function normalizeSavedState(value, phaseCount) {
 const object=v=>v!==null&&typeof v==='object'&&!Array.isArray(v);
 if(!object(value))return {};
 const saved={...value};
 for(const key of ['checks','inspections','stickouts','openGroups','operator','operationCheckins','toolMargins','cuttingLengths','operationPhases']) {
  if(saved[key]!==undefined&&!object(saved[key]))saved[key]={};
 }
 for(const key of ['face','tooling','faceTiming'])if(saved[key]!==undefined&&!object(saved[key]))delete saved[key];
 if(saved.phase!==undefined)saved.phase=Number.isInteger(saved.phase)?Math.max(0,Math.min(phaseCount-1,saved.phase)):0;
 if(saved.operation!==undefined&&(!Number.isInteger(saved.operation)||saved.operation<0||saved.operation>2))delete saved.operation;
 for(const key of ['checks','inspections','operator'])if(saved[key]) {
  saved[key]={...saved[key]};for(const [id,record]of Object.entries(saved[key]))if(!object(record))delete saved[key][id];
 }
 if(saved.faceTiming){saved.faceTiming={...saved.faceTiming};if(!object(saved.faceTiming.stockByStage))saved.faceTiming.stockByStage={};}
 if(saved.operationPhases){saved.operationPhases={...saved.operationPhases};for(const[id,phase]of Object.entries(saved.operationPhases))if(!Number.isInteger(phase)||phase<0||phase>=phaseCount)delete saved.operationPhases[id];}
 return saved;
}
if(typeof module!=='undefined'&&module.exports)module.exports=normalizeSavedState;
