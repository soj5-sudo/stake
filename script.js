'use strict';
/* ═══════════════════════════════════════
   VLTAVA | script.js  
   Production-ready. Multi-provider image gen.
   Touch + Gyro + Cursor. 60fps. Zero-lag.
   ═══════════════════════════════════════ */

// ── RATE LIMITER ──
const Rate = {
  _t: [], MAX: 8, WIN: 60000,
  ok() { const n = Date.now(); this._t = this._t.filter(t => n - t < this.WIN); if (this._t.length >= this.MAX) return false; this._t.push(n); return true; }
};

// ── CURSOR GLOW ──
(function () {
  const g = document.getElementById('cursorGlow');
  if (!g || matchMedia('(pointer:coarse)').matches) return;
  let gx = 0, gy = 0, cx = 0, cy = 0, on = false;
  function tick() {
    cx += (gx - cx) * .1; cy += (gy - cy) * .1;
    g.style.left = cx + 'px'; g.style.top = cy + 'px';
    if (Math.abs(gx - cx) > .3 || Math.abs(gy - cy) > .3) requestAnimationFrame(tick); else on = false;
  }
  document.addEventListener('mousemove', e => { gx = e.clientX; gy = e.clientY; if (!on) { on = true; requestAnimationFrame(tick); } }, { passive: true });
})();

// ── CANVAS BACKGROUND ──
(function () {
  const cv = document.getElementById('bg'); if (!cv) return;
  const ctx = cv.getContext('2d');
  let W, H;
  function resize() { W = cv.width = innerWidth; H = cv.height = innerHeight; }
  resize(); addEventListener('resize', resize, { passive: true });
  let px = -1, py = -1, pA = false;
  document.addEventListener('mousemove', e => { px = e.clientX; py = e.clientY; pA = true; }, { passive: true });
  document.addEventListener('touchmove', e => { if (e.touches[0]) { px = e.touches[0].clientX; py = e.touches[0].clientY; pA = true; } }, { passive: true });
  document.addEventListener('mouseleave', () => pA = false, { passive: true });
  document.addEventListener('touchend', () => pA = false, { passive: true });
  const N = 45, P = [];
  for (let i = 0; i < N; i++) P.push({ x: Math.random() * 2000, y: Math.random() * 2000, r: Math.random() * .85 + .15, vy: -(Math.random() * .16 + .03), vx: (Math.random() - .5) * .07, a: Math.random() * .28 + .04, t: Math.random() * 6.28, ts: Math.random() * .007 + .002, gold: Math.random() > .5 });
  function frame() {
    ctx.clearRect(0, 0, W, H);
    for (let i = 0; i < N; i++) for (let j = i + 1; j < N; j++) { const dx = P[i].x - P[j].x, dy = P[i].y - P[j].y, d = dx * dx + dy * dy; if (d < 6500) { ctx.beginPath(); ctx.moveTo(P[i].x, P[i].y); ctx.lineTo(P[j].x, P[j].y); ctx.strokeStyle = `rgba(201,168,76,${(1 - d / 6500) * .03})`; ctx.lineWidth = .3; ctx.stroke(); } }
    for (let i = 0; i < N; i++) {
      const p = P[i];
      if (pA) { const dx = p.x - px, dy = p.y - py, dist = Math.sqrt(dx * dx + dy * dy); if (dist < 110 && dist > 0) { const f = (110 - dist) / 110 * .22; p.x += dx / dist * f; p.y += dy / dist * f; } }
      p.x += p.vx; p.y += p.vy; p.t += p.ts;
      if (p.y < -5) { p.x = Math.random() * W; p.y = H + 5; } if (p.x < -5) p.x = W + 5; if (p.x > W + 5) p.x = -5;
      const a = p.a * (.5 + .5 * Math.sin(p.t));
      ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, 6.28);
      ctx.fillStyle = p.gold ? `rgba(201,168,76,${a})` : `rgba(218,212,198,${a * .18})`; ctx.fill();
    }
    const vg = ctx.createRadialGradient(W / 2, H / 2, H * .08, W / 2, H / 2, H * .78);
    vg.addColorStop(0, 'rgba(6,5,4,0)'); vg.addColorStop(1, 'rgba(4,3,2,.48)');
    ctx.fillStyle = vg; ctx.fillRect(0, 0, W, H);
    requestAnimationFrame(frame);
  }
  frame();
})();

// ── HERO 3D TILT (mouse + touch + gyro) ──
const showcase = document.getElementById('heroShowcase');
if (showcase) {
  let raf = null; const MX = 9;
  function tilt(xd, yd) { if (raf) return; raf = requestAnimationFrame(() => { showcase.style.transform = `perspective(800px) rotateX(${yd}deg) rotateY(${xd}deg)`; raf = null; }); }
  document.addEventListener('mousemove', e => { const r = showcase.getBoundingClientRect(); if (!r.width) return; tilt(((e.clientX - r.left) / r.width - .5) * MX, ((e.clientY - r.top) / r.height - .5) * -MX * .7); }, { passive: true });
  showcase.addEventListener('touchmove', e => { if (!e.touches[0]) return; const r = showcase.getBoundingClientRect(); tilt(((e.touches[0].clientX - r.left) / r.width - .5) * MX, ((e.touches[0].clientY - r.top) / r.height - .5) * -MX * .7); }, { passive: true });
  function rst() { showcase.style.transform = 'perspective(800px) rotateX(0) rotateY(0)'; }
  document.addEventListener('mouseleave', rst, { passive: true }); showcase.addEventListener('touchend', rst, { passive: true });
  function gyro(e) { tilt(Math.max(-MX, Math.min(MX, (e.gamma || 0) * .3)), Math.max(-MX, Math.min(MX, ((e.beta || 0) - 40) * -.22))); }
  if (typeof DeviceOrientationEvent !== 'undefined') {
    if (typeof DeviceOrientationEvent.requestPermission === 'function') document.body.addEventListener('click', function rq() { DeviceOrientationEvent.requestPermission().then(s => { if (s === 'granted') addEventListener('deviceorientation', gyro, { passive: true }); }).catch(() => {}); document.body.removeEventListener('click', rq); }, { once: true });
    else addEventListener('deviceorientation', gyro, { passive: true });
  }
}

