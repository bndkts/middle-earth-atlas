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
load("src/images.js");

const { places, journeys, timeline } = context.ATLAS_DATA ?? {};
const images = context.IMG;

if (!Array.isArray(places) || !Array.isArray(journeys) || !Array.isArray(timeline)) {
  fail("ATLAS_DATA must contain places, journeys, and timeline arrays");
}
if (!images || typeof images !== "object" || Array.isArray(images)) {
  fail("IMG must be an object");
}

const placeIds = new Set();
for (const [index, place] of places.entries()) {
  const label = `places[${index}]`;
  if (!place || typeof place !== "object") fail(`${label} must be an object`);
  if (!/^[a-z0-9-]+$/.test(place.id ?? "")) fail(`${label}.id must be lowercase kebab-case`);
  if (placeIds.has(place.id)) fail(`Duplicate place id: ${place.id}`);
  placeIds.add(place.id);
  if (typeof place.n !== "string" || !place.n.trim()) fail(`${label}.n is required`);
  if (typeof place.t !== "string" || !place.t.trim()) fail(`${label}.t is required`);
  if (!Number.isFinite(place.x) || !Number.isFinite(place.y)) fail(`${label} needs numeric x/y coordinates`);
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
    if (!Number.isFinite(leg.x) || !Number.isFinite(leg.y)) fail(`${label}.legs[${legIndex}] needs numeric x/y coordinates`);
  }
}

for (const [index, event] of timeline.entries()) {
  const label = `timeline[${index}]`;
  if (typeof event.title !== "string" || !event.title.trim()) fail(`${label}.title is required`);
  if (!Number.isFinite(event.year)) fail(`${label}.year must be numeric`);
  if (!Number.isFinite(event.x) || !Number.isFinite(event.y)) fail(`${label} needs numeric x/y coordinates`);
}

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
  `Validated ${places.length} places, ${journeys.length} journeys, ` +
    `${timeline.length} timeline events, and ${Object.keys(images).length} images.`,
);
