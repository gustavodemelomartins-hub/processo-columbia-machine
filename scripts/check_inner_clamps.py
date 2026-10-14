"""Confere que as garras ficam fora dos percursos: por dentro (fixture.inner_clamps) e as de cima dos calços.

Para cada etapa com garras por dentro, todo movimento do programa abaixo de Z+60
(acima do topo da peça) precisa passar a pelo menos raio da ferramenta + 5 mm da
barra da garra. Usa os segmentos já extraídos em data/derived/cnc_payload.b64.
"""
from pathlib import Path
import base64, gzip, json, math, sys

root = Path(__file__).resolve().parent.parent
config = json.loads((root / 'data/process.json').read_text(encoding='utf8'))
payload = json.loads(gzip.decompress(base64.b64decode((root / 'data/derived/cnc_payload.b64').read_text())))
project = json.loads((root / 'data/derived/project_data.json').read_text(encoding='utf8'))
radius = {t['id']: t['diameter'] / 2 for t in project['tools']}
clamps = config['fixture']['inner_clamps']
half_l, half_w = clamps['strap_mm']['length'] / 2, clamps['strap_mm']['width'] / 2
Z_LIMIT, MARGIN = 60, 5


def gap(px, py, c):
    dx = max(abs(px - c['x']) - half_l, 0); dy = max(abs(py - c['y']) - half_w, 0)
    return math.hypot(dx, dy)


worst = {}
for stage in clamps['stages']:
    file = config['steps'][stage]['program']
    for r in payload[file]['segments']:
        if r[7] is None or min(r[2], r[5]) >= Z_LIMIT: continue
        need = radius.get(r[7], 10) + MARGIN
        n = max(1, int(math.hypot(r[3] - r[0], r[4] - r[1]) / 2))
        for k in range(n + 1):
            t = k / n; px, py = r[0] + (r[3] - r[0]) * t, r[1] + (r[4] - r[1]) * t
            for i, c in enumerate(clamps['coordinates_mm']):
                g = gap(px, py, c) - need
                if (i, file) not in worst or g < worst[(i, file)][0]: worst[(i, file)] = (g, r[8])
# Garras de cima dos calços (desenho do 3D): barra de 170 mm em |X| 495–665, |Y| 235 ± 29, nas etapas
# sobre calços que ainda não passaram as garras para dentro.
outer = [s for s in config['runtime']['operations'][1]['phases'] if s not in clamps['stages']]
for stage in outer:
    file = config['steps'][stage]['program']
    for r in payload[file]['segments']:
        if r[7] is None or min(r[2], r[5]) >= Z_LIMIT: continue
        need = radius.get(r[7], 10) + MARGIN
        n = max(1, int(math.hypot(r[3] - r[0], r[4] - r[1]) / 2))
        for k in range(n + 1):
            t = k / n; px, py = r[0] + (r[3] - r[0]) * t, r[1] + (r[4] - r[1]) * t
            g = math.hypot(max(0, 495 - abs(px), abs(px) - 665), max(0, abs(abs(py) - 235) - 29)) - need
            if ('cima', file) not in worst or g < worst[('cima', file)][0]: worst[('cima', file)] = (g, r[8])
bad = [(i, f, g, line) for (i, f), (g, line) in worst.items() if g < 0]
for i, f, g, line in bad: print(f'Garra {i if i == "cima" else i + 1} atingida por {f} (linha {line}): {g:.1f} mm')
if bad: sys.exit(1)
print(f'Garras fora dos percursos: {len(clamps["coordinates_mm"])} por dentro em {len(clamps["stages"])} etapas e 4 de cima nos calços em {len(outer)} etapas; folga mínima {min(g for g, _ in worst.values()):.1f} mm além de raio + {MARGIN} mm.')
