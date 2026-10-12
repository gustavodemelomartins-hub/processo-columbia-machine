from pathlib import Path
import sys,json,re,hashlib,gzip,base64,subprocess
from dataclasses import asdict,replace
sys.path.insert(0,str(Path('vendor/easy_gcode_plot').resolve()))
from app.gcode.program_execution import execute_program
from app.gcode.trace_tools import sample_motion,trace_statistics
import argparse
parser=argparse.ArgumentParser(description='POC Columbia: adaptador de metadados e trajetória do easy_gcode_plot')
parser.add_argument('--input-dir',default='CNC/originais')
parser.add_argument('--output-dir',default='CNC')
parser.add_argument('files',nargs='*')
args=parser.parse_args()
ROOT=Path(args.input_dir)
OUT=Path(args.output_dir);OUT.mkdir(exist_ok=True)
def sha(p):return hashlib.sha256(p.read_bytes()).hexdigest()
def dump(p,d):p.parent.mkdir(parents=True,exist_ok=True);p.write_text(json.dumps(d,ensure_ascii=False,indent=2),encoding='utf8')
def bounds(points):
    return {a:[min(p[i] for p in points),max(p[i] for p in points)] for i,a in enumerate('XYZ')} if points else None
def analyze(file,index):
    path=ROOT/file;before=sha(path);source=path.read_text(encoding='utf8')
    result,tools,inferred=execute_program(source,language='fanuc_mill')
    lines=source.splitlines();steps={s.source_block:s for s in result.execution_steps}
    ops=[];headers={};operations_by_block={};active=None
    for i,line in enumerate(lines):
        hit=re.search(r'PERCURSO\s*-\s*([^)]*)',line)
        if hit:active={'name':hit[1].strip(),'line':i+1};ops.append(active)
        operations_by_block[i]=len(ops)-1
        hit=re.search(r'\(\s*(\d+)\|([^|]+)\|\s*([\d.]+)\|\s*([\d.]+)\)',line)
        if hit:headers[int(hit[1])]={'t_number':int(hit[1]),'name':hit[2].strip(),'diameter_mm':float(hit[3]),'tip_radius_mm':float(hit[4]),'source_line':i+1,'provenance':'extraído do programa'}
    gc=set();mc=set();comp=[];wcs=set();wcs_by_block={}
    for step in result.execution_steps:
        wcs.add(step.active_wcs);wcs_by_block[step.source_block]=step.active_wcs
    for ins in result.instructions:
        gc.update(ins.g_codes);mc.update(ins.m_codes)
    for step in result.execution_steps:
        for key,value in step.words:
            if (key=='G' and value in (40,41,42,43,44,49)) or key in ('D','H'):
                comp.append({'line':step.source_block+1,'word':key,'value':value})
    rows=[];workmotions=[];machine=[];allpts=[];workpts=[];feeds={};rpm={};compstates=set()
    # A trace is kept intact. Unlocated reference/G53 moves and the next transfer
    # are excluded ONLY from the overlay; they remain in the engine report.
    known_axes=set()
    for i,m in enumerate(result.motions):
        block=m.source_block;step=steps.get(block);gcodes=[v for k,v in step.words if k=='G'] if step else []
        is_machine=53 in gcodes or 28 in gcodes or 30 in gcodes
        points=sample_motion(m,i,chord_error=.02,lathe_radius_view=False,max_points=200000)
        xyz=[(m.start_x,m.start_y,m.start_z)]+[(p.x,p.y,p.z) for p in points];allpts+=xyz
        tid=int(m.tool[1:]) if m.tool and m.tool.startswith('T') else None
        if tid:
            if m.feed is not None and m.move!=0:feeds.setdefault(tid,set()).add(m.feed)
            if m.spindle_rpm is not None:rpm.setdefault(tid,set()).add(m.spindle_rpm)
        compstates.add(m.compensation_status)
        anchored_before=len(known_axes)==3
        if is_machine:known_axes.clear()
        else:
            known_axes.update(k for k,value in step.words if k in ('X','Y','Z')) if step else None
        if is_machine:machine.append({'motion':i,'line':block+1 if block is not None else None})
        elif anchored_before:
            workmotions.append(m);workpts+=xyz
        if not is_machine and anchored_before:
            for a,b in zip(xyz,xyz[1:]):
                rows.append([*[round(v,6) for v in a+b],m.move,tid,block+1 if block is not None else None,m.source_nlabel,m.feed,m.spindle_rpm,operations_by_block.get(block,-1),wcs_by_block.get(block,54),i])

    stats=asdict(trace_statistics(result)) if hasattr(trace_statistics(result),'__dataclass_fields__') else trace_statistics(result)
    workstats=trace_statistics(replace(result,motions=tuple(workmotions)))
    diagnostics=[asdict(d) for d in result.diagnostics]
    warnings=[{'code':'UNLOCATED_MACHINE_FRAME','message':'G53 e transferências antes de ancorar X/Y/Z em coordenadas de trabalho não localizados sobre a montagem. G54=0 no modelo é hipótese de exibição, não cadastro da máquina.'},
              {'code':'ESTIMATE_ASSUMPTIONS','message':'Tempo cinemático; rápido assumido 10000 mm/min, sem aceleração, troca de ferramenta ou paradas.'}]
    if any(c['word']=='H' and c['value'] for c in comp):warnings.append({'code':'MACHINE_LENGTH_OFFSETS_UNKNOWN','message':'H selecionado; valores reais de comprimento/corretores não fornecidos.'})
    for t in headers.values():
        r=re.search(r'\bR\s*(\d+(?:\.\d+)?)',t['name'])
        if r and abs(float(r[1])-t['tip_radius_mm'])>1e-6:
            t['radius_in_name_mm']=float(r[1]);warnings.append({'code':'TOOL_RADIUS_CONFLICT','message':f"T{t['t_number']}: nome informa R{r[1]}, coluna TOOL TIP RADIUS informa {t['tip_radius_mm']}. Confirmar."})
        t['rpm']=sorted(rpm.get(t['t_number'],set()));t['feeds_mm_min']=sorted(feeds.get(t['t_number'],set()))
    meta={'file':file,'sequence':index,'sha256':before,'provenance':'extraído do programa','engine_ok':result.ok,'engine_complete':result.complete,'operations':ops,'tools':list(headers.values()),'wcs':['G'+str(w) for w in sorted(wcs)],'time_engine_minutes':stats['known_time_min'],'time_engine_assumptions':'rápido 10000 mm/min; sem aceleração, troca, dwell','bbox_engine_including_unlocated_machine':stats['bounds'],'bbox_work_trace':workstats['bounds'],'z_depths_work_trace':{'min':workstats['z_min'],'bounds':workstats['bounds'][2] if workstats['bounds'] else None},'g_codes':['G'+str(c) for c in sorted(gc)],'m_codes':['M'+str(c) for c in sorted(mc)],'compensations':comp,'compensation_states':sorted(compstates),'diagnostics':diagnostics,'warnings':warnings,'motion_count':len(result.motions),'viewer_segment_count':len(rows),'machine_movements_excluded_overlay':machine,'tool_discovery':tools}
    hit=re.search(r'TEMPO ESTIMADO\s*:\s*(\d+) HOURS (\d+) MIN (\d+) SEC',source)
    meta['time_header_seconds']=sum(int(v)*f for v,f in zip(hit.groups(),(3600,60,1))) if hit else None
    meta['per_tool_stats']=stats['per_tool']
    dump(OUT/'analyses'/file.replace('.TAP','.json'),meta)
    dump(OUT/'traces'/file.replace('.TAP','.json'),{'complete':result.complete,'diagnostics':diagnostics,'motions':[asdict(m) for m in result.motions]})
    dump(OUT/'viewer'/file.replace('.TAP','.json'),{'columns':['x0','y0','z0','x1','y1','z1','move','tool','line','N','feed','rpm','operation','wcs','motion_index'],'segments':rows,'meta':meta,'source_lines':lines})
    assert sha(path)==before,'Source changed'
    print(file,len(result.motions),'motions',len(rows),'segments',len(diagnostics),'diagnostics',flush=True)
    return meta,{'segments':rows,'meta':meta,'source_lines':lines}
