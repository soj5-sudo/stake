'use strict';
/* ══════════════════════════════════════════════════════
   VLTAVA — script.js
   Working image gen (Pollinations.ai Flux)
   Book Demo + Services modals with glow cursor
   Manufacturing blueprints · Luxury copy · Workshop
   ══════════════════════════════════════════════════════ */

// ── CANVAS BACKGROUND (lightweight, no performance impact) ──
(function() {
  const cv = document.getElementById('bg');
  const ctx = cv.getContext('2d');
  let W = cv.width = window.innerWidth;
  let H = cv.height = window.innerHeight;
  window.addEventListener('resize', () => { W = cv.width = window.innerWidth; H = cv.height = window.innerHeight; }, {passive:true});

  const pts = Array.from({length:80}, () => {
    const p = {};
    const reset = (init) => {
      p.x = Math.random()*W; p.y = init ? Math.random()*H : H+5;
      p.r = Math.random()*1.1+0.2; p.vy = -(Math.random()*.28+.05); p.vx = (Math.random()-.5)*.12;
      p.a = Math.random()*.4+.06; p.t = Math.random()*Math.PI*2; p.ts = Math.random()*.012+.003;
      p.gold = Math.random()>.6;
    };
    reset(true); p.reset = reset; return p;
  });

  function drawConns() {
    for (let i=0;i<pts.length;i++) for (let j=i+1;j<pts.length;j++) {
      const dx=pts[i].x-pts[j].x, dy=pts[i].y-pts[j].y, d=dx*dx+dy*dy;
      if (d<10000) {
        ctx.beginPath(); ctx.moveTo(pts[i].x,pts[i].y); ctx.lineTo(pts[j].x,pts[j].y);
        ctx.strokeStyle=`rgba(212,175,95,${(1-d/10000)*.055})`; ctx.lineWidth=.4; ctx.stroke();
      }
    }
  }

  let raf;
  function frame() {
    ctx.clearRect(0,0,W,H);
    ctx.fillStyle='#080705'; ctx.fillRect(0,0,W,H);
    drawConns();
    pts.forEach(p => {
      p.x+=p.vx; p.y+=p.vy; p.t+=p.ts;
      if (p.y<-5) p.reset(false);
      const a=p.a*(0.5+0.5*Math.sin(p.t));
      ctx.beginPath(); ctx.arc(p.x,p.y,p.r,0,Math.PI*2);
      ctx.fillStyle=p.gold?`rgba(212,175,95,${a})`:`rgba(240,232,216,${a*.3})`; ctx.fill();
    });
    const vg=ctx.createRadialGradient(W/2,H/2,H*.1,W/2,H/2,H*.9);
    vg.addColorStop(0,'rgba(8,7,5,0)'); vg.addColorStop(1,'rgba(5,4,3,0.6)');
    ctx.fillStyle=vg; ctx.fillRect(0,0,W,H);
    raf = requestAnimationFrame(frame);
  }
  frame();
})();

// ── 3D TILT on hero showcase (fast, throttled) ──
const showcase = document.getElementById('heroShowcase');
if (showcase) {
  let tiltRaf = null;
  document.addEventListener('mousemove', e => {
    if (tiltRaf) return;
    tiltRaf = requestAnimationFrame(() => {
      const r = showcase.getBoundingClientRect();
      if (!r.width) { tiltRaf=null; return; }
      const x = ((e.clientX - r.left)/r.width - .5)*10;
      const y = ((e.clientY - r.top)/r.height - .5)*-8;
      showcase.style.transform = `perspective(900px) rotateX(${y}deg) rotateY(${x}deg)`;
      tiltRaf = null;
    });
  }, {passive:true});
  document.addEventListener('mouseleave', () => { showcase.style.transform=''; }, {passive:true});
}

// ── NAV solid on scroll ──
window.addEventListener('scroll', () => {
  document.getElementById('nav').classList.toggle('solid', window.scrollY > 50);
}, {passive:true});

// ── Scroll reveals ──
const ro = new IntersectionObserver(entries => {
  entries.forEach(e => { if(e.isIntersecting){ setTimeout(()=>e.target.classList.add('in'), e.target.dataset.d||0); ro.unobserve(e.target); } });
}, {threshold:.1});
document.querySelectorAll('.glass,.ps,.pillar').forEach((el,i)=>{ el.classList.add('reveal'); el.dataset.d=(i%5)*70; ro.observe(el); });

