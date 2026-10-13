const assert=require('node:assert/strict'),path=require('node:path'),fs=require('node:fs');
const J=require('../../app/journey/journey_domain.js');
const config=JSON.parse(fs.readFileSync(path.join(__dirname,'../../data/process.json'),'utf8'));
const data=JSON.parse(fs.readFileSync(path.join(__dirname,'../../data/derived/project_data.json'),'utf8'));

// Targets are read from existing fields; neither is chosen by the domain.
const c=J.targetCandidates(config);
assert.deepEqual(c.map(t=>[t.id,t.valueMm]),[['process',96],['drawing',95.75]]);
assert.equal(J.confirmedTarget(config,J.emptyJourney()),null);

// Stock: total, symmetric reference (unconfirmed) and process method after Face A.
const s=J.stockFor('101,8',96);assert.equal(s.valid,true);assert.equal(s.totalMm,5.8);assert.deepEqual([s.symmetric.faceAMm,s.symmetric.faceBMm,s.symmetric.confirmed],[2.9,2.9,false]);
assert.equal(s.method.faceAMm,null);
const m=J.stockFor(101.8,95.75,100.5);assert.equal(m.totalMm,6.05);assert.equal(m.method.faceAMm,1.3);assert.equal(m.method.faceBMm,4.75);
assert.equal(J.stockFor('',96).valid,false);assert.equal(J.stockFor(95,96).valid,false);assert.equal(J.stockFor(95,96).totalMm,-1);
assert.equal(J.stockFor(96,96).totalMm,0);

// Progress counts receiving + 9 active phases + 2 controls; T.T. and 3rd op do not count.
const empty=J.emptyJourney();let p=J.progress(config,empty,{});
assert.equal(p.total,12);assert.equal(p.done,0);assert.equal(p.current.type,'receiving');
let states=J.nodeStates(config,empty,{});
assert.deepEqual(states.map(n=>n.status),['active','waiting','waiting','confirm','waiting','waiting','undefined']);
assert.equal(J.overallStatus(config,empty,{}).label,'Aguardando recebimento');

const j={...empty,receiving:{...empty.receiving,receivedMm:101.8,recordedAt:'2026-10-13T10:00:00Z'}};
p=J.progress(config,j,{});assert.equal(p.done,1);assert.deepEqual([p.current.type,p.current.id],['phase',0]);
assert.equal(J.overallStatus(config,j,{0:{started:true}}).label,'Em usinagem');
states=J.nodeStates(config,j,{0:{started:true}});assert.equal(states[1].status,'running');
const records={0:{completed:true},2:{completed:true}};
p=J.progress(config,j,records);assert.equal(p.current.id,'control-op1');assert.equal(J.overallStatus(config,j,records).label,'Aguardando inspeção');
states=J.nodeStates(config,j,records);assert.equal(states[1].status,'done');assert.equal(states[2].status,'active');
j.controls={'control-op1':{measuredMm:96.02,releasedAt:'2026-10-13T12:00:00Z'}};
p=J.progress(config,j,records);assert.deepEqual([p.current.type,p.current.id,p.done],['phase',4,4]);

// Next phase skips archived IDs and never enters the undefined 3rd operation.
assert.equal(J.nextPhase(config,2),4);assert.equal(J.nextPhase(config,6),8);assert.equal(J.nextPhase(config,11),null);

// Navigation-only records are not completion; time formatting.
assert.equal(J.formatDuration(18*60000),'18 min');assert.equal(J.formatDuration(65*60000),'1 h 05 min');assert.equal(J.formatDuration(10000),'menos de 1 min');
assert.equal(J.elapsedMs('2026-10-13T10:00:00Z','2026-10-13T10:30:00Z'),1800000);assert.equal(J.elapsedMs('x'),null);
assert.equal(J.formatMm(101.8),'101,80');

// Questions are structured and linked to nodes.
assert.ok(config.open_questions.length>=10);assert.ok(J.questionsFor(config,['heat']).some(q=>q.id==='q-heat-treatment'));
for(const n of config.journey.nodes)for(const q of n.questions)assert.ok(config.open_questions.some(x=>x.id===q),'pergunta inexistente '+q);

// Passport assembles only local records; target stays unconfirmed until a human choice.
const pass=J.passport(config,j,{5:{completed:true,startedAt:'2026-10-13T14:32:00Z',completedAt:'2026-10-13T15:10:00Z'}},{},data);
assert.equal(pass.target.confirmed,null);assert.equal(pass.stages.find(s=>s.phase===5).realMs,38*60000);assert.equal(pass.stages.find(s=>s.phase===5).program,'O003.TAP');
assert.equal(pass.controls['control-op1'].measuredMm,96.02);
const chosen={...j,receiving:{...j.receiving,targetChoice:{id:'drawing',by:'Operador',at:'2026-10-13T10:05:00Z'}}};
assert.equal(J.confirmedTarget(config,chosen).valueMm,95.75);

// Storage normalization never throws on malformed data.
assert.deepEqual(J.normalize(null),J.emptyJourney());assert.equal(J.normalize({receiving:{receivedMm:'abc'}}).receiving.receivedMm,null);
console.log('Journey: targets from data, stock/symmetric reference, process method, progress 12 items, node states, next stage, passport and normalization passed.');
