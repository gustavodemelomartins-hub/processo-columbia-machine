/* The operational table edits canonical machine assignments. The sidebar only reads them. */
const toolingUI={tab:'work',machine:tooling.jobMachineId,selectedTool:null,message:''};
const toolIsStandard=t=>OPERATOR_CONFIG.tool_mounting.tools[t.id]?.mounting_mode==='standard';
const toolingStatus=t=>tooling.status(t.id,mountingRule(t),toolIsStandard(t));
const stateText=s=>s.ready?'✓ PRONTA':s.status;
function physicalToolData(id){
 const a=tooling.assignment(tooling.jobMachineId,Number(id));
 return {assignment:a,mount:ToolingDomain.positive(a.measuredLength),diameter:ToolingDomain.positive(a.measuredDiameter),offset:a.offset?.trim()||null,mounted:!!a.mounted,machine:!!a.inMachine};
}

function toolWorkStages(){return processOperations.flatMap(o=>o.phases.map(id=>({id,tools:phases[id].tools,file:phases[id].program===null?null:DATA.programs[phases[id].program].file})));}
function toolWorkStatus(id){return {usage:ToolWorkDomain.usage({toolId:Number(id),stages:toolWorkStages(),currentStage:state.operation===PENDING_OPERATION?null:state.phase,records:state.operator}),physical:ToolWorkDomain.physical(tooling.assignment(tooling.jobMachineId,Number(id)))};}
function offsetSuggestion(id){
 const t=DATA.tools.find(t=>t.id===Number(id));if(!t)return {value:null,applicable:false};
 const programs=t.programs.map(file=>({file,compensationCodes:(STRATEGY_DATA[file]?.strategies??[]).filter(s=>s.tools.includes(t.id)).flatMap(s=>s.compensation_codes)}));
 return ToolWorkDomain.compensation({nominalDiameter:t.diameter,measuredDiameter:physicalToolData(id).diameter,mode:OPERATOR_CONFIG.cutter_compensation.machine_id===tooling.jobMachineId?OPERATOR_CONFIG.cutter_compensation.mode:null,programs});
}
function offsetText(value){return (value>0?'+':'')+value.toLocaleString('pt-BR',{maximumFractionDigits:6})+' mm';}
function offsetSuggestionMarkup(id){
 const r=offsetSuggestion(id),a=physicalToolData(id),e=a.assignment.offsetEvidence;
 const stale=!!e&&(e.measuredDiameter!==a.diameter||e.mode!==OPERATOR_CONFIG.cutter_compensation.mode);
 if(r.value===null)return stale?'<small class="offset-review">Medida mudou · revisar corretor</small>':'';
 return '<div class="offset-suggestion">'+(stale?'<small class="offset-review">Medida mudou · revisar corretor</small>':'')+(r.applicable?'<button data-use-offset="'+id+'" aria-label="Usar corretor sugerido '+esc(offsetText(r.value))+' T'+id+'">Usar '+offsetText(r.value)+'</button><small>Diferença de raio · conferir</small>':'<small>Sem compensação lateral no TAP</small>')+'</div>';
}
function toolUseMarkup(id){const s=toolWorkStatus(id);return '<span class="tool-use-badge" data-relation="'+s.usage.relation+'">'+s.usage.label+'</span><div class="tool-mount-progress"><span>'+s.physical.label+'</span><progress max="2" value="'+s.physical.count+'" aria-label="Montagem T'+id+': '+s.physical.count+' de 2, montada e na máquina">'+s.physical.count+'/2</progress></div>';}
function renderToolWorkStatus(){
 const section=$('workToolsSection');if(!section)return;
 // Finishing a stage changes the priority order: redraw the table once (it calls back here with the new order).
 if($('workToolList')?.dataset.order!==undefined&&$('workToolList').dataset.order!==toolPriority().order.join(','))return renderWorkTools();
 let host=$('toolReadinessSummary');if(!host){host=document.createElement('div');host.id='toolReadinessSummary';host.className='tool-readiness-summary';section.querySelector('.section-line').after(host);}
 const count=DATA.tools.filter(t=>toolWorkStatus(t.id).physical.both).length;
 const all=toolWorkStages(),index=state.operation===PENDING_OPERATION?-1:all.findIndex(s=>s.id===state.phase),next=index<0?null:all.slice(index+1).find(s=>state.operator[String(s.id)]?.completed!==true);
 host.innerHTML='<div><strong>'+count+' / '+DATA.tools.length+'</strong><span> montadas e na máquina</span><progress max="'+DATA.tools.length+'" value="'+count+'" aria-label="Ferramentas montadas e na máquina">'+count+'/'+DATA.tools.length+'</progress></div><p>'+(next?'Próxima etapa · '+esc(next.file)+' · '+next.tools.map(id=>'T'+id+': '+toolWorkStatus(id).physical.label.toLowerCase()).join(' / '):'Próxima etapa a definir')+'</p>';
 for(const t of DATA.tools){const node=document.querySelector('[data-tool-work-status="'+t.id+'"]');if(node)node.innerHTML=toolUseMarkup(t.id);const row=document.querySelector('[data-work-tool="'+t.id+'"]');if(row)row.dataset.next=String(toolWorkStatus(t.id).usage.relation==='next');}
}

