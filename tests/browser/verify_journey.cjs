const{chromium}=require('../../scripts/browser_runtime.cjs');
const fs=require('node:fs'),assert=require('node:assert/strict');
const url=process.env.COLUMBIA_LIVE_URL||'file:///'+process.cwd().replaceAll('\\','/')+'/index.html';
(async()=>{const b=await chromium.launch({executablePath:process.env.COLUMBIA_CHROMIUM_PATH||undefined,args:['--enable-unsafe-swiftshader','--use-angle=swiftshader']});try{
 const ctx=await b.newContext({offline:!process.env.COLUMBIA_LIVE_URL,viewport:{width:1440,height:900}}),p=await ctx.newPage(),errors=[];p.on('pageerror',e=>errors.push(e.message));
 const load=async()=>{await p.goto(url);await p.waitForFunction(()=>window.columbiaDemo&&window.columbiaJourney);await p.evaluate(()=>columbiaDemo.cncReady);};await load();
 const journey=()=>p.evaluate(()=>columbiaJourney.state()),text=s=>p.locator(s).textContent(),action=()=>p.locator('#stageAction');
 const body=await p.evaluate(()=>document.body.innerText);
 // No discovery questions, divergence, confirmations, controls or inspection flow in the operator UI.
 for(const banned of [/a confirmar/i,/divergência/i,/96,0/,/Responsável/i,/Controle/,/Inspeção/,/Informação a confirmar/i])assert.doesNotMatch(body,banned,String(banned));
 assert.equal(await p.locator('#questionsPanel,#stageGuide,#guideNav,#nextStageBanner').count(),0);
 // System font, sentence case.
 const font=await p.evaluate(()=>getComputedStyle(document.body).fontFamily);assert.match(font,/Segoe UI/);assert.doesNotMatch(font,/IBM Plex/);
 assert.equal(await p.evaluate(()=>[...document.querySelectorAll('.osbar-label')].some(e=>getComputedStyle(e).textTransform==='uppercase')),false);
 // A new part starts at receiving; macro sequence with T.T. after the 3rd operation.
 assert.equal(await p.evaluate(()=>document.body.dataset.journeyView),'receiving');
 assert.match(await text('#osBar'),/10-713/);assert.match(await text('#osBar'),/0 de 10 etapas/);
 const map=(await p.locator('#operations > .operation-item strong').allTextContents());
 assert.deepEqual(map,['Recebimento','1ª operação','2ª operação','3ª operação','Tratamento térmico','Retorno pós-TT']);
 // Receiving: 111,00 → 15,25 total; Face A 0,20 (editable) → Face B 15,05. One action per state.
 assert.equal(await p.locator('#receivingAction').isDisabled(),true);assert.equal(await p.locator('#receivingAction').textContent(),'Concluir recebimento');
 assert.equal(await p.locator('#faceARemoval').inputValue(),'0.2');
 await p.fill('#receivedThickness','111');
 assert.match(await text('#rxFacts'),/95,75 mm.*15,25 mm/s);assert.equal(await text('#rxFaceB'),'15,05 mm');assert.match(await text('#rxSvg'),/Face A · 0,20 mm.*Face B · 15,05 mm/s);
 await p.fill('#faceARemoval','1.25');assert.equal(await text('#rxFaceB'),'14,00 mm');
 await p.fill('#faceARemoval','16');assert.match(await text('#rxMessage'),/entre 0 e 15,25/);assert.equal(await p.locator('#receivingAction').isDisabled(),true);
 await p.fill('#faceARemoval','0.2');await p.locator('#faceARemoval').press('Tab');
 await p.click('#rxSplit');assert.equal(await text('#rxFaceB'),'7,625 mm');await p.fill('#faceARemoval','0.2');await p.locator('#faceARemoval').press('Tab');
 await p.click('#receivingAction');assert.equal(await p.locator('#receivingAction').textContent(),'Ir para próxima etapa');assert.match(await text('#osBar'),/1 de 10 etapas/);
 assert.deepEqual(await p.evaluate(()=>[columbiaDemo.state.faceTiming.stockByStage[0],columbiaDemo.state.faceTiming.stockByStage[2]]),[0.2,15.05]);
 for(const [w,h] of [[1920,1080],[1440,900],[1024,768],[768,1024],[390,844]]){await p.setViewportSize({width:w,height:h});await p.evaluate(()=>scrollTo(0,0));assert.equal(await p.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false,'overflow receiving '+w);await p.screenshot({path:`artifacts/screens/journey-receiving-${w}.png`});}
 await p.setViewportSize({width:1440,height:900});
 // 1ª operação: name, objective, program, tool, stock, reduction, passes, times, single action.
 await p.click('#receivingAction');assert.equal(await p.evaluate(()=>document.body.dataset.journeyView),'operation');
 const panel=await text('#stagePanel');
 assert.match(panel,/1ª operação · etapa 1 de 2/);assert.match(panel,/Facear a primeira face/);assert.match(panel,/O001\.TAP/);assert.match(panel,/T1 · Girassol Ø100/);
 assert.match(panel,/Passes estimados\s*~1/);assert.match(panel,/Usinagem estimada\s*~12 min/);assert.match(panel,/Preparação estimada\s*~45 min/);assert.doesNotMatch(panel,/tempo real/i);
 assert.equal(await p.locator('[data-face-stock="0"]').inputValue(),'0.2');assert.equal(await p.locator('#faceReduction').inputValue(),'0.7');
 assert.equal(await p.locator('#stagePanel button.ds-btn').count(),1);assert.equal(await action().textContent(),'Iniciar operação');
 assert.equal(await p.locator('#prev:visible,#next:visible,[data-stage-complete]:visible,#startStageExecution:visible').count(),0);
 assert.ok((await p.locator('#stageHow .how-list li').count())>0);assert.equal(await p.locator('#stageHow details').getAttribute('open'),null);
 await p.click('#stageHow summary');assert.match(await text('#stageHow'),/Posição da peça.*Invertida/s);
 assert.equal(await p.evaluate(()=>columbiaJourney.get3D().faceLayer.visible),true);assert.match(await text('#viewerContext'),/Face A/);
 // Editing Face A on the stage recalculates Face B.
 await p.fill('[data-face-stock="0"]','0.5');await p.locator('[data-face-stock="0"]').press('Tab');assert.equal(await p.evaluate(()=>columbiaDemo.state.faceTiming.stockByStage[2]),14.75);
 await p.fill('[data-face-stock="0"]','0.2');await p.locator('[data-face-stock="0"]').press('Tab');
 // Browsing and play never record execution.
 await p.click('#animateCut');await p.click('#animateCut');assert.equal(await p.evaluate(()=>columbiaDemo.state.operator['0']?.started??false),false);
 // Start → Concluir → Ir para próxima etapa; never two contradictory actions.
 await action().click();assert.equal(await action().textContent(),'Concluir operação');assert.match(await text('#stageStatus'),/Em andamento desde \d\d:\d\d/);
 assert.ok(Date.parse(await p.evaluate(()=>columbiaDemo.state.operator['0'].startedAt)));
 await action().click();assert.equal(await action().textContent(),'Ir para próxima etapa');assert.match(await text('#stageStatus'),/Concluída às \d\d:\d\d/);
 assert.equal(await p.locator('[data-stage-complete="0"]').isChecked(),true);assert.match(await text('#osBar'),/2 de 10 etapas/);
 await action().click();assert.equal(await p.evaluate(()=>columbiaDemo.state.phase),2);
 const faceB=await text('#stagePanel');assert.match(faceB,/fechar 95,75 mm/);assert.match(faceB,/15,05 mm/);assert.match(faceB,/~22/);assert.match(await text('#viewerContext'),/Face B/);
 // Sequence 1 → 8: O003 waits for O002.
 await p.click('[data-operation="1"]');await p.click('[data-step="5"]');assert.equal(await action().textContent(),'Ir para a etapa pendente');
 await action().click();assert.equal(await p.evaluate(()=>columbiaDemo.state.phase),2);
 await p.click('[data-operation="1"]');await p.click('[data-step="5"]');
 const op2=await text('#stagePanel');assert.match(op2,/O003\.TAP/);assert.match(op2,/T3 · Alto avanço Ø32/);assert.match(op2,/~2 h 51 min/);assert.doesNotMatch(op2,/Passes estimados/);
 assert.equal(await p.evaluate(()=>columbiaJourney.get3D().axes.visible),true);assert.match(await text('#viewerContext'),/calços/);
 // In-process proposals stay as proposals.
 await p.click('[data-step="8"]');await p.click('#stageHow summary');assert.match(await text('#stageHow'),/Proposta.*Calibrar uma cavidade/s);
 // 3ª operação, T.T. and retorno pós-TT: neutral placeholders, no alerts.
 await p.click('[data-operation="2"]');assert.equal(await p.evaluate(()=>document.body.dataset.journeyView),'op3');assert.match(await text('#journeyStage'),/Processo em levantamento/);
 await p.click('#laterNext');assert.equal(await p.evaluate(()=>document.body.dataset.journeyView),'heat');assert.match(await text('#journeyStage'),/depois da 3ª operação.*95,75 mm.*95,00 mm/s);
 await p.click('#laterNext');assert.equal(await p.evaluate(()=>document.body.dataset.journeyView),'post-heat');assert.match(await text('#journeyStage'),/Retorno pós-TT.*em levantamento/s);assert.equal(await p.locator('#laterNext').count(),0);
 // Part record and persistence.
 const pass=await p.evaluate(()=>columbiaJourney.passport());assert.equal(pass.receiving.receivedMm,111);assert.equal(pass.target.valueMm,95.75);assert.equal(pass.stages.filter(s=>s.completed).length,1);
 const dl=p.waitForEvent('download');await p.click('#passportPanel summary');await p.click('#exportPassport');assert.match((await dl).suggestedFilename(),/Registro_OS10713\.json/);
 await load();assert.equal((await journey()).receiving.receivedMm,111);assert.match(await text('#osBar'),/2 de 10 etapas/);
 // Responsive operation view; the 3D keeps its prominence.
 await p.evaluate(()=>columbiaJourney.openOperationView());await p.click('[data-operation="0"]');
 for(const [w,h] of [[1920,1080],[1440,900],[1024,768],[768,1024],[390,844]]){await p.setViewportSize({width:w,height:h});await p.evaluate(()=>scrollTo(0,0));assert.equal(await p.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false,'overflow operation '+w);await p.screenshot({path:`artifacts/screens/journey-operation-${w}.png`});assert.ok((await action().boundingBox()).height>=44,'action '+w);const box=await p.locator('#stage').boundingBox();if(w>=1280)assert.ok(box.width/w>.6,'3D width '+w);}
 assert.deepEqual(errors,[]);
 fs.writeFileSync('artifacts/reports/Validacao_Jornada_Local.json',JSON.stringify({target:95.75,receivedExample:111,totalStock:15.25,faceA:0.2,faceB:15.05,progress:'2 de 10',singleAction:true,noQuestions:true,errors},null,2));
 console.log('Journey: system font, no questions/divergence/controls, receiving 111 → 15,25 (A 0,20 editable / B 15,05), single action start/complete/next, order 1→8, 3D context, proposals, placeholders, record, persistence and 5 widths passed.');
}finally{await b.close()}})().catch(e=>{console.error(e);process.exit(1)});
