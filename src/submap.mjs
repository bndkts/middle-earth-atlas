import { WIDTH, HEIGHT, fitCamera, panCamera, zoomCamera, captureView, restoreView, layoutLabels } from './submap-camera.mjs?v=moria-3';

const viewport = document.querySelector('#map-viewport');
const plate = document.querySelector('#map-plate');
const articles = [...document.querySelectorAll('.place-notes article')];
const index = [...document.querySelectorAll('.place-index a')];
const pins = document.querySelector('#map-pins');
const status = document.querySelector('#map-status');
const controls = document.querySelector('.map-controls');
// Keep the static index first for readers without JavaScript.
document.querySelector('.place-notes').after(document.querySelector('.place-index'));
let size, camera, frame = null, selected = null;
const pointers = new Map();
let gesture = null, moved = false, downPin = null;
let labelPreference = null;
const picker = document.querySelector('#place-picker');
const overview = document.querySelector('#map-overview');
const nameMetrics = new Map();
const textMeasure = document.createElement('canvas').getContext('2d');
textMeasure.font = '11px Georgia';

for (const [i, article] of articles.entries()) {
  const pin = document.createElement('button');
  pin.className = 'map-pin'; pin.dataset.place = article.id;
  pin.dataset.x = Number(article.dataset.x) / 100 * WIDTH;
  pin.dataset.y = Number(article.dataset.y) / 100 * HEIGHT;
  nameMetrics.set(article.id, {width:Math.ceil(textMeasure.measureText(article.dataset.label).width)+16,height:23,side:article.dataset.labelSide});
  const option=document.createElement('option');option.value=article.id;option.textContent=String(i+1).padStart(2,'0')+' · '+article.dataset.label;picker.append(option);
  pin.setAttribute('aria-label', `Explore ${article.querySelector('h3').textContent}`);
  pin.setAttribute('aria-pressed', 'false');
  pin.setAttribute('aria-controls', article.id);
  const number = document.createElement('span'); number.className = 'pin-number'; number.textContent = String(i+1).padStart(2,'0');
  const label = document.createElement('span'); label.className = 'pin-label'; label.textContent = article.dataset.label;
  pin.append(number,label); pins.append(pin);
  // Pointer selection is handled on release, so dragging a pin never opens it.
  pin.addEventListener('click', e => { if (e.detail === 0) choose(article.id,{center:true,focus:true}); });
  pin.addEventListener('focus', () => {
    if (pointers.size) return;
    const x = Number(article.dataset.x)/100*WIDTH, y = Number(article.dataset.y)/100*HEIGHT;
    if (x*camera.scale+camera.x < 25 || x*camera.scale+camera.x > size.width-25 || y*camera.scale+camera.y < 45 || y*camera.scale+camera.y > size.height-25) {
      camera = panCamera({...camera, x:size.width/2-x*camera.scale, y:size.height/2-y*camera.scale},0,0,size.width,size.height); paint();
    }
  });
}
function paint() {
  if (frame != null) return;
  frame = requestAnimationFrame(() => {
    frame = null;
    plate.style.transform = `translate(${camera.x}px,${camera.y}px) scale(${camera.scale})`;
    const points=[];
    for(const pin of pins.children){
      const x=+pin.dataset.x*camera.scale+camera.x,y=+pin.dataset.y*camera.scale+camera.y;
      pin.hidden=x<12||x>size.width-12||y<12||y>size.height-12;
      pin.style.transform=`translate(${x-22}px,${y-22}px)`;
      pin.querySelector('.pin-label').hidden=true;
      if(!pin.hidden)points.push({id:pin.dataset.place,x,y,...nameMetrics.get(pin.dataset.place)});
    }
    for(const label of layoutLabels(points,size.width,size.height,selected)){
      const pin=pins.querySelector(`[data-place="${label.id}"]`),point=points.find(p=>p.id===label.id),name=pin.querySelector('.pin-label');
      name.hidden=false;name.style.left=`${label.x-point.x+22}px`;name.style.top=`${label.y-point.y+22}px`;
    }
    const ratio = camera.scale / fitCamera(size.width,size.height).scale;
    document.querySelector('#zoom-level').textContent = `${Math.round(ratio*100)}%`;
    document.querySelector('#zoom-out').disabled = ratio <= 1.001;
    document.querySelector('#zoom-in').disabled = ratio >= 5.999;
  });
}
function resetGesture() {
  const ids = [...pointers.keys()];
  pointers.clear(); gesture = null; moved = true; downPin = null;
  viewport.classList.remove('dragging');
  for (const id of ids) if (viewport.hasPointerCapture(id)) viewport.releasePointerCapture(id);
}
function measure() {
  const rect = viewport.getBoundingClientRect();
  const next = {width:rect.width,height:rect.height,left:rect.left,top:rect.top};
  if (!next.width || !next.height) return;
  if (!size || size.width !== next.width || size.height !== next.height) {
    resetGesture();
    // Keep the viewed illustration point and relative zoom through rotation.
    const fit = fitCamera(next.width,next.height);
    if (camera && size) {
      const ratio = camera.scale/fitCamera(size.width,size.height).scale;
      const x = (size.width/2-camera.x)/camera.scale, y = (size.height/2-camera.y)/camera.scale;
      camera = panCamera({scale:fit.scale*ratio,x:next.width/2-x*fit.scale*ratio,y:next.height/2-y*fit.scale*ratio},0,0,next.width,next.height);
    } else camera = fit;
    size = next;
    if(labelPreference===null){
      const show=next.width>700;
      pins.classList.toggle('labels-hidden',!show);
      document.querySelector('#toggle-labels').setAttribute('aria-pressed',String(show));
    }
    paint();
  } else size = next;
}
function saveHistory() {
  history.replaceState({submap:captureView(camera,size,selected)},'');
}
function choose(id, {write = true, center = false, focus = false} = {}) {
  resetGesture();
  const article=articles.find(item=>item.id===id);
  if(write)saveHistory();
  selected=article?.id || null;
  overview.hidden=!!article;
  for(const item of articles)item.hidden=item!==article;
  picker.value=selected || '';
  for(const a of index){if(a.hash==='#'+selected)a.setAttribute('aria-current','true');else a.removeAttribute('aria-current');}
  for(const pin of pins.children)pin.setAttribute('aria-pressed',String(pin.dataset.place===selected));
  if(center && article){
    const scale=Math.max(camera.scale,fitCamera(size.width,size.height).scale*2);
    camera=panCamera({scale,x:size.width/2-(+article.dataset.x/100*WIDTH)*scale,y:size.height/2-(+article.dataset.y/100*HEIGHT)*scale},0,0,size.width,size.height);
  } else if(center)camera=fitCamera(size.width,size.height);
  if(write){
    const hash=selected?'#'+selected:location.pathname;
    if(location.hash!==(selected?'#'+selected:''))history.pushState({submap:captureView(camera,size,selected)},'',hash);
    else saveHistory();
  }
  // The description sits above the index; selection remains visible even after
  // scrolling through a long source note. Keyboard selection focuses the heading.
  document.querySelector('#gazetteer').scrollTop=0;
  status.textContent=article?`Selected ${article.querySelector('h3').textContent}.`:'Showing the whole map.';
  if(focus && article){const heading=article.querySelector('h3');heading.tabIndex=-1;heading.focus({preventScroll:true});}
  paint();
}
for(const link of index)link.addEventListener('click',e=>{e.preventDefault();choose(link.hash.slice(1),{center:true,focus:e.detail===0});});
picker.addEventListener('change',()=>choose(picker.value,{center:true}));
window.addEventListener('popstate',e=>{
  resetGesture();
  choose(location.hash.slice(1),{write:false,center:!e.state?.submap});
  camera=restoreView(e.state?.submap,size.width,size.height)||camera;
  paint();
});
function zoom(factor, x=size.width/2, y=size.height/2) {
  resetGesture();
  camera = zoomCamera(camera,factor,x,y,size.width,size.height); saveHistory(); paint();
}
document.querySelector('#zoom-in').onclick = () => zoom(1.4);
document.querySelector('#zoom-out').onclick = () => zoom(1/1.4);
document.querySelector('#fit-map').onclick = () => {resetGesture();camera=fitCamera(size.width,size.height);saveHistory();paint();};
document.querySelector('#toggle-labels').onclick = e => {
  const hidden = pins.classList.toggle('labels-hidden');
  labelPreference=!hidden;
  e.currentTarget.setAttribute('aria-pressed',String(!hidden));
};
function beginGesture() {
  const points = [...pointers.values()];
  if (points.length === 1) gesture = {camera:{...camera},point:points[0]};
  else if (points.length >= 2) {
    const [a,b] = points;
    gesture = {camera:{...camera},distance:Math.max(1,Math.hypot(a.x-b.x,a.y-b.y)),mid:{x:(a.x+b.x)/2,y:(a.y+b.y)/2}};
  } else gesture = null;
}
viewport.addEventListener('pointerdown', e => {
  if (e.pointerType === 'mouse' && e.button !== 0) return;
  measure();
  pointers.set(e.pointerId,{x:e.clientX-size.left,y:e.clientY-size.top});
  viewport.setPointerCapture(e.pointerId);
  if (pointers.size === 1) { moved = false; downPin = e.target.closest('.map-pin'); }
  else { moved = true; downPin = null; }
  beginGesture();
});
viewport.addEventListener('pointermove', e => {
  if (!pointers.has(e.pointerId) || !gesture) return;
  pointers.set(e.pointerId,{x:e.clientX-size.left,y:e.clientY-size.top});
  const [a,b] = [...pointers.values()];
  if (b && gesture.mid) {
    const mid = {x:(a.x+b.x)/2,y:(a.y+b.y)/2};
    const zoomed = zoomCamera(gesture.camera,Math.hypot(a.x-b.x,a.y-b.y)/gesture.distance,gesture.mid.x,gesture.mid.y,size.width,size.height);
    camera = panCamera(zoomed,mid.x-gesture.mid.x,mid.y-gesture.mid.y,size.width,size.height);
  } else if (gesture.point) {
    const dx=a.x-gesture.point.x,dy=a.y-gesture.point.y;
    if (Math.hypot(dx,dy)>4) moved=true;
    if (moved) camera=panCamera(gesture.camera,dx,dy,size.width,size.height);
  }
  if (moved) {viewport.classList.add('dragging');paint();}
});
function release(e) {
  if (!pointers.has(e.pointerId)) return;
  if (e.type !== 'pointerup') {resetGesture();return;}
  pointers.delete(e.pointerId);
  if (viewport.hasPointerCapture(e.pointerId)) viewport.releasePointerCapture(e.pointerId);
  if (!pointers.size) {
    viewport.classList.remove('dragging');
    if (!moved && downPin) choose(downPin.dataset.place,{center:true});
    downPin = null;
    saveHistory();
  } else moved = true;
  beginGesture();
}
for (const type of ['pointerup','pointercancel','lostpointercapture']) viewport.addEventListener(type,release);
window.addEventListener('blur',resetGesture);
document.addEventListener('visibilitychange',() => {if(document.hidden) resetGesture();});
viewport.addEventListener('wheel',e => {
  // A normal wheel scroll still scrolls the page on mobile-sized layouts.
  if (window.innerWidth <= 700 && !e.ctrlKey && !e.metaKey) return;
  e.preventDefault(); measure(); resetGesture();
  zoom(Math.exp(-Math.max(-100,Math.min(100,e.deltaY))*0.008),e.clientX-size.left,e.clientY-size.top);
},{passive:false});
viewport.addEventListener('keydown',e => {
  if (e.target !== viewport) return;
  const arrows = {ArrowLeft:[65,0],ArrowRight:[-65,0],ArrowUp:[0,65],ArrowDown:[0,-65]};
  if (arrows[e.key]) {e.preventDefault();resetGesture();camera=panCamera(camera,...arrows[e.key],size.width,size.height);saveHistory();paint();}
  else if (e.key==='+' || e.key==='=') {e.preventDefault();zoom(1.4);}
  else if (e.key==='-') {e.preventDefault();zoom(1/1.4);}
  else if (e.key==='0' || e.key==='Home') {e.preventDefault();resetGesture();camera=fitCamera(size.width,size.height);saveHistory();paint();}
});
const expand=document.querySelector('#expand-map');
function expandMap(on){
  resetGesture();
  document.body.classList.toggle('map-expanded',on);
  expand.setAttribute('aria-expanded',String(on));
  expand.setAttribute('aria-label',on?'Exit expanded map':'Expand map');
}
expand.onclick=()=>expandMap(!document.body.classList.contains('map-expanded'));
const menu = document.querySelector('.map-menu');
document.addEventListener('keydown',e => {if(e.key==='Escape' && document.body.classList.contains('map-expanded')){expandMap(false);expand.focus();}if(e.key==='Escape' && menu.open){menu.open=false;menu.querySelector('summary').focus();}});
document.addEventListener('click',e => {if(!menu.contains(e.target)) menu.open=false;});
document.documentElement.classList.add('enhanced');
controls.hidden = false;
document.querySelector('.place-picker').hidden=false;
measure();
choose(location.hash.slice(1),{write:false,center:!!location.hash});
camera=restoreView(history.state?.submap,size.width,size.height)||camera;
saveHistory();
new ResizeObserver(measure).observe(viewport);
document.querySelector('#map-help').textContent = 'Drag to explore · Select a place · Pinch or use + to zoom';
