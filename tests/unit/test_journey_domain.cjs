const assert=require('node:assert/strict'),path=require('node:path'),fs=require('node:fs');
const J=require('../../app/journey/journey_domain.js');
const config=JSON.parse(fs.readFileSync(path.join(__dirname,'../../data/process.json'),'utf8'));
const data=JSON.parse(fs.readFileSync(path.join(__dirname,'../../data/derived/project_data.json'),'utf8'));

// Single operational target: 95,75 mm before heat treatment. No engineering divergence, no questions.
assert.equal(J.target(config).valueMm,95.75);assert.equal(config.drawing.thickness_mm.before_heat_treatment,95.75);
assert.equal(config.open_questions,undefined);assert.equal(config.stage_guide,undefined);
assert.equal(J.defaultFaceA(config),0.2);

// Stock: received − target; Face A cleans (editable, default 0,20); Face B closes the thickness.
const s=J.stockFor(111,95.75,0.2);assert.equal(s.valid,true);assert.equal(s.totalMm,15.25);assert.equal(s.faceAMm,0.2);assert.equal(s.faceBMm,15.05);assert.equal(s.symmetricMm,7.625);
const edited=J.stockFor('111,00',95.75,'1,5');assert.deepEqual([edited.faceAMm,edited.faceBMm],[1.5,13.75]);
assert.equal(J.stockFor(111,95.75,16).valid,false);assert.equal(J.stockFor(111,95.75,-1).valid,false);
assert.equal(J.stockFor('',95.75).valid,false);assert.equal(J.stockFor(95,95.75).valid,false);assert.equal(J.stockFor(95.75,95.75,0).faceBMm,0);
const plan=J.stockPlan(config,{receiving:{receivedMm:111,faceAMm:null}});assert.deepEqual([plan.totalMm,plan.faceAMm,plan.faceBMm],[15.25,0.2,15.05]);

// Macro sequence: receiving → 1ª → 2ª → 3ª → T.T. → retorno pós-TT. Progress counts receiving + 14 program stages.
assert.deepEqual(config.journey.nodes.map(n=>n.id),['receiving','op1','op2','op3','heat','post-heat']);
const empty=J.emptyJourney();let p=J.progress(config,empty,{});
assert.equal(p.total,15);assert.equal(p.done,0);assert.equal(p.current.type,'receiving');
let states=J.nodeStates(config,empty,{});
assert.deepEqual(states.map(n=>n.status),['active','waiting','waiting','later','later','later']);

const j={...empty,receiving:{...empty.receiving,receivedMm:111,recordedAt:'2026-10-13T10:00:00Z'}};
p=J.progress(config,j,{});assert.equal(p.done,1);assert.deepEqual([p.current.type,p.current.id],['phase',0]);
states=J.nodeStates(config,j,{0:{started:true}});assert.equal(states[1].status,'running');
const records={0:{completed:true},2:{completed:true}};
p=J.progress(config,j,records);assert.deepEqual([p.current.type,p.current.id,p.done],['phase',4,3]);
states=J.nodeStates(config,j,records);assert.equal(states[1].status,'done');assert.equal(states[2].status,'active');

// Program order O001 → O0013: next phase skips archived IDs and never enters the 3rd operation.
assert.equal(J.nextPhase(config,0),2);assert.equal(J.nextPhase(config,2),4);assert.equal(J.nextPhase(config,6),8);assert.equal(J.nextPhase(config,11),12);assert.equal(J.nextPhase(config,16),null);
assert.deepEqual(config.runtime.operations[1].phases.map(i=>data.programs[config.runtime.phases[i].program].file),['O002.TAP','O003.TAP','O004.TAP','O005.TAP','O006.TAP','O007.TAP','O008.TAP','O009.TAP','O0010.TAP','O0011.TAP','O0012.TAP','O0013.TAP']);

// Times: setup is a provisional estimate; machining comes from the TAP with margin.
assert.equal(config.process_timing.setup_estimate_minutes,45);assert.equal(config.process_timing.allowance_percent,20);
assert.equal(J.formatDuration(18*60000),'18 min');assert.equal(J.formatDuration(65*60000),'1 h 05 min');assert.equal(J.formatDuration(10000),'menos de 1 min');
assert.equal(J.elapsedMs('2026-10-13T10:00:00Z','2026-10-13T10:30:00Z'),1800000);assert.equal(J.elapsedMs('x'),null);
assert.equal(J.formatMm(101.8),'101,80');

// Part record from local records only.
const pass=J.passport(config,j,{5:{completed:true,startedAt:'2026-10-13T14:32:00Z',completedAt:'2026-10-13T15:10:00Z'}},data);
assert.equal(pass.target.valueMm,95.75);assert.deepEqual(pass.stock,{totalMm:15.25,faceAMm:0.2,faceBMm:15.05});
assert.equal(pass.stages.find(s=>s.phase===5).elapsedMs,38*60000);assert.equal(pass.stages.find(s=>s.phase===5).program,'O003.TAP');

// Storage normalization never throws; old control views and target choices are dropped.
assert.deepEqual(J.normalize(null),J.emptyJourney());assert.equal(J.normalize({receiving:{receivedMm:'abc'}}).receiving.receivedMm,null);
assert.equal(J.normalize({view:'control-op1'}).view,null);
const old=J.normalize({view:'receiving',receiving:{receivedMm:101.8,recordedAt:'2026-10-13T10:00:00Z',targetChoice:{id:'process'}},controls:{afterFaceAMm:100}});
assert.deepEqual(old.receiving,{receivedMm:101.8,recordedAt:'2026-10-13T10:00:00Z',faceAMm:null,note:''});
console.log('Journey: 95,75 target, Face A 0,20 editable / Face B closes, macro sequence, progress 15 items, program order, times, part record and normalization passed.');
