const fs=require('node:fs'),path=require('node:path'),{spawnSync}=require('node:child_process');
process.chdir(path.resolve(__dirname,'..'));
for(const folder of ['artifacts/screens','artifacts/reports'])fs.mkdirSync(folder,{recursive:true});
const units=['scripts/test_storage.cjs','tests/unit/test_tool_length_domain.cjs','tests/unit/test_tooling_domain.cjs','tests/unit/test_insert_domain.cjs','tests/unit/test_progress_domain.cjs','tests/unit/test_tool_work_domain.cjs','tests/unit/test_journey_domain.cjs'];
const browsers=['tests/browser/verify_facing_time.cjs','tests/browser/verify_stage_status.cjs','tests/browser/verify_simple_workflow.cjs','tests/browser/verify_inprocess.cjs','tests/browser/verify_progress_study.cjs','tests/browser/verify_tool_work.cjs','tests/browser/verify_journey.cjs'];
for(const file of [...units,...(process.argv.includes('--unit')?[]:browsers)]){
 console.log('\nValidando '+file);const r=spawnSync(process.execPath,[file],{stdio:'inherit',env:process.env});if(r.status!==0)process.exit(r.status||1);
}
console.log('\nTodas as verificações selecionadas passaram.');
