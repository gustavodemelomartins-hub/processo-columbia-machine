"""Cavity consultation data for every program that machines the 12 cavities.

Everything comes from the TAP trajectories (data/derived/cnc_payload.b64) and the
illustrative cavity contours (data/derived/project_data.json). A program enters
only when its cuts below Z0 fall clearly inside the contours; corner programs whose
cuts land outside the contours are listed as excluded instead of guessed.

The drawing overlay uses page 1 (plan view). Cavity regions are found in the
drawing image and the contour centroids are fitted to them (scale + offset); the
script stops if the fit residual is large. The part is point-symmetric, so the
drawing alone cannot tell a 180° turn apart: the overlay follows the same
orientation as the 3D (part turned over around X for the 3rd operation).
Run from the repository root: python scripts/build_cavity_data.py
"""
from pathlib import Path
import base64, collections, gzip, io, json, math, re
from PIL import Image

ROOT = Path(__file__).resolve().parents[1]
payload = json.loads(gzip.decompress(base64.b64decode((ROOT/'data/derived/cnc_payload.b64').read_text())))
project = json.loads((ROOT/'data/derived/project_data.json').read_text(encoding='utf8'))
config = json.loads((ROOT/'data/process.json').read_text(encoding='utf8'))
contours = project['contours']
diameter = {t['id']: t['diameter'] for t in project['tools']}
files = [p['file'] for p in project['programs']]
phases = config['runtime']['phases']
rotation = {s['phase']: s.get('orientation', {}).get('rotation_x_degrees') for s in config['steps']}
bounds = [(min(p[0] for p in c), max(p[0] for p in c), min(p[1] for p in c), max(p[1] for p in c)) for c in contours]

def inside(x, y, c):
    hit = False
    for (ax, ay), (bx, by) in zip(c, c[1:]+c[:1]):
        if (ay > y) != (by > y) and x < (bx-ax)*(y-ay)/(by-ay)+ax: hit = not hit
    return hit

def wall_distance(x, y, c):
    best = math.inf
    for (ax, ay), (bx, by) in zip(c, c[1:]+c[:1]):
        dx, dy = bx-ax, by-ay; length = dx*dx+dy*dy
        t = 0 if length == 0 else max(0, min(1, ((x-ax)*dx+(y-ay)*dy)/length))
        best = min(best, math.hypot(ax+t*dx-x, ay+t*dy-y))
    return best

def cavity_at(x, y, tolerance):
    for i, (a, b, c, e) in enumerate(bounds):
        if a <= x <= b and c <= y <= e and inside(x, y, contours[i]): return i
    near = [i for i, (a, b, c, e) in enumerate(bounds) if a-tolerance <= x <= b+tolerance and c-tolerance <= y <= e+tolerance]
    best = min(near, key=lambda i: wall_distance(x, y, contours[i]), default=None)
    return best if best is not None and wall_distance(x, y, contours[best]) <= tolerance else None

def ref(lines, n):
    if n is None: return None
    code = lines[n-1]; m = re.match(r'\s*N(\d+)', code)
    return {'line': n, 'n': int(m[1]) if m else None, 'code': code}

def source_rapid(lines, before, test):
    for n in range(before-1, 0, -1):
        code = re.sub(r'\([^)]*\)', '', lines[n-1])
        if re.search(r'M0?6(?![\d.])', code): return None
        if re.search(r'G0?0(?![\d.])', code) and test(code): return n
    return None