// ── TILT CARDS ──
(function () {
  const cards = document.querySelectorAll('.tilt-card'); const T = 4.5;
  cards.forEach(c => {
    let r = null;
    function mv(cx, cy) { if (r) return; r = requestAnimationFrame(() => { const b = c.getBoundingClientRect(); c.style.transform = `perspective(500px) rotateX(${-((cy - b.top) / b.height - .5) * T}deg) rotateY(${((cx - b.left) / b.width - .5) * T}deg) translateZ(2px)`; r = null; }); }
    c.addEventListener('mousemove', e => mv(e.clientX, e.clientY), { passive: true });
    c.addEventListener('touchmove', e => { if (e.touches[0]) mv(e.touches[0].clientX, e.touches[0].clientY); }, { passive: true });
    c.addEventListener('mouseleave', () => { c.style.transform = ''; }, { passive: true });
    c.addEventListener('touchend', () => { c.style.transform = ''; }, { passive: true });
  });
})();

// ── NAV ──
addEventListener('scroll', () => document.getElementById('nav').classList.toggle('solid', scrollY > 36), { passive: true });

// ── REVEALS ──
const ro = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { setTimeout(() => e.target.classList.add('in'), +e.target.dataset.d || 0); ro.unobserve(e.target); } }), { threshold: .06 });
document.querySelectorAll('.glass,.ps,.pillar').forEach((el, i) => { el.classList.add('reveal'); el.dataset.d = (i % 5) * 50; ro.observe(el); });

// ── HERO ENTRANCE ──
document.addEventListener('DOMContentLoaded', () => {
  ['.hero-label', '.hero-title', '.hero-body', '.hero-ctas', '.hero-stats'].forEach((s, i) => {
    const el = document.querySelector(s); if (!el) return;
    el.style.cssText = `opacity:0;transform:translateY(14px);transition:opacity .5s ${.08 + i * .065}s ease,transform .5s ${.08 + i * .065}s ease`;
    requestAnimationFrame(() => { el.style.opacity = '1'; el.style.transform = 'translateY(0)'; });
  });
  const hr = document.querySelector('.hero-right');
  if (hr) { hr.style.cssText = 'opacity:0;transform:translateX(14px);transition:opacity .65s .28s ease,transform .65s .28s ease'; requestAnimationFrame(() => { hr.style.opacity = '1'; hr.style.transform = 'translateX(0)'; }); }
});

// ── HELPERS ──
function highlightToggle(id, on) { document.getElementById(id).classList.toggle('on', on); }
function setPrompt(btn) { document.getElementById('mainPrompt').value = btn.textContent; document.getElementById('mainPrompt').focus(); document.getElementById('studio').scrollIntoView({ behavior: 'smooth', block: 'start' }); }
function copyEl(id) { const el = document.getElementById(id); if (el) navigator.clipboard.writeText(el.innerText); }

// ═══════════════════════════════════════
// MODALS
// ═══════════════════════════════════════
function openBookDemo() { document.getElementById('bookDemoModal').classList.remove('hidden'); document.body.style.overflow = 'hidden'; initGlow('demoModalInner'); }
function closeBookDemo() { document.getElementById('bookDemoModal').classList.add('hidden'); document.body.style.overflow = ''; }
function openServices() { document.getElementById('servicesModal').classList.remove('hidden'); document.body.style.overflow = 'hidden'; initGlow('servicesModalInner'); }
function closeServices() { document.getElementById('servicesModal').classList.add('hidden'); document.body.style.overflow = ''; }
function initGlow(id) {
  const m = document.getElementById(id); if (!m || m._g) return; m._g = true;
  const g = document.createElement('div');
  g.style.cssText = 'position:absolute;pointer-events:none;z-index:0;width:220px;height:220px;border-radius:50%;background:radial-gradient(circle,rgba(201,168,76,.04) 0%,transparent 55%);transform:translate(-50%,-50%);transition:opacity .2s;opacity:0;top:0;left:0';
  m.appendChild(g);
  let r = null;
  m.addEventListener('mousemove', e => { if (r) return; r = requestAnimationFrame(() => { const b = m.getBoundingClientRect(); g.style.left = (e.clientX - b.left) + 'px'; g.style.top = (e.clientY - b.top) + 'px'; g.style.opacity = '1'; r = null; }); }, { passive: true });
  m.addEventListener('mouseleave', () => g.style.opacity = '0', { passive: true });
}

