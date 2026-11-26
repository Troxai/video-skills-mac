import numpy as np,scipy.io.wavfile as w,scipy.signal as sg
sr=48000;D=34;N=int(D*sr)
_,v=w.read('public/mu/voice_tac.wav');v=v.astype(np.float32)/32768
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

T=[[0.0, 3.695652173913044], [4.043478260869565, 5.530434782608697], [5.878260869565218, 11.200000000000001], [11.547826086956523, 12.869565217391306], [13.217391304347826, 16.02608695652174], [16.37391304347826, 18.617391304347827], [18.96521739130435, 22.513043478260872], [22.860869565217392, 27.286956521739132], [27.634782608695655, 30.973913043478262]]

def r(i,f=0): return T[i][0]+(T[i][1]-T[i][0])*f
add(boom(),0.1,.6)
for k in range(22): add(pop()*.35,r(1,0)+k*0.04)
add(whoosh(.8),r(2,0.1),.7)
add(whoosh(.6),r(3,0),.9);add(thud(),r(3,0.75),.7)
add(marker(.6),r(4,0.1),.8)
add(thud(),r(5,0.05),.5);add(thud(),r(5,0.35),.5);add(pop(),r(5,0.55),.8)
add(whoosh(.9),r(6,0.0),.8);add(whoosh(.5),r(6,0.62),1.0);add(boom(),r(6,0.75),.9)
for k in [0.2,0.5,0.75]: add(pop(),r(7,k),.7)
add(boom(),r(8,0.05),.5)
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
w.write('/tmp/mut_raw.wav',sr,(mix*32767).astype(np.int16))
