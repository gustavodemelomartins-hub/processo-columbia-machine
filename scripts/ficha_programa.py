"""Ficha de entrada de programas CNC (leitura lexical, somente leitura).

Uso (da raiz):
  python scripts/ficha_programa.py data/cnc/recebidos/<lote>

Lê cada .TAP/.NC de <lote>/originais (ou do próprio diretório) sem alterar os
originais e grava <lote>/fichas/<arquivo>.json, .md e resumo.md, com o SHA-256.

O que esta ficha é: extração do texto do programa (cabeçalho, ferramentas,
trocas M6, comentários PERCURSO, S/F, sistema de coordenadas, compensação,
ciclos, Z programado). Cada valor traz a linha de origem.

O que ela não é: simulação. Não resolve G91/macros/subprogramas, não calcula
tempo e não liga programa a operação. O percurso e a descida oficiais
continuam vindo de scripts/cnc_adapter.py, depois que o programa entra no
processo. Esta ficha não escreve nada fora do lote.
"""
from pathlib import Path
import hashlib, json, re, sys

EXT = {'.tap', '.nc', '.cnc', '.txt', '.min', '.iso'}
# M comuns (rotação, refrigeração, fim); os demais (paradas, subprogramas, M32 etc.) são listados.
COMMON_M = {3, 4, 5, 7, 8, 9, 30}
WORD = re.compile(r'([A-Z])\s*(#\d+|[-+]?\d*\.?\d+)')


def strip_comments(line):
    return re.sub(r'\([^)]*\)', '', line).split(';')[0].upper()


def num(v):
    try:
        return float(v)
    except ValueError:
        return None