// ═══════════════════════════════════════
// IMAGE GENERATION ENGINE
// Multi-provider with graceful fallback
// ═══════════════════════════════════════

function buildPrompt(text, piece, metal, stone, style) {
  const sm = {
    'modern luxury': 'luxury studio photo, black velvet background, studio macro lighting, professional product photography',
    'art deco': '1920s art deco jewellery, geometric patterns, editorial photo',
    'vintage romantic': 'vintage jewellery, warm golden bokeh, heirloom feel',
    'minimalist': 'minimalist jewellery, white background, clean shadows',
    'avant-garde': 'avant-garde jewellery, dramatic editorial lighting',
    'bohemian artisan': 'bohemian handcrafted jewellery, natural surface'
  };
  const st = stone !== 'none' ? stone + ', ' : '';
  // Keep prompt SHORT for faster generation
  return `${piece} jewellery, ${text}, ${st}${metal}, ${sm[style] || sm['modern luxury']}, photorealistic, sharp focus`;
}

let _lastPrompt = '', _currentSrc = '';

// ── Load image with timeout ──
function loadImg(url, ms) {
  return new Promise((res, rej) => {
    const img = new Image();
    const t = setTimeout(() => { img.src = ''; rej('timeout'); }, ms);
    img.onload = () => { clearTimeout(t); res(url); };
    img.onerror = () => { clearTimeout(t); rej('error'); };
    img.src = url;
  });
}

// ── Get Pollinations URL (keep prompt shorter for speed) ──
function getUrl(prompt, size) {
  const seed = Math.floor(Math.random() * 999999);
  const s = size || 512;
  return `https://image.pollinations.ai/prompt/${encodeURIComponent(prompt)}?width=${s}&height=${s}&nologo=true&seed=${seed}`;
}

