const assert=require('node:assert/strict'),normalize=require('../app/storage.js');
for(const v of [null,'text',7,[],true])assert.deepEqual(normalize(v,12),{});
const bad=normalize({phase:999,operator:null,checks:[],tooling:'bad',faceTiming:3},12);
assert.equal(bad.phase,11);assert.deepEqual(bad.operator,{});assert.equal(bad.tooling,undefined);
const valid={phase:6,operation:1,operator:{6:{started:true,completed:false}},tooling:{schema:1},faceTiming:{stockByStage:{0:2.1},reductionPerPassMm:.7},author:'Teste'};
assert.deepEqual(normalize(valid,12),valid);
console.log('Malformed storage recovered; valid records preserved.');