// ── Hero entrance ──
document.addEventListener('DOMContentLoaded', () => {
  ['.hero-label','.hero-title','.hero-body','.hero-ctas','.hero-stats'].forEach((s,i)=>{
    const el=document.querySelector(s); if(!el) return;
    el.style.cssText=`opacity:0;transform:translateY(18px);transition:opacity .65s ${.15+i*.09}s ease,transform .65s ${.15+i*.09}s ease`;
    requestAnimationFrame(()=>{ el.style.opacity='1'; el.style.transform='translateY(0)'; });
  });
  const hr=document.querySelector('.hero-right');
  if(hr){ hr.style.cssText='opacity:0;transform:translateX(22px);transition:opacity .85s .4s ease,transform .85s .4s ease'; requestAnimationFrame(()=>{ hr.style.opacity='1'; hr.style.transform='translateX(0)'; }); }
});

// ── Toggle ──
function highlightToggle(id,checked){ document.getElementById(id).classList.toggle('on',checked); }

// ── Set prompt ──
function setPrompt(btn){ document.getElementById('mainPrompt').value=btn.textContent; document.getElementById('mainPrompt').focus(); document.getElementById('studio').scrollIntoView({behavior:'smooth',block:'start'}); }

function copyEl(id){ const el=document.getElementById(id); if(el) navigator.clipboard.writeText(el.innerText); }

// ══════════════════════════════════════════════════
// MODAL: BOOK DEMO
// ══════════════════════════════════════════════════
function openBookDemo() {
  const m = document.getElementById('bookDemoModal');
  m.classList.remove('hidden');
  document.body.style.overflow = 'hidden';
  initModalGlow('demoModalInner');
}
function closeBookDemo() {
  document.getElementById('bookDemoModal').classList.add('hidden');
  document.body.style.overflow = '';
}

// ══════════════════════════════════════════════════
// MODAL: SERVICES
// ══════════════════════════════════════════════════
function openServices() {
  const m = document.getElementById('servicesModal');
  m.classList.remove('hidden');
  document.body.style.overflow = 'hidden';
  initModalGlow('servicesModalInner');
}
function closeServices() {
  document.getElementById('servicesModal').classList.add('hidden');
  document.body.style.overflow = '';
}

// ── GLOW CURSOR on modals (follows cursor inside modal) ──
function initModalGlow(modalId) {
  const modal = document.getElementById(modalId);
  if (!modal || modal._glowInit) return;
  modal._glowInit = true;

  // Create glow element
  const glow = document.createElement('div');
  glow.style.cssText = `
    position:absolute;pointer-events:none;z-index:0;
    width:320px;height:320px;border-radius:50%;
    background:radial-gradient(circle, rgba(212,175,95,0.08) 0%, transparent 70%);
    transform:translate(-50%,-50%);
    transition:opacity .3s;opacity:0;
    top:0;left:0;
  `;
  modal.appendChild(glow);

  let glowRaf = null;
  function onMove(e) {
    if (glowRaf) return;
    glowRaf = requestAnimationFrame(() => {
      const r = modal.getBoundingClientRect();
      const x = e.clientX - r.left;
      const y = e.clientY - r.top;
      glow.style.left = x+'px';
      glow.style.top  = y+'px';
      glow.style.opacity = '1';
      glowRaf = null;
    });
  }
  function onLeave() { glow.style.opacity = '0'; }

  modal.addEventListener('mousemove', onMove, {passive:true});
  modal.addEventListener('mouseleave', onLeave, {passive:true});
}

// ══════════════════════════════════════════════════
// IMAGE GENERATION — Pollinations.ai Flux (FREE, no key)
// Direct image URL, no model loading, no API key
// ══════════════════════════════════════════════════
function buildImgPrompt(text, piece, metal, stone, style) {
  const styleMap = {
    'modern luxury':    'luxury jewellery studio photography, black velvet background, professional macro lighting, editorial',
    'art deco':         '1920s art deco jewellery, geometric patterns, platinum and diamond, editorial photography',
    'vintage romantic': 'vintage antique jewellery, warm golden bokeh light, romantic heirloom aesthetic, macro',
    'minimalist':       'minimalist fine jewellery photography, pure white background, clean sharp shadows, product shot',
    'avant-garde':      'high fashion avant-garde jewellery, dramatic Vogue editorial lighting, bold composition',
    'bohemian artisan': 'bohemian handcrafted jewellery, natural marble surface, artisan workshop, warm tones',
  };
  const stoneStr = stone !== 'none' ? `${stone} gemstone, ` : '';
  return `Professional macro studio photograph of a luxury ${piece}, ${text}, ${stoneStr}crafted in ${metal}, ${styleMap[style]||styleMap['modern luxury']}, photorealistic, 8K resolution, sharp focus, jewellery advertisement quality, no text, no watermark`;
}