// ── Beautiful SVG fallback (always works, no API) ──
function createFallbackSVG(piece, stone, metal) {
  const colors = {
    diamond: ['#e8e8f0', '#b8c0d0'], sapphire: ['#2a4494', '#1a2858'],
    emerald: ['#1a6b3c', '#0d4a28'], ruby: ['#9b1a2e', '#6b0f1e'],
    pearl: ['#f0ede8', '#d8d2c8'], amethyst: ['#6b2fa0', '#4a1870'], none: ['#c9a84c', '#8b6a1e']
  };
  const metalColors = {
    'yellow gold 18k': '#c9a84c', 'rose gold 18k': '#c4866a',
    'white gold 18k': '#d0ccc4', 'platinum 950': '#c8c4bc', 'sterling silver 925': '#b8b4ac'
  };
  const [sc1, sc2] = colors[stone] || colors.diamond;
  const mc = metalColors[metal] || '#c9a84c';
  
  const shapes = {
    ring: `<ellipse cx="256" cy="280" rx="110" ry="48" fill="none" stroke="${mc}" stroke-width="12"/><ellipse cx="256" cy="280" rx="95" ry="38" fill="none" stroke="${mc}" stroke-width="5" opacity=".3"/><circle cx="256" cy="232" r="32" fill="url(#sg)"/><circle cx="256" cy="232" r="24" fill="url(#sg)" opacity=".6"/><circle cx="256" cy="232" r="14" fill="#fff" opacity=".3"/>`,
    necklace: `<path d="M128,180 Q256,320 384,180" fill="none" stroke="${mc}" stroke-width="5"/><path d="M128,180 Q256,330 384,180" fill="none" stroke="${mc}" stroke-width="2" opacity=".3"/><circle cx="256" cy="290" r="26" fill="url(#sg)"/><circle cx="256" cy="290" r="16" fill="#fff" opacity=".25"/>`,
    bracelet: `<ellipse cx="256" cy="256" rx="120" ry="80" fill="none" stroke="${mc}" stroke-width="8"/><ellipse cx="256" cy="256" rx="105" ry="68" fill="none" stroke="${mc}" stroke-width="3" opacity=".3"/>` + Array.from({length:8},(_,i)=>{const a=i*Math.PI/4;return `<circle cx="${256+110*Math.cos(a)}" cy="${256+75*Math.sin(a)}" r="8" fill="url(#sg)"/>`}).join(''),
    earrings: `<line x1="180" y1="120" x2="180" y2="160" stroke="${mc}" stroke-width="3"/><circle cx="180" cy="190" r="28" fill="url(#sg)"/><circle cx="180" cy="190" r="18" fill="#fff" opacity=".2"/><line x1="332" y1="120" x2="332" y2="160" stroke="${mc}" stroke-width="3"/><circle cx="332" cy="190" r="28" fill="url(#sg)"/><circle cx="332" cy="190" r="18" fill="#fff" opacity=".2"/>`,
    pendant: `<line x1="256" y1="100" x2="256" y2="180" stroke="${mc}" stroke-width="3"/><polygon points="256,180 226,240 256,270 286,240" fill="url(#sg)" stroke="${mc}" stroke-width="2"/><polygon points="256,195 240,235 256,255 272,235" fill="#fff" opacity=".15"/>`,
    brooch: `<circle cx="256" cy="256" r="70" fill="none" stroke="${mc}" stroke-width="6"/>` + Array.from({length:6},(_,i)=>{const a=i*Math.PI/3;return `<circle cx="${256+55*Math.cos(a)}" cy="${256+55*Math.sin(a)}" r="12" fill="url(#sg)"/>`}).join('') + `<circle cx="256" cy="256" r="20" fill="url(#sg)"/>`
  };

  return `data:image/svg+xml,${encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><defs><radialGradient id="sg"><stop offset="0%" stop-color="${sc1}"/><stop offset="100%" stop-color="${sc2}"/></radialGradient><radialGradient id="bg"><stop offset="0%" stop-color="#1a1814"/><stop offset="100%" stop-color="#0a0908"/></radialGradient></defs><rect width="512" height="512" fill="url(#bg)"/><circle cx="256" cy="256" r="200" fill="none" stroke="rgba(201,168,76,.04)" stroke-width=".5"/>${shapes[piece] || shapes.ring}<text x="256" y="460" text-anchor="middle" fill="rgba(201,168,76,.2)" font-family="serif" font-size="11">VLTAVA Preview</text></svg>`)}`;
}

// ── Smart image loader with multiple strategies ──
async function smartLoad(prompt, piece, stone, metal) {
  if (!Rate.ok()) return { src: null, type: 'rate' };

  // Strategy 1: Pollinations main (30s timeout, bigger images)
  try {
    const url = getUrl(prompt, 768);
    const src = await loadImg(url, 30000);
    return { src, type: 'ai' };
  } catch (e) { /* next */ }

  // Strategy 2: Retry with shorter prompt + smaller image (faster)
  try {
    const shortPrompt = prompt.split(',').slice(0, 3).join(',');
    const url = getUrl(shortPrompt, 512);
    const src = await loadImg(url, 20000);
    return { src, type: 'ai' };
  } catch (e) { /* next */ }

  // Strategy 3: Even simpler prompt
  try {
    const simplePrompt = `luxury ${piece || 'ring'} jewellery, ${stone || 'diamond'}, studio photo`;
    const url = getUrl(simplePrompt, 512);
    const src = await loadImg(url, 15000);
    return { src, type: 'ai' };
  } catch (e) { /* fallback */ }

  // Strategy 4: SVG preview (always works, instant)
  return { src: createFallbackSVG(piece || 'ring', stone || 'diamond', metal || 'yellow gold 18k'), type: 'preview' };
}

// ═══════════════════════════════════════
// HERO QUICK GENERATE
// ═══════════════════════════════════════
async function heroGenerate() {
  const val = document.getElementById('heroPrompt').value.trim();
  if (!val) { document.getElementById('heroPrompt').focus(); return; }

  const btn = document.getElementById('heroBtn');
  btn.classList.add('loading'); btn.disabled = true;
  document.getElementById('showcaseIdle').classList.add('hidden');
  document.getElementById('showcaseImg').classList.add('hidden');
  const loading = document.getElementById('showcaseLoading');
  loading.classList.remove('hidden');
  document.getElementById('showcaseMsg').textContent = 'Rendering...';

  const prompt = buildPrompt(val, 'jewellery', 'precious metal', 'gemstone', 'modern luxury');
  _lastPrompt = prompt;

  const result = await smartLoad(prompt, 'ring', 'diamond', 'yellow gold 18k');
  const img = document.getElementById('showcaseImg');

  loading.classList.add('hidden');
  if (result.src) {
    img.src = result.src; _currentSrc = result.src;
    img.classList.remove('hidden');
    if (result.type === 'preview') {
      document.getElementById('showcaseMsg').textContent = 'Preview shown. AI render unavailable right now.';
    }
  } else {
    const idle = document.getElementById('showcaseIdle');
    idle.classList.remove('hidden');
    idle.querySelector('p').textContent = 'Too many requests. Wait a moment.';
  }
  btn.classList.remove('loading'); btn.disabled = false; btn.textContent = '\u2726';
}

// ═══════════════════════════════════════
// MAIN GENERATE
// ═══════════════════════════════════════
async function generateAll() {
  const text = document.getElementById('mainPrompt').value.trim();
  if (!text) { const ta = document.getElementById('mainPrompt'); ta.style.borderColor = 'rgba(255,80,80,.5)'; ta.focus(); setTimeout(() => ta.style.borderColor = '', 1500); return; }

  const piece = document.getElementById('selPiece').value;
  const metal = document.getElementById('selMetal').value;
  const stone = document.getElementById('selStone').value;
  const style = document.getElementById('selStyle').value;
  const doImg = document.getElementById('doImage').checked;
  const doMfg = document.getElementById('doMfg').checked;
  const doCpy = document.getElementById('doCopy').checked;

  const btn = document.getElementById('genBtn'), lbl = document.getElementById('genBtnLabel'), sp = document.getElementById('genSpinner');
  btn.disabled = true; lbl.classList.add('hidden'); sp.classList.remove('hidden');

  const tasks = [];
  if (doImg) tasks.push(runImage(text, piece, metal, stone, style));
  if (doMfg) tasks.push(runBlueprint(piece, metal, stone, style, text));
  if (doCpy) tasks.push(runCopy(text, piece, metal, stone, style));
  await Promise.allSettled(tasks);

  btn.disabled = false; lbl.classList.remove('hidden'); sp.classList.add('hidden');
}

// ── Image render ──
async function runImage(text, piece, metal, stone, style) {
  document.getElementById('stageEmpty').classList.add('hidden');
  document.getElementById('resultImg').classList.add('hidden');
  document.getElementById('stageLoading').classList.remove('hidden');
  document.getElementById('imgToolbar').classList.add('hidden');

  const steps = ['ls0', 'ls1', 'ls2'];
  steps.forEach(id => { const e = document.getElementById(id); e.className = 'lstep'; e.textContent = { ls0: 'Building prompt', ls1: 'Reaching renderer', ls2: 'Processing' }[id]; });
  document.getElementById('ls0').classList.add('active');

  const t1 = setTimeout(() => { document.getElementById('ls0').className = 'lstep done'; document.getElementById('ls0').textContent = 'Done'; document.getElementById('ls1').classList.add('active'); }, 400);
  const t2 = setTimeout(() => { document.getElementById('ls1').className = 'lstep done'; document.getElementById('ls1').textContent = 'Done'; document.getElementById('ls2').classList.add('active'); }, 1500);

  const prompt = buildPrompt(text, piece, metal, stone, style);
  _lastPrompt = prompt;
  const result = await smartLoad(prompt, piece, stone, metal);
  clearTimeout(t1); clearTimeout(t2);
  const img = document.getElementById('resultImg');

  if (result.src) {
    img.src = result.src; _currentSrc = result.src;
    document.getElementById('stageLoading').classList.add('hidden');
    img.classList.remove('hidden');
    document.getElementById('imgToolbar').classList.remove('hidden');
    if (result.type === 'preview') {
      // Show a subtle note that this is a preview
      const tb = document.getElementById('imgToolbar');
      if (!tb.querySelector('.preview-note')) {
        const n = document.createElement('span');
        n.className = 'preview-note';
        n.style.cssText = 'font-size:9px;color:rgba(201,168,76,.5);margin-left:4px';
        n.textContent = 'Preview (AI unavailable)';
        tb.appendChild(n);
      }
    } else {
      const pn = document.querySelector('.preview-note');
      if (pn) pn.remove();
    }
  } else {
    document.getElementById('stageLoading').classList.add('hidden');
    const e = document.getElementById('stageEmpty');
    e.classList.remove('hidden');
    e.querySelector('p').textContent = 'Rate limited. Wait a moment and retry.';
    e.querySelector('span').textContent = '';
  }
}

function regenImg() {
  if (!_lastPrompt) return;
  const img = document.getElementById('resultImg');
  img.classList.add('hidden');
  document.getElementById('stageLoading').classList.remove('hidden');
  const url = getUrl(_lastPrompt, 768);
  const t = setTimeout(() => { img.onerror(); }, 30000);
  img.onload = () => { clearTimeout(t); document.getElementById('stageLoading').classList.add('hidden'); img.classList.remove('hidden'); _currentSrc = url; };
  img.onerror = () => { clearTimeout(t); document.getElementById('stageLoading').classList.add('hidden'); document.getElementById('stageEmpty').classList.remove('hidden'); };
  img.src = url;
}

function downloadImg() {
  if (!_currentSrc) return;
  const a = document.createElement('a'); a.href = _currentSrc; a.download = 'vltava-design.jpg'; a.target = '_blank'; a.click();
}

// ═══════════════════════════════════════
// SPECS (blueprint)
// ═══════════════════════════════════════
const METALS = {
  'yellow gold 18k': { alloy: 'Au750 Yellow Gold', purity: '18k, 750 parts per thousand', note: 'Anneal before forming. Pickle in 10% sulphuric after soldering.' },
  'rose gold 18k': { alloy: 'Au750 Rose Gold (Cu 22.5%)', purity: '18k, 750 parts per thousand', note: 'Higher copper content. Pickle promptly to prevent firescale.' },
  'white gold 18k': { alloy: 'Au750 White Gold (Pd alloy)', purity: '18k, 750 parts per thousand', note: 'Rhodium plate to 0.12 microns after final polish.' },
  'platinum 950': { alloy: 'Pt950 (Ru 5%)', purity: '950 parts per thousand', note: 'Dedicated tools. No cross-contamination with gold.' },
  'sterling silver 925': { alloy: 'Ag925 Sterling Silver', purity: '925 parts per thousand', note: 'Pickle in citric acid. Anti-tarnish coat for retail.' }
};
const STONES = {
  diamond: { cut: 'Round Brilliant, 58 facets', spec: 'GIA cert, min VS2/G+', dim: '6.5mm, approx 1.0ct' },
  sapphire: { cut: 'Oval Mixed Cut', spec: 'Origin cert, vivid blue', dim: '7x9mm, approx 2.0ct' },
  emerald: { cut: 'Emerald Step Cut', spec: 'Colombian preferred, type II', dim: '6x8mm, approx 1.5ct' },
  ruby: { cut: 'Oval Brilliant', spec: 'AGL cert, pigeon-blood', dim: '6x8mm, approx 1.5ct' },
  pearl: { cut: 'No faceting, drill 0.8mm', spec: 'Nacre min 0.5mm, AAA South Sea', dim: '8 to 10mm dia' },
  amethyst: { cut: 'Princess or Oval Brilliant', spec: 'Deep Siberian violet, eye-clean', dim: '8x10mm, approx 3ct' },
  none: { cut: 'N/A', spec: 'Metal focus', dim: 'N/A' }
};
const PIECES = {
  ring: { size: 'Inner dia 17mm (US7)', weight: '4 to 8g', band: '2.5 to 3.5mm' },
  necklace: { size: 'Chain 45cm, pendant 20 to 40mm', weight: '8 to 18g', band: 'N/A' },
  bracelet: { size: '180mm internal, 6 to 8mm wide', weight: '12 to 25g', band: '6mm' },
  earrings: { size: 'Stud 10 to 14mm, drop max 40mm', weight: '1.5 to 3.5g each', band: 'N/A' },
  pendant: { size: '25 to 45mm drop, bail 8 to 10mm', weight: '4 to 12g', band: 'N/A' },
  brooch: { size: '35 to 55mm, pin 30 to 40mm', weight: '8 to 20g', band: 'N/A' }
};

async function runBlueprint(piece, metal, stone, style, text) {
  document.getElementById('mfgBody').innerHTML = '<div class="out-placeholder" style="display:flex;align-items:center;gap:6px"><div class="mini-spinner" style="width:14px;height:14px;border-width:2px"></div>Building specs...</div>';
  let spec = null;
  try {
    const res = await Promise.race([
      fetchText(buildBpPrompt(piece, metal, stone, style, text)),
      new Promise((_, r) => setTimeout(() => r('timeout'), 12000))
    ]);
    if (res) { const m = res.match(/\{[\s\S]*\}/); if (m) spec = JSON.parse(m[0]); }
  } catch (e) { }
  if (!spec) spec = buildBpLocal(piece, metal, stone, style);
  renderBp(spec);
  document.getElementById('mfgCopyBtn').classList.remove('hidden');
}

function buildBpPrompt(piece, metal, stone, style, text) {
  return `You are a master jeweller. JSON only, no markdown. Manufacturing spec for: "${text}" (${piece}, ${metal}, ${stone}, ${style}). Keys: dimensions(size,stone_dim,weight,band), materials(alloy,purity,stone,cut,secondary), setting(type,prongs,technique), surface(finish,texture), steps(6 items), tools(4 items), qc, hours`;
}

function buildBpLocal(piece, metal, stone, style) {
  const m = METALS[metal] || METALS['yellow gold 18k'], s = STONES[stone] || STONES.diamond, p = PIECES[piece] || PIECES.ring;
  const setMap = { 'modern luxury': '4-claw prong', 'art deco': 'Bead and milgrain border', 'vintage romantic': '6-claw fishtail prong', 'minimalist': 'Flush bezel-set', 'avant-garde': 'Tension or asymmetric', 'bohemian artisan': 'Rubover bezel, hammered' };
  const finMap = { 'modern luxury': 'High polish', 'art deco': 'High polish + step borders', 'vintage romantic': 'Satin shank + polished', 'minimalist': 'High polish throughout', 'avant-garde': 'Brushed matte', 'bohemian artisan': 'Hammered planished' };
  return {
    dimensions: { size: p.size, stone_dim: s.dim, weight: p.weight, band: p.band },
    materials: { alloy: m.alloy, purity: m.purity, stone: stone !== 'none' ? stone.charAt(0).toUpperCase() + stone.slice(1) + ' (natural)' : 'None', cut: s.cut, secondary: style !== 'minimalist' && stone !== 'none' ? 'Accent pave 1.2 to 1.5mm VS1' : 'None' },
    setting: { type: setMap[style] || '4-claw prong', prongs: piece === 'ring' && stone !== 'none' ? '4 or 6' : 'N/A', technique: 'Hand bench-set, burnished closed' },
    surface: { finish: finMap[style] || 'High polish', texture: style === 'bohemian artisan' ? 'Hammered' : 'Smooth hand-finished' },
    steps: [
      `Mill and roll ${m.alloy}. Anneal at 700C, quench, pickle.`,
      `Cut, shape, fabricate ${piece} body. Solder structural joins.`,
      stone !== 'none' ? `Drill stone seat. Build ${setMap[style] || '4-claw prong'} setting.` : 'Refine decorative elements. File seams flush.',
      'Sand 400, 800, 1200 grit. Tripoli pre-polish.',
      stone !== 'none' ? `Set ${stone}. Check at 10x loupe: zero movement.` : 'Final refinement. Ultrasonic clean.',
      metal === 'white gold 18k' ? 'Rhodium plate 0.12 microns. Ultrasonic. Inspect.' : 'High-polish with rouge. Ultrasonic, steam. Hallmark.'
    ],
    tools: ['Rolling mill, annealing torch', 'Flex shaft + setting burs', 'Prong pusher, burnisher', '10x loupe, 0.01g scale, callipers'],
    qc: `${s.spec}. Zero stone movement at 10x. Uniform surface. All joins solid.`,
    hours: ['art deco', 'vintage romantic', 'bohemian artisan'].includes(style) ? '20 to 38 hours' : '10 to 18 hours',
    note: m.note
  };
}

function renderBp(s) {
  const row = (k, v) => v && v !== 'N/A' ? `<div class="bp-row"><span class="bp-key">${k}</span><span class="bp-val">${v}</span></div>` : '';
  document.getElementById('mfgBody').innerHTML = `<div id="mfgContent">
    <div class="bp-section"><div class="bp-title">Dimensions</div>${row('Size', s.dimensions?.size)}${row('Stone', s.dimensions?.stone_dim)}${row('Weight', s.dimensions?.weight)}${row('Band', s.dimensions?.band)}</div>
    <div class="bp-section"><div class="bp-title">Materials</div>${row('Alloy', s.materials?.alloy)}${row('Purity', s.materials?.purity)}${row('Stone', s.materials?.stone)}${row('Cut', s.materials?.cut)}${row('Accents', s.materials?.secondary !== 'None' ? s.materials?.secondary : null)}</div>
    <div class="bp-section"><div class="bp-title">Setting + Surface</div>${row('Setting', s.setting?.type)}${row('Prongs', s.setting?.prongs)}${row('Technique', s.setting?.technique)}${row('Finish', s.surface?.finish)}${row('Texture', s.surface?.texture)}</div>
    <div class="bp-section"><div class="bp-title">Assembly</div><ol class="bp-steps">${(s.steps||[]).map(x=>`<li>${x}</li>`).join('')}</ol></div>
    <div class="bp-section"><div class="bp-title">Tools</div><ol class="bp-steps">${(s.tools||[]).map(x=>`<li>${x}</li>`).join('')}</ol></div>
    <div class="bp-note"><strong>QC</strong><br/>${s.qc||''}</div>
    <div class="bp-note" style="margin-top:4px"><strong>BENCH TIME</strong><br/>${s.hours||''}</div>
    ${s.note?`<div class="bp-note" style="margin-top:4px"><strong>METAL</strong><br/>${s.note}</div>`:''}
  </div>`;
}

// ═══════════════════════════════════════
// MARKETING COPY
// ═══════════════════════════════════════
async function runCopy(text, piece, metal, stone, style) {
  document.getElementById('copyBody').innerHTML = '<div class="out-placeholder" style="display:flex;align-items:center;gap:6px"><div class="mini-spinner" style="width:14px;height:14px;border-width:2px"></div>Writing copy...</div>';
  let copy = null;
  try {
    const res = await Promise.race([
      fetchText(buildCpPrompt(text, piece, metal, stone, style)),
      new Promise((_, r) => setTimeout(() => r('timeout'), 12000))
    ]);
    if (res) { const m = res.match(/\{[\s\S]*?\}/); if (m) copy = JSON.parse(m[0]); }
  } catch (e) { }
  if (!copy) copy = buildCpLocal(piece, metal, stone, style);
  renderCp(copy);
  document.getElementById('copyCopyBtn').classList.remove('hidden');
}

function buildCpPrompt(text, piece, metal, stone, style) {
  return `You are a jewellery house creative director. JSON only. Luxury copy for: "${text}" (${piece}, ${metal}, ${stone}). Keys: headline (5 words), body (3 sentences), tagline (under 8 words), instagram (caption + 3 hashtags)`;
}

function buildCpLocal(piece, metal, stone, style) {
  const Cap = s => s.charAt(0).toUpperCase() + s.slice(1);
  const adj = { diamond: 'brilliant', sapphire: 'celestial', emerald: 'verdant', ruby: 'ardent', pearl: 'luminous', amethyst: 'regal', none: 'refined' }[stone] || 'radiant';
  const met = { 'yellow gold 18k': 'warm gold', 'rose gold 18k': 'blush gold', 'white gold 18k': 'white gold', 'platinum 950': 'platinum', 'sterling silver 925': 'silver' }[metal] || 'gold';
  const T = {
    'modern luxury': { headline: `The ${Cap(adj)} ${Cap(piece)}`, body: `Sculpted in ${met}. Made for people who notice detail. Wear it like you mean it.`, tagline: 'For those who show up.', instagram: `Crafted in ${met}. Worn with intent. #FineJewellery #LuxuryDesign #VLTAVA` },
    'art deco': { headline: `Deco ${Cap(piece)}`, body: `When geometry became poetry. This ${piece} reimagines the 1920s in ${met}. Precision that Poiret would have loved.`, tagline: 'Geometry made glorious.', instagram: `Art deco reborn in ${met}. #ArtDeco #VintageLuxury #JewelleryDesign` },
    'vintage romantic': { headline: `Heirloom ${Cap(piece)}`, body: `Some pieces aren't bought. They're found. This ${adj} ${piece} carries warmth from another era.`, tagline: 'Some beauty is permanent.', instagram: `Heirloom pieces for modern people. #VintageJewellery #Timeless #VLTAVA` },
    'minimalist': { headline: `The ${Cap(met)} ${Cap(piece)}`, body: `Nothing extra. ${Cap(met)}, ${stone !== 'none' ? stone : 'pure form'}, silence. The language of restraint.`, tagline: 'Less. And everything.', instagram: `When less becomes everything. #MinimalistJewellery #CleanDesign #VLTAVA` },
    'avant-garde': { headline: `Disrupted ${Cap(piece)}`, body: `This ${piece} refuses the expected. ${Cap(met)} that challenges its own history. Not decoration. Declaration.`, tagline: 'Form as rebellion.', instagram: `Jewellery that starts conversations. #AvantGarde #WearableArt #VLTAVA` },
    'bohemian artisan': { headline: `Wild ${Cap(piece)}`, body: `Born in the studio. ${Cap(met)} shaped by hand, ${stone !== 'none' ? `${stone} chosen for soul` : 'every curve instinctive'}. Yours alone.`, tagline: 'Every jewel has a journey.', instagram: `Handcrafted with soul. #BohemianJewellery #Handmade #VLTAVA` }
  };
  return T[style] || T['modern luxury'];
}

