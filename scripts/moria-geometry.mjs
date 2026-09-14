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
