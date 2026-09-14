import { moriaFigureDefinitions, moriaFigureScenes } from './draw-moria-figures.mjs';

// Original ink miniatures, using the main map's muted pigment palette.
// All figures are illustrative story vignettes, not a simultaneous population.
export function drawMoriaScenes() {
  const s=[];
  const p=(d,fill='none',extra='')=>s.push(`<path d="${d}" fill="${fill}" ${extra}/>`);
  const group=(id,x,y,scale=1)=>s.push(`<g id="${id}" transform="translate(${x} ${y}) scale(${scale})">`);
  const end=()=>s.push('</g>');
  const use=(id,x,y,scale=1)=>s.push(`<use href="#${id}" transform="translate(${x} ${y}) scale(${scale})"/>`);
  s.push('<g stroke="#4b4435" stroke-width=".65" stroke-linejoin="round" stroke-linecap="round"><defs>');
  s.push(moriaFigureDefinitions());
  group('dwarf-statue',0,0);
  p('M-9 0h18v-4H7l-2-9 3-11-3-7h-10l-3 7 3 11-2 9h-2Z','#b8b1a0');
  p('M-5-29l1-7 4-4 4 4 1 7-5 4Z','#cbc2a9');
  p('M-4-29l4 2 4-2-1 10-3 4-3-4Z','#b8b1a0');
  p('M-2-26v6m4-6v6M-5-14l10 0M-6-7h12M-3-32h2m2 0h2','none','stroke-width=".5"');
  p('M-10-6v-24m0 1-6 1v7l6-3 6 3v-7Z','#a49e8e');
  end();
  group('mine-cart',0,0);
  p('M-13-13h26l-3 10h-20Z','#a38c65');
  p('M-11-13l4-5 5 2 4-5 6 3 3 5Z','#82908a');
  p('M-9-11l1 6m5-6v6m6-6v6m5-6-1 6M-16 2h32','none');
  for(const x of [-7,7])s.push(`<circle cx="${x}" cy="-1" r="2.5" fill="#635e50"/><circle cx="${x}" cy="-1" r=".7" fill="#c4b58f"/>`);
  end();
  group('brazier',0,0);
  p('M-5-9q-5-5 0-10l2 4 2-11q8 8 4 13l4-5q4 8-3 11Z','#af744a','stroke="#825337" stroke-width=".5"');
  p('M-2-9q-3-4 1-9l2 4 2-4q3 5-1 9Z','#d8b569','stroke="none"');
  p('M-6-9H6L3-5H-3Zm6 4v5m-4 0h8','#635e50');
  end();
  s.push('</defs>');

  // The old kingdom: carved guardians, faded tapestries and fine hanging chains.
  use('dwarf-statue',651,414,.82);use('dwarf-statue',944,414,.82);
  for(const [x,y,h] of [[710,351,29],[874,351,29],[952,549,29],[1138,549,29]]){
    group(`banner-${x}`,x,y);
    p(`M-6 0H6v${h}l-6-4-6 4Z`,'#73816f','stroke="#59614d"');
    p(`M-3 2v${h-6}m6-${h-6}v${h-6}`,'none','stroke="#c9b684" stroke-width=".5"');
    p('M-4 10 0 6l4 4-4 4Zm4 4v6m-3-1h6','none','stroke="#d1bd87"');end();
  }
  for(const [x,y] of [[748,354],[907,354],[980,550],[1094,550]]){
    p(`M${x} ${y-12}v21m-10 0q10 6 20 0m-17-2v5m7-3v5m7-7v5`,'none','stroke="#64543a"');
    for(const dx of [-7,0,7])p(`M${x+dx} ${y+8}q-2-3 0-4q2 2 0 4Z`,'#d5b46b','stroke="none"');
  }
  // Floor mosaics, abandoned books and broken pillar drums reward a close look.
  for(const x of [695,735,776,856,896])p(`M${x} 413l8-3 8 3-8 3Z`,'#b69b68','stroke-width=".4"');
  for(const [x,y] of [[1033,349],[1076,347],[751,588]]){
    p(`M${x} ${y}l-5-2-5 1v-4l5-1 5 2 5-2 5 1v4l-5-1Z`,'#e3d2ad','stroke-width=".5"');
    p(`M${x} ${y}v-4`,'none','stroke-width=".4"');
  }
  for(const [x,y]of [[674,587],[977,601],[896,653],[1107,599]]){
    p(`M${x-8} ${y-2}l13-5 5 2-1 5-13 2Z`,'#b8b1a0');
    p(`M${x-4} ${y-4}l1 5m4-7 1 5m4-6 1 5`,'none','stroke-width=".4"');
    p(`M${x+10} ${y}l3-3 4 1-1 3Z`,'#b29e79','stroke-width=".5"');
  }
  // Quiet machinery: loaded wagons, a hoist, discarded picks and stacked timber.
  for(const [x,y]of [[291,793],[456,746],[566,838],[1049,812]])use('mine-cart',x,y,.55);
  group('mine-hoist',717,789,.8);
  p('M-16 22l5-41h24l7 41M-11-19l21 41M13-19l-25 41','none','stroke="#7b6344" stroke-width="2"');
  s.push('<circle cx="1" cy="-9" r="8" fill="#b19a70"/><circle cx="1" cy="-9" r="2" fill="#635e50"/>');
  p('M1-17V-1m-8-8H9m-14-6L7-3m0-12L-5-3M9-9v34m-6 0h12l-2 9H5Z','#aa9370');end();
  for(const [x,y]of [[339,629],[455,628],[534,814]])p(`M${x} ${y}l9-17m-15 6q10-11 16-6M${x-4} ${y}l9-4`,'none','stroke="#655a45" stroke-width="1"');
  for(let j=0;j<3;j++)p(`M361 ${634-j*3}h18m-18 0 2-2h18l-2 2Z`,'#a38960','stroke-width=".5"');
  // One banked forge supplies a small warm pigment accent in the western halls.
  group('abandoned-forge',478,634,.85);
  p('M-11 0v-17l5-8H6l5 8V0Z','#88816b');
  p('M-7 0v-12q7-7 14 0V0Z','#454b40');
  use('brazier',0,0,.75);
  p('M-11-20h22M-7-26v-12H7v12m-9-8h5','none','stroke="#7b6949"');end();
  // Webs live in empty corners, with light threads against dark vaults.
  for(const [x,y]of [[615,555],[885,286],[1004,308]]){
    p(`M${x} ${y}v18m0-18 17 1m-17-1 14 13m-14-13 7 17M${x} ${y+5}q5 0 5-5m-5 10q8-1 10-9m-10 15q12-1 15-14`,'none','stroke="#e1d1b0" stroke-width=".45" opacity=".8"');
  }

  s.push(moriaFigureScenes());
  for(const [x,y,scale]of [[574,469,.65],[703,649,.62],[968,754,.6]])use('brazier',x,y,scale);
  // Broken masonry collects around the void, keeping the danger within the map.
  for(const [x,y]of [[1168,636],[1224,658],[1188,705],[1227,803]])p(`M${x} ${y}l3-5 5 2-1 5Z`,'#b19a70','stroke-width=".5"');
  s.push('</g>');
  return s.join('\n');
}