function renderCp(c) {
  const esc = s => String(s).replace(/\\/g, '\\\\').replace(/`/g, '\\`').replace(/\$/g, '\\$');
  document.getElementById('copyBody').innerHTML = `<div id="copyContent">
    <div class="cp-headline">${c.headline}</div>
    <div class="cp-body">${c.body}</div>
    <div class="cp-tagline">// ${c.tagline}</div>
    <div class="cp-social-label">Instagram</div>
    <div class="cp-social">${c.instagram}</div>
    <div class="cp-btns">
      <button class="cp-btn" onclick="cpCopy(\`${esc(c.body)}\n\n// ${esc(c.tagline)}\`,this)">Copy Description</button>
      <button class="cp-btn" onclick="cpCopy(\`${esc(c.instagram)}\`,this)">Copy Caption</button>
      <button class="cp-btn" onclick="cpCopy(\`${esc(c.headline)}\n\n${esc(c.body)}\n\n// ${esc(c.tagline)}\n\n${esc(c.instagram)}\`,this)">Copy All</button>
    </div>
  </div>`;
}
function cpCopy(t, b) { navigator.clipboard.writeText(t).then(() => { const o = b.textContent; b.textContent = 'Copied'; setTimeout(() => b.textContent = o, 1400); }); }

// ── Pollinations text ──
async function fetchText(prompt) {
  if (!Rate.ok()) return null;
  const r = await fetch('https://text.pollinations.ai/openai', {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ model: 'openai', messages: [{ role: 'system', content: 'JSON only. No markdown.' }, { role: 'user', content: prompt }], max_tokens: 400, temperature: .5, jsonMode: true })
  });
  if (!r.ok) throw new Error(r.status);
  const d = await r.json();
  return d.choices?.[0]?.message?.content || null;
}

