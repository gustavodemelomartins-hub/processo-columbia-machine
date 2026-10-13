from pathlib import Path
import json, hashlib

def validate(root: Path, config: dict):
 """Check industrial links before generating a distributable HTML."""
 def require(ok,message):
  if not ok:raise ValueError(message)
 require(config['schema']=='columbia-operational-process/1','Schema do processo incompatível')
 data=json.loads((root/'data/derived/project_data.json').read_text(encoding='utf8'))
 tools={t['id'] for t in data['tools']};programs=[p['file'] for p in data['programs']]
 phases=config['runtime']['phases'];steps=config['steps'];ids=[s['phase'] for s in steps]
 require(len(ids)==len(set(ids)),'IDs de etapa repetidos')
 require(ids==list(range(len(phases))),'IDs de etapa devem preservar a sequência histórica')
 for step,phase in zip(steps,phases):
  require(set(phase['tools'])<=tools,'Ferramenta desconhecida na etapa')
  pi=phase['program']
  require(pi is None or isinstance(pi,int) and 0<=pi<len(programs),'Índice de programa inválido')
  require(step['program']==(None if pi is None else programs[pi]),'Programa divergente entre cadastro e navegação')
 for op in config['runtime']['operations']:
  require(len(op['phases'])==len(set(op['phases'])),'Etapa repetida na operação')
  for i in op['phases']:
   require(i in ids and not steps[i].get('archived',False),'Etapa ativa inválida ou arquivada')
   require(steps[i]['group']==op['id']+1,'Operação divergente da etapa')
 profiles=json.loads((root/'data/machines.json').read_text(encoding='utf8'))
 require(config['machine_id'] in {m['id'] for m in profiles['machines']},'Máquina piloto inexistente')
 require(config['fixture']['support_count']==len(config['fixture']['schematic_coordinates_mm']),'Número de calços divergente')
 require(config['simulation']['part_mm']['thickness']==config['fixture']['face_method']['pre_heat_target_mm'],'Espessura 3D divergente do processo')
 originals=json.loads((root/'data/originals.sha256.json').read_text(encoding='utf8'))
 for name,expected in originals.items():
  require(hashlib.sha256((root/name).read_bytes()).hexdigest()==expected,'Original alterado: '+name)
 for name in programs:require((root/'data/cnc/originals'/name).exists(),'TAP original ausente: '+name)
 require((root/'assets/drawings/originals'/config['drawing']['file']).exists(),'Desenho ausente')
 # Journey layer: every reference must resolve to existing data; nothing is invented in the UI.
 def path(obj,dotted):
  for k in dotted.split('.'):obj=obj.get(k) if isinstance(obj,dict) else None
  return obj
 qids={q['id'] for q in config.get('open_questions',[])}
 require(len(qids)==len(config.get('open_questions',[])),'Pergunta em aberto repetida')
 for c in config['receiving']['target_candidates']:require(isinstance(path(config,c['value_from']),(int,float)),'Objetivo sem valor de origem: '+c['value_from'])
 nodes=config['journey']['nodes'];require(len({n['id'] for n in nodes})==len(nodes),'Nó de jornada repetido')
 for n in nodes:
  require(set(n.get('questions',[]))<=qids,'Pergunta inexistente no nó '+n['id'])
  if n['kind']=='operation':require(0<=n['operation']<len(config['runtime']['operations']),'Operação inexistente na jornada')
 require(config['receiving']['stock_rule']['symmetric_reference']['confirmed'] is False or 'q-stock-split' not in qids,'Divisão simétrica confirmada sem fechar a pergunta')
 require(len(config['stage_guide']['sections'])==8,'Roteiro da etapa deve ter 8 seções')