let _lastPrompt = '';
let _currentSrc = '';

function getImgUrl(prompt) {
  _lastPrompt = prompt;
  const seed = Math.floor(Math.random() * 999999);
  return `https://image.pollinations.ai/prompt/${encodeURIComponent(prompt)}?width=768&height=768&model=flux&nologo=true&seed=${seed}`;
}

// ── Hero quick generate ──
function heroGenerate() {
  const val = document.getElementById('heroPrompt').value.trim();
  if (!val) { document.getElementById('heroPrompt').focus(); return; }

  const btn = document.getElementById('heroBtn');
  btn.textContent = '…'; btn.disabled = true;
  document.getElementById('showcaseIdle').classList.add('hidden');
  document.getElementById('showcaseImg').classList.add('hidden');
  document.getElementById('showcaseLoading').classList.remove('hidden');
  document.getElementById('showcaseMsg').textContent = 'Rendering…';

  const prompt = buildImgPrompt(val, 'jewellery piece', 'precious metal', 'gemstone', 'modern luxury');
  const url = getImgUrl(prompt);
  const img = document.getElementById('showcaseImg');

  img.onload = () => {
    document.getElementById('showcaseLoading').classList.add('hidden');
    img.classList.remove('hidden');
    btn.textContent = '✦'; btn.disabled = false;
  };
  img.onerror = () => {
    document.getElementById('showcaseLoading').classList.add('hidden');
    const idle = document.getElementById('showcaseIdle');
    idle.classList.remove('hidden');
    idle.querySelector('p').textContent = 'Retry or use the Studio below.';
    btn.textContent = '✦'; btn.disabled = false;
  };
  img.src = url;
}

// ── Main generate all ──
async function generateAll() {
  const text  = document.getElementById('mainPrompt').value.trim();
  const piece = document.getElementById('selPiece').value;
  const metal = document.getElementById('selMetal').value;
  const stone = document.getElementById('selStone').value;
  const style = document.getElementById('selStyle').value;
  const doImg = document.getElementById('doImage').checked;
  const doMfg = document.getElementById('doMfg').checked;
  const doCpy = document.getElementById('doCopy').checked;

  if (!text) {
    const ta = document.getElementById('mainPrompt');
    ta.style.borderColor = 'rgba(255,90,90,.5)';
    ta.focus();
    setTimeout(()=>ta.style.borderColor='', 1800);
    return;
  }

  const btn=document.getElementById('genBtn'), lbl=document.getElementById('genBtnLabel'), sp=document.getElementById('genSpinner');
  btn.disabled=true; lbl.classList.add('hidden'); sp.classList.remove('hidden');

  const tasks = [];
  if (doImg) tasks.push(runImage(text, piece, metal, stone, style));
  if (doMfg) tasks.push(runBlueprint(piece, metal, stone, style, text));
  if (doCpy) tasks.push(runCopy(text, piece, metal, stone, style));
  await Promise.allSettled(tasks);

  btn.disabled=false; lbl.classList.remove('hidden'); sp.classList.add('hidden');
}

// ── Image generation with load steps ──
function runImage(text, piece, metal, stone, style) {
  return new Promise(resolve => {
    document.getElementById('stageEmpty').classList.add('hidden');
    document.getElementById('resultImg').classList.add('hidden');
    document.getElementById('stageLoading').classList.remove('hidden');
    document.getElementById('imgToolbar').classList.add('hidden');

    // Reset steps
    ['ls0','ls1','ls2'].forEach(id=>{ document.getElementById(id).className='lstep'; document.getElementById(id).textContent={ls0:'Building visual prompt',ls1:'Contacting Flux renderer',ls2:'Processing image'}[id]; });
    document.getElementById('ls0').classList.add('active');

    const t1 = setTimeout(()=>{ document.getElementById('ls0').className='lstep done'; document.getElementById('ls0').textContent='✓ Visual prompt built'; document.getElementById('ls1').classList.add('active'); }, 900);
    const t2 = setTimeout(()=>{ document.getElementById('ls1').className='lstep done'; document.getElementById('ls1').textContent='✓ Renderer contacted'; document.getElementById('ls2').classList.add('active'); }, 3000);

    const prompt = buildImgPrompt(text, piece, metal, stone, style);
    const url = getImgUrl(prompt);
    const img = document.getElementById('resultImg');

    img.onload = () => {
      clearTimeout(t1); clearTimeout(t2);
      document.getElementById('stageLoading').classList.add('hidden');
      img.classList.remove('hidden');
      document.getElementById('imgToolbar').classList.remove('hidden');
      _currentSrc = url;
      resolve();
    };
    img.onerror = () => {
      clearTimeout(t1); clearTimeout(t2);
      document.getElementById('stageLoading').classList.add('hidden');
      const empty = document.getElementById('stageEmpty');
      empty.classList.remove('hidden');
      empty.querySelector('p').textContent = 'Render failed — check connection and retry.';
      empty.querySelector('span').textContent = '';
      resolve();
    };
    img.src = url;
  });
}