// ═══════════════════════════════════════
// WORKSHOP
// ═══════════════════════════════════════
function openWorkshop() {
  const src = document.getElementById('resultImg').src;
  if (src) document.getElementById('wsBaseImg').src = src;
  document.getElementById('workshopModal').classList.remove('hidden');
  document.body.style.overflow = 'hidden';
}
function closeWorkshop() { document.getElementById('workshopModal').classList.add('hidden'); document.body.style.overflow = ''; }

async function workshopGenerate() {
  const mod = document.getElementById('wsPrompt').value.trim();
  const metal = document.getElementById('wsMetal').value;
  const stone = document.getElementById('wsStone').value;
  const views = [...document.querySelectorAll('.vchip input:checked')].map(c => c.value);
  if (!mod && !metal && !stone && !views.length) { document.getElementById('wsPrompt').focus(); return; }

  const btn = document.getElementById('wsBtn'), lbl = document.getElementById('wsBtnLabel'), sp = document.getElementById('wsSpinner');
  btn.disabled = true; lbl.classList.add('hidden'); sp.classList.remove('hidden');

  const base = _lastPrompt || 'luxury jewellery';
  const variants = [{ label: mod || 'variation', prompt: buildPrompt(`${base}, ${mod}`, 'jewellery', metal || 'precious metal', stone || 'gemstone', 'modern luxury') }];
  views.forEach(v => variants.push({ label: v, prompt: buildPrompt(`${base}, ${v}`, 'jewellery', metal || 'precious metal', stone || 'gemstone', 'modern luxury') }));

  const gallery = document.getElementById('wsGallery'), grid = document.getElementById('wsGrid');
  gallery.classList.remove('hidden'); grid.innerHTML = '';

  variants.forEach((v, i) => {
    const d = document.createElement('div'); d.className = 'ws-thumb'; d.id = `wt${i}`;
    d.innerHTML = `<div style="aspect-ratio:1;background:rgba(0,0,0,.4);display:flex;align-items:center;justify-content:center;border-radius:6px"><div class="mini-spinner"></div></div><div class="ws-thumb-label">${v.label}</div>`;
    grid.appendChild(d);
  });

  await Promise.allSettled(variants.map((v, i) => new Promise(res => {
    const url = getUrl(v.prompt, 512);
    const t = setTimeout(() => { const el = document.getElementById(`wt${i}`); if (el) { const svg = createFallbackSVG('ring', 'diamond', 'yellow gold 18k'); el.innerHTML = `<img src="${svg}" alt="${v.label}"/><div class="ws-thumb-label">${v.label} (preview)</div>`; } res(); }, 30000);
    const img = new Image();
    img.onload = () => { clearTimeout(t); const el = document.getElementById(`wt${i}`); if (el) el.innerHTML = `<img src="${url}" alt="${v.label}"/><div class="ws-thumb-label">${v.label}</div><button class="ws-thumb-save" onclick="saveThumb('${url}','${v.label}')">Save</button>`; res(); };
    img.onerror = () => { clearTimeout(t); const el = document.getElementById(`wt${i}`); if (el) { const svg = createFallbackSVG('ring', 'diamond', 'yellow gold 18k'); el.innerHTML = `<img src="${svg}" alt="${v.label}"/><div class="ws-thumb-label">${v.label} (preview)</div>`; } res(); };
    img.src = url;
  })));

  btn.disabled = false; lbl.classList.remove('hidden'); sp.classList.add('hidden');
}

function saveThumb(url, label) { const a = document.createElement('a'); a.href = url; a.download = `vltava-${label.replace(/\s+/g, '-')}.jpg`; a.target = '_blank'; a.click(); }
