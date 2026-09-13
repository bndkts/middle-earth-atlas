// Deterministic art direction only: never move tree anchors or forest boundaries.
import {readFileSync,writeFileSync} from 'node:fs';
import {fileURLToPath} from 'node:url';
const file=fileURLToPath(new URL('../index.html',import.meta.url));
const before=readFileSync(file,'utf8');
const profiles=['mirkwood','fangorn','lorien','old-forest'];
let group=0;
const after=before.replace(/^<g(?: id="[^"]+")? class="trees[^\n]+/gm,line=>{
  const profile=profiles[group++];
  if(!profile)return line;
  line=line.replace(/^<g(?: id="[^"]+")? /,`<g id="woodland-${profile}" `);
  return line.replace(/<use href="#[^"]+" transform="translate\(([\d.]+) ([\d.]+)\)([^"]*)"\/>/g,(tag,x,y,transform)=>{
    const seed=Math.round(+x*17+ +y*31);
    let symbol;
    if(profile==='mirkwood')symbol=+y<800?['pn0','pn1','pn2','tr1'][seed%4]:['tr0','tr1','tr4','pn2'][seed%4];
    if(profile==='fangorn')symbol=['tr4','tr4','tr0','tr1'][seed%4];
    if(profile==='lorien')symbol=seed%4?'mallorn':'tr3';
    if(profile==='old-forest')symbol=['tr4','tr4','tr2'][seed%3];
    return `<use href="#${symbol}" transform="translate(${x} ${y})${transform}"/>`;
  });
});
if(process.argv.includes('--write'))writeFileSync(file,after);
else if(after!==before){console.error('Woodland profiles need regeneration: bun scripts/refine-woodland.mjs --write');process.exitCode=1;}
else console.log('Four woodland profiles verified; anchors and boundaries unchanged.');
