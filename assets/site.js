/*
  Central course registry.
  To add a new course to the whole site (dropdown, hub cards, etc):
    1. Duplicate the /courses/<course-id>/ folder structure
       (material.html + quiz.html), following courses/sakra-lyft/ as a template.
    2. Add ONE object to COURSES below.
  That's it — the dropdown, hub page and breadcrumbs update everywhere automatically.
*/
const COURSES = [
  {
    id: "industriteknik-bas",
    title: "Industriteknik BAS",
    tag: "Grundutbildning",
    color: "var(--teal)",
    desc: "Automation & IT, Mätteknik, Produktionsteknik, Ritningsläsning, Underhåll, Kvalitet, Miljö/Hälsa & Säkerhet, Matematik.",
    chapters: 8,
    status: "ready",
    material: "material.html",
    quiz: "material.html"
  },
  {
    id: "sakra-lyft",
    title: "Säkra Lyft",
    tag: "Kran & lyftarbete",
    color: "var(--amber)",
    desc: "Traverser, kranar, lyftredskap och säkra lyftmetoder — 10 kapitel + övningsquiz.",
    chapters: 10,
    status: "ready",
    material: "material.html",
    quiz: "quiz.html"
  },
  {
    id: "liftutbildning",
    title: "Liftutbildning",
    tag: "Mobila arbetsplattformar",
    color: "var(--lime)",
    desc: "Maskintyper, liftens uppbyggnad, kontroll & besiktning, säkert arbetssätt och fallskydd — 8 kapitel + övningsquiz.",
    chapters: 8,
    status: "ready",
    material: "material.html",
    quiz: "quiz.html"
  },
  {
    id: "cnc-gront-kort",
    title: "CNC-Grönt kort",
    tag: "CNC-programmering",
    color: "var(--blue)",
    desc: "Grundutbildning inför CNC-Grönt kort, uppdelad i delkurser: Verktyg (Svenska/Engelska), Materialkunskap och CNC-programmering. Fler delkurser tillkommer.",
    chapters: 3,
    status: "ready",
    material: "material.html",
    quiz: "quiz-alla.html"
  }
];

function courseBasePath(){
  // Depth-aware: counts how many folders deep the current file sits below the
  // "courses" folder, so it works no matter where the site is unzipped on disk.
  const parts = location.pathname.split('/').filter(Boolean);
  const ci = parts.lastIndexOf('courses');
  if(ci === -1) return './'; // we're at the site root (index.html)
  const ups = parts.length - ci - 1;
  return ups > 0 ? '../'.repeat(ups) : './';
}

