import numpy as np,scipy.io.wavfile as w,scipy.signal as sg
sr=48000;D=40.5;N=int(D*sr)
_,v=w.read('public/xg/voice.wav');v=v.astype(np.float32)/32768
out=np.zeros(N,np.float32);vo=np.zeros(N,np.float32);vo[:len(v)]=v[:N]
R=np.random.default_rng(1)
def add(x,t,g=1):
  i=int(t*sr);x=x[:N-i];out[i:i+len(x)]+=x*g
def env(n,a,d):e=np.ones(n);ai=int(a*sr);e[:ai]=np.linspace(0,1,ai);e[ai:]=np.exp(-np.arange(n-ai)/(d*sr));return e
def whoosh(L=.6):
  n=int(L*sr);x=R.standard_normal(n);b,a=sg.butter(2,[400/(sr/2),3000/(sr/2)],'band');x=sg.lfilter(b,a,x);return x*np.sin(np.linspace(0,np.pi,n))**2*.5
def boom():
  n=int(1.2*sr);tt=np.arange(n)/sr;f=np.linspace(60,32,n);return np.sin(2*np.pi*np.cumsum(f)/sr)*env(n,.005,.35)*.9
def pop():
  n=int(.12*sr);tt=np.arange(n)/sr;return np.sin(2*np.pi*(900-3000*tt)*tt)*env(n,.002,.03)*.5
def thud():
  n=int(.3*sr);tt=np.arange(n)/sr;return (np.sin(2*np.pi*90*tt)+.3*R.standard_normal(n)*np.exp(-tt*60))*env(n,.002,.06)*.8
def tick():
  n=int(.03*sr);tt=np.arange(n)/sr;return np.sin(2*np.pi*2200*tt)*env(n,.001,.006)*.3
def paper(L=.5):
  n=int(L*sr);x=R.standard_normal(n);b,a=sg.butter(2,2500/(sr/2),'high');return sg.lfilter(b,a,x)*np.sin(np.linspace(0,np.pi,n))*.25
def marker(L=.6):
  n=int(L*sr);x=R.standard_normal(n);b,a=sg.butter(2,3000/(sr/2),'high');x=sg.lfilter(b,a,x);return x*(.6+.4*np.sin(2*np.pi*3.2*np.arange(n)/sr))*np.sin(np.linspace(0,np.pi,n))*.18
add(thud(),1.45);add(whoosh(1.2),1.5,.6)
add(pop(),2.75);add(pop(),4.0)
add(whoosh(.8),5.3,.9);add(boom(),6.0)
for k in range(14): add(tick(),6.9+k/22)
add(pop(),8.0);add(marker(),8.3)
add(whoosh(.9),10.1);add(paper(),10.2)
add(pop(),11.2);add(marker(),14.6);add(marker(),15.6)
for i in range(3): add(pop(),17.0+i*.15)
add(whoosh(1.1),19.1,.7);add(boom(),20.6,.8);add(pop(),20.6)
for k in range(12): add(tick(),23.0+k*.1)
add(whoosh(1.0),25.6);add(paper(.8),26.0)
for i in range(46): add(pop()*.35,26.9+i*.06)
add(paper(.6),28.3);add(marker(.7),29.3);add(pop(),30.0)
add(whoosh(.8),32.4,.9);add(boom(),33.1,.7)
# lo-fi bed: soft chords 80bpm
tt=np.arange(N)/sr;bed=np.zeros(N)
ch=[[220,277,330],[196,247,294],[175,220,262],[196,247,294]];bt=60/80
for j in range(int(D/(bt*4))+1):
  s=int(j*bt*4*sr);n=min(int(bt*4*sr),N-s)
  if n<=0:break
  for fq in ch[j%4]:bed[s:s+n]+=np.sin(2*np.pi*fq*tt[:n])*np.exp(-tt[:n]*.6)*.05
kick=np.zeros(N)
for k in range(int(D/bt)):
  s=int(k*bt*sr);n=min(int(.2*sr),N-s);kick[s:s+n]+=np.sin(2*np.pi*55*tt[:n])*np.exp(-tt[:n]*25)*.12
bed+=kick
e=np.convolve(np.abs(vo),np.ones(4800)/4800,'same');duck=1-.55*np.clip(e/.05,0,1)
bed*=duck;bed*=np.clip((D-tt)/1.5,0,1)
mix=vo*1.5+out*.45+bed
mix/=max(1,np.abs(mix).max()/0.95)
w.write('/tmp/xg_raw.wav',sr,(mix*32767).astype(np.int16))
