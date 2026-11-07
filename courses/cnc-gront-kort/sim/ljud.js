/* Kursbibliotek CNC – ljud för simulatorerna
   Skärljudet är inspelningar per verktygsgrupp i mappen ljud/ bredvid den här filen
   (ljud/<grupp>.ogg eller .mp3). ljud/ljud.json anger inspelningens varvtal och antal skär,
   och uppspelningstakten följer tandingreppsfrekvensen S × z / 60.
   Spindelns brum, servot vid snabbtransport och skärvätskan syntetiseras med Web Audio.
   Ljudet är alltid av när sidan öppnas och tystnar när man byter flik.

   Användning:
     CNCLJUD.knapp(behållare)            lägger in ljudknapp och volymreglage
     CNCLJUD.update({spin, S, z, grupp, cut, cool, rapid})   varje bildruta
       spin  true när spindeln går, S = varvtal, z = antal skär,
       grupp = 'pinnfras' | 'planfras' | 'borr' | 'gangtapp' | 'urborr' | 'gravyr' | 'skivfras' (eller verktygstyp, se grupp()),
       cut   0–1 hur mycket som skärs just nu, cool = skärvätska på, rapid = snabbtransport
     CNCLJUD.klonk()                     verktygsbyte
     CNCLJUD.grupp(typ)                  verktygstyp (Spånlex koder) → ljudgrupp */