function regenImg() {
  if (!_lastPrompt) return;
  const url = getImgUrl(_lastPrompt);
  const img = document.getElementById('resultImg');
  img.classList.add('hidden');
  document.getElementById('stageLoading').classList.remove('hidden');
  ['ls0','ls1','ls2'].forEach(id=>{ document.getElementById(id).className='lstep'; });
  document.getElementById('ls0').classList.add('active');
  img.onload = ()=>{ document.getElementById('stageLoading').classList.add('hidden'); img.classList.remove('hidden'); _currentSrc=url; };
  img.src = url;
}

function downloadImg() {
  const img = document.getElementById('resultImg');
  if (!img.src) return;
  const a = document.createElement('a'); a.href=img.src; a.download='vltava-design.jpg'; a.target='_blank'; a.click();
}

// ══════════════════════════════════════════════════
// MANUFACTURING BLUEPRINT
// ══════════════════════════════════════════════════
const METALS = {
  'yellow gold 18k': {alloy:'Au750 Yellow Gold',purity:'18-karat · 750‰',note:'Anneal before forming. Pickle in 10% sulphuric after soldering.'},
  'rose gold 18k':   {alloy:'Au750 Rose Gold (Cu 22.5%)',purity:'18-karat · 750‰',note:'Higher copper: pickle promptly to prevent firescale. Pre-polish before stone setting.'},
  'white gold 18k':  {alloy:'Au750 White Gold (Pd alloy)',purity:'18-karat · 750‰',note:'Rhodium plate to 0.12µm after final polish.'},
  'platinum 950':    {alloy:'Pt950 (Ru 5%)',purity:'950‰',note:'Dedicated tools required — no cross-contamination with gold. Higher torch temperature needed.'},
  'sterling silver 925':{alloy:'Ag925 Sterling Silver',purity:'925‰',note:'Pickle in citric acid. Anti-tarnish coating recommended for retail stock.'},
};
const STONES = {
  diamond: {cut:'Round Brilliant (58 facets)',spec:'GIA cert, min VS2/G+ main stone',dim:'6.5mm ≈ 1.0ct; accents 1.2–2.0mm'},
  sapphire:{cut:'Oval Mixed Cut',spec:'Origin cert; eye-clean; vivid blue saturation',dim:'7×9mm ≈ 2.0ct equiv'},
  emerald: {cut:'Emerald Step Cut (57 facets)',spec:'Jardin inclusions acceptable type II; Colombian preferred',dim:'6×8mm ≈ 1.5ct equiv'},
  ruby:    {cut:'Oval Brilliant or Cushion',spec:'AGL cert; pigeon-blood red; no glass filling',dim:'6×8mm ≈ 1.5ct equiv'},
  pearl:   {cut:'No faceting — drill 0.8mm',spec:'Nacre ≥0.5mm; AAA South Sea; uniform luster grade',dim:'8–10mm diameter'},
  amethyst:{cut:'Princess or Oval Brilliant',spec:'Deep Siberian violet; eye-clean; no windowing',dim:'8×10mm ≈ 3ct equiv'},
  none:    {cut:'N/A',spec:'Focus on metal surface quality and finish consistency',dim:'N/A'},
};
const PIECES = {
  ring:     {size:'Inner Ø 17mm (US7); adjust ±0.5mm per size step',weight:'4–8g',band:'2.5–3.5mm wide'},
  necklace: {size:'Chain 45cm (18"); pendant drop 20–40mm',weight:'8–18g',band:'N/A'},
  bracelet: {size:'180mm internal; 6–8mm wide',weight:'12–25g',band:'6mm'},
  earrings: {size:'Stud Ø 10–14mm; drop max 40mm per piece',weight:'1.5–3.5g each',band:'N/A'},
  pendant:  {size:'25–45mm drop; bail 8–10mm wide',weight:'4–12g',band:'N/A'},
  brooch:   {size:'35–55mm diameter; pin 30–40mm',weight:'8–20g',band:'N/A'},
};

