import numpy as np,scipy.io.wavfile as w,scipy.signal as sg
sr=48000;D=172;N=int(D*sr)
_,v=w.read('public/mu/voice_long_fast.wav');v=v.astype(np.float32)/32768
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

T=[[0.0, 1.8608695652173917], [2.139130434782609, 5.078260869565217], [5.356521739130435, 9.295652173913044], [9.573913043478262, 11.147826086956522], [11.42608695652174, 15.11304347826087], [15.391304347826088, 20.07826086956522], [20.356521739130436, 22.808695652173917], [23.086956521739133, 24.878260869565217], [25.156521739130437, 26.85217391304348], [27.1304347826087, 31.147826086956524], [31.426086956521743, 34.51304347826087], [34.791304347826085, 36.61739130434783], [36.89565217391305, 39.286956521739135], [39.56521739130435, 41.95652173913044], [42.23478260869565, 48.46086956521739], [48.73913043478261, 49.800000000000004], [50.07826086956523, 53.09565217391305], [53.37391304347827, 57.8608695652174], [58.139130434782615, 60.88695652173913], [61.16521739130435, 64.05217391304348], [64.3304347826087, 66.38260869565218], [66.6608695652174, 69.13913043478261], [69.41739130434783, 70.70434782608696], [70.98260869565217, 74.47826086956523], [74.75652173913043, 78.62608695652175], [78.90434782608696, 83.44347826086957], [83.72173913043478, 87.65217391304348], [87.9304347826087, 90.83478260869565], [91.11304347826088, 95.97391304347828], [96.25217391304348, 100.3304347826087], [100.60869565217392, 101.90434782608696], [102.18260869565219, 105.49565217391304], [105.77391304347827, 108.20869565217392], [108.48695652173915, 114.14782608695654], [114.42608695652176, 118.73913043478262], [119.01739130434784, 121.47826086956522], [121.75652173913045, 124.10434782608696], [124.38260869565218, 129.30434782608697], [129.5826086956522, 133.82608695652175], [134.10434782608698, 138.9217391304348], [139.20000000000002, 144.00869565217394], [144.28695652173914, 150.7217391304348], [151.00000000000003, 153.70434782608697], [153.9826086956522, 156.64347826086956], [156.92173913043482, 160.5130434782609], [160.7913043478261, 162.63478260869567], [162.91304347826087, 165.7913043478261]]
SH=[(0, 'cut'), (1, 'left'), (2, 'up'), (4, 'left'), (5, 'left'), (8, 'left'), (10, 'up'), (12, 'left'), (14, 'left'), (15, 'left'), (21, 'left'), (22, 'zoom'), (23, 'left'), (27, 'left'), (28, 'left'), (30, 'left'), (31, 'zoom'), (33, 'left'), (35, 'left'), (36, 'left'), (37, 'zoom'), (39, 'left'), (40, 'left'), (41, 'left'), (42, 'up'), (43, 'left'), (44, 'left'), (46, 'left')]

def creak():
  n=int(.45*sr);tt=np.arange(n)/sr;return np.sign(np.sin(2*np.pi*(18+10*np.sin(tt*9))*tt))*R.standard_normal(n)*.15*np.sin(np.linspace(0,np.pi,n))
def r(i,f=0): return T[i][0]+(T[i][1]-T[i][0])*f
for i,k in SH:
  a=0 if i==0 else T[i][0]-0.12
  if k in('left','up'): add(whoosh(.6),a-0.45,1.0)
  elif k=='zoom': add(whoosh(.7),a-0.6,1.0);add(boom(),a,.45)
  else: add(thud(),a,.6)
for i in range(len(T)): add(pop(),r(i,0.15),.5)
add(boom(),0.6,.9);add(boom(),r(1,0.45),.6)
for f in [0.02,0.17,0.33,0.5,0.66,0.82]: add(thud(),r(6,f)+0.4,.8);add(creak(),r(6,f),.6)
for k in range(6): add(thud(),r(43,0)+1.0+k*0.25+0.4,.8)
add(creak(),r(4,0)+1.0,1);add(creak(),r(4,0)+1.6,.8);add(creak(),r(44,0.5),1);add(creak(),r(44,0.7),.9)
for i in [16,17,18,19]: add(thud(),r(i,0.3),.6)
add(boom(),r(17,0.5),.5);add(boom(),r(20,0.2),.6)
add(boom(),r(13,0.45),.5);add(thud(),r(27,0.6),.8)
for k in range(12): add(tick(),r(38,0.5)+k*.06)
for a in [r(9,0.1),r(9,0.55),r(25,0.45),r(26,0.2),r(32,0.1),r(33,0)+0.4]: add(paper(.45),a,.9)
for a in [r(24,0.55),r(28,0.6),r(29,0.45),r(32,0.4),r(40,0.7),r(45,0.4)]: add(marker(.6),a,.8)
add(whoosh(.8),D-3.4,1.0);add(boom(),D-3.0,.8);add(pop(),D-2.2,.8)
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
w.write('/tmp/mul_raw.wav',sr,(mix*32767).astype(np.int16))
