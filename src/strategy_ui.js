const programCallCache=new Map();
function renderProgramOverview(){
 const host=$('programOverview');if(!host)return;const data=cncData?.[cncFile],strategy=STRATEGY_DATA[cncFile];
 if(!data||state.operation===2){host.innerHTML='<p>Programa: A confirmar.</p>';return}
 const manual=phases[state.phase].kind==='setup',ids=DATA.programs.find(p=>p.file===cncFile)?.tools||[];
 if(!programCallCache.has(cncFile)){const calls=[];data.source_lines.forEach((code,i)=>{const plain=code.replace(/\([^)]*\)/g,'');if(/(?:M(?:97|98|198)|G65)(?![\d.])/.test(plain)){const n=/^\s*N(\d+)/.exec(code);calls.push({line:i+1,n:n?Number(n[1]):null,code})}});programCallCache.set(cncFile,calls)}
 const subcalls=programCallCache.get(cncFile);
 host.innerHTML='<p class="program-file"><b>'+esc(cncFile)+'</b>'+(manual?'<span>Prévia durante montagem manual</span>':'')+'</p><p class="small">Ferramentas chamadas: <b>'+ids.map(id=>'T'+id+' · '+esc(toolNames[id])).join(' / ')+'</b></p>'+(state.operation===0?'<p class="program-process-note">1º lado: facear até limpar, ajustando o corretor. Tombar uma vez. 2º lado: fechar 96,0 mm, deixando 1 mm para depois do tratamento. Ajustes do corretor são dados de processo, não valores do TAP.</p>':'')+'<div class="program-calls">'+(strategy?.tool_changes||[]).map(c=>sourceReference(c,cncFile,'M6 · T'+c.t_number)).join('')+(subcalls.length?subcalls.map(c=>sourceReference(c,cncFile,c.code)).join(''):'')+'</div>';
 host.querySelectorAll('[data-source-line]').forEach(b=>b.onclick=()=>showSourceReference(b.dataset.sourceFile,Number(b.dataset.sourceLine)));
}
function strategyTime(seconds){if(seconds===null||seconds===undefined)return 'Não informado';let n=Math.round(seconds),h=Math.floor(n/3600),m=Math.floor(n%3600/60),t=n%60;return (h?h+' h ':'')+m+' min '+String(t).padStart(2,'0')+' s'}
function technicalNumber(values){return values.length?values.map(n=>Number(n).toLocaleString('pt-BR',{maximumFractionDigits:3})).join(' / '):'Não informado'}
function sourceReference(ref,file,label){return ref?'<button class="source-reference" data-source-file="'+esc(file)+'" data-source-line="'+ref.line+'">'+esc(label)+': L'+ref.line+(ref.n!==null?' · N'+ref.n:'')+'</button>':'<span>Sem movimento localizado</span>'}
function showSourceReference(file,line){
 const d=cncData?.[file];if(!d)return;const first=Math.max(1,line-6),last=Math.min(d.source_lines.length,line+10);
 modal(file+' · linha '+line,'<p class="small">Extraído do programa original. A numeração L é a linha física do arquivo; N é o número do bloco CNC.</p><p class="source-restart">Localizar o trecho não valida a retomada. Conferir o estado modal, G54, H/D e a altura segura com a engenharia antes de repassar.</p><pre class="source-snippet">'+d.source_lines.slice(first-1,last).map((code,i)=>'<span class="'+(first+i===line?'selected-source-line':'')+'">'+String(first+i).padStart(5,' ')+' | '+esc(code)+'</span>').join('\n')+'</pre>');
}
function renderInprocessProposal(file){
 const proposal=OPERATOR_CONFIG.inprocess_proposals?.[file];if(!proposal)return '';
 const strategies=(STRATEGY_DATA[file]?.strategies||[]).filter(s=>s.tools.includes(proposal.tool_id)&&s.name.includes('G41'));
 const drawing=proposal.drawing_reference;
 return '<section class="inprocess-proposal" aria-labelledby="inprocessTitle"><div class="inprocess-heading"><h3 id="inprocessTitle">In-process</h3><span>Proposta · TAP atual preservado</span></div><h4>'+esc(proposal.title)+'</h4>'+(proposal.calibration_allowance_mm!==undefined?'<div class="inprocess-target"><span>Sobremetal para calibrar a primeira cavidade</span><strong>'+fmt(proposal.calibration_allowance_mm)+' mm</strong></div>':'')+(drawing?'<div class="inprocess-dimensions"><span>Cotas finais do desenho</span><strong>'+drawing.dimensions.map(d=>fmt(d.nominal_mm)+' ±'+fmt(d.tolerance_plus_minus_mm)+' mm').join('<br>')+'</strong><button data-inprocess-drawing="'+drawing.page+'">Desenho · pág. '+drawing.page+' · detalhe '+esc(drawing.detail)+'</button></div>':'')+'<ol class="inprocess-steps">'+proposal.steps.map(step=>'<li>'+esc(step)+'</li>').join('')+'</ol><details class="inprocess-current"><summary>Sequência atual do TAP</summary><p>O arquivo atual mantém as estratégias abaixo. A sequência por cavidade e a parada para medir precisam de revisão do programa.</p><div>'+strategies.map(s=>sourceReference(s.comment,file,s.name.replace(/^_+/,''))).join('')+'</div></details></section>';
}
function renderStrategyDetails(){
 const host=$('strategyDetails');if(!host)return;const d=STRATEGY_DATA[cncFile];
 if(!d||state.operation===2){host.innerHTML='<p>Programa: A confirmar.</p>';return}
 const selected=phases[state.phase].tools,header=d.time_header_seconds!==null&&d.time_header_seconds!==undefined,seconds=header?d.time_header_seconds:d.time_work_trajectory_seconds;
 host.innerHTML='<section class="time-summary"><span>'+(OPERATOR_CONFIG.process_timing.face_milling.stage_ids.includes(state.phase)?'Tempo de um passe':'Tempo de usinagem estimado')+'</span><strong>'+strategyTime(seconds)+'</strong><small>'+(header?'Estimativa do arquivo CNC':'Estimativa da trajetória')+'</small></section>'+renderInprocessProposal(cncFile)+(cncFile==='O003.TAP'?'<div id="cavityConsultation"></div>':'')+'<details class="strategy-group" '+(cncFile==='O003.TAP'||OPERATOR_CONFIG.inprocess_proposals?.[cncFile]?'':'open')+'><summary>Estratégias e linhas</summary><div class="strategy-table-wrap"><table class="strategy-table"><thead><tr><th>Estratégia</th><th>Ferramenta e parâmetros</th><th>Linhas e tempo</th></tr></thead><tbody>'+d.strategies.map(s=>{
  const matching=s.tools.some(t=>selected.includes(t));const toolDetails=s.tools.map(id=>'T'+id+' · '+esc(toolNames[id]||'Ferramenta')).join('<br>');
  return '<tr data-strategy="'+s.index+'" class="'+(matching?'current-strategy':'')+'"><td><b>'+esc(s.name)+'</b></td><td>'+toolDetails+'<p>S: '+technicalNumber(s.rpm)+' rpm<br>F: '+technicalNumber(s.feeds_mm_min)+' mm/min<br>'+esc(s.wcs.join(' / '))+(s.compensation_codes.length?' · '+esc(s.compensation_codes.join(' / ')):'')+'</p><p>Z mínimo programado: '+(s.z_programmed_cut_mm?technicalNumber([s.z_programmed_cut_mm.min])+' mm':'Não determinado')+'</p></td><td>'+(d.strategies.length>1&&s.time_estimate_seconds!==null?'<b>≈ '+strategyTime(s.time_estimate_seconds)+'</b>':'')+'<div class="strategy-locations">'+sourceReference(s.comment,cncFile,'Estratégia')+sourceReference(s.tool_change,cncFile,'Troca M6')+sourceReference(s.first_cut,cncFile,'Primeiro G1/G2/G3')+'</div></td></tr>';
 }).join('')+'</tbody></table></div></details>';
 host.querySelectorAll('[data-source-line]').forEach(b=>b.onclick=()=>showSourceReference(b.dataset.sourceFile,Number(b.dataset.sourceLine)));
 host.querySelectorAll('[data-inprocess-drawing]').forEach(b=>b.onclick=()=>{drawingViewer.setPage(Number(b.dataset.inprocessDrawing)-1);state.visualMode='drawing';persist();applyVisualMode();});
 if(cncFile==='O003.TAP')renderCavityConsultation();
}
