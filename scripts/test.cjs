const fs=require('node:fs'),path=require('node:path'),{spawnSync}=require('node:child_process');
process.chdir(path.resolve(__dirname,'..'));
for(const folder of ['artifacts/screens','artifacts/reports'])fs.mkdirSync(folder,{recursive:true});
const units=['src/test_tool_length_domain.cjs','src/ferramental/test_tooling_domain.cjs','src/ferramental/test_insert_domain.cjs','src/test_progress_domain.cjs','src/test_tool_work_domain.cjs'];
const browsers=['src/verify_stage_status.cjs','src/verify_simple_workflow.cjs','src/verify_inprocess.cjs','src/verify_progress_study.cjs','src/verify_tool_work.cjs'];
for(const file of [...units,...(process.argv.includes('--unit')?[]:browsers)]){
 console.log('\nValidando '+file);const r=spawnSync(process.execPath,[file],{stdio:'inherit',env:process.env});if(r.status!==0)process.exit(r.status||1);
}
console.log('\nTodas as verificações selecionadas passaram.');
