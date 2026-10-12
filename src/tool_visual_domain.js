// Assembly illustration is distinct from TAP descent and the unmeasured physical assignment.
const ToolRepresentationRule=(()=>{
 const positive=v=>typeof v==='number'&&Number.isFinite(v)&&v>0?v:null;
 function resolve({measuredMount=null,recommendedMount=null,cuttingLength=null,reference=null}){
  const measured=positive(measuredMount),ref=positive(reference?.stickout_mm),estimated=positive(recommendedMount),cut=positive(cuttingLength);
  const mount=measured??ref??estimated;
  return {mount,cut,mountSource:measured!==null?'medida':ref!==null?'referência do processo':'estimada',invalidCut:cut!==null&&mount!==null&&cut>mount,holder:reference?.holder??null};
 }
 return {resolve};
})();
if(typeof module!=='undefined'&&module.exports)module.exports=ToolRepresentationRule;
