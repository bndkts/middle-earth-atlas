import fs from "node:fs";
import path from "node:path";
import vm from "node:vm";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const context = vm.createContext({});
context.window = context;

function fail(message) {
  throw new Error(message);
}

function load(relativePath) {
  const filename = path.join(root, relativePath);
  vm.runInContext(fs.readFileSync(filename, "utf8"), context, { filename });
}

load("src/data.js");
load("src/chapters.js");
load("src/images.js");

const { places, journeys, timeline, characters, chapters } = context.ATLAS_DATA ?? {};
const images = context.IMG;

if (!Array.isArray(places) || !Array.isArray(journeys) || !Array.isArray(timeline) || !Array.isArray(characters) || !Array.isArray(chapters)) {
  fail("ATLAS_DATA must contain places, journeys, timeline, characters, and chapters arrays");
}
if (!images || typeof images !== "object" || Array.isArray(images)) {
  fail("IMG must be an object");
}

const placeIds = new Set();
const placeById = new Map(places.map(p => [p.id, p]));
const types = new Set('battle bay bridge cape cave city coast desert ford forest fortress gate gorge hall hill hills house inn island lake landmark marsh mine mountain pass plain plateau port range realm region river road ruin sea spring tomb tower town valley village waterfall wood'.split(' '));
const ages = { YT: -9031, FA: -4031, SA: -3441, TA: 0, FoA: 3021 };
function coordinates(point, label) {
  if (!Number.isFinite(point.x) || !Number.isFinite(point.y) || point.x < 0 || point.x > 2600 || point.y < 0 || point.y > 2300) fail(`${label} has invalid map coordinates`);
}
function source(value, label) {
  if (typeof value !== 'string' || !/^(tg:[^\s]+|https:\/\/[^\s]+)$/.test(value)) fail(`${label} needs a source`);
}
function linkedPlace(point, label) {
  if (point.placeId == null) return;
  const place = placeById.get(point.placeId);
  if (!place) fail(`${label} references unknown place: ${point.placeId}`);
  if (point.x !== place.x || point.y !== place.y) fail(`${label} disagrees with ${point.placeId} coordinates`);
}
for (const [index, place] of places.entries()) {
  const label = `places[${index}]`;
  if (!place || typeof place !== "object") fail(`${label} must be an object`);
  if (!/^[a-z0-9-]+$/.test(place.id ?? "")) fail(`${label}.id must be lowercase kebab-case`);
  if (placeIds.has(place.id)) fail(`Duplicate place id: ${place.id}`);
  placeIds.add(place.id);
  if (typeof place.n !== "string" || !place.n.trim()) fail(`${label}.n is required`);
  if (!types.has(place.t)) fail(`${label} has an unknown type`);
  if (!Array.isArray(place.alt) || !Array.isArray(place.ev) || !Array.isArray(place.pp)) fail(`${label} needs alt, ev, and pp arrays`);
  for (const key of ['r','d','c']) if (typeof place[key] !== 'string' || !place[key].trim()) fail(`${label}.${key} is required`);
  coordinates(place, label);
  source(place.s, label);
  for (const key of ['f', 'to']) if (place[key] != null && !Number.isFinite(place[key])) fail(`${label}.${key} must be a year or null`);
  if (place.f != null && place.to != null && place.f > place.to) fail(`${label} has a reversed period`);
  if (place.fi && !Number.isFinite(place.f)) fail(`${label} cannot estimate a missing start`);
  for (const event of place.ev || []) {
    if (typeof event.t !== 'string' || !event.t.trim()) fail(`${label} has an empty chronicle entry`);
    if (!(event.a in ages) || !Number.isFinite(event.yr) || event.y !== event.yr + ages[event.a]) fail(`${label} has inconsistent chronicle dates`);
    // Chronicles may legitimately describe a ruin or an event commemorated later.
    // Only battle records themselves must contain their complete event interval.
    if (place.t === 'battle' && ((place.f != null && event.y < place.f) || (place.to != null && event.y > place.to))) fail(`${label} battle chronicle lies outside its event period`);
  }
}

