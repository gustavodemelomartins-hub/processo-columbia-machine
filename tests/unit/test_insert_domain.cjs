const assert=require('node:assert/strict'),D=require('../../app/ferramental/insert_domain.js');const store={};
assert.equal(D.get(store,'mini-portal',3).count,0);for(let i=0;i<5;i++)assert.equal(D.record(store,'mini-portal',3,'add',{cavityId:i+1,jobId:'OS10713',at:'2026-10-11'}),true);
assert.equal(D.get(store,'mini-portal',3).count,5);assert.equal(D.get(store,'portal-1',3).count,0);assert.equal(D.get(store,'mini-portal',1).count,0);
D.record(store,'mini-portal',3,'change');assert.equal(D.get(store,'mini-portal',3).count,0);assert.equal(D.get(store,'mini-portal',3).cycle,2);D.undo(store,'mini-portal',3);assert.equal(D.get(store,'mini-portal',3).count,5);assert.equal(D.get(store,'mini-portal',3).cycle,1);
const reload=JSON.parse(JSON.stringify(store));assert.equal(D.get(reload,'mini-portal',3).count,5);assert.equal(D.record(reload,'mini-portal',3,'fake'),false);for(let i=0;i<5;i++)D.record(reload,'mini-portal',3,'subtract');assert.equal(D.record(reload,'mini-portal',3,'subtract'),false);assert.equal(D.get(reload,'mini-portal',3).count,0);console.log('Manual insert count: record, reset, undo, isolation, reload and zero boundary passed.');
// Same edge-cycle concept for facing: passes per edge, removed stock computed from the reduction per pass.
const face={};for(let i=0;i<8;i++)D.record(face,'mini-portal',1,'add',{unit:'pass'});
assert.equal(D.record(face,'mini-portal',1,'change',{unit:'pass',kind:'turn',context:{operation:1,program:'O001.TAP',stage:0,reductionPerPassMm:0.7},jobId:'OS 10713',at:'2026-10-13T10:00:00Z'}),true);
let c=D.get(face,'mini-portal',1).cycles[0];assert.deepEqual([c.count,c.unit,c.removedMm,c.reductionPerPassMm,c.kind,c.operation,c.program,c.toolId,c.cavities],[8,'pass',5.6,0.7,'turn',1,'O001.TAP',1,undefined]);
assert.equal(D.get(face,'mini-portal',1).count,0);assert.equal(D.get(face,'mini-portal',1).cycle,2);
for(let i=0;i<7;i++)D.record(face,'mini-portal',1,'add',{unit:'pass'});D.record(face,'mini-portal',1,'change',{unit:'pass',kind:'replace',context:{reductionPerPassMm:0.7}});
const fs1=D.statistics(face,'mini-portal',1);assert.deepEqual([fs1.cycles,fs1.total,fs1.average,fs1.removedMm,fs1.turns,fs1.replacements],[2,15,7.5,10.5,1,1]);
assert.equal(D.record(face,'mini-portal',1,'add',{unit:'bogus'}),false);assert.equal(D.cycleCount({cavities:5}),5);
const cav={};D.record(cav,'mini-portal',3,'change',{total:6,kind:'turn',context:{operation:2,program:'O003.TAP'}});c=D.get(cav,'mini-portal',3).cycles[0];assert.deepEqual([c.count,c.cavities,c.unit,c.removedMm],[6,6,'cavity',null]);
console.log('Insert life: passes per edge with removed stock, cavities per edge, shared cycle domain passed.');