function currentCourseId(){
  const m = location.pathname.match(/\/courses\/([^\/]+)\//);
  return m ? m[1] : null;
}

/* ---------- light/dark theme switch ----------
   Theme is applied via a `data-theme="light"` attribute on <html>.
   Absence of the attribute (or data-theme="dark") means dark mode — the
   site's default. Every page already carries its own
   :root[data-theme="light"]{...} override block (added next to its normal
   :root{...} palette), so flipping the attribute is a pure CSS recalculation:
   no stylesheet is fetched, nothing reloads, nothing flashes. Each page also
   has a tiny inline script in <head> that reads the saved preference and
   sets the attribute before first paint, so there's no flash on load either.
*/
const THEME_KEY = "kbc-theme";

function getTheme(){
  return document.documentElement.getAttribute("data-theme") === "light" ? "light" : "dark";
}

function setTheme(theme){
  if(theme === "light"){
    document.documentElement.setAttribute("data-theme", "light");
  } else {
    document.documentElement.removeAttribute("data-theme");
  }
  try{ localStorage.setItem(THEME_KEY, theme); }catch(e){}
  syncThemeSwitchUI();
}

function syncThemeSwitchUI(){
  const theme = getTheme();
  document.querySelectorAll(".theme-switch button").forEach(btn => {
    const pressed = btn.dataset.themeBtn === theme;
    btn.setAttribute("aria-pressed", pressed ? "true" : "false");
  });
}

function ensureThemeStyle(){
  if(document.getElementById("kbc-theme-style")) return;
  const style = document.createElement("style");
  style.id = "kbc-theme-style";
  style.textContent = `
    .theme-switch{display:inline-flex; border:1px solid var(--line); border-radius:999px; overflow:hidden; flex:0 0 auto;}
    .theme-switch button{
      background:var(--panel); color:var(--muted); border:none; padding:8px 14px;
      font-size:13px; font-weight:700; font-family:inherit; cursor:pointer; line-height:1;
    }
    .theme-switch button + button{border-left:1px solid var(--line);}
    .theme-switch button[aria-pressed="true"]{background:var(--amber); color:#1a1105;}
    .theme-switch button:hover[aria-pressed="false"]{color:var(--text);}

    /* hardcoded (non-variable) colors used inside quiz cards and reading
       articles across the older templates — mapped for light mode here so
       every page doesn't need its own copy of these few rules. */
    [data-theme="light"] .opt{ background:#ffffff; }
    [data-theme="light"] .opt:hover:not([disabled]){ background:#f2f4f6; }
    [data-theme="light"] .opt.correct .k{ background:#dff5e6; }
    [data-theme="light"] .opt.wrong .k{ background:#fbe1de; }
    [data-theme="light"] .feedback.ok{ color:#1d5c37; border-color:#8fcf9f !important; }
    [data-theme="light"] .feedback.bad{ color:#8a3229; border-color:#e3a39c !important; }
    [data-theme="light"] article.reading p,
    [data-theme="light"] article.reading li,
    [data-theme="light"] .callout{ color:#33404a; }
    [data-theme="light"] .pill.solid[style*="#a487d6"]{ background:#7d5cb8 !important; border-color:#7d5cb8 !important; }
    [data-theme="light"] .pill.solid[style*="#e0584f"]{ background:#c2453c !important; border-color:#c2453c !important; }
    [data-theme="light"] .pill.solid[style*="#5b9bd5"]{ background:#3f7ab8 !important; border-color:#3f7ab8 !important; }
    [data-theme="light"] .btn-amber[style*="#a487d6"]{ background:#7d5cb8 !important; }
    [data-theme="light"] .btn-amber[style*="#e0584f"]{ background:#c2453c !important; }
    [data-theme="light"] .btn-amber[style*="#5b9bd5"]{ background:#3f7ab8 !important; }
    [data-theme="light"] .topbar{ background:rgba(255,255,255,.85) !important; }
    [data-theme="light"] .master{ background:linear-gradient(135deg, #f6f7f9, #eef0f2) !important; }
  `;
  document.head.appendChild(style);
}

function renderTopbar(){
  const mount = document.getElementById("topbar");
  if(!mount) return;
  const base = courseBasePath();
  const curId = currentCourseId();

  ensureThemeStyle();

  const options = COURSES.map(c => {
    const sel = c.id === curId ? "selected" : "";
    const label = c.status === "coming-soon" ? c.title + " (kommer snart)" : c.title;
    return `<option value="${c.id}" ${sel}>${label}</option>`;
  }).join("");

  mount.innerHTML = `
    <div class="topbar-inner">
      <a class="brand" href="${base}index.html">Kursbibliotek CNC</a>
      <select class="course-select" id="courseSelect" aria-label="Välj kurs">
        <option value="" disabled ${curId ? "" : "selected"}>Välj kurs…</option>
        ${options}
      </select>
      <div class="theme-switch" role="group" aria-label="Färgtema">
        <button type="button" data-theme-btn="dark">Mörkt</button>
        <button type="button" data-theme-btn="light">Ljust</button>
      </div>
    </div>
  `;

  document.getElementById("courseSelect").addEventListener("change", (e) => {
    const id = e.target.value;
    const course = COURSES.find(c => c.id === id);
    if(!course) return;
    window.location.href = `${base}courses/${id}/${course.material}`;
  });

  mount.querySelectorAll(".theme-switch button").forEach(btn => {
    btn.addEventListener("click", () => setTheme(btn.dataset.themeBtn));
  });
  syncThemeSwitchUI();
}

function renderFooter(){
  if(document.getElementById("sitefooter")) return;
  const base = courseBasePath();
  const footer = document.createElement("div");
  footer.id = "sitefooter";
  footer.style.cssText = "max-width:1100px;margin:40px auto 24px;padding:14px 20px 0;border-top:1px solid var(--line);color:var(--muted);font-size:12.5px;display:flex;gap:16px;flex-wrap:wrap;";
  footer.innerHTML = `
    <a href="${base}integritet.html" style="color:var(--muted);text-decoration:none;">Integritet &amp; kakor</a>
    <a href="${base}tillganglighet.html" style="color:var(--muted);text-decoration:none;">Tillgänglighet</a>
  `;
  document.body.appendChild(footer);
}

document.addEventListener("DOMContentLoaded", renderTopbar);
document.addEventListener("DOMContentLoaded", renderFooter);

/* ---------- Lyssna: uppläsning av kursmaterial ----------
   Använder webbläsarens inbyggda talsyntes (Web Speech API) — gratis, ingen
   server och inga extra filer. Knappen läggs i det fasta sidhuvudet och
   skapas BARA på sidor med läsmaterial (kapitelsidor med <article class="reading">
   och de ensidiga kurserna med .side-nav), alltså inte på startsidor, quiz,
   lathundar eller spel.

   Integritet: som standard används bara röster som finns lokalt på enheten.
   Webbläsarnas "onlineröster" (t.ex. Google, Microsoft) skickar texten till
   deras servrar, så de kräver att användaren själv slår på "Tillåt onlineröster".
   Sajten skickar aldrig något själv. */
const TTS_KEYS = { rate: "kbc-tts-rate", voice: "kbc-tts-voice", online: "kbc-tts-online" };
const TTS_RATES = [0.7, 0.85, 1, 1.15, 1.3, 1.5];
const TTS_MAX_CHUNK = 200; // korta stycken: långa yttranden kan klippas i vissa webbläsare
const TTS_BLOCK = "h1,h2,h3,h4,p,li,dt,dd,blockquote,figcaption,summary,.callout,.lawbox,.note";
const TTS_SKIP = "nav,.toc,.side-nav,.audio-box,table,pre,script,style,noscript,svg,canvas,button,select,input,textarea,[hidden],[aria-hidden=\"true\"],.num,.tts-bar,#topbar,#sitefooter";

function ttsReadingScope(){
  const article = document.querySelector("article.reading");
  if(article) return article;
  if(document.querySelector("nav.side-nav")) return document.querySelector("main");
  return null;
}

// Text i ett block, utan underordnade block (de blir egna delar) och utan hoppade element.
function ttsOwnText(el){
  let out = "";
  el.childNodes.forEach(n => {
    if(n.nodeType === 3){ out += n.nodeValue; return; }
    if(n.nodeType !== 1) return;
    if(n.matches(TTS_SKIP) || n.matches(TTS_BLOCK)) return;
    if(n.tagName === "BR"){ out += " "; return; }
    out += ttsOwnText(n);
  });
  return out;
}

// Sådant som låter fel när talsyntesen läser det bokstavligt (bara för uppläsningen, texten på sidan ändras inte).
const TTS_REPLACE = [
  [/\bt\.ex\./gi, "till exempel"], [/\bbl\.a\./gi, "bland annat"], [/\bm\.m\./gi, "med mera"],
  [/\bm\.fl\./gi, "med flera"], [/\bosv\./gi, "och så vidare"], [/\bdvs\b\.?/gi, "det vill säga"],
  [/\bjfr\b\.?/gi, "jämför"], [/\bca\.?(?=\s*\d)/gi, "cirka"],
  [/(\d)\s*[–—-]\s*(\d)/g, "$1 till $2"],
  [/[Ø⌀]\s*/g, "diameter "],
  [/(\d)\s*°\s*C\b/g, "$1 grader Celsius"], [/°/g, " grader"],
  [/\bmm\/min\b/g, "millimeter per minut"], [/\bm\/min\b/g, "meter per minut"],
  [/\bmm\b/g, "millimeter"], [/\bcm\b/g, "centimeter"], [/\bkg\b/g, "kilogram"], [/µm/g, "mikrometer"],
  [/%/g, " procent"], [/±/g, " plus minus "], [/×/g, " gånger "],
  [/≥/g, " större än eller lika med "], [/≤/g, " mindre än eller lika med "],
  [/\s*→\s*/g, ", "], [/\s*[–—]\s*/g, ", "], [/&/g, " och "]
];
function ttsSpeechText(text){
  let t = text;
  TTS_REPLACE.forEach(r => { t = t.replace(r[0], r[1]); });
  return t.replace(/\s+/g, " ").trim();
}

// Delar upp i meningar och, om de är långa, vid kommatecken/kolon.
function ttsSplit(text, max){
  const sentences = [];
  let start = 0;
  for(let i = 0; i < text.length; i++){
    const c = text[i];
    if(c === "." || c === "!" || c === "?" || c === "…"){
      let j = i + 1;
      while(j < text.length && /["”’)\]]/.test(text[j])) j++;
      if(j >= text.length) break;
      if(/\s/.test(text[j])){
        let k = j;
        while(k < text.length && /\s/.test(text[k])) k++;
        if(k < text.length && /[A-ZÅÄÖ0-9"“(]/.test(text[k])){
          sentences.push(text.slice(start, j).trim());
          start = k; i = k - 1;
        }
      }
    }
  }
  const tail = text.slice(start).trim();
  if(tail) sentences.push(tail);
  const out = [];
  sentences.forEach(s => {
    let rest = s;
    while(rest.length > max){
      let cut = -1;
      [";", ":", ","].forEach(ch => { const p = rest.lastIndexOf(ch, max); if(p > max * 0.4) cut = Math.max(cut, p); });
      if(cut < 0) cut = rest.lastIndexOf(" ", max);
      if(cut <= 0) cut = max;
      out.push(rest.slice(0, cut + 1).trim());
      rest = rest.slice(cut + 1).trim();
    }
    if(rest) out.push(rest);
  });
  return out.filter(Boolean);
}

// Läsbara delar i dokumentordning: {el, chunks[]}
function ttsCollectUnits(scope){
  const units = [];
  scope.querySelectorAll(TTS_BLOCK).forEach(el => {
    if(el.closest(TTS_SKIP)) return;
    const det = el.closest("details");
    if(det && !det.open && !(el.tagName === "SUMMARY" && el.parentElement === det)) return;
    try{ if(window.getComputedStyle(el).display === "none") return; }catch(e){}
    let raw = ttsOwnText(el).replace(/\s+/g, " ").trim();
    if(raw.length < 2 || !/[A-Za-zÅÄÖåäö0-9]/.test(raw)) return;
    if(!/[.!?…:]$/.test(raw)) raw += "."; // rubriker får en paus
    const chunks = ttsSplit(ttsSpeechText(raw), TTS_MAX_CHUNK);
    if(chunks.length) units.push({ el, chunks });
  });
  return units;
}

function ensureTtsStyle(){
  if(document.getElementById("kbc-tts-style")) return;
  const style = document.createElement("style");
  style.id = "kbc-tts-style";
  style.textContent = `
    .tts-bar{position:relative; display:inline-flex; gap:8px; align-items:center; flex:0 0 auto;}
    .tts-btn{
      background:var(--panel); color:var(--text); border:1px solid var(--line); border-radius:999px;
      padding:8px 14px; font-size:13px; font-weight:700; font-family:inherit; cursor:pointer; line-height:1; white-space:nowrap;
    }
    .tts-btn:hover{border-color:var(--amber);}
    .tts-btn:focus-visible,.tts-pop select:focus-visible,.tts-pop input:focus-visible{outline:2px solid var(--amber); outline-offset:2px;}
    .tts-btn.is-playing{background:var(--amber); color:#1a1105; border-color:var(--amber);}
    .tts-btn.icon{padding:8px 11px;}
    .tts-pop{
      position:absolute; top:calc(100% + 10px); left:0; z-index:60; width:min(320px, calc(100vw - 24px));
      background:var(--panel); color:var(--text); border:1px solid var(--line); border-radius:12px;
      padding:14px 16px; box-shadow:0 12px 30px rgba(0,0,0,.35); font-size:13.5px; line-height:1.45;
    }
    .tts-pop[hidden]{display:none;}
    .tts-pop label{display:block; font-size:12px; color:var(--muted); margin:10px 0 4px;}
    .tts-pop label:first-child{margin-top:0;}
    .tts-pop select{width:100%; background:var(--bg, var(--panel)); color:var(--text); border:1px solid var(--line); border-radius:8px; padding:8px 10px; font-size:14px; font-family:inherit;}
    .tts-pop .tts-check{display:flex; gap:8px; align-items:flex-start; margin-top:12px; color:var(--text); font-size:13px;}
    .tts-pop .tts-check input{margin-top:3px;}
    .tts-pop .tts-note{color:var(--muted); font-size:12.5px; margin:6px 0 0;}
    .tts-pop .tts-msg{margin:10px 0 0; padding:8px 10px; border-radius:8px; border:1px solid var(--amber); font-size:13px;}
    .tts-pop .tts-msg:empty{display:none;}
    .tts-sr{position:absolute; width:1px; height:1px; overflow:hidden; clip:rect(0 0 0 0); white-space:nowrap;}
    .tts-current{
      background:rgba(255,184,77,.16); box-shadow:0 0 0 4px rgba(255,184,77,.16); border-radius:4px;
      scroll-margin-top:96px; scroll-margin-bottom:60px;
    }
    [data-theme="light"] .tts-current{background:rgba(255,184,77,.38); box-shadow:0 0 0 4px rgba(255,184,77,.38);}
    @media (max-width:640px){ .tts-btn .tts-hide-sm{display:none;} }
  `;
  document.head.appendChild(style);
}

function initTts(){
  const mount = document.getElementById("topbar");
  const inner = mount && mount.querySelector(".topbar-inner");
  if(!inner || document.getElementById("ttsBar")) return;
  if(!ttsReadingScope()) return;                       // bara där man läser material
  const synth = window.speechSynthesis;
  if(!synth || typeof window.SpeechSynthesisUtterance !== "function") return;
  ensureTtsStyle();

  const bar = document.createElement("div");
  bar.className = "tts-bar"; bar.id = "ttsBar";
  bar.setAttribute("role", "group"); bar.setAttribute("aria-label", "Uppläsning");
  bar.innerHTML = `
    <button type="button" class="tts-btn" id="ttsPlay"><span aria-hidden="true">🔊</span> <span id="ttsPlayLabel">Lyssna</span></button>
    <button type="button" class="tts-btn icon" id="ttsStop" hidden aria-label="Stoppa uppläsningen"><span aria-hidden="true">■</span></button>
    <button type="button" class="tts-btn icon" id="ttsSettings" aria-expanded="false" aria-controls="ttsPop" aria-label="Inställningar för uppläsning"><span aria-hidden="true">⚙</span></button>
    <span class="tts-sr" id="ttsLive" role="status" aria-live="polite"></span>
    <div class="tts-pop" id="ttsPop" hidden>
      <label for="ttsRate">Hastighet</label>
      <select id="ttsRate"></select>
      <label for="ttsVoice">Röst</label>
      <select id="ttsVoice"></select>
      <label class="tts-check"><input type="checkbox" id="ttsOnline"><span>Tillåt onlineröster. Då skickar din webbläsare texten till dess leverantör (t.ex. Google eller Microsoft) för att läsa upp den.</span></label>
      <p class="tts-note">Rösterna kommer från din enhet, så ljudet skiljer sig mellan datorer och mobiler.</p>
      <p class="tts-msg" id="ttsMsg"></p>
    </div>`;
  const themeSwitch = inner.querySelector(".theme-switch");
  inner.insertBefore(bar, themeSwitch || null);

  const $ = id => document.getElementById(id);
  const playBtn = $("ttsPlay"), stopBtn = $("ttsStop"), setBtn = $("ttsSettings"), pop = $("ttsPop");
  const rateSel = $("ttsRate"), voiceSel = $("ttsVoice"), onlineChk = $("ttsOnline");
  const get = (k, d) => { try{ const v = localStorage.getItem(k); return v === null ? d : v; }catch(e){ return d; } };
  const put = (k, v) => { try{ localStorage.setItem(k, v); }catch(e){} };

  let rate = parseFloat(get(TTS_KEYS.rate, "1")) || 1;
  let allowOnline = get(TTS_KEYS.online, "0") === "1";
  let voiceURI = get(TTS_KEYS.voice, "");
  let state = "idle", units = [], flat = [], idx = 0, session = 0, current = null, errorCount = 0, lastUnit = null;

  TTS_RATES.forEach(r => {
    const o = document.createElement("option"); o.value = String(r); o.textContent = r === 1 ? "Normal (1×)" : r + "×";
    rateSel.appendChild(o);
  });
  rateSel.value = String(TTS_RATES.indexOf(rate) >= 0 ? rate : 1);
  if(TTS_RATES.indexOf(rate) < 0) rate = 1;
  onlineChk.checked = allowOnline;

  function say(msg){ $("ttsLive").textContent = msg; }
  function showMsg(msg, open){ $("ttsMsg").textContent = msg || ""; if(msg && open) togglePop(true); }

  function voiceInfo(){
    const all = (synth.getVoices() || []).filter(v => /^sv([-_]|$)/i.test(v.lang || ""));
    const list = allowOnline ? all.slice() : all.filter(v => v.localService);
    list.sort((a, b) => (b.localService ? 1 : 0) - (a.localService ? 1 : 0) || String(a.name).localeCompare(String(b.name)));
    return { total: (synth.getVoices() || []).length, all, list };
  }
  function fillVoices(){
    const info = voiceInfo();
    voiceSel.innerHTML = "";
    if(!info.list.length){
      const o = document.createElement("option");
      o.value = ""; o.textContent = info.total ? "Ingen svensk röst tillgänglig" : "Standardröst";
      voiceSel.appendChild(o);
      return info;
    }
    info.list.forEach(v => {
      const o = document.createElement("option");
      o.value = v.voiceURI; o.textContent = v.name + (v.localService ? "" : " (online)");
      voiceSel.appendChild(o);
    });
    const keep = info.list.find(v => v.voiceURI === voiceURI);
    voiceSel.value = keep ? keep.voiceURI : info.list[0].voiceURI;
    return info;
  }
  function pickVoice(){
    const info = voiceInfo();
    return info.list.find(v => v.voiceURI === voiceSel.value) || info.list[0] || null;
  }

  function setState(s){
    state = s;
    const label = s === "playing" ? "Pausa" : (s === "paused" ? "Fortsätt" : "Lyssna");
    $("ttsPlayLabel").textContent = label;
    playBtn.classList.toggle("is-playing", s === "playing");
    playBtn.setAttribute("aria-label", s === "idle" ? "Lyssna på sidan" : label + " uppläsningen");
    stopBtn.hidden = (s === "idle");
  }
  function clearMark(){ if(lastUnit){ lastUnit.classList.remove("tts-current"); lastUnit = null; } }
  function mark(unit){
    if(lastUnit === unit.el) return;
    clearMark();
    unit.el.classList.add("tts-current"); lastUnit = unit.el;
    const hdr = mount.offsetHeight || 60, r = unit.el.getBoundingClientRect();
    if(r.top < hdr + 12 || r.bottom > window.innerHeight - 24){
      const calm = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      unit.el.scrollIntoView({ block: "center", behavior: calm ? "auto" : "smooth" });
    }
  }
  function firstVisible(){
    const hdr = mount.offsetHeight || 60;
    for(let i = 0; i < units.length; i++){
      if(units[i].el.getBoundingClientRect().bottom > hdr + 6) return i;
    }
    return 0;
  }

  function finish(){ session++; current = null; clearMark(); setState("idle"); say("Uppläsningen är klar"); idx = 0; }
  function speakFrom(i){
    if(i >= flat.length){ finish(); return; }
    idx = i;
    const item = flat[i], my = session;
    mark(units[item.unit]);
    const u = new window.SpeechSynthesisUtterance(item.text);
    const v = pickVoice();
    u.lang = v ? v.lang : "sv-SE"; if(v) u.voice = v;
    u.rate = rate;
    u.onend = () => { if(my !== session) return; errorCount = 0; speakFrom(i + 1); };
    u.onerror = e => {
      if(my !== session) return;
      if(e && (e.error === "canceled" || e.error === "interrupted")) return;
      if(e && e.error === "not-allowed"){ stopAll(); showMsg("Webbläsaren stoppade uppläsningen. Tryck på Lyssna igen.", true); return; }
      if(++errorCount > 3){ stopAll(); showMsg("Uppläsningen stoppades av ett fel i webbläsarens talsyntes.", true); return; }
      speakFrom(i + 1);
    };
    current = u; // behåll referensen så att händelserna inte försvinner
    synth.speak(u);
  }

  function startPlayback(){
    const scope = ttsReadingScope();
    if(!scope) return;
    const info = fillVoices();
    if(!info.list.length && info.total && !allowOnline){
      showMsg(info.all.length
        ? "Svenska röster finns bara som onlineröster på den här enheten. Slå på \"Tillåt onlineröster\" om du vill använda dem (texten skickas då till webbläsarens leverantör)."
        : "Ingen svensk röst hittades på den här enheten.", true);
      return;
    }
    showMsg("");
    units = ttsCollectUnits(scope);
    if(!units.length){ showMsg("Hittade ingen text att läsa på den här sidan.", true); return; }
    flat = [];
    units.forEach((u, ui) => u.chunks.forEach(t => flat.push({ unit: ui, text: t })));
    document.querySelectorAll("audio").forEach(a => { try{ a.pause(); }catch(e){} }); // inte två ljud samtidigt
    const startUnit = firstVisible();
    idx = flat.findIndex(f => f.unit >= startUnit); if(idx < 0) idx = 0;
    errorCount = 0; session++;
    synth.cancel();
    setState("playing"); say("Uppläsningen startar");
    window.setTimeout(() => { if(state === "playing") speakFrom(idx); }, 40);
  }
  function pausePlayback(){ session++; synth.cancel(); setState("paused"); say("Pausad"); }
  function resumePlayback(){ session++; setState("playing"); say("Fortsätter"); window.setTimeout(() => { if(state === "playing") speakFrom(idx); }, 40); }
  function stopAll(){ session++; synth.cancel(); current = null; clearMark(); setState("idle"); }
  function restartCurrent(){ if(state !== "playing") return; session++; synth.cancel(); window.setTimeout(() => { if(state === "playing") speakFrom(idx); }, 40); }

  function togglePop(open){
    const show = typeof open === "boolean" ? open : pop.hidden;
    pop.hidden = !show; setBtn.setAttribute("aria-expanded", show ? "true" : "false");
    if(show){ // håll rutan inom skärmen
      pop.style.left = "0"; pop.style.right = "auto";
      const r = pop.getBoundingClientRect();
      if(r.right > window.innerWidth - 8) pop.style.left = Math.min(0, window.innerWidth - 8 - r.right) + "px";
    }
  }

  playBtn.addEventListener("click", () => {
    if(state === "idle") startPlayback();
    else if(state === "playing") pausePlayback();
    else resumePlayback();
  });
  stopBtn.addEventListener("click", () => { stopAll(); say("Stoppad"); });
  setBtn.addEventListener("click", () => togglePop());
  rateSel.addEventListener("change", () => { rate = parseFloat(rateSel.value) || 1; put(TTS_KEYS.rate, String(rate)); restartCurrent(); });
  voiceSel.addEventListener("change", () => { voiceURI = voiceSel.value; put(TTS_KEYS.voice, voiceURI); restartCurrent(); });
  onlineChk.addEventListener("change", () => {
    allowOnline = onlineChk.checked; put(TTS_KEYS.online, allowOnline ? "1" : "0");
    const info = fillVoices();
    showMsg("");
    if(state === "playing" && !allowOnline && !info.list.length){ stopAll(); showMsg("Onlineröster är avstängda och ingen lokal svensk röst finns.", true); }
    else restartCurrent();
  });
  document.addEventListener("keydown", e => { if(e.key === "Escape" && !pop.hidden){ togglePop(false); setBtn.focus(); } });
  document.addEventListener("click", e => { if(!pop.hidden && !bar.contains(e.target)) togglePop(false); });
  document.addEventListener("play", e => { if(e.target && e.target.tagName === "AUDIO" && state !== "idle") stopAll(); }, true); // förinspelat ljud har företräde
  window.addEventListener("pagehide", () => { try{ synth.cancel(); }catch(e){} });

  fillVoices();
  if(typeof synth.addEventListener === "function") synth.addEventListener("voiceschanged", fillVoices);
  else synth.onvoiceschanged = fillVoices;
  setState("idle");
}
document.addEventListener("DOMContentLoaded", initTts);
