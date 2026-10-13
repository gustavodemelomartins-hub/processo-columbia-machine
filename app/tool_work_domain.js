// Physical readiness, scheduled use and lateral radius difference are independent.
const ToolWorkDomain=(()=>{
 const positive=n=>typeof n==='number'&&Number.isFinite(n)&&n>0;
 function compensation({nominalDiameter,measuredDiameter,mode,programs=[]}){
  if(!positive(nominalDiameter)||!positive(measuredDiameter))return {value:null,applicable:false,reason:'Informe o diâmetro real'};
  if(mode!=='radius_difference')return {value:null,applicable:false,reason:'Regra do corretor a confirmar'};
  const value=Math.round((measuredDiameter-nominalDiameter)/2*1e6)/1e6;
  if(!Number.isFinite(value))return {value:null,applicable:false,reason:'Diâmetro a conferir'};
  const supported=programs.filter(p=>p.compensationCodes.some(c=>c==='G41'||c==='G42'));
  return {value:Object.is(value,-0)?0:value,applicable:supported.length>0,reason:supported.length?'Diferença de raio · conferir na máquina':'Sem G41/G42 para esta ferramenta no TAP',programs:supported.map(p=>p.file)};
 }
 function physical(a){const count=Number(!!a.mounted)+Number(!!a.inMachine);return {count,percent:count*50,both:count===2,label:count===2?'Montada · na máquina':a.inMachine?'Conferir montagem':a.mounted?'Levar à máquina':'Montar'};}
 function usage({toolId,stages,currentStage,records={}}){
  const uses=stages.filter(s=>s.tools.includes(Number(toolId))),done=uses.filter(s=>records[String(s.id)]?.completed===true).length,current=stages.findIndex(s=>s.id===currentStage),next=current<0?null:stages.slice(current+1).find(s=>records[String(s.id)]?.completed!==true),future=current<0?[]:stages.slice(current+1).filter(s=>s.tools.includes(Number(toolId))&&records[String(s.id)]?.completed!==true);
  const relation=current>=0&&stages[current].tools.includes(Number(toolId))?'current':next?.tools.includes(Number(toolId))?'next':future.length?'later':uses.length&&done===uses.length?'done':'earlier';
  const label={current:'Programa atual',next:'Próxima etapa',later:'Mais adiante',done:'Uso concluído',earlier:'Etapa anterior'}[relation];
  return {relation,label,completed:done,total:uses.length,percent:uses.length?done*100/uses.length:0,nextFile:relation==='next'?next.file:future[0]?.file??null};
 }
 return {compensation,physical,usage};
})();
if(typeof module!=='undefined'&&module.exports)module.exports=ToolWorkDomain;
