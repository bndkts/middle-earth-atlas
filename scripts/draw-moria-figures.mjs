// Original pen drawings. Figure proportions are independent of their map scale.
// Fine hatching and sparse pigment keep these vignettes within the atlas palette.
export function moriaFigureDefinitions() {
  return `<pattern id="figure-hatch" width="5" height="7" patternUnits="userSpaceOnUse"><path d="M-2 6L3 0M1 9L7 1" fill="none" stroke="#393b30" stroke-width=".55" opacity=".6"/></pattern>
<pattern id="shadow-hatch" width="1.8" height="2.8" patternUnits="userSpaceOnUse"><path d="M-.5 2.8L1.4 0M1 3.7L2.9 .8" fill="none" stroke="#252f27" stroke-width=".2" opacity=".6"/></pattern>
<pattern id="figure-mail" width="5" height="4" patternUnits="userSpaceOnUse"><path d="M0 1q1.2 3 2.5 0m0 0q1.2 3 2.5 0" fill="none" stroke="#353a31" stroke-width=".6"/></pattern>
<g id="orc-spearman" stroke="#3e4135" stroke-width="1" stroke-linecap="round" stroke-linejoin="round">
  <path d="M-13-47Q-5-49 3-45L5-29-3-14-3-4 3-2 2 0h-13l-1-5 1-14 6-13-6-5Z" fill="#676959"/>
  <path d="M-1-44Q6-44 11-40L15-24 11-8 16-3 21-2 20 0H9L6-5 6-20 1-28-8-37Z" fill="#85816a"/>
  <path d="M-10-17l7 3m-8 3 8 1m-8 2 8 1M7-17l6 1m-6 3 6 1m-6 2 5 1M-11-2h11m10 0h8" fill="none" stroke-width=".6"/>
  <path d="M-10-69q11-5 18 7l3 18-5 4-5-3-4 2-5-2-6 3-2-8Z" fill="#8a8267"/>
  <path d="M-10-69q11-5 18 7l3 18-5 4-5-3-4 2-5-2-6 3-2-8Z" fill="url(#figure-mail)" stroke="none"/>
  <path d="M-12-67Q-8-75-2-74L5-68 2-54l-8 5-7-9Z" fill="#696e5d"/>
  <path d="M-10-68l5 7 2 9m-4-15 4 5m-3 0-6 5M-12-47l22 1-1 3-20-1Z" fill="none" stroke="#b1a184" stroke-width=".75"/>
  <path d="M4-65q5-2 7 5l4 11 11-8 3 3-11 11q-3 2-6-1L4-54Z" fill="#888975"/>
  <path d="M9-59l3 7m4 4 8-7M26-57l4-1 2 2-2 4-4-1Z" fill="none" stroke-width=".7"/>
  <path d="M-9-65q-6 3-7 10l-1 15 5 1 5-14 6-7Z" fill="#777765"/>
  <path d="M-4-74l1-7 7-3 6 5-1 5 4 3-5 2-1 4-6 1-4-5Z" fill="#a9a38a"/>
  <path d="M-3-79l-6-4 2 7 5 2M-2-82q-2-10 7-10 9 3 6 12l-5-4-8 5Z" fill="#686e61"/>
  <path d="M1-89l5 7m-6-4 2 4M5-78l4 1M5-71l4 1m-7 1 2 3M-3-80v4" fill="none" stroke-width=".65"/>
  <path d="M29-1l1-97" fill="none" stroke="#6a573c" stroke-width="1.7"/>
  <path d="M30-111l-4 12 4 5 3-6Z" fill="#b7b5a3"/>
  <path d="M30-109v14m-2 3h4m-4 3h4m-4 3h4" fill="none" stroke-width=".5"/>
  <path d="M-23-50Q-14-55-7-47L-5-34q-4 12-13 17-8-10-9-20Z" fill="#8b795c"/>
  <path d="M-23-50Q-14-55-7-47L-5-34q-4 12-13 17-8-10-9-20Z" fill="url(#figure-hatch)" stroke="none"/>
  <path d="M-21-48q6-4 12 2l2 12q-3 9-11 14-6-10-7-17Z" fill="none" stroke="#b6a384" stroke-width=".8"/>
  <ellipse cx="-16" cy="-37" rx="3" ry="4" fill="#aaa78f"/>
  <path d="M-16-48v7m0 8-1 11m-7-22 3 1m11 0 2-1M-19-38l3-2 2 3" fill="none" stroke-width=".6"/>
</g>
<g id="orc-archer" stroke="#404135" stroke-width=".95" stroke-linecap="round" stroke-linejoin="round">
  <path d="M-12-45Q-6-49 1-44l-3 15-12 14-3 11 6 2-1 2h-14l1-6 6-17 7-13Z" fill="#797864"/>
  <path d="M-1-44q8-1 13 5l-1 14 10 20 8 3-1 2H16l-5-5-9-16-7-10Z" fill="#666c5b"/>
  <path d="M-18-14l5 2m-7 2 6 2m29-9-5 3m7 0-5 3m7 0-5 3" fill="none" stroke="#b6a586" stroke-width=".7"/>
  <path d="M-14-70q9-7 18-4l5 12-1 17-5 6-4-3-5 1-3-4-8 2 3-14Z" fill="#807b61"/>
  <path d="M-14-70q9-7 18-4l5 12-1 17-5 6-4-3-5 1-3-4-8 2 3-14Z" fill="url(#figure-hatch)" stroke="none"/>
  <path d="M-15-69l22 16m-19-20 20 17M-11-46l20-3m-20 6 20-3" fill="none" stroke="#bcaa82" stroke-width=".8"/>
  <path d="M-6-75l2-8 8-3 5 5-1 5 5 2-5 3-1 5-6-2-3-5Z" fill="#a29f84"/>
  <path d="M-5-82q0-10 8-10l6 5 1 7-7-4-8 5Z" fill="#64695a"/>
  <path d="M-5-82l-6-2 3 6 4 1m7-3 4 1m-2 6h4" fill="none" stroke-width=".7"/>
  <path d="M3-70Q7-75 12-72l10 4 17-3 2 4-20 5-12-3Z" fill="#9b967b"/>
  <path d="M-9-69l-14 5 5 10 23-17-2-3-19 12-1-3 13-2Z" fill="#9b967b"/>
  <path d="M-19-60l3 3m-1-6 3 3M15-69l5 4m3-1 12-4M-1-73l5-1 2 3-3 3-4-2" fill="none" stroke-width=".65"/>
  <path d="M37-92C51-86 43-77 43-68S55-49 43-41" fill="none" stroke="#6a563b" stroke-width="1.8"/>
  <path d="M37-92 4-71 43-41M3-71l51 1-4-2m4 2-4 2" fill="none" stroke-width=".55"/>
  <path d="M-20-49l-9-22 7-3 10 22Z" fill="#75614a"/>
  <path d="M-25-71l-6-18m9 17-5-18m-7 3 4 4m0-7 4 4" fill="none" stroke-width=".7"/>
</g>`;
}

