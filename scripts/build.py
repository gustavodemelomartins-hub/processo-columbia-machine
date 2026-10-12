from pathlib import Path
import os
ROOT=Path(__file__).resolve().parents[1]
os.chdir(ROOT)
from PIL import Image
import io,base64,json
template=Path('src/prototype-template.html').read_text(encoding='utf-8-sig')
im=Image.open('src/desenho-p1.png').convert('RGB')
b=io.BytesIO();im.save(b,format='JPEG',quality=88)
drawing='data:image/jpeg;base64,'+base64.b64encode(b.getvalue()).decode()
data=json.loads(Path('src/project_data.json').read_text(encoding='utf8'))
for p in data['programs']:p.pop('path',None)
template=template.replace('__GVIEWER__',Path('src/gviewer-precomputed.js').read_text(encoding='utf8')).replace('__CNC_PAYLOAD__',Path('src/cnc_payload.b64').read_text())
template=template.replace('__OPERATOR_LAYER__',Path('src/operator_layer.js').read_text(encoding='utf8')).replace('__OPERATOR_CSS__',Path('src/operator.css').read_text(encoding='utf8'))
template=template.replace('__DRAWING_PAGES__',Path('src/drawing_pages.json').read_text(encoding='utf8')).replace('__OPERATOR_CONFIG__',Path('src/operator_process_config.json').read_text(encoding='utf8'))
template=template.replace('__COLUMBIA_BRAND_CSS__',Path('src/columbia_brand.css').read_text(encoding='utf-8-sig'))
for token,filename in [('__COLUMBIA_LOGO__','columbia_logo.png'),('__COLUMBIA_FAVICON__','favicon-32x32.png')]:
    template=template.replace(token,'data:image/png;base64,'+base64.b64encode(Path('Identidade_Visual',filename).read_bytes()).decode())
template=template.replace('__THREE_INTERACTION__',Path('src/three_interaction.js').read_text(encoding='utf-8-sig'))
template=template.replace('__STRATEGY_DATA__',Path('src/strategy_data.json').read_text(encoding='utf8')).replace('__STRATEGY_UI__',Path('src/strategy_ui.js').read_text(encoding='utf-8-sig'))
template=template.replace('__TOOL_LENGTH_DOMAIN__',Path('src/tool_length_domain.js').read_text(encoding='utf-8-sig')).replace('__INDUSTRIAL_CSS__',Path('src/industrial.css').read_text(encoding='utf8'))
for token,filename in [('__TOOLING_DOMAIN__','tooling_domain.js'),('__MACHINE_PROFILES__','machine_profiles.json'),('__TOOLING_UI__','tooling_ui.js'),('__TOOLING_CSS__','tooling.css')]:
    template=template.replace(token,Path('src/ferramental',filename).read_text(encoding='utf-8-sig'))
template=template.replace('__TOOL_PHOTO_UI__',Path('src/ferramental/tool_photo_ui.js').read_text(encoding='utf-8-sig'))
template=template.replace('__INSERT_UI__',Path('src/insert_ui.js').read_text(encoding='utf-8-sig')).replace('__INSERT_DOMAIN__',Path('src/ferramental/insert_domain.js').read_text(encoding='utf-8-sig')).replace('__CAVITY_DATA__',Path('src/cavity_data.json').read_text(encoding='utf8'))
for token,filename in [('__TOOL_WORK_DOMAIN__','tool_work_domain.js'),('__TOOL_VISUAL_DOMAIN__','tool_visual_domain.js'),('__JOB_TIMING_DOMAIN__','job_timing_domain.js'),('__JOB_TIMING_UI__','job_timing_ui.js')]:
    template=template.replace(token,Path('src',filename).read_text(encoding='utf-8-sig'))

out=template.replace('__THREE__',Path('src/three.min.js').read_text(encoding='utf8')).replace('__DATA__',json.dumps(data,ensure_ascii=False)).replace('__DRAWING__',drawing)
Path('index.html').write_text(out,encoding='utf8',newline='')
print('HTML bytes:',len(out.encode('utf8')),'tools:',len(data['tools']),'programs:',len(data['programs']))


Path("Cadastro_Processo.json").write_bytes(Path("src/operator_process_config.json").read_bytes())
Path("MachineProfiles.json").write_bytes(Path("src/ferramental/machine_profiles.json").read_bytes())
Path("CNC/Estrategias_Programa.json").write_text(json.dumps(json.loads(Path("src/strategy_data.json").read_text(encoding="utf8")),ensure_ascii=False,indent=2),encoding="utf8")
Path("CNC/Cavidades_O003.json").write_bytes(Path("src/cavity_data.json").read_bytes())
