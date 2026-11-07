/* Kursbibliotek CNC – gemensam fysik för simulatorerna (porterad från Spånlex).
   Används av courses/cnc-gront-kort/sim/hass-fras.html och kan användas av fler simulatorer.
   Kräver assets/sim/material.js (window.SPANLEX_MATERIAL) före den här filen.

   Effekten räknas ur den volym som verkligen fräses bort: Pc = kc · Q.
   kc = kc1 · hm^-mc (Kienzle, värden enligt ISCAR/Sandvik), hm ur fz och ingreppet.
   Brott: pinnfräsar som balk (σ = 32·F·L/(π·d³), d ≈ 0,75·D), vändskär mot hex och ap max,
   borrar mot vridmoment. Värme: en del av effekten går in i ämnet och svalnar med tiden;
   stål får anlöpningsfärger efter högsta temperaturen.
   Värdena är riktvärden för undervisning. */
(function(){
'use strict';
const LIB=()=>(window.SPANLEX_MATERIAL&&window.SPANLEX_MATERIAL.materials)||[];
const FALLBACK={id:'en-aw-6082',kat:'Aluminium',typ:'Aluminiumlegering',EN:{namn:'EN AW-6082'},base:'al',kc1:700,mc:.25,rho:2.7e-6,c:900,a:70,
  steel:false,bue:true,fz:1,vc:{mill:[200,800],face:[300,1000],spot:[60,250],drill:[100,300],tap:[15,40],ream:[20,80],bore:[150,600]}};
function materials(){return LIB();}
function material(id){const L=LIB();return L.find(m=>m.id===id)||L.find(m=>m.id==='en-aw-6082')||FALLBACK;}
function matName(m){return (m.EN&&m.EN.namn)||m.typ||m.id;}

/* verktygstyper (Spånlex koder) */
const PSOLID=new Set(['em','em2','ball','crad','rough','neck','taper','form','lolli','cround','thread','tslot','dove','woodruff','cham','deburr']);
const PHSS=new Set(['rough','tslot','dove','woodruff','saw','tap','drill']);
const PINS={face:{k:45,hex:.30,ap:6},shell:{k:90,hex:.25,ap:6},shoulder:{k:90,hex:.25,ap:5.5},hfm:{k:15,hex:.30,ap:1.2}};
const PDRILL={drill:59,spot:45,csink:45,cbore:90,reamer:45};
const famOf=t=>({face:'face',shell:'face',spot:'spot',drill:'drill',tap:'tap',reamer:'ream',boring:'bore',cbore:'drill',csink:'spot'}[t]||'mill');
/* antal skär efter diameter (Sandvik Coromant m.fl.), [största diameter, z] */
const ZT={em:[[15.9,3],[25,4],[1e9,5]],face:[[50,4],[63,5],[80,6],[100,7],[125,8],[160,10],[200,12],[1e9,14]],tap:[[16,3],[1e9,4]],cham:[[1e9,4]]};
function flutes(type,D){if(type==='drill'||type==='spot')return 2;const T=ZT[type]||ZT.em;for(const [d,z] of T)if(D<=d)return z;return 3;}
/* hur långt verktyget sticker ut ur hållaren (uppskattning efter typ) */
function stick(type,D,L){if(PSOLID.has(type))return (L||Math.max(12,D*2.5))+D*.5;return D*3;}

const nf=v=>String(v).replace('.',',');
const nf0=v=>nf(Math.round(v)),nf1=v=>nf(Math.round(v*10)/10);
const cap=s=>s?s[0].toUpperCase()+s.slice(1):s;

/* En bit av en skärande rörelse.
   p = {type, D, z, n (varv/min), vf (mm/min), dv (mm³), seg (mm), ap (mm), axial, cool, mat (materialobjekt),
        stickL, mach:{kw,nm}}
   Svar: {F, Mc, Pc, load, vc, fz, hm, hex, ap, ae, lim, why, warn:[{k,ty,msg}], heatFrac} */
function cut(p){
  const M=p.mat||FALLBACK,type=p.type,D=p.D,z=p.z||flutes(type,D),n=Math.max(1,p.n),vf=Math.max(1,p.vf);
  const seg=Math.max(1e-6,p.seg),dt=seg/vf*60,Q=p.dv/dt;              // mm³/s
  const vc=Math.PI*D*n/1000,fz=vf/(n*z);
  let hm,hex,ap=Math.max(.01,p.ap),ae=0;
  if(p.axial||PDRILL[type]){const k=(PDRILL[type]||59)*Math.PI/180,fr=vf/n;hex=hm=Math.max(.001,fr/2*Math.sin(k));ap=D/2;}
  else{
    ae=Math.min(D,Math.max(.01,p.dv/seg/ap));
    const r=ae/D,kr=((PINS[type]||{}).k||90)*Math.PI/180,phi=Math.acos(1-2*Math.min(1,r));
    // medelspåntjocklek över ingreppsvinkeln φ: hm = sin κ · fz · (1 − cos φ)/φ; största: hex = sin κ · fz · sin(min(φ, 90°))
    hm=Math.sin(kr)*fz*(1-Math.cos(phi))/Math.max(1e-6,phi);hex=Math.sin(kr)*fz*Math.sin(Math.min(phi,Math.PI/2));
  }
  hm=Math.max(.001,hm);
  const kc=M.kc1*Math.pow(hm,-M.mc),Pc=kc*Q/1e6;                      // kW
  const Mc=Pc*1000/(2*Math.PI*n/60);                                   // Nm
  const Ft=2000*Mc/D;                                                  // N, medel tangentiellt
  let load=0,why='',lim='';
  if(PINS[type]){
    const I=PINS[type],apm=type==='shoulder'&&D>=40?10:type==='hfm'&&D>=32?2:I.ap;
    const a=hex/I.hex,b=p.axial?0:(ap>apm?ap/apm:.5*ap/apm);load=Math.max(a,b);
    why=a>=b?`spåntjockleken h<sub>ex</sub> ${nf(Math.round(hex*1000)/1000)} mm (skäret tål ungefär ${nf(I.hex)} mm)`
            :`skärdjupet ${nf1(ap)} mm (skärets längd räcker till ungefär ${nf1(apm)} mm)`;lim='skäret';
  }else if(PDRILL[type]||p.axial){
    const Mlim=(PHSS.has(type)?.035:.06)*D*D*D;load=Mc/Mlim;
    why=`vridmomentet ${nf1(Mc)} Nm (verktyget tål ungefär ${nf1(Mlim)} Nm)`;lim=type==='drill'?'borren':'verktyget';
  }else{
    const L=Math.max(D,stick(type,D,p.stickL)-ap/2),de=.75*D,F=Math.max(Ft,kc*ap*hex)*1.15,sig=32*F*L/(Math.PI*de*de*de),slim=PHSS.has(type)?2500:2200;
    load=sig/slim;
    why=`böjspänningen ${nf0(sig)} MPa av ungefär ${nf0(F)} N skärkraft på ${nf0(L)} mm utstick (${PHSS.has(type)?'snabbstål':'hårdmetall'} tål omkring ${slim} MPa)`;lim='fräsen';
  }
  const warn=[],W=(k,ty,msg)=>warn.push({k,ty,msg});
  const mach=p.mach||{kw:22.4,nm:122};
  if(load>=.75&&load<1)W('hi','w',`Hög belastning (${Math.round(load*100)} %): ${why}. Nära gränsen.`);
  if(Pc>mach.kw)W('kw','e',`Spindeln orkar inte: ${nf1(Pc)} kW behövs, maskinen har ${nf1(mach.kw)} kW. Minska skärdjup, ingrepp eller matning.`);
  else if(Mc>mach.nm)W('nm','e',`Spindelns vridmoment räcker inte: ${nf0(Mc)} Nm behövs vid S${Math.round(n)}, maskinen ger ${nf0(mach.nm)} Nm. Höj varvtalet eller minska ingreppet.`);
  // små skivor (verktyget går in i ett redan fräst spår, rutnätets upplösning) räknas inte som gnidning
  const rub=hm<.004&&['em','em2','crad','rough','neck'].includes(type)&&!p.axial&&ae>=Math.max(.15,.03*D);
  if(rub)
    W('rub','w',`Matningen är för låg (spåntjocklek ${(Math.round(hm*1000)/1000).toFixed(3).replace('.',',')} mm): verktyget gnider i stället för att skära. Det blir varmt, ytan blir sämre${M.tsoft?' och plasten kan smälta':M.steel?' och materialet kan deformationshärdna':''}. Öka matningen.`);
  const fam=famOf(type),rg=(M.vc&&M.vc[fam])||[50,300];
  let frac=p.cool?.05:.16;if(vc>rg[1])frac*=1+(vc/rg[1]-1)*3;if(hm<.008)frac*=2;
  // gnidning: eggen plöjer och glider i stället för att skära. Friktionen (μ ≈ 0,6 mot en normalkraft på cirka 200 N per mm
  // skärdjup) blir värme i ämnet, eftersom ingen spån tar med sig den. Värmen läggs till som en del av heatFrac (E = Pc · heatFrac).
  if(rub){const Prub=.6*200*Math.max(ap,.2)*vc/60/1000;frac+=Prub/Math.max(Pc,1e-6);}
  if((fam==='mill'||fam==='face'||fam==='drill')&&vc>rg[1]*1.4)
    W('vc','w',`Varvtalet är för högt: v<sub>c</sub> ${nf0(vc)} m/min (riktvärde ${rg[0]}–${rg[1]}). Verktyget blir varmt och slits fort${M.steel&&!M.tsoft?', och spånen blir blå':''}.`);
  if(M.bue&&(fam==='mill'||fam==='face')&&vc<rg[0]*.5)
    W('bue','w',`Varvtalet är lågt för ${matName(M)} (v<sub>c</sub> ${nf0(vc)} m/min): materialet kladdar fast på skäret och ytan blir matt och sliten.`);
  return {F:Ft,Mc,Pc,load,vc,fz,hm,hex,ap,ae,kc,lim,why,warn,heatFrac:frac,dt,fam,rg};
}

/* Värme. Ämnet beskrivs som ett rutnät (NX × NY celler med sidan DX mm, origo x0,y0).
   field = {NX,NY,DX,x0,y0, tt,tl,tc (Float32Array NX*NY), clock, tmax}
   Lägger in energin E (J) runt punkten (x,y) med radien R. Svar: true om någon cells högsta temperatur ökade. */
function heat(field,x,y,R,E,dtSec,M,ap,cool){
  const F=field;if(!F||E<=0)return false;
  F.clock=(F.clock||0)+dtSec;
  const tau=cool?2.5:7,pen=Math.sqrt(M.a*Math.max(dtSec,1e-3)),Rr=R+1+pen,DX=F.DX;
  const capc=M.rho*M.c*DX*DX*Math.max(1,Math.min(40,Math.max(pen*1.2,ap||0)));
  const i0=Math.max(0,Math.floor((x-Rr-F.x0)/DX)),i1=Math.min(F.NX-1,Math.ceil((x+Rr-F.x0)/DX));
  const j0=Math.max(0,Math.floor((y-Rr-F.y0)/DX)),j1=Math.min(F.NY-1,Math.ceil((y+Rr-F.y0)/DX));
  if(i0>i1||j0>j1)return false;
  const cnt=Math.max(1,Math.PI*Rr*Rr/(DX*DX)),dT=E/(capc*cnt);let changed=false;
  for(let j=j0;j<=j1;j++)for(let i=i0;i<=i1;i++){
    const dx=F.x0+(i+.5)*DX-x,dy=F.y0+(j+.5)*DX-y;if(dx*dx+dy*dy>Rr*Rr)continue;const k=j*F.NX+i;
    const cur=F.tt[k]*Math.exp(-(F.clock-F.tl[k])/tau)+dT;F.tt[k]=cur;F.tl[k]=F.clock;
    const T20=20+480*(1-Math.exp(-cur/480));                         // ytan når sällan över ~500 °C vid fräsning
    if(T20>(F.tmax||0))F.tmax=T20;
    if(T20>F.tc[k]+0.5){F.tc[k]=T20;changed=true;}
  }
  return changed;
}

/* anlöpningsfärger: oxidskiktets tjocklek (nm) efter högsta temperatur och dess interferensfärg rakt uppifrån */
const POX=[[185,0],[200,12],[220,17],[240,22],[255,27],[270,32],[285,38],[295,44],[310,50],[335,62],[400,85],[500,115]];
function oxD(t){if(t<=POX[0][0])return 0;for(let i=1;i<POX.length;i++){if(t<=POX[i][0]){const [a,da]=POX[i-1],[b,db]=POX[i];return da+(db-da)*(t-a)/(b-a);}}return POX[POX.length-1][1];}
const filmCache=new Map();
function filmRGB(d){
  d=Math.round(d);if(filmCache.has(d))return filmCache.get(d);
  const cm=(a,b)=>[a[0]*b[0]-a[1]*b[1],a[0]*b[1]+a[1]*b[0]],cd=(a,b)=>{const q=b[0]*b[0]+b[1]*b[1];return [(a[0]*b[0]+a[1]*b[1])/q,(a[1]*b[0]-a[0]*b[1])/q];};
  const nfm=[2.6,.28],ns=[2.9,3.0],r01=cd([1-nfm[0],-nfm[1]],[1+nfm[0],nfm[1]]),r12=cd([nfm[0]-ns[0],nfm[1]-ns[1]],[nfm[0]+ns[0],nfm[1]+ns[1]]);
  const R=x=>[640,545,455].map(l=>{const dr=4*Math.PI*nfm[0]*x/l,di=4*Math.PI*nfm[1]*x/l,e=[Math.exp(-di)*Math.cos(dr),Math.exp(-di)*Math.sin(dr)],q=cm(r12,e),t=[r01[0]+q[0],r01[1]+q[1]],b=cm(r01,q),bo=[1+b[0],b[1]];return (t[0]*t[0]+t[1]*t[1])/(bo[0]*bo[0]+bo[1]*bo[1]);});
  const base=[.78,.8,.83].map(v=>Math.pow(v,2.2)),r=R(d),r0=R(0),sm=(a,b,x)=>{const t=Math.max(0,Math.min(1,(x-a)/(b-a)));return t*t*(3-2*t);};
  let c=base.map((v,i)=>v*Math.min(1.7,Math.pow(r[i]/Math.max(r0[i],.05),1.15)));
  const g=[.5,.54,.58].map(v=>Math.pow(v,2.2)),u=sm(90,140,d);c=c.map((v,i)=>v+(g[i]-v)*u);
  const w=sm(2,12,d);c=c.map((v,i)=>base[i]+(v-base[i])*w);
  const out=c.map(v=>Math.pow(Math.min(1,v),1/2.2));                   // 0–1
  filmCache.set(d,out);return out;
}
/* grundfärg för ämnet efter material (0–1) */
/* ämnets färg som i verkligheten (linjär RGB 0–1): blankt aluminium, grått stål, ljusare rostfritt, mörkt gjutjärn,
   kopparrött, mässingsgult, titan, och plasterna i sina vanliga färger */
function baseColor(M){
  const id=M.id||'';
  const P={'pom-c':[.95,.95,.93],'pa6':[.93,.9,.8],'pe-uhmw':[.97,.97,.96],'pp':[.94,.94,.9],'peek':[.79,.69,.53],'pmma':[.86,.91,.94],'pc':[.84,.89,.92],'pvc-u':[.48,.51,.54],'ptfe':[.98,.98,.97],'hardplast':[.2,.2,.22]};
  if(P[id])return P[id];
  if(M.kat==='Plaster')return [.93,.92,.88];
  if(/^cu-/.test(id))return [.88,.53,.38];
  if(/^cuzn/.test(id))return [.87,.73,.42];
  if(/^cusn/.test(id))return [.8,.6,.38];
  if(M.kat==='Titan'||/^ti/.test(id))return [.62,.6,.57];
  if(M.base==='al'||/^en-aw/.test(id))return [.88,.9,.92];
  if(M.grupp==='K')return [.4,.41,.42];
  if(M.grupp==='M')return [.7,.7,.69];
  if(/^1\.23|orvar|unimax|sleipner|hardat/.test(id))return [.5,.52,.54];
  return [.58,.6,.62];
}
/* ytans karaktär: metaller blanka och reflekterande, plaster matta */
function surface(M){const id=M.id||'';if(M.kat==='Plaster')return {metal:0,rough:id==='pmma'||id==='pc'?.25:.55};
  if(M.grupp==='K')return {metal:.5,rough:.55};if(M.base==='al'||/^en-aw/.test(id))return {metal:.7,rough:.32};return {metal:.65,rough:.38};}


/* Svarvning (Sandvik Coromant): spåntjockleken hm = f · sin κr, kc = kc1 · hm^-mc,
   skärkraften Fc = kc · A där A = ap · f är spånarean per varv, Pc = Fc · vc / 60 000 och Mc = Fc · D / 2 000.
   p = {kr (grader), f (mm/varv), A (mm², spånarea per varv) eller ap (mm), D (mm, diameter vid skäret),
        n (varv/min), mat, cool, mach:{kw,nm}, Fmax (N, vad skäret tål), nose (mm, spetsradie)}
   Svar som cut(): {F, Mc, Pc, load, vc, hm, kc, ap, why, lim, warn:[{k,ty,msg}], heatFrac} */
function turn(p){
  const M=p.mat||FALLBACK,n=Math.max(1,p.n),D=Math.max(.2,p.D),f=Math.max(.001,p.f),kr=(p.kr||95)*Math.PI/180;
  const vc=Math.PI*D*n/1000,hm=Math.max(.001,f*Math.abs(Math.sin(kr))),kc=M.kc1*Math.pow(hm,-M.mc);
  const A=Math.max(0,p.A!=null?p.A:f*(p.ap||0)),ap=A/f;
  const Fc=kc*A,Pc=Fc*vc/60000,Mc=Fc*D/2000,Fmax=Math.max(1,p.Fmax||1000);
  const load=Fc/Fmax;
  const why=`skärkraften ${nf0(Fc)} N (skäret tål ungefär ${nf0(Fmax)} N)`;
  const warn=[],W=(k,ty,msg)=>warn.push({k,ty,msg}),mach=p.mach||{kw:11,nm:140};
  if(load>=.75&&load<1)W('hi','w',`Hög belastning (${Math.round(load*100)} %): ${why}. Nära gränsen.`);
  if(Pc>mach.kw)W('kw','e',`Spindeln orkar inte: ${nf1(Pc)} kW behövs, maskinen har ${nf1(mach.kw)} kW. Minska skärdjupet eller matningen, eller sänk varvtalet.`);
  else if(Mc>mach.nm)W('nm','e',`Spindelns vridmoment räcker inte: ${nf0(Mc)} Nm behövs, maskinen ger ${nf0(mach.nm)} Nm. Minska skärdjupet eller matningen.`);
  const nose=p.nose||.4;
  if(ap>.05&&f<nose/8-1e-9)W('rub','w',`Matningen ${nf(Math.round(f*1000)/1000)} mm/varv är låg för spetsradien ${nf(nose)} mm (minst ungefär ${nf(Math.round(nose/8*100)/100)}): skäret gnider i stället för att skära${M.tsoft?' och plasten kan smälta':M.steel?' och materialet kan deformationshärdna':''}.`);
  const rg=(M.vc&&(M.vc.turn||M.vc.face))||[60,300];
  let frac=p.cool?.05:.16;if(vc>rg[1])frac*=1+(vc/rg[1]-1)*3;
  if(vc>rg[1]*1.4)W('vc','w',`Skärhastigheten är för hög: v<sub>c</sub> ${nf0(vc)} m/min (riktvärde ${rg[0]}–${rg[1]}). Skäret blir varmt och slits fort${M.steel&&!M.tsoft?', och spånen blir blå':''}.`);
  if(M.bue&&vc<rg[0]*.5&&D>2)W('bue','w',`Skärhastigheten är låg för ${matName(M)} (v<sub>c</sub> ${nf0(vc)} m/min): materialet kladdar fast på skäret och ytan blir matt och sliten.`);
  return {F:Fc,Mc,Pc,load,vc,hm,kc,ap,A,lim:'skäret',why,warn,heatFrac:frac,rg};
}

window.CNCFYSIK={materials,material,matName,cut,turn,heat,surface,oxD,filmRGB,baseColor,flutes,famOf,PSOLID,PINS,PDRILL};
})();
