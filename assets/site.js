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
