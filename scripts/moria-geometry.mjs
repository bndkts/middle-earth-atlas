// The plate uses straight survey segments (M/L/H/V), not geographic coordinates.
export function passagePoints(d) {
  let x=0,y=0;
  return [...d.matchAll(/([MLHV])([^MLHV]+)/g)].map(([,command,values])=>{
    const numbers=values.trim().split(/[ ,]+/).map(Number);
    if(command==='H')x=numbers[0];else if(command==='V')y=numbers[0];else [x,y]=numbers;
    return [x,y];
  });
}

export function roomOpenings(routes, rooms) {
  const openings=[];
  for(const [d,width]of routes){
    const points=passagePoints(d);
    for(let i=1;i<points.length;i++){
      const [ax,ay]=points[i-1],[bx,by]=points[i],vx=bx-ax,vy=by-ay,length=Math.hypot(vx,vy);
      if(!length)continue;
      for(const room of rooms)for(let j=0;j<room.outline.length;j++){
        const [cx,cy]=room.outline[j],[ex,ey]=room.outline[(j+1)%room.outline.length];
        const wx=ex-cx,wy=ey-cy,den=vx*wy-vy*wx;
        if(Math.abs(den)<1e-9)continue;
        const t=((cx-ax)*wy-(cy-ay)*wx)/den,u=((cx-ax)*vy-(cy-ay)*vx)/den;
        if(t<0||t>1||u<0||u>1)continue;
        const x=ax+t*vx,y=ay+t*vy;
        if(openings.some(o=>o.room===room&&Math.hypot(o.x-x,o.y-y)<1))continue;
        openings.push({x,y,dx:vx/length,dy:vy/length,width,room});
      }
    }
  }
  return openings;
}

// Draw access equipment along every vertical route from the occupied floor.
// Roof entries continue to the floor inside the room instead of stopping in air.
export function verticalAccess(routes, rooms) {
  const access=[];
  for(const [d,width]of routes){
    const points=passagePoints(d);
    for(let i=1;i<points.length;i++){
      const [x,ay]=points[i-1],[bx,by]=points[i];
      if(x!==bx||Math.abs(by-ay)<4)continue;
      let spans=[[Math.min(ay,by),Math.max(ay,by)]];
      for(const room of rooms){
        if(x<=room.x+3||x>=room.x+room.w-3)continue;
        const roof=room.y,floor=room.y+room.h;
        spans=spans.flatMap(([top,bottom])=>{
          if(bottom<=roof||top>=floor)return [[top,bottom]];
          if(top<roof)return [[top,Math.max(bottom,floor)]];
          return [[top,Math.min(bottom,roof)],[Math.max(top,floor),bottom]].filter(([a,b])=>b-a>3);
        });
      }
      for(const [top,bottom]of spans)access.push({x,top,bottom,width,kind:width<9?'ladder':'stairs'});
    }
  }
  return access;
}

// Furniture belongs behind the walking route, never across an access flight.
export function furnishingFits(x, width, openings) {
  return !openings.some(o=>{
    const vertical=Math.abs(o.dy)>.01;
    const start=vertical?o.x-o.width/2-2:o.x<o.room.x+o.room.w/2?o.x-2:o.x-25;
    const end=vertical?o.x+o.width/2+2:o.x<o.room.x+o.room.w/2?o.x+25:o.x+2;
    return x<end&&x+width>start;
  });
}
