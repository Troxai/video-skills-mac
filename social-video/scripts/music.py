# Original score for the FPT board video: A minor, 110 bpm, builds per chapter,
# risers into every camera move, impacts on arrivals, ducked under the voice.
"""Original score + voice mix for a board episode.
usage: music.py episode.json voice_dir music_out.wav mix_out.wav
episode.json: {"lines":[{"id":"n1","dur":7.04},...], "gap":0.25, "outro":1.8,
               "hits":[5.75], "ticks":[1.6,7.6], "calm":[[50.1,66.0]]}   (seconds)"""
import numpy as np, wave, sys, json
E=json.load(open(sys.argv[1])); VD=sys.argv[2]
VOICES=[l['id'] for l in E['lines']]; durs=[l['dur']+E.get('gap',0.25) for l in E['lines']]
starts=[sum(durs[:i]) for i in range(len(durs))]
T=sum(durs)+E.get('outro',1.8)
sr=44100; N=int(sr*T); t=np.arange(N)/sr
bpm=110; beat=60/bpm; bar=4*beat
def mtof(m): return 440*2**((m-69)/12)
rng=np.random.default_rng(7)
def add(buf,i,x):
    i=int(i); 
    if i>=N: return
    n=min(len(x),N-i); buf[i:i+n]+=x[:n]
def env_ad(n,a,d): 
    e=np.ones(n); na=max(1,int(a*sr)); e[:na]=np.linspace(0,1,na); e*=np.exp(-np.arange(n)/sr/d) ; return e
prog=[[57,60,64],[53,57,60],[48,52,55],[55,59,62]]  # Am F C G
CALM=E.get('calm',[])
intensity=lambda s: 0.6 if any(a<=s<b for a,b in CALM) else (0.55 if s<starts[1] else (0.8 if s<T*0.3 else 1.0))
pad=np.zeros(N); bass=np.zeros(N); arp=np.zeros(N); drums=np.zeros(N); fx=np.zeros(N)
nb=int(T/bar)+1
for b in range(nb):
    ch=prog[b%4]; s0=b*bar; i0=int(s0*sr); n=int(bar*sr)
    tt=np.arange(n)/sr; e=np.minimum(1,tt/0.4)*np.minimum(1,(bar-tt)/0.4)
    for m in ch:  # warm detuned pad
        f=mtof(m); x=sum(np.sin(2*np.pi*f*(1+d)*tt+ph) for d,ph in [(-0.004,0),(0.004,1.3),(0,2.1)])/3
        add(pad,i0,x*e*0.16)
    for k in range(8):  # eighth-note sub bass on the root, octave jump on the 'and' of 4
        m=ch[0]-24+(12 if k==7 else 0); s=s0+k*beat/2; nn=int(beat/2*sr*0.9); tt2=np.arange(nn)/sr
        x=np.sin(2*np.pi*mtof(m)*tt2)+0.3*np.sin(2*np.pi*2*mtof(m)*tt2)
        add(bass,s*sr,x*env_ad(nn,0.005,0.18)*0.5)
    if s0>=starts[1]:  # 16th-note pluck arpeggio once the story starts
        pat=[0,1,2,1,0,2,1,2]*2
        for k in range(16):
            m=ch[pat[k]]+12; s=s0+k*beat/4; nn=int(0.16*sr); tt2=np.arange(nn)/sr
            x=sum(np.sin(2*np.pi*mtof(m)*h*tt2)/h for h in (1,2,3,4))
            add(arp,s*sr,x*env_ad(nn,0.002,0.05)*0.12*(1.0 if k%4==0 else 0.7))