def blocks_of(segments, mirrored):
    """Feed moves between rapids; each block votes for one cavity with its cuts below Z0."""
    blocks, current = [], []
    for row in segments:
        if row[6] == 0:
            if current: blocks.append(current); current = []
        else: current.append(row)
    if current: blocks.append(current)
    result = []
    for rows in blocks:
        cuts = [r for r in rows if min(r[2], r[5]) < 0]
        if not cuts: continue
        votes = collections.Counter(cavity_at(r[3], -r[4] if mirrored else r[4], diameter.get(r[7], 10)/2+3) for r in cuts[::max(1, len(cuts)//200)])
        winner, count = votes.most_common(1)[0]
        result.append({'cavity': winner, 'share': count/sum(votes.values()), 'first': rows[0][8], 'last': rows[-1][8], 'tools': {r[7] for r in rows}, 'wcs': {'G'+str(r[13]) for r in rows}})
    return result

base_phase = next(i for i, p in enumerate(phases) if p['program'] is not None and files[p['program']] == 'O003.TAP')
programs, excluded = {}, {}
for file, data in payload.items():
    stage = next(i for i, p in enumerate(phases) if p['program'] is not None and files[p['program']] == file)
    mirrored = rotation[stage] != rotation[base_phase]
    blocks = blocks_of(data['segments'], mirrored)
    if not blocks: continue
    clear = [b for b in blocks if b['cavity'] is not None and b['share'] >= .8]
    found = {b['cavity'] for b in clear}
    if not clear: continue
    if len(clear) < .95*len(blocks) or len(found) != len(contours):
        excluded[file] = f'{len(blocks)-len(clear)} de {len(blocks)} trechos de corte fora dos contornos das cavidades'
        continue
    if mirrored:  # Same check the other way round: the turned-over setup must explain the cuts better.
        other = blocks_of(data['segments'], False)
        assert sum(b['cavity'] is not None and b['share'] >= .8 for b in other) < len(clear), file
    visits = []
    for b in clear:
        if visits and visits[-1]['cavity'] == b['cavity']: visits[-1]['last'] = b['last']; visits[-1]['tools'] |= b['tools']; visits[-1]['wcs'] |= b['wcs']
        else: visits.append(dict(b, tools=set(b['tools']), wcs=set(b['wcs'])))
    lines, segments = data['source_lines'], data['segments']
    # Only explicit G0 blocks count as approach/retract; a canned cycle (G81…) moves to the next hole on its own line.
    rapid = lambda r: r[6] == 0 and re.search(r'G0?0(?![\d.])', re.sub(r'\([^)]*\)', '', lines[r[8]-1]))
    entries, previous = [], 0
    for k, v in enumerate(visits):
        window = [r for r in segments if previous < r[8] < v['first'] and rapid(r)]
        top = max((max(r[2], r[5]) for r in window), default=None)
        z_before = max((r[8] for r in window if r[5] == top and r[2] != r[5]), default=None)
        xy = max((r[8] for r in window if (r[0], r[1]) != (r[3], r[4])), default=None)
        # The first rapid of a tool starts from a height set before the trajectory (e.g. G43 Z10): find that block.
        if window and z_before is None: z_before = source_rapid(lines, window[0][8], lambda c: (z := re.search(r'Z([+-]?\d+(?:\.\d*)?)', c)) and float(z[1]) == top)
        if window and xy is None: xy = source_rapid(lines, window[0][8], lambda c: 'X' in c and 'Y' in c)
        until = visits[k+1]['first'] if k+1 < len(visits) else math.inf
        z_after = next((r[8] for r in segments if v['last'] < r[8] < until and rapid(r) and r[5] > r[2]), None)
        first = next(r for r in segments if r[8] == v['first'])
        entries.append({'cavityId': v['cavity']+1, 'sequence': k+1, 'zBefore': ref(lines, z_before), 'positionXY': ref(lines, xy), 'firstCut': ref(lines, v['first']), 'zAfter': ref(lines, z_after), 'lastLine': v['last'], 'feedAtEntry': first[10], 'tools': sorted(v['tools']), 'wcs': sorted(v['wcs'])})
        previous = v['last']
    programs[file] = {'sha256': data['meta']['sha256'], 'turnedOver': mirrored, 'visits': entries}

# Drawing page 1: flood-fill the drawn cavity from each contour centroid, then fit scale + offset.
page = json.loads((ROOT/'assets/drawings/drawing_pages.json').read_text(encoding='utf8'))[0]
image = Image.open(io.BytesIO(base64.b64decode(page['image'].split(',')[1]))).convert('L')
width, height = image.size; pixels = image.load()
def centroid(poly):
    a = cx = cy = 0
    for (x0, y0), (x1, y1) in zip(poly, poly[1:]+poly[:1]):
        f = x0*y1-x1*y0; a += f; cx += (x0+x1)*f; cy += (y0+y1)*f
    return cx/(3*a), cy/(3*a)
def region(seed):
    seen, stack = set(), [seed]
    while stack:
        x, y = stack.pop()
        if (x, y) in seen or not (0 <= x < width and 0 <= y < height): continue
        if min(pixels[x+dx, y+dy] for dx in (-1, 0, 1) for dy in (-1, 0, 1) if 0 <= x+dx < width and 0 <= y+dy < height) < 160: continue
        seen.add((x, y))
        if len(seen) > 60000: break
        stack += [(x+1, y), (x-1, y), (x, y+1), (x, y-1)]
    return seen
# Initial registration from the plan view (1104,9 mm overall ≈ 1252 px); the fit below refines and checks it.
scale, offset = 1.1334, (927.8, 715.2)
centers = [centroid(c) for c in contours]
regions = [region((round(offset[0]+scale*x), round(offset[1]+scale*y))) for x, y in centers]
assert all(20000 < len(r) < 35000 for r in regions), [len(r) for r in regions]
drawn = [(sum(p[0] for p in r)/len(r), sum(p[1] for p in r)/len(r)) for r in regions]
mx, my = sum(c[0] for c in centers)/12, sum(c[1] for c in centers)/12
dx, dy = sum(d[0] for d in drawn)/12, sum(d[1] for d in drawn)/12
scale = sum((c[0]-mx)*(d[0]-dx)+(c[1]-my)*(d[1]-dy) for c, d in zip(centers, drawn))/sum((c[0]-mx)**2+(c[1]-my)**2 for c in centers)
offset = (dx-scale*mx, dy-scale*my)
residual = max(math.hypot(offset[0]+scale*c[0]-d[0], offset[1]+scale*c[1]-d[1]) for c, d in zip(centers, drawn))
assert residual < 6, residual
def outline(points):
    rows = collections.defaultdict(list)
    for x, y in points: rows[y].append(x)
    ys = sorted(rows)[::4]
    return [[min(rows[y]), y] for y in ys]+[[max(rows[y])+1, y] for y in reversed(ys)]

result = {
    'provenance': 'Passagens por cavidade extraídas dos TAPs (cortes abaixo de Z0 dentro dos contornos ilustrativos); linhas L/N do arquivo original.',
    'programs': programs,
    'excluded': excluded,
    'drawing': {
        'page': page['page'], 'scalePxPerMm': round(scale, 5), 'offsetPx': [round(offset[0], 2), round(offset[1], 2)], 'maxResidualPx': round(residual, 2),
        'orientation': 'mesma orientação do 3D: peça tombada no eixo X na 3ª operação; a peça é simétrica a 180°, então o desenho sozinho não define o lado',
        'cavities': [{'cavityId': i+1, 'outline': outline(r)} for i, r in enumerate(regions)],
    },
}
(ROOT/'data/derived/cavity_data.json').write_text(json.dumps(result, ensure_ascii=False, separators=(',', ':')), encoding='utf8')
print({f: len(p['visits']) for f, p in programs.items()}, 'fora:', excluded, 'desenho: escala %.4f px/mm, resíduo %.1f px' % (scale, residual))
