const assert=require('assert');const Rule=require('./tool_length_domain.js');
for(const [z,expected] of [[-99.97,110],[-83.2,94],[-104,114],[-99.1,110],[-100,110],[-93.4,104]]){const r=Rule.evaluate({zMin:z,resolved:true,topZero:true,margin:10});assert.equal(r.maximumDescent,-z);assert.equal(r.recommended,expected);assert.ok(r.recommended>=r.exactRequired)}
assert.equal(Rule.evaluate({zMin:-60,resolved:true,topZero:true,margin:3}).recommended,63);
for(const overrides of [{resolved:false},{topZero:false},{zMin:NaN},{margin:-1},{margin:null}])assert.equal(Rule.evaluate({zMin:-99.97,resolved:true,topZero:true,margin:10,...overrides}).recommended,null);
assert.equal(Rule.evaluate({zMin:0,resolved:true,topZero:true,margin:10}).maximumDescent,0);assert.equal(Rule.evaluate({zMin:0,resolved:true,topZero:true,margin:10}).recommended,null);
console.log('Central rule: exact descent, ceil recommendation, invalid evidence/margin, zero face handled.');

const processView=Rule.presentation({maximumDescent:null,resolved:false,evidence:[{zMin:0}]},{standard:true,faceOffsetLimit:1});assert.equal(processView.value,1);assert.equal(processView.kind,'process');assert.equal(processView.nominalZ,0);
assert.equal(Rule.presentation({maximumDescent:99.97,resolved:true,evidence:[{zMin:-99.97}]},{standard:false,faceOffsetLimit:1}).value,99.97);
assert.equal(Rule.presentation({maximumDescent:null,resolved:false,evidence:[{zMin:null}]},{standard:true,faceOffsetLimit:1}).value,null);
console.log('Process limit: 1 mm in offset, nominal TAP zero remains separate; unresolved evidence never invented.');