files=args.files or [f'O{i:03}.TAP' for i in range(1,9)]
programs=[];viewer={}
for i,file in enumerate(files,1):
    m,v=analyze(file,i);programs.append(m);viewer[file]=v
unique={}
for p in programs:
    for t in p['tools']:
        tid=t['t_number']
        if tid not in unique:unique[tid]={**t,'programs':[]}
        u=unique[tid];u['programs'].append(p['file']);u['rpm']=sorted(set(u['rpm']+t['rpm']));u['feeds_mm_min']=sorted(set(u['feeds_mm_min']+t['feeds_mm_min']))
commit='98894b34fb80cc73f12c0ebf3a69e9baca7448f2' # pinned upstream snapshot; archive intentionally omits .git
manifest={'schema':'columbia-cnc-manifest-v1','project':'Processo Columbia Machine','part':'FP16F 12V H8','order':'10713','engine':{'name':'easy_gcode_plot','version':'1.9.8','commit':commit,'language':'fanuc_mill','correction_enabled':True,'arc_chord_error_viewer_mm':.02},'programs':programs,'unique_tools':list(unique.values()),'sequence_provenance':'ordem dos arquivos O001–O008 proposta para o processo; comentários PERCURSO extraídos','process':{'provenance':'dados de processo / validação humana','pre_heat_thickness_mm':96,'post_heat_thickness_mm':95,'drawing_pre_heat_thickness_mm':95.75,'revision_note':'Alinhar revisão do desenho com meta de 96,0 mm definida pelo usuário.','setup1':['O001 primeira face','tombar manualmente','O001 segunda face'],'setup2':'subir nos calços e executar O002–O008; fixação e lado da peça exigem validação humana','stops':'M0 propostos; não existem nos originais','overlay_origin':'G54 visual em XY centro, Z topo; cadastro e relação G53 não fornecidos'}}
if Path('src/process_operations_config.json').exists():
    manifest['process']['operation_groups']=json.loads(Path('src/process_operations_config.json').read_text(encoding='utf8'))
dump(OUT/'Manifesto_Peca.json',manifest)
packed=base64.b64encode(gzip.compress(json.dumps(viewer,separators=(',',':'),ensure_ascii=False).encode())).decode()
Path('src/cnc_payload.b64').write_text(packed)