// Priority follows the remaining journey: the first unfinished stage onward, in program order.
function toolPriority(){
 const upcoming=toolWorkStages().filter(s=>state.operator[String(s.id)]?.completed!==true),order=[],files={};
 for(const s of upcoming)for(const id of s.tools){if(!order.includes(id))order.push(id);if(s.file)(files[id]??=[]).includes(s.file)||files[id].push(s.file);}
 return {order,files};
}
// Measured mounting against each remaining program: the first program it cannot reach asks to pull the tool out.
function mountAdvice(t,files=[]){
 const mount=physicalToolData(t.id).mount;if(toolIsStandard(t)||mount===null||!files.length)return null;
 const needs=files.map(file=>({file,need:mountingRule(t,file).recommended})).filter(n=>n.need!==null);if(!needs.length)return null;
 const short=needs.find(n=>mount<n.need),max=Math.max(...needs.map(n=>n.need)),margin=adoptedMargin(t),name=f=>f.replace('.TAP',''),mm=n=>exactLength(Math.round(n*1e6)/1e6);
 if(short)return {kind:'pull',text:'Puxar '+mm(short.need-mount)+' para fora antes do '+name(short.file)+' (mín. '+mm(short.need)+')'};
 if(margin!==null&&mount-max>margin)return {kind:'shorten',text:'Pode encurtar até '+mm(max)+' (sobra '+mm(mount-max)+')'};
 return {kind:'ok',text:'Atende até o '+name(needs.at(-1).file)};
}
function operationalToolDescent(t,r){return ToolLengthRule.presentation(r,{standard:toolIsStandard(t),faceOffsetLimit:OPERATOR_CONFIG.tool_mounting.tools[t.id]?.face_offset_limit_mm??null});}
function toolRow(id,file){
 const t=DATA.tools.find(t=>t.id===Number(id)),r=mountingRule(t,file),physical=physicalToolData(id),meta=cncData?.[file]?.meta.tools.find(v=>v.t_number===Number(id));
 const shown=operationalToolDescent(t,r);
 const parameters=meta?'<div class="tool-parameters"><span><b>S</b> '+technicalNumber(meta.rpm)+' <small>rpm</small></span><span><b>F</b> '+technicalNumber(meta.feeds_mm_min)+' <small>mm/min</small></span><span>'+esc(cncData[file].meta.wcs.join(' / '))+'</span></div>':'';
 return '<article class="tool active" data-tool-card="'+id+'"><div class="tool-identity"><b class="tool-id">T'+id+'</b><h4 class="toolname">'+esc(toolNames[id]||t.name)+'</h4>'+parameters+'</div><div class="length-pair"><div><span>'+shown.label+'</span><strong>'+exactLength(shown.value)+'</strong></div><div class="recommended"><span>Montagem recomendada</span><strong>'+mountingLabel(t,r)+'</strong></div></div><p class="length-origin">'+esc(shown.source)+'</p><p class="tool-margin-note">Margem: +'+exactLength(adoptedMargin(t))+'</p><dl class="physical-tool-values">'+[
  ['Montagem medida',physical.mount===null?'Não informado':exactLength(physical.mount)],['Diâmetro real',physical.diameter===null?'Não informado':'Ø'+exactLength(physical.diameter)],['Corretor',physical.offset??'Não informado'],['Montada',physical.mounted?'Sim':'Não marcada'],['Na máquina',physical.machine?'Sim':'Não marcada']
 ].map(([label,value])=>'<div><dt>'+label+'</dt><dd>'+esc(value)+'</dd></div>').join('')+'</dl>'+(OPERATOR_CONFIG.tool_mounting.tools[id]?.visual_reference?'<p class="tool-visual-reference">3D: corte útil de referência '+exactLength(toolDimensions(id).cut)+' · montagem '+exactLength(toolDimensions(id).mount)+' ('+(physical.mount===null?'referência do operador':'medida')+'). Porta-ferramenta genérico.</p>':'')+toolPhotoMarkup(id,'sidebar')+'</article>';
}
function renderWorkTools(){
 $('jobMachineName').textContent=tooling.profile(tooling.jobMachineId).name;$('workToolCount').textContent=DATA.tools.length+' ferramentas';
 const active=programTools(),priority=toolPriority(),rank=t=>{const i=priority.order.indexOf(t.id);return i<0?Infinity:i};
 const tools=[...DATA.tools].sort((a,b)=>rank(a)-rank(b));
 $('workToolList').dataset.order=priority.order.join(',');
 $('workToolList').innerHTML='<div class="work-tool-table-scroll" tabindex="0" role="region" aria-label="Tabela de ferramentas; rolagem horizontal em telas menores"><table class="work-tool-table"><thead><tr>'+['T','Descrição','Programas','Descida máxima','Montagem recomendada','Montagem medida (mm)','Ø real (mm)','Corretor','Montada','Na máquina'].map(label=>'<th scope="col">'+label+'</th>').join('')+'</tr></thead><tbody>'+tools.map(t=>{
  const a=physicalToolData(t.id),r=mountingRule(t),shown=operationalToolDescent(t,r),n=rank(t),advice=mountAdvice(t,priority.files[t.id]);
  const field=(name,value,type='number')=>'<input type="'+type+'" '+(type==='number'?'min="0.001" step="any"':'maxlength="40"')+' data-table-tool="'+t.id+'" data-field="'+name+'" value="'+esc(value??'')+'" placeholder="Não informado" aria-label="'+({measuredLength:'Montagem medida',measuredDiameter:'Diâmetro real',offset:'Corretor'})[name]+' T'+t.id+'">';
  const check=(name,checked,label)=>'<label class="table-check"><input type="checkbox" data-table-tool="'+t.id+'" data-field="'+name+'" '+(checked?'checked':'')+' aria-label="'+label+' T'+t.id+'"></label>';
  return '<tr data-work-tool="'+t.id+'" data-current="'+active.includes(t.id)+'" data-priority="'+(n===Infinity?'':n+1)+'"><th scope="row"><b>T'+t.id+'</b><small class="tool-priority">'+(n===Infinity?'Sem uso pela frente':(n+1)+'ª a usar')+'</small></th><td class="tool-description"><div class="tool-desc-content"><span class="tool-description-name">'+esc(toolNames[t.id]||t.name)+'</span>'+toolPhotoMarkup(t.id,'table')+'</div></td><td><div class="tool-programs">'+t.programs.map(p=>esc(p.replace('.TAP',''))).join(' · ')+'</div><div data-tool-work-status="'+t.id+'">'+toolUseMarkup(t.id)+'</div></td><td>'+exactLength(shown.value)+(shown.kind==='process'?'<small class="process-descent">Corretor · Z nominal 0 mm</small>':'')+'</td><td><strong>'+mountingLabel(t,r)+'</strong></td><td>'+field('measuredLength',a.mount)+(advice?'<small class="mount-advice" data-advice="'+advice.kind+'">'+esc(advice.text)+'</small>':'')+'</td><td>'+field('measuredDiameter',a.diameter)+'</td><td>'+field('offset',a.offset,'text')+offsetSuggestionMarkup(t.id)+'</td><td>'+check('mounted',a.mounted,'Montada')+'</td><td>'+check('inMachine',a.machine,'Na máquina')+'</td></tr>';
 }).join('')+'</tbody></table></div>';
 $('toolTableMessage').textContent=toolingUI.message;
 $('workToolList').querySelectorAll('[data-table-tool]').forEach(input=>input.onchange=()=>{
  const id=Number(input.dataset.tableTool),field=input.dataset.field,a=tooling.assignment(tooling.jobMachineId,id),value=input.type==='checkbox'?input.checked:input.value.trim();toolingUI.message='';
  // Removing a focused number input can emit a second native change during the render.
  input.onchange=null;
  if(field==='measuredDiameter'){
   const result=tooling.setMeasuredDiameter(tooling.jobMachineId,id,value);if(!result.ok)toolingUI.message=result.message;
  }else if(field==='measuredLength'){
   const length=value===''?null:ToolingDomain.positive(value);
   if(value!==''&&length===null)toolingUI.message='Informe uma montagem medida positiva ou deixe sem informação.';
   else{state.stickouts[id]=length;state.checks[id].length=false;}
  }else if(field==='offset'){a.offset=value||null;a.offsetEvidence=null;state.checks[id].offset=false;}
  else if(field==='mounted')state.checks[id].mounted=value;
  else if(field==='inMachine')state.checks[id].machine=value;
  persist();renderTools();$('workToolList').querySelector('[data-table-tool="'+id+'"][data-field="'+field+'"]')?.focus({preventScroll:true});
 });
 $('workToolList').querySelectorAll('[data-use-offset]').forEach(button=>button.onclick=()=>{
  const id=Number(button.dataset.useOffset),r=offsetSuggestion(id);if(!r.applicable||r.value===null)return;
  const a=tooling.assignment(tooling.jobMachineId,id),old={offset:a.offset,offsetEvidence:a.offsetEvidence},oldChecked=state.checks[id].offset;a.offset=String(r.value);a.offsetEvidence={mode:'radius_difference',nominalDiameter:DATA.tools.find(t=>t.id===id).diameter,measuredDiameter:physicalToolData(id).diameter,value:r.value,programs:r.programs,source:'sugestão calculada aceita pelo operador',at:new Date().toISOString()};state.checks[id].offset=false;
  if(!persist()){Object.assign(a,old);state.checks[id].offset=oldChecked;toolingUI.message='Não foi possível salvar o corretor neste navegador.';}else toolingUI.message='T'+id+' · corretor preenchido: '+offsetText(r.value)+'. Conferir na máquina.';
  renderTools();$('workToolList').querySelector('[data-table-tool="'+id+'"][data-field="offset"]')?.focus({preventScroll:true});
 });
 renderToolWorkStatus();bindToolPhotoButtons();
}
// Compatibility entry point now opens the ordinary table row, without a preparation workflow.
function openToolPreparation(id){const row=$('workToolList').querySelector('[data-work-tool="'+id+'"]');row?.scrollIntoView({block:'center'});row?.querySelector('input')?.focus({preventScroll:true});}
toolConfirmed=function(id,file=displayedProgramFile()){const t=DATA.tools.find(t=>t.id===Number(id));return !!t&&tooling.status(t.id,mountingRule(t,file),toolIsStandard(t)).ready;};
const baseRenderTools=renderTools;
renderTools=function(){baseRenderTools();$('readyCount').hidden=true;renderWorkTools();};
$('openFerramental').onclick=()=>$('workToolsSection').scrollIntoView({block:'start'});
$('export').textContent='Exportar ferramentas';
$('export').onclick=()=>{
 const rows=[['Ferramenta','Descrição','Programas','Descida máxima do TAP (mm)','Z nominal do TAP (mm)','Limite no corretor (mm)','Montagem recomendada (mm)','Montagem medida (mm)','Diâmetro real (mm)','Corretor','Montada','Na máquina']];
 for(const t of DATA.tools){const a=physicalToolData(t.id),r=mountingRule(t),shown=operationalToolDescent(t,r);rows.push(['T'+t.id,toolNames[t.id]||t.name,t.programs.join(' / '),r.maximumDescent??'',shown.nominalZ??'',shown.kind==='process'?shown.value:'',toolIsStandard(t)?'Montagem padrão':r.recommended??'',a.mount??'',a.diameter??'',a.offset??'',a.mounted?'Sim':'Não marcada',a.machine?'Sim':'Não marcada']);}
 const text='\ufeff'+rows.map(row=>row.map(v=>'"'+String(v).replaceAll('"','""')+'"').join(';')).join('\r\n'),blob=new Blob([text],{type:'text/csv;charset=utf-8'}),a=document.createElement('a'),url=URL.createObjectURL(blob);a.href=url;a.download='Ferramentas_OS10713.csv';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);
};

__TOOL_PHOTO_UI__
