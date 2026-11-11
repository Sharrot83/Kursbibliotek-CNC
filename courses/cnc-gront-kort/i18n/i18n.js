/* Kursbibliotek CNC – språk (svenska/engelska) för G-vis, lexikonet och simulatorerna.
   Sidan skrivs på svenska. När engelska är valt översätts texten på sidan med språkpaketen
   (i18n/en-*.js): exakta texter, hela meningar med mönster (rx) och delar av meningar (sub).
   Text som läggs till senare, till exempel meddelanden och menyer, översätts när den dyker upp.
   Kod (kodfältet, G-kod i förklaringar) översätts aldrig. */
(function(){
const KEY='cnc-sprak';
let app=!!(window.__TAURI__||window.__TAURI_INTERNALS__)||/[?&]app=1/.test(location.search);
try{if(app)sessionStorage.setItem('cnc-app','1');else app=sessionStorage.getItem('cnc-app')==='1';}catch(e){}
let lang=null;try{lang=localStorage.getItem(KEY);}catch(e){}
if(lang!=='sv'&&lang!=='en')lang=(app&&!/^sv/i.test(navigator.language||''))?'en':'sv';
document.documentElement.lang=lang;
const EX=new Map(),EXU=new Map(),RX=[],SUB=[],HTML=[];
const api=window.cncI18n={lang,app,
  add(p){if(p.exact)for(const k in p.exact){EX.set(k,p.exact[k]);EXU.set(k.toUpperCase(),p.exact[k]);}if(p.rx)RX.push(...p.rx);if(p.sub)SUB.push(...p.sub);if(p.html)HTML.push(...p.html);},
  set(l){try{localStorage.setItem(KEY,l);}catch(e){}location.reload();},
  t:s=>lang==='en'?tr(String(s)):String(s)};
window.cncT=api.t;
/* versionen i programmet och kontroll av nyare version (i bakgrunden, högst var tolfte timme) */
const ME=document.currentScript&&document.currentScript.src;
const REPO='Sharrot83/Kursbibliotek-CNC',REL='https://github.com/'+REPO+'/releases/latest';
api.releases=REL;
api.version=async function(){if(!app)return null;
  try{if(window.__TAURI__&&window.__TAURI__.app&&window.__TAURI__.app.getVersion)return await window.__TAURI__.app.getVersion();}catch(e){}
  try{const r=await fetch(new URL('../../../version.json',ME||location.href).href,{cache:'no-store'});return (await r.json()).version||null;}catch(e){return null;}};
api.latest=async function(force){let c=null;try{c=JSON.parse(localStorage.getItem('gvis-senaste')||'null');}catch(e){}
  if(!force&&c&&Date.now()-c.t<12*3600e3)return c;
  try{const r=await fetch('https://api.github.com/repos/'+REPO+'/releases/latest',{headers:{Accept:'application/vnd.github+json'}});if(!r.ok)throw 0;const j=await r.json();
    c={t:Date.now(),version:String(j.tag_name||'').replace(/^v/i,''),url:j.html_url||REL};try{localStorage.setItem('gvis-senaste',JSON.stringify(c));}catch(e){}return c;}catch(e){return c;}};
api.newer=function(a,b){const p=x=>String(x||'').split(/[.-]/).map(n=>parseInt(n,10)||0);const A=p(a),B=p(b);for(let i=0;i<Math.max(A.length,B.length);i++){if((A[i]||0)>(B[i]||0))return true;if((A[i]||0)<(B[i]||0))return false;}return false;};
api.openExternal=function(url){try{if(window.__TAURI__&&window.__TAURI__.opener&&window.__TAURI__.opener.openUrl){window.__TAURI__.opener.openUrl(url);return;}}catch(e){}window.open(url,'_blank','noopener');};

/* programläge (G-vis som program): inga länkar till kurssajten, tillbaka-länkar går till programmets startsida */
if(app){const me=document.currentScript&&document.currentScript.src,home=me?new URL('../../../index.html',me).href:'/index.html';
  document.documentElement.classList.add('is-app');
  const fix=()=>{document.querySelectorAll('a[href]').forEach(a=>{const h=a.getAttribute('href')||'';if(/(^|\/)(material|simulator)\.html(\?|#|$)/.test(h)||/^(\.\.\/)+index\.html$/.test(h)){a.setAttribute('href',home);if(a.title)a.title='Till startsidan';if(a.getAttribute('aria-label'))a.setAttribute('aria-label','Till startsidan');if(/Tillbaka/.test(a.textContent))a.textContent='← Startsida';}});
    document.querySelectorAll('[data-site-only]').forEach(e=>e.remove());
    /* i programmet finns inga flikar: länkar som skulle öppnas i ny flik öppnas i samma fönster */
    document.querySelectorAll('a[target="_blank"]').forEach(a=>{const h=a.getAttribute('href')||'';if(!/^https?:/.test(h))a.removeAttribute('target');});};
  document.addEventListener('click',e=>{const a=e.target.closest&&e.target.closest('a[target="_blank"]');if(a){const h=a.getAttribute('href')||'';if(!/^https?:/.test(h)){e.preventDefault();location.href=a.href;}}},true);
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',fix);else fix();
  api.home=home;}
function tr(s){const m=s.match(/^(\s*)([\s\S]*?)(\s*)$/),core=m[2];if(!core)return s;
  let e=EX.get(core);
  if(e==null){const u=EXU.get(core.toUpperCase());if(u!=null)e=core===core.toUpperCase()?u.toUpperCase():u;}
  if(e==null){for(const [re,rep] of RX){const mm=core.match(re);if(mm){const x=typeof rep==='function'?rep(...mm):core.replace(re,rep);if(x!==core){e=x;break;}}}}
  if(SUB.length&&(e==null||/[åäöÅÄÖ]/.test(e))){let x=e==null?core:e;for(const [re,rep] of SUB)x=x.replace(re,rep);if(x!==core)e=x;}
  return e==null?s:m[1]+e+m[3];}
api.tr=tr;
/* språkknapp på sidor som inte har en egen (lexikonet och simulatorerna) */
function langBtn(){if(document.getElementById('rtLang')||document.getElementById('lang')||document.querySelector('[data-lang-btn]')||document.documentElement.hasAttribute('data-no-lang-btn'))return;
  const at=document.querySelector('.lx-top .lx-links')||document.querySelector('a[href$="lexikon.html"]');if(!at)return;
  const b=document.createElement('button');b.type='button';b.setAttribute('data-lang-btn','');b.setAttribute('data-noi18n','');b.className='cnc-lang';
  b.textContent=lang==='en'?'🌐 Svenska':'🌐 English';b.title=lang==='en'?'Byt språk till svenska':'Switch language to English';b.onclick=()=>api.set(lang==='en'?'sv':'en');
  b.style.cssText='font:inherit;font-size:13px;padding:4px 10px;margin-left:8px;border:1px solid currentColor;border-radius:6px;background:transparent;color:inherit;cursor:pointer;opacity:.85';
  if(at.classList&&at.classList.contains('lx-links'))at.appendChild(b);else at.after(b);}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',langBtn);else langBtn();
if(lang!=='en')return;
const SKIP='script,style,textarea,code,kbd,pre,.code-editor,.src,.k-pre,[data-noi18n],.line-numbers';
const ATTR=['title','aria-label','placeholder','label'];
/* varje text och attribut översätts en gång: det vi själv skrev in rörs inte igen (så kan inget gå runt i en slinga) */
const DONE=new WeakMap();
function node(n){if(n.nodeType===3){const p=n.parentElement;if(!p||p.closest(SKIP))return;const v=n.nodeValue;if(DONE.get(n)===v)return;const t=tr(v);DONE.set(n,t);if(t!==v)n.nodeValue=t;return;}
  if(n.nodeType!==1)return;
  if(n.matches('pre,code')&&window.cncCodeEN&&!(n.parentElement&&n.parentElement.querySelector('textarea'))&&!n.closest('.code-editor')){const w=document.createTreeWalker(n,NodeFilter.SHOW_TEXT);let c;const all=[];while((c=w.nextNode()))all.push(c);
    /* en kommentar kan vara uppdelad i flera textbitar (färgad kod): översätt hela texten och lägg tillbaka bitvis */
    const full=all.map(x=>x.nodeValue).join(''),tf=cncCodeEN(full);if(tf!==full){if(all.length===1){all[0].nodeValue=tf;}else{all.forEach(x=>{const v=cncCodeEN(x.nodeValue);if(v!==x.nodeValue)x.nodeValue=v;});const s2=all.map(x=>x.nodeValue).join('');if(s2!==tf){all[0].nodeValue=tf;for(let k=1;k<all.length;k++)all[k].nodeValue='';}}}
    all.forEach(x=>DONE.set(x,x.nodeValue));return;}
  if(n.matches(SKIP)){if(n.tagName==='TEXTAREA'&&n.placeholder){const t=tr(n.placeholder);if(t!==n.placeholder)n.placeholder=t;}return;}
  let D=DONE.get(n);if(!D){D={};DONE.set(n,D);}
  for(const a of ATTR){const v=n.getAttribute(a);if(v&&D[a]!==v){const t=tr(v);D[a]=t;if(t!==v)n.setAttribute(a,t);}}
  if(n.tagName==='INPUT'&&(n.type==='button'||n.type==='submit')&&n.value){const t=tr(n.value);if(t!==n.value)n.value=t;}
  for(let c=n.firstChild;c;c=c.nextSibling)node(c);}
function run(){HTML.forEach(([sel,html])=>{const el=document.querySelector(sel);if(el)el.innerHTML=html;});
  node(document.body);document.title=tr(document.title);
  new MutationObserver(ms=>{for(const m of ms){if(m.type==='characterData')node(m.target);else if(m.type==='attributes'){const n=m.target,a=m.attributeName;if(n.nodeType!==1||n.closest(SKIP))continue;const v=n.getAttribute(a);let D=DONE.get(n);if(!D){D={};DONE.set(n,D);}if(v&&D[a]!==v){const t=tr(v);D[a]=t;if(t!==v)n.setAttribute(a,t);}}else m.addedNodes.forEach(node);}})
   .observe(document.body,{subtree:true,childList:true,characterData:true,attributes:true,attributeFilter:ATTR});}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',run);else run();
})();
