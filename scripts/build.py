"""Build the existing offline prototype from separated application/data/assets."""
from pathlib import Path
import json, re, base64, io
from PIL import Image
from project_contract import validate
from design_tokens import compile_css
ROOT=Path(__file__).resolve().parents[1]

def read(path):return (ROOT/path).read_text(encoding='utf-8-sig')
def data_uri(path,mime):return 'data:'+mime+';base64,'+base64.b64encode((ROOT/path).read_bytes()).decode()
config=json.loads(read('data/process.json'))
validate(ROOT,config)
data=json.loads(read('data/derived/project_data.json'))
for p in data['programs']:p.pop('path',None)
im=Image.open(ROOT/'assets/drawings/desenho-p1.png').convert('RGB');buf=io.BytesIO();im.save(buf,format='JPEG',quality=88)
values={
 'PROCESS_CONFIG':json.dumps(config,ensure_ascii=False),
 'ORDER_TITLE':config['part']['order'],
 'PRE_HEAT_TARGET':str(config['fixture']['face_method']['pre_heat_target_mm']),
 'PRE_HEAT_TARGET_TEXT':str(float(config['fixture']['face_method']['pre_heat_target_mm'])).replace('.',','),
 'ENGINEERING_NOTICE':config['engineering_review']['message'],
 'DATA':json.dumps(data,ensure_ascii=False),
 'DRAWING':'data:image/jpeg;base64,'+base64.b64encode(buf.getvalue()).decode(),
 'COLUMBIA_LOGO':data_uri('assets/brand/columbia_logo.png','image/png'),
 'COLUMBIA_FAVICON':data_uri('assets/brand/favicon-32x32.png','image/png'),
 'TOOL_REFERENCE_PHOTOS':json.dumps({tool:{'dataUrl':data_uri(photo['file'],'image/jpeg'),'origin':'Gustavo, '+'/'.join(reversed(config['tool_reference_photos']['received'].split('-')[1:]))+' · '+photo['original'].rsplit('/',1)[1],'reference':True} for tool,photo in config['tool_reference_photos']['tools'].items()}),
}
files={
 'THREE':'vendor/three/three.min.js','GVIEWER':'app/simulation/gviewer-precomputed.js',
 'CNC_PAYLOAD':'data/derived/cnc_payload.b64','DRAWING_PAGES':'assets/drawings/drawing_pages.json',
 'STORAGE':'app/storage.js','OPERATOR_LAYER':'app/operator_layer.js','OPERATOR_CSS':'app/operator.css',
 'COLUMBIA_BRAND_CSS':'app/columbia_brand.css','THREE_INTERACTION':'app/simulation/three_interaction.js',
 'STRATEGY_DATA':'data/derived/strategy_data.json','STRATEGY_UI':'app/strategy_ui.js',
 'TOOL_LENGTH_DOMAIN':'app/tool_length_domain.js','TOOL_WORK_DOMAIN':'app/tool_work_domain.js',
 'TOOL_VISUAL_DOMAIN':'app/tool_visual_domain.js','INDUSTRIAL_CSS':'app/industrial.css',
 'TOOLING_DOMAIN':'app/ferramental/tooling_domain.js','MACHINE_PROFILES':'data/machines.json',
 'TOOLING_UI':'app/ferramental/tooling_ui.js','TOOLING_CSS':'app/ferramental/tooling.css',
 'TOOL_PHOTO_UI':'app/ferramental/tool_photo_ui.js','INSERT_UI':'app/insert_ui.js',
 'INSERT_DOMAIN':'app/ferramental/insert_domain.js','CAVITY_DATA':'data/derived/cavity_data.json',
 'JOB_TIMING_DOMAIN':'app/job_timing_domain.js','JOB_TIMING_UI':'app/job_timing_ui.js',
 'JOURNEY_LAYER':'app/journey/journey_ui.js','JOURNEY_DOMAIN':'app/journey/journey_domain.js',
 'DS_COMPONENTS_CSS':'app/design/components.css','JOURNEY_CSS':'app/journey/journey.css',
}
values.update({key:read(path) for key,path in files.items()})
values['DS_TOKENS_CSS']=compile_css(ROOT)
token=re.compile(r'__([A-Z_]+)__')
expanding=[]
def expand(match):
 key=match.group(1)
 if key=='THREE_DEVTOOLS':return match.group(0)  # Three.js runtime hook, not a build token.
 if key not in values:raise ValueError('Token de build desconhecido: '+key)
 if key in expanding:raise ValueError('Ciclo de tokens: '+str(expanding+[key]))
 expanding.append(key)
 value=token.sub(expand,values[key]) if key in {'OPERATOR_LAYER','INSERT_UI','TOOLING_UI','TOOL_PHOTO_UI','JOURNEY_LAYER'} else values[key]
 expanding.pop()
 return value
html=token.sub(expand,read('app/prototype-template.html'))
# Keep the published URL and offline opening contract. index.html is an artifact.
(ROOT/'index.html').write_text(html,encoding='utf8',newline='')
print('Build validado:',len(html.encode('utf8')),'bytes;',len(data['tools']),'ferramentas;',len(data['programs']),'TAPs')
