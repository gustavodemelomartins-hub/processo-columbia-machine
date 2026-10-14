from pathlib import Path
import hashlib,json
root=Path(__file__).resolve().parents[1];folder=root/'data/cnc/originals'
for name,expected in json.loads((folder/'SHA256.json').read_text()).items():
 assert hashlib.sha256((folder/name).read_bytes()).hexdigest()==expected,name
print(len(json.loads((folder/'SHA256.json').read_text())),'TAPs originais preservados; hashes conferidos.')
