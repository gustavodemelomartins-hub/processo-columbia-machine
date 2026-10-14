"""Incorpora programas confirmados aos dados derivados, sem regerar os existentes.

Uso (da raiz), depois de copiar os originais para data/cnc/originals e atualizar os hashes:
  python scripts/cnc_adapter.py --input-dir data/cnc/originals --output-dir <tmp> O009.TAP ...
  git checkout data/derived/cnc_payload.b64   # o adaptador regrava o payload só com os arquivos pedidos
  python scripts/incorporar_programas.py <tmp>/viewer O009.TAP ...

Acrescenta cada programa a cnc_payload.b64, strategy_data.json e project_data.json
(programas e ferramentas). Programas já presentes não são tocados. O formato segue
o dos oito TAPs originais (conferido: as estratégias recalculadas dos oito são
idênticas às publicadas).
"""
from pathlib import Path
import base64, gzip, json, sys
sys.path.insert(0, str(Path(__file__).resolve().parent))
import build_strategy_data as strategy

root = Path.cwd()
viewer_dir, files = Path(sys.argv[1]), sys.argv[2:]
payload_path = root / 'data/derived/cnc_payload.b64'
payload = json.loads(gzip.decompress(base64.b64decode(payload_path.read_text())))
strategies = json.loads((root / 'data/derived/strategy_data.json').read_text(encoding='utf8'))
project = json.loads((root / 'data/derived/project_data.json').read_text(encoding='utf8'))
hashes = json.loads((root / 'data/cnc/originals/SHA256.json').read_text())
provenance = 'extraído do programa pelo easy_gcode_plot'

for file in files:
    if file in payload:
        print(file, 'já incorporado; mantido'); continue
    d = json.loads((viewer_dir / file.replace('.TAP', '.json')).read_text(encoding='utf8'))
    meta = d['meta']
    assert meta['sha256'] == hashes[file], 'hash divergente: ' + file
    meta['sequence'] = len(payload) + 1
    meta['trajectory_kind'] = 'calculated_programmed'
    meta['diagnostic_count'] = len(meta['diagnostics'])
    grouped = {}
    for g in meta['diagnostics']:
        k = (g['code'], g['message'])
        if k not in grouped: grouped[k] = {**g, 'count': 0, 'first_line': g.get('line'), 'last_line': g.get('line')}
        grouped[k]['count'] += 1; grouped[k]['last_line'] = g.get('line')
    meta['diagnostics'] = list(grouped.values())  # mesmo formato agrupado dos oito originais
    payload[file] = {'columns': d['columns'], 'segments': d['segments'], 'meta': meta, 'source_lines': d['source_lines']}
    strategies[file] = strategy.program_strategies(d)
    depths = {}
    for r in d['segments']:
        if r[6] == 0 or r[7] is None: continue
        z = min(r[2], r[5]); t = str(r[7])
        if t not in depths or z < depths[t]['z']:
            depths[t] = {'z': z, 'line': r[8], 'block': d['source_lines'][r[8] - 1].strip(), 'origin': 'G' + str(r[13])}
    project['programs'].append({'file': file, 'tools': [t['t_number'] for t in meta['tools']], 'seconds': meta['time_header_seconds'],
                                'operations': [o['name'] for o in meta['operations']], 'depths': depths, 'depthIssues': []})
    for t in meta['tools']:
        tid, dep = t['t_number'], depths.get(str(t['t_number']))
        tool = next((x for x in project['tools'] if x['id'] == tid), None)
        if tool is None:
            tool = {'id': tid, 'name': t['name'], 'diameter': t['diameter_mm'], 'radius': t['tip_radius_mm'], 'programs': [],
                    'depthMm': None, 'depthSource': None, 'depthIssues': []}
            project['tools'].append(tool)
        tool['programs'].append(file)
        if dep and (tool['depthMm'] is None or -dep['z'] > tool['depthMm']):
            tool['depthMm'] = round(-dep['z'], 6)
            tool['depthSource'] = {'file': file, **dep, 'provenance': provenance}
    print(file, len(d['segments']), 'segmentos;', [s['name'] for s in strategies[file]['strategies']])

payload_path.write_text(base64.b64encode(gzip.compress(json.dumps(payload, separators=(',', ':'), ensure_ascii=False).encode())).decode())
(root / 'data/derived/strategy_data.json').write_text(json.dumps(strategies, ensure_ascii=False, separators=(',', ':')), encoding='utf8')
(root / 'data/derived/cnc/Estrategias_Programa.json').write_text(json.dumps(strategies, ensure_ascii=False, indent=2), encoding='utf8')
(root / 'data/derived/project_data.json').write_text(json.dumps(project, ensure_ascii=False), encoding='utf8')