async function runBlueprint(piece, metal, stone, style, text) {
  document.getElementById('mfgBody').innerHTML = `<div class="out-placeholder" style="display:flex;align-items:center;gap:10px"><div class="mini-spinner" style="width:18px;height:18px;border-width:2px"></div>Building blueprint…</div>`;

  let spec = null;
  try {
    const res = await Promise.race([
      fetchPollinationsText(buildBlueprintPrompt(piece,metal,stone,style,text)),
      new Promise((_,rej)=>setTimeout(()=>rej(new Error('timeout')),12000))
    ]);
    if (res) {
      const m = res.match(/\{[\s\S]*\}/);
      if (m) spec = JSON.parse(m[0]);
    }
  } catch(e) {}

  if (!spec) spec = buildBlueprintLocal(piece, metal, stone, style, text);
  renderBlueprint(spec);
  document.getElementById('mfgCopyBtn').classList.remove('hidden');
}

function buildBlueprintPrompt(piece, metal, stone, style, text) {
  return `You are a master jeweller with 40 years bench experience. Respond ONLY with JSON, no markdown.
Create manufacturing spec for: "${text}" — ${piece} in ${metal} with ${stone}, ${style} style.
JSON keys: dimensions(size,stone_dim,weight,band), materials(alloy,purity,stone,cut,secondary), setting(type,prongs,technique), surface(finish,texture), steps(array of 6), tools(array of 4), qc, hours`;
}

function buildBlueprintLocal(piece, metal, stone, style, text) {
  const m=METALS[metal]||METALS['yellow gold 18k'], s=STONES[stone]||STONES['diamond'], p=PIECES[piece]||PIECES['ring'];
  const settingByStyle={'modern luxury':'4-claw prong, polished tips','art deco':'Geometric bead & milgrain border','vintage romantic':'6-claw fishtail prong, milgrain bezel','minimalist':'Flush bezel-set, clean edge','avant-garde':'Tension or asymmetric prong set','bohemian artisan':'Rubover bezel, hammered edge'};
  const finishByStyle={'modern luxury':'High polish','art deco':'High polish + step-engraved borders','vintage romantic':'Satin shank + polished highlights','minimalist':'High polish throughout','avant-garde':'Brushed matte','bohemian artisan':'Hammered planished'};
  return {
    dimensions:{size:p.size,stone_dim:s.dim,weight:p.weight,band:p.band},
    materials:{alloy:m.alloy,purity:m.purity,stone:stone!=='none'?stone.charAt(0).toUpperCase()+stone.slice(1)+' (natural)':'None',cut:s.cut,secondary:style!=='minimalist'&&stone!=='none'?'Accent pavé diamonds 1.2–1.5mm VS1/H+':'None'},
    setting:{type:settingByStyle[style]||'4-claw prong',prongs:piece==='ring'&&stone!=='none'?'4 or 6 per design':'N/A',technique:`Hand bench-set. ${style==='vintage romantic'?'Milgrain all bezels.':style==='art deco'?'Step-cut geometric borders, engraved.':'Polished prong tips, burnished closed.'}`},
    surface:{finish:finishByStyle[style]||'High polish',texture:style==='bohemian artisan'?'Hammered planished':style==='art deco'?'Geometric engraved borders':'Smooth hand-finished'},
    steps:[
      `Mill and roll ${m.alloy} to required gauge. Anneal at 700°C, quench, pickle clean.`,
      `Cut, shape, and fabricate ${piece} body. Solder primary structural joins. Planish form to final shape.`,
      stone!=='none'?`Drill and cut stone seat to exact ${s.dim}. Build setting: ${settingByStyle[style]||'4-claw prong'}.`:`Refine all decorative elements. File all seams flush. No solder inclusions.`,
      `Solder all findings and settings to main body. File, sand 400→800→1200 grit. Tripoli pre-polish.`,
      stone!=='none'?`Set ${stone} in seat. Secure prongs / close bezel. Inspect under 10× loupe — zero movement.`:`Final form refinement. Inspect all joins. Ultrasonic clean.`,
      metal==='white gold 18k'?`Steam clean. Rhodium plate to 0.12µm uniform coverage. Final ultrasonic and inspection.`:`High-polish with rouge wheel. Ultrasonic, steam. Final 10× loupe inspection. Hallmark inside.`
    ],
    tools:['Rolling mill · draw plate · annealing torch (MAP/propane)','Flex shaft + setting burs: ball, bearing, cup, hart (sized to stone)','Prong pusher · burnisher · bezel rocker · setting block','10× loupe · 0.01g scale · digital callipers · hallmark stamp'],
    qc:`${s.spec}. Confirm zero stone movement at 10×. Surface finish uniform — no tool marks. All solder joins solid. ${metal==='white gold 18k'?'Rhodium coverage even. ':''} Hallmark and serial number engraved inside.`,
    hours:['art deco','vintage romantic','bohemian artisan'].includes(style)?'20–38 hours master bench time':'10–18 hours master bench time',
    note:m.note
  };
}

