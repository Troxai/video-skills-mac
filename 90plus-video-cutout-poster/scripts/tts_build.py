#!/usr/bin/env python3
"""Chạy bằng python của VieNeu: ~/VieNeu-TTS/.venv/bin/python scripts/tts_build.py …  (TTS chạy trên máy; đặt TTS_URL nếu muốn gọi dịch vụ TTS HTTP riêng)
tts_build.py <script.md> <outdir> <phon.json>: đọc các dòng 'N. text', thay phiên âm, gọi TTS, cắt lặng, nối 0.32s, atempo 1.15 → outdir/voice.wav + timeline.json"""
import sys,re,json,subprocess,os,numpy as np,wave
md,out,ph=sys.argv[1:4];os.makedirs(out+'/tmp',exist_ok=True)
P=json.load(open(ph))
L=[m.group(1) for l in open(md) for m in [re.match(r'\d+\. (.*)',l.strip())] if m]
segs=[];sr=None
for i,t in enumerate(L):
  for a,b in sorted(P.items(),key=lambda x:-len(x[0])): t=t.replace(a,b)
  f=f'{out}/tmp/c{i:02d}.wav'
  if not os.path.exists(f):
    if os.environ.get('TTS_URL'):
      subprocess.run(['curl','-sS','-X','POST',os.environ['TTS_URL'],'-H','Content-Type: application/json','-d',json.dumps({'text':t,'voice':'Hải Đăng','style':'doc_truyen'}),'-o',f],check=True)
    else:
      global V
      if 'V' not in globals():
        from vieneu import Vieneu; V=Vieneu()
      V.save(V.infer(t,voice='Hải Đăng',style='doc_truyen'),f)
  w=wave.open(f);sr=w.getframerate();x=np.frombuffer(w.readframes(w.getnframes()),np.int16)
  nz=np.where(np.abs(x)>=300)[0];x=x[nz[0]:nz[-1]+1] if len(nz) else x
  segs.append(x)
gap=np.zeros(int(sr*.32),np.int16);T=[];pos=0;buf=[]
for x in segs:
  T.append([round(pos/sr,3),round((pos+len(x))/sr,3)]);buf+= [x,gap];pos+=len(x)+len(gap)
y=np.concatenate(buf);w=wave.open(f'{out}/tmp/raw.wav','wb');w.setnchannels(1);w.setsampwidth(2);w.setframerate(sr);w.writeframes(y.tobytes());w.close()
subprocess.run(['ffmpeg','-y','-loglevel','error','-i',f'{out}/tmp/raw.wav','-af','atempo=1.15',f'{out}/voice.wav'],check=True)
json.dump(T,open(f'{out}/timeline.json','w'));print(len(T),'lines',round(pos/sr/1.15,1),'s')
