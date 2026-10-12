import fs from 'node:fs';
import vm from 'node:vm';
import assert from 'node:assert/strict';
const code=fs.readFileSync(new URL('../dist/audio-warp.js',import.meta.url),'utf8');
let sources=0,starts=0;
const nodes=[];
const param=value=>({value,rampTo(v){this.value=v}});
class Node {
 constructor(options){this.options=options;this.gain=param(typeof options==='number'?options:0);this.wet=param(options?.wet||0);this.frequency=param(20000);this.pitch=options?.pitch||0;nodes.push(this);}
 connect(){return this}chain(){return this}toDestination(){return this}getValue(){return .2}
}
const Tone={Gain:Node,PitchShift:Node,Filter:Node,Distortion:Node,FeedbackDelay:Node,Limiter:Node,Meter:Node,start:async()=>{starts++},connect(){},getContext:()=>({rawContext:{createMediaElementSource(){sources++;return {}}}})};
const events={};const audio={dataset:{},addEventListener(k,fn){events[k]=fn}};
const ctx=vm.createContext({Tone,audio});vm.runInContext(code,ctx);
assert.equal(sources,0);assert.equal(starts,0);
await vm.runInContext("PortoWarp.prepare(audio,PortoWarp.presets.night)",ctx);
assert.equal(sources,1);assert.equal(audio.playbackRate,.95);assert.equal(audio.preservesPitch,true);
assert.equal(audio.dataset.warp,'live');
assert.equal(JSON.parse(audio.dataset.warpSettings).pitch,-2);
events.playing();assert.equal(nodes[0].gain.value,1);
events.pause();assert.equal(nodes[0].gain.value,0);
vm.runInContext('PortoWarp.bypass(true)',ctx);
assert.equal(audio.playbackRate,1);assert.equal(audio.dataset.warp,'bypass');
vm.runInContext('PortoWarp.bypass(false)',ctx);assert.equal(audio.playbackRate,.95);
await vm.runInContext('PortoWarp.prepare(audio,null)',ctx);
assert.equal(sources,1);assert.equal(audio.playbackRate,1);assert.equal(audio.dataset.warp,'bypass');
events.timeupdate();assert.equal(audio.dataset.outputLevel,'0.2');
console.log('PASS: lazy graph creation, one media source, live settings, pitch-preserving speed, pause gate, dry comparison and clean catalogue bypass. Tone nodes mocked; browser signal output checked separately.');
