from pathlib import Path
import sys,unittest,json,hashlib
root=Path(__file__).resolve().parents[1]
sys.path.insert(0,str(root/'vendor/easy_gcode_plot'))
from app.gcode.program_execution import execute_program
class ParserAndSources(unittest.TestCase):
 def test_sources_and_strategy_lines(self):
  hashes=json.loads((root/'data/cnc/originals/SHA256.json').read_text())
  strategies=json.loads((root/'data/derived/strategy_data.json').read_text(encoding='utf8'))
  self.assertEqual(len(strategies),len(hashes));self.assertEqual(len(hashes),17)
  for name,expected in hashes.items():
   original=root/'data/cnc/originals'/name;raw=original.read_bytes()
   self.assertEqual(hashlib.sha256(raw).hexdigest(),expected)
   self.assertEqual(strategies[name]['sha256'],expected)
   try:text=raw.decode('utf8')
   except UnicodeDecodeError:text=raw.decode('cp1252')
   lines=text.splitlines()
   for strategy in strategies[name]['strategies']:
    for key in ['comment','first_motion','first_cut','last_motion','tool_change']:
     record=strategy[key]
     if record:self.assertEqual(lines[record['line']-1],record['code'])
 def test_face_and_two_tool_program(self):
  for name,motions,tools in [('O001.TAP',25,{'T1'}),('O004.TAP',1060,{'T12','T4'}),('O0013.TAP',52,{'T13'})]:
   result,_,_=execute_program((root/'data/cnc/originals'/name).read_text(),language='fanuc_mill')
   self.assertTrue(result.complete);self.assertEqual(len(result.motions),motions)
   self.assertEqual({m.tool for m in result.motions if m.tool},tools)
if __name__=='__main__':unittest.main()
