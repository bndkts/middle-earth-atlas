// Original ink silhouettes. Equipment and posture identify the small vignettes.
// Sparse hatching and muted washes keep the figures within the atlas palette.
export function moriaFigureDefinitions() {
  return `<pattern id="figure-hatch" width="5" height="7" patternUnits="userSpaceOnUse"><path d="M-2 6L3 0M1 9L7 1" fill="none" stroke="#303a30" stroke-width=".45" opacity=".5"/></pattern>
<pattern id="shadow-hatch" width="1.8" height="2.8" patternUnits="userSpaceOnUse"><path d="M-.5 2.8L1.4 0M1 3.7L2.9 .8" fill="none" stroke="#252f27" stroke-width=".2" opacity=".6"/></pattern>
<g id="orc-spearman" stroke-linecap="round" stroke-linejoin="round">
  <path d="M-16 0q7-7 6-16l-4-14 5-14q-12 3-12 18l-3 2q-3-12 3-28 3-10 12-15l-3-8 5-8 6-10 5 11 6 7-3 8 4 7 1 10 10 4 5-6 2 3-5 9-6-1-9-4q1 15-6 24l8 13 8 2-1 3H7l-9-18-5 9-1 7 5 2-1 2Z" fill="#505747"/>
  <path d="M-10-54q-8 9-6 19M-5-41q5 11 0 20m8-13 2 10M-7-75q8 4 14 0" fill="none" stroke="#96967b" stroke-width=".8" opacity=".65"/>
  <path d="M-8-71q6 1 10 6l-2 13-7 5q-4-9-1-24Z" fill="#414b3e"/>
  <path d="M30 0v-97m0-13-4 12 4 3 3-3Z" fill="#90917a" stroke="#52523e" stroke-width="1.2"/>
  <path d="M-25-47q10-7 19 1l-1 18q-4 9-12 13-9-13-6-32Z" fill="#6e6c51" stroke="#444c3d" stroke-width="1"/>
  <path d="M-22-44q7-4 13 0l-1 14q-3 8-9 11m2-24-1 23" fill="none" stroke="#9f9571" stroke-width=".65"/>
</g>
<g id="orc-archer" stroke-linecap="round" stroke-linejoin="round">
  <path d="M-24 0q7-10 9-20l-1-15 4-21-8-7 10-8-3-6 7-14 8 5 5 9-3 9 9 7 18-1 6-6 3 3-6 8-20 3-8-4-2 14 8 13-2 8 9 15 7 2-1 2H14L1-19-3-26-9-17-14-4l5 2-1 2Z" fill="#555a48"/>
  <path d="M-12-66l-13 5 8 9 22-16-2-4-20 11 7-2Z" fill="#656b55"/>
  <path d="M-10-49q6 10 3 20m3-12 4 12M-6-77q6 3 12 0m-23 21 16-10M7-62l14 3" fill="none" stroke="#99967a" stroke-width=".75" opacity=".65"/>
  <path d="M-22-49l-9-24 6-3 12 25Z" fill="#6d6950"/>
  <path d="M-28-74l-5-13m9 12-4-15M36-92C50-83 42-77 42-68S52-49 43-41" fill="none" stroke="#6a6046" stroke-width="1.4"/>
  <path d="M36-92 3-69 43-41M3-69h50l-4-2m4 2-4 2" fill="none" stroke="#5c5c46" stroke-width=".6"/>
</g>`;
}

