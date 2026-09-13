'use strict';

const CACHE_PREFIX='middle-earth-atlas-';
const CACHE=CACHE_PREFIX+'2026-09-mobile-sheet';
const CORE=[
  "/",
  "/offline.html",
  "/site.webmanifest",
  "/favicon.ico",
  "/src/data.js?v=atlas-3",
  "/src/chapters.js",
  "/src/reading.js",
  "/src/publication.js",
  "/src/url-state.js",
  "/src/images.js",
  "/src/app.js?v=atlas-3",
  "/src/details.mjs",
  "/src/styles.css",
  "/src/map.css",
  "/src/content.css",
  "/src/offline.js",
  "/assets/texture.png",
  "/assets/favicon.svg",
  "/assets/favicon-32x32.png",
  "/assets/apple-touch-icon.png",
  "/assets/icon-192x192.png",
  "/assets/icon-512x512.png"
];

self.addEventListener('install',event=>{
  event.waitUntil(caches.open(CACHE).then(cache=>cache.addAll(CORE)));
});

self.addEventListener('activate',event=>{
  event.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(key=>key.startsWith(CACHE_PREFIX)&&key!==CACHE).map(key=>caches.delete(key)))).then(()=>self.clients.claim()));
});

self.addEventListener('message',event=>{
  if(event.data?.type==='SKIP_WAITING') self.skipWaiting();
});

async function navigation(request,url){
  const cache=await caches.open(CACHE);
  try{
    const response=await fetch(request);
    if(response.ok) await cache.put(request,response.clone());
    return response;
  }catch(error){
    const exact=await cache.match(request,{ignoreSearch:false});
    if(exact) return exact;
    if(url.pathname==='/') return cache.match('/');
    return cache.match('/offline.html');
  }
}

async function cachedAsset(request){
  const cache=await caches.open(CACHE);
  const cached=await cache.match(request,{ignoreSearch:false});
  if(cached) return cached;
  const response=await fetch(request);
  if(response.ok) await cache.put(request,response.clone());
  return response;
}

self.addEventListener('fetch',event=>{
  const request=event.request;
  const url=new URL(request.url);
  if(request.method !== 'GET' || url.origin !== self.location.origin) return;
  if(request.mode==='navigate') event.respondWith(navigation(request,url));
  else event.respondWith(cachedAsset(request));
});
