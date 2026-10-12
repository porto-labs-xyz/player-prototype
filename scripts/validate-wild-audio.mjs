import fs from 'node:fs';
import vm from 'node:vm';
import assert from 'node:assert/strict';
const code=fs.readFileSync(new URL('../dist/audio-warp.js',import.meta.url),'utf8');
let release,hold=true,decodeCount=0,renderCount=0,contextDisposals=0;
const nodes=[],created=[],revoked=[];
class Node {
 constructor(options){this.options=options;nodes.push(this)}
 chain(){}toDestination(){return this}start(){return this}stop(){return this}dispose(){this.disposed=true}
}
function buffer(){
 let samples=Float32Array.from([-.5,0,.5]);
 const raw={length:3,duration:3/44100,numberOfChannels:1,sampleRate:44100,getChannelData:()=>samples,copyToChannel:value=>{samples=value}};
 return {set reverse(value){if(value)samples.reverse()},get:()=>raw,dispose(){this.disposed=true}};
}
const audio={src:'original.mp3',currentTime:42,dataset:{originalSource:'original.mp3'},load(){this.currentTime=0}};
const Tone={
 start(){throw Error('Playback must not use a live context')},
 Player:Node,PitchShift:Node,Filter:Node,Distortion:Node,FeedbackDelay:Node,Tremolo:Node,Limiter:Node,
 ToneAudioBuffer:{fromUrl(){decodeCount++;if(hold){hold=false;return new Promise(resolve=>{release=()=>resolve(buffer())})}return Promise.resolve(buffer())}},
 async Offline(callback){renderCount++;const first=nodes.length;callback({dispose(){contextDisposals++}});return {get:()=>nodes[first].options.url,dispose(){}}}
};
const context=vm.createContext({console,Blob,URL:{createObjectURL(blob){created.push(blob);return 'blob:render-'+created.length},revokeObjectURL(url){revoked.push(url)}},Tone,audio});
vm.runInContext(code,context);let current=true;context.isCurrent=()=>current;
await vm.runInContext('PortoWarp.prepare(audio,null,isCurrent)',context);
assert.equal(decodeCount,0);assert.equal(audio.dataset.warp,'native');
const pending=vm.runInContext('PortoWarp.prepare(audio,{reverse:1},isCurrent)',context);
await new Promise(setImmediate);current=false;release();await pending;
assert.equal(audio.src,'original.mp3');assert.equal(audio.currentTime,42);assert.equal(renderCount,0);
current=true;
await vm.runInContext('PortoWarp.prepare(audio,{reverse:1},isCurrent)',context);
assert.equal(audio.src,'blob:render-1');assert.equal(audio.currentTime,42);assert.equal(audio.dataset.audioPlayback,'native');
const pcm=new DataView(await created[0].arrayBuffer());assert.equal(pcm.getInt16(44,true),16383);assert.equal(pcm.getInt16(48,true),-16384);
await vm.runInContext('PortoWarp.prepare(audio,null,isCurrent)',context);assert.equal(audio.src,'original.mp3');
const renders=renderCount;
await vm.runInContext('PortoWarp.prepare(audio,{reverse:1},isCurrent)',context);assert.equal(renderCount,renders);
await vm.runInContext('PortoWarp.prepare(audio,{pitch:2,tone:6500,echo:.3,speed:.8},isCurrent)',context);
assert.equal(audio.playbackRate,.8);assert.equal(audio.dataset.audioProcessors,'');assert.equal(audio.dataset.warp,'rendered');
assert(nodes.some(n=>n.options?.pitch===2));assert(nodes.every(n=>n.disposed));assert.equal(contextDisposals,renderCount);
const crushed=vm.runInContext('PortoWarp.crushSamples(Float32Array.from([.12,-.2,.4]),1)',context);
assert.deepEqual(Array.from(crushed),[.125,-.25,.375]);
await vm.runInContext('PortoWarp.prepare(audio,{crush:.8},isCurrent)',context);
assert.equal(revoked.length,1);assert(!revoked.includes(audio.src));
// Concurrent requests render serially; cancelled queued work cannot replace the winner.
let finish;const offline=Tone.Offline;Tone.Offline=async callback=>{await new Promise(resolve=>finish=resolve);return offline(callback)};
let firstCurrent=true;context.firstCurrent=()=>firstCurrent;
const first=vm.runInContext('PortoWarp.prepare(audio,{pitch:4},firstCurrent)',context);await new Promise(setImmediate);
firstCurrent=false;
const second=vm.runInContext('PortoWarp.prepare(audio,{pitch:5},isCurrent)',context);
finish();await first;await new Promise(setImmediate);finish();await second;
assert.equal(JSON.parse(audio.dataset.warpSettings).pitch,5);assert(nodes.every(n=>n.disposed));
console.log('PASS: native originals, offline effects, reversed PCM, cancelled/serialized rendering, position preservation, cache bounds, quantization and node/context cleanup.');
