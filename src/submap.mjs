import { WIDTH, HEIGHT, fitCamera, panCamera, zoomCamera } from './submap-camera.mjs';

const viewport = document.querySelector('#map-viewport');
const plate = document.querySelector('#map-plate');
const articles = [...document.querySelectorAll('.place-notes article')];
const index = [...document.querySelectorAll('.place-index a')];
const pins = document.querySelector('#map-pins');
const status = document.querySelector('#map-status');
const controls = document.querySelector('.map-controls');
let size, camera, frame = null, selected = null;
const pointers = new Map();
let gesture = null, moved = false, downPin = null;

for (const [i, article] of articles.entries()) {
  const pin = document.createElement('button');
  pin.className = 'map-pin'; pin.dataset.place = article.id;
  pin.style.left = `${Number(article.dataset.x) / 100 * WIDTH}px`;
  pin.style.top = `${Number(article.dataset.y) / 100 * HEIGHT}px`;
  if (+article.dataset.x > 85) pin.dataset.edge = 'right';
  if (+article.dataset.x < 15) pin.dataset.edge = 'left';
  pin.setAttribute('aria-label', `Explore ${article.querySelector('h3').textContent}`);
  pin.setAttribute('aria-pressed', 'false');
  const number = document.createElement('span'); number.className = 'pin-number'; number.textContent = String(i+1).padStart(2,'0');
  const label = document.createElement('span'); label.className = 'pin-label'; label.textContent = article.dataset.label;
  pin.append(number,label); pins.append(pin);
  // Pointer selection is handled on release, so dragging a pin never opens it.
  pin.addEventListener('click', e => { if (e.detail === 0) choose(article.id); });
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
    plate.style.setProperty('--inverse', 1/camera.scale);
    pins.classList.toggle('compact-labels',camera.scale < .6);
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
    size = next; paint();
  } else size = next;
}
function choose(id, {write = true, center = false} = {}) {
  const article = articles.find(item => item.id === id) || articles[0];
  selected = article.id;
  for (const item of articles) item.hidden = item !== article;
  for (const a of index) {
    if (a.hash === '#'+selected) a.setAttribute('aria-current','true'); else a.removeAttribute('aria-current');
  }
  for (const pin of pins.children) pin.setAttribute('aria-pressed',String(pin.dataset.place === selected));
  if (write && location.hash !== '#'+selected) history.pushState(null,'','#'+selected);
  if (center) {
    const scale = Math.max(camera.scale,fitCamera(size.width,size.height).scale*2);
    camera = panCamera({scale,x:size.width/2-(+article.dataset.x/100*WIDTH)*scale,y:size.height/2-(+article.dataset.y/100*HEIGHT)*scale},0,0,size.width,size.height);
    paint();
  }
  status.textContent = `Selected ${article.querySelector('h3').textContent}. Description in the landmark index.`;
}
for (const link of index) link.addEventListener('click', e => { e.preventDefault(); choose(link.hash.slice(1),{center:true}); });
window.addEventListener('popstate', () => choose(location.hash.slice(1),{write:false}));
function zoom(factor, x=size.width/2, y=size.height/2) {
  camera = zoomCamera(camera,factor,x,y,size.width,size.height); paint();
}
document.querySelector('#zoom-in').onclick = () => zoom(1.4);
document.querySelector('#zoom-out').onclick = () => zoom(1/1.4);
document.querySelector('#fit-map').onclick = () => {resetGesture();camera=fitCamera(size.width,size.height);paint();};
document.querySelector('#toggle-labels').onclick = e => {
  const hidden = pins.classList.toggle('labels-hidden');
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
    if (!moved && downPin) choose(downPin.dataset.place);
    downPin = null;
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
  if (arrows[e.key]) {e.preventDefault();camera=panCamera(camera,...arrows[e.key],size.width,size.height);paint();}
  else if (e.key==='+' || e.key==='=') {e.preventDefault();zoom(1.4);}
  else if (e.key==='-') {e.preventDefault();zoom(1/1.4);}
  else if (e.key==='0' || e.key==='Home') {e.preventDefault();camera=fitCamera(size.width,size.height);paint();}
});
const menu = document.querySelector('.map-menu');
document.addEventListener('keydown',e => {if(e.key==='Escape' && menu.open){menu.open=false;menu.querySelector('summary').focus();}});
document.addEventListener('click',e => {if(!menu.contains(e.target)) menu.open=false;});
document.documentElement.classList.add('enhanced');
controls.hidden = false;
measure();
choose(location.hash.slice(1),{write:false});
new ResizeObserver(measure).observe(viewport);
document.querySelector('#map-help').textContent = 'Drag to explore · Pinch or use + to look closer · Select a numbered place';
