#!/usr/bin/env python3
"""Render actual upstream-resolved geometry for offline visual QA, not a UI test."""
from pathlib import Path
import cv2,numpy as np,json,math,subprocess,tempfile,shutil,os,hashlib
root=Path(__file__).resolve().parents[1];data=json.loads((root/'qa/native_frames.json').read_text());images={p.stem:cv2.imread(str(p),-1) for p in (root/'source/assets').glob('*.png')}
def affine(n):
 a=math.radians(n['r']);c=math.cos(a);s=math.sin(a);return np.array([[c*n['sx'],-s*n['sy'],n['x']],[s*n['sx'],c*n['sy'],n['y']],[0,0,1]],dtype=np.float32)
def render(frame):
 f=np.full((1080,1920,3),(236,242,247),np.uint8);stage=np.array([[1.8,0,240],[0,1.8,0],[0,0,1]],np.float32);world=[]
 for n in frame:
  m=(stage if n['parent']<0 else world[n['parent']])@affine(n);world.append(m)
  if not n['resource']:continue
  im=images[n['resource']];h,w=im.shape[:2];local=np.array([[n['width']/w,0,-n['cx']],[0,n['height']/h,-n['cy']],[0,0,1]],np.float32);M=m@local;pts=np.array([[0,0,1],[w,0,1],[w,h,1],[0,h,1]])@M.T;lo=np.maximum(np.floor(pts[:,:2].min(0)).astype(int),[0,0]);hi=np.minimum(np.ceil(pts[:,:2].max(0)).astype(int),[1920,1080]);
  if (hi<=lo).any():continue
  a=M[:2].copy();a[:,2]-=lo;q=cv2.warpAffine(im,a,tuple(hi-lo),flags=cv2.INTER_LINEAR,borderMode=cv2.BORDER_CONSTANT);roi=f[lo[1]:hi[1],lo[0]:hi[0]];alpha=q[:,:,3:4].astype(np.float32)/255;roi[:]=np.clip(q[:,:,:3]*alpha+roi*(1-alpha),0,255).astype(np.uint8)
 return f
work=Path(tempfile.mkdtemp(prefix='chifuyu-native-preview-'));out=work/'Chifuyu-Chibi-HMSR-motion-preview-1080p60.mp4';log=(work/'encode.log').open('w');p=subprocess.Popen(['ffmpeg','-y','-v','error','-f','rawvideo','-pix_fmt','bgr24','-s','1920x1080','-r','60','-i','pipe:0','-an','-c:v','libx264','-preset','veryfast','-crf','19','-pix_fmt','yuv420p','-threads','2','-movflags','+faststart',str(out)],stdin=subprocess.PIPE,stderr=log)
selected=[0,60,90,120,150,180,240,270,300,359];tiles=[]
for i,frame in enumerate(data['frames']):
 f=render(frame);p.stdin.write(f.tobytes())
 if i in selected:
  cv2.imwrite(str(root/'qa'/f'native_{i:03d}.png'),f);tile=cv2.resize(f,(480,270));cv2.putText(tile,f'{i/60:.2f}s / native geometry',(15,25),cv2.FONT_HERSHEY_SIMPLEX,.48,(60,60,60),1,cv2.LINE_AA);tiles.append(tile)
p.stdin.close();assert p.wait()==0;log.close();subprocess.run(['ffmpeg','-v','error','-i',str(out),'-f','null','-'],check=True,stdout=subprocess.DEVNULL)
final=root/'docs'/out.name;temp=final.with_suffix('.verified.mp4');shutil.copy2(out,temp)
with temp.open('rb') as f:os.fsync(f.fileno())
assert hashlib.sha256(temp.read_bytes()).digest()==hashlib.sha256(out.read_bytes()).digest();os.replace(temp,final)
cv2.imwrite(str(root/'docs/expressions-and-extremes.jpg'),np.concatenate([np.concatenate(tiles[:5],1),np.concatenate(tiles[5:],1)],0));shutil.copy2(root/'qa/native_000.png',root/'docs/model-preview.png')
report={'status':'PASS','frames':360,'fps':60,'duration':6,'resolution':[1920,1080],'audio':False,'video_full_decode':'PASS','video_bytes':final.stat().st_size,'video_sha256':hashlib.sha256(final.read_bytes()).hexdigest(),'visual_review':'pending','method':'Actual upstream-resolved native geometry composited using source PNG alpha; no browser UI test claimed'};(root/'qa/preview_decode.json').write_text(json.dumps(report,indent=2));print(json.dumps(report))