(function(){
'use strict';
const BASE=(()=>{const s=document.currentScript&&document.currentScript.src;return s?s.replace(/[^/]*$/,'')+'ljud/':'ljud/';})();
const GROUPS={face:'planfras',shell:'planfras',shoulder:'planfras',hfm:'planfras',em:'pinnfras',em2:'pinnfras',crad:'pinnfras',ball:'pinnfras',rough:'pinnfras',
  lolli:'pinnfras',dove:'pinnfras',tslot:'pinnfras',thread:'pinnfras',cham:'pinnfras',drill:'borr',spot:'borr',csink:'borr',cbore:'borr',reamer:'borr',
  tap:'gangtapp',boring:'urborr',vbit:'gravyr',saw:'skivfras'};
let META={planfras:{rpm:1560,z:6},pinnfras:{rpm:8000,z:3},borr:{rpm:3000,z:2},gangtapp:{rpm:800,z:4},urborr:{rpm:1200,z:1},gravyr:{rpm:12000,z:1},skivfras:{rpm:500,z:48}};
let metaLoaded=false;
const P={on:false,volume:.5,tempo:1.5};
try{const v=JSON.parse(localStorage.getItem('kc-sim-ljud')||'{}');if(v.volume!=null)P.volume=v.volume;}catch(e){}
const save=()=>{try{localStorage.setItem('kc-sim-ljud',JSON.stringify({volume:P.volume}));}catch(e){}};
const S={c:null,grp:{}};
let lastMeta=null;

function init(){
  if(S.c)return;const AC=window.AudioContext||window.webkitAudioContext;if(!AC)return;
  try{
    const c=new AC();S.c=c;const m=c.createGain();m.gain.value=0;m.connect(c.destination);S.m=m;
    const nb=c.createBuffer(1,c.sampleRate*2,c.sampleRate),d=nb.getChannelData(0);for(let i=0;i<d.length;i++)d[i]=Math.random()*2-1;S.nb=nb;
    const noise=()=>{const s=c.createBufferSource();s.buffer=nb;s.loop=true;s.start();return s;};
    const osc=(type,f)=>{const o=c.createOscillator();o.type=type;o.frequency.value=f;const g=c.createGain();g.gain.value=0;o.connect(g);o.start();return {o,g};};
    const lp=c.createBiquadFilter();lp.type='lowpass';lp.frequency.value=600;lp.connect(m);
    S.sp=osc('sawtooth',100);S.sp.g.connect(lp);S.sp2=osc('sine',200);S.sp2.g.connect(m);
    const hp=c.createBiquadFilter();hp.type='highpass';hp.frequency.value=2800;const gC=c.createGain();gC.gain.value=0;noise().connect(hp);hp.connect(gC);gC.connect(m);S.gC=gC;
    const bp=c.createBiquadFilter();bp.type='bandpass';bp.Q.value=.9;bp.frequency.value=2500;const gN=c.createGain();gN.gain.value=0;noise().connect(bp);bp.connect(gN);gN.connect(m);S.bp=bp;S.gN=gN;
    S.sv=osc('sine',220);S.sv.g.connect(m);
  }catch(e){S.c=null;}
  if(!metaLoaded){metaLoaded=true;fetch(BASE+'ljud.json').then(r=>r.ok?r.json():null).then(j=>{if(j)Object.assign(META,j);}).catch(()=>{});}
}
function resume(){init();if(S.c&&S.c.state==='suspended')S.c.resume().catch(()=>{});}
const tgt=(p,v,t)=>p.setTargetAtTime(v,S.c.currentTime,t||.08);
function ensure(g){
  if(!S.c||S.grp[g])return;const G=S.grp[g]={loading:true};
  (async()=>{for(const ext of ['ogg','mp3']){try{
    const r=await fetch(BASE+g+'.'+ext);if(!r.ok)continue;const buf=await S.c.decodeAudioData(await r.arrayBuffer());
    const s=S.c.createBufferSource();s.buffer=buf;s.loop=true;const gn=S.c.createGain();gn.gain.value=0;s.connect(gn);gn.connect(S.m);s.start();G.src=s;G.g=gn;G.loading=false;return;
  }catch(e){}}G.loading=false;})();
}
function grupp(typ){return META[typ]?typ:(GROUPS[typ]||'pinnfras');}
function update(m){
  if(!S.c)return;
  tgt(S.m.gain,P.on?P.volume:0,.15);if(!P.on)return;
  m=m||{};const on=!!m.spin&&m.S>0,Sv=m.S||0,z=m.z||3,f0=Math.max(15,Sv/60),ft=Math.max(30,Sv*z/60),cut=on?Math.max(0,Math.min(1,m.cut||0)):0;
  tgt(S.sp.o.frequency,on?f0:Math.max(5,S.sp.o.frequency.value*.6),on?.25:.9);tgt(S.sp.g.gain,on?.10:0,on?.3:.9);
  tgt(S.sp2.o.frequency,f0*2);tgt(S.sp2.g.gain,on?.03:0,.4);
  const g=m.grupp?grupp(m.grupp):null;if(g)ensure(g);const gb=g&&S.grp[g]&&S.grp[g].src?S.grp[g]:null;
  tgt(S.bp.frequency,Math.min(7000,Math.max(700,ft*2.5)));tgt(S.gN.gain,gb?0:.10*cut,.05);   // brus om inspelningen saknas
  Object.entries(S.grp).forEach(([k,G])=>{if(!G.src)return;const act=k===g;tgt(G.g.gain,act?(.25+.95*cut)*cut*1.1:0,act?.06:.12);
    if(act&&Sv){const M=META[k]||{rpm:3000,z:2};tgt(G.src.playbackRate,Math.max(.45,Math.min(3.5,(Sv*z)/(M.rpm*M.z)*P.tempo)),.25);}});
  tgt(S.gC.gain,m.cool&&on?.035:0,.2);
  tgt(S.sv.o.frequency,m.rapid?380:220,.2);tgt(S.sv.g.gain,m.rapid?.03:0,.1);
}
function klonk(){
  if(!S.c||!P.on)return;const c=S.c,t=c.currentTime,s=c.createBufferSource();s.buffer=S.nb;const f=c.createBiquadFilter();f.type='lowpass';f.frequency.value=700;
  const g=c.createGain();g.gain.setValueAtTime(.0001,t);g.gain.exponentialRampToValueAtTime(.5,t+.01);g.gain.exponentialRampToValueAtTime(.0001,t+.35);
  s.connect(f);f.connect(g);g.connect(S.m);s.start(t);s.stop(t+.4);
}
function tyst(){if(S.c&&S.m){try{S.m.gain.cancelScheduledValues(S.c.currentTime);S.m.gain.setTargetAtTime(0,S.c.currentTime,.03);}catch(e){}}}
function setOn(v){P.on=!!v;if(P.on)resume();else tyst();ui();}
const knappar=[];
function ui(){knappar.forEach(({b,v})=>{b.textContent=P.on?'🔊 Ljud':'🔇 Ljud';b.setAttribute('aria-pressed',P.on?'true':'false');v.value=Math.round(P.volume*100);v.disabled=!P.on;});}
function knapp(host,cls){
  if(!host)return;
  const b=document.createElement('button');b.type='button';b.className=cls||'';b.title='Ljud av eller på';
  const v=document.createElement('input');v.type='range';v.min=0;v.max=100;v.step=5;v.title='Volym';v.setAttribute('aria-label','Volym');v.style.width='80px';v.style.verticalAlign='middle';
  b.onclick=()=>setOn(!P.on);v.oninput=()=>{P.volume=+v.value/100;save();};
  host.appendChild(b);host.appendChild(v);knappar.push({b,v});ui();
}
document.addEventListener('visibilitychange',()=>{if(document.hidden)tyst();});
addEventListener('pagehide',tyst);
window.CNCLJUD={knapp,update,klonk,grupp,setOn,get on(){return P.on;}};
})();
