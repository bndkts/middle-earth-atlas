// Original ink silhouettes. Equipment and posture identify the small vignettes.
// Sparse hatching and muted washes keep the figures within the atlas palette.
export function moriaFigureDefinitions() {
  return `<pattern id="figure-hatch" width="7" height="11" patternUnits="userSpaceOnUse"><path d="M-2 8L2 1M2 12L7 3" fill="none" stroke="#303a30" stroke-width=".3" opacity=".32"/></pattern>
<pattern id="shadow-hatch" width="1.8" height="2.8" patternUnits="userSpaceOnUse"><path d="M-.5 2.8L1.4 0M1 3.7L2.9 .8" fill="none" stroke="#252f27" stroke-width=".2" opacity=".6"/></pattern>
<g id="orc-spearman" stroke-linecap="round" stroke-linejoin="round">
  <path d="M-19 0q10-7 10-21l-5-22q-10 6-11 21l-4 2q-4-18 7-35 4-7 12-11l-1-9 7-7 12 2 5 8-6 8 5 6 1 10q4 6 15 6l5-5 2 4-6 7q-10 1-18-6 1 14-6 23l8 16 8 2-1 3H7L-2-20q-8 6-9 16l6 2-1 2Z" fill="#505747"/>
  <path d="M-13-58q-9 10-10 22M-5-42q4 12-1 23m8-11 2 9M-8-72q10 2 19-1" fill="none" stroke="#96967b" stroke-width=".8" opacity=".65"/>
  <path d="M-8-70q8 2 17-2l-3 8-5 3-1 6q-7-4-8-15Z" fill="#414b3e"/>
  <path d="M30 0v-97m0-13-4 12 4 3 3-3Z" fill="#90917a" stroke="#52523e" stroke-width="1.2"/>
  <path d="M-25-47q10-7 19 1l-1 18q-4 9-12 13-9-13-6-32Z" fill="#6e6c51" stroke="#444c3d" stroke-width="1"/>
  <path d="M-15-61q8-2 12 5l-4 22-7 8 2-12-5 4 1-12-4 2Z" fill="#414d40" opacity=".65"/>
  <path d="M-22-44q7-4 13 0l-1 14q-3 8-9 11m2-24-1 23" fill="none" stroke="#9f9571" stroke-width=".65"/>
</g>
<g id="orc-archer" stroke-linecap="round" stroke-linejoin="round">
  <path d="M-24 0q8-7 10-22l-1-14 4-17-10-10 11-7-1-7 8-7 10 3 3 7-4 9q8 4 11 10l18-2 5-5 3 3-6 7q-16 5-24-1l-2 14q2 8 8 12l-2 8 9 16 7 2-1 2H13L1-19-3-25q-8 7-10 21l5 2-1 2Z" fill="#555a48"/>
  <path d="M-12-66l-13 5 8 9 22-16-2-4-20 11 7-2Z" fill="#656b55"/>
  <path d="M-10-49q6 10 3 20m3-12 4 12M-7-74q7 2 16-1m-23 21 16-10M7-62l14 3" fill="none" stroke="#99967a" stroke-width=".75" opacity=".65"/>
  <path d="M-12-52q9 4 13 14l-5 8-5 12 1-11-6 3 3-12-4-6Z" fill="#424e40" opacity=".6"/>
  <path d="M-22-49l-9-24 6-3 12 25Z" fill="#6d6950"/>
  <path d="M-28-74l-5-13m9 12-4-15M37-87Q57-65 41-38" fill="none" stroke="#6a6046" stroke-width="1.4"/>
  <path d="M37-87 5-64 41-38M5-64h48l-4-1.5m4 1.5-4 1.5" fill="none" stroke="#5c5c46" stroke-width=".6"/>
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
    ['spearman',534,472,.24],['archer',558,472,.23],['spearman',879,468,.18],
    ['spearman',923,521,.2],['archer',686,590,.27],['spearman',726,590,.25],
    ['archer',1059,351,.2],['spearman',1108,603,.26],['spearman',1113,462,.18],['archer',991,603,.28],
  ])s.push(`<use href="#orc-${type}" transform="translate(${x} ${y}) scale(${scale})"/>`);
  end();

  group('orc-drummer',916,654,.205);
  s.push('<title>A hunched Orc drummer in the deep halls</title>');
  body('M-25 0q10-11 9-23-8-20 2-37l7-8-3-11 8-12 8 7 4 12-4 7q8 5 10 16l10-10 3 3-13 17-7-5-2 12 7 9-8 16 7 4-1 3H2l-3-9 6-12-11-4-8 22 7 3Z','#505847');
  p('M-12-61l-12 9 11 6 16-16-3-3-15 13Z','#646a53');
  p('M-8-71q7 3 13 0M-11-50q-2 15 5 27m-5 7-4 12','none','stroke="#939177" stroke-width=".75"');
  p('M3-63l18 7m3-3 14-13','none','stroke="#655b43" stroke-width="1.2"');
  body('M11-50q14-7 28 0l-1 24q-14 6-27-2Z','#81724f');
  p('M11-50q14 6 28 0m-27 3 1 17q5 4 9 3','none','stroke="#c0aa7c" stroke-width=".8"');
  p('M12-50q13 5 26 0m-24 3 5 20 5-19 6 19 6-21','none','stroke="#b7a478" stroke-width=".65"');
  end();

  group('cave-troll',972,468,.28);
  s.push('<title>A cave troll, stooped beneath the gallery roof</title>');
  body('M-36 0q9-5 9-14-8-10-2-30-9 8-9 22l-3 11-8 2q-3-22 9-43 9-16 27-19-4-9 3-15 10-5 20 4l3 9q16 6 24 25l8 31-6 8-6-3-2-11-6-21-1 22 2 13 8 7H10L5-25-3-31-9-12-10-3l-8 4Z','#626954');
  p('M-9-76q9-5 17 1l-1 10-8 5-8-6Z','#454f3f');
  p('M-22-58q-13 18-14 31m23-34 10 1m23 8q13 15 12 32M-6-24l-7 19','none','stroke="#a4a287" stroke-width=".65" opacity=".65"');
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
  p('M-35 0C-14-12-31-27-25-41q3-8-7-16 12 4 15-3-8-8-7-17 5 12 15 10-4-8 1-13 0 8 7 5 7-4 12 1l3 5 5 3-3 5-7 2q-5 4 3 9C10-44 12-36 29-32l8 1-5 4q-14-4-19-14c1 16-13 24-4 35q4 6 16 6-15 3-23-7 2 8-7 8 2-9-2-13-2 12-16 12 7-6 5-12-6 12-17 12Z','#303a30','stroke="none"');
  p('M-35 0C-14-12-31-27-25-41q3-8-7-16 12 4 15-3-8-8-7-17 5 12 15 10-4-8 1-13 0 8 7 5 7-4 12 1l3 5 5 3-3 5-7 2q-5 4 3 9C10-44 12-36 29-32l8 1-5 4q-14-4-19-14c1 16-13 24-4 35q4 6 16 6-15 3-23-7 2 8-7 8 2-9-2-13-2 12-16 12 7-6 5-12-6 12-17 12Z','url(#shadow-hatch)','stroke="none" opacity=".6"');
  // Overlapping veils hide the head and the root of the reaching arm.
  p('M-26-65q-8-6-11-15 11 14 26 14-5-8-3-16 2 12 13 15-11 7-9 16 3 11-2 19 1-11-5-16-8 11-3 24-10-9-5-23 2-9-1-18Z','#3b4436','stroke="none" opacity=".85"');
  p('M-12-64q-9 14-5 26m-10-8 6 14m6-3-3 16m-2 6-7 7M-6-47q-6 13-3 24m6-6 1 13m12-34 10 12','none','stroke="#555744" stroke-width=".3" opacity=".32"');
  p('M-36-58q-11-1-21-12m20 3-9-14m-17 6-12-9M-18-73l-3-12m-4 6-7-16M17-64l13-9m-3 16 13-5M-34-38l-10-7m67 12 12-6M-25-13l-5 7','none','stroke="#555846" stroke-width=".3" opacity=".32"');
  p('M-43-62q-13-6-20-19m20 11q-8-14-7-21M-23-48q-7 7-5 16m2 8-3 9M5-19q-4 10 2 15','none','stroke="#7c7b5b" stroke-width=".35" opacity=".5"');
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
  body('M-16 1q14-20 8-40-7 15-18 13l-7-2 1-5q11 5 18-9 2-9 10-13l1-13 9-1 1 14q9 4 9 16l9-5 3 4q-9 13-14 12l-6-8q1 17 9 27 6 8 11 8-6 2-12-2 3 7 9 9-10 1-17-5 1 7 5 10-11-3-15-7-2 5-14 5Z','#737d6b');
  p('M-6-52q4 17-2 30M6-43q1 19 10 30m-10-3 4 11M-3-18l-3 12','none','stroke="#b6b49a" stroke-width=".85" opacity=".8"');
  p('M-9-70q8-5 15 3l-3 14q-5 8-7 12 1-8-5-15l-5-5Z','#b5b59e');
  p('M-9-69q8 3 14-2l1 9-9-1-6 2Z','#4f5d4e');
  p('M-1-50q-2 21 4 35l-1 12q-7-9-9-18 7-11 6-29Z','#5e6d5c','opacity=".45"');
  body('M-17-69q10-2 11-13l7-16q-2 14 6 22l10 8q-18 5-34-1Z','#657461');
  p('M-15-68q15 3 29-1M-5-78l5-14M-3-57l2 8','none','stroke="#bdbea3" stroke-width=".65"');
  p('M-32 0l1-70-2-7 3-4 3 2-1 7-2 72','none','stroke="#666044" stroke-width="1.25"');
  p('M25-43l16-25 2-4-5 3-15 25Z','#c9cbb1','stroke="#87917d" stroke-width=".35"');
  p('M22-46l7 4','none','stroke="#a69a71" stroke-width=".9"');
  p('M-30-87v10m-5-5h10m-8-3 6 6m-6 0 6-6','none','stroke="#ece3c4" stroke-width=".75"');
  end();
  return s.join('\n');
}
