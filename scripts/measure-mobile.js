// Run through playwright-cli run-code in a dedicated local test browser session.
// Resets that origin's storage/offline cache and uses trusted CDP touch input.
async (page) => {
  const origin=page.url().split('/').slice(0,3).join('/');
  if (!/^http:\/\/localhost:800[01]$/.test(origin)) throw new Error('Open the local atlas on port 8000 or 8001 first.');
  await page.emulateMedia({reducedMotion:'no-preference'});
  await page.setViewportSize({width:390,height:844});
  const cdp = await page.context().newCDPSession(page);
  await cdp.send('Emulation.setDeviceMetricsOverride', {width:390,height:844,deviceScaleFactor:2,mobile:true});
  await cdp.send('Emulation.setTouchEmulationEnabled', {enabled:true,maxTouchPoints:5});
  await cdp.send('Emulation.setCPUThrottlingRate', {rate:4});
  await cdp.send('Network.setBypassServiceWorker', {bypass:true});
  await cdp.send('Network.setCacheDisabled', {cacheDisabled:true});
  await page.addInitScript(() => { localStorage.clear(); localStorage.setItem('mea:view',JSON.stringify({s:0.65,tx:-550,ty:-300})); });
  await page.evaluate(async()=>{for(const r of await navigator.serviceWorker.getRegistrations())await r.unregister();for(const k of await caches.keys())await caches.delete(k);});
  await page.goto('about:blank');
  await page.goto(origin + '/');
  await page.waitForTimeout(4500);
  const environment=await page.evaluate(()=>({width:innerWidth,height:innerHeight,dpr:devicePixelRatio,view:document.querySelector('#worldBase').style.transform,snapshotPixels:document.querySelector('#snap').width*document.querySelector('#snap').height}));
  await cdp.send('Performance.enable');
  const metrics = async () => Object.fromEntries((await cdp.send('Performance.getMetrics')).metrics.map(x=>[x.name,x.value]));
  const touch = (type, points) => cdp.send('Input.dispatchTouchEvent',{type,touchPoints:points.map(([x,y],id)=>({x,y,id,radiusX:5,radiusY:5,force:1}))});
  const swipe = async (from,to,steps=30) => {
    await touch('touchStart',from);
    for(let i=1;i<=steps;i++) { await touch('touchMove',from.map((p,j)=>p.map((v,k)=>v+(to[j][k]-v)*i/steps))); await page.waitForTimeout(16); }
    await touch('touchEnd',[]);
  };
  const measure = async (name, action) => {
    await page.evaluate(() => {
      const sample=window.bench={frames:[],last:performance.now(),running:true,events:0,trusted:0};
      sample.listener=e=>{sample.events++;if(e.isTrusted)sample.trusted++;};
      document.addEventListener('pointermove',sample.listener);
      const tick=t=>{if(!sample.running)return;sample.frames.push(t-sample.last);sample.last=t;requestAnimationFrame(tick);};requestAnimationFrame(tick);
    });
    const before=await metrics(); await action(); await page.waitForTimeout(600); const after=await metrics();
    const frames=await page.evaluate(()=>{bench.running=false;document.removeEventListener('pointermove',bench.listener);const f=bench.frames.slice(1).sort((a,b)=>a-b);return {frames:f.length,p95:f[Math.floor(f.length*.95)],max:f.at(-1),over33:f.filter(x=>x>33.4).length,events:bench.events,trusted:bench.trusted,sheet:document.querySelector('#sheet').className,scroll:document.querySelector('#sheetbody').scrollTop,map:document.querySelector('#map').className};});
    return {name,...frames,...Object.fromEntries(['LayoutCount','RecalcStyleCount','LayoutDuration','RecalcStyleDuration','ScriptDuration','TaskDuration'].map(k=>[k,(after[k]-before[k])*(k.endsWith('Duration')?1000:1)]))};
  };
  const results=[];
  results.push(await measure('sheet-open',()=>swipe([[195,706]],[[195,78]])));
  results.push(await measure('sheet-scroll',()=>swipe([[195,690]],[[195,210]])));
  const grab=await page.locator('#grab').boundingBox();
  results.push(await measure('sheet-close',()=>swipe([[195,grab.y+13]],[[195,720]])));
  results.push(await measure('pan',()=>swipe([[140,340]],[[290,460]])));
  results.push(await measure('pinch',()=>swipe([[140,300],[250,410]],[[65,230],[325,480]])));
  results.push(await measure('pinch-interrupt',async()=>{
    await touch('touchStart',[[110,300],[270,400]]);await touch('touchMove',[[90,280],[290,420]]);
    await touch('touchEnd',[[90,280]]);await touch('touchMove',[[120,320]]);await touch('touchCancel',[]);
  }));
  await page.screenshot({path:'output/playwright/touch-benchmark.png'});
  await cdp.detach();
  return {environment,resources:await page.evaluate(()=>({mapLayer:getComputedStyle(document.querySelector('#map')).willChange,panelContain:getComputedStyle(document.querySelector('#sheet .panel')).contain})),results};
}
