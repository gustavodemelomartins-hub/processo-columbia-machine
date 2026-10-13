"""Compile design/tokens.json (Design System Columbia Processo) into CSS custom properties.

tokens.json is the single source shared with the Design System artifact. The app never
hardcodes these values: CSS reads var(--name) and type classes .t-<style>."""
from pathlib import Path
import json, base64, re

def _resolve(value, colors, depth=0):
 if isinstance(value, str) and value.startswith('{') and value.endswith('}'):
  if depth > 16: raise ValueError('Alias de cor em ciclo: ' + value)
  return 'var(--' + value[1:-1] + ')'
 return value

def compile_css(root: Path, embed_fonts=True) -> str:
 t = json.loads((root / 'design/tokens.json').read_text(encoding='utf-8'))
 colors = {c['name']: c['value'] for c in t['color']['tokens']}
 out = ['/* Columbia Processo — generated from design/tokens.json */', ':root{']
 for c in t['color']['tokens']:
  v = c['value']
  if isinstance(v, dict): v = v[t['color']['themes'][0]['id']]
  out.append('--%s:%s;' % (c['name'], _resolve(v, colors)))
 for family in ('spacing', 'radius', 'shadow', 'size', 'layout'):
  for tok in t.get(family, {}).get('tokens', []):
   out.append('--%s:%s;' % (tok['name'], tok['value']))
 for key, stack in t['type']['families'].items():
  out.append('--font-%s:%s;' % (key, stack))
 out.append('}')
 if embed_fonts:
  for f in t['type']['fonts']:
   path = root / 'assets' / f['file']
   data = base64.b64encode(path.read_bytes()).decode()
   out.append("@font-face{font-family:'%s';src:url(data:font/woff2;base64,%s) format('woff2');font-weight:%s;font-style:%s;font-display:swap}" % (f['family'], data, f['weight'], f.get('style', 'normal')))
 for g in t['type']['groups']:
  for s in g['styles']:
   fam = s.get('family', g['family'])
   rule = 'font-family:var(--font-%s);font-size:%s;line-height:%s;font-weight:%s' % (fam, s['fontSize'], s['lineHeight'], s['fontWeight'])
   if s.get('letterSpacing'): rule += ';letter-spacing:' + s['letterSpacing']
   if s['name'] == 'eyebrow': rule += ';text-transform:uppercase'
   if s['name'].startswith('value'): rule += ';font-variant-numeric:tabular-nums'
   out.append('.t-%s{%s}' % (s['name'], rule))
 return '\n'.join(out) + '\n'

if __name__ == '__main__':
 import sys
 root = Path(__file__).resolve().parents[1]
 print(compile_css(root, embed_fonts=False))
