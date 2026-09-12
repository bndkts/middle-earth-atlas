// Loaded only after a settled deep zoom. Original miniature engravings; no assets,
// animation loops, or global SVG definitions. Coordinates are illustrative.
export const MIN_DETAIL_ZOOM = 3.2;
const path = (d, cls = '') => `<path${cls ? ` class="${cls}"` : ''} d="${d}"/>`;
const ellipse = (cx, cy, rx, ry, cls = '') => `<ellipse class="${cls}" cx="${cx}" cy="${cy}" rx="${rx}" ry="${ry}"/>`;
const grass = path('M-17 9l2-3 1 3m2 0 1-2M11 9l1-3 1 3 2-2M-16 11q8 2 13 0m7 1 10-1', 'dt-fine');
const star = (x, y) => path(`M${x-1.4} ${y}h2.8m-1.4-1.4v2.8`, 'dt-gold');
const leaves = path('M-9 5q-5-4-3-7 5 1 3 7m1-2q4-5 7-3-1 4-7 3M10 6q-3-6 0-8 4 3 0 8m1-2q4-4 6-1-2 3-6 1', 'dt-leaf');

export const DETAILS = [
  { id:'second-breakfast', place:'hobbiton', x:685, y:909, z:3.2, from:1601,
    title:'A little second breakfast', label:'A table for two',
    text:'Two cups, a generous loaf, and absolutely no hurry. A small picnic imagined for the green country around Hobbiton; adventures can wait until the kettle is empty.',
    art: path('M-15 1l22-4 9 10-23 5Z','dt-cloth') + path('M-11 3l22 4M-7 1l22 4M-4-1l9 11M3-2l9 10','dt-fine') +
      ellipse(-3,2,5,2,'dt-paper') + path('M-7 1q0-6 5-5t4 5Z','dt-warm') + path('M-4-2l1 2m2-3 1 2','dt-fine') +
      path('M6-4h4v5H6Zm4 1q4-1 3 2h-3M-12-1h3v4h-3Zm3 1h2v2h-2','dt-paper') + grass },
  { id:'garden-tools', place:'bag-end', x:686, y:892, z:4.4, from:2880,
    title:'The gardener has just stepped out', label:'Something growing',
    text:'A little watering can rests beside carefully tended rows. This imagined garden is a quiet salute to the work that makes a hillside feel like home.',
    art:path('M-15 3q9-3 17 0M-14 6q8-3 16 0M-13 9q8-3 16 0','dt-fine') + leaves +
      path('M3 0q4-1 8 0v6q-4 2-8 0Zm8 2 5-5 1 1-4 7h-2','dt-warm') +
      path('M4 0q-2-7 3-7t3 7M4 2v3m2-3v4m2-4v4M-10 3l-1-3m2 2 2-3M-5-9v15m-3-17v4q3 3 6 0v-4m-3 0v5','dt-fine') },
  { id:'thinking-fox', place:'woody-end', x:716, y:957, z:4.4, from:3018, to:3018,
    title:'A fox with questions', label:'Most unusual hobbits',
    text:'A fox pauses at the sight of hobbits sleeping outdoors. A tiny nod to the wonderfully curious passer-by in “Three is Company”. What a peculiar business to stumble upon.',
    source:'Three_is_Company',
    art:path('M-6 3q-9-10-13-4 0 8 12 7M-7 2q1-7 8-6l5 1 1-7 3 3 4-2-1 6 5 2-7 4-4-1-2 6H1L0 3l-3 1-1 5h-3Z','dt-rust') +
      path('M-19-1q1 6 6 6l-2-5Z','dt-paper') + path('M7-3l4 5 5-3M7-7l1 3m4-4-1 3','dt-fine') + ellipse(11,-2,.45,.45,'dt-ink') + grass },
  { id:'pony-sign', place:'prancing-pony', x:803, y:876, z:3.2, from:1300,
    title:'Room at the inn', label:'A familiar sign',
    text:'An extra little sign for the Prancing Pony: a white pony, two iron hooks, and the promise of a warm room. Even a very small traveller deserves a proper welcome.',
    art:path('M-13 12v-26H9M-11-12H7M-7-11v4m11-4v4','dt-wood') + path('M-10-7H9V7h-19Z','dt-warm') +
      path('M-7 2l3-5 6 1 2-3 3 1-1 3-3 1-1 5H0V1l-3 1-2 3h-2l2-5m-1-2-3 2','dt-paper') + path('M-8 9H7M-15 13h5','dt-fine') },
  { id:'stone-trolls', place:'trollshaws', x:1043, y:845, z:3.2, from:2941,
    title:'Three very late sleepers', label:'A stony silence',
    text:'Three stone silhouettes linger among the hills. A miniature remembrance of Bilbo’s encounter with the trolls, whose argument lasted rather too close to sunrise.',
    art:path('M-16 8l1-10q-3-3 0-6 4-3 6 1l-1 4 2 10Zm12 0-1-13q-2-5 2-7 5-1 6 4L1-4 4 8Zm11 0 1-8Q5-4 8-7q4-3 6 1l-1 5 3 9Z','dt-stone') +
      path('M-13-4h2m9-3h2m6 5h2M-13 1l-1 4m4-4 1 4M-1-2l-1 7m3-6 1 5M10 1l-1 4m3-3 1 3','dt-fine') + grass },
  { id:'elven-desk', place:'rivendell', x:1129, y:884, z:4.4, from:-1744,
    title:'One more page before the road', label:'Notes from a valley',
    text:'An open book, a travelling map, and a feather left by the ink. An imagined writing desk in the spirit of Rivendell, where a journey can become a story.',
    art:path('M-15 1H15v3h-30Zm3 3-1 8m24-8 1 8','dt-wood') + path('M-11-7q6-2 11 1 5-3 11-1v8Q5-1 0 2-5-1-11 1Z','dt-paper') +
      path('M0-6v8M-8-4l5 1m-5 2 5 1M3-3l5-1M3-1l5-1','dt-fine') + path('M11-8q-2-7 6-10 1 8-6 10Zm0 1 5-9','dt-leaf') },
  { id:'mellon', place:'doors-of-durin', x:1178, y:1110, z:4.4, from:-2691, to:3019,
    title:'A word between friends', label:'Mellon',
    text:'The western door of Moria asks for friendship, not a mighty spell. These tiny silver marks remember Narvi and Celebrimbor’s work, and the simple word that opens it: mellon.',
    art:path('M-12 11V-3q0-12 12-12T12-3v14Z','dt-stone') + path('M-8 9V-3q0-8 8-8t8 8v12M0-6V9M-4 0l4-4 4 4M-5 5l5-4 5 4','dt-silver') +
      star(-4,-6) + star(4,-6) + path('M-15 12h30','dt-fine') },
  { id:'durins-stars', place:'mirrormere', x:1258, y:1121, z:4.4,
    title:'Stars in the daylight', label:'A crown in the water',
    text:'A crown of stars rests in the dark water, even under a daytime sky. This little reflection recalls Durin’s first glimpse into Mirrormere and the beginning of Khazad-dûm.',
    art:ellipse(0,2,16,8,'dt-water') + path('M-13 5q5 2 9 1m6 1 10-2M-9-1q8-3 17 1','dt-silver') +
      [[-10,0],[-7,-3],[-3,-5],[2,-6],[7,-4],[11,-1],[9,3]].map(([x,y])=>star(x,y)).join('') },
  { id:'mallorn-gift', place:'lothlorien', x:1281, y:1170, z:4.4, from:3019, to:3019,
    title:'A garden small enough to carry', label:'A little box of hope',
    text:'A seed and a little earth: an engraved tribute to Galadriel’s gift to Sam. Some of the most precious things carried out of Lórien were meant to be planted.',
    art:path('M-7-2 4-5 11 0 0 4Zm0 0v9L0 11V4m0 7 11-4V0','dt-warm') + path('M-7-2-3-10 11-8 4-5Z','dt-paper') +
      ellipse(1,0,1.7,1,'dt-gold-fill') + path('M-14 6q-1-10 8-11 4 7-8 11Zm0 0 7-9','dt-leaf') + grass },
  { id:'ent-strides', place:'fangorn-forest', x:1282, y:1370, z:3.2,
    title:'These roots have somewhere to be', label:'No need to be hasty',
    text:'Root-shaped footprints wander away from a patch of trees. An imagined trail for Fangorn’s shepherds: a reminder to look twice before calling a tree an ordinary tree.',
    art:path('M-11 10q-3-6 0-9l3 1 1 5-2 4Zm10-9q-3-6 0-9l3 1 1 5-2 4Zm11-10q-2-4 1-6l3 1v4l-2 2Z','dt-earth') +
      path('M-11 9l-3 4m5-4v4m-1-5 4 3M0-2l-3 4m5-4v4m-1-5 4 3','dt-fine') + leaves },
  { id:'thrush', place:'erebor', x:1606, y:626, z:4.4, from:2941, to:2941,
    title:'When the thrush knocks', label:'The smallest clue',
    text:'A thrush, a snail, and a grey stone. On Durin’s Day, this small interruption reminds Bilbo to watch for the last sunlight revealing the hidden keyhole.',
    source:'Thrushes',
    art:path('M-13 10-10 2 0 0 9 5 12 11Z','dt-stone') + path('M-5 0q-6-1-5-7l-4-4 7 1q2-5 6-4 5 0 4 4l4 2-6 1q0 6-6 7Z','dt-warm') +
      path('M-10-7q4 0 6 5M-5 0l-1 3m3-3v2M-9 5l4-2m5 5 4-1','dt-fine') + ellipse(0,-11,.5,.5,'dt-ink') + ellipse(7,2,2,1.5,'dt-paper') + path('M6 2q0-2 2-1t-1 2M8 3h4l1-1','dt-fine') },
  { id:'barrel-voyage', place:'esgaroth', x:1657, y:736, z:3.2, from:2941, to:2941,
    title:'An unconventional passage', label:'No oars required',
    text:'Three barrels bob towards the Long Lake. A small salute to Bilbo’s ingenious escape plan; the passengers might have preferred a boat with seats.',
    art:[[-8,0],[4,5],[9,-6]].map(([x,y])=>`<g transform="translate(${x} ${y}) rotate(-18)">${path('M-4-5q4-2 8 0 2 5 0 10-4 2-8 0-2-5 0-10Z','dt-warm')}${path('M-4-3h8m-8 6h8M-2-4v8M1-4v8','dt-fine')}</g>`).join('') + path('M-17 8q4 2 8 0M-3 13q5 2 10 0M9 1l8-1','dt-blue') },
  { id:'simbelmyne', place:'edoras', x:1281, y:1561, z:3.2, from:2569,
    title:'Evermind', label:'Small flowers, long memory',
    text:'White flowers gather on a quiet green mound. A small tribute to the simbelmynë that grows on the burial mounds of the kings of Rohan.',
    art:path('M-17 10Q0-7 17 10Z','dt-leaf') + [-11,-5,1,7,12].map((x,i)=>`<g transform="translate(${x} ${i%2?2:6})">${path('M0 0v5','dt-fine')}${path('M0 0q-5-1-2-3-1-4 2-2 3-2 2 2 3 2-2 3Z','dt-paper')}${ellipse(0,-2,.6,.6,'dt-gold-fill')}</g>`).join('') + grass },
  { id:'ranger-supper', place:'ithilien', x:1541, y:1615, z:4.4, from:3019, to:3019,
    title:'A very small cooking fire', label:'A taste of home',
    text:'A blackened pot, two spoons, and a few useful herbs. This imagined camp in Ithilien honours Sam’s determination to make a proper meal, even very far from his own kitchen.',
    art:path('M-8 0H8L6 8H-6Zm-1 0q0-10 9-10t9 10','dt-pot') + path('M-9 12l17-2m-13-1 11 4','dt-wood') +
      path('M-2 10q-4-3 0-6 0 4 3 2 3 5-3 4Z','dt-rust') + path('M-2-3q-3-3 0-5m4 3q-2-3 1-5','dt-fine') + leaves },
];

