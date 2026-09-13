import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { createHash } from 'node:crypto';
import { fileURLToPath } from 'node:url';

export const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
export const escapeHTML = value => String(value).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const e = escapeHTML;
const read = file => fs.readFileSync(path.join(root, file), 'utf8');
const json = file => JSON.parse(read(file));
export const config = json('content/publication.json');
const references = json('content/references.json');
const context = { window: {} };
vm.runInNewContext(read('src/data.js'), context);
export const data = context.window.ATLAS_DATA;
const base = config.baseUrl;
const source = s => s?.startsWith('tg:') ? 'https://tolkiengateway.net/wiki/' + s.slice(3) : s;
const absolute = url => base + url;
const placeURL = id => config.places.includes(id) ? `/places/${id}/` : `/?place=${encodeURIComponent(id)}`;
const journeyURL = id => config.journeys.includes(id) ? `/journeys/${id}/` : `/?journey=${encodeURIComponent(id)}`;
const link = (url, text) => `<a href="${e(url)}">${e(text)}</a>`;
const list = items => `<ul>${items.map(item => `<li>${item}</li>`).join('')}</ul>`;
const byId = new Map(data.places.map(p => [p.id, p]));
export function validatePublication(dataset = data, publication = config) {
  for (const key of ['places', 'journeys']) {
    if (new Set(publication[key]).size !== publication[key].length) throw Error(`Duplicate published ${key}`);
    for (const id of publication[key]) if (!dataset[key].some(item => item.id === id)) throw Error(`Missing ${key}: ${id}`);
  }
  const events = new Set();
  for (const event of dataset.timeline) {
    if (!/^[a-z0-9-]+$/.test(event.id || '') || events.has(event.id)) throw Error(`Invalid event ID: ${event.id}`);
    events.add(event.id);
  }
  for (const j of dataset.journeys) {
    if (!references.journeys[j.id]?.length) throw Error(`Missing journey references: ${j.id}`);
    for (const leg of j.legs) if (leg.placeId && !dataset.places.some(p => p.id === leg.placeId)) throw Error(`Missing waypoint: ${leg.placeId}`);
  }
}
const bookNames = {LotR:'The Lord of the Rings', Hobbit:'The Hobbit', Silm:'The Silmarillion', UT:'Unfinished Tales', HoME:'The History of Middle-earth', Letters:'Letters of J.R.R. Tolkien'};
function year(y) {
  if (y == null) return 'not recorded';
  if (y > 3021) return `Fo.A. ${y - 3021}`;
  if (y >= 1) return `T.A. ${y}`;
  if (y > -3441) return `S.A. ${y + 3441}`;
  if (y > -4031) return `F.A. ${y + 4031}`;
  return `Y.T. ${y + 9031}`;
}
const title = 'Middle-earth Atlas';
const intro = 'Explore an interactive Middle-earth map, character journeys and historical timeline, with a searchable guide to places from Tolkien’s books.';
const icons = `<link rel="icon" href="/favicon.ico" sizes="any">
  <link rel="icon" href="/assets/favicon.svg" type="image/svg+xml">
  <link rel="icon" href="/assets/favicon-32x32.png" type="image/png" sizes="32x32">
  <link rel="apple-touch-icon" href="/assets/apple-touch-icon.png" sizes="180x180">
  <link rel="manifest" href="/site.webmanifest">
  <meta name="theme-color" content="#f5ecd6">`;