export function moriaFigureScenes() {
  const s=[];
  const p=(d,fill='none',extra='')=>s.push(`<path d="${d}" fill="${fill}" ${extra}/>`);
  const body=(d,fill)=>{p(d,fill);p(d,'url(#figure-hatch)','stroke="none"');};
  const group=(id,x,y,scale)=>s.push(`<g id="${id}" transform="translate(${x} ${y}) scale(${scale})" stroke="none" stroke-linejoin="round" stroke-linecap="round">`);
  const end=()=>s.push('</g>');
  s.push('<g id="orc-patrols"><title>Orc patrols among the abandoned halls</title>');
  for(const [type,x,y,scale] of [
    ['spearman',534,469,.24],['archer',558,469,.23],['spearman',879,465,.22],
    ['spearman',923,519,.22],['archer',686,587,.27],['spearman',726,586,.25],
    ['archer',1059,350,.2],['spearman',1108,600,.26],['spearman',1113,458,.21],['archer',991,601,.28],
  ])s.push(`<use href="#orc-${type}" transform="translate(${x} ${y}) scale(${scale})"/>`);
  end();

  group('orc-drummer',904,650,.29);
  s.push('<title>A hunched Orc drummer in the deep halls</title>');
  body('M-25 0q10-11 9-23-8-20 2-37l7-8-3-11 8-12 8 7 4 12-4 7q8 5 10 16l10-10 3 3-13 17-7-5-2 12 7 9-8 16 7 4-1 3H2l-3-9 6-12-11-4-8 22 7 3Z','#505847');
  p('M-12-61l-12 9 11 6 16-16-3-3-15 13Z','#646a53');
  p('M-8-71q7 3 13 0M-10-40q7 7 4 17m-5 7-4 12','none','stroke="#939177" stroke-width=".75"');
  p('M3-63l18 7m3-3 14-13','none','stroke="#655b43" stroke-width="1.2"');
  body('M11-50q14-7 28 0l-1 24q-14 6-27-2Z','#81724f');
  p('M12-50q13 5 26 0m-24 3 5 20 5-19 6 19 6-21','none','stroke="#b7a478" stroke-width=".65"');
  end();

  group('cave-troll',1023,465,.4);
  s.push('<title>A cave troll, stooped beneath the gallery roof</title>');
  body('M-36 0q9-5 9-14-8-10-2-30-9 8-9 22l-3 11-8 2q-3-22 9-43 9-16 27-19-4-9 3-15 10-5 20 4l3 9q16 6 24 25l8 31-6 8-6-3-2-11-6-21-1 22 2 13 8 7H10L5-25-3-31-9-12-10-3l-8 4Z','#626954');
  p('M-9-76q9-5 17 1l-1 10-8 5-8-6Z','#454f3f');
  p('M-26-54q-6 12-4 20m13-17q10 6 22 1M19-50q7 9 8 22M-15-22l-4 15m26-27 4 20','none','stroke="#97977b" stroke-width=".75" opacity=".65"');
  p('M31-10l-4-51 6-2 4 50Z','#696147');
  p('M24-61l-2-15 11-3 4 18-7 4Z','#777052');
  p('M25-71l9-2m-8 8 9-2','none','stroke="#a5956f" stroke-width=".6"');
  end();

  // An ink apparition: the outline dissolves into smoke, with no exposed anatomy.
  group('balrog',1183,601,.9);
  s.push('<title>Durin’s Bane, a shadow wreathed in fire, facing Gandalf</title>');
  // Uneven translucent washes give the smoke depth without blur filters.
  p('M-5-2C-36-13-16-33-47-47S-76-76-94-82q29 2 41 19-8-22-29-34 32 4 44 27-2-19-13-33 22 10 23 32 4-25 20-37-8 24 1 36 12-20 33-23-18 16-18 31 20-15 46-9-27 5-37 24 16-5 35 2-34 0-37 22L34-1Z','#656450','stroke="none" opacity=".16"');
  p('M-9-2C-28-18-16-32-36-45s-24-27-39-31q19 0 30 11-3-15-14-28 20 10 28 28-1-12-5-23 14 11 15 26 5-17 15-24-5 16 1 23 13-14 31-15-17 13-17 24 13-11 32-9-20 8-24 26 10-3 22 1-15 6-19 17Z','#545747','stroke="none" opacity=".27"');
  p('M-6 0C-26-11-12-32-35-44q-14-7-20-23 10 9 22 8-7-12-8-25 9 17 21 20-2-13 4-24 0 19 10 21 11-11 22-11-10 9-10 20 12-11 24-10-13 12-13 25 7-4 16-3-14 12-8 27L27 0Z','#40473a','stroke="none" opacity=".58"');
  // Fire is glimpsed through the smoke, in narrow, irregular fissures.
  p('M-26-21C-40-37-26-45-46-61q17 5 22 20-2-14 5-23-3 17 7 27l5 23Z','#a27543','stroke="none" opacity=".75"');
  p('M4-12q18-14 15-35 8 9 3 21 13-8 17-20-1 20-25 35Z','#a37a46','stroke="none" opacity=".8"');
  p('M-28-30q-4-14-13-22m21 11q-5-9-3-17M16-22q8-10 6-17','none','stroke="#cfb17a" stroke-width=".65"');
  // Ragged smoke closes over the body; neither feet nor a torso are outlined.
  p('M-35 0C-14-12-31-27-25-41q3-8-7-16 12 4 15-3-8-8-7-17 5 12 15 10-4-8 1-13 0 8 7 5 7-4 12 1l3 5 5 3-3 5-7 2q-5 4 3 9C18-43 18-37 29-32l8 1-5 4q-14-4-19-14c5 18-12 23-4 35q4 6 16 6-15 3-23-7 2 8-7 8 2-9-2-13-2 12-16 12 7-6 5-12-6 12-17 12Z','#303a30','stroke="none"');
  p('M-35 0C-14-12-31-27-25-41q3-8-7-16 12 4 15-3-8-8-7-17 5 12 15 10-4-8 1-13 0 8 7 5 7-4 12 1l3 5 5 3-3 5-7 2q-5 4 3 9C18-43 18-37 29-32l8 1-5 4q-14-4-19-14c5 18-12 23-4 35q4 6 16 6-15 3-23-7 2 8-7 8 2-9-2-13-2 12-16 12 7-6 5-12-6 12-17 12Z','url(#shadow-hatch)','stroke="none" opacity=".6"');
  // Overlapping veils hide the head and the root of the reaching arm.
  p('M-26-65q-8-6-11-15 11 14 26 14-5-8-3-16 2 12 13 15-11 7-9 16 3 11-2 19 1-11-5-16-8 11-3 24-10-9-5-23 2-9-1-18Z','#3b4436','stroke="none" opacity=".85"');
  p('M-12-64q-9 14-5 26m-10-8 6 14m6-3-3 16m-2 6-7 7M-6-47q-6 13-3 24m6-6 1 13m12-34 10 12','none','stroke="#555744" stroke-width=".45" opacity=".5"');
  p('M-36-58q-11-1-21-12m20 3-9-14m-17 6-12-9M-18-73l-3-12m-4 6-7-16M17-64l13-9m-3 16 13-5M-34-38l-10-7m67 12 12-6M-25-13l-5 7','none','stroke="#555846" stroke-width=".45" opacity=".5"');
  // Two swept slivers are the only distinct trace of horns in the upper shadow.
  p('M1-73q-11-4-14-12 7 8 18 9M8-76q5-7 12-7-6 3-9 10Z','#303a30','stroke="none"');
  p('M11-69l1.5 .2','none','stroke="#b18b51" stroke-width=".45"');
  // The hand and lash emerge from the darkness as a small, broken contour.
  p('M23-35l8 4 7-2 1 2-5 4-7-3Z','#303a30','stroke="none"');
  p('M37-31C60-41 38-57 54-71S93-77 80-58 64-56 71-65','none','stroke="#745937" stroke-width="1.1"');
  p('M37-31C60-41 38-57 54-71S93-77 80-58 64-56 71-65','none','stroke="#d0ab65" stroke-width=".38"');
  p('M71-65q4-5 8-2','none','stroke="#997943" stroke-width=".3"');
  // Low embers break up the foot of the silhouette and tie it to the bridge.
  p('M-24-1q-8-8-5-16 0 9 8 12m28 5q5-9 2-16 6 7 2 13m10 2q9-2 10-10','none','stroke="#ac844b" stroke-width=".65"');
  for(const [x,y]of [[-38,-53],[-23,-67],[24,-53],[34,-41],[-31,-23],[8,-84]])p(`M${x} ${y}l.7-2.2`,'none','stroke="#b18b51" stroke-width=".65"');
  end();

  // A grey silhouette: hat, beard, staff and a pale blade carry the identity.
  group('gandalf-at-bridge',1254,601,.52);
  s.push('<title>Gandalf holds the narrow bridge</title>');
  body('M-12 0q8-22 4-39l-6 8-12 5-7-2 1-5 7 2 11-11q2-9 10-13l1-13 9-1 1 14q7 3 9 16l9-5 3 4-14 12-6-8q3 18 16 29l-8-2 7 8-14-5-2 5-10-2Z','#737d6b');
  p('M-5-56q2 17-2 33M7-46q0 18 10 32m-11-3 3 11M-3-18l-2 11','none','stroke="#b6b49a" stroke-width=".85" opacity=".8"');
  p('M-9-70l11-3 4 7-3 14-4 9-3-9-5-8-4-2Z','#a8ae96');
  p('M-9-69l14-2 1 9-9-1-6 2Z','#4f5d4e');
  body('M-17-69q10-2 11-13l7-16q-2 14 6 22l10 8q-18 5-34-1Z','#657461');
  p('M-15-68q15 3 29-1M-5-78l5-14M-3-57l2 8','none','stroke="#bdbea3" stroke-width=".65"');
  p('M-32 0l1-70-2-7 3-4 3 2-1 7-2 72','none','stroke="#666044" stroke-width="1.25"');
  p('M25-43l16-25 2-4-5 3-15 25Z','#bfc3a8');
  p('M22-46l7 4','none','stroke="#a69a71" stroke-width=".9"');
  p('M-30-87v10m-5-5h10m-8-3 6 6m-6 0 6-6','none','stroke="#ece3c4" stroke-width=".75"');
  end();
  return s.join('\n');
}
