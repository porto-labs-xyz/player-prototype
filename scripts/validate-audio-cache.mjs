import fs from 'node:fs';
import vm from 'node:vm';
import assert from 'node:assert/strict';
const events={},cache=new Map(),network=[];
const cacheAPI={async match(key){return cache.get(String(key))?.clone()},async put(key,response){cache.set(String(key),response)}};
const context=vm.createContext({URL,Headers,Response,Promise,console,caches:{open:async()=>cacheAPI},fetch:async request=>{const key=typeof request==='string'?request:request.url;network.push(key);return new Response(Uint8Array.from([10,20,30,40,50]),{headers:{'Content-Type':'audio/mpeg'}})},self:{location:{origin:'https://porto.test'},addEventListener:(name,fn)=>events[name]=fn,skipWaiting(){},clients:{claim(){}}}});
vm.runInContext(fs.readFileSync('dist/audio-cache-sw.js','utf8'),context);
const progress=[];let completed;
events.message({data:{type:'CACHE_AUDIO',urls:['https://porto.test/assets/a.mp3','https://porto.test/assets/b.mp3','https://porto.test/assets/a.mp3','https://elsewhere.test/assets/c.mp3']},source:{postMessage:p=>progress.push(p)},waitUntil:p=>completed=p});await completed;
assert.equal(network.length,2);assert.equal(progress.at(-1).ready,2);assert.equal(progress.at(-1).failed,0);
async function read(range){let result;events.fetch({request:{url:'https://porto.test/assets/a.mp3',method:'GET',headers:new Headers(range?{Range:range}:{})},respondWith:p=>result=p,waitUntil(){}});return result}
let r=await read('bytes=1-3');assert.equal(r.status,206);assert.equal(r.headers.get('Content-Range'),'bytes 1-3/5');assert.deepEqual([...new Uint8Array(await r.arrayBuffer())],[20,30,40]);
r=await read('bytes=-2');assert.deepEqual([...new Uint8Array(await r.arrayBuffer())],[40,50]);
r=await read('bytes=3-');assert.deepEqual([...new Uint8Array(await r.arrayBuffer())],[40,50]);
r=await read('bytes=9-');assert.equal(r.status,416);
r=await read();assert.equal(r.status,200);assert.equal(network.length,2,'cached playback does not refetch');
console.log('PASS: full catalogue warming, deduplication, same-origin scope, cache hits and Safari byte-range seeking.');
