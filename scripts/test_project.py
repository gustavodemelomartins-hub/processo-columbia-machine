from pathlib import Path
import json, unittest, sys, copy
ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / 'scripts'))
class ProcessContract(unittest.TestCase):
 def test_single_process_source_and_originals(self):
  config=json.loads((ROOT/'data/process.json').read_text(encoding='utf8'))
  from project_contract import validate
  validate(ROOT,config)
  self.assertEqual(config['machine_id'],'mini-portal')
  self.assertEqual(config['runtime']['storage_key'],'columbia-os10713-demo-v2')
  self.assertEqual(config['runtime']['operations'][1]['phases'],[4,5,6,8,9,10,11,12,13,14,15,16,17,18,19,20])
  self.assertEqual([config['steps'][i]['program'] for i in range(12,17)],['O009.TAP','O0010.TAP','O0011.TAP','O0012.TAP','O0013.TAP'])
  self.assertEqual(config['runtime']['operations'][2]['phases'],[21,22,23,24]);self.assertEqual([config['steps'][i]['program'] for i in range(21,25)],['O0018.TAP','O0019.TAP','O0020.TAP','O0021.TAP'])
  self.assertEqual(config['runtime']['phases'][6]['tools'],[12,4])
  for s in config['steps']:self.assertNotIn('Ã',s['name'])
  bad=copy.deepcopy(config);bad['runtime']['phases'][6]['tools']=[999]
  with self.assertRaises(ValueError):validate(ROOT,bad)
  bad=copy.deepcopy(config);bad['runtime']['operations'][1]['phases'].append(6)
  with self.assertRaises(ValueError):validate(ROOT,bad)
if __name__=='__main__':unittest.main()