export function visibleDetails(view, year = null, enabled = true) {
  if (!enabled || view.s < MIN_DETAIL_ZOOM) return [];
  const pad = 24; // Full art bounds, in map units; no layout reads.
  const x0 = ((view.left || 0) - view.tx) / view.s - pad, y0 = -view.ty / view.s - pad;
  const x1 = (view.width - view.tx) / view.s + pad, y1 = (view.height - view.ty) / view.s + pad;
  return DETAILS.filter(d => view.s >= d.z && d.x >= x0 && d.x <= x1 && d.y >= y0 && d.y <= y1 &&
    (year == null || ((d.from == null || year >= d.from) && (d.to == null || year <= d.to))));
}

export function createDetailLayer(layer, onOpen) {
  const nodes = new Map();
  let lastScale = null;
  const activate = target => { const el = target.closest('[data-discovery]'); if (el) onOpen(DETAILS.find(d => d.id === el.dataset.discovery)); };
  layer.addEventListener('keydown', e => {
    if (e.key !== 'Enter' && e.key !== ' ') return;
    e.preventDefault(); e.stopPropagation(); activate(e.target);
  });
  // Native clicks from assistive technology have no matching pointer gesture.
  layer.addEventListener('click', e => { if (e.detail === 0) activate(e.target); });
  return {
    open: id => { const d = DETAILS.find(d => d.id === id); if (d) onOpen(d); },
    update(view, year, enabled) {
      const visible = visibleDetails(view, year, enabled), ids = new Set(visible.map(d => d.id));
      // The drawing stays a miniature even at maximum zoom (about 85 CSS px).
      // Its 42-unit hit area remains at least 87 CSS px at the entry threshold.
      const scale = Math.min(.65, 2.5 / view.s);
      for (const [id, node] of nodes) if (!ids.has(id)) { node.remove(); nodes.delete(id); }
      for (const d of visible) {
        const transform = `translate(${d.x} ${d.y}) scale(${scale})`;
        if (nodes.has(d.id)) {
          if (scale !== lastScale) nodes.get(d.id).setAttribute('transform', transform);
          continue;
        }
        const node = layer.ownerDocument.createElementNS('http://www.w3.org/2000/svg', 'g');
        node.setAttribute('class', 'detail-scene'); node.setAttribute('transform', transform);
        node.setAttribute('role', 'button'); node.setAttribute('tabindex', '0');
        node.setAttribute('aria-label', `Discover: ${d.title}`); node.dataset.discovery = d.id;
        node.innerHTML = `<rect class="detail-hit" x="-21" y="-21" width="42" height="42" rx="5"/><g class="detail-art" aria-hidden="true">${d.art}</g><path class="detail-spark" aria-hidden="true" d="M17-19l1 3 3 1-3 1-1 3-1-3-3-1 3-1Z"/>`;
        layer.appendChild(node); nodes.set(d.id, node);
      }
      lastScale = scale;
    },
  };
}