def analyze(path):
    raw = path.read_bytes()
    try:
        text, encoding = raw.decode('utf8'), 'utf-8'
    except UnicodeDecodeError:
        text, encoding = raw.decode('cp1252', errors='replace'), 'cp1252 (não é UTF-8; lido como Windows-1252)'
    lines = text.splitlines()
    out = {
        'arquivo': path.name, 'bytes': len(raw), 'linhas': len(lines), 'codificacao': encoding,
        'sha256': hashlib.sha256(raw).hexdigest(),
        'proveniencia': 'extraído do texto do programa (scripts/ficha_programa.py); não simulado',
        'nome_no_programa': None, 'data_no_programa': None, 'tempo_estimado_cabecalho': None,
        'ferramentas_cabecalho': [], 'trocas_ferramenta': [], 'percursos': [],
        'rotacoes_S': {}, 'avancos_F': {}, 'sistemas_coordenadas': {}, 'compensacao_raio': [],
        'compensacao_comprimento': [], 'ciclos_fixos': {}, 'm_especiais': [],
        'z_programado_por_ferramenta': {}, 'alertas_leitura': [],
    }
    variables, tool, modal_g91 = {}, None, False
    for i, line in enumerate(lines, 1):
        up = line.upper()
        if out['nome_no_programa'] is None:
            m = re.search(r'\((O\d+)\)', up)
            if m: out['nome_no_programa'] = {'valor': m[1], 'linha': i}
        m = re.search(r'DATA\s*:\s*([^)]*)', up)
        if m and not out['data_no_programa']: out['data_no_programa'] = {'valor': m[1].strip(), 'linha': i}
        m = re.search(r'TEMPO ESTIMADO\s*:\s*(\d+)\s*HOURS?\s*(\d+)\s*MIN\s*(\d+)\s*SEC', up)
        if m:
            h, mi, s = map(int, m.groups())
            out['tempo_estimado_cabecalho'] = {'segundos': h * 3600 + mi * 60 + s, 'texto': m[0], 'linha': i,
                                               'natureza': 'estimativa do CAM no cabeçalho; não é tempo real'}
        m = re.search(r'\(\s*(\d+)\|([^|]+)\|\s*([\d.]+)\|\s*([\d.]+)\)', line)
        if m:
            out['ferramentas_cabecalho'].append({'t': int(m[1]), 'nome': m[2].strip(), 'diametro_mm': float(m[3]),
                                                 'raio_ponta_mm': float(m[4]), 'linha': i})
        m = re.search(r'PERCURSO\s*-\s*([^)]*)', line)
        if m: out['percursos'].append({'nome': m[1].strip(), 'linha': i, 'ferramenta': tool})
        code = strip_comments(line)
        dup = re.search(r'([A-Z])\1(?=[-+\d.#])', code)
        if dup: out['alertas_leitura'].append({'linha': i, 'texto': f"endereço repetido '{dup[1]}{dup[1]}' no bloco `{line.strip()}`: confirmar se o comando aceita"})
        for k, v in re.findall(r'#(\d+)\s*=\s*([-+]?\d*\.?\d+)', code):
            variables['#' + k] = v
        words = WORD.findall(re.sub(r'#\d+\s*=\s*[-+]?\d*\.?\d+', '', code))
        def val(v):
            return num(variables.get(v, v)) if v.startswith('#') else num(v)
        gs = [val(v) for k, v in words if k == 'G']
        if 91 in gs: modal_g91 = True; out['alertas_leitura'].append({'linha': i, 'texto': 'G91 incremental: Z lexical não é absoluto'})
        if 90 in gs: modal_g91 = False
        for k, v in words:
            if k == 'T':
                t = val(v)
                if t is not None: tool = int(t)
            if k == 'M':
                mv = val(v)
                if mv == 6: out['trocas_ferramenta'].append({'t': tool, 'linha': i, 'bloco': line.strip()})
                elif mv not in COMMON_M:
                    out['m_especiais'].append({'m': v, 'linha': i, 'bloco': line.strip()})
            if k == 'S' and val(v) is not None:
                out['rotacoes_S'].setdefault(str(tool), set()).add(val(v))
            if k == 'F' and val(v) is not None:
                out['avancos_F'].setdefault(str(tool), set()).add(val(v))
        for g in gs:
            if g is None: continue
            if 54 <= g <= 59: out['sistemas_coordenadas'].setdefault('G%d' % g, i)
            if g in (41, 42): out['compensacao_raio'].append({'g': 'G%d' % g, 'linha': i, 'ferramenta': tool})
            if g == 43: out['compensacao_comprimento'].append({'linha': i, 'ferramenta': tool, 'bloco': line.strip()})
            if 73 <= g <= 89 and g != 80: out['ciclos_fixos'].setdefault('G%d' % g, []).append(i)
        if 53 in gs or modal_g91:
            continue
        for k, v in words:
            if k == 'Z':
                z = val(v)
                if z is None:
                    out['alertas_leitura'].append({'linha': i, 'texto': 'Z com variável não resolvida'}); continue
                rec = out['z_programado_por_ferramenta'].setdefault(str(tool), {'min': None, 'max': None})
                if rec['min'] is None or z < rec['min']['z']: rec['min'] = {'z': z, 'linha': i, 'bloco': line.strip()}
                if rec['max'] is None or z > rec['max']['z']: rec['max'] = {'z': z, 'linha': i}
    for key in ('rotacoes_S', 'avancos_F'):
        out[key] = {t: sorted(v) for t, v in out[key].items()}
    for g, ls in out['ciclos_fixos'].items():
        out['ciclos_fixos'][g] = {'ocorrencias': len(ls), 'primeira_linha': ls[0]}
    if not out['ferramentas_cabecalho']: out['alertas_leitura'].append({'linha': None, 'texto': 'sem tabela de ferramentas no cabeçalho'})
    if not out['tempo_estimado_cabecalho']: out['alertas_leitura'].append({'linha': None, 'texto': 'sem tempo estimado no cabeçalho'})
    return out


