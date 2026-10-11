/* The operational table edits canonical machine assignments. The sidebar only reads them. */
const toolingUI={tab:'work',machine:tooling.jobMachineId,selectedTool:null,message:''};
const toolIsStandard=t=>OPERATOR_CONFIG.tool_mounting.tools[t.id]?.mounting_mode==='standard';
const toolingStatus=t=>tooling.status(t.id,mountingRule(t),toolIsStandard(t));
const stateText=s=>s.ready?'✓ PRONTA':s.status;
function physicalToolData(id){
 const a=tooling.assignment(tooling.jobMachineId,Number(id));
 return {assignment:a,mount:ToolingDomain.positive(a.measuredLength),diameter:ToolingDomain.positive(a.measuredDiameter),offset:a.offset?.trim()||null,mounted:!!a.mounted,machine:!!a.inMachine};
}
function toolRow(id,file){
 const t=DATA.tools.find(t=>t.id===Number(id)),r=mountingRule(t,file),physical=physicalToolData(id),meta=cncData?.[file]?.meta.tools.find(v=>v.t_number===Number(id));
 const nominalZ=r.evidence.reduce((v,e)=>Number.isFinite(e.zMin)?Math.min(v??e.zMin,e.zMin):v,null),nominalOnly=toolIsStandard(t)&&r.maximumDescent===null&&nominalZ===0;
 const parameters=meta?'<div class="tool-parameters"><span><b>S</b> '+technicalNumber(meta.rpm)+' <small>rpm</small></span><span><b>F</b> '+technicalNumber(meta.feeds_mm_min)+' <small>mm/min</small></span><span>'+esc(cncData[file].meta.wcs.join(' / '))+'</span></div>':'';
 return '<article class="tool active" data-tool-card="'+id+'"><div class="tool-identity"><b class="tool-id">T'+id+'</b><h4 class="toolname">'+esc(toolNames[id]||t.name)+'</h4>'+parameters+'</div><div class="length-pair"><div><span>'+(nominalOnly?'Z no programa (nominal)':'Descida máxima no programa')+'</span><strong>'+exactLength(nominalOnly?nominalZ:r.maximumDescent)+'</strong></div><div class="recommended"><span>Montagem recomendada</span><strong>'+mountingLabel(t,r)+'</strong></div></div><p class="length-origin">'+(nominalOnly?'Z nominal do programa':r.resolved?'Extraído do programa · Z0 no topo':'Descida a confirmar')+'</p><p class="tool-margin-note">Margem: +'+exactLength(adoptedMargin(t))+'</p><dl class="physical-tool-values">'+[
  ['Montagem medida',physical.mount===null?'Não informado':exactLength(physical.mount)],['Diâmetro real',physical.diameter===null?'Não informado':'Ø'+exactLength(physical.diameter)],['Corretor',physical.offset??'Não informado'],['Montada',physical.mounted?'Sim':'Não marcada'],['Na máquina',physical.machine?'Sim':'Não marcada']
 ].map(([label,value])=>'<div><dt>'+label+'</dt><dd>'+esc(value)+'</dd></div>').join('')+'</dl></article>';
}
function renderWorkTools(){
 $('jobMachineName').textContent=tooling.profile(tooling.jobMachineId).name;$('workToolCount').textContent=DATA.tools.length+' ferramentas';
 const active=programTools();
 $('workToolList').innerHTML='<div class="work-tool-table-scroll" tabindex="0" role="region" aria-label="Tabela de ferramentas; rolagem horizontal em telas menores"><table class="work-tool-table"><thead><tr>'+['Ferramenta','Programas','Descida máxima','Montagem recomendada','Montagem medida (mm)','Ø real (mm)','Corretor','Montada','Na máquina'].map(label=>'<th scope="col">'+label+'</th>').join('')+'</tr></thead><tbody>'+DATA.tools.map(t=>{
  const a=physicalToolData(t.id),r=mountingRule(t);
  const field=(name,value,type='number')=>'<input type="'+type+'" '+(type==='number'?'min="0.001" step="any"':'maxlength="40"')+' data-table-tool="'+t.id+'" data-field="'+name+'" value="'+esc(value??'')+'" placeholder="Não informado" aria-label="'+({measuredLength:'Montagem medida',measuredDiameter:'Diâmetro real',offset:'Corretor'})[name]+' T'+t.id+'">';
  const check=(name,checked,label)=>'<label class="table-check"><input type="checkbox" data-table-tool="'+t.id+'" data-field="'+name+'" '+(checked?'checked':'')+' aria-label="'+label+' T'+t.id+'"></label>';
  return '<tr data-work-tool="'+t.id+'" data-current="'+active.includes(t.id)+'"><th scope="row"><b>T'+t.id+'</b><span>'+esc(toolNames[t.id]||t.name)+'</span></th><td>'+t.programs.map(p=>esc(p.replace('.TAP',''))).join('<br>')+'</td><td>'+exactLength(r.maximumDescent)+'</td><td><strong>'+mountingLabel(t,r)+'</strong></td><td>'+field('measuredLength',a.mount)+'</td><td>'+field('measuredDiameter',a.diameter)+'</td><td>'+field('offset',a.offset,'text')+'</td><td>'+check('mounted',a.mounted,'Montada')+'</td><td>'+check('inMachine',a.machine,'Na máquina')+'</td></tr>';
 }).join('')+'</tbody></table></div>';
 $('toolTableMessage').textContent=toolingUI.message;
 $('workToolList').querySelectorAll('[data-table-tool]').forEach(input=>input.onchange=()=>{
  const id=Number(input.dataset.tableTool),field=input.dataset.field,a=tooling.assignment(tooling.jobMachineId,id),value=input.type==='checkbox'?input.checked:input.value.trim();toolingUI.message='';
  if(field==='measuredDiameter'){
   const result=tooling.setMeasuredDiameter(tooling.jobMachineId,id,value);if(!result.ok)toolingUI.message=result.message;
  }else if(field==='measuredLength'){
   const length=value===''?null:ToolingDomain.positive(value);
   if(value!==''&&length===null)toolingUI.message='Informe uma montagem medida positiva ou deixe sem informação.';
   else{state.stickouts[id]=length;state.checks[id].length=false;}
  }else if(field==='offset'){a.offset=value||null;state.checks[id].offset=false;}
  else if(field==='mounted')state.checks[id].mounted=value;
  else if(field==='inMachine')state.checks[id].machine=value;
  persist();renderTools();$('workToolList').querySelector('[data-table-tool="'+id+'"][data-field="'+field+'"]')?.focus({preventScroll:true});
 });
}
// Compatibility entry point now opens the ordinary table row, without a preparation workflow.
function openToolPreparation(id){const row=$('workToolList').querySelector('[data-work-tool="'+id+'"]');row?.scrollIntoView({block:'center'});row?.querySelector('input')?.focus({preventScroll:true});}
toolConfirmed=function(id,file=displayedProgramFile()){const t=DATA.tools.find(t=>t.id===Number(id));return !!t&&tooling.status(t.id,mountingRule(t,file),toolIsStandard(t)).ready;};
const baseRenderTools=renderTools;
renderTools=function(){baseRenderTools();$('readyCount').hidden=true;renderWorkTools();};
$('openFerramental').onclick=()=>$('workToolsSection').scrollIntoView({block:'start'});
$('export').textContent='Exportar ferramentas';
$('export').onclick=()=>{
 const rows=[['Ferramenta','Descrição','Programas','Descida máxima (mm)','Montagem recomendada (mm)','Montagem medida (mm)','Diâmetro real (mm)','Corretor','Montada','Na máquina']];
 for(const t of DATA.tools){const a=physicalToolData(t.id),r=mountingRule(t);rows.push(['T'+t.id,toolNames[t.id]||t.name,t.programs.join(' / '),r.maximumDescent??'',toolIsStandard(t)?'Montagem padrão':r.recommended??'',a.mount??'',a.diameter??'',a.offset??'',a.mounted?'Sim':'Não marcada',a.machine?'Sim':'Não marcada']);}
 const text='\ufeff'+rows.map(row=>row.map(v=>'"'+String(v).replaceAll('"','""')+'"').join(';')).join('\r\n'),blob=new Blob([text],{type:'text/csv;charset=utf-8'}),a=document.createElement('a'),url=URL.createObjectURL(blob);a.href=url;a.download='Ferramentas_OS10713.csv';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);
};