function renderBlueprint(s) {
  const row=(k,v)=>v&&v!=='N/A'?`<div class="bp-row"><span class="bp-key">${k}</span><span class="bp-val">${v}</span></div>`:'';
  document.getElementById('mfgBody').innerHTML = `<div id="mfgContent">
    <div class="bp-section"><div class="bp-title">Dimensions</div>${row('Piece size',s.dimensions?.size)}${row('Stone',s.dimensions?.stone_dim)}${row('Weight',s.dimensions?.weight)}${row('Band width',s.dimensions?.band)}</div>
    <div class="bp-section"><div class="bp-title">Materials</div>${row('Metal alloy',s.materials?.alloy)}${row('Purity',s.materials?.purity)}${row('Primary stone',s.materials?.stone)}${row('Stone cut',s.materials?.cut)}${row('Accents',s.materials?.secondary!=='None'?s.materials?.secondary:null)}</div>
    <div class="bp-section"><div class="bp-title">Setting & Surface</div>${row('Setting type',s.setting?.type)}${row('Prongs',s.setting?.prongs)}${row('Technique',s.setting?.technique)}${row('Finish',s.surface?.finish)}${row('Texture',s.surface?.texture)}</div>
    <div class="bp-section"><div class="bp-title">Assembly Steps</div><ol class="bp-steps">${(s.steps||[]).map(x=>`<li>${x}</li>`).join('')}</ol></div>
    <div class="bp-section"><div class="bp-title">Tools Required</div><ol class="bp-steps">${(s.tools||[]).map(x=>`<li>${x}</li>`).join('')}</ol></div>
    <div class="bp-note"><strong>⚙ QUALITY CONTROL</strong><br/>${s.qc||''}</div>
    <div class="bp-note" style="margin-top:8px"><strong>⏱ BENCH TIME</strong><br/>${s.hours||''}</div>
    ${s.note?`<div class="bp-note" style="margin-top:8px"><strong>⚗ METAL NOTES</strong><br/>${s.note}</div>`:''}
  </div>`;
}

// ══════════════════════════════════════════════════
// MARKETING COPY
// ══════════════════════════════════════════════════
async function runCopy(text, piece, metal, stone, style) {
  document.getElementById('copyBody').innerHTML = `<div class="out-placeholder" style="display:flex;align-items:center;gap:10px"><div class="mini-spinner" style="width:18px;height:18px;border-width:2px"></div>Writing luxury copy…</div>`;

  let copy = null;
  try {
    const res = await Promise.race([
      fetchPollinationsText(buildCopyPrompt(text,piece,metal,stone,style)),
      new Promise((_,rej)=>setTimeout(()=>rej(new Error('timeout')),12000))
    ]);
    if (res) {
      const m = res.match(/\{[\s\S]*?\}/);
      if (m) copy = JSON.parse(m[0]);
    }
  } catch(e) {}

  if (!copy) copy = buildCopyLocal(text, piece, metal, stone, style);
  renderCopy(copy);
  document.getElementById('copyCopyBtn').classList.remove('hidden');
}

function buildCopyPrompt(text, piece, metal, stone, style) {
  const voices={'modern luxury':'sleek and aspirational — Tiffany or Cartier tone','art deco':'glamorous, geometric, 1920s Paris advertisement','vintage romantic':'romantic, tender, nostalgic — like a handwritten love letter','minimalist':'spare, precise — one sentence does the work of a thousand','avant-garde':'provocative, fashion-forward — Maison Margiela jewellery','bohemian artisan':'free-spirited, soulful, tactile — traveller\'s journal'};
  return `You are the creative director of the world's most prestigious jewellery house. Respond ONLY with JSON, no markdown.
Write luxury copy for: "${text}" — ${piece} in ${metal} with ${stone}. Voice: ${voices[style]||voices['modern luxury']}.
JSON keys: headline (4-8 words), body (3-4 sentences, sensory and evocative), tagline (under 10 words), instagram (caption with 3 hashtags)`;
}