def md(f):
    t = f['tempo_estimado_cabecalho']
    rows = [
        f"# Ficha de entrada — {f['arquivo']}", '',
        f"SHA-256 `{f['sha256']}` · {f['bytes']} bytes · {f['linhas']} linhas · codificação {f['codificacao']}.",
        f"Proveniência: {f['proveniencia']}.", '',
        '| Item | Valor extraído | Linha |', '|---|---|---|',
        f"| Nome no programa | {(f['nome_no_programa'] or {}).get('valor', 'não encontrado')} | {(f['nome_no_programa'] or {}).get('linha', '—')} |",
        f"| Data no programa | {(f['data_no_programa'] or {}).get('valor', 'não encontrada')} | {(f['data_no_programa'] or {}).get('linha', '—')} |",
        f"| Tempo estimado (cabeçalho, estimativa) | {t['texto'] if t else 'não informado'} | {t['linha'] if t else '—'} |",
        f"| Sistemas de coordenadas | {', '.join(f['sistemas_coordenadas']) or 'nenhum'} | {', '.join(str(v) for v in f['sistemas_coordenadas'].values()) or '—'} |",
        f"| Compensação de raio G41/G42 | {len(f['compensacao_raio'])} ocorrências | {', '.join(str(c['linha']) for c in f['compensacao_raio'][:5]) or '—'} |",
        f"| Ciclos fixos | {', '.join(f'{g} ×{v['ocorrencias']}' for g, v in f['ciclos_fixos'].items()) or 'nenhum'} | {', '.join(str(v['primeira_linha']) for v in f['ciclos_fixos'].values()) or '—'} |",
        '', '## Ferramentas', '', '| T | Nome (cabeçalho) | Ø | Raio ponta | Trocas M6 (linhas) | S | F | Z mín. programado (linha) |', '|---|---|---|---|---|---|---|---|',
    ]
    ts = [h['t'] for h in f['ferramentas_cabecalho']] + [c['t'] for c in f['trocas_ferramenta'] if c['t'] not in [h['t'] for h in f['ferramentas_cabecalho']]]
    for t in ts:
        h = next((x for x in f['ferramentas_cabecalho'] if x['t'] == t), {})
        z = (f['z_programado_por_ferramenta'].get(str(t)) or {}).get('min')
        rows.append(f"| T{t} | {h.get('nome', 'fora do cabeçalho')} | {h.get('diametro_mm', '—')} | {h.get('raio_ponta_mm', '—')} | "
                    f"{', '.join(str(c['linha']) for c in f['trocas_ferramenta'] if c['t'] == t) or '—'} | "
                    f"{', '.join('%g' % s for s in f['rotacoes_S'].get(str(t), [])) or '—'} | "
                    f"{', '.join('%g' % s for s in f['avancos_F'].get(str(t), [])[:6]) or '—'} | "
                    f"{('%g (%d)' % (z['z'], z['linha'])) if z else '—'} |")
    rows += ['', '## Percursos (comentários do CAM)', '']
    rows += [f"- linha {p['linha']}: {p['nome']} (T{p['ferramenta']})" for p in f['percursos']] or ['- nenhum comentário PERCURSO']
    rows += ['', '## Pontos de atenção na leitura', '']
    notes = [f"- linha {a['linha']}: {a['texto']}" for a in f['alertas_leitura'][:20]]
    notes += [f"- M especial {m['m']} na linha {m['linha']}: `{m['bloco']}`" for m in f['m_especiais'][:20]]
    rows += notes or ['- nenhum']
    rows += ['', '## A preencher na análise (não vem do arquivo)', '',
             '- Peça / OS / desenho e folha:', '- Operação e etapa (fonte do vínculo):', '- Montagem e referência X0/Y0/Z0:',
             '- Divergências com o processo documentado:', '- Dúvidas para o Gustavo:', '']
    return '\n'.join(rows)


def main(folder):
    folder = Path(folder)
    source = folder / 'originais' if (folder / 'originais').is_dir() else folder
    files = sorted(p for p in source.iterdir() if p.is_file() and p.suffix.lower() in EXT)
    if not files: sys.exit('Nenhum programa em ' + str(source))
    dest = folder / 'fichas'; dest.mkdir(exist_ok=True)
    summary = ['# Resumo do lote ' + folder.name, '', '| Arquivo | Nome interno | Tempo cabeçalho | Ferramentas | Z mín. | SHA-256 (início) |', '|---|---|---|---|---|---|']
    for p in files:
        f = analyze(p)
        (dest / (p.name + '.json')).write_text(json.dumps(f, ensure_ascii=False, indent=2), encoding='utf8')
        (dest / (p.name + '.md')).write_text(md(f), encoding='utf8')
        zs = [v['min']['z'] for v in f['z_programado_por_ferramenta'].values() if v['min']]
        summary.append(f"| {p.name} | {(f['nome_no_programa'] or {}).get('valor', '—')} | "
                       f"{f['tempo_estimado_cabecalho']['texto'] if f['tempo_estimado_cabecalho'] else 'não informado'} | "
                       f"{', '.join('T%d' % h['t'] for h in f['ferramentas_cabecalho']) or '—'} | {('%g' % min(zs)) if zs else '—'} | {f['sha256'][:12]} |")
        print(p.name, f['sha256'][:12])
    (dest / 'resumo.md').write_text('\n'.join(summary) + '\n', encoding='utf8')


if __name__ == '__main__':
    if len(sys.argv) != 2: sys.exit(__doc__)
    main(sys.argv[1])
