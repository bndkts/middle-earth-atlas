// Fetch the existing credited artworks, never substitute or upscale them.
// Usage: bun scripts/refresh-images.mjs [--write] [--cache-dir /absolute/path]
// Requires curl and cwebp; GIF sources additionally require macOS sips.
import fs from 'node:fs/promises';
import path from 'node:path';
import os from 'node:os';
import vm from 'node:vm';
import {createHash} from 'node:crypto';
import {execFile} from 'node:child_process';
import {promisify} from 'node:util';
import {fileURLToPath} from 'node:url';

const run=promisify(execFile);
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const args=process.argv.slice(2),write=args.includes('--write');
const cacheArg=args.indexOf('--cache-dir');
const cacheDir=cacheArg>=0?args[cacheArg+1]:await fs.mkdtemp(path.join(os.tmpdir(),'atlas-artwork-'));
if(!cacheDir||!path.isAbsolute(cacheDir))throw new Error('Use an absolute cache directory');
await fs.mkdir(cacheDir,{recursive:true});
const context={window:{}};
vm.runInNewContext(await fs.readFile(path.join(root,'src/images.js'),'utf8'),context);
const images=context.window.IMG,files=[...new Set(Object.values(images).map(image=>image.f))];
const key=file=>createHash('sha256').update(file).digest('hex');
const normalize=title=>title.replaceAll('_',' ').normalize('NFC');
const metadata=new Map();
const curl=['--fail','--silent','--show-error','--location','--retry','3','--max-time','90'];
for(let offset=0;offset<files.length;offset+=40){
  const batch=files.slice(offset,offset+40);
  const cache=path.join(cacheDir,key(batch.join('|'))+'.json');
  let response;
  try{response=JSON.parse(await fs.readFile(cache,'utf8'));}catch{
    const url=new URL('https://tolkiengateway.net/w/api.php');
    url.search=new URLSearchParams({action:'query',format:'json',prop:'imageinfo',iiprop:'url|size',redirects:'1',titles:batch.map(file=>'File:'+file).join('|')});
    response=JSON.parse((await run('curl',[...curl,url.href],{maxBuffer:4e6})).stdout);
    if(response.error||!response.query)throw new Error(JSON.stringify(response));
    await fs.writeFile(cache,JSON.stringify(response));
  }
  const aliases=new Map((response.query.redirects||[]).map(item=>[normalize(item.from),normalize(item.to)]));
  const pages=new Map(Object.values(response.query.pages).map(page=>[normalize(page.title),page.imageinfo?.[0]]));
  for(const file of batch){
    let title=normalize('File:'+file);
    const visited=new Set();
    while(aliases.has(title)&&!visited.has(title)){visited.add(title);title=aliases.get(title);}
    const info=pages.get(title);
    if(!info?.url||!info.width||!info.height)throw new Error('Missing original: '+file);
    const url=new URL(info.url);
    if(url.protocol!=='https:'||url.hostname!=='tolkiengateway.net')throw new Error('Unexpected image host: '+info.url);
    metadata.set(file,info);
  }
}
console.log(`Resolved ${metadata.size} originals for ${Object.keys(images).length} places. Cache: ${cacheDir}`);
if(!write){
  console.log(JSON.stringify(files.filter(file=>metadata.get(file).width<800).map(file=>({file,width:metadata.get(file).width,height:metadata.get(file).height})),null,2));
  process.exit(0);
}
const staged=new Map();
let next=0,completed=0;
await Promise.all(Array.from({length:3},async()=>{
  while(next<files.length){
    const file=files[next++],info=metadata.get(file),hash=key(file);
    const original=path.join(cacheDir,hash+path.extname(file).toLowerCase());
    try{await fs.access(original);}catch{
      const download=original+'.download';
      try{await run('curl',[...curl,info.url,'--output',download]);}catch{
        // Some full-size files cannot be served, while the site's own large
        // derivative is available. Request one at our target width, not 280px.
        const url=new URL('https://tolkiengateway.net/w/api.php');
        const width=Math.max(1,Math.floor(info.width*Math.min(1,1200/info.width,1600/info.height)));
        url.search=new URLSearchParams({action:'query',format:'json',prop:'imageinfo',iiprop:'url',redirects:'1',iiurlwidth:String(width),titles:'File:'+file});
        const response=JSON.parse((await run('curl',[...curl,url.href],{maxBuffer:4e6})).stdout);
        const thumb=Object.values(response.query?.pages||{})[0]?.imageinfo?.[0]?.thumburl;
        if(!thumb||new URL(thumb).hostname!=='tolkiengateway.net')throw new Error('No usable source for '+file);
        try{await run('curl',[...curl,thumb,'--output',download]);}catch{
          const existing=Object.values(images).find(image=>image.f===file);
          const output=path.join(root,existing.d);
          const size=(await run('sips',['-g','pixelWidth','-g','pixelHeight',output])).stdout;
          const w=Number(size.match(/pixelWidth: (\d+)/)?.[1]),h=Number(size.match(/pixelHeight: (\d+)/)?.[1]);
          if(!w||!h)throw new Error('Cannot retain existing image: '+file);
          staged.set(file,{output,w,h,sourceWidth:info.width,sourceHeight:info.height,sourceUnavailable:true});
          console.log('Source unavailable; retained existing image: '+file);
          completed++;
          continue;
        }
        console.log('Used source-provided large preview: '+file);
      }
      await fs.rename(download,original);
    }
    let input=original;
    if(/\.gif$/i.test(file)){
      input=path.join(cacheDir,hash+'.png');
      await run('sips',['-s','format','png',original,'--out',input]);
    }
    const scale=Math.min(1,1200/info.width,1600/info.height);
    const w=Math.max(1,Math.floor(info.width*scale)),h=Math.max(1,Math.floor(info.height*scale));
    const output=path.join(cacheDir,hash+'.webp');
    await run('cwebp',['-quiet','-q','82','-m','6','-metadata','none','-resize',String(w),String(h),input,'-o',output]);
    staged.set(file,{output,w,h,sourceWidth:info.width,sourceHeight:info.height});
    if(++completed%20===0)console.log(`Converted ${completed}/${files.length} originals`);
  }
}));
// Publish only after every source has downloaded and converted successfully.
for(const image of Object.values(images)){
  const {output,...size}=staged.get(image.f);
  if(output!==path.join(root,image.d))await fs.copyFile(output,path.join(root,image.d));
  delete image.sourceUnavailable;
  Object.assign(image,size);
}
await fs.writeFile(path.join(root,'src/images.js'),'window.IMG = '+JSON.stringify(images,null,2)+';\n');
console.log(`Updated ${Object.keys(images).length} local WebP assets and dimensions.`);
