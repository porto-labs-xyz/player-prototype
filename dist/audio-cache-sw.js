/* Cache complete media files, including byte-range playback on Safari. */
const CACHE='porto-catalogue-audio-v1';
self.addEventListener('install',()=>self.skipWaiting());
self.addEventListener('activate',event=>event.waitUntil(self.clients.claim()));
function rangeResponse(response,range){
 return response.arrayBuffer().then(bytes=>{
  const match=/^bytes=(\d*)-(\d*)$/.exec(range),size=bytes.byteLength;
  if(!match||(!match[1]&&!match[2]))return new Response(null,{status:416,headers:{'Content-Range':`bytes */${size}`}});
  let start=match[1]?Number(match[1]):Math.max(0,size-Number(match[2]));
  let end=match[1]?(match[2]?Math.min(Number(match[2]),size-1):size-1):size-1;
  if(start>end||start>=size)return new Response(null,{status:416,headers:{'Content-Range':`bytes */${size}`}});
  const headers=new Headers(response.headers);headers.delete('Content-Encoding');headers.delete('Transfer-Encoding');headers.set('Content-Range',`bytes ${start}-${end}/${size}`);headers.set('Content-Length',String(end-start+1));headers.set('Accept-Ranges','bytes');
  return new Response(bytes.slice(start,end+1),{status:206,headers});
 });
}
self.addEventListener('fetch',event=>{
 const url=new URL(event.request.url);
 if(event.request.method!=='GET'||url.origin!==self.location.origin||!url.pathname.startsWith('/assets/')||! /\.(mp3|wav)$/.test(url.pathname))return;
 event.respondWith((async()=>{
  const cache=await caches.open(CACHE),hit=await cache.match(url.href);
  if(hit)return event.request.headers.has('Range')?rangeResponse(hit,event.request.headers.get('Range')):hit;
  const response=await fetch(event.request);
  if(response.status===200)event.waitUntil(cache.put(url.href,response.clone()).catch(()=>{}));
  return response;
 })());
});
let warming;
self.addEventListener('message',event=>{
 if(event.data?.type!=='CACHE_AUDIO'||!Array.isArray(event.data.urls))return;
 const urls=[...new Set(event.data.urls)].filter(value=>{try{const u=new URL(value,self.location.origin);return u.origin===self.location.origin&&u.pathname.startsWith('/assets/')&&/\.(mp3|wav)$/.test(u.pathname)}catch{return false}});
 if(warming)return;
 warming=(async()=>{
  const cache=await caches.open(CACHE);let next=0,ready=0,failed=0;
  const report=()=>event.source?.postMessage({type:'AUDIO_CACHE_PROGRESS',ready,total:urls.length,failed});
  async function worker(){while(next<urls.length){const url=urls[next++];try{if(!await cache.match(url)){const response=await fetch(url);if(!response.ok)throw Error('Audio unavailable');await cache.put(url,response)}ready++;}catch{failed++;}report();}}
  await Promise.all([worker(),worker()]);
 })().finally(()=>{warming=null});
 event.waitUntil(warming);
});