export function moriaFigureScenes() {
  const s=[];
  const p=(d,fill='none',extra='')=>s.push(`<path d="${d}" fill="${fill}" ${extra}/>`);
  let hatch='figure-hatch';
  const body=(d,fill)=>{p(d,fill);p(d,`url(#${hatch})`,'stroke="none"');};
  const group=(id,x,y,scale)=>s.push(`<g id="${id}" transform="translate(${x} ${y}) scale(${scale})" stroke="#3f4033" stroke-width=".75" stroke-linejoin="round" stroke-linecap="round">`);
  const end=()=>s.push('</g>');
  s.push('<g id="orc-patrols"><title>Orc patrols among the abandoned halls</title>');
  for(const [type,x,y,scale] of [
    ['spearman',534,469,.24],['archer',558,469,.23],['spearman',879,465,.22],
    ['spearman',923,519,.22],['archer',686,587,.27],['spearman',726,586,.25],
    ['archer',1059,350,.2],['spearman',1108,600,.26],['spearman',1113,458,.21],['archer',991,601,.28],
  ])s.push(`<use href="#orc-${type}" transform="translate(${x} ${y}) scale(${scale})"/>`);
  end();

  // Drummer seen from the side, folded over a hide drum with raised sticks.
  group('orc-drummer',904,650,.29);
  body('M-5-39q10-3 18 3l7 12-9 14-1 7 9 2-1 2H6L3-5l5-17-10-4-5 9-7 13 4 3-1 2h-13l2-6 9-20Z','#777662');
  body('M-12-65Q-2-72 7-62l7 21-4 4-8-3-6 3-8-4-2-9Z','#8c8165');
  body('M-11-64l-7 10 8 7 17-13 1-4-18 10-1-2 7-8M5-61l8 12 11-10 4 3-13 15-7-5-7-8Z','#9c977b');
  p('M-6-67l-2-7 4-9 8 1 4 5-1 5 4 2-5 2-1 5-5 2Z','#9c9e83');
  p('M-8-73q-6-16 5-17 12 0 11 13l-7-5-6 4Z','#646b5b');
  p('M-7-77l-5-2 3 6 4 1M2-75h3m0 6h3','none','stroke-width=".7"');
  p('M3-64l18 8m4-4 13-12','none','stroke="#655239" stroke-width="1.2"');
  p('M11-29v-24q15-5 28 1l-1 24q-15 7-27-1Z','#99805c');
  s.push('<ellipse cx="25" cy="-52" rx="14" ry="4" fill="#cbb792"/>');
  p('M12-49l4 22 5-22 5 22 5-21 5 19M11-30q13 6 27 0m-23-23q10-2 20 1','none','stroke="#4b4938" stroke-width=".6"');
  end();

  // Troll: small recessed head, long heavy arms and a low, asymmetrical stance.
  group('cave-troll',1023,465,.4);
  body('M-12-70Q-30-72-39-52l-7 26 1 13 6 2 3-4-1-10 6-16 5-2-1 17 6 9-4 14-8 3v3h19l5-5 6-22 7 10 3 13-3 2 2 3h18l-1-5-6-5-3-20-6-15 5-9 5 18 4 18 7 6 7-2-2-7-4-4-3-29Q26-66 9-68Z','#888c7a');
  p('M-28-58q-3 14 3 23m-10-13-5 22m14-8 8 9-1 11m24-25 7 14 2 16M-17-54q10 11 25 6m-22 0q8 7 18 5m-13 3 10 3','none','stroke="#4d5142" stroke-width=".7"');
  p('M-12-67q-4-12 4-18 10-5 19 5l-1 8 4 5-5 6-11 1-7-4Z','#a1a18a');
  p('M-8-78l5-1m6 0 4 2m-6 0-2 7 5 1m-11 3 10 1M-11-73l3 4m14 6 3-4','none','stroke-width=".85"');
  p('M-8-67l1 4m8-3 2 4','none','stroke="#c1b79a" stroke-width="1.2"');
  p('M-24-27q12 5 24 0l8 14-7-3-2 3-6-4-5 2-3-5-8 2Z','#6c6550');
  p('M31-10l-4-50 6-2 4 49Z','#78654b');
  p('M25-59l-2-15 3-4 8 1 3 16-3 3Z','#8c7857');
  p('M26-73l7-1m-6 7 8-1m-7-10 2 15','none','stroke-width=".7"');
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

  // Gandalf in profile: weathered hat, beard and a cloak blown behind him.
  hatch='figure-hatch';
  group('gandalf-at-bridge',1254,601,.52);
  p('M-3-12l-2 10-8 1-1 2H0l4-11M10-10l3 8 8 1v2H9L4-8','#5f6559');
  body('M-6-54Q2-59 12-51l4 19q6 11 14 18l-5 1 6 7-10-1 4 6-9-2-3 3-8-3-15 3 5-18-4-19Z','#92988a');
  p('M10-46q0 17 9 32m-7-14 4 19M0-45q3 17-2 33m8-8 1 14m-12-4 1-13M-3-52l6 10','none','stroke="#d7ceb2" stroke-width=".9"');
  p('M-5-51Q-9-49-11-39l-10 9-8-2-1 4 9 3 16-10 4-12Z','#a3a898');
  p('M8-49l4 13 11-8 3 3-13 13-5-4-6-13Z','#9fa493');
  p('M-27-33l-5-1-2 2 1 5 4 1M23-45l5-2 2 3-3 4-3-1','#bcb69b');
  p('M-6-55l-5-7 1-7 7-3 7 4-1 10-3 5Z','#c5bfa6');
  p('M-8-66l-6 5 5 1-1 5 5 2m-4-11h2','none','stroke-width=".65"');
  p('M-6-59q5 0 7-6l1 14-4 10-1-7-4-8Z','#d4cdb5');
  p('M-3-58v10m2-12v8M-8-65l5-2','none','stroke="#7e8474" stroke-width=".6"');
  body('M-15-68Q-9-72-7-81l6-15 3 12 4 7 9 8q-17 5-30 1Z','#7e887b');
  p('M-13-69q12 2 24-1M-5-78l5-13m-5 18 10 1','none','stroke="#c8c3a8" stroke-width=".65"');
  p('M-32 0l1-70-2-7 3-4 3 2-1 7-2 72','none','stroke="#6b614a" stroke-width="1.25"');
  p('M26-42l16-24 1-5-5 4-14 22Z','#c2c8b6','stroke-width=".5"');
  p('M23-47l6 5','none','stroke="#bda676" stroke-width="1"');
  p('M-30-87v10m-5-5h10m-8-3 6 6m-6 0 6-6','none','stroke="#ece3c4" stroke-width=".75"');
  end();
  return s.join('\n');
}