function buildCopyLocal(text, piece, metal, stone, style) {
  const adj={diamond:'brilliant',sapphire:'celestial',emerald:'verdant',ruby:'ardent',pearl:'luminous',amethyst:'regal',none:'immaculate'}[stone]||'radiant';
  const met={'yellow gold 18k':'warm gold','rose gold 18k':'blush gold','white gold 18k':'glacial white gold','platinum 950':'eternal platinum','sterling silver 925':'polished silver'}[metal]||'precious metal';
  const capPiece=piece.charAt(0).toUpperCase()+piece.slice(1);
  const capAdj=adj.charAt(0).toUpperCase()+adj.slice(1);
  const capStone=stone!=='none'?stone.charAt(0).toUpperCase()+stone.slice(1):'';
  const T={
    'modern luxury':{headline:`The ${capAdj} ${capPiece}`,body:`Sculpted in ${met} and centred with a ${adj} ${stone!=='none'?stone:'presence'}, this ${piece} is made for those who understand that true luxury lives in the detail. ${text.length>30?text.slice(0,80)+'…':''} Wear it as armour. Wear it as art. Wear it as the truest version of yourself.`,tagline:'Designed for those who arrive.',instagram:`Crafted in ${met}. Worn with intention. ✦ #FineJewellery #${capStone||'Gold'}Design #LuxuryJewellery`},
    'art deco':{headline:`Deco Reverie — ${capStone||met} ${capPiece}`,body:`From the age when geometry became poetry — this ${piece} reimagines the 1920s atelier in ${met}. The ${adj} ${stone!=='none'?stone:'surface'} is framed by architectural precision that would have enchanted Poiret himself. An object of power. An object of time.`,tagline:'Geometry made glorious.',instagram:`Art deco reborn in ${met} 💎 #ArtDeco #VintageLuxury #JewelleryDesign`},
    'vintage romantic':{headline:`Heirloom — A ${capPiece} Across Time`,body:`Some pieces are not bought. They are found — like a letter from a previous life. This ${adj} ${piece} carries the warmth of summers long past, of hands that once trembled clasping it. Keep it. Pass it on. Let it mean everything.`,tagline:'Some beauty is forever.',instagram:`Heirloom pieces for modern souls 🌹 #VintageJewellery #HeirloomPiece #Timeless`},
    'minimalist':{headline:`The ${met.split(' ')[0]} ${capPiece}`,body:`Nothing superfluous. Only the essential. ${met}, ${stone!=='none'?stone:'pure form'}, and silence — this ${piece} speaks the language of restraint. For those who know the most powerful statement is knowing when to stop.`,tagline:'Less. And everything.',instagram:`When less becomes everything ✨ #MinimalistJewellery #FineGold #CleanDesign`},
    'avant-garde':{headline:`Disrupted Form, ${capAdj} Truth`,body:`Jewellery as disruption. This ${piece} refuses the expected — ${met} that challenges its own history, ${stone!=='none'?`${stone} that occupies space like a question`:'form as a question'}. This is not decoration. This is a declaration.`,tagline:'Form as rebellion.',instagram:`Jewellery that starts conversations 🖤 #AvantGarde #ConceptualJewellery #WearableArt`},
    'bohemian artisan':{headline:`Wanderer's ${capPiece}`,body:`Born from a single afternoon in the studio, this ${piece} carries the unhurried spirit of those who collect experiences instead of things. ${met} shaped by hand, ${stone!=='none'?`${stone} chosen for soul not symmetry`:'each curve born of instinct'}. Yours alone.`,tagline:'Every jewel has a journey.',instagram:`Handcrafted with soul 🌿 #BohemianJewellery #Handmade #ArtisanJewellery`},
  };
  return T[style]||T['modern luxury'];
}

