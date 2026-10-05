#!/usr/bin/env python3
"""Rebuild the self-contained Studio JS from embedded PNGs; Python stdlib only."""
from pathlib import Path
import base64,json,struct,hashlib,argparse
root=Path(__file__).resolve().parents[1]
p=argparse.ArgumentParser();p.add_argument('--verify',action='store_true');args=p.parse_args()
config=json.loads((root/'source/model-config.json').read_text());rig=config['rig'];textures={};rig['images']={}
for name,rel in config['textures'].items():
 raw=(root/'source'/rel).read_bytes();assert raw[:8]==b'\x89PNG\r\n\x1a\n';w,h=struct.unpack('>II',raw[16:24]);rig['images'][name]={'width':w,'height':h};textures[name]='data:image/png;base64,'+base64.b64encode(raw).decode()
s=(root/'source/runtime.js').read_text().replace('__TEXTURES_JSON__',json.dumps(textures,separators=(',',':'))).replace('__RIG_JSON__',json.dumps(rig,ensure_ascii=False,separators=(',',':')))
out=root/'model/Chifuyu-Chibi-HMSR.js';b=s.encode()
if args.verify:assert out.read_bytes()==b,'Build differs from distributed model'
else:out.write_bytes(b)
print(json.dumps({'ok':True,'path':str(out),'bytes':len(b),'sha256':hashlib.sha256(b).hexdigest()}))
