/* Bounded, incremental terrain rendering. No network requests or per-frame draws. */
(function(global){
'use strict';
const SIZE = 512, BLEED = 1, MAPW = 2600, MAPH = 2300;
function plan(view, limit){
  const ratio = Math.max(1, view.dpr || 1);
  let level = Math.max(-2, Math.min(12, Math.ceil(Math.log2(view.s * ratio) * 2)));
  const bounds = span => ({
    x0: Math.max(0, Math.floor((view.left - view.tx) / view.s / span)),
    y0: Math.max(0, Math.floor(-view.ty / view.s / span)),
    x1: Math.min(Math.ceil(MAPW / span)-1, Math.floor((view.width - view.tx) / view.s / span)),
    y1: Math.min(Math.ceil(MAPH / span)-1, Math.floor((view.height - view.ty) / view.s / span)),
  });
  let density, span, b;
  do {
    density = 2 ** (level / 2); span = SIZE / density; b = bounds(span);
    if ((b.x1-b.x0+1)*(b.y1-b.y0+1) <= limit - 4 || level <= -2) break;
    level--;
  } while (true);
  const result = [], cx = (b.x0+b.x1)/2, cy = (b.y0+b.y1)/2;
  for(let y=Math.max(0,b.y0-1);y<=Math.min(Math.ceil(MAPH/span)-1,b.y1+1);y++) {
    for(let x=Math.max(0,b.x0-1);x<=Math.min(Math.ceil(MAPW/span)-1,b.x1+1);x++) {
      const visible = x>=b.x0 && x<=b.x1 && y>=b.y0 && y<=b.y1;
      result.push({key:`${level}/${x}/${y}`,level,x:x*span,y:y*span,span,density,visible,
        priority:(visible?0:10000)+(x-cx)**2+(y-cy)**2});
    }
  }
  return result.sort((a,b)=>a.priority-b.priority).slice(0,limit);
}
function create({layer,getView,paused,compact,onUpdate=()=>{}}){
  let generation=0, timer=null, idle=null, source=null, preparing=null, busy=null, cooldown=100;
  const cache=new Map(), failed=new Set();
  const limit=()=>compact()?20:32;
  function release(tile){ tile.canvas.remove(); tile.canvas.width=tile.canvas.height=0; }
  function cancel(){
    clearTimeout(timer); timer=null;
    if(idle!=null) global.cancelIdleCallback(idle);
    idle=null;
  }
  function invalidate(){
    generation++; cancel(); source=null; preparing=null; failed.clear();
    if(busy){ busy.image.onload=busy.image.onerror=null; busy.image.src=''; URL.revokeObjectURL(busy.url); busy=null; }
    cache.forEach(release); cache.clear();
  }
  function schedule(delay=100){
    if(timer!=null || idle!=null || document.hidden || (!source && !preparing)) return;
    timer=setTimeout(()=>{
      timer=null;
      if(global.requestIdleCallback) idle=global.requestIdleCallback(deadline=>{
        idle=null;
        if(deadline.timeRemaining()<5){ schedule(150); return; }
        pump();
      }); // No timeout: speculative work must never force its way into a busy frame.
      else pump();
    },delay);
  }
  function setSource(root,baseDensity){
    invalidate();
    preparing={root,baseDensity,nodes:[...root.querySelectorAll('[data-raster-bounds]')],parts:[],index:0};
    schedule();
  }
  function prepare(){
    const p=preparing, start=performance.now(), serializer=new XMLSerializer();
    do {
      const node=p.nodes[p.index];
      if(!node) break;
      const [x,y,width,height]=node.getAttribute('data-raster-bounds').split(',').map(Number);
      node.removeAttribute('data-raster-bounds');
      p.parts.push({x,y,width,height,xml:serializer.serializeToString(node)});
      node.replaceWith(document.createComment('atlas-bucket:'+p.index)); p.index++;
    } while(p.index<p.nodes.length && performance.now()-start<4);
    if(p.index===p.nodes.length){
      const xml=serializer.serializeToString(p.root);
      source={parts:xml.split(/<!--atlas-bucket:(\d+)-->/),buckets:p.parts,baseDensity:p.baseDensity};
      preparing=null;
    }
    schedule();
  }
  function tileSVG(tile){
    const bleed=BLEED/tile.density;
    const xml=source.parts.map((part,i)=>{
      if(i%2===0) return part;
      const b=source.buckets[Number(part)];
      return b.x+b.width>tile.x-bleed && b.x<tile.x+tile.span+bleed && b.y+b.height>tile.y-bleed && b.y<tile.y+tile.span+bleed ? b.xml : '';
    }).join('');
    const attrs={width:SIZE+2*BLEED,height:SIZE+2*BLEED,
      viewBox:`${tile.x-bleed} ${tile.y-bleed} ${tile.span+2*bleed} ${tile.span+2*bleed}`};
    // Retain root classes: roads and historical realms are part of the cache state.
    return xml.replace(/^<svg\b[^>]*>/,head=>head.replace(/\b(width|height|viewBox)="[^"]*"/g,
      (match,name)=>`${name}="${attrs[name]}"`));
  }
  function publish(job,wanted){
    // Decodes may finish during a pinch or after a jump: only commit useful current work.
    const relevant=wanted.some(t=>t.key===job.tile.key);
    if(relevant){
      const canvas=document.createElement('canvas'), tile=job.tile;
      canvas.width=canvas.height=SIZE+2*BLEED;
      const context=canvas.getContext('2d');
      const start=performance.now();
      try { context.drawImage(job.image,0,0); }
      catch(e){ canvas.width=canvas.height=0; failed.add(tile.key); return; }
      cooldown=Math.min(400,Math.max(100,(performance.now()-start)*5));
      const bleed=BLEED/tile.density;
      Object.assign(canvas.style,{left:(tile.x-bleed)+'px',top:(tile.y-bleed)+'px',
        width:(tile.span+2*bleed)+'px',height:(tile.span+2*bleed)+'px'});
      canvas.dataset.tile=tile.key; canvas.style.zIndex='1';
      cache.set(tile.key,{...tile,canvas}); layer.appendChild(canvas);
    }
  }
  function isSharp(){
    const view=getView(), required=view.s*Math.max(1,view.dpr||1);
    const baseDensity=source?.baseDensity ?? preparing?.baseDensity ?? 0;
    if(baseDensity>=required) return true;
    const visible=plan(view,limit()).filter(tile=>tile.visible);
    // Memory limits may lower preview resolution. Such tiles are useful while
    // moving, but must never replace the resting vector map on a Retina display.
    return visible.length>0 && visible.every(tile=>tile.density>=required && cache.has(tile.key));
  }
  function pump(){
    if(document.hidden) return;
    if(paused() || global.navigator?.scheduling?.isInputPending?.()){ schedule(180); return; }
    if(preparing){ prepare(); return; }
    if(!source) return;
    const view=getView(), wanted=plan(view,limit()), keys=new Set(wanted.map(t=>t.key));
    // Keep older zoom levels underneath while replacements arrive; bound retained pixels.
    for(const tile of cache.values()) tile.canvas.style.zIndex=keys.has(tile.key)?'1':'0';
    if(busy){
      if(!busy.ready) return;
      const job=busy; busy=null;
      try { publish(job,wanted); } finally { URL.revokeObjectURL(job.url); }
    }
    for(const t of wanted){ if(cache.has(t.key)){ const value=cache.get(t.key); cache.delete(t.key); cache.set(t.key,value); } }
    while(cache.size>limit()){
      const key=[...cache.keys()].find(k=>!keys.has(k)) || cache.keys().next().value;
      release(cache.get(key)); cache.delete(key);
    }
    onUpdate();
    if(view.s*Math.max(1,view.dpr||1)<=source.baseDensity){ return; }
    const next=wanted.find(t=>!cache.has(t.key) && !failed.has(t.key));
    if(!next) return;
    const image=new Image(), version=generation;
    image.decoding='async';
    const url=URL.createObjectURL(new Blob([tileSVG(next)],{type:'image/svg+xml;charset=utf-8'}));
    const job={tile:next,image,url,ready:false}; busy=job;
    image.onload=()=>{ if(version!==generation) return; job.ready=true; schedule(cooldown); };
    image.onerror=()=>{ if(version!==generation) return; failed.add(next.key); URL.revokeObjectURL(url); busy=null; schedule(250); };
    image.src=url;
  }
  document.addEventListener('visibilitychange',()=>{ if(document.hidden) cancel(); else schedule(250); });
  return {setSource,invalidate,schedule,isSharp};
}
global.ATLAS_RASTER={create,plan};
})(globalThis);