function renderCopy(c) {
  const esc=s=>String(s).replace(/\\/g,'\\\\').replace(/`/g,'\\`').replace(/\$/g,'\\$');
  document.getElementById('copyBody').innerHTML = `<div id="copyContent">
    <div class="cp-headline">${c.headline}</div>
    <div class="cp-body">${c.body}</div>
    <div class="cp-tagline">— ${c.tagline}</div>
    <div class="cp-social-label">Instagram Caption</div>
    <div class="cp-social">${c.instagram}</div>
    <div class="cp-btns">
      <button class="cp-btn" onclick="cpCopy(\`${esc(c.body)}\n\n— ${esc(c.tagline)}\`,this)">Copy Description</button>
      <button class="cp-btn" onclick="cpCopy(\`${esc(c.instagram)}\`,this)">Copy Caption</button>
      <button class="cp-btn" onclick="cpCopy(\`${esc(c.headline)}\n\n${esc(c.body)}\n\n— ${esc(c.tagline)}\n\n${esc(c.instagram)}\`,this)">Copy All</button>
    </div>
  </div>`;
}
function cpCopy(text,btn){navigator.clipboard.writeText(text).then(()=>{const o=btn.textContent;btn.textContent='✓ Copied!';setTimeout(()=>btn.textContent=o,2000);})}

// ── Pollinations text API (free, no key) ──
async function fetchPollinationsText(prompt) {
  const res = await fetch('https://text.pollinations.ai/openai', {
    method:'POST', headers:{'Content-Type':'application/json'},
    body:JSON.stringify({model:'openai',messages:[{role:'system',content:'Respond ONLY with valid JSON, no markdown.'},{role:'user',content:prompt}],max_tokens:700,temperature:.5,jsonMode:true})
  });
  if (!res.ok) throw new Error('API '+res.status);
  const d = await res.json();
  return d.choices?.[0]?.message?.content || null;
}

// ══════════════════════════════════════════════════
// WORKSHOP MODAL
// ══════════════════════════════════════════════════
function openWorkshop() {
  const modal = document.getElementById('workshopModal');
  const base = document.getElementById('wsBaseImg');
  const src = document.getElementById('resultImg').src;
  if (src && src.startsWith('http')) base.src = src;
  modal.classList.remove('hidden');
  document.body.style.overflow = 'hidden';
}
function closeWorkshop() { document.getElementById('workshopModal').classList.add('hidden'); document.body.style.overflow=''; }

async function workshopGenerate() {
  const mod   = document.getElementById('wsPrompt').value.trim();
  const metal = document.getElementById('wsMetal').value;
  const stone = document.getElementById('wsStone').value;
  const views = [...document.querySelectorAll('.vchip input:checked')].map(c=>c.value);
  if (!mod && !metal && !stone && !views.length) { document.getElementById('wsPrompt').focus(); return; }

  const btn=document.getElementById('wsBtn'), lbl=document.getElementById('wsBtnLabel'), sp=document.getElementById('wsSpinner');
  btn.disabled=true; lbl.classList.add('hidden'); sp.classList.remove('hidden');

  const base = _lastPrompt || 'luxury jewellery';
  const variants = [{label:mod||`${metal} ${stone} variation`.trim(), prompt:buildImgPrompt(`${base}, ${mod}`, 'jewellery piece', metal||'precious metal', stone||'gemstone', 'modern luxury')}];
  views.forEach(v=>variants.push({label:v, prompt:buildImgPrompt(`${base}, ${v}`, 'jewellery piece', metal||'precious metal', stone||'gemstone', 'modern luxury')}));

  const gallery=document.getElementById('wsGallery'), grid=document.getElementById('wsGrid');
  gallery.classList.remove('hidden'); grid.innerHTML='';

  variants.forEach((v,i) => {
    const d=document.createElement('div'); d.className='ws-thumb'; d.id=`wt${i}`;
    d.innerHTML=`<div style="aspect-ratio:1;background:rgba(0,0,0,.4);display:flex;align-items:center;justify-content:center;border-radius:10px"><div class="mini-spinner"></div></div><div class="ws-thumb-label">${v.label}</div>`;
    grid.appendChild(d);
  });

  await Promise.allSettled(variants.map((v,i)=>new Promise(res=>{
    const url=getImgUrl(v.prompt);
    const img=new Image();
    img.onload=()=>{
      const el=document.getElementById(`wt${i}`);
      if(el) el.innerHTML=`<img src="${url}" alt="${v.label}"/><div class="ws-thumb-label">${v.label}</div><button class="ws-thumb-save" onclick="saveThumb('${url}','${v.label}')">↓</button>`;
      res();
    };
    img.onerror=()=>{const el=document.getElementById(`wt${i}`);if(el)el.querySelector('div').textContent='Failed';res();};
    img.src=url;
  })));

  btn.disabled=false; lbl.classList.remove('hidden'); sp.classList.add('hidden');
}

function saveThumb(url,label){const a=document.createElement('a');a.href=url;a.download=`vltava-${label.replace(/\s+/g,'-')}.jpg`;a.target='_blank';a.click();}