# drums
nbeats=int(T/beat)
for k in range(nbeats):
    s=k*beat; I=intensity(s)
    if s>T-3: break
    nn=int(0.3*sr); tt2=np.arange(nn)/sr
    kick=np.sin(2*np.pi*(45+90*np.exp(-tt2*40))*tt2)*np.exp(-tt2*9)
    add(drums,s*sr,kick*0.8*I)
    if s>=starts[1] and k%2==1:  # clap on 2 and 4
        nn=int(0.2*sr); x=rng.standard_normal(nn); x=np.convolve(x,[1,-0.9],'same')
        add(drums,s*sr,x*np.exp(-np.arange(nn)/sr*22)*0.22*I)
    for h in range(4 if s>=starts[min(2,len(starts)-1)] else 2):  # hats
        nn=int(0.04*sr); x=np.diff(rng.standard_normal(nn+1))
        add(drums,(s+h*beat/(4 if s>=starts[min(2,len(starts)-1)] else 2))*sr,x*np.exp(-np.arange(nn)/sr*120)*0.07*I*(1.2 if h%2 else 0.8))
# sidechain pump from kicks on pad/bass/arp
pump=np.ones(N)
for k in range(nbeats):
    i=int(k*beat*sr); n=int(0.25*sr)
    if i+n<N: pump[i:i+n]=np.minimum(pump[i:i+n],0.45+0.55*np.linspace(0,1,n)**1.5)
# risers into each move + impacts on arrival + big hits on the two 55% moments
for s in starts[1:]:
    n=int(0.9*sr); u=np.linspace(0,1,n); x=rng.standard_normal(n)
    # crude rising band: blend smoothed and raw noise as it rises
    sm=np.convolve(x,np.ones(30)/30,'same'); r=(sm*(1-u)+x*u*0.35)*u**2
    add(fx,(s-0.85)*sr,r*0.5)
    nn=int(0.5*sr); tt2=np.arange(nn)/sr
    add(fx,s*sr,np.sin(2*np.pi*(38+60*np.exp(-tt2*25))*tt2)*np.exp(-tt2*5)*0.6)
for s in E.get('hits',[]):
    nn=int(1.2*sr); tt2=np.arange(nn)/sr
    add(fx,s*sr,(np.sin(2*np.pi*(32+120*np.exp(-tt2*18))*tt2)*np.exp(-tt2*3)*0.9+rng.standard_normal(nn)*np.exp(-tt2*14)*0.25))
    # brief tape-stop of the music right before the hit
    i=int((s-0.25)*sr); j=int(s*sr); pump[i:j]*=np.linspace(1,0.15,j-i); k2=int((s+0.6)*sr); pump[j:k2]*=np.linspace(0.15,1,k2-j)
for s in E.get('ticks',[]):
    nn=int(0.12*sr); tt2=np.arange(nn)/sr
    add(fx,(s+0.7)*sr,(np.sin(2*np.pi*1760*tt2)+0.5*np.sin(2*np.pi*2637*tt2))*np.exp(-tt2*40)*0.12)
music=(pad+bass+arp)*pump+drums
music*=np.minimum(1,np.minimum(t/1.2,(T-t)/2.5))
# duck music under the voice
vo=np.zeros(N)
for i,s in enumerate(starts):
    w=wave.open(f'{VD}/{VOICES[i]}.wav'); a=np.frombuffer(w.readframes(w.getnframes()),np.int16).astype(float)/32768
    if w.getnchannels()==2: a=a[::2]
    r=w.getframerate()
    if r!=sr: a=np.interp(np.arange(int(len(a)*sr/r))*r/sr,np.arange(len(a)),a)
    add(vo,s*sr,a)
env=np.abs(vo); k=int(0.15*sr); env=np.convolve(env,np.ones(k)/k,'same'); env=env/ (env.max()+1e-9)
duck=1-0.55*np.clip(env*4,0,1)
mus=music*duck+fx*0.9
mus=mus/np.max(np.abs(mus))*0.6
mix=mus+vo*1.0
mix=np.tanh(mix*1.1)/np.tanh(1.1)
def save(path,x):
    w=wave.open(path,'wb'); w.setnchannels(1); w.setsampwidth(2); w.setframerate(sr); w.writeframes((np.clip(x,-1,1)*32767).astype(np.int16).tobytes()); w.close()
save(sys.argv[3],mus); save(sys.argv[4],mix)
json.dump({'starts':[round(x,3) for x in starts],'LINES':[round(d,2) for d in durs],'total':round(T,2)},open(sys.argv[1].replace('.json','.starts.json'),'w'))
print('ok')
