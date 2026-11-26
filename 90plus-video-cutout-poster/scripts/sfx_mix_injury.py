import numpy as np,scipy.io.wavfile as w,scipy.signal as sg
sr=48000;D=35;N=int(D*sr)
_,v=w.read('public/mu/voice_inj.wav');v=v.astype(np.float32)/32768
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

T=[[0.0, 2.8434782608695652], [3.191304347826087, 4.208695652173914], [4.556521739130435, 9.582608695652175], [9.930434782608696, 12.382608695652175], [12.730434782608697, 14.504347826086958], [14.852173913043478, 16.956521739130437], [17.31304347826087, 20.408695652173915], [20.756521739130438, 26.36521739130435], [26.71304347826087, 29.660869565217393], [30.008695652173913, 32.139130434782615]]

def r(i,f=0): return T[i][0]+(T[i][1]-T[i][0])*f
add(thud(),0.1,.9);add(boom(),0.15,.5)
add(pop(),r(1,0),.8)
for i in [2,4,5,7,8,9]: add(whoosh(.6),r(i,0)-0.55,.9)
add(paper(.5),r(2,0)+0.1,.8);add(pop(),r(2,0.55),.8);add(pop(),r(3,0.2),.8)
add(pop(),r(4,0)+0.1,.8);add(marker(.8),r(4,0)+0.6,.8)
add(marker(.6),r(5,0.3),.8);add(marker(.6),r(6,0.15),.8);add(marker(.6),r(6,0.55),.8)
add(marker(.8),r(7,0)-0.1,.8);add(boom(),r(7,0)+0.5,.6);add(thud(),r(7,0.25),.7)
for k in range(12): add(tick(),r(8,0)+0.1+k*0.08)
add(boom(),r(8,0)+0.1,.5);add(pop(),r(9,0),.7)
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
w.write('/tmp/mui_raw.wav',sr,(mix*32767).astype(np.int16))
