from pathlib import Path
import json,gzip,re,math
root=Path.cwd();dataset={}
def load(i,viewer=None):
 p=Path(viewer)/i if viewer else root/f'data/derived/cnc/viewer/O{i:03}.json'
 return json.loads(p.read_text(encoding='utf8') if p.exists() else gzip.decompress(p.with_suffix('.json.gz').read_bytes()))
def label(line):
 m=re.match(r'\s*N(\d+)',line);return int(m[1]) if m else None
def ref(lines,n):return {'line':n,'n':label(lines[n-1]),'code':lines[n-1]}
def program_strategies(d):
 lines=d['source_lines'];rows=d['segments'];meta=d['meta'];changes=[]
 for n,line in enumerate(lines,1):
  if re.search(r'M0?6\b',re.sub(r'\([^)]*\)','',line)):changes.append(ref(lines,n))
 for j,change in enumerate(changes):
  end=changes[j+1]['line'] if j+1<len(changes) else len(lines)+1
  candidates=[r for r in rows if change['line']<=r[8]<end]
  change['t_number']=candidates[0][7] if candidates else None
 strategies=[]
 for k,op in enumerate(meta['operations']):
  chunk=[r for r in rows if r[12]==k];cuts=[r for r in chunk if r[6]!=0];tools=sorted({r[7] for r in chunk if r[7] is not None});times=0.;unknown=0
  for r in chunk:
   dist=math.dist(r[:3],r[3:6]);feed=10000 if r[6]==0 else r[10]
   if feed and feed>0:times+=dist/feed*60
   elif dist>1e-8:unknown+=1
  start=op['line'];end=meta['operations'][k+1]['line']-1 if k+1<len(meta['operations']) else len(lines)
  text='\n'.join(lines[start-1:end]);declared={}
  for param in ['AP','AE']:
   matches=re.findall(r'\([^)]*\b'+param+r'\s*[:=]\s*(\d+(?:[.,]\d+)?)\s*(?:MM)?[^)]*\)',text,re.I)
   declared[param.lower()]={'values_mm':sorted({float(v.replace(',','.')) for v in matches}), 'status':'extraído do comentário' if matches else 'não determinado','reason':None if matches else 'Não informado no comentário. Material e engajamento reais não determinados pela trajetória.'}
  zvalues=[r[z] for r in cuts for z in [2,5]]
  cmds='\n'.join(re.sub(r'\([^)]*\)','',l) for l in lines[start-1:end]);comp=sorted(set(re.findall(r'G(?:40|41|42)(?![\d.])',cmds)))
  selected_change=next((c for c in reversed(changes) if c['line']<=start and c['t_number'] in tools),None)
  strategies.append({'index':k,'name':op['name'],'provenance':'extraído do programa','comment':ref(lines,start),'source_end_line':end,'first_motion':ref(lines,min(r[8] for r in chunk)) if chunk else None,'first_cut':ref(lines,min(r[8] for r in cuts)) if cuts else None,'last_motion':ref(lines,max(r[8] for r in chunk)) if chunk else None,'tool_change':selected_change,'tools':tools,'rpm':sorted({r[11] for r in chunk if r[11] is not None}),'feeds_mm_min':sorted({r[10] for r in cuts if r[10] is not None}),'wcs':sorted({'G'+str(r[13]) for r in chunk}),'compensation_codes':comp,'z_programmed_cut_mm':{'min':min(zvalues),'max':max(zvalues)} if zvalues else None,'time_estimate_seconds':round(times,4) if not unknown else None,'unknown_feed_segments':unknown,**declared})
 return {'sha256':meta['sha256'],'strategies':strategies,'tool_changes':changes,'time_header_seconds':meta['time_header_seconds'],'time_engine_seconds':meta['time_engine_minutes']*60,'time_work_trajectory_seconds':sum(s['time_estimate_seconds'] or 0 for s in strategies),'estimate_assumptions':'Estimativa da trajetória de trabalho amostrada pelo motor; rápido 10.000 mm/min. Sem aceleração, trocas, paradas ou movimentos G53 não localizados.','restart_note':'Linhas servem para localizar trechos; não são pontos de retomada aprovados. Repassar exige conferir estado modal, G54, H/D e altura segura com a engenharia.'}
if __name__=='__main__':
 for i in range(1,9):
  d=load(i);dataset[d['meta']['file']]=program_strategies(d)
 (root/'data/derived/strategy_data.json').write_text(json.dumps(dataset,ensure_ascii=False,separators=(',',':')),encoding='utf8')
 (root/'data/derived/cnc/Estrategias_Programa.json').write_text(json.dumps(dataset,ensure_ascii=False,indent=2),encoding='utf8')
 for file,d in dataset.items():print(file,[(s['name'],s['comment']['line'],s['comment']['n'],s['tools'],round((s['time_estimate_seconds'] or 0)/60,2)) for s in d['strategies']])
