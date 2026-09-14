// Illustration coordinates, independent of both CSS pixels and world-map miles.
export const WIDTH = 1500, HEIGHT = 1000;
export function fitCamera(width, height) {
  const scale = Math.max(.001, Math.min(width / WIDTH, height / HEIGHT));
  return { scale, x: (width - WIDTH * scale) / 2, y: (height - HEIGHT * scale) / 2 };
}
export function panCamera(camera, dx, dy, width, height) {
  const bound = (value, size, available) => size <= available ? (available-size)/2 : Math.min(0, Math.max(available-size, value));
  return { scale: camera.scale,
    x: bound(camera.x + dx, WIDTH * camera.scale, width),
    y: bound(camera.y + dy, HEIGHT * camera.scale, height) };
}
export function zoomCamera(camera, factor, x, y, width, height) {
  const minimum = fitCamera(width, height).scale;
  const scale = Math.min(minimum * 6, Math.max(minimum, camera.scale * factor));
  const ratio = scale / camera.scale;
  return panCamera({ scale, x: x-(x-camera.x)*ratio, y: y-(y-camera.y)*ratio }, 0, 0, width, height);
}

export function captureView(camera, size, place) {
  return {place, zoom:camera.scale/fitCamera(size.width,size.height).scale,
    x:(size.width/2-camera.x)/camera.scale, y:(size.height/2-camera.y)/camera.scale};
}
export function restoreView(view, width, height) {
  if (!view || ![view.x,view.y,view.zoom].every(Number.isFinite) || view.zoom<1 || view.zoom>6) return null;
  const scale=fitCamera(width,height).scale*view.zoom;
  return panCamera({scale,x:width/2-view.x*scale,y:height/2-view.y*scale},0,0,width,height);
}
export function layoutLabels(points, width, height, selected, protectedArt = []) {
  const overlaps=(a,b)=>a.x<b.x+b.width+3&&a.x+a.width+3>b.x&&a.y<b.y+b.height+3&&a.y+a.height+3>b.y;
  const markers=points.map(p=>({x:p.x-13,y:p.y-13,width:26,height:26}));
  const placed=[];
  for(const p of [...points].sort((a,b)=>Number(b.id===selected)-Number(a.id===selected))) {
    const candidates=[
      [p.x-p.width/2,p.y-20-p.height],[p.x+20,p.y-p.height/2],
      [p.x-p.width/2,p.y+20],[p.x-20-p.width,p.y-p.height/2],
    ];
    if(p.side==='below')candidates.unshift(candidates.splice(2,1)[0]);
    for(const [x,y] of candidates){
      const r={id:p.id,x:Math.max(4,Math.min(width-p.width-4,x)),y:Math.max(4,Math.min(height-p.height-4,y)),width:p.width,height:p.height};
      if(r.width>width-8||r.height>height-8||markers.some(m=>overlaps(r,m))||placed.some(m=>overlaps(r,m))||protectedArt.some(m=>overlaps(r,m)))continue;
      placed.push(r);break;
    }
  }
  return placed;
}

// Frame the drawing belonging to a landmark, independently of its index marker.
export function landmarkCamera(bounds, width, height) {
  const fit=fitCamera(width,height);
  if(!bounds || ![bounds.x,bounds.y,bounds.width,bounds.height].every(Number.isFinite) || bounds.width<=0 || bounds.height<=0)return fit;
  const scale=Math.max(fit.scale,Math.min(fit.scale*6,(width-40)/bounds.width,(height-40)/bounds.height));
  return panCamera({scale,x:width/2-(bounds.x+bounds.width/2)*scale,y:height/2-(bounds.y+bounds.height/2)*scale},0,0,width,height);
}
