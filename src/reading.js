(function(global){
'use strict';
const palette=['#8b3429','#34674d','#70518b','#326c83','#98681f','#6d6542','#80563c','#565f91'];
function restore(value,chapters){
  return {chapterId:chapters.some(c=>c.id===value?.chapterId)?value.chapterId:chapters[0].id,guard:value?.guard===true};
}
function title(chapter,state,chapters){
  return state.guard && chapters.indexOf(chapter)>chapters.findIndex(c=>c.id===state.chapterId)?'Unread chapter':chapter.title;
}
function color(id){
  let hash=0;for(const c of String(id))hash=(hash*31+c.charCodeAt(0))>>>0;
  return palette[hash%palette.length];
}
function spread(points){
  const placed=[];
  for(const p of points){
    let candidate={...p},attempt=0;
    while(placed.some(q=>Math.hypot(q.x-candidate.x,q.y-candidate.y)<36)){
      const angle=(attempt%8)*Math.PI/4, radius=(1+Math.floor(attempt/8))*38;
      candidate={x:p.x+Math.cos(angle)*radius,y:p.y+Math.sin(angle)*radius};attempt++;
    }
    placed.push(candidate);
  }
  return placed;
}
global.ATLAS_READING={restore,title,color,spread};
})(window);
