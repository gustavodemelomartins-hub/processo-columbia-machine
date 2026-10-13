const {chromium}=require('../../scripts/browser_runtime.cjs'),assert=require('node:assert/strict'),fs=require('node:fs');
const url=process.env.COLUMBIA_LIVE_URL||'http://127.0.0.1:4173/work/columbia-repo/';
(async()=>{const browser=await chromium.launch({executablePath:process.env.COLUMBIA_CHROMIUM_PATH||undefined,args:['--enable-unsafe-swiftshader','--use-angle=swiftshader']});
try{
 const page=await browser.newPage(),errors=[],requests=[];page.on('pageerror',e=>errors.push(e.message));page.on('requestfailed',r=>requests.push(r.url()));
 assert.equal((await page.goto(url)).status(),200);await page.waitForFunction(()=>window.columbiaDemo?.getCNC().rows.length);
 assert.match(await page.locator('#rxFacts').textContent(),/95,75 mm/);assert.doesNotMatch(await page.evaluate(()=>document.body.innerText),/96,0|a confirmar/i);await page.evaluate(()=>columbiaJourney.openOperationView());
 for(const [w,h]of [[320,800],[390,844],[768,1024],[1440,900],[1920,1080]]){
  await page.setViewportSize({width:w,height:h});assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false,'horizontal overflow '+w);
 }
 await page.click('[data-operation="1"]');
 for(const [phase,file]of [[4,'O002.TAP'],[5,'O003.TAP'],[6,'O004.TAP'],[8,'O005.TAP'],[9,'O006.TAP'],[10,'O007.TAP'],[11,'O008.TAP']]){
  await page.click('[data-step="'+phase+'"]');assert.equal(await page.locator('#currentProgram').textContent(),file);await page.waitForFunction(file=>columbiaDemo.getCNC().file===file&&columbiaDemo.getCNC().rows.length,file);
 }
 await page.click('[data-step="4"]');await page.click('#viewDrawing');await page.waitForTimeout(100);assert.equal(await page.locator('.drawing-viewport img').first().evaluate(e=>e.complete&&e.naturalWidth>0),true);
 const pdf=new URL('assets/drawings/originals/FP16F%2012V%20H8%20-%20PB.pdf',url).href;assert.equal((await page.request.get(pdf)).status(),200);
 await page.click('#view3D');assert.equal(await page.locator('#stage canvas').isVisible(),true);
 for(const [w,h]of [[1920,1080],[390,844]]){
  await page.setViewportSize({width:w,height:h});await page.evaluate(()=>scrollTo(0,0));await page.screenshot({path:'artifacts/screens/v1-http-'+w+'.png',fullPage:true});
  await page.locator('#stage').screenshot({path:'artifacts/screens/v1-3d-'+w+'.png'});
 }
 await page.click('[data-operation="2"]');assert.match(await page.locator('#currentProgram').textContent(),/confirmar/i);
 assert.deepEqual(errors,[]);assert.deepEqual(requests,[]);
 const recover=await browser.newPage();await recover.addInitScript(()=>localStorage.setItem('columbia-os10713-demo-v2','null'));await recover.goto(url);await recover.waitForFunction(()=>columbiaDemo?.getCNC().rows.length);assert.equal(await recover.locator('#currentProgram').textContent(),'O001.TAP');
 const malformed=await browser.newPage();await malformed.addInitScript(()=>localStorage.setItem('columbia-os10713-demo-v2',JSON.stringify({phase:999,operator:null,checks:[],tooling:'invalid',faceTiming:3})));await malformed.goto(url);await malformed.waitForFunction(()=>columbiaDemo?.getCNC().rows.length);assert.equal(await malformed.locator('#currentProgram').textContent(),'O008.TAP');
 const report={url,http200:true,allPilotPrograms:true,unknownThirdOperation:true,pdfHttp200:true,drawing:true,webgl:true,widths:[320,390,768,1440,1920],malformedStorageRecovered:true,errors,failedRequests:requests};
 fs.writeFileSync('artifacts/reports/Validacao_V1_HTTP.json',JSON.stringify(report,null,2));console.log(JSON.stringify(report,null,2));
}finally{await browser.close()}})().catch(e=>{console.error(e);process.exit(1)});
