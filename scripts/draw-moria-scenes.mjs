// Original ink miniatures, using the main map's muted pigment palette.
// All figures are illustrative story vignettes, not a simultaneous population.
export function drawMoriaScenes() {
  const s=[];
  const p=(d,fill='none',extra='')=>s.push(`<path d="${d}" fill="${fill}" ${extra}/>`);
  const group=(id,x,y,scale=1)=>s.push(`<g id="${id}" transform="translate(${x} ${y}) scale(${scale})">`);
  const end=()=>s.push('</g>');
  const use=(id,x,y,scale=1)=>s.push(`<use href="#${id}" transform="translate(${x} ${y}) scale(${scale})"/>`);
  s.push('<g stroke="#4b4435" stroke-width=".65" stroke-linejoin="round" stroke-linecap="round"><defs>');
  // A hunched, mailed spearman: pointed ears, hooked nose, strapped round shield.
  group('orc-spearman',0,0);
  p('M-4-11l-2 5 2 4-3 2h5l1-6 3 2 1 4h5L8-3 5-10Z','#635e50');
  p('M-5-20q4-3 9 0l3 10-5 3-7-3Z','#777a58');
  p('M-4-20l-4 7-4-1-1 2 7 2 5-6M4-19l5 5 3-2 1 2-4 4-7-5','#777a58');
  p('M-4-21l-3-5 4 1q4-5 8 0l4-1-2 5-3 3h-5Z','#929775');
  p('M-4-26l2-5 5-1 3 6-4-2Z','#6d6b5d');
  p('M1-24h2m1 1 3 2-4 1m-3 1 4 1M-4-16l7 4m-6-1 6 3M-2-18l1 1m2-2 1 1','none','stroke-width=".45"');
  p('M12 0v-32m-2 0 2-7 2 7Z','#b8b1a0');
  s.push('<ellipse cx="-7" cy="-10" rx="5.5" ry="7" fill="#8e684c"/>');
  p('M-11-10h8m-4-5v10','none','stroke="#c3ac7c" stroke-width=".8"');
  s.push('<circle cx="-7" cy="-10" r="1.5" fill="#b8b1a0"/>');
  end();
  group('orc-archer',0,0);
  p('M-5-11l-1 7-3 4h6l2-7 3 4 3 3h5L6-4 4-12Z','#635e50');
  p('M-5-22l8-1 4 12-5 4-7-4Z','#8a7552');
  p('M-4-23l-3-5 4 1 2-4 6 1 3 3 3-1-2 4-4 3Z','#90916c');
  p('M-4-24l6-3 4 1m-3 2h1M-4-20l11 4 7-2m-11-2 7 1 4-4','none','stroke-width="1.4"');
  p('M13-30q13 13 0 26l3-14Z','none','stroke="#7b6344" stroke-width="1"');
  p('M4-18h19l-3-2m3 2-3 2M-5-21l-5-9m3 10-4-9','none','stroke-width=".55"');
  end();
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

  // Scattered patrols, rather than a repeating line of identical silhouettes.
  s.push('<g id="orc-patrols"><title>Orc patrols among the abandoned halls</title>');
  use('orc-spearman',534,469,.64);use('orc-archer',555,469,.59);
  use('orc-spearman',879,465,.6);use('orc-spearman',923,519,.55);
  use('orc-archer',686,587,.68);use('orc-spearman',726,586,.61);
  use('orc-archer',1059,350,.55);use('orc-spearman',1108,600,.68);
  use('orc-spearman',1113,458,.58);use('orc-archer',991,601,.69);
  use('brazier',574,469,.65);use('brazier',703,649,.62);use('brazier',968,754,.6);
  end();
  // Drums in the deep: sticks, taut hide, lacing, and a crouching drummer.
  group('orc-drummer',906,650,.72);
  p('M-12 0l3-8-2-9 9-6 7 9-2 9 6 5H4L0-6-6 0Z','#787b59');
  p('M-9-23l-3-6 5 1 3-3 5 1 3 4 3-1-2 5-8 2Z','#939675');
  p('M-4-27h2m4 1h2M-8-18l8 4 4-5m-3 2 10 3 3-5','none','stroke-width="1.2"');
  p('M1-6v-10q8-4 16 0V-6q-8 5-16 0Z','#af744a');
  s.push('<ellipse cx="9" cy="-16" rx="8" ry="3" fill="#dfc8a0"/>');
  p('M2-14l3 9 3-8 4 8 4-9M0-20l8 4m6-5-4 4','none','stroke="#d6c298"');end();
  // A broad-backed cave troll stoops below the eastern gallery's vault.
  group('cave-troll',1025,465,.78);
  p('M-12-23q-8 2-10 11l1 10 5 2 2-4-1-7 5-4-1 12-3 3h11l3-11 4 10h10l-2-4-2-10 4 5 1 7 5 2 2-5-3-14q-3-7-11-8Z','#949887');
  p('M-7-24q-4-10 3-13 6-3 11 3l2 8-3 6-7 1Z','#a5aa92');
  p('M-6-29l3-1m4 0 3 1m-5 0-1 4h3m-5 2q4-2 7 0M-10-21l3 6m-9 4 2-4m19-5 3 6m-17 11h5m10 0h5M-4-15q4 3 8 0m-6 3h3','none','stroke-width=".7"');
  p('M19-3l9-26 4 1-10 26Z','#806a4d');end();

  // Durin's Bane: ink-black mass, smoke contours, copper fire and a curling lash.
  // Painted last so the silhouette stands free of the cutaway's stone edges.
  group('balrog',1187,599,.86);
  s.push('<title>Durin’s Bane confronts Gandalf at the bridge</title>');
  p('M-9-18Q-32-35-56-35l12-9-23-25 24 9-13-30q26 5 41 29Q-22-89-8-103l4 24 9-36 7 25 14-17-3 29q19-24 42-25L49-72l27-8-15 21 21-3Q58-36 19-23Z','#756f57','stroke="#746345" opacity=".45"');
  p('M-12-23Q-29-31-40-47q14 7 9-5-18-11-19-29 8 14 22 13-10-13-6-26 3 22 17 27-5-23 5-37-3 20 5 27 10-12 7-26 13 11 9 31 11-4 13-20 5 16-4 28 19-4 22-15 3 18-10 29 19 0 24-9-2 22-23 29Z','#af744a','stroke="#825438" stroke-width=".8"');
  p('M-16-33q-18-18-16-30 6 14 18 15-5-16 1-28 0 14 9 16 8-6 9-17 5 16-1 24 13-3 16-12 2 14-11 27Z','#d1a45d','stroke="none"');
  p('M-8-49q-12-1-20 9l-5 14-5 7 6 5 6-4 5-12 8-5q-2 10 2 17l-8 13-5 2v4l13 1 5-5 7-13 4 10 8 6 1 3h12v-4l-8-3-7-13q4-8 1-15l8 5 7 12 7 4 5-6-6-4-4-13q-3-10-18-14Z','#343c34','stroke="#34372d" stroke-width="1.1"');
  p('M-9-48l-5-8 3-9 6-5 10 1 8 8-2 10-5 3-5 6-5-3Z','#41453a');
  p('M-9-62C-27-65-30-82-17-84q-10 5-3 12l16 4M6-64C19-83 34-79 30-68q-1-8-10-2l-9 15','#3d4236','stroke="#34372d" stroke-width="1.2"');
  p('M-9-57l6 2m6-1 6-3M-4-49l4 1 5-3','none','stroke="#e0bd73" stroke-width="1.1"');
  p('M-9-62l6 5 3 5-3 2m7-8 3-5M-4-66l4 3 5-3M-5-47l5 2 4-3','none','stroke="#9d835b" stroke-width=".5"');
  p('M-9-40l6 7 7-2 7-7m-14 8 1 15m-5-10 3 3m8-5-2 9M-20-28l4-6m37 5 5 7M-8-13l-2 8m15-7 4 8','none','stroke="#a57b4d" stroke-width=".8"');
  // Scratched copper and grey hatch marks retain the engraved main-map finish.
  p('M-23-38l-5 10m8-12-5 9m9-9-4 7m6 0 4 3m-3 1 4 3m-3 1 4 3m8-10-3 3m4 0-3 3m-4 7-4 6m-3-3-3 6m19-4 4 5m-1-9 4 6m8-29 4 6m-1-8 5 7','none','stroke="#958766" stroke-width=".45" opacity=".85"');
  p('M-30-59q-6-5-8-12m20 11-4-13m31 12 7-9m6 32 12-8M-40-36l-9-4m44-37 1-10','none','stroke="#895b39" stroke-width=".6"');
  // Sword to the left; the whip curls high into empty rock to the right.
  p('M-32-20l-12-19-3-12 10 8 11 20Z','#bf8e4e','stroke="#865633"');
  p('M-31-21l-12-23M-35-20l8-5','none','stroke="#e2c46c" stroke-width="1"');
  p('M34-17C61-32 28-57 53-72S99-55 85-42 60-55 79-63','none','stroke="#835736" stroke-width="2.5"');
  p('M34-17C61-32 28-57 53-72S99-55 85-42 60-55 79-63','none','stroke="#dab26a" stroke-width=".8"');
  for(const [x,y]of [[-31,-77],[17,-91],[38,-63],[-46,-40],[54,-32]])p(`M${x} ${y}l1-5 2 3-1 3Z`,'#bd8d4c','stroke="none"');
  end();
  // A deliberately small grey figure makes the creature's scale readable.
  group('gandalf-at-bridge',1251,601,.8);
  p('M-3-24l-4 9-6 14 7-1 6 2 7-2-6-15 1-7Z','#b8b1a0');
  p('M-4-25q-5-5-1-9h7l1 8-4 5Z','#d6c9a9');
  p('M-9-32l7-10 3 6 6 4Z','#93988b');
  p('M-5-28l5 2 3-1-3 10-4-5Z','#ddd4bb');
  p('M-5-21l-8 6-5-1-1 3 7 1 10-4M1-22l8 5 7-4 1 2-8 6-7-3','#b8b1a0');
  p('M-18 0l1-33m-2 2 4-3M15-19l12-8M-6-3l2-12m4 12-1-8','none','stroke-width=".9"');
  p('M-17-39v9m-4-5h8m-7-3 6 6m-6 0 6-6','none','stroke="#eadab5" stroke-width="1.2"');end();
  // Broken masonry collects around the void, keeping the danger within the map.
  for(const [x,y]of [[1168,636],[1224,658],[1188,705],[1227,803]])p(`M${x} ${y}l3-5 5 2-1 5Z`,'#b19a70','stroke-width=".5"');
  s.push('</g>');
  return s.join('\n');
}
