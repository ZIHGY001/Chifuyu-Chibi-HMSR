// Hanakuma Chifuyu, pencil chibi, v1.0.0. Non-official fan model.
// A single importable JS file for Halfne Miku Studio Reborn.
// All PNG resources are embedded. This file has no network/file access.
const TEXTURES=__TEXTURES_JSON__;
const RIG=__RIG_JSON__;
const clamp=(x,a,b)=>Math.max(a,Math.min(b,x));
const names=['gentle','longing','smile'];
const mikuConfig=()=>{
 let lastTimestamp;let normalize;
 const headAngle=c=>Number.isFinite(c.headOverride)?clamp(c.headOverride,-12,12):6.2*Math.sin(c.time*.57+.2)+1.1*Math.sin(c.time*.19);
 const eyesName=c=>c.blink?'eyes_blink':'eyes_'+names[c.expression];
 const mouthName=c=>'mouth_'+(c.mouthOpen<.10?'closed':c.mouthOpen<.35?'small':c.mouthOpen<.70?'medium':'large');
 const shape=(id,name,x,y,pivot,sx,sy=sx)=>({id,x,y,rotation:0,scaleX:sx,scaleY:sy,width:RIG.images[name].width,height:RIG.images[name].height,resourceCenterX:pivot[0],resourceCenterY:pivot[1],resource:TEXTURES[name],components:[]});
 const armL=shape('arm_left','arm_left',-50,-280,[278,43],.44);
 const armR=shape('arm_right','arm_right',52,-280,[41,43],.44);
 armL.rotation=c=>Number.isFinite(c.armLeftOverride)?clamp(c.armLeftOverride,-16,16):-1.8+2.1*Math.sin(c.time*.72+.4);
 armR.rotation=c=>Number.isFinite(c.armRightOverride)?clamp(c.armRightOverride,-16,16):1.8+2.1*Math.sin(c.time*.72+1.8);
 const body=shape('body_armless','body_armless_v2',0,0,[520.5,1505],.214);
 const braidL=shape('braid_left','braid_left',-105,-81,[132,26],.37,.50);
 const braidR=shape('braid_right','braid_right',108,-75,[52,28],.37,.50);
 braidL.rotation=c=>2.4*Math.sin(c.time*.82-.5);
 braidR.rotation=c=>2.4*Math.sin(c.time*.82+.7);
 const head=shape('head_sprite','head',0,0,[310,481],.72);
 const eyes=shape('eyes_and_brows','eyes_gentle',0,-75,RIG.face_parts.eyes_gentle.resource_center,.48);
 eyes.resource=c=>TEXTURES[eyesName(c)];
 eyes.width=c=>RIG.images[eyesName(c)].width;
 eyes.height=c=>RIG.images[eyesName(c)].height;
 eyes.resourceCenterX=c=>RIG.face_parts[eyesName(c)].resource_center[0];
 eyes.resourceCenterY=c=>RIG.face_parts[eyesName(c)].resource_center[1];
 const mouth=shape('mouth','mouth_closed',0,-28,RIG.face_parts.mouth_closed.resource_center,.36);
 mouth.resource=c=>TEXTURES[mouthName(c)];
 mouth.width=c=>RIG.images[mouthName(c)].width;
 mouth.height=c=>RIG.images[mouthName(c)].height;
 mouth.resourceCenterX=c=>RIG.face_parts[mouthName(c)].resource_center[0];
 mouth.resourceCenterY=c=>RIG.face_parts[mouthName(c)].resource_center[1];
 const headRig={id:'head_rig',x:c=>-.7*headAngle(c),y:c=>-310+1.8*Math.sin(c.time*.85),rotation:headAngle,components:[braidL,braidR,head,eyes,mouth]};
 const bodyRig={id:'body_rig',x:0,y:c=>-2.1*(.5+.5*Math.sin(c.time*1.15)),rotation:c=>.65*Math.sin(c.time*.7),components:[armL,armR,body,headRig]};
 const config={
  background:{Paper:'#F7F4EC',Blue:'#EDF2F5'},
  defaultKeyMapping:[['EyeHappy','1'],['EyeJaded','2'],['EyeO_O','3'],['EyeBlink','x'],['MouthAA','a'],['MouthEE','d'],['MouthEH','s'],['MouthOO','w']],
  metadata:{name:'Hanakuma Chifuyu Pencil Chibi',version:'1.0.0',resourceCatalog:TEXTURES,face_parts:RIG.face_parts,visible_hand_nodes:['arm_left','arm_right'],static_arm_pixels:false,expressions:names,voicebank:'Hanakuma Chifuyu AI 2 (voicebank not included)',audio:'External audioEnergy 0–1 or mouthOpen/keyboard controls; model does not analyze an imported song; no phoneme alignment.',geometry:'Two arm sprites only; armless torso; rigid head parent for eyebrows, eyes, mouth and braids.'},
  parseControl:(input={})=>{
   const c={mouseX:400,mouseY:300,keyInput:[],...input};
   const live=Number.isFinite(c.timestamp)&&c.timestamp!==lastTimestamp;
   c.time=live?c.timestamp/1000:Number.isFinite(c.animationTime)?c.animationTime:Number.isFinite(c.time)?c.time+1/60:0;
   if(Number.isFinite(c.timestamp))lastTimestamp=c.timestamp;
   if(live)delete c.animationTime;
   c.expression=clamp(Math.round(Number(c.expression)||0),0,2);
   ['EyeHappy','EyeJaded','EyeO_O'].forEach((key,i)=>{if(c.keyInput.includes(key))c.expression=i});
   if(Number.isFinite(c.expressionOverride))c.expression=clamp(Math.round(c.expressionOverride),0,2);
   const pulse=((c.time+1.1)%4.7+4.7)%4.7;
   c.blink=pulse<.15||c.keyInput.includes('EyeBlink');
   if(Number.isFinite(c.blinkOverride))c.blink=c.blinkOverride>=.5;
   c.audioEnergy=clamp(Number(c.audioEnergy)||0,0,1);
   c.mouthOpen=live?c.audioEnergy:Math.max(c.audioEnergy,clamp(Number(c.mouthOpen)||0,0,1));
   if(c.keyInput.includes('MouthAA'))c.mouthOpen=.95;
   if(c.keyInput.includes('MouthEE'))c.mouthOpen=.53;
   if(c.keyInput.includes('MouthEH'))c.mouthOpen=.22;
   if(c.keyInput.includes('MouthOO'))c.mouthOpen=.80;
   if(Number.isFinite(c.mouthOverride))c.mouthOpen=clamp(c.mouthOverride,0,1);
   c._chifuyuParsed=true;return c;
  },
  model:{id:'root',x:400,y:560,rotation:0,scaleX:.75,scaleY:.75,components:[bodyRig]}
 };
 const cached=new WeakMap();normalize=(c={})=>{if(c._chifuyuParsed&&Number.isFinite(c.time))return c;if(cached.has(c))return cached.get(c);const value=config.parseControl(c);cached.set(c,value);return value};
 const wrap=n=>{for(const k of Object.keys(n)){if(typeof n[k]==='function'){const f=n[k];n[k]=(c,r,p)=>f(normalize(c),r,p)}}for(const child of n.components||[])wrap(child)};wrap(config.model);
 return config;
};
