const{chromium}=require('../../scripts/browser_runtime.cjs');
const fs=require('node:fs'),assert=require('node:assert/strict');
const url=process.env.COLUMBIA_LIVE_URL||'file:///'+process.cwd().replaceAll('\\','/')+'/index.html';
(async()=>{const b=await chromium.launch({executablePath:process.env.COLUMBIA_CHROMIUM_PATH||undefined,args:['--enable-unsafe-swiftshader','--use-angle=swiftshader']});try{
 const ctx=await b.newContext({offline:!process.env.COLUMBIA_LIVE_URL,viewport:{width:1440,height:900}}),p=await ctx.newPage(),errors=[];p.on('pageerror',e=>errors.push(e.message));
 const load=async()=>{await p.goto(url);await p.waitForFunction(()=>window.columbiaDemo&&window.columbiaJourney);await p.evaluate(()=>columbiaDemo.cncReady);};await load();
 const journey=()=>p.evaluate(()=>columbiaJourney.state());
 // A new part starts at receiving; operation workspace is hidden, OS header is permanent.
 assert.equal(await p.evaluate(()=>document.body.dataset.journeyView),'receiving');
 assert.equal(await p.locator('#stageGuide').isVisible(),false);assert.equal(await p.locator('#osBar').isVisible(),true);
 assert.match(await p.locator('#osBar').textContent(),/OS 10-713/);assert.match(await p.locator('#osBar').textContent(),/0 de 12 etapas/);assert.match(await p.locator('#osBar').textContent(),/Aguardando recebimento/);
 assert.equal(await p.locator('#operations [data-journey-node]').count(),4);assert.equal(await p.locator('#operations .operation-item').count(),7);
 assert.match(await p.locator('[data-journey-node="heat"]').textContent(),/Sequência a confirmar/);assert.match(await p.locator('#operations .operation-item').nth(6).textContent(),/Processo ainda não definido/);
 // Divergence is shown; no target is chosen by the system.
 assert.match(await p.locator('#journeyStage').textContent(),/96,0 mm.*95,75 mm/s);assert.equal((await journey()).receiving.targetChoice,null);
 assert.equal(await p.locator('#recordReceiving').isDisabled(),true);
 await p.fill('#receivedThickness','101.8');await p.press('#receivedThickness','Tab');
 const stock=await p.locator('.stock-views').textContent();assert.match(stock,/5,8/);assert.match(stock,/6,05/);assert.match(stock,/2,9/);
 assert.match(await p.locator('#journeyStage').textContent(),/Divisão simétrica a confirmar/i);
 // Confirmation requires a responsible person.
 await p.click('[data-target-choice="drawing"]');assert.equal((await journey()).receiving.targetChoice,null);assert.equal(await p.locator('#targetConfirmer').getAttribute('aria-invalid'),'true');
 await p.fill('#targetConfirmer','Operador teste');await p.click('[data-target-choice="process"]');assert.equal((await journey()).receiving.targetChoice.id,'process');
 assert.equal(await p.locator('.stock-views figure').count(),1);assert.match(await p.locator('#journeyStage').textContent(),/pendência da engenharia continua aberta/);
 await p.click('[data-stock-method="process"]');assert.match(await p.locator('.stock-views').textContent(),/até limpar/);
 await p.click('#recordReceiving');assert.match(await p.locator('#osBar').textContent(),/1 de 12 etapas/);
 // Explicit action only: timing receives the symmetric reference.
 assert.equal(await p.evaluate(()=>columbiaDemo.jobTiming().groups[0].totalSeconds),null);
 await p.click('[data-stock-method="symmetric"]');await p.click('#applyStockTiming');assert.deepEqual(await p.evaluate(()=>[columbiaDemo.state.faceTiming.stockByStage[0],columbiaDemo.state.faceTiming.stockByStage[2]]),[2.9,2.9]);
 for(const [w,h] of [[1920,1080],[1440,900],[1024,768],[768,1024],[390,844]]){await p.setViewportSize({width:w,height:h});await p.evaluate(()=>scrollTo(0,0));assert.equal(await p.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false,'overflow receiving '+w);await p.screenshot({path:`artifacts/screens/journey-receiving-${w}.png`});}
 await p.setViewportSize({width:1440,height:900});
 // Into the first operation: stage header answers where/what/how/check.
 await p.click('[data-journey-next="op1"]');assert.equal(await p.evaluate(()=>document.body.dataset.journeyView),'operation');assert.equal(await p.locator('#stageGuide').isVisible(),true);
 assert.match(await p.locator('#stageEyebrow').textContent(),/1ª operação · etapa 1 de 2 · Faceamento/);assert.match(await p.locator('#guideNow').textContent(),/Agora/);
 assert.equal(await p.locator('#guideNav [data-guide]').count(),8);assert.ok((await p.locator('#guideCheck li').count())>0);
 assert.match(await p.locator('#stageTime').textContent(),/Preparação.*Não informado/s);
 await p.click('[data-guide="referencia"]');const origin=await p.locator('.ds-origin').textContent();assert.match(origin,/X0.*Centro da peça/s);assert.match(origin,/Z0.*topo da peça/is);
 assert.equal(await p.evaluate(()=>columbiaJourney.get3D().axes.visible),true);
 await p.click('[data-guide="fixacao"]');assert.equal(await p.evaluate(()=>columbiaJourney.get3D().axes.visible),false);assert.match(await p.locator('#viewerContext').textContent(),/calços e garras/);
 assert.match(await p.locator('.viewer-disclaimer').textContent(),/não certifica colisões/);
 // Browsing sections and playing the path never records execution.
 assert.equal(await p.evaluate(()=>columbiaDemo.state.operator['0']?.started??false),false);
 // Start → time stamp → complete → next stage highlighted.
 await p.click('#startStageExecution');assert.equal(await p.locator('#operationStatus').textContent(),'Em execução');
 const started=await p.evaluate(()=>columbiaDemo.state.operator['0'].startedAt);assert.ok(Date.parse(started));assert.match(await p.locator('#stageTime').textContent(),/Iniciada às\s*\d\d:\d\d/);
 assert.match(await p.locator('#osBar').textContent(),/Em usinagem/);
 await p.click('#completeStage');assert.equal(await p.locator('[data-stage-complete="0"]').isChecked(),true);
 assert.ok(Date.parse(await p.evaluate(()=>columbiaDemo.state.operator['0'].completedAt)));assert.equal(await p.locator('#nextStageBanner').isVisible(),true);
 assert.equal(await p.locator('[data-stage="2"]').getAttribute('data-next'),'true');assert.match(await p.locator('#nextStageBanner').textContent(),/Próxima etapa: O001.TAP/);
 await p.click('#openNextStage');assert.equal(await p.evaluate(()=>columbiaDemo.state.phase),2);
 await p.click('[data-guide="ferramentas"]');assert.match(await p.locator('.ds-toolcard').textContent(),/Faceamento no corretor.*Montagem recomendada/s);
 await p.locator('[data-stage-complete="2"]').check();
 // Last stage of op1 points to the control.
 assert.match(await p.locator('#nextStageBanner').textContent(),/Controle de espessura/);await p.click('[data-open-control="control-op1"]');
 assert.equal(await p.evaluate(()=>document.body.dataset.journeyView),'control-op1');assert.match(await p.locator('#journeyStage').textContent(),/Critério a confirmar/);
 await p.fill('#afterFaceA','100.5');await p.press('#afterFaceA','Tab');assert.match(await p.locator('#journeyStage').textContent(),/Retirado na Face A\s*1,3/);
 assert.equal(await p.locator('#releaseControl').isDisabled(),true);await p.fill('#controlMeasure','96.02');await p.press('#controlMeasure','Tab');assert.match(await p.locator('#journeyStage').textContent(),/\+0,02/);
 await p.click('#releaseControl');assert.match(await p.locator('#osBar').textContent(),/4 de 12 etapas/);assert.match(await p.locator('#osBar').textContent(),/2ª operação · Referência/);
 await p.click('[data-journey-next="op2"]');assert.equal(await p.evaluate(()=>columbiaDemo.state.phase),4);
 await p.click('[data-step="5"]');await p.click('[data-guide="ferramentas"]');const card=await p.locator('.ds-toolcard').textContent();assert.match(card,/Descida máxima no programa\s*99,97 mm/);assert.match(card,/Montagem recomendada\s*110 mm/);
 await p.click('[data-guide="programa"]');assert.match(await p.locator('.ds-titleblock').textContent(),/O003.TAP.*DESBASTE.*2 h 22 min 21 s/s);
 await p.click('[data-guide="inspecao"]');assert.match(await p.locator('#stageGuide').textContent(),/Critério de inspeção|Informação a confirmar/i);
 // Heat treatment and 3rd operation never invent a process.
 await p.click('[data-journey-open="heat"]');assert.match(await p.locator('#journeyStage').textContent(),/95,75.*95,0/s);assert.match(await p.locator('#journeyStage').textContent(),/Tratamento térmico a confirmar/i);
 await p.click('[data-operation="2"]');assert.match(await p.locator('#journeyStage').textContent(),/Processo ainda não definido/);assert.equal(await p.locator('#stageGuide').isVisible(),false);
 // Passport and questions.
 const pass=await p.evaluate(()=>columbiaJourney.passport());assert.equal(pass.receiving.receivedMm,101.8);assert.equal(pass.target.confirmed.valueMm,96);assert.equal(pass.stages.filter(s=>s.completed).length,2);assert.equal(pass.controls['control-op1'].measuredMm,96.02);
 assert.match(await p.locator('#passportBody').textContent(),/101,8 mm/);assert.match(await p.locator('#passportBody').textContent(),/Tempo ainda não informado/);
 const n=await p.evaluate(()=>PROCESS_CONFIG.open_questions.length);assert.equal(await p.locator('#questionsBody li').count(),n);assert.equal(await p.locator('#questionsCount').textContent(),String(n));
 const dl=p.waitForEvent('download');await p.click('#exportPassport');assert.match((await dl).suggestedFilename(),/Passaporte_OS10713\.json/);
 // Persistence across reload; existing records keep their views.
 await load();assert.equal((await journey()).receiving.receivedMm,101.8);assert.equal((await journey()).controls['control-op1'].measuredMm,96.02);
 assert.match(await p.locator('#osBar').textContent(),/4 de 12 etapas/);
 // Responsive operation view.
 await p.click('[data-operation="1"]');
 for(const [w,h] of [[1920,1080],[1440,900],[1024,768],[768,1024],[390,844]]){await p.setViewportSize({width:w,height:h});await p.evaluate(()=>scrollTo(0,0));assert.equal(await p.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false,'overflow operation '+w);await p.screenshot({path:`artifacts/screens/journey-operation-${w}.png`});await p.locator('#stageGuide').scrollIntoViewIfNeeded();await p.screenshot({path:`artifacts/screens/journey-guide-${w}.png`});for(const s of ['#startStageExecution','[data-guide="referencia"]','#guideNext'])assert.ok((await p.locator(s).boundingBox()).height>=44,s+' '+w);}
 assert.deepEqual(errors,[]);
 fs.writeFileSync('artifacts/reports/Validacao_Jornada_Local.json',JSON.stringify({receivingTargetNotChosenBySystem:true,progress:'4 de 12',passportStages:pass.stages.length,questions:n,errors},null,2));
 console.log('Journey: receiving, divergence kept, target confirmed by a person, stock A/B, guided sections, 3D context, start/complete timestamps, next stage highlight, control, heat/3rd op TBC, passport, questions, persistence and 5 widths passed.');
}finally{await b.close()}})().catch(e=>{console.error(e);process.exit(1)});
