const ToolingDomain=(()=>{
 const JOB_MACHINE='mini-portal',SCHEMA='columbia-tooling/1';
 const positive=v=>{if(!['string','number'].includes(typeof v)||String(v).trim()==='')return null;const n=Number(v);return Number.isFinite(n)&&n>0?n:null};
 const key=(machine,id)=>machine+'|'+id;
 function profile(config,id){const m=config.machines.find(m=>m.id===id);if(!m)throw Error('Máquina desconhecida');return {...config.baseProfiles[m.baseProfileId],...m};}
 function create({tools,legacy={},saved,jobId,profiles,machineId=JOB_MACHINE}){
  const JOB_MACHINE=machineId;profile(profiles,JOB_MACHINE);
  const store=saved?.schema===SCHEMA?JSON.parse(JSON.stringify(saved)):{schema:SCHEMA,assignments:{},assemblies:{},preparations:{},pocketStates:{},toolNotes:{},toolImages:{},history:[]};
  for(const name of ['assignments','assemblies','preparations','pocketStates','toolNotes','toolImages'])store[name]??={};store.history??=[];
  const jobKey=id=>jobId+'|'+id;
  const catalog=tools.map(t=>({id:t.id,logicalToolNumber:t.id,description:t.name,diameter:t.diameter,radius:t.radius,source:'extraído do programa',programs:[...t.programs]}));
  function assignment(machine,id){profile(profiles,machine);const k=key(machine,id);return store.assignments[k]??={machineId:machine,toolId:Number(id),assemblyId:k,physicalPocket:null,measuredLength:null,measuredDiameter:null,offset:null,mounted:false,inMachine:false,lastCheckedAt:null,positionStatus:'A_CONFIRMAR'};}
  function assembly(machine,id){const k=key(machine,id);return store.assemblies[k]??={id:k,toolId:Number(id),holder:null,cuttingLength:null,source:'A_CONFIRMAR'};}
  function preparation(id){return store.preparations[jobKey(id)]??={jobId,toolId:Number(id),lengthChecked:false,offsetChecked:false,lastConfirmedAt:null};}
  for(const t of tools){
   const a=assignment(JOB_MACHINE,t.id),as=assembly(JOB_MACHINE,t.id),prep=preparation(t.id);
   if(saved?.schema!==SCHEMA){const c=legacy.checks?.[t.id]||{};a.measuredLength=legacy.stickouts?.[t.id]??null;a.mounted=!!c.mounted;a.inMachine=!!c.machine;prep.lengthChecked=!!c.length;prep.offsetChecked=!!c.offset;as.cuttingLength=legacy.cuttingLengths?.[t.id]??null;}
  }
  // Compatibility views point to canonical entities; no second copy of checklists or dimensions.
  const checks={},stickouts={},cuttingLengths={};
  for(const t of tools){const id=t.id,a=assignment(JOB_MACHINE,id),prep=preparation(id),as=assembly(JOB_MACHINE,id),view={};
   for(const [flag,obj,field]of[['mounted',a,'mounted'],['machine',a,'inMachine'],['length',prep,'lengthChecked'],['offset',prep,'offsetChecked']])Object.defineProperty(view,flag,{enumerable:true,get:()=>!!obj[field],set:v=>{obj[field]=!!v;prep.lastConfirmedAt=null;}});
   Object.defineProperty(checks,id,{enumerable:true,get:()=>view,set:v=>{for(const f of ['mounted','machine','length','offset'])view[f]=!!v?.[f];}});
   Object.defineProperty(stickouts,id,{enumerable:true,get:()=>a.measuredLength??'',set:v=>{a.measuredLength=v;prep.lastConfirmedAt=null;}});
   Object.defineProperty(cuttingLengths,id,{enumerable:true,get:()=>as.cuttingLength??'',set:v=>as.cuttingLength=v});
  }
  function record(type,machine,id,note){store.history.push({type,machineId:machine,toolId:Number(id),jobId:machine===JOB_MACHINE?jobId:null,at:new Date().toISOString(),note});if(store.history.length>200)store.history.shift();}
  function setPocket(machine,id,value){const m=profile(profiles,machine),a=assignment(machine,id),p=value===null||String(value).trim()===''?null:Number(value);
   if(p!==null&&(!Number.isInteger(p)||p<1||m.magazineCapacity!==null&&p>m.magazineCapacity))return {ok:false,message:'Informe uma posição física válida para esta máquina.'};
   if(p!==null&&Object.values(store.assignments).some(v=>v.machineId===machine&&v.toolId!==Number(id)&&v.physicalPocket===p))return {ok:false,message:'Esta posição já possui uma ferramenta cadastrada.'};
   if(p!==null&&store.pocketStates[key(machine,p)]==='empty')delete store.pocketStates[key(machine,p)];
   a.physicalPocket=p;a.positionStatus=p===null?'A_CONFIRMAR':'CONFIRMADO';a.lastCheckedAt=p===null?null:new Date().toISOString();record('position',machine,id,p===null?'Posição física a confirmar':'Posição física '+p+' conferida');return {ok:true};
  }
  function setMeasuredDiameter(machine,id,value){
   const diameter=value===null||String(value).trim()===''?null:positive(value);
   if(diameter===null&&value!==null&&String(value).trim()!=='')return {ok:false,message:'Informe um diâmetro real positivo ou deixe sem informação.'};
   const a=assignment(machine,id);a.measuredDiameter=diameter;a.diameterSource=diameter===null?'A_CONFIRMAR':'INFORMADO_PELO_OPERADOR';return {ok:true};
  }
  function pocketEmpty(machine,pocket){const m=profile(profiles,machine);if(!Number.isInteger(pocket)||!m.magazineCapacity||pocket<1||pocket>m.magazineCapacity)return {ok:false,message:'Posição fora do perfil da máquina.'};if(Object.values(store.assignments).some(a=>a.machineId===machine&&a.physicalPocket===pocket))return {ok:false,message:'Retire o vínculo da ferramenta antes de confirmar a posição vazia.'};store.pocketStates[key(machine,pocket)]='empty';return {ok:true};}
  function requirement(t,rule,file=null){return {jobId,programId:file,toolId:t.id,maxProgramDescent:rule.maximumDescent,recommendedStickout:rule.recommended,exactRequired:rule.exactRequired,margin:rule.margin,resolved:rule.resolved,evidence:rule.evidence,source:rule.resolved?'CALCULADO_DO_TAP':'A_CONFIRMAR'};}
  function status(id,rule,standard=false){const a=assignment(JOB_MACHINE,id),p=preparation(id),measured=positive(a.measuredLength),lengthOK=measured!==null&&(standard||rule.recommended!==null&&measured>=rule.recommended);
   const cut=positive(assembly(JOB_MACHINE,id).cuttingLength),physicalOK=cut===null||measured===null||cut<=measured;
   const flags={mounted:a.mounted,length:p.lengthChecked&&lengthOK&&physicalOK,offset:p.offsetChecked,machine:a.inMachine};
   const ready=Object.values(flags).every(Boolean);
   const bad=measured!==null&&!lengthOK||p.lengthChecked&&!lengthOK||!physicalOK;
   const began=measured!==null||Object.values(flags).some(Boolean)||a.offset!==null;
   return {status:ready?'PRONTA':bad?'A CONFERIR':began?'EM PREPARAÇÃO':'NÃO INICIADA',ready,flags,lengthOK,measured};
  }
  function confirm(id,rule,standard=false){const s=status(id,rule,standard);if(!s.ready)return {ok:false,message:s.status==='A CONFERIR'?'Comprimento insuficiente ou descida a confirmar. Revise a montagem.':'Informe o comprimento medido e confira os quatro itens.'};const a=assignment(JOB_MACHINE,id),p=preparation(id);p.lastConfirmedAt=a.lastCheckedAt=new Date().toISOString();record('preparation',JOB_MACHINE,id,'Preparação confirmada · '+s.measured+' mm · corretor '+(a.offset??'conferido manualmente'));return {ok:true,message:'Preparação confirmada para este trabalho.'};}
  function magazine(machine){const m=profile(profiles,machine),assigned=Object.values(store.assignments).filter(a=>a.machineId===machine);
   if(m.magazineCapacity===null)return {capacity:null,slots:[],assignments:assigned};
   return {capacity:m.magazineCapacity,slots:Array.from({length:m.magazineCapacity},(_,i)=>{const n=i+1,a=assigned.find(a=>a.physicalPocket===n);return {physicalPocket:n,assignment:a??null,status:a?'assigned':store.pocketStates[key(machine,n)]==='empty'?'empty':'unknown'};}),assignments:assigned};
  }
  return {store,catalog,profile:id=>profile(profiles,id),assignment,assembly,preparation,checks,stickouts,cuttingLengths,setPocket,setMeasuredDiameter,pocketEmpty,requirement,status,confirm,magazine,record,jobMachineId:JOB_MACHINE,jobId};
 }
 return {create,profile,positive,JOB_MACHINE};
})();
if(typeof module!=='undefined'&&module.exports)module.exports=ToolingDomain;
