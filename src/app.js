(function(){
'use strict';
const $ = (s, r=document) => r.querySelector(s);
const $$ = (s, r=document) => Array.from(r.querySelectorAll(s));
const MAPW = 2600, MAPH = 2300;
const { places: PLACES, journeys: JOURNEYS, timeline: TIMELINE, characters: CHARACTERS, chapters: CHAPTERS } = window.ATLAS_DATA;
const TG = 'https://tolkiengateway.net/wiki/';
const published = window.ATLAS_PUBLICATION;
const urlState = {place:null,journey:null,event:null,chapter:null,year:null};
let restoringURL = true;
function syncURL(patch, replace=false){
  Object.assign(urlState, patch);
  if (restoringURL) return;
  queueMicrotask(() => {
    const latest = '/' + window.ATLAS_URL.search(urlState);
    if (!restoringURL && latest !== location.pathname + location.search) history[replace ? 'replaceState' : 'pushState'](null, '', latest);
  });
}
function focusPanel(id){
  const heading = $('#m-'+id+' h1, #m-'+id+' h2');
  if (heading) { heading.tabIndex = -1; heading.focus({preventScroll:true}); }
}
function readingLink(kind,id,label,className='pill'){
  return published[kind].includes(id) ? `<a class="${className}" href="/${kind}/${id}/">${esc(label)}</a>` : '';
}
const mapEl = $('#map'), world = $('#world'), mkLayer = $('#markers'), dyn = $('#dyn'), sheet = $('#sheet'), body = $('#sheetbody');
// Read dimensions only at startup/resize, never after map style writes in a frame.
const viewport = {};
function measureViewport(){
  viewport.width = window.innerWidth; viewport.height = window.innerHeight;
  viewport.chromeTop = $('#top').getBoundingClientRect().bottom;
}
measureViewport();
const isDesktop = () => viewport.width >= 900;
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

// ---------- storage (best-effort) ----------
const store = { get(k){ try{ return JSON.parse(localStorage.getItem('mea:'+k)); }catch(e){ return null; } }, set(k,v){ try{ localStorage.setItem('mea:'+k, JSON.stringify(v)); }catch(e){} } };

// ---------- helpers ----------
const norm = s => s.normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[^a-z0-9]+/g,' ').trim();
const esc = s => String(s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const fmtNum = n => Math.round(n).toLocaleString('en-US');
function ageLabel(y){ // absolute -> "T.A. 3019"
  if (y == null) return '';
  if (y > 3021) return 'Fo.A. ' + (y - 3021);
  if (y >= 1) return 'T.A. ' + y;
  if (y > -3441) return 'S.A. ' + (y + 3441);
  if (y > -4031) return 'F.A. ' + (y + 4031);
  return 'Y.T. ' + (y + 9031);
}
const TYPE_ICON = {city:'city',town:'town',village:'village',house:'house',hall:'hall',inn:'inn',fortress:'fort',tower:'tower',ruin:'ruin',gate:'gate',
  mountain:'mtn',range:'mtn',hill:'hill',hills:'hill',pass:'pass',plateau:'hill',gorge:'valley',valley:'valley',forest:'tree',wood:'tree',river:'water',lake:'lake',sea:'water',bay:'water',coast:'water',cape:'island',island:'island',marsh:'marsh',waterfall:'fall',spring:'spring',plain:'plain',desert:'plain',
  bridge:'bridge',ford:'ford',cave:'cave',mine:'mine',battle:'battle',realm:'realm',region:'region',road:'road',landmark:'landmark',port:'port',tomb:'tomb'};
const TYPE_GROUP = {city:'set',town:'set',village:'set',house:'set',hall:'set',inn:'set',port:'set',fortress:'fort',tower:'fort',gate:'fort',ruin:'ruin',tomb:'ruin',cave:'mtn',mine:'mtn',
  mountain:'mtn',range:'mtn',hill:'mtn',hills:'mtn',pass:'mtn',plateau:'mtn',gorge:'mtn',valley:'nat',forest:'nat',wood:'nat',plain:'nat',desert:'nat',marsh:'wat',river:'wat',lake:'wat',sea:'wat',bay:'wat',coast:'wat',cape:'wat',island:'wat',waterfall:'wat',spring:'wat',
  bridge:'set',ford:'wat',battle:'bat',realm:'set',region:'nat',road:'set',landmark:'set'};
const AREA_TYPES = new Set(['region','realm','range','river','forest','wood','plain','sea','bay','lake','marsh','hills','valley','plateau','desert','coast','road']);
const TYPE_LABEL = {mine:'Dwarf-mansion',city:'City',town:'Town',village:'Village',house:'Dwelling',hall:'Hall',inn:'Inn',fortress:'Fortress',tower:'Tower',ruin:'Ruin',gate:'Gate',mountain:'Mountain',range:'Mountain range',hill:'Hill',hills:'Hills',pass:'Pass',plateau:'Plateau',gorge:'Gorge',valley:'Valley',forest:'Forest',wood:'Wood',river:'River',lake:'Lake',sea:'Sea',bay:'Bay',coast:'Coast',cape:'Cape',island:'Island',marsh:'Marsh',waterfall:'Waterfall',spring:'Spring',plain:'Plain',desert:'Desert',bridge:'Bridge',ford:'Ford',cave:'Cave',battle:'Battlefield',realm:'Realm',region:'Region',road:'Road',landmark:'Landmark',port:'Haven',tomb:'Tomb'};
const CATS = [
  {id:'set', name:'Cities & towns', short:'Cities', icon:'city', types:['city','town','village','port']},
  {id:'fort', name:'Fortresses & towers', short:'Fortresses', icon:'fort', types:['fortress','tower','gate']},
  {id:'dwell', name:'Halls, inns & homes', short:'Halls & inns', icon:'inn', types:['hall','inn','house','cave','mine']},
  {id:'mtn', name:'Mountains & passes', short:'Mountains', icon:'mtn', types:['mountain','range','hill','hills','pass','plateau','gorge','valley']},
  {id:'forest', name:'Forests', short:'Forests', icon:'tree', types:['forest','wood']},
  {id:'water', name:'Rivers & lakes', short:'Waters', icon:'water', types:['river','lake','sea','bay','marsh','waterfall','spring','island','cape','coast','ford','bridge']},
  {id:'realm', name:'Realms & regions', short:'Realms', icon:'realm', types:['realm','region','plain','desert','road']},
  {id:'battle', name:'Battlefields', short:'Battles', icon:'battle', types:['battle']},
  {id:'ruin', name:'Ruins & tombs', short:'Ruins', icon:'ruin', types:['ruin','tomb','landmark']},
];
const catOfType = {}; CATS.forEach(c => c.types.forEach(t => catOfType[t] = c.id));
const ico = (n, cls='') => `<svg class="${cls}" aria-hidden="true"><use href="#i-${n}"/></svg>`;
const pIcon = p => ico(TYPE_ICON[p.t] || 'landmark');

// ---------- view state ----------
const V = { s: 0.3, tx: 0, ty: 0, min: 0.12, max: 9 };
const byId = {}; PLACES.forEach(p => { byId[p.id] = p; p._n = norm(p.n); p._alts = (p.alt||[]).map(norm); p._area = AREA_TYPES.has(p.t); });
// map-space labels that already name a place: don't duplicate with an HTML label
const svgLabels = $$('#tlab .ml, #terrain .ml');
const labelByName = {};
svgLabels.forEach(el => { const n = norm(el.textContent); labelByName[n] = el; });
const ALIASES = {'misty mountains':'misty-mountains','white mountains':'white-mountains','grey mountains':'grey-mountains','blue mountains':'blue-mountains','ered luin':'blue-mountains','hithaeglir':'misty-mountains','ered nimrais':'white-mountains','ered mithrin':'grey-mountains','celduin river running':'celduin','the great sea':'belegaer','wilderland':'rhovanion','ephel duath':'ephel-duath','ered lithui':'ered-lithui','mountains of shadow':'ephel-duath','ash mountains':'ered-lithui','hollin':'eregion','lorien':'lothlorien','lothlorien':'lothlorien','fangorn':'fangorn-forest','lossoth':'lossoth-camps'};
svgLabels.forEach(el => {
  const n = norm(el.textContent);
  const cands = [n, 'river ' + n, n + ' river', 'the ' + n, n.replace(/^the /, ''), 'mount ' + n];
  let p = PLACES.find(q => cands.includes(q._n)) || (ALIASES[n] && byId[ALIASES[n]]) || PLACES.find(q => q._alts.some(a => cands.includes(a)));
  if (p) { el.dataset.pid = p.id; el.style.pointerEvents = 'auto'; el.style.cursor = 'pointer'; p._svgLabel = true; }
});
// historical label windows (absolute years)
// Eregion/Hollin remains a geographical name after the realm falls. Forest
// names, unlike the geography, have distinct historical windows.
const HIST = {'ARNOR':[-121,861],'ROHAN':[2510,null],'MIRKWOOD':[1050,3019],'GREENWOOD THE GREAT':[null,1049],'ERYN LASGALEN':[3019,null],'ANGMAR':[1300,1975],'EREGION':[-2691,null],'DAGORLAD':[-7,null]};
svgLabels.forEach(el => { const w = HIST[el.textContent.trim()]; if (w) { if (w[0]!=null) el.dataset.from = w[0]; if (w[1]!=null) el.dataset.to = w[1]; } });

// ---------- markers ----------
const MK = [];
(function buildMarkers(){
  const frag = document.createDocumentFragment();
  PLACES.forEach((p, i) => {
    const el = document.createElement('button');
    const area = p._area && (p._svgLabel || p.t === 'road');
    el.className = `mk k${p.k} g-${TYPE_GROUP[p.t]||'set'}` + (p._area ? ' area' : '') + (area ? ' nolabel' : '');
    el.dataset.i = i; el.setAttribute('aria-label', p.n);
    el.innerHTML = (p._area ? '' : `<span class="ic">${pIcon(p)}</span>`) + `<span class="lb">${esc(p.n)}</span>`;
    if (area) el.style.display = 'none';
    frag.appendChild(el);
    MK.push({ p, el, w: 0, area, hidden: area });
  });
  mkLayer.appendChild(frag);
  const ring = document.createElement('div'); ring.className = 'ring'; ring.id = 'ring'; ring.innerHTML = '<i></i>'; mkLayer.appendChild(ring);
})();
// label width estimate (px) per marker, measured once with canvas
(function measure(){
  const c = document.createElement('canvas').getContext('2d');
  MK.forEach(m => { const p = m.p; c.font = (p.k === 1 ? '700 13px Cinzel' : (p.k >= 3 ? 'italic 12px "IM Fell English"' : '13px "IM Fell English"')); m.w = c.measureText(p.n).width * (p.k === 1 ? 1.15 : 1) + 20; m.h = 18; });
})();
const EV = []; // timeline event pins
(function buildEvents(){
  const frag = document.createDocumentFragment();
  TIMELINE.forEach((e, i) => {
    const el = document.createElement('button'); el.className = 'ev';
    el.dataset.e = i; el.setAttribute('aria-label', e.title); el.innerHTML = '<i></i>';
    frag.appendChild(el); EV.push({ e, el });
  });
  mkLayer.appendChild(frag);
})();


// ---------- raster basemap ----------
// One bounded preview is reused during gestures. At rest the culled SVG always
// supplies sharp detail. Never decode a new SVG image for each visited map tile:
// native SVG documents/layout trees cost much more memory than canvas pixels.
const snapCv = $('#snap'), snapCtx = snapCv.getContext('2d');
const coarsePointer = window.matchMedia('(pointer: coarse)');
const snapshotBudget = () => !isDesktop() || coarsePointer.matches ? 4e6 : 6e6;
let snapBudget = snapshotBudget();
let snapReady = false, snapBusy = false, snapDirty = true, snapTimer = null;
let snapVersion = 0, snapState = '', snapIdle = null, snapJob = null;
function cancelSnapshotSchedule(){
  clearTimeout(snapTimer); snapTimer = null;
  if (snapIdle != null) window.cancelIdleCallback(snapIdle);
  snapIdle = null;
}
function releaseSnapshotJob(){
  if (!snapJob) return;
  const {img, url} = snapJob;
  img.onload = img.onerror = null;
  img.removeAttribute('src');
  URL.revokeObjectURL(url);
  snapJob = null; snapBusy = false;
}
function suspendSnapshot(){
  cancelSnapshotSchedule(); releaseSnapshotJob();
  snapVersion++; snapReady = false; snapDirty = true;
  finishRaster();
  snapCv.width = snapCv.height = 0;
  if (gesturing) mapEl.classList.add('fallback');
}
function invalidateSnapshot(){
  const state = [
    mapEl.classList.contains('roads-off'), mapEl.classList.contains('realms-on'),
    ...$$('#realms .realm, #terrain .deco').map(el => el.getAttribute('class'))
  ].join('|');
  if (state === snapState) return;
  snapState = state; snapVersion++; snapReady = false;
  releaseSnapshotJob();
  // Never show a cached realm or creature from a different timeline/layer state.
  applyBase(true);
  if (rastering) finishRaster();
  if (gesturing) mapEl.classList.add('fallback');
  scheduleSnapshot(150);
}
function snapCss(){
  const src = document.getElementById('mapcss');
  const txt = src?.sheet ? [...src.sheet.cssRules].map(rule => rule.cssText).join('\n') : '';
  const names = new Set(['--land','--paper','--sea','--ink']);
  txt.replace(/var\(\s*(--[\w-]+)/g, (m, n) => { names.add(n); return m; });
  const cs = getComputedStyle(document.documentElement);
  let vars = '';
  names.forEach(n => { const v = cs.getPropertyValue(n); if (v) vars += n + ':' + v.trim() + ';'; });
  return ':root,svg{' + vars + '}' + txt;
}
function buildSnapshot(){
  if (snapBusy || !baseEl || document.hidden) return;
  if (gesturing || rastering) { scheduleSnapshot(250); return; }
  snapBusy = true; snapDirty = false;
  const version = snapVersion;
  const k = Math.min(1.6, Math.sqrt(snapBudget / (MAPW * MAPH)));
  const w = Math.round(MAPW * k), h = Math.round(MAPH * k);
  let url = null;
  try {
    const clone = baseEl.cloneNode(true);
    clone.removeAttribute('style');
    clone.setAttribute('viewBox', '0 0 ' + MAPW + ' ' + MAPH);
    clone.setAttribute('width', w); clone.setAttribute('height', h);
    clone.querySelectorAll('.bk').forEach(e => e.removeAttribute('style'));
    const overlay = terrainEl.cloneNode(true);
    // Keep SVG definitions/clipping and map artwork, but not live labels/routes.
    overlay.querySelectorAll('.mlabels, #dyn').forEach(e => e.remove());
    clone.appendChild(overlay);
    clone.classList.toggle('roads-off', mapEl.classList.contains('roads-off'));
    clone.classList.toggle('realms-on', mapEl.classList.contains('realms-on'));
    const st = document.createElementNS('http://www.w3.org/2000/svg', 'style');
    st.textContent = snapCss() + '\n*{transition:none!important;animation:none!important}';
    clone.insertBefore(st, clone.firstChild);
    const blob = new Blob([new XMLSerializer().serializeToString(clone)], { type: 'image/svg+xml;charset=utf-8' });
    url = URL.createObjectURL(blob);
  } catch (e) { snapBusy = false; console.warn('Terrain cache unavailable; using vector map.', e); return; }
  const img = new Image();
  const job = snapJob = {img, url};
  img.onload = () => {
    if (snapJob !== job) return;
    // A decode can finish after another year/layer was selected or a gesture began.
    if (version !== snapVersion || gesturing || rastering || document.hidden) {
      releaseSnapshotJob(); scheduleSnapshot(250); return;
    }
    try {
      snapCv.width = w; snapCv.height = h;
      snapCtx.drawImage(img, 0, 0, w, h);
      snapReady = true; drawSnap();
    } catch (e) { snapReady = false; finishRaster(); }
    finally { releaseSnapshotJob(); }
    if (snapDirty) scheduleSnapshot(1500);
  };
  img.onerror = () => { if (snapJob === job) releaseSnapshotJob(); };
  img.src = url;
}
function scheduleSnapshot(delay){
  snapDirty = true; cancelSnapshotSchedule();
  if (document.hidden) return;
  snapTimer = setTimeout(() => {
    snapTimer = null;
    const go = () => { snapIdle = null; buildSnapshot(); };
    if (window.requestIdleCallback) snapIdle = window.requestIdleCallback(go, { timeout: 2500 });
    else go();
  }, delay == null ? 700 : delay);
}
function drawSnap(){
  snapCv.style.transform = `translate3d(${V.tx.toFixed(2)}px,${V.ty.toFixed(2)}px,0) scale(${V.s})`;
}

// ---------- transform ----------
// Hide the heavy SVG layers while moving, rather than relying on canvas occlusion.
// Until the persistent cache is ready, retain the original vector fallback.
let gestureT = null, gesturing = false, rastering = false, swapT = null, fadeT = null, gestureScale = 1;
function cancelRasterSwap(){
  if (swapT != null) cancelAnimationFrame(swapT);
  clearTimeout(fadeT); swapT = null; fadeT = null;
  mapEl.classList.remove('restoring', 'fading');
}
function finishRaster(){
  cancelRasterSwap();
  rastering = false; mapEl.classList.remove('rastered');
}
function startGesture(){
  clearTimeout(gestureT); cancelRasterSwap();
  clearTimeout(lodTimer);
  if (!gesturing) {
    gestureScale = lastPosS > 0 ? lastPosS : V.s;
    gesturing = true;
    mapEl.classList.add('gesture', 'moving');
    mapEl.classList.toggle('fallback', !snapReady);
  }
}
function endGesture(delay){
  clearTimeout(gestureT);
  gestureT = setTimeout(() => {
    gesturing = false;
    mapEl.classList.remove('gesture', 'moving', 'fallback');
    saveView();
    mkLayer.style.transform = `translate3d(${V.tx.toFixed(2)}px,${V.ty.toFixed(2)}px,0)`;
    applyBase(true);
    lastLodS = V.s; svgLabelLOD();
    lastLodRun = performance.now(); lodPass();
    if (rastering) {
      mapEl.classList.add('restoring');
      swapT = requestAnimationFrame(() => { swapT = requestAnimationFrame(() => {
        swapT = null;
        if (gesturing) return;
        if (reduceMotion) return finishRaster();
        mapEl.classList.add('fading');
        fadeT = setTimeout(finishRaster, 160);
      }); });
    }
  }, Math.max(120, delay ?? 120));
}

let lodTimer = null, lastLodS = 0, lastLodRun = 0, zoomClass = '', zoomVlo = false;
const terrainEl = $('#terrain'), baseEl = $('#tbase'), worldBase = $('#worldBase'), worldLab = $('#worldLab');
// Spatial buckets: off-screen groups are display:none'd so paint cost tracks the
// viewport, not the size of the map.
const BK = 300;
const BUCKETS = $$('#tbase .bk').map(el => {
  const [bx, by] = el.dataset.b.split(',').map(Number);
  return { el, x0: bx * BK, y0: by * BK, x1: bx * BK + BK, y1: by * BK + BK, vis: true };
});
let shownMk = [], shownEv = [], chapterPins = [], lastPosS = -1;
const hovRef = { el: null, get: () => null, wp: null };
function placeMarkers(force){
  const s = V.s;
  if (!force && s === lastPosS) return;
  lastPosS = s;
  { const hp = hovRef.get(); if (hp) hovRef.el.style.transform = `translate3d(${(hp.x * s).toFixed(1)}px,${(hp.y * s).toFixed(1)}px,0)`; }
  if (hovRef.wp) wpEl.style.transform = `translate3d(${(hovRef.wp.x * s).toFixed(1)}px,${(hovRef.wp.y * s).toFixed(1)}px,0)`;
  for (const m of shownMk) m.el.style.transform = `translate3d(${(m.p.x * s).toFixed(1)}px,${(m.p.y * s).toFixed(1)}px,0)` + (m.flip ? ' translateX(-100%)' : '');
  for (const v of shownEv) v.el.style.transform = `translate3d(${(v.e.x * s).toFixed(1)}px,${(v.e.y * s).toFixed(1)}px,0)`;
  const pinPositions=window.ATLAS_READING.spread(chapterPins.map(pin=>({x:pin.p.x*s,y:pin.p.y*s})));
  chapterPins.forEach((pin,i)=>{
    const pos=pinPositions[i],dx=pos.x-pin.p.x*s,dy=pos.y-pin.p.y*s;
    pin.el.style.transform=`translate3d(${pos.x.toFixed(1)}px,${pos.y.toFixed(1)}px,0)`;
    pin.tether.setAttribute('d',`M0 0 L${-dx} ${-dy}`);
  });
  if (selected) ringEl.style.transform = `translate3d(${(selected.x * s).toFixed(1)}px,${(selected.y * s).toFixed(1)}px,0)`;
}
function cull(){
  const s = V.s, pad = 80 / s;
  const x0 = -V.tx / s - pad, y0 = -V.ty / s - pad;
  const x1 = x0 + viewport.width / s + pad * 2, y1 = y0 + viewport.height / s + pad * 2;
  for (let i = 0; i < BUCKETS.length; i++) {
    const b = BUCKETS[i];
    const v = b.x1 > x0 && b.x0 < x1 && b.y1 > y0 && b.y0 < y1;
    if (v !== b.vis) { b.vis = v; b.el.style.display = v ? '' : 'none'; }
  }
}
let baseT = '';
function applyBase(force){
  const s = V.s;
  const t = `translate(${V.tx.toFixed(2)}px,${V.ty.toFixed(2)}px) scale(${s})`;
  if (t === baseT && !force) return;
  baseT = t;
  worldBase.style.transform = t; worldLab.style.transform = t;
  const zc = s < 0.75 ? 'z-lo' : (s > 2.2 ? 'z-hi' : 'z-mid');
  if (zc !== zoomClass) { mapEl.classList.remove('z-lo','z-mid','z-hi'); mapEl.classList.add(zc); zoomClass = zc; }
  const vlo = s < 0.32;
  if (vlo !== zoomVlo) { mapEl.classList.toggle('z-vlo', vlo); zoomVlo = vlo; }
  cull();
  baseEl.style.setProperty('--zs', (1 / Math.min(4, Math.max(1, s / 2.2))).toFixed(2));
}
function apply(){
  const s = V.s;
  world.style.transform = `translate(${V.tx.toFixed(2)}px,${V.ty.toFixed(2)}px) scale(${s})`;
  // Freeze marker membership and layout; one parent transform follows a pinch.
  mkLayer.style.transform = `translate3d(${V.tx.toFixed(2)}px,${V.ty.toFixed(2)}px,0)` +
    (gesturing ? ` scale(${s / gestureScale})` : '');
  if (!gesturing) placeMarkers();
  const raster = gesturing && snapReady;
  if (raster) {
    drawSnap();
    if (!rastering) { rastering = true; mapEl.classList.add('rastered'); }
  } else {
    applyBase();
    if (snapReady) drawSnap();
  }
  // Changing SVG label membership would invalidate the composited overlay mid-zoom.
  if (!gesturing && Math.abs(s - lastLodS) / (lastLodS || 1) > 0.12) { lastLodS = s; svgLabelLOD(); }
  if (!gesturing) { clearTimeout(lodTimer); lodTimer = setTimeout(() => { lastLodRun = performance.now(); lodPass(); }, 70); }
  updateScale();
}
function clamp(){
  const vw = viewport.width, vh = viewport.height;
  const left = isDesktop() ? 432 : 0, aw = vw - left; // desktop: the panel covers the left strip
  V.min = Math.min(aw / MAPW, vh / MAPH) * 0.9;
  V.s = Math.min(V.max, Math.max(V.min, V.s));
  const mw = MAPW * V.s, mh = MAPH * V.s;
  if(activeChapter){
    const b=visibleBounds(),bw=b.right-b.left,bh=b.bottom-b.top;
    V.tx=mw>=bw?Math.min(b.left,Math.max(b.right-mw,V.tx)):b.left+(bw-mw)/2;
    V.ty=mh>=bh?Math.min(b.top,Math.max(b.bottom-mh,V.ty)):b.top+(bh-mh)/2;
    return;
  }
  if (mw >= aw) V.tx = Math.min(left, Math.max(vw - mw, V.tx)); else V.tx = left + (aw - mw) / 2;
  if (mh >= vh) V.ty = Math.min(0, Math.max(vh - mh, V.ty)); else V.ty = (vh - mh) / 2;
}
function zoomAt(f, ax, ay){ // zoom by factor f keeping screen point (ax,ay) fixed
  const ns = Math.min(V.max, Math.max(V.min, V.s * f)); const r = ns / V.s;
  V.tx = ax - (ax - V.tx) * r; V.ty = ay - (ay - V.ty) * r; V.s = ns; clamp(); apply();
}
let zanim = null;
function zoomAnim(f, ax, ay, dur){ // eased version of zoomAt for taps and buttons
  if (reduceMotion) return zoomAt(f, ax, ay);
  if (zanim) cancelAnimationFrame(zanim);
  if (anim) { cancelAnimationFrame(anim); anim = null; }
  const s0 = V.s, s1 = Math.min(V.max, Math.max(V.min, s0 * f));
  const mx = (ax - V.tx) / s0, my = (ay - V.ty) / s0, t0 = performance.now(), D = dur || 280;
  startGesture();
  function step(now){
    const t = Math.min(1, (now - t0) / D), e = 1 - Math.pow(1 - t, 3);
    const s = Math.exp(Math.log(s0) + (Math.log(s1) - Math.log(s0)) * e);
    V.s = s; V.tx = ax - mx * s; V.ty = ay - my * s; clamp(); apply();
    if (t < 1) zanim = requestAnimationFrame(step); else { zanim = null; endGesture(40); }
  }
  zanim = requestAnimationFrame(step);
}
function visibleBounds(){
  const {width,height,chromeTop=100}=viewport;
  const left=isDesktop()?432:16, right=Math.max(left+48,width-76);
  const top=isDesktop()?24:chromeTop+16;
  const sheetTop=sheetState==='peek'?height-150:sheetState==='half'?height*.5:Math.max(56,height*.08);
  const bottom=Math.max(top+48,isDesktop()?height-40:sheetTop-16);
  return {left,right,top,bottom};
}
function visibleCenter(){
  const b=visibleBounds();
  return [(b.left+b.right)/2,(b.top+b.bottom)/2];
}
let anim = null;
function flyTo(mx, my, ts, dur){ // map coords -> centre, target scale
  if (anim) cancelAnimationFrame(anim);
  if (zanim) { cancelAnimationFrame(zanim); zanim = null; }
  const [cx, cy] = visibleCenter();
  const s0 = V.s, tx0 = V.tx, ty0 = V.ty; const s1 = Math.min(V.max, Math.max(V.min, ts == null ? V.s : ts));
  const tx1 = cx - mx * s1, ty1 = cy - my * s1;
  const dist = Math.hypot(tx1 - tx0, ty1 - ty0);
  const D = reduceMotion ? 0 : (dur || Math.min(1300, 450 + dist * 0.25));
  const t0 = performance.now();
  startGesture();
  const ls0 = Math.log(s0), ls1 = Math.log(s1);
  // zoom-out bump for long hops
  const bump = dist > 500 ? Math.min(0.9, dist / 3000) : 0;
  function step(now){
    let t = D ? Math.min(1, (now - t0) / D) : 1; const e = t < .5 ? 2*t*t : -1 + (4 - 2*t) * t;
    const ls = ls0 + (ls1 - ls0) * e - bump * Math.sin(Math.PI * t);
    V.s = Math.exp(ls);
    // interpolate map-centre position rather than tx/ty for smoothness
    const mx0 = (cx - tx0) / s0, my0 = (cy - ty0) / s0;
    const cmx = mx0 + (mx - mx0) * e, cmy = my0 + (my - my0) * e;
    V.tx = cx - cmx * V.s; V.ty = cy - cmy * V.s; clamp(); apply();
    if (t < 1) anim = requestAnimationFrame(step); else { anim = null; endGesture(40); lodPass(); }
  }
  anim = requestAnimationFrame(step);
}
function homeView(){
  const vw = viewport.width, vh = viewport.height;
  const left = isDesktop() ? 432 : 0, bottom = isDesktop() ? 0 : 150, top = 110;
  const aw = vw - left, ah = vh - top - bottom;
  const bx0 = 480, by0 = 520, bx1 = 2000, by1 = 1980; // interesting extents
  const minS = Math.min(vw / MAPW, vh / MAPH) * 0.9;
  let s = Math.max(minS, Math.min((aw - 24) / (bx1 - bx0), (ah - 24) / (by1 - by0)));
  // desktop: the sheet should fill the area beside the panel — no desk showing at the edges
  if (isDesktop()) s = Math.max(s, (aw + 90) / (MAPW - 80), (vh + 60) / (MAPH - 80));
  const cx = isDesktop() ? 1240 : 1180, cy = 1250;
  let tx = left + aw / 2 - cx * s, ty = top + ah / 2 - cy * s;
  if (isDesktop()) {
    const m = 100 * s + 24; // keep the sheet margin/neatline tucked out of sight
    tx = Math.min(left - m, Math.max(vw + m - MAPW * s, tx));
    ty = Math.min(-m, Math.max(vh + m - MAPH * s, ty));
  }
  return { s, tx, ty };
}

// ---------- LOD & collision ----------
const RANK_MIN = {1: 0, 2: 0.65, 3: 1.4, 4: 2.8};
let selected = null, activeCat = null, tlYear = 3019, tlOn = false;
function placeVisibleInTime(p){ if (!tlOn) return true; if (p.f != null && p.f > tlYear) return false; if (p.to != null && p.to < tlYear) return false; return true; }
function markerPriority(m, quick){
  if (selected?.id === m.p.id) return -1000;
  const weights = {city:0, fortress:1, town:1, hall:1, village:2, mountain:2, forest:3, realm:3, region:4};
  return m.k * 10 + (m.p._area ? 5 : 0) + (weights[m.p.t] ?? 3) - (m.was ? (quick ? 100 : 2.5) : 0);
}
function labelYieldsToMarker(label, marker){
  return !!marker && (marker.selected || marker.k <= (label.major || label.size >= 20 ? 1 : 2));
}
function lodPass(quick){
  if (gesturing) return;
  updateDetails();
  const s = V.s, vw = viewport.width, vh = viewport.height;
  const cand = [];
  for (const m of MK) {
    const p = m.p;
    if (m.hidden) continue;
    const hist = !tlOn && p.to != null && p.to < 3000;
    const k = hist ? Math.max(p.k, 3) : ((p._area && p.k === 1) ? 2 : p.k);
    m.k = k;
    let show = s >= RANK_MIN[k];
    if (activeCat && catOfType[p.t] !== activeCat) show = false;
    if (selected && selected.id === p.id) show = true;
    m.el.classList.toggle('lod', !show);
    m.el.classList.toggle('gone', !placeVisibleInTime(p));
    m.was = !!m.shown; m.shown = false;
    if (!show) continue;
    const x = p.x * s + V.tx, y = p.y * s + V.ty;
    if (x < -260 || y < -120 || x > vw + 260 || y > vh + 120) { m.el.classList.add('off'); continue; }
    cand.push({ m, x, y });
  }
  cand.sort((a, b) => (markerPriority(a.m,quick) - markerPriority(b.m,quick)) || (a.m.w - b.m.w));
  const cell = 80, grid = new Map(), ogrid = new Map(); // placed markers / sheet lettering
  function hits(g, b){
    const cx0 = Math.floor(b.x0 / cell), cx1 = Math.floor(b.x1 / cell), cy0 = Math.floor(b.y0 / cell), cy1 = Math.floor(b.y1 / cell);
    for (let cx = cx0; cx <= cx1; cx++) for (let cy = cy0; cy <= cy1; cy++) {
      const arr = g.get(cx + ',' + cy); if (!arr) continue;
      for (const o of arr) if (!o.L?.hidden && b.x0 < o.x1 && b.x1 > o.x0 && b.y0 < o.y1 && b.y1 > o.y0) return o;
    }
    return null;
  }
  function putIn(g, b){
    const cx0 = Math.floor(b.x0 / cell), cx1 = Math.floor(b.x1 / cell), cy0 = Math.floor(b.y0 / cell), cy1 = Math.floor(b.y1 / cell);
    for (let cx = cx0; cx <= cx1; cx++) for (let cy = cy0; cy <= cy1; cy++) { const k = cx + ',' + cy; if (!g.has(k)) g.set(k, []); g.get(k).push(b); }
  }
  // 1. lettering drawn on the sheet: big names are fixed obstacles; small ones are placed
  //    largest-first and hidden when they would sit on a bigger name.
  const minors = [];
  if (!quick && LBL_MEASURED) {
    for (const L of LBL) {
      if (!L.on || !L.boxes || !L.boxes.length) continue;
      const big = L.major || L.size >= 20;
      const bx = L.boxes.map(b => ({ x0: b[0] * s + V.tx, y0: b[1] * s + V.ty, x1: b[2] * s + V.tx, y1: b[3] * s + V.ty, L, big }));
      if (!bx.some(b => b.x1 > 0 && b.x0 < vw && b.y1 > 0 && b.y0 < vh)) { L.vis = false; continue; }
      L.vis = true; L.sb = bx; L.hidden = false;
      if (L.major) bx.forEach(b => putIn(ogrid, b)); else minors.push(L);
    }
    minors.sort((a, b) => b.size - a.size);
    for (const L of minors) {
      const clash = L.sb.some(b => hits(ogrid, b));
      L.hidden = clash;
      if (!clash) L.sb.forEach(b => putIn(ogrid, b));
    }
  }
  const overlaps = b => !!hits(grid, b);
  // cities may sit on any lettering, towns must avoid big names, minor places avoid all of it
  const blocked = (b, k) => { if (hits(grid, b)) return true; if (k <= 1) return false; const o = hits(ogrid, b); return !!o && (k >= 3 || o.big); };
  const put = b => putIn(grid, b);
  // 2. markers: important places may sit on a big name (their halo keeps them legible) but
  //    prefer the side that avoids it; minor places yield to lettering entirely.
  for (const c of cand) {
    const m = c.m, area = m.p._area, k = m.k;
    const b = area ? { x0: c.x - m.w / 2 - 3, x1: c.x + m.w / 2 + 3, y0: c.y - 12, y1: c.y + 12 } : { x0: c.x - 12, x1: c.x + m.w + 3, y0: c.y - 13, y1: c.y + 13 };
    const isSel = selected && selected.id === m.p.id;
    let flip = !isSel && !!(m.was && m.flip);
    if (!isSel && !area) {
      const bL = { x0: c.x - m.w - 3, x1: c.x + 12, y0: c.y - 13, y1: c.y + 13 };
      const first = flip ? bL : b, second = flip ? b : bL;
      const free = x => !hits(grid, x) && !hits(ogrid, x);
      if (free(first)) Object.assign(b, first);
      else if (free(second)) { flip = !flip; Object.assign(b, second); }
      else if (!blocked(first, k)) Object.assign(b, first);
      else if (!blocked(second, k)) { flip = !flip; Object.assign(b, second); }
      else { m.el.classList.add('off'); continue; }
    } else if (!isSel && blocked(b, k)) { m.el.classList.add('off'); continue; }
    m.el.classList.toggle('flip', flip);
    m.flip = flip;
    m.el.classList.remove('off'); put(b); m.shown = true;
    b.k = k; b.selected = isSel;
    // Release the entire label now, before lower-priority places are considered.
    let lettering;
    while ((lettering = hits(ogrid,b)) && labelYieldsToMarker(lettering.L,b)) lettering.L.hidden = true;
  }
  // 3. Even major lettering gives way to selected places and important cities.
  if (!quick && LBL_MEASURED) {
    for (const L of LBL.filter(label => label.on && label.vis && label.sb)) {
      if (!L.hidden && L.sb.some(b => labelYieldsToMarker(L,hits(grid,b)))) L.hidden = true;
      L.el.classList.toggle('hid', L.hidden);
    }
  }
  shownMk = MK.filter(m => m.shown);
  shownEv = tlOn ? EV.filter(v => v.el.classList.contains('in')) : [];
  placeMarkers(true);
}
// Blink keeps charging for SVG text nodes even when they are hidden, so out-of-range
// sheet lettering is detached from the document rather than merely styled away.
const LBL = svgLabels.map(el => ({
  el, parent: el.parentNode, on: true,
  zmin: +el.dataset.zmin || 0, zmax: +el.dataset.zmax || 99,
  from: el.dataset.from != null ? +el.dataset.from : null,
  to: el.dataset.to != null ? +el.dataset.to : null
}));
let LBL_MEASURED = false;
// Measure the sheet lettering once (per-glyph boxes in map units) so markers can avoid it.
function measureLabels(){
  const wasOff = mapEl.classList.contains('tlabels-off'); if (wasOff) mapEl.classList.remove('tlabels-off');
  const tmp = [];
  for (const L of LBL) if (!L.el.isConnected) { L.parent.appendChild(L.el); tmp.push(L); }
  for (const L of LBL) {
    const el = L.el, txt = el.textContent, n = el.getNumberOfChars(), boxes = [];
    let m; try { m = el.getCTM(); } catch (e) { m = null; }
    if (!m || !n) { L.boxes = []; continue; }
    const fs = parseFloat(el.getAttribute('font-size')) || 12; L.size = fs;
    L.major = !!el.closest('#terrain') || ((el.classList.contains('ml-mtn') || el.classList.contains('ml-reg') || el.classList.contains('ml-sea')) && fs >= 22);
    const step = fs >= 30 ? 1 : 2;
    for (let i = 0; i < n; i += step) {
      let x0 = 1e9, y0 = 1e9, x1 = -1e9, y1 = -1e9;
      for (let j = i; j < Math.min(n, i + step); j++) {
        if (txt[j] === ' ') continue;
        let e; try { e = el.getExtentOfChar(j); } catch (err) { continue; }
        if (!e.width) continue;
        const inset = e.height * 0.18; // glyph cells are taller than the letters
        for (const [px, py] of [[e.x, e.y + inset], [e.x + e.width, e.y + inset], [e.x, e.y + e.height - inset], [e.x + e.width, e.y + e.height - inset]]) {
          const X = m.a * px + m.c * py + m.e, Y = m.b * px + m.d * py + m.f;
          if (X < x0) x0 = X; if (X > x1) x1 = X; if (Y < y0) y0 = Y; if (Y > y1) y1 = Y;
        }
      }
      if (x1 > x0) boxes.push([x0, y0, x1, y1]);
    }
    L.boxes = boxes;
  }
  for (const L of tmp) L.el.remove();
  if (wasOff) mapEl.classList.add('tlabels-off');
  LBL_MEASURED = true;
}
function svgLabelLOD(){
  if (gesturing) return;
  const s = V.s, y = tlOn ? tlYear : 3019;
  for (let i = 0; i < LBL.length; i++) {
    const L = LBL[i];
    let show = s >= L.zmin && s <= L.zmax;
    if (show && L.from != null && y < L.from) show = false;
    if (show && L.to != null && y > L.to) show = false;
    if (show !== L.on) { L.on = show; if (show) L.parent.appendChild(L.el); else L.el.remove(); }
  }
}

// ---------- scale bar ----------
const scaleBar = $('#scalebar .bar'), scaleText = $('#scalebar .txt');
let scaleZoom = null;
function updateScale(){
  if (V.s === scaleZoom) return;
  scaleZoom = V.s;
  const target = 90; // px
  const miles = target / V.s; const nice = [5,10,20,25,50,100,200,250,500,1000];
  let m = nice[0]; for (const n of nice) if (n <= miles) m = n;
  scaleBar.style.width = (m * V.s) + 'px';
  scaleText.textContent = '≈ ' + m + ' miles · schematic scale';
}

// ---------- pointer handling ----------
(function pointer(){
  const pts = new Map(); let start = null, moved = false, lastTap = 0, vel = [0,0], lastMove = null, inertia = null, downTarget = null;
  let pointerFrame = null;
  function queuePointerApply(){
    if (pointerFrame == null) pointerFrame = requestAnimationFrame(() => { pointerFrame = null; apply(); });
  }
  function flushPointerApply(){
    if (pointerFrame == null) return;
    cancelAnimationFrame(pointerFrame); pointerFrame = null; apply();
  }
  mapEl.addEventListener('pointerdown', e => {
    // pointer capture retargets the matching pointerup to #map, so remember what was pressed
    downTarget = e.target;
    if (inertia) { cancelAnimationFrame(inertia); inertia = null; }
    if (anim) { cancelAnimationFrame(anim); anim = null; }
    mapEl.setPointerCapture(e.pointerId);
    pts.set(e.pointerId, { x: e.clientX, y: e.clientY });
    if (pts.size === 1) { start = { x: e.clientX, y: e.clientY, tx: V.tx, ty: V.ty, s: V.s }; moved = false; lastMove = { x: e.clientX, y: e.clientY, t: performance.now() }; vel = [0,0]; }
    else if (pts.size === 2) { const [a, b] = [...pts.values()]; start = { d: Math.hypot(a.x-b.x, a.y-b.y), mx: (a.x+b.x)/2, my: (a.y+b.y)/2, tx: V.tx, ty: V.ty, s: V.s }; moved = true; }
    mapEl.classList.add('dragging'); startGesture();
  });
  mapEl.addEventListener('pointermove', e => {
    if (!pts.has(e.pointerId)) return;
    pts.set(e.pointerId, { x: e.clientX, y: e.clientY });
    if (pts.size === 1 && start) {
      const dx = e.clientX - start.x, dy = e.clientY - start.y;
      if (!moved && Math.hypot(dx, dy) > 4) moved = true;
      if (moved) {
        V.tx = start.tx + dx; V.ty = start.ty + dy; clamp(); queuePointerApply();
        const now = performance.now(); const dt = now - lastMove.t;
        if (dt > 0) vel = [ (e.clientX - lastMove.x) / dt, (e.clientY - lastMove.y) / dt ];
        lastMove = { x: e.clientX, y: e.clientY, t: now };
      }
    } else if (pts.size === 2 && start && start.d) {
      const [a, b] = [...pts.values()]; const d = Math.hypot(a.x-b.x, a.y-b.y), mx = (a.x+b.x)/2, my = (a.y+b.y)/2;
      const ns = Math.min(V.max, Math.max(V.min, start.s * d / start.d));
      // keep the initial midpoint's map position under the current midpoint
      const mapx = (start.mx - start.tx) / start.s, mapy = (start.my - start.ty) / start.s;
      V.s = ns; V.tx = mx - mapx * ns; V.ty = my - mapy * ns; clamp(); queuePointerApply();
    }
  });
  function up(e){
    if (!pts.has(e.pointerId)) return;
    // Commit the final movement before a pinch becomes a drag or inertia starts.
    flushPointerApply();
    const cancelled = e.type === 'pointercancel';
    pts.delete(e.pointerId);
    if (pts.size === 0) {
      mapEl.classList.remove('dragging'); endGesture();
      if (!moved && !cancelled) {
        const tgt = downTarget || e.target;
        const t = tgt.closest('.mk'); const ev = tgt.closest('.ev'); const ml = tgt.closest('.ml'); const cp = tgt.closest('.chapter-pin');
        const discovery = tgt.closest('[data-discovery]');
        const now = performance.now();
        if (cp) { focusChapterLocation(+cp.dataset.location); }
        else if (t) { selectPlace(MK[+t.dataset.i].p, { fly: true }); }
        else if (ev) { showEvent(EV[+ev.dataset.e].e); }
        else if (ml && ml.dataset.pid) { selectPlace(byId[ml.dataset.pid], { fly: true }); }
        else if (discovery && detailLayer) { detailLayer.open(discovery.dataset.discovery); }
        else if (now - lastTap < 320 && e.pointerType !== 'mouse') { zoomAnim(2, e.clientX, e.clientY); lastTap = 0; }
        else { lastTap = now; if (sheet.classList.contains('full') || sheet.classList.contains('half')) setSheet('peek'); }
      } else if (!cancelled && Math.hypot(vel[0], vel[1]) > 0.25 && !reduceMotion) {
        let v = [vel[0], vel[1]]; let last = performance.now();
        startGesture();
        const step = now => { const dt = now - last; last = now; V.tx += v[0] * dt; V.ty += v[1] * dt; v[0] *= Math.pow(0.992, dt); v[1] *= Math.pow(0.992, dt); clamp(); apply(); if (Math.hypot(v[0], v[1]) > 0.02) inertia = requestAnimationFrame(step); else { inertia = null; endGesture(40); lodPass(); } };
        inertia = requestAnimationFrame(step);
      } else lodPass();
      start = null;
    } else if (pts.size === 1) { const [a] = [...pts.values()]; start = { x: a.x, y: a.y, tx: V.tx, ty: V.ty, s: V.s }; lastMove = { x: a.x, y: a.y, t: performance.now() }; vel = [0,0]; }
  }
  mapEl.addEventListener('pointerup', up); mapEl.addEventListener('pointercancel', up);
  // Wheel / trackpad: accumulate into a target scale and ease towards it each frame, so a
  // mouse notch glides instead of jumping and a trackpad pinch (ctrlKey) feels continuous.
  let wTarget = null, wAnchor = [0, 0], wRaf = null;
  function wheelStep(){
    const ls = Math.log(V.s), lt = Math.log(wTarget);
    const done = Math.abs(lt - ls) < 0.003;
    const ns = done ? wTarget : Math.exp(ls + (lt - ls) * 0.32);
    zoomAt(ns / V.s, wAnchor[0], wAnchor[1]);
    if (!done && V.s !== wTarget) wRaf = requestAnimationFrame(wheelStep);
    else { wRaf = null; wTarget = null; endGesture(60); }
  }
  mapEl.addEventListener('wheel', e => {
    e.preventDefault();
    if (inertia) { cancelAnimationFrame(inertia); inertia = null; }
    if (anim) { cancelAnimationFrame(anim); anim = null; }
    const dy = e.deltaMode === 1 ? e.deltaY * 18 : e.deltaMode === 2 ? e.deltaY * 400 : e.deltaY;
    const k = e.ctrlKey ? 0.011 : 0.0022; // browsers report a trackpad pinch as ctrl+wheel with small deltas
    if (wTarget == null) wTarget = V.s;
    wTarget = Math.min(V.max, Math.max(V.min, wTarget * Math.exp(-dy * k)));
    wAnchor = [e.clientX, e.clientY];
    if (!wRaf) { startGesture(); wRaf = requestAnimationFrame(wheelStep); }
  }, { passive: false });
  // keyboard: arrows pan, +/- zoom, H home, / search, Esc back, R wander, L layers, C chapters, T timeline
  document.addEventListener('keydown', e => {
    const tag = (e.target.tagName || '').toLowerCase();
    if (tag === 'input' || tag === 'textarea' || tag === 'select' || e.metaKey || e.ctrlKey || e.altKey) return;
    const step = e.shiftKey ? 320 : 90;
    const pan = (dx, dy) => { const [cx, cy] = visibleCenter(); flyTo((cx + dx - V.tx) / V.s, (cy + dy - V.ty) / V.s, V.s, 160); };
    switch (e.key) {
      case 'ArrowLeft': pan(-step, 0); break;
      case 'ArrowRight': pan(step, 0); break;
      case 'ArrowUp': pan(0, -step); break;
      case 'ArrowDown': pan(0, step); break;
      case '+': case '=': $('#zin').click(); break;
      case '-': case '_': $('#zout').click(); break;
      case 'h': case 'H': case '0': $('#home').click(); break;
      case '/': case 's': case 'S': $('#q').focus(); $('#q').select(); break;
      case 'r': case 'R': $('#wander').click(); break;
      case 'l': case 'L': $('#layersbtn').click(); break;
      case 'c': case 'C': $('#chapbtn').click(); break;
      case 't': case 'T': $('#tlbtn').click(); break;
      case 'Escape': { const back = $('.mode.on [data-back]'); if (back) back.click(); else if (!$('#m-explore').classList.contains('on')) mode('explore'); break; }
      default: return;
    }
    e.preventDefault();
  });
  mapEl.addEventListener('dblclick', e => { if (e.pointerType === 'touch' || e.target.closest('[data-discovery]')) return; zoomAnim(2, e.clientX, e.clientY); });
  mapEl.addEventListener('contextmenu', e => e.preventDefault());
  // iOS Safari: keep the browser's own pinch / double-tap page zoom out of the map
  ['touchstart', 'touchmove', 'touchend'].forEach(t => mapEl.addEventListener(t, e => { if (e.touches.length > 1 || t !== 'touchstart') e.preventDefault(); }, { passive: false }));
  ['gesturestart', 'gesturechange', 'gestureend'].forEach(t => document.addEventListener(t, e => e.preventDefault(), { passive: false }));
})();
$('#zin').onclick = () => { const [cx, cy] = visibleCenter(); zoomAnim(1.6, cx, cy); };
$('#zout').onclick = () => { const [cx, cy] = visibleCenter(); zoomAnim(1/1.6, cx, cy); };
$('#home').onclick = () => { const h = homeView(); flyTo((viewport.width/2 - h.tx)/h.s, (viewport.height/2 - h.ty)/h.s, h.s, 900); setTimeout(() => { Object.assign(V, h); clamp(); apply(); }, reduceMotion ? 0 : 950); };
window.addEventListener('resize', () => {
  const [cx,cy]=visibleCenter(), anchor={x:(cx-V.tx)/V.s,y:(cy-V.ty)/V.s};
  if (!gesturing) finishRaster();
  measureViewport();
  const budget = snapshotBudget();
  if (budget !== snapBudget) { snapBudget = budget; scheduleSnapshot(); }
  clamp(); apply();
  requestAnimationFrame(()=>{
    if(activeChapter) fitChapter(activeChapter);
    else if(selected) flyTo(selected.x,selected.y,V.s);
    else { const [nx,ny]=visibleCenter(); V.tx=nx-anchor.x*V.s; V.ty=ny-anchor.y*V.s; clamp(); apply(); }
  });
});

// ---------- sheet ----------
let sheetState = 'peek';
window.addEventListener('resize', () => setSheet(sheetState, true));
function setSheet(st, preserveScroll = false){
  sheetState = st; sheet.classList.remove('peek','half','full'); sheet.classList.add(st);
  const vh = viewport.height;
  const y = st === 'peek' ? `calc(100% - var(--peek))` : (st === 'half' ? `${Math.round(vh*0.5)}px` : `${Math.max(56, Math.round(vh*0.08))}px`);
  sheet.style.transform = `translateY(${y})`;
  sheet.style.setProperty('--sheet-offset', y);
  if (!preserveScroll && st !== 'full') body.scrollTop = 0;
  document.documentElement.style.setProperty('--sheet-peek', st === 'peek' ? '150px' : (st === 'half' ? `${Math.round(vh*0.5)}px` : '150px'));
}
(function sheetDrag(){
  const grab = $('#grab'); let sy = 0, y0 = 0, dragging = false, lastY = 0, lastT = 0, vy = 0;
  function cur(){ const m = /translateY\(([-\d.]+)px\)/.exec(sheet.style.transform); if (m) return +m[1]; const r = sheet.getBoundingClientRect(); return r.top; }
  function down(e){ if (isDesktop()) return; dragging = true; sy = e.clientY; y0 = sheet.getBoundingClientRect().top; sheet.classList.add('drag'); lastY = e.clientY; lastT = performance.now(); vy = 0; grab.setPointerCapture && e.pointerId != null && grab.setPointerCapture(e.pointerId); }
  function move(e){ if (!dragging) return; const dy = e.clientY - sy; const ny = Math.max(40, y0 + dy); sheet.style.transform = `translateY(${ny}px)`; sheet.style.setProperty('--sheet-offset', `${ny}px`); const t = performance.now(); vy = (e.clientY - lastY) / Math.max(1, t - lastT); lastY = e.clientY; lastT = t; }
  function up(){ if (!dragging) return; dragging = false; sheet.classList.remove('drag'); const vh = viewport.height; const top = sheet.getBoundingClientRect().top;
    const snaps = [ ['full', Math.max(56, vh*0.08)], ['half', vh*0.5], ['peek', vh - 150] ];
    let best = snaps[0]; let bd = 1e9; for (const s of snaps) { const d = Math.abs(s[1] - top); if (d < bd) { bd = d; best = s; } }
    if (Math.abs(vy) > 0.5) { const i = snaps.findIndex(s => s[0] === best[0]); best = snaps[Math.min(2, Math.max(0, i + (vy > 0 ? 1 : -1)))]; }
    setSheet(best[0]); }
  grab.addEventListener('pointerdown', down); grab.addEventListener('pointermove', move); grab.addEventListener('pointerup', up); grab.addEventListener('pointercancel', up);
  // The collapsed preview can be pulled open. Expanded content scrolls natively;
  // its drag handle remains available to change the sheet height.
  body.addEventListener('pointerdown', e => { if (isDesktop() || sheetState !== 'peek') return; if (e.target.closest('input, select, button, a, .presets, #chips')) return; down(e); body.setPointerCapture(e.pointerId); }, { passive: true });
  body.addEventListener('pointermove', e => { if (!dragging) return; if (Math.abs(e.clientY - sy) > 6) { move(e); } });
  body.addEventListener('pointerup', up); body.addEventListener('pointercancel', up);
})();
function mode(id){
  if (id !== 'chapter' && activeChapter) { clearChapterPins(); syncURL({chapter:null}); }
  $$('.mode').forEach(m => m.classList.toggle('on', m.id === 'm-' + id)); body.scrollTop = 0;
  if (id === 'explore' || id === 'discovery') syncURL({place:null,journey:null,event:null,chapter:null});
  if (id === 'explore' && !restoringURL) focusPanel('explore');
}

// ---------- little discoveries ----------
// Keep miniature DOM out of the terrain cache. Warm its small module in idle
// time, but only mount visible artwork in settled views.
let detailLayer = null, detailLoading = false, detailFailed = false, openedDiscovery = null;
function updateDetails(){
  if (gesturing) return;
  const enabled = LAYERS.details !== false;
  if (detailLayer) {
    detailLayer.update({ ...V, ...viewport, left: isDesktop() ? 432 : 0 }, tlOn ? tlYear : null, enabled);
    return;
  }
  if (V.s < 3.2 || !enabled) { detailFailed = false; return; }
  if (detailLoading || detailFailed) return;
  loadDetails();
}
function loadDetails(){
  if (detailLoading || detailLayer || detailFailed) return;
  detailLoading = true;
  import('./details.mjs').then(module => {
    detailLayer = module.createDetailLayer($('#details'), openDiscovery);
    detailLoading = false; updateDetails(); // Recheck current zoom, year and motion after loading.
  }).catch(() => { detailLoading = false; detailFailed = true; });
}
function warmDetails(){
  if (detailLayer || detailLoading || document.hidden || LAYERS.details === false) return;
  if (gesturing || rastering) { setTimeout(warmDetails, 1500); return; }
  if (navigator.connection?.saveData) return;
  if (window.requestIdleCallback) requestIdleCallback(() => {
    if (!gesturing && !document.hidden) loadDetails(); else setTimeout(warmDetails, 1500);
  }); else loadDetails();
}
function openDiscovery(d){
  if (!d) return;
  openedDiscovery = d;
  const el = $('#m-discovery'), place = byId[d.place];
  el.innerHTML = `<button class="back" data-back>${ico('back')} Back to the map</button>
    <div class="discovery-illustration"><svg viewBox="-25 -24 50 48" aria-hidden="true"><g class="detail-art">${d.art}</g></svg><span>${esc(d.label)}</span></div>
    <div class="eyebrow">A little discovery</div><h2 id="discovery-title" tabindex="-1">${esc(d.title)}</h2>
    <p class="desc">${esc(d.text)}</p>
    <p class="src">A miniature inspired by Middle-earth; its position is illustrative.${d.source ? ` <a href="${TG + d.source}" target="_blank" rel="noopener">Read the story ↗</a>` : ''}</p>
    ${place ? `<button class="row" data-discovery-place>${pIcon(place)}<span class="tx"><b>${esc(place.n)}</b><small>Read about this corner of the map</small></span></button>` : ''}`;
  mode('discovery'); if (sheetState === 'peek') setSheet('half');
  $('#discovery-title').focus({ preventScroll:true });
}
$('#m-discovery').addEventListener('click', e => {
  if (e.target.closest('[data-back]')) {
    mode('explore');
    if (!isDesktop()) setSheet('peek');
    const origin = openedDiscovery && $(`[data-discovery="${openedDiscovery.id}"]`);
    (origin || $('#zin')).focus({ preventScroll:true });
  }
  if (e.target.closest('[data-discovery-place]') && openedDiscovery) selectPlace(byId[openedDiscovery.place]);
});

// ---------- explore ----------
const FEATURED = ['hobbiton','rivendell','minas-tirith','moria','lothlorien','erebor','edoras','mount-doom','isengard','helms-deep','bree','minas-morgul','dol-amroth','grey-havens','weathertop','barad-dur','dale','esgaroth','fangorn-forest','cirith-ungol'].filter(id => byId[id]);
function renderExplore(){
  const el = $('#m-explore');
  const feat = FEATURED.slice(0, 6).map(id => byId[id]);
  el.innerHTML = `
    <div class="hero"><div><div class="eyebrow">Gazetteer · Third Age</div><h1>Middle-earth</h1></div><small>${PLACES.length} places · ${TIMELINE.length} events</small></div>
    <p class="sub" style="margin-top:6px"><span class="t-only">Pinch to travel, tap a name to read its tale — from Bag End to the Sammath Naur.</span><span class="f-only">Scroll to zoom, drag to travel, click a name to read its tale — from Bag End to the Sammath Naur.</span></p>
    <details class="entry-section"><summary>${ico('center')} Discover places</summary>
    <div class="tiles">${feat.map(p => `<button class="tile" data-go="${p.id}">${pIcon(p)}<b>${esc(p.n)}</b><small>${esc(p.r)}</small></button>`).join('')}</div>
    <a class="place-guide" href="/places/">Browse the place guides</a></details>
    <details class="entry-section"><summary>${ico('route')} Follow a journey</summary>
    <div class="list">${JOURNEYS.map(j => `<button class="row j" data-j="${j.id}" style="--jc:${j.color}"><span class="ic">${ico('route')}</span><span class="tx"><b>${esc(j.name)}</b><small>${esc(j.legs[0].date)} → ${esc(j.legs[j.legs.length-1].date)} · ${j.legs.length} waypoints</small></span></button>`).join('')}</div>
    <a class="journey-guide" href="/journeys/">Browse the journey guides</a></details>
    <button class="entry-reader" id="ex-chapter">${ico('book')} Read alongside the book</button>
    <details class="atlas-help"><summary>Help &amp; about this atlas</summary>
    <div class="hints f-only"><span><span class="kbd">/</span> search</span><span><span class="kbd">← ↑ ↓ →</span> pan</span><span><span class="kbd">+ −</span> zoom</span><span><span class="kbd">H</span> home</span><span><span class="kbd">R</span> wander</span><span><span class="kbd">Esc</span> back</span></div>
    <nav class="reading-nav" aria-label="Read the atlas"><a href="/methodology/">Sources &amp; method</a><a href="/data/">Open data</a></nav>
    <p class="sub discovery-hint">Look a little closer: zoom into the countryside to find tiny drawings. Tap a gold sparkle to discover their stories.</p>
    <div class="orn"><span>Wander</span></div>
    <div class="list">
      <button class="row" id="ex-wander"><span class="ic">${ico('dice')}</span><span class="tx"><b>Take me somewhere</b><small>A random corner of the map</small></span></button>
      <button class="row" id="ex-dir"><span class="ic">${ico('route')}</span><span class="tx"><b>Directions</b><small>Distance and travel time between any two places</small></span></button>
      <button class="row" id="ex-tl"><span class="ic">${ico('hour')}</span><span class="tx"><b>Travel in time</b><small>See the map as it was in any year</small></span></button>
      <button class="row" id="ex-layers"><span class="ic">${ico('layers')}</span><span class="tx"><b>Layers</b><small>Realms, roads, journeys, labels</small></span></button>
    </div>
    <div class="orn"><span>Sources</span></div>
    <p class="src">Descriptions and dates draw on Tolkien's texts (The Hobbit, The Lord of the Rings and its Appendices, Unfinished Tales); each place links to its <a href="https://tolkiengateway.net" target="_blank" rel="noopener">Tolkien Gateway</a> article. This is a schematic drawing with uneven regional scale. Distance estimates use a nominal mile per map unit, rounded to about two significant figures; they are not measured road lengths. Small interiors are spread apart for readability. Places marked “approximate” have additionally uncertain positions.</p>
    <div class="oss-links" aria-label="Open-source project links">
      <a href="https://github.com/bndkts/middle-earth-atlas" target="_blank" rel="noopener">GitHub repository ↗</a>
      <a href="https://github.com/bndkts/middle-earth-atlas/blob/main/CONTRIBUTING.md" target="_blank" rel="noopener">Contribute ↗</a>
      <a href="https://github.com/bndkts/middle-earth-atlas/blob/main/LICENSE" target="_blank" rel="noopener">MIT License ↗</a>
    </div>
    <p class="src">The MIT License covers the source code and documentation. Copyrighted artwork is explicitly excluded.</p>
    <p class="maker-credit">Made with
      <svg class="maker-ring" viewBox="0 0 48 40" role="img" aria-label="the One Ring">
        <defs><linearGradient id="maker-ring-gold" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#e9cb79"/><stop offset=".4" stop-color="#b7802b"/><stop offset=".7" stop-color="#f0d58a"/><stop offset="1" stop-color="#936222"/></linearGradient></defs>
        <g transform="rotate(-24 24 20)" stroke-linecap="round" stroke-linejoin="round">
          <path d="M6 17C6 3 42 3 42 17v6c0 14-36 14-36 0Z" fill="url(#maker-ring-gold)" stroke="#8c642a" stroke-width="1.2"/>
          <ellipse cx="24" cy="17" rx="14.5" ry="7.5" fill="var(--paper)" stroke="#936222" stroke-width="1.5"/>
          <path d="M10 14c5-7 23-7 28 0M9 27c7 8 24 8 30 0" fill="none" stroke="#fff0bc" stroke-width=".8" opacity=".8"/>
          <g fill="none" stroke="#86591f" stroke-width=".8">
            <path d="m13 26 2 4 1-4m-3 2 5 1m2-2 1 5 2-4-3 1m6-1-1 4 3-2-2-1m5-3-1 5 3-4m-3 2 4-1"/>
          </g>
        </g>
      </svg>
      by <a href="https://github.com/bndkts" target="_blank" rel="noopener">@bndkts</a>
    </p></details>`;
  el.addEventListener('click', e => {
    const go = e.target.closest('[data-go]'); if (go) return selectPlace(byId[go.dataset.go], { fly: true });
    const j = e.target.closest('[data-j]'); if (j) return openJourney(j.dataset.j);
    if (e.target.closest('#ex-wander')) return wander();
    if (e.target.closest('#ex-dir')) return openDirections();
    if (e.target.closest('#ex-chapter')) return openChapter();
    if (e.target.closest('#ex-tl')) return setTimeline(true);
    if (e.target.closest('#ex-layers')) return openLayers();
  });
}
function wander(){ const pool = PLACES.filter(p => p.k <= 2 && !p._area); const p = pool[Math.floor(Math.random() * pool.length)]; selectPlace(p, { fly: true, scale: 2.2 }); }
$('#wander').onclick = wander;

// ---------- chapters ----------
const characterById = Object.fromEntries(CHARACTERS.map(character => [character.id,character]));
const roman = ['','I','II','III','IV','V','VI'];
let activeChapter = null;
function clearChapterPins(){
  chapterPins.forEach(pin => pin.el.remove());
  chapterPins = []; activeChapter = null;
  applyReaderGuard();
  $('#chapbtn').classList.remove('on');
}
function chapterPlace(location){ return byId[location.placeId]; }
function chapterCharacters(location){ return location.characters.map(id => characterById[id].name).join(', '); }
const readerPolicy=window.ATLAS_READING;
let reading=readerPolicy.restore(store.get('reading'),CHAPTERS);
function characterBadges(location){
  return location.characters.map(id=>`<span class="character-badge" style="--character-color:${readerPolicy.color(id)}">${esc(characterById[id].name)}</span>`).join('');
}
function applyReaderGuard(){
  const guarded=!!activeChapter && reading.guard;
  document.documentElement.classList.toggle('reader-guard',guarded);
  $$('#q,#qclear,#chips button,#layersbtn,#tlbtn,#wander').forEach(el=>{el.disabled=guarded;});
}
function setChapterPins(chapter){
  clearChapterPins(); activeChapter = chapter;
  const frag = document.createDocumentFragment();
  chapter.locations.forEach((location,index) => {
    const p = chapterPlace(location), el = document.createElement('button');
    el.className = 'chapter-pin'; el.dataset.location = index;
    el.setAttribute('aria-label',`${p.n} — ${chapterCharacters(location)}`);
    el.innerHTML = `<svg class="chapter-tether" width="1" height="1" aria-hidden="true"><path/></svg><i>${index+1}</i><span><b>${esc(p.n)}</b><span class="character-badges">${characterBadges(location)}</span></span>`;
    frag.appendChild(el); chapterPins.push({p,el,tether:el.querySelector('path')});
  });
  mkLayer.appendChild(frag); $('#chapbtn').classList.add('on'); placeMarkers(true);
}
function fitChapter(chapter){
  if(!isDesktop() && sheetState==='full') setSheet('half',true);
  const points = chapter.locations.map(chapterPlace);
  const xs = points.map(p=>p.x), ys = points.map(p=>p.y);
  const x0=Math.min(...xs), x1=Math.max(...xs), y0=Math.min(...ys), y1=Math.max(...ys);
  const b=visibleBounds(), aw=b.right-b.left-96, ah=b.bottom-b.top-96;
  const scale=Math.min(2.2,Math.max(V.min,Math.min(aw/Math.max(80,x1-x0),ah/Math.max(80,y1-y0))));
  flyTo((x0+x1)/2,(y0+y1)/2,scale);
}
function focusChapterLocation(index){
  if (!activeChapter) return;
  const p=chapterPlace(activeChapter.locations[index]);
  chapterPins.forEach((pin,i)=>pin.el.classList.toggle('selected',i===index));
  $$('#m-chapter [data-chapter-location]').forEach((row,i)=>row.classList.toggle('selected',i===index));
  flyTo(p.x,p.y,Math.max(V.s,2));
}
function chapterOptions(){
  return [1,2,3,4,5,6].map(book=>`<optgroup label="Book ${roman[book]}">${CHAPTERS.filter(chapter=>chapter.book===book).map(chapter=>`<option value="${chapter.id}">${chapter.chapter}. ${esc(readerPolicy.title(chapter,reading,CHAPTERS))}</option>`).join('')}</optgroup>`).join('');
}
function openChapter(id=activeChapter?.id||reading.chapterId){
  const chapter=CHAPTERS.find(item=>item.id===id); if(!chapter) return;
  reading.chapterId=chapter.id; store.set('reading',reading);
  clearTimeout(qTimer); q.value=''; activeCat=null; dirPick=null;
  $$('#chips .chip').forEach(el=>{el.classList.remove('on');el.setAttribute('aria-pressed','false');});
  if(tlOn) setTimeline(false);
  stopPlay(); clearWaypoint(); clearSelection(); setChapterPins(chapter);
  const index=CHAPTERS.indexOf(chapter), el=$('#m-chapter');
  el.innerHTML=`<button class="back" data-back>${ico('back')} Leave reading mode</button>
    <div class="eyebrow">The Lord of the Rings · Book ${roman[chapter.book]}</div>
    <h1>${esc(chapter.title)}</h1>
    <p class="reading-progress">Your chapter is remembered on this device. <button data-reset-reading>Forget progress</button></p>
    <label class="chapter-picker" for="chapter-select"><span>Choose a chapter</span><select id="chapter-select">${chapterOptions()}</select></label>
    <div class="chapter-nav"><button class="pill" data-chapter-step="-1" ${index===0?'disabled':''}>${ico('back')} Previous</button><span>${index+1} of ${CHAPTERS.length}</span><button class="pill" data-chapter-step="1" ${index===CHAPTERS.length-1?'disabled':''}>Next ${ico('back','next-icon')}</button></div>
    <button class="pill chapter-fit" data-chapter-fit>${ico('center')} Show all chapter places</button>
    <label class="reader-option"><input type="checkbox" id="reader-guard" ${reading.guard?'checked':''}> Hide story details while reading</label>
    ${reading.guard?'<p class="src">Chapter summaries and later chapter titles are hidden. Full stories, search, journeys and the timeline are paused here. Map geography and this chapter’s locations and characters remain visible. Leaving reading mode restores the full atlas.</p>':''}
    <p class="src">Pins show where tracked characters appear during this chapter, not a single simultaneous moment. Off-page characters are not inferred.</p>
    <div class="orn"><span>Characters on the map</span></div>
    <div class="list">${chapter.locations.map((location,locationIndex)=>{const p=chapterPlace(location);return `<button class="row chapter-row" data-chapter-location="${locationIndex}"><span class="chapter-number">${locationIndex+1}</span><span class="tx"><b>${esc(p.n)}</b><span class="character-badges">${characterBadges(location)}</span>${location.note&&!reading.guard?`<span class="chapter-note">${esc(location.note)}</span>`:''}</span></button>`;}).join('')}</div>`;
  $('#chapter-select').value=chapter.id;
  mode('chapter'); syncURL({place:null,journey:null,event:null,chapter:chapter.id,year:null});
  applyReaderGuard();
  focusPanel('chapter'); if(sheetState==='peek') setSheet('half'); fitChapter(chapter);
}
$('#m-chapter').addEventListener('change',event=>{
  if(event.target.id==='chapter-select') openChapter(event.target.value);
  if(event.target.id==='reader-guard'){reading.guard=event.target.checked;openChapter(activeChapter.id);$('#reader-guard').focus();}
});
$('#m-chapter').addEventListener('click',event=>{
  if(event.target.closest('[data-reset-reading]')){
    reading=readerPolicy.restore(null,CHAPTERS);store.set('reading',null);mode('explore');toast('Reading progress forgotten');return;
  }
  if(event.target.closest('[data-chapter-fit]')) return fitChapter(activeChapter);
  if(event.target.closest('[data-back]')) return mode('explore');
  const step=event.target.closest('[data-chapter-step]');
  if(step){const index=CHAPTERS.indexOf(activeChapter)+Number(step.dataset.chapterStep);if(CHAPTERS[index])openChapter(CHAPTERS[index].id);return;}
  const row=event.target.closest('[data-chapter-location]'); if(row) focusChapterLocation(+row.dataset.chapterLocation);
});
$('#chapbtn').onclick=()=>activeChapter?mode('explore'):openChapter();

// ---------- chips ----------
(function chips(){
  const el = $('#chips');
  el.innerHTML = CATS.map(c => `<button class="chip" aria-pressed="false" data-cat="${c.id}" title="${c.name}">${ico(c.icon)}<span class="m-only">${c.name}</span><span class="d-only">${c.short}</span></button>`).join('');
  el.addEventListener('click', e => { const b = e.target.closest('.chip'); if (!b) return; setCat(activeCat === b.dataset.cat ? null : b.dataset.cat); });
})();
function setCat(id){
  activeCat = id; $$('#chips .chip').forEach(b => { b.classList.toggle('on', b.dataset.cat === id); b.setAttribute('aria-pressed', String(b.dataset.cat === id)); });
  if (id) { const c = CATS.find(x => x.id === id); listResults(PLACES.filter(p => catOfType[p.t] === id).sort((a,b) => a.k - b.k || a.n.localeCompare(b.n)), c.name, `${PLACES.filter(p => catOfType[p.t] === id).length} places`); mode('search'); if (sheetState === 'peek') setSheet('half'); }
  else { if ($('#m-search').classList.contains('on')) { mode('explore'); } }
  lodPass();
}

// ---------- search ----------
const q = $('#q'), qclear = $('#qclear');
function search(str){
  const n = norm(str); if (!n) return [];
  const words = n.split(' ');
  const res = [];
  for (const p of PLACES) {
    let sc = 0;
    if (p._n === n) sc = 100; else if (p._n.startsWith(n)) sc = 80; else if (p._n.split(' ').some(w => w.startsWith(n))) sc = 60;
    else if (p._alts.some(a => a === n)) sc = 70; else if (p._alts.some(a => a.startsWith(n) || a.split(' ').some(w => w.startsWith(n)))) sc = 50;
    else if (p._n.includes(n) || p._alts.some(a => a.includes(n))) sc = 30;
    else if (words.length > 1 && words.every(w => p._n.includes(w))) sc = 25;
    else if (n.length >= 4 && (norm(p.r).includes(n) || (TYPE_LABEL[p.t]||'').toLowerCase().includes(n))) sc = 8;
    if (sc) res.push([sc - p.k, p]);
  }
  res.sort((a, b) => b[0] - a[0]); return res.slice(0, 40).map(r => r[1]);
}
function rowHTML(p, extra=''){
  const alt = (p.alt && p.alt.length) ? ' · ' + esc(p.alt.slice(0,2).join(', ')) : '';
  return `<button class="row" data-go="${p.id}" style="--c:var(--${TYPE_GROUP[p.t]||'set'})"><span class="ic">${pIcon(p)}</span><span class="tx"><b>${esc(p.n)}</b><small>${esc(TYPE_LABEL[p.t]||p.t)} · ${esc(p.r)}${alt}</small></span>${extra}</button>`;
}
function listResults(list, title, sub){
  $('#search-status').textContent = sub || `${list.length} results`;
  const el = $('#m-search');
  el.innerHTML = `<div class="hero"><h2>${esc(title)}</h2><small>${esc(sub||'')}</small></div><div class="list" style="margin-top:6px">${list.length ? list.map(p => rowHTML(p)).join('') : '<p class="sub">Nothing found in the lore. Try another spelling — e.g. “Lorien”, “Bag End”, “Amon Sul”.</p>'}</div>`;
}
$('#m-search').addEventListener('click', e => { const go = e.target.closest('[data-go]'); if (go) { q.blur(); selectPlace(byId[go.dataset.go], { fly: true }); } });
let qTimer;
q.addEventListener('input', () => { qclear.classList.toggle('on', !!q.value); clearTimeout(qTimer); qTimer = setTimeout(() => {
  if (!q.value.trim()) { if (activeCat) setCat(activeCat); else mode('explore'); return; }
  const r = search(q.value); listResults(r, 'Results', `${r.length} for “${q.value.trim()}”`); mode('search'); if (sheetState === 'peek') setSheet('half');
}, 80); });
q.addEventListener('focus', () => { if (dirPick) return; if (q.value.trim()) { mode('search'); } if (sheetState === 'peek') setSheet('half'); });
q.addEventListener('keydown', e => { if (e.key === 'Enter') { const r = search(q.value); if (r[0]) { q.blur(); selectPlace(r[0], { fly: true }); } } if (e.key === 'Escape') { q.value=''; qclear.classList.remove('on'); mode('explore'); q.blur(); } });
qclear.onclick = () => { q.value = ''; qclear.classList.remove('on'); if (dirPick) { dirPick = null; renderDirections(); mode('dir'); } else mode('explore'); q.focus(); };

// ---------- place selection ----------
let ringEl = $('#ring');
function selectPlace(p, opt={}){
  if (!p) return;
  if(activeChapter && reading.guard){toast('Leave reading mode to open the full place story.');return;}
  clearTimeout(qTimer);
  if (dirPick) { setDirSlot(dirPick, p); return; }
  if (selected) { const m = MK.find(m => m.p === selected); if (m) m.el.classList.remove('sel'); }
  selected = p; const m = MK.find(m => m.p === p); if (m) { m.el.classList.add('sel'); }
  ringEl.classList.add('on');
  renderPlace(p); mode('place');
  syncURL({place:p.id,journey:null,event:null});
  focusPanel('place');
  if (sheetState === 'peek') setSheet('half');
  if (opt.fly) { const target = opt.scale || Math.max(V.s, p._area ? (p.t === 'region' || p.t === 'realm' || p.t === 'range' || p.t === 'river' ? 0.45 : 1.2) : (p.k === 1 ? 0.9 : p.k === 2 ? 1.6 : p.k === 3 ? 2.6 : 4)); flyTo(p.x, p.y, target); }
  lodPass();
}
function nearby(p, n=6){ return PLACES.filter(o => o !== p && !o._area && o.k <= 3).map(o => [Math.hypot(o.x-p.x, o.y-p.y), o]).sort((a,b) => a[0]-b[0]).slice(0, n); }
function journeysThrough(p){ const out = []; JOURNEYS.forEach(j => { const legs = j.legs.filter(l => l.placeId === p.id); if (legs.length) out.push([j, legs[0]]); }); return out; }
function renderPlace(p){
  const el = $('#m-place');
  const alts = (p.alt||[]).length ? `<div class="alts">${esc(p.alt.join(' · '))}</div>` : '';
  const periodLabel = p.t === 'battle' ? 'Event period' : p.t === 'realm' ? 'Realm period' : p.t === 'ruin' ? 'Before ruin' : 'Recorded period';
  const when = (p.f != null || p.to != null) ? `<dt>${periodLabel}</dt><dd>${p.fi ? 'c. ' : ''}${p.f != null ? ageLabel(p.f) : 'unknown start'} → ${p.to != null ? ageLabel(p.to) : 'no recorded end'}${p.fi ? ' <span class="sub">(estimated)</span>' : ''}</dd>` : `<dt>${periodLabel}</dt><dd class="sub">No recorded period</dd>`;
  const pp = (p.pp||[]).length ? `<dt>Peoples</dt><dd>${esc(p.pp.join(', '))}</dd>` : '<dt>Peoples</dt><dd class="sub">No peoples recorded</dd>';
  const ev = `<div class="orn"><span>Chronicle</span></div>${(p.ev||[]).length ? `<ul class="evl">${p.ev.map(e => `<li><b>${esc(ageLabel(e.y))}</b>${esc(e.t)}</li>`).join('')}</ul>` : '<p class="empty-section">No dated events recorded for this place.</p>'}`;
  const jt = journeysThrough(p);
  const jr = `<div class="orn"><span>Journeys</span></div>${jt.length ? `<div class="list">${jt.map(([j, l]) => `<button class="row j" data-j="${j.id}" style="--jc:${j.color}"><span class="ic">${ico('route')}</span><span class="tx"><b>${esc(j.name)}</b><small>${esc(l.date)}${l.note ? ' · ' + esc(l.note) : ''}</small></span></button>`).join('')}</div>` : '<p class="empty-section">No mapped journey passes through this place.</p>'}`;
  const nb = nearby(p);
  const src = p.s ? (p.s.startsWith('tg:') ? TG + p.s.slice(3) : p.s) : null;
  const im = (window.IMG || {})[p.id];
  let fig = '';
  if (im) {
    const on = im.o || im.f.replace(/\.[a-z]+$/i, '').replace(/_/g, ' ');
    const m = /^(.+?)\s+-\s+(.+)$/.exec(on); const artist = m ? m[1] : on, title = m ? m[2] : '';
    const lic = /permission/i.test(im.l || '') ? '© ' + esc(artist) + ', used with permission on Tolkien Gateway' : /fair/i.test(im.l || '') ? '© rights holder · fair use via Tolkien Gateway' : im.l ? esc(im.l) + ' · via Tolkien Gateway' : 'via Tolkien Gateway';
    fig = `<figure class="pimg"><a class="artwork-expand" href="${im.d}" target="_blank" rel="noopener" aria-label="View full artwork for ${esc(p.n)} (new tab)"><img src="${im.d}" alt="${esc(on)}" width="${im.w}" height="${im.h}" loading="lazy" decoding="async"><span>View full artwork ↗</span></a><figcaption>Artwork: <a href="${TG}File:${encodeURIComponent(im.f)}" target="_blank" rel="noopener">${esc(artist)}${title ? ' — <i>' + esc(title) + '</i>' : ''}</a><br>${lic}</figcaption></figure>`;
  }
  el.innerHTML = `
    <button class="back" data-back>${ico('back')} Back</button>
    <div class="ph"><div class="big" style="--c:var(--${TYPE_GROUP[p.t]||'set'})">${pIcon(p)}</div><div class="t"><h1>${esc(p.n)}</h1>${alts}<div class="pills"><span class="pill acc">${esc(TYPE_LABEL[p.t]||p.t)}</span><span class="pill">${esc(p.r)}</span>${p.ap ? '<span class="pill" title="Position estimated from the text">≈ approx. position</span>' : ''}</div></div></div>
    <p class="desc">${esc(p.d)}</p>
    ${readingLink('places',p.id,'Read the place guide','place-guide')}
    ${fig}
    <div class="actions place-actions">
      <button class="abtn" data-dir>${ico('route')}Directions</button>
      <button class="abtn" data-center>${ico('center')}Centre</button>
      ${src ? `<a class="abtn" href="${esc(src)}" target="_blank" rel="noopener">${ico('book')}Lore</a>` : `<button class="abtn" disabled>${ico('book')}Lore</button>`}
    </div>
    <details class="position-note"><summary>About this map position</summary><p class="src">${esc(p.position?.note || (p.ap ? 'This position is approximate. Its specific uncertainty has not yet been classified in the regional audit.' : 'This is a schematic placement, not a surveyed coordinate. Scale varies across the map.'))}</p><a href="/methodology/#position-types">Position types &amp; method</a></details>
    <dl class="kv">${when}${pp}<dt>Attested in</dt><dd>${esc({Hobbit:'The Hobbit',LotR:'The Lord of the Rings',Silm:'The Silmarillion',UT:'Unfinished Tales',HoME:'The History of Middle-earth',Letters:'Letters of J.R.R. Tolkien'}[p.c] || p.c || '—')}</dd></dl>
    ${ev}${jr}
    <div class="orn"><span>Nearby</span></div>
    <div class="list">${nb.map(([d, o]) => rowHTML(o, distanceEligible(p) && distanceEligible(o) ? `<span class="dist">${estimateLabel(d)} mi on map</span>` : '')).join('')}</div>
    ${src ? `<p class="src" style="margin-top:12px">Source: <a href="${esc(src)}" target="_blank" rel="noopener">${esc(decodeURIComponent(src.replace(TG,'')).replace(/_/g,' '))} — Tolkien Gateway</a></p>` : ''}`;
}
$('#m-place').addEventListener('click', e => {
  const go = e.target.closest('[data-go]'); if (go) return selectPlace(byId[go.dataset.go], { fly: true });
  if (e.target.closest('[data-back]')) { clearSelection(); mode(activeCat || q.value ? 'search' : 'explore'); return; }
  if (e.target.closest('[data-center]')) { flyTo(selected.x, selected.y, Math.max(V.s, 1.5)); return; }
  if (e.target.closest('[data-dir]')) { openDirections(null, selected); return; }
  const j = e.target.closest('[data-j]'); if (j) openJourney(j.dataset.j);
});
function clearSelection(){ if (selected) { const m = MK.find(m => m.p === selected); if (m) m.el.classList.remove('sel'); } selected = null; ringEl.classList.remove('on'); lodPass(); }

// ---------- layers ----------
const LAYERS = store.get('layers') || { labels: true, terrain: true, roads: true, realms: true, journeys: {} };
LAYERS.details ??= true;
function applyLayers(){
  mapEl.classList.toggle('tlabels-off', !LAYERS.terrain); mapEl.classList.toggle('roads-off', !LAYERS.roads); mapEl.classList.toggle('realms-on', LAYERS.realms);
  mkLayer.style.visibility = LAYERS.labels ? '' : 'hidden';
  drawJourneys(); updateRealms(); store.set('layers', LAYERS);
  updateDetails();
}
function updateRealms(){ const y = tlOn ? tlYear : 3019; $$('#realms .realm').forEach(r => { const f = r.dataset.from != null ? +r.dataset.from : null, t = r.dataset.to != null ? +r.dataset.to : null; r.classList.toggle('on', (f == null || f <= y) && (t == null || t >= y)); });
  // dated decorations (Smaug, the Eye, the Watcher…) follow the timeline; with it off they are shown as legend
  $$('#terrain .deco[data-from],#terrain .deco[data-to]').forEach(g => { const f = g.dataset.from != null ? +g.dataset.from : null, t = g.dataset.to != null ? +g.dataset.to : null; g.classList.toggle('hid', tlOn && !((f == null || f <= y) && (t == null || t >= y))); });
  invalidateSnapshot();
}
function renderLayers(){
  const el = $('#m-layers');
  const sw = (id, on) => `<button class="sw ${on?'on':''}" data-sw="${id}" role="switch" aria-labelledby="layer-label-${id.replace(':','-')}" aria-checked="${on}"></button>`;
  el.innerHTML = `<button class="back" data-back>${ico('back')} Back</button><h2>Layers</h2>
    <div class="list">
      <div class="lrow"><span class="tx"><b id="layer-label-labels">Place names</b><small>Cities, halls, hills — appear as you zoom</small></span>${sw('labels', LAYERS.labels)}</div>
      <div class="lrow"><span class="tx"><b id="layer-label-terrain">Lands, ranges &amp; rivers</b><small>The lettering drawn on the map itself</small></span>${sw('terrain', LAYERS.terrain)}</div>
      <div class="lrow"><span class="tx"><b id="layer-label-roads">Roads</b><small>East Road, Greenway, Harad Road…</small></span>${sw('roads', LAYERS.roads)}</div>
      <div class="lrow"><span class="tx"><b id="layer-label-realms">Realms</b><small>Tinted territories — change with the timeline</small></span>${sw('realms', LAYERS.realms)}</div>
      <div class="lrow"><span class="tx"><b>Little discoveries</b><small>Tiny illustrated stories, revealed up close</small></span><button class="sw ${LAYERS.details?'on':''}" data-sw="details" role="switch" aria-label="Little discoveries" aria-checked="${LAYERS.details}"></button></div>
    </div>
    <div class="orn"><span>Journeys</span></div>
    <div class="list">${JOURNEYS.map(j => `<div class="lrow"><span class="jsw" style="background:${j.color}"></span><span class="tx"><b id="layer-label-j-${j.id}">${esc(j.name)}</b><small>${esc(j.who || '')}</small></span><button class="pill" data-openj="${j.id}" aria-label="${esc('Details: '+j.name)}">details</button>${sw('j:'+j.id, !!LAYERS.journeys[j.id])}</div>`).join('')}</div>
    <div class="pills" style="margin-top:10px"><button class="pill" data-alljs="1">Show all journeys</button><button class="pill" data-alljs="0">Hide all</button></div>`;
}
$('#m-layers').addEventListener('click', e => {
  if (e.target.closest('[data-back]')) return mode('explore');
  const s = e.target.closest('[data-sw]'); if (s) { const id = s.dataset.sw; if (id.startsWith('j:')) LAYERS.journeys[id.slice(2)] = !LAYERS.journeys[id.slice(2)]; else LAYERS[id] = !LAYERS[id]; applyLayers(); renderLayers(); $('#m-layers [data-sw="'+CSS.escape(id)+'"]').focus(); return; }
  const oj = e.target.closest('[data-openj]'); if (oj) return openJourney(oj.dataset.openj);
  const all = e.target.closest('[data-alljs]'); if (all) { JOURNEYS.forEach(j => LAYERS.journeys[j.id] = all.dataset.alljs === '1'); applyLayers(); renderLayers(); }
});
function openLayers(){ renderLayers(); mode('layers'); if (sheetState === 'peek') setSheet('half'); focusPanel('layers'); }
$('#layersbtn').onclick = openLayers;
// A leg's optional via points describe the approach from the preceding waypoint.
function routePoints(legs){ return legs.flatMap((l, i) => i ? [...(l.via || []), l] : [l]); }
function routePath(legs){ return routePoints(legs).map((p, i) => `${i ? 'L' : 'M'}${p.x},${p.y}`).join(' '); }
function routeDistance(legs){ const pts = routePoints(legs); return pts.reduce((d, p, i) => i ? d + Math.hypot(p.x - pts[i-1].x, p.y - pts[i-1].y) : 0, 0); }
function drawJourneys(){
  let html = '';
  JOURNEYS.forEach(j => {
    if (!LAYERS.journeys[j.id]) return;
    const d = routePath(j.legs);
    html += `<path class="jr-glow" d="${d}"/><path class="jr" d="${d}" style="stroke:${j.color}"/>` + j.legs.map(l => `<circle class="jr-pt" cx="${l.x}" cy="${l.y}" r="2.2" style="stroke:${j.color}"/>`).join('');
  });
  $('#jlayer') && $('#jlayer').remove();
  const g = document.createElementNS('http://www.w3.org/2000/svg', 'g'); g.id = 'jlayer'; g.innerHTML = html; dyn.prepend(g);
}
// journey detail
let playTimer = null;
function openJourney(id){
  const j = JOURNEYS.find(x => x.id === id); if (!j) return;
  LAYERS.journeys[id] = true; applyLayers();
  const el = $('#m-journey');
  const total = routeDistance(j.legs);
  el.innerHTML = `<button class="back" data-back>${ico('back')} Back</button>
    <div class="ph"><div class="big" style="background:${j.color};color:#fff;border-color:transparent">${ico('route')}</div><div class="t"><h1>${esc(j.name)}</h1><div class="alts">${esc(j.who || '')}</div></div></div>
    <div class="stat"><div><b>${estimateLabel(total)} mi</b><small>schematic route estimate</small></div><div><b>${j.legs.length}</b><small>waypoints · ${esc(j.legs[0].date.replace(/^\d+ \w+ /,''))}</small></div></div>
    <p class="src">The line joins the recorded waypoints and any mapped detours. Its estimated length uses the map's uneven scale; unrecorded bends and terrain are not represented.</p>
    ${readingLink('journeys',j.id,'Read the journey guide','journey-guide')}
    <div class="actions" style="grid-template-columns:1fr 1fr"><button class="abtn primary" data-play>${ico('play')}Follow the road</button><button class="abtn" data-hidej>${ico('x')}Hide route</button></div>
    <ul class="evl" id="jlegs">${j.legs.map((l, i) => `<li><button class="waypoint-button" data-leg="${i}"><b>${esc(l.date)}</b>${esc(l.place)}${l.note ? `<span class="sub"> — ${esc(l.note)}</span>` : ''}</button></li>`).join('')}</ul>`;
  el.dataset.j = id; mode('journey'); syncURL({place:null,journey:id,event:null}); focusPanel('journey'); if (sheetState === 'peek') setSheet('half');
  stopPlay(); clearWaypoint();
  flyTo(j.legs[0].x, j.legs[0].y, Math.max(V.s, 1.2));
}
$('#m-journey').addEventListener('click', e => {
  const el = $('#m-journey'); const j = JOURNEYS.find(x => x.id === el.dataset.j);
  if (e.target.closest('[data-back]')) { stopPlay(); clearWaypoint(); return mode('explore'); }
  if (e.target.closest('[data-hidej]')) { stopPlay(); clearWaypoint(); LAYERS.journeys[j.id] = false; applyLayers(); return mode('explore'); }
  if (e.target.closest('[data-play]')) { if (playTimer) stopPlay(); else play(j); return; }
  const li = e.target.closest('[data-leg]'); if (li) { stopPlay(); const l = j.legs[+li.dataset.leg]; flyTo(l.x, l.y, Math.max(V.s, 2)); highlightLeg(+li.dataset.leg); }
});
// waypoint callout: a pulsing ring + name/date card on the map, and the road travelled so far
const wpEl = document.createElement('div'); wpEl.className = 'wp'; wpEl.innerHTML = '<i></i><span class="wpl"><b></b><small></small></span>'; mkLayer.appendChild(wpEl);
let wpMk = null;
function setWaypoint(j, i){
  if (wpMk) { wpMk.el.classList.remove('hl'); wpMk = null; }
  $('#jprog') && $('#jprog').remove();
  if (!j || i == null) { hovRef.wp = null; wpEl.classList.remove('on'); return; }
  const l = j.legs[i];
  wpEl.style.setProperty('--jc', j.color);
  wpEl.querySelector('b').textContent = l.place; wpEl.querySelector('small').textContent = l.date;
  hovRef.wp = l; wpEl.classList.add('on'); placeMarkers(true);
  wpMk = MK.find(m => m.p.id === l.placeId); if (wpMk) wpMk.el.classList.add('hl');
  if (i > 0) { const g = document.createElementNS('http://www.w3.org/2000/svg', 'path'); g.id = 'jprog'; g.setAttribute('class', 'jr-prog'); g.setAttribute('d', routePath(j.legs.slice(0, i + 1))); g.style.stroke = j.color; dyn.appendChild(g); }
}
function highlightLeg(i){ $$('#jlegs li').forEach((li, k) => li.style.background = k === i ? 'var(--accent-soft)' : ''); const li = $$('#jlegs li')[i]; if (li && sheetState !== 'peek') li.scrollIntoView({ block: 'nearest', behavior: reduceMotion ? 'auto' : 'smooth' });
  const j = JOURNEYS.find(x => x.id === $('#m-journey').dataset.j); if (j) setWaypoint(j, i); }
function play(j){ let i = 0; const btn = $('#m-journey [data-play]'); btn.innerHTML = `${ico('stop')}Stop`; if (!isDesktop()) setSheet('peek');
  const step = () => { if (i >= j.legs.length) { stopPlay(); return; } const l = j.legs[i]; flyTo(l.x, l.y, 2.2, 1100); highlightLeg(i); i++; playTimer = setTimeout(step, 2100); }; step(); }
function stopPlay(){ if (playTimer) { clearTimeout(playTimer); playTimer = null; } const btn = $('#m-journey [data-play]'); if (btn) btn.innerHTML = `${ico('play')}Follow the road`; }
function clearWaypoint(){ setWaypoint(null); $$('#jlegs li').forEach(li => li.style.background = ''); }

// ---------- directions ----------
function distanceEligible(p){ return !!p && !p._area && p.k < 4 && !['house','hall','inn','tomb','gate'].includes(p.t) && !['white-tower','court-of-the-fountain','citadel','the-hallow'].includes(p.id); }
function estimateLabel(d){ return d > 0 && d < 1 ? '≈ less than 1' : '≈ ' + Number(d.toPrecision(2)).toLocaleString('en-US'); }
function roadDays(distance, pace){ return distance * (4 / 3) / pace; }
let dirA = null, dirB = null, dirPick = null;
function openDirections(a, b){ if (a) dirA = a; if (b) dirB = b; renderDirections(); mode('dir'); if (sheetState === 'peek') setSheet('half'); drawDir(); }
function setDirSlot(slot, p){ if (slot === 'a') dirA = p; else dirB = p; dirPick = null; q.value = ''; qclear.classList.remove('on'); q.blur(); renderDirections(); mode('dir'); drawDir(); }
function drawDir(){
  $('#dlayer') && $('#dlayer').remove();
  if (!dirA || !dirB) return;
  const g = document.createElementNS('http://www.w3.org/2000/svg', 'g'); g.id = 'dlayer';
  g.innerHTML = `<line class="dirline" x1="${dirA.x}" y1="${dirA.y}" x2="${dirB.x}" y2="${dirB.y}"/><circle class="dirend" cx="${dirA.x}" cy="${dirA.y}" r="3"/><rect class="dirend" x="${dirB.x-3}" y="${dirB.y-3}" width="6" height="6"/>`;
  dyn.appendChild(g);
  // fit both
  const cx = (dirA.x + dirB.x) / 2, cy = (dirA.y + dirB.y) / 2; const span = Math.max(Math.abs(dirA.x - dirB.x), Math.abs(dirA.y - dirB.y)) + 200;
  const vw = viewport.width, vh = isDesktop() ? viewport.height : viewport.height * 0.5;
  flyTo(cx, cy, Math.min(V.max, Math.max(V.min, Math.min(vw, vh) / span)));
}
function journeyRoad(a, b){ // Mapped segment only; repeated visits choose the shortest intervening segment.
  const out = [];
  if (a.id === b.id || !distanceEligible(a) || !distanceEligible(b)) return out;
  JOURNEYS.forEach(j => {
    let best = null;
    j.legs.forEach((la, ia) => {
      if (la.placeId !== a.id) return;
      j.legs.forEach((lb, ib) => {
        if (lb.placeId !== b.id) return;
        const [s, e] = ia < ib ? [ia, ib] : [ib, ia];
        const d = routeDistance(j.legs.slice(s, e + 1));
        if (!best || d < best[1]) best = [j, d, j.legs[s].date, j.legs[e].date];
      });
    });
    if (best) out.push(best);
  });
  return out;
}
function renderDirections(){
  const el = $('#m-dir');
  const slot = (id, p) => `<button class="dslot ${p ? '' : 'empty'} ${dirPick === id ? 'active' : ''}" data-slot="${id}"><span>${p ? esc(p.n) : (id === 'a' ? 'Choose a starting place' : 'Choose a destination')}</span>${p ? '<span class="sub" style="font-size:12px">' + esc(p.r) + '</span>' : ''}</button>`;
  let stats = '';
  if (dirA && dirB) {
    const d = Math.hypot(dirA.x - dirB.x, dirA.y - dirB.y);
    const days = (mpd) => { const v = roadDays(d, mpd); return v === 0 ? '0 days' : v < 1 ? 'less than a day' : `about ${Math.round(v)} ${Math.round(v) === 1 ? 'day' : 'days'}`; };
    const roads = journeyRoad(dirA, dirB);
    stats = !distanceEligible(dirA) || !distanceEligible(dirB) ? `<p class="src">Distances and travel times are unavailable for area labels and small sites or interiors shown at an enlarged scale. Choose nearby towns or other major landmarks for a rough map estimate.</p>` : `<div class="stat"><div><b>${estimateLabel(d)} mi</b><small>straight line on this map · ${estimateLabel(d*1.609344)} km</small></div><div><b>${estimateLabel(d/3)}</b><small>leagues</small></div></div>
      <p class="src">A rough estimate from this schematic map, whose regional scale varies.${dirA.ap || dirB.ap ? ' At least one endpoint also has an uncertain position.' : ''}</p>
      <h3>Illustrative travel time</h3>
      <p class="src">Assumes a road one third longer than the map's straight line (${estimateLabel(d*4/3)} mi). No road network, mountain crossings, delays or rest days are calculated.</p>
      <div class="trav">
        <div><span>Walking scenario (18 mi/day)</span><b>${days(18)}</b></div>
        <div><span>Riding scenario (40 mi/day)</span><b>${days(40)}</b></div>
        <div><span>Fast riding scenario (60 mi/day)</span><b>${days(60)}</b></div>
      </div>
      ${roads.length ? `<h3>Mapped journey segments</h3><div class="trav">${roads.map(([j, rd, d1, d2]) => `<div><span style="color:${j.color}">${esc(j.name)}</span><b>${estimateLabel(rd)} mi · ${esc(d1)} → ${esc(d2)}</b></div>`).join('')}</div><p class="src">Dates follow the journey's chronology, including when the selected endpoints are reversed. Repeated visits use the shortest mapped segment.</p>` : ''}
      <p class="src">These paces are illustrative assumptions, not fixed speeds established by Tolkien for peoples, armies or individual characters.</p>`;
  }
  el.innerHTML = `<button class="back" data-back>${ico('back')} Back</button><h2>Directions</h2>
    <div class="dirbox" style="margin-top:8px"><span class="dot"></span>${slot('a', dirA)}<span class="vl"></span><button class="pill" data-swap style="justify-self:start">${ico('swap')} swap</button><span class="dot b"></span>${slot('b', dirB)}</div>
    ${dirPick ? `<p class="sub" style="margin-top:10px">Search above, or tap a place on the map.</p>` : ''}
    ${stats}`;
}
$('#m-dir').addEventListener('click', e => {
  if (e.target.closest('[data-back]')) { dirPick = null; $('#dlayer') && $('#dlayer').remove(); return mode('explore'); }
  if (e.target.closest('[data-swap]')) { [dirA, dirB] = [dirB, dirA]; renderDirections(); drawDir(); return; }
  const s = e.target.closest('[data-slot]'); if (s) { dirPick = s.dataset.slot; renderDirections(); q.value = ''; q.placeholder = dirPick === 'a' ? 'From…' : 'To…'; q.focus(); mode('search'); listResults(FEATURED.map(id => byId[id]), 'Pick a place', 'or tap the map'); }
});
q.addEventListener('blur', () => { setTimeout(() => { q.placeholder = 'Search Middle-earth…'; }, 200); });

// ---------- timeline ----------
const tl = $('#tl');
let timelineFrame = null, timelinePanelTimer = null;
function cancelTimelineUpdate(){
  if (timelineFrame != null) cancelAnimationFrame(timelineFrame);
  clearTimeout(timelinePanelTimer);
  timelineFrame = null; timelinePanelTimer = null;
}
const timelineEnd = Math.max(3141, ...TIMELINE.map(e => e.absoluteYear));
tl.value = yearToSlider(3019);
// Keep the early-age compression, but derive the final year from the data.
function sliderToYear(v){ v = Math.max(0, Math.min(1000, +v)); if (v <= 80) return Math.round(-9000 + (v/80) * (5559)); if (v <= 400) return Math.round(-3441 + ((v-80)/320) * 3441); return Math.round(((v-400)/600) * timelineEnd); }
function yearToSlider(y){ if (y <= -3441) return Math.max(0, (y + 9000) / 5559 * 80); if (y <= 0) return 80 + (y + 3441) / 3441 * 320; return Math.min(1000, 400 + y / timelineEnd * 600); }
const PRESETS = [[-2691,'Rings forged'],[-1744,'Fall of Eregion'],[-121,'Arnor & Gondor founded'],[-7,'Last Alliance'],[2,'Gladden Fields'],[1409,'Angmar strikes'],[1974,'Fall of Arthedain'],[1980,'Durin\'s Bane'],[2510,'Field of Celebrant'],[2770,'Smaug'],[2941,'Five Armies'],[3019,'War of the Ring'],[3141,'Fourth Age']];
$('#presets').innerHTML = PRESETS.map(([y, t]) => `<button class="chip" data-y="${y}">${esc(t)}</button>`).join('');
$('#presets').addEventListener('click', e => { const b = e.target.closest('[data-y]'); if (b) { tl.value = yearToSlider(+b.dataset.y); setYear(+b.dataset.y); } });
function setTimeline(on){
  cancelTimelineUpdate();
  tlOn = on; $('#tlbar').classList.toggle('on', on); $('#tlbtn').classList.toggle('on', on); mapEl.classList.toggle('tl-on', on);
  if (on) { setYear(sliderToYear(tl.value)); mode('tl'); syncURL({place:null,journey:null,event:null}); if (sheetState === 'peek') setSheet('half'); } else { updateRealms(); svgLabelLOD(); lodPass(); if ($('#m-tl').classList.contains('on')) mode('explore'); syncURL({year:null,event:null}); }
}
$('#tlbtn').onclick = () => setTimeline(!tlOn);
$('#year-form').addEventListener('submit', event => {
  event.preventDefault();
  const y = window.ATLAS_URL.absoluteYear($('#year-age').value, Number($('#year-number').value), timelineEnd);
  if (y == null) { toast('Choose a year within the selected age and supported timeline.'); return; }
  tl.value = yearToSlider(y); setYear(y); mode('tl'); syncURL({place:null,journey:null,event:null}); focusPanel('tl');
});
tl.addEventListener('input', () => {
  if (!tlOn || timelineFrame != null) return;
  timelineFrame = requestAnimationFrame(() => {
    timelineFrame = null; setYear(sliderToYear(tl.value), true);
  });
});
// Commit immediately on release (also covers keyboard changes).
tl.addEventListener('change', () => { if (tlOn) setYear(sliderToYear(tl.value)); });
function nearEvents(y){
  const ranked = TIMELINE.map(e => [Math.abs(e.absoluteYear - y), e]).sort((a, b) => a[0] - b[0] || a[1].absoluteYear - b[1].absoluteYear);
  // Do not silently drop later events in a busy year (3019 has 36).
  const count = Math.max(14, ranked.filter(([d]) => d === 0).length);
  return ranked.slice(0, count).sort((a, b) => a[1].absoluteYear - b[1].absoluteYear);
}
function setYear(y, deferPanel = false){
  cancelTimelineUpdate();
  tlYear = y; $('#tlyear').textContent = ageLabel(y);
  tl.setAttribute('aria-valuetext', ageLabel(y));
  const date = window.ATLAS_URL.dateFromYear(y);
  $('#year-age').value = date.age; $('#year-number').value = date.year;
  if (!deferPanel) syncURL({year:y,event:null});
  const ne = nearEvents(y); const exact = ne.filter(([d]) => d === 0);
  $('#tlnear').textContent = exact.length ? `${exact.length} events in this year` : (ne[0] ? `nearest: ${ne[0][1].title} (${ageLabel(ne[0][1].absoluteYear)})` : '');
  const win = new Set(ne.filter(([d]) => d <= 40).map(([, e]) => e));
  EV.forEach(({ e, el }) => el.classList.toggle('in', win.has(e)));
  updateRealms(); svgLabelLOD(); lodPass();
  // Map/year feedback stays live while scrubbing; rebuild the panel once settled.
  if (deferPanel) timelinePanelTimer = setTimeout(() => {
    timelinePanelTimer = null; renderTimeline(y, ne);
  }, 120);
  else renderTimeline(y, ne);
}
function renderTimeline(y, ne){
  const el = $('#m-tl');
  const gone = PLACES.filter(p => !placeVisibleInTime(p) && p.k <= 2).length;
  el.innerHTML = `<div class="hero"><div><div class="eyebrow">The map in</div><h1>${esc(ageLabel(y))}</h1></div><button class="pill" data-tloff>${ico('x')} leave</button></div>
    <p class="sub" style="margin-top:4px">${gone ? `${gone} notable entries fall outside their recorded period and are greyed on the map. A ruined site or former realm can still exist geographically.` : 'No notable entries fall outside their recorded periods.'} Undated entries remain visible. Drag the slider or pick a moment below.</p>
    <div class="orn"><span>Events near this year</span></div>
    <ul class="evl">${ne.map(([d, e]) => `<li style="${d===0?'background:var(--accent-soft);border-radius:8px':''}"><button class="waypoint-button" data-ev="${TIMELINE.indexOf(e)}"><b>${esc(e.timeLabel || ageLabel(e.absoluteYear))}${e.date ? ' · ' + esc(e.date) : ''}</b>${esc(e.title)}<span class="sub"> — ${esc(e.place)}</span></button></li>`).join('')}</ul>`;
}
$('#m-tl').addEventListener('click', e => {
  if (e.target.closest('[data-tloff]')) return setTimeline(false);
  const li = e.target.closest('[data-ev]'); if (li) showEvent(TIMELINE[+li.dataset.ev]);
});
function showEvent(ev){
  if (!tlOn) setTimeline(true);
  tl.value = yearToSlider(ev.absoluteYear); setYear(ev.absoluteYear);
  const el = $('#m-tl');
  const src = ev.src ? (ev.src.startsWith('tg:') ? TG + ev.src.slice(3) : ev.src) : null;
  el.insertAdjacentHTML('afterbegin', `<div style="background:var(--paper-2);border:1px solid var(--line);border-radius:14px;padding:12px 14px;margin-bottom:12px"><div class="eyebrow">${esc(ev.timeLabel || ageLabel(ev.absoluteYear))}${ev.date ? ' · ' + esc(ev.date) : ''}</div><h3 style="font-size:16px;margin:4px 0 6px">${esc(ev.title)}</h3><p style="margin:0 0 6px;font-size:15px">${esc(ev.text)}</p><div class="pills"><span class="pill">${esc(ev.place)}</span>${ev.approximate ? '<span class="pill">Approximate map location</span>' : ''}${src ? `<a class="pill" href="${esc(src)}" target="_blank" rel="noopener">Tolkien Gateway ↗</a>` : ''}</div></div>`);
  mode('tl'); syncURL({place:null,journey:null,event:ev.id,year:ev.absoluteYear}); focusPanel('tl'); if (sheetState === 'peek') setSheet('half');
  flyTo(ev.x, ev.y, Math.max(V.s, 1.4));
}

// ---------- toast ----------
let toastT; function toast(msg){ const t = $('#toast'); t.textContent = msg; t.classList.add('on'); clearTimeout(toastT); toastT = setTimeout(() => t.classList.remove('on'), 1700); }

window.__fly = flyTo;
// ---------- desktop niceties ----------
(function desktop(){
  // hovering a place in the panel marks it on the map
  const hov = document.createElement('div'); hov.className = 'hov'; hov.innerHTML = '<i></i>'; mkLayer.appendChild(hov);
  let hovP = null;
  function showHov(p){ hovP = p; if (!p) { hov.classList.remove('on'); return; } hov.style.transform = `translate3d(${(p.x * V.s).toFixed(1)}px,${(p.y * V.s).toFixed(1)}px,0)`; hov.classList.add('on'); }
  sheet.addEventListener('mouseover', e => { const go = e.target.closest('[data-go]'); const p = go && byId[go.dataset.go]; if (p !== hovP) showHov(p || null); });
  sheet.addEventListener('mouseleave', () => showHov(null));
  sheet.addEventListener('click', () => showHov(null));
  window.addEventListener('resize', () => showHov(null));
  hovRef.el = hov; hovRef.get = () => hovP;
  // the panel starts below the search bar and chips, whatever their height
  const top = $('#top');
  const syncTop = () => { if (isDesktop()) document.documentElement.style.setProperty('--topH', (top.offsetHeight + 8 - 16) + 'px'); };
  if (window.ResizeObserver) new ResizeObserver(syncTop).observe(top);
  window.addEventListener('resize', syncTop); syncTop();
})();
// ---------- URL navigation ----------
function restoreURL(){
  restoringURL = true;
  stopPlay(); clearWaypoint(); dirPick = null; q.value = ''; activeCat = null;
  $('#qclear').classList.remove('on');
  $$('#chips .chip').forEach(b => { b.classList.remove('on'); b.setAttribute('aria-pressed','false'); });
  clearSelection();
  const state = window.ATLAS_URL.parse(location.search,window.ATLAS_DATA,timelineEnd);
  setTimeline(false); mode('explore');
  if (state.year != null) { tl.value = yearToSlider(state.year); setTimeline(true); setYear(state.year); }
  if (state.place) selectPlace(byId[state.place],{fly:true});
  if (state.journey) openJourney(state.journey);
  if (state.event) showEvent(TIMELINE.find(ev=>ev.id===state.event));
  if (state.chapter) openChapter(state.chapter);
  Object.assign(urlState,state);
  restoringURL = false;
  if (state.error) { toast(state.error); $('#search-status').textContent = state.error; }
}
window.addEventListener('popstate',restoreURL);
function saveView(){ store.set('view', { s: V.s, tx: V.tx, ty: V.ty }); }
// ---------- init ----------
renderExplore(); renderLayers(); applyLayers();
(function init(){
  const saved = store.get('view');
  const h = homeView();
  if (saved && saved.s) { Object.assign(V, saved); } else Object.assign(V, h);
  clamp(); apply(); svgLabelLOD(); lodPass(); setSheet('peek'); scheduleSnapshot(400);
  setTimeout(warmDetails, 1800);
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) { saveView(); suspendSnapshot(); }
    else { if (!snapReady) scheduleSnapshot(700); warmDetails(); }
  });
  window.addEventListener('pageshow', () => { if (!snapReady) scheduleSnapshot(700); });
  const measure = () => requestAnimationFrame(() => { measureLabels(); lodPass(); });
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(measure); else setTimeout(measure, 800);
  window.addEventListener('pagehide', () => { saveView(); suspendSnapshot(); });
})();
restoreURL();
})();
