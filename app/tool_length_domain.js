// Single domain rule. Coordinates describe nominal travel; they are not total tool length.
const ToolLengthRule=(()=>{
 function evaluate({zMin,resolved,topZero,margin}){
  const maximumDescent=resolved&&topZero&&Number.isFinite(zMin)?Math.max(0,-zMin):null;
  const validMargin=typeof margin==='number'&&Number.isFinite(margin)&&margin>=0;
  const exactRequired=maximumDescent!==null&&maximumDescent>0&&validMargin?maximumDescent+margin:null;
  return {zMin,maximumDescent,margin:validMargin?margin:null,exactRequired,recommended:exactRequired===null?null:Math.ceil(exactRequired),resolved:maximumDescent!==null};
 }
 function presentation(rule,{standard=false,faceOffsetLimit=null}={}){
  const evidence=rule.evidence||[],nominal=standard&&evidence.length&&evidence.every(e=>e.zMin===0)?0:null;
  const processLimit=nominal===0&&Number.isFinite(faceOffsetLimit)&&faceOffsetLimit>=0?faceOffsetLimit:null;
  return {value:processLimit??rule.maximumDescent,label:processLimit!==null?'Faceamento no corretor':'Descida máxima no programa',kind:processLimit!==null?'process':'program',nominalZ:nominal,source:processLimit!==null?'Limite do processo; Z nominal do TAP: 0 mm':rule.resolved?'Extraído do programa · Z0 no topo':'Descida a confirmar'};
 }
 return Object.freeze({evaluate,presentation});
})();
if(typeof module!=='undefined'&&module.exports)module.exports=ToolLengthRule;