const journeyIds = new Set();
for (const [index, journey] of journeys.entries()) {
  const label = `journeys[${index}]`;
  if (!/^[a-z0-9-]+$/.test(journey.id ?? "")) fail(`${label}.id must be lowercase kebab-case`);
  if (journeyIds.has(journey.id)) fail(`Duplicate journey id: ${journey.id}`);
  journeyIds.add(journey.id);
  if (typeof journey.name !== "string" || !journey.name.trim()) fail(`${label}.name is required`);
  if (!Array.isArray(journey.legs) || journey.legs.length < 2) fail(`${label} needs at least two legs`);
  for (const [legIndex, leg] of journey.legs.entries()) {
    if (typeof leg.place !== "string" || !leg.place.trim()) fail(`${label}.legs[${legIndex}].place is required`);
    coordinates(leg, `${label}.legs[${legIndex}]`);
    linkedPlace(leg, `${label}.legs[${legIndex}]`);
    if (!leg.placeId && leg.approximate !== true) fail(`${label}.legs[${legIndex}] needs a placeId or approximate anchor`);
    if (leg.via != null && !Array.isArray(leg.via)) fail(`${label}.legs[${legIndex}].via must be an array`);
    for (const point of leg.via || []) coordinates(point, `${label}.legs[${legIndex}].via`);
  }
}

for (const [index, event] of timeline.entries()) {
  const label = `timeline[${index}]`;
  if (typeof event.title !== "string" || !event.title.trim()) fail(`${label}.title is required`);
  if (!(event.age in ages) || !Number.isFinite(event.year) || event.absoluteYear !== event.year + ages[event.age]) fail(`${label} has inconsistent absoluteYear/age/year`);
  coordinates(event, label);
  linkedPlace(event, label);
  source(event.src, label);
  if (!event.placeId && event.approximate !== true) fail(`${label} needs a placeId or approximate anchor`);
}

const characterIds = new Set();
for (const [index, character] of characters.entries()) {
  const label = `characters[${index}]`;
  if (!/^[a-z0-9-]+$/.test(character.id ?? "") || characterIds.has(character.id)) fail(`${label} has an invalid or duplicate id`);
  if (typeof character.name !== 'string' || !character.name.trim()) fail(`${label}.name is required`);
  characterIds.add(character.id);
}
const chapterIds = new Set();
const bookCounts = new Map();
for (const [index, chapter] of chapters.entries()) {
  const label = `chapters[${index}]`;
  if (chapter.id !== `lotr-b${chapter.book}-c${String(chapter.chapter).padStart(2,'0')}` || chapterIds.has(chapter.id)) fail(`${label} has an invalid or duplicate id`);
  if (chapter.work !== 'lotr' || typeof chapter.title !== 'string' || !chapter.title.trim()) fail(`${label} needs a work and title`);
  if (!Array.isArray(chapter.locations) || !chapter.locations.length) fail(`${label} needs at least one location`);
  chapterIds.add(chapter.id); bookCounts.set(chapter.book,(bookCounts.get(chapter.book)||0)+1);
  for (const [locationIndex, location] of chapter.locations.entries()) {
    const locationLabel = `${label}.locations[${locationIndex}]`;
    if (!placeById.has(location.placeId)) fail(`${locationLabel} references unknown place: ${location.placeId}`);
    if (!Array.isArray(location.characters) || !location.characters.length || new Set(location.characters).size !== location.characters.length) fail(`${locationLabel} needs unique characters`);
    for (const id of location.characters) if (!characterIds.has(id)) fail(`${locationLabel} references unknown character: ${id}`);
    if (typeof location.note !== 'string' || !location.note.trim()) fail(`${locationLabel}.note is required`);
  }
}
if (JSON.stringify([...bookCounts.values()]) !== JSON.stringify([12,10,11,10,10,9])) fail('Chapters must cover all 62 Lord of the Rings chapters in order');

for (const [placeId, image] of Object.entries(images)) {
  if (!placeIds.has(placeId)) fail(`Image references unknown place id: ${placeId}`);
  if (typeof image.d !== "string" || !image.d.startsWith("assets/images/")) {
    fail(`Image ${placeId} must reference an asset in assets/images/`);
  }
  if (!fs.existsSync(path.join(root, image.d))) fail(`Missing image asset: ${image.d}`);
  if (typeof image.f !== "string" || !image.f.trim()) fail(`Image ${placeId} needs an original filename`);
  if (typeof image.l !== "string" || !image.l.trim()) fail(`Image ${placeId} needs a rights label`);
}

const referencedImages = new Set(Object.values(images).map((image) => image.d));
const assetDirectory = path.join(root, "assets/images");
for (const filename of fs.readdirSync(assetDirectory)) {
  const relativePath = `assets/images/${filename}`;
  if (!referencedImages.has(relativePath)) fail(`Unreferenced image asset: ${relativePath}`);
}

for (const relativePath of ["index.html", "src/styles.css", "src/map.css"]) {
  const contents = fs.readFileSync(path.join(root, relativePath), "utf8");
  if (contents.includes("data:image")) fail(`${relativePath} still contains an embedded image`);
}

console.log(
  `Validated ${places.length} places, ${journeys.length} journeys, ${chapters.length} chapters, ` +
    `${timeline.length} timeline events, and ${Object.keys(images).length} images.`,
);