const navigation = `<nav aria-label="Atlas"><a href="/">Interactive map</a><a href="/places/">Places</a><a href="/journeys/">Journeys</a><a href="/methodology/">Sources &amp; method</a><a href="/data/">Open data</a></nav>`;
const siteSchema = {'@context':'https://schema.org','@type':'WebSite','@id':base+'/#website',url:base+'/',name:title,inLanguage:'en',description:intro};
function metadata(url, heading, description, crumbs = []) {
  const schema = crumbs.length ? {'@context':'https://schema.org','@type':'BreadcrumbList',itemListElement:crumbs.map(([name, item],i) => ({'@type':'ListItem',position:i+1,name,item:absolute(item)}))} : siteSchema;
  return `<title>${e(heading)}</title>
  <meta name="description" content="${e(description)}">
  <link rel="canonical" href="${e(absolute(url))}">
  <meta property="og:type" content="website">
  <meta property="og:site_name" content="${title}">
  <meta property="og:title" content="${e(heading)}">
  <meta property="og:description" content="${e(description)}">
  <meta property="og:url" content="${e(absolute(url))}">
  <meta property="og:image" content="${base}/assets/atlas-social.png">
  <meta property="og:image:width" content="1200"><meta property="og:image:height" content="630">
  <meta property="og:image:alt" content="Middle-earth Atlas — places, journeys and history">
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="${e(heading)}"><meta name="twitter:description" content="${e(description)}">
  <meta name="twitter:image" content="${base}/assets/atlas-social.png">
  ${icons}
  <script type="application/ld+json">${JSON.stringify(schema).replace(/</g, '\\u003c')}</script>`;
}
function page(url, heading, description, body, parent) {
  const crumbs = [['Atlas','/'], ...(parent ? [parent] : []), [heading, url]];
  return `<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
${metadata(url, `${heading} | ${title}`, description, crumbs)}
<link rel="stylesheet" href="/src/content.css">
</head><body><a class="skip" href="#content">Skip to content</a><header><a class="brand" href="/">Middle-earth Atlas</a>${navigation}</header>
<main id="content"><nav aria-label="Breadcrumb">${crumbs.map(([name,url],i) => i === crumbs.length-1 ? `<span aria-current="page">${e(name)}</span>` : link(url,name)).join(' / ')}</nav><h1>${e(heading)}</h1>${body}</main>
<footer><p>An unofficial Tolkien fan atlas. Not affiliated with the Tolkien Estate or Middle-earth Enterprises.</p><p>${link('/methodology/', 'Sources, estimates and corrections')} · ${link('/data/', 'Data and reuse')} · ${link('https://github.com/bndkts/middle-earth-atlas', 'Project on GitHub')}</p></footer></body></html>\n`;
}
function referenceList(refs) { return list(refs.map(ref => `${link(ref.url,ref.label)}${ref.scope ? `<p class="note">${e(ref.scope)}</p>` : ''}`)); }
const mapNotice = 'Map positions are schematic reconstructions, not surveyed locations. The scale varies by region; map distances are estimates, not measured road lengths.';
const journeyNotice = 'Dates reproduce the atlas chronology; some intermediate dates and stopping places are reconstructed. A dated waypoint does not mean every traveller was present. Approximate positions and route detours are illustrative, not canonical coordinates.';
export function buildOutputs() {
  validatePublication();
  const out = new Map();
  const putPage = (url,...args) => out.set(url.slice(1)+'index.html',page(url,...args));
  const places = config.places.map(id => byId.get(id)).sort((a,b) => a.n.localeCompare(b.n,'en'));
  putPage('/places/','Places in Middle-earth','Browse places in Middle-earth by name and region, with descriptions, chronicles, sources and interactive map links.',
    `<p class="lead">From the Shire to Mordor, explore ${places.length} featured places and their histories.</p><div class="cards">${places.map(p=>`<article><p class="eyebrow">${e(p.r)} · ${e(p.t)}</p><h2>${link(placeURL(p.id),p.n)}</h2><p>${e(p.d.split(/(?<=\.)\s/)[0])}</p></article>`).join('')}</div><h2>All ${data.places.length} mapped places</h2><p>Entries without a reading page open directly on the map.</p>${list([...data.places].sort((a,b)=>a.n.localeCompare(b.n,'en')).map(p=>`${link(placeURL(p.id),p.n)} <span class="note">— ${e(p.r)}${config.places.includes(p.id)?'':' · map'}</span>`))}`);
  for (const p of places) {
    const related = data.journeys.filter(j=>j.legs.some(l=>l.placeId===p.id));
    const neighbours = data.places.filter(q=>q.id!==p.id && q.k<=2).sort((a,b)=>Math.hypot(a.x-p.x,a.y-p.y)-Math.hypot(b.x-p.x,b.y-p.y)).slice(0,6);
    const refs = [{label:'Tolkien Gateway: '+p.n,url:source(p.s)},...(references.places[p.id]||[])];
    putPage(`/places/${p.id}/`,p.n,`${p.n} in ${p.r}: location, history, alternative names and sources, with a direct link to the interactive Middle-earth map.`,
      `<p class="eyebrow">${e(p.r)} · ${e(p.t)}</p><p class="lead">${e(p.d)}</p><p>${link('/?place='+p.id,'Show '+p.n+' on the map')}</p>
      <dl><dt>Other names</dt><dd>${e(p.alt.join(' · ')||'None listed')}</dd><dt>Region</dt><dd>${e(p.r)}</dd><dt>Peoples</dt><dd>${e(p.pp.join(', ')||'Not listed')}</dd><dt>Reading reference</dt><dd>${e(bookNames[p.c]||p.c)}</dd><dt>Recorded period</dt><dd>${p.fi?'Estimated start: ':''}${year(p.f)} → ${p.to==null?'no recorded end':year(p.to)}</dd></dl>
      <aside><p>${mapNotice}${p.ap?' This entry has an additionally uncertain position.':''} Recorded periods describe the entry, not necessarily the continued existence of its geography.</p>${link('/methodology/','How to interpret this atlas')}</aside>
      ${p.ev.length?`<h2>Chronicle</h2><ol>${p.ev.map(ev=>`<li><strong>${e(ev.a)} ${e(ev.yr)}</strong> — ${e(ev.t)}</li>`).join('')}</ol>`:''}
      ${related.length?`<h2>Journeys through ${e(p.n)}</h2>${list(related.map(j=>link(journeyURL(j.id),j.name)))}`:''}
      <h2>Nearby on the schematic map</h2>${list(neighbours.map(q=>link(placeURL(q.id),q.n)))}
      <h2>Sources and further reading</h2>${referenceList(refs)}<p class="note">Chapter references, where supplied, were located through secondary reference material. This page does not claim a fresh verification against every primary text. ${link('/methodology/#corrections','Report a correction')}.</p>`,['Places','/places/']);
  }
  const journeys = config.journeys.map(id=>data.journeys.find(j=>j.id===id));
  putPage('/journeys/','Journeys through Middle-earth','Follow nine journeys through Middle-earth, with ordered waypoints, chronology, sources and interactive routes.',
    `<p class="lead">Follow the roads taken by Bilbo, the Fellowship and the travellers who carry the story beyond its breaking.</p><div class="cards">${journeys.map(j=>`<article><h2>${link(journeyURL(j.id),j.name)}</h2><p>${e(j.who)}</p><p>${e(j.legs[0].date)} → ${e(j.legs.at(-1).date)} · ${j.legs.length} waypoints</p></article>`).join('')}</div>`);
  for (const j of journeys) {
    putPage(`/journeys/${j.id}/`,j.name,`Explore ${j.name}: ${j.legs.length} ordered waypoints, dates, source references and a route on the Middle-earth map.`,
      `<p class="lead">${e(j.name)} follows ${j.legs.length} mapped waypoints, from ${e(j.legs[0].place)} to ${e(j.legs.at(-1).place)}.</p><p>Travellers across this route: ${e(j.who)}.</p>${j.id==='fellowship'?'<p>This route includes Frodo’s journey from the Shire before the nine companions set out together from Rivendell, and ends with the breaking of the Fellowship.</p>':''}<p>${link('/?journey='+j.id,'Follow this journey on the map')}</p><aside><p>${journeyNotice} ${mapNotice}</p>${link('/methodology/','Sources and reconstruction method')}</aside>
      <h2>Waypoints in order</h2><ol class="waypoints">${j.legs.map((l,i)=>`<li id="waypoint-${i+1}"><p class="eyebrow">${e(l.date)}</p><h3>${l.placeId?link(placeURL(l.placeId),l.place):e(l.place)}</h3>${l.note?`<p>${e(l.note)}</p>`:''}${l.approximate?'<p class="note">Approximate map position.</p>':''}${l.placeId?`<p class="note">Place reference: ${link(source(byId.get(l.placeId).s),byId.get(l.placeId).n)} (location context, not verification of this date).</p>`:''}</li>`).join('')}</ol>
      <h2>Sources and further reading</h2>${referenceList(references.journeys[j.id])}`,['Journeys','/journeys/']);
  }
  putPage('/methodology/','Sources and atlas method','How the Middle-earth Atlas represents Tolkien’s geography, chronology, reconstructed journeys and distance estimates.',read('content/methodology.html'));
  putPage('/data/','Atlas data and documentation','Download versioned Middle-earth place, journey and event data with stable IDs, source links and coordinate and calendar documentation.',read('content/data-documentation.html'));
  const digest = createHash('sha256').update(JSON.stringify({data,references,config})).digest('hex');
  const envelope = records => JSON.stringify({schemaVersion:1,revision:digest,documentation:base+'/data/',coordinateSystem:{name:'atlas-schematic',width:2600,height:2300,origin:'top-left',xDirection:'right',yDirection:'down',units:'map units, not latitude/longitude',notice:mapNotice},calendar:{offsets:{YT:-9031,FA:-4031,SA:-3441,TA:0,FoA:3021},notice:'absoluteYear = year + age offset; a sorting convention, not Gregorian time. YT does not imply solar-year duration.'},reuseNotice:'Code and documentation are MIT licensed. No additional rights in Tolkien works or third-party illustrations are granted. See documentation.',records},null,2)+'\n';
  out.set('data/v1/places.json',envelope(data.places.map(p=>({id:p.id,name:p.n,alternateNames:p.alt,type:p.t,region:p.r,description:p.d,coordinates:{x:p.x,y:p.y,approximate:!!p.ap},recordedPeriod:{fromAbsoluteYear:p.f,toAbsoluteYear:p.to,estimatedStart:!!p.fi},peoples:p.pp,book:bookNames[p.c]||p.c,sourceUrl:source(p.s),references:references.places[p.id]||[],chronicle:p.ev.map(ev=>({age:ev.a,year:ev.yr,absoluteYear:ev.y,description:ev.t})),url:absolute(placeURL(p.id)),mapUrl:base+'/?place='+p.id}))));
  out.set('data/v1/journeys.json',envelope(data.journeys.map(j=>({id:j.id,name:j.name,travellers:j.who,url:absolute(journeyURL(j.id)),mapUrl:base+'/?journey='+j.id,references:references.journeys[j.id],reconstructionNotice:journeyNotice,waypoints:j.legs.map((l,i)=>({sequence:i+1,placeName:l.place,placeId:l.placeId||null,dateLabel:l.date,note:l.note||null,coordinates:{x:l.x,y:l.y,approximate:!!l.approximate},via:l.via||[],placeSourceUrl:l.placeId?source(byId.get(l.placeId).s):null,placeUrl:l.placeId?absolute(placeURL(l.placeId)):null}))}))));
  out.set('data/v1/events.json',envelope(data.timeline.map(ev=>({id:ev.id,title:ev.title,description:ev.text,age:ev.age,year:ev.year,absoluteYear:ev.absoluteYear,dateLabel:ev.date,timeLabel:ev.timeLabel||null,dateUncertain:!!ev.dateUncertain,placeName:ev.place,placeId:ev.placeId||null,coordinates:{x:ev.x,y:ev.y,approximate:!!ev.approximate},sourceUrl:source(ev.src),mapUrl:base+'/?event='+ev.id,placeUrl:ev.placeId?absolute(placeURL(ev.placeId)):null}))));
  out.set('src/publication.js','// Generated by scripts/generate-content.mjs\nwindow.ATLAS_PUBLICATION = '+JSON.stringify({places:config.places,journeys:config.journeys})+';\n');
  const home = read('index.html');
  out.set('index.html',home.replace(/<!-- SEO:START -->[\s\S]*?<!-- SEO:END -->/,`<!-- SEO:START -->\n${metadata('/','Interactive Middle-earth Map, Timeline & Journeys | Middle-earth Atlas',intro)}\n<!-- SEO:END -->`));
  const urls = ['/',...Array.from(out.keys()).filter(f=>f.endsWith('/index.html')).map(f=>'/'+f.slice(0,-10))];
  out.set('sitemap.xml','<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n'+urls.map(url=>`  <url><loc>${e(absolute(url))}</loc></url>`).join('\n')+'\n</urlset>\n');
  out.set('robots.txt',`User-agent: *\nAllow: /\n\nSitemap: ${base}/sitemap.xml\n`);
  return out;
}
export function generate(check = false) {
  const outputs = buildOutputs();
  const manifestPath = 'content/generated-files.json';
  const previous = fs.existsSync(path.join(root,manifestPath)) ? json(manifestPath) : [];
  const managed = [...outputs.keys()].filter(f=>f!=='index.html').sort();
  outputs.set(manifestPath,JSON.stringify(managed,null,2)+'\n');
  const stale = [];
  for (const [file,text] of outputs) {
    if (!fs.existsSync(path.join(root,file)) || read(file)!==text) {
      if (check) stale.push(file);
      else { fs.mkdirSync(path.dirname(path.join(root,file)),{recursive:true}); fs.writeFileSync(path.join(root,file),text); }
    }
  }
  for (const file of previous.filter(f=>!managed.includes(f))) {
    if (!/^(places|journeys)\/[a-z0-9-]+\/index\.html$/.test(file)) throw Error(`Refusing to remove unexpected generated path: ${file}`);
    if (fs.existsSync(path.join(root,file))) { if (check) stale.push(file); else fs.unlinkSync(path.join(root,file)); }
  }
  if (stale.length) throw Error('Generated output is stale. Run npm run generate:\n'+stale.join('\n'));
  return outputs.size;
}
if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) console.log(`${generate(process.argv.includes('--check'))} generated files ${process.argv.includes('--check')?'verified':'written'}.`);
